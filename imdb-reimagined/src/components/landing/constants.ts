/* =========================================================
   Landing page — demo data & constants
   All strings in one place for easy editing.
   ========================================================= */

export interface DemoChip {
  label: string;
  kind: "type" | "country" | "year" | "note" | "count";
  /** Character index in the sentence when this chip should appear */
  atChar: number;
}

export interface DemoScenario {
  text: string;
  chips: DemoChip[];
  /** Confidence milestones: [charIndex, percent, label] */
  milestones: [number, number, string][];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    text: "A short documentary from India released in 2023, screened at international film festivals",
    chips: [
      { label: "Documentary", kind: "type", atChar: 22 },
      { label: "India", kind: "country", atChar: 33 },
      { label: "2023", kind: "year", atChar: 47 },
      { label: "Evidence needed", kind: "note", atChar: 75 },
    ],
    milestones: [
      [22, 20, "Title detected"],
      [33, 40, "Type inferred"],
      [47, 60, "Year validated"],
      [75, 78, "Almost ready"],
    ],
  },
  {
    text: "A web series with 8 episodes announced for 2026, streaming on major platforms worldwide",
    chips: [
      { label: "Web Series", kind: "type", atChar: 14 },
      { label: "8 Episodes", kind: "count", atChar: 29 },
      { label: "2026", kind: "year", atChar: 47 },
      { label: "Add release date", kind: "note", atChar: 72 },
    ],
    milestones: [
      [14, 20, "Title detected"],
      [29, 45, "Type inferred"],
      [47, 65, "Year validated"],
      [72, 78, "Almost ready"],
    ],
  },
  {
    text: "An independent feature film shot in Brazil, premiering at Cannes Film Festival in 2025",
    chips: [
      { label: "Feature Film", kind: "type", atChar: 27 },
      { label: "Brazil", kind: "country", atChar: 40 },
      { label: "2025", kind: "year", atChar: 82 },
      { label: "Director needed", kind: "note", atChar: 60 },
    ],
    milestones: [
      [27, 25, "Title detected"],
      [40, 45, "Type inferred"],
      [60, 60, "Country found"],
      [82, 78, "Almost ready"],
    ],
  },
];

export const CONFIDENCE_FINAL_NOTE = "Add one external link to reach acceptance.";

export const ROTATING_LINES = [
  "Thinking like an IMDb editor.",
  "Confidence before submission.",
  "Designed to prevent rejection.",
  "Guidance in real time.",
];

export const REJECTION_REASONS = [
  { icon: "link", text: "No evidence link provided" },
  { icon: "users", text: "Incomplete credits section" },
  { icon: "alert", text: "Type and year mismatch" },
];

export const REJECTION_CTA = "We guide you in real time to avoid this.";

export const STEP_LABELS = ["Core", "Mandatory", "Identity", "Production", "Credits"];

/** Typing speed in ms per character */
export const TYPING_SPEED = 38;
/** Pause at end of sentence before next scenario */
export const PAUSE_BETWEEN = 2500;

/* ---- User-input keyword rules ---- */

const TYPE_KEYWORDS: Record<string, string> = {
  documentary: "Documentary",
  "web series": "Web Series",
  series: "Series",
  "feature film": "Feature Film",
  film: "Film",
  short: "Short Film",
  "music video": "Music Video",
  "video game": "Video Game",
  podcast: "Podcast Series",
  animation: "Animation",
};

const COUNTRY_KEYWORDS: string[] = [
  "India", "Brazil", "France", "Germany", "Japan", "Korea",
  "China", "Mexico", "Nigeria", "Australia", "Canada", "Spain",
  "Italy", "United Kingdom", "United States", "UK", "US", "USA",
  "Argentina", "Sweden", "Norway", "Denmark", "Thailand",
  "Iran", "Turkey", "Egypt", "Poland", "Netherlands",
];

const CASUAL_WORDS = ["awesome", "bro", "super", "cool", "amazing", "dude", "lol", "omg", "lit", "fire"];

export interface ParsedChip {
  label: string;
  kind: "type" | "country" | "year" | "note";
}

export function parseUserInput(text: string): { chips: ParsedChip[]; casual: boolean } {
  const lower = text.toLowerCase();
  const chips: ParsedChip[] = [];

  // Type
  for (const [keyword, label] of Object.entries(TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      chips.push({ label, kind: "type" });
      break;
    }
  }

  // Country
  for (const country of COUNTRY_KEYWORDS) {
    if (lower.includes(country.toLowerCase())) {
      chips.push({ label: country, kind: "country" });
      break;
    }
  }

  // Year (4 digits between 1900-2099)
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    chips.push({ label: yearMatch[0], kind: "year" });
  }

  // Casual detection
  const casual = CASUAL_WORDS.some((w) => lower.includes(w));

  return { chips, casual };
}
