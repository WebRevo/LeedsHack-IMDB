import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* =========================================================
   POST /api/help
   Answers user questions about the IMDb submission form.
   1. Search Supabase help_qa table (primary)
   2. OpenRouter fallback (if configured and no match)
   3. Hardcoded fallback (always works)
   ========================================================= */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-flash-1.5";

const FALLBACK_ANSWER =
  "I don't have a specific answer for that question, but the IMDb Help Center (help.imdb.com) has detailed guides for every part of the submission process. You can also check the info buttons next to each field for quick tips.";

const HELP_SYSTEM_PROMPT = `You are a helpful assistant for an IMDb-style title submission form. Answer questions about filling out the form, evidence requirements, release dates, credits, and submission process. Keep answers practical, concise (2-4 sentences), and focused on helping the user complete their submission. Do not make up IMDb policies — if unsure, recommend checking the IMDb Help Center.`;

export async function POST(req: NextRequest) {
  let body: { question?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const question =
    typeof body.question === "string" ? body.question.trim() : "";
  if (question.length < 3 || question.length > 500) {
    return NextResponse.json(
      { error: "Question must be 3-500 characters" },
      { status: 400 },
    );
  }

  // 1. Supabase search
  try {
    const supabase = createClient();
    const words = question
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);

    if (words.length > 0) {
      const orFilter = words
        .flatMap((w) => [
          `question.ilike.%${w}%`,
          `keywords.ilike.%${w}%`,
        ])
        .join(",");

      const { data } = await supabase
        .from("help_qa")
        .select("question, answer")
        .or(orFilter)
        .limit(1);

      if (data && data.length > 0) {
        return NextResponse.json({
          answer: data[0].answer,
          source: "knowledge_base" as const,
        });
      }
    }
  } catch (err) {
    console.error("Supabase help search error:", err);
    // Fall through to OpenRouter / fallback
  }

  // 2. OpenRouter fallback
  if (OPENROUTER_KEY) {
    try {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": appUrl,
          "X-Title": "IMDb New Title Reimagined — Help",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: HELP_SYSTEM_PROMPT },
            { role: "user", content: question },
          ],
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text: string = data?.choices?.[0]?.message?.content ?? "";
        if (text.trim()) {
          return NextResponse.json({
            answer: text.trim(),
            source: "ai" as const,
          });
        }
      }
    } catch (err) {
      console.error("OpenRouter help error:", err);
    }
  }

  // 3. Hardcoded fallback
  return NextResponse.json({
    answer: FALLBACK_ANSWER,
    source: "fallback" as const,
  });
}
