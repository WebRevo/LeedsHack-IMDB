import { NextRequest, NextResponse } from "next/server";

/* =========================================================
   POST /api/parse
   Sends a voice transcript to OpenRouter and returns
   structured form data matching the wizard schema.
   ========================================================= */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-flash-1.5";

/* The allowed enum values — the model must pick from these exactly */
const SYSTEM_PROMPT = `You are a structured data extractor for an IMDb-style title submission form.

Given a user's spoken description of a film/show, extract as many of the following fields as you can. Return ONLY valid JSON, no markdown fences, no explanation.

Schema:
{
  "core": {
    "title": string,              // exact title mentioned
    "type": "film" | "madeForTv" | "madeForVideo" | "musicVideo" | "podcastSeries" | "videoGame",
    "subtype": "featureLength" | "shortSubject",
    "status": "released" | "limitedScreenings" | "completedNotShown" | "notComplete",
    "year": number | null,        // 4-digit release year
    "contributorRole": "producerDirectorWriter" | "castCrew" | "publicist" | "noneOfAbove"
  },
  "identity": {
    "countriesOfOrigin": string[],
    "languages": string[],
    "genres": string[]
  },
  "mandatory": {
    "releaseDates": [
      {
        "country": string,
        "day": string,            // "DD" or ""
        "month": string,          // "01"-"12" or ""
        "year": string,           // "YYYY"
        "releaseType": "theatrical" | "digital" | "physical" | "tv" | "festival",
        "note": string
      }
    ]
  },
  "production": {
    "budget": {
      "currency": string,         // ISO 4217 code: "USD", "EUR", "GBP", "JPY", "KRW", "INR", "CAD", "AUD", "CNY", "BRL"
      "amount": number | null     // positive integer, no decimals
    },
    "directors": [
      { "name": string, "role": string, "attribute": string }
    ]
  },
  "assumptions": string[]         // list of inferences you made
}

Rules:
- Return JSON ONLY. No markdown code fences. No prose before or after.
- Only include fields you can confidently extract. Omit unknown fields entirely.
- Do NOT guess or hallucinate data. If the user didn't mention a year, omit "year".
- "type" defaults to "film" if user says "movie" or "film" without qualification.
- "status" should be "released" if user says the title is out/released, "notComplete" if in production, etc.
- "contributorRole": if the user says "I directed" or "I'm the director/producer/writer", use "producerDirectorWriter". If they say "I acted in" or "I was crew", use "castCrew". If they say "I'm a publicist/rep", use "publicist". Otherwise omit.
- "budget.currency": use ISO 4217 codes. If user says "dollars" without qualifier, assume "USD". If user says "pounds", use "GBP". If "euros", use "EUR".
- "budget.amount": must be a positive integer. Convert shorthand like "45 million" to 45000000.
- The "assumptions" array must list every inference, e.g. "Assumed type is 'film' because user said 'movie'".
- Country names should be full English names (e.g. "United States", not "US").
- Genre names should match standard IMDb genres: Action, Adventure, Animation, Biography, Comedy, Crime, Documentary, Drama, Family, Fantasy, Film-Noir, History, Horror, Music, Musical, Mystery, News, Reality-TV, Romance, Sci-Fi, Short, Sport, Talk-Show, Thriller, War, Western.
- Month values must be two-digit strings: "01" through "12".`;

/* ---------- valid enum sets for validation ---------- */

const VALID_TYPES = new Set([
  "film",
  "madeForTv",
  "madeForVideo",
  "musicVideo",
  "podcastSeries",
  "videoGame",
]);
const VALID_SUBTYPES = new Set(["featureLength", "shortSubject"]);
const VALID_STATUSES = new Set([
  "released",
  "limitedScreenings",
  "completedNotShown",
  "notComplete",
]);
const VALID_RELEASE_TYPES = new Set([
  "theatrical",
  "digital",
  "physical",
  "tv",
  "festival",
]);
const VALID_CONTRIBUTOR_ROLES = new Set([
  "producerDirectorWriter",
  "castCrew",
  "publicist",
  "noneOfAbove",
]);
const VALID_CURRENCIES = new Set([
  "USD", "EUR", "GBP", "JPY", "KRW", "INR", "CAD", "AUD", "CNY", "BRL",
]);

/* ---------- runtime validation ---------- */

interface ParsedResponse {
  core?: {
    title?: string;
    type?: string;
    subtype?: string;
    status?: string;
    year?: number | null;
    contributorRole?: string;
  };
  identity?: {
    countriesOfOrigin?: string[];
    languages?: string[];
    genres?: string[];
  };
  mandatory?: {
    releaseDates?: {
      country?: string;
      day?: string;
      month?: string;
      year?: string;
      releaseType?: string;
      note?: string;
    }[];
  };
  production?: {
    budget?: {
      currency?: string;
      amount?: number | null;
    };
    directors?: {
      name?: string;
      role?: string;
      attribute?: string;
    }[];
  };
  assumptions?: string[];
}

function sanitize(raw: ParsedResponse) {
  const result: Record<string, unknown> = {};
  const assumptions: string[] = Array.isArray(raw.assumptions)
    ? raw.assumptions.filter((a): a is string => typeof a === "string")
    : [];

  // Core
  if (raw.core && typeof raw.core === "object") {
    const core: Record<string, unknown> = {};
    if (typeof raw.core.title === "string" && raw.core.title.trim())
      core.title = raw.core.title.trim();
    if (typeof raw.core.type === "string" && VALID_TYPES.has(raw.core.type))
      core.type = raw.core.type;
    if (
      typeof raw.core.subtype === "string" &&
      VALID_SUBTYPES.has(raw.core.subtype)
    )
      core.subtype = raw.core.subtype;
    if (
      typeof raw.core.status === "string" &&
      VALID_STATUSES.has(raw.core.status)
    )
      core.status = raw.core.status;
    if (
      typeof raw.core.year === "number" &&
      raw.core.year >= 1800 &&
      raw.core.year <= 2100
    )
      core.year = raw.core.year;
    if (
      typeof raw.core.contributorRole === "string" &&
      VALID_CONTRIBUTOR_ROLES.has(raw.core.contributorRole)
    )
      core.contributorRole = raw.core.contributorRole;
    if (Object.keys(core).length > 0) result.core = core;
  }

  // Identity
  if (raw.identity && typeof raw.identity === "object") {
    const identity: Record<string, unknown> = {};
    if (Array.isArray(raw.identity.countriesOfOrigin))
      identity.countriesOfOrigin = raw.identity.countriesOfOrigin.filter(
        (c): c is string => typeof c === "string" && c.trim().length > 0,
      );
    if (Array.isArray(raw.identity.languages))
      identity.languages = raw.identity.languages.filter(
        (l): l is string => typeof l === "string" && l.trim().length > 0,
      );
    if (Array.isArray(raw.identity.genres))
      identity.genres = raw.identity.genres.filter(
        (g): g is string => typeof g === "string" && g.trim().length > 0,
      );
    if (Object.keys(identity).length > 0) result.identity = identity;
  }

  // Mandatory — release dates
  if (raw.mandatory && typeof raw.mandatory === "object") {
    if (Array.isArray(raw.mandatory.releaseDates)) {
      const rds = raw.mandatory.releaseDates
        .filter((rd) => rd && typeof rd === "object")
        .map((rd) => ({
          country: typeof rd.country === "string" ? rd.country : "",
          day: typeof rd.day === "string" ? rd.day : "",
          month: typeof rd.month === "string" ? rd.month : "",
          year: typeof rd.year === "string" ? rd.year : "",
          releaseType:
            typeof rd.releaseType === "string" &&
            VALID_RELEASE_TYPES.has(rd.releaseType)
              ? rd.releaseType
              : "",
          note: typeof rd.note === "string" ? rd.note : "",
        }));
      if (rds.length > 0) result.mandatory = { releaseDates: rds };
    }
  }

  // Production — budget + directors
  if (raw.production && typeof raw.production === "object") {
    const prod: Record<string, unknown> = {};

    // Budget
    if (raw.production.budget && typeof raw.production.budget === "object") {
      const b = raw.production.budget;
      const budgetOut: Record<string, unknown> = {};
      if (typeof b.currency === "string" && VALID_CURRENCIES.has(b.currency))
        budgetOut.currency = b.currency;
      if (typeof b.amount === "number" && b.amount > 0 && Number.isInteger(b.amount))
        budgetOut.amount = b.amount;
      if (Object.keys(budgetOut).length > 0) prod.budget = budgetOut;
    }

    if (Array.isArray(raw.production.directors)) {
      const dirs = raw.production.directors
        .filter(
          (d) =>
            d &&
            typeof d === "object" &&
            typeof d.name === "string" &&
            d.name.trim().length > 0,
        )
        .map((d) => ({
          name: d.name!.trim(),
          role: typeof d.role === "string" ? d.role : "Director",
          attribute: typeof d.attribute === "string" ? d.attribute : "",
        }));
      if (dirs.length > 0) prod.directors = dirs;
    }

    if (Object.keys(prod).length > 0) result.production = prod;
  }

  return { parsed: result, assumptions };
}

/* ---------- robust JSON extraction ---------- */

function extractJSON(text: string): ParsedResponse {
  // 1. Strip markdown code fences
  const cleaned = text
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .trim();

  // 2. Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // continue to fallback extraction
  }

  // 3. Find the first { ... } block using brace matching
  const start = cleaned.indexOf("{");
  if (start !== -1) {
    let depth = 0;
    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === "{") depth++;
      else if (cleaned[i] === "}") depth--;
      if (depth === 0) {
        try {
          return JSON.parse(cleaned.slice(start, i + 1));
        } catch {
          break;
        }
      }
    }
  }

  throw new Error("No valid JSON found in response");
}

/* ---------- route handler ---------- */

export async function POST(req: NextRequest) {
  if (!OPENROUTER_KEY) {
    return NextResponse.json(
      {
        parsed: {},
        assumptions: [
          "AI service not configured — please fill in the form manually.",
        ],
      },
      { status: 200 },
    );
  }

  let body: { transcript?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const transcript =
    typeof body.transcript === "string" ? body.transcript.trim() : "";
  if (!transcript || transcript.length < 5) {
    return NextResponse.json(
      { error: "Transcript too short" },
      { status: 400 },
    );
  }
  if (transcript.length > 5000) {
    return NextResponse.json(
      { error: "Transcript too long (max 5000 chars)" },
      { status: 400 },
    );
  }

  try {
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    const openRouterRes = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": appUrl,
        "X-Title": "IMDb New Title Reimagined",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `User transcript:\n"${transcript}"\n\nExtract structured data and return JSON only.`,
          },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    });

    // Graceful degradation for rate-limit / billing / auth errors
    if (!openRouterRes.ok) {
      const status = openRouterRes.status;
      if (status === 429 || status === 402 || status === 401 || status === 403) {
        return NextResponse.json({
          parsed: {},
          assumptions: [
            "AI service temporarily unavailable — please fill in the form manually.",
          ],
        });
      }
      const errText = await openRouterRes.text();
      console.error("OpenRouter API error:", status, errText);
      return NextResponse.json(
        {
          parsed: {},
          assumptions: [
            "AI parsing failed — please fill in the form manually.",
          ],
        },
        { status: 200 },
      );
    }

    const data = await openRouterRes.json();
    const rawText: string =
      data?.choices?.[0]?.message?.content ?? "";

    if (!rawText) {
      return NextResponse.json({
        parsed: {},
        assumptions: [
          "AI returned an empty response — please fill in the form manually.",
        ],
      });
    }

    let parsed: ParsedResponse;
    try {
      parsed = extractJSON(rawText);
    } catch {
      console.error(
        "Failed to extract JSON from OpenRouter response:",
        rawText.slice(0, 500),
      );
      return NextResponse.json({
        parsed: {},
        assumptions: [
          "AI returned an unreadable response — please fill in the form manually.",
        ],
      });
    }

    const result = sanitize(parsed);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Parse route error:", err);
    return NextResponse.json(
      {
        parsed: {},
        assumptions: [
          "Something went wrong — please fill in the form manually.",
        ],
      },
      { status: 200 },
    );
  }
}
