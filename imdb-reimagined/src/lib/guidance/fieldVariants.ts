/* =========================================================
   Field Variant Text Pools — 3-5 variants per rule key
   ========================================================= */

const VARIANT_POOLS: Record<string, string[]> = {
  /* ---- Step 0: Core ---- */
  title_empty: [
    "Enter the official title exactly as it should appear on IMDb.",
    "A title is required — type it as it appears in promotional materials.",
    "Start with the title. This is the most important field.",
    "Type the title of the film, show, or project you want to add.",
  ],
  title_lowercase: [
    "Titles usually start with an uppercase letter — is this intentional?",
    "Check capitalization: most titles begin with a capital letter.",
    "The title starts lowercase. IMDb titles typically use title case.",
  ],
  title_not_verified: [
    "Click Verify to confirm the title doesn't already exist on IMDb.",
    "Verify the title before proceeding — this helps avoid duplicates.",
    "Hit the Verify button to check for existing entries with this name.",
  ],
  type_empty: [
    "Select the title type — this determines how it's categorized on IMDb.",
    "Choose a type: Film, TV, Music Video, or another category.",
    "What kind of title is this? Pick the closest match.",
  ],
  status_empty: [
    "Set the release status — has this title been shown publicly?",
    "Select a status to indicate where this title is in its lifecycle.",
    "Is this title released, in production, or somewhere in between?",
  ],
  year_missing: [
    "Add the release year. Use ???? if the year is unknown.",
    "A release year helps audiences find this title. Enter 4 digits.",
    "When was (or will) this title be released? Enter the year.",
  ],
  year_future: [
    "This year is far in the future — double-check for accuracy.",
    "The year seems unusually far ahead. Is this correct?",
    "Titles more than 5 years out are uncommon — verify the date.",
  ],
  role_empty: [
    "Select your relationship to this title — are you a creator or contributor?",
    "Tell us your role: producer, cast, publicist, or none of the above.",
    "How are you connected to this title? This helps us route your submission.",
  ],

  /* ---- Step 1: Mandatory ---- */
  evidence_empty: [
    "Add at least one evidence link to support this submission.",
    "Evidence links help reviewers verify your title exists — add a URL.",
    "No evidence yet. Link to a press release, news article, or official site.",
    "Include a URL that proves this title is real. Official sources work best.",
  ],
  evidence_url_invalid: [
    "One or more URLs don't start with http:// or https://.",
    "Check your links — each URL needs a valid protocol (http/https).",
    "Invalid URL detected. Make sure links start with https://.",
  ],
  release_date_empty: [
    "Add at least one release date — this is required for all submissions.",
    "Every title needs a release date. Add the earliest known date.",
    "A release date is mandatory. Add the premiere or first screening date.",
  ],
  release_date_incomplete: [
    "Some date rows are missing country, month, or year — fill them in.",
    "Complete all fields for each release date entry.",
    "Each release date needs at least a country, month, and year.",
  ],

  /* ---- Step 2: Identity ---- */
  countries_empty: [
    "Add the country (or countries) where this title was produced.",
    "Where was this title made? Add at least one country of origin.",
    "Country of origin helps with regional categorization — add one.",
  ],
  languages_empty: [
    "What language(s) are spoken in this title? Add at least one.",
    "Add the primary language. You can include multiple if applicable.",
    "Language information helps IMDb users find titles — add one.",
  ],
  genres_empty: [
    "Select at least one genre — this helps audiences discover your title.",
    "Pick the genres that best describe this title (3–5 recommended).",
    "What genre does this title belong to? Choose from the list.",
  ],
  genres_many: [
    "More than 5 genres selected — IMDb recommends choosing 3 to 5.",
    "Consider narrowing your genres. Too many can dilute discoverability.",
    "Fewer genres help audiences find your title. Aim for 3–5.",
    "You have quite a few genres selected. Focus on the primary ones.",
  ],

  /* ---- Step 3: Production ---- */
  budget_missing: [
    "Enter a budget amount, or leave blank if confidential.",
    "Budget helps with industry context. Add the production cost.",
    "What was the production budget? Enter the amount in whole numbers.",
  ],
  budget_low: [
    "Budget under $1,000 is unusual for a listed title — verify the amount.",
    "This budget seems very low. Did you mean a larger number?",
    "A budget below $1,000 may flag the submission for review.",
  ],
  directors_empty: [
    "Add at least one director — this is a key credit for most titles.",
    "Who directed this title? Add their name and role.",
    "Director information is important. Add the primary director.",
    "Every title should credit a director. Add one to continue.",
  ],

  /* ---- Step 4: Credits ---- */
  credits_incomplete: [
    "Fill at least 3 major credit categories to meet the minimum requirement.",
    "IMDb requires credits in 3+ categories — add cast, writers, or producers.",
    "You need at least 3 credit categories filled. Choose the most relevant ones.",
    "Add more credits — submissions with fewer than 3 categories may be rejected.",
  ],
};

/* ---------- last-used index tracking (module-level) ---------- */

const lastUsed: Record<string, number> = {};

/* ---------- main export ---------- */

export function pickFieldVariant(
  key: string,
  excludeIdx?: number,
): { text: string; idx: number } {
  const pool = VARIANT_POOLS[key];
  if (!pool || pool.length === 0) {
    return { text: "", idx: -1 };
  }

  const exclude = excludeIdx ?? lastUsed[key] ?? -1;

  // Build candidates excluding the last-used index
  const candidates = pool
    .map((text, idx) => ({ text, idx }))
    .filter((c) => c.idx !== exclude || pool.length === 1);

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  lastUsed[key] = pick.idx;
  return pick;
}
