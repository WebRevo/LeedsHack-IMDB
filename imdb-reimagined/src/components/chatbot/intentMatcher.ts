/* =========================================================
   Intent Matcher — intent-first architecture

   Flow:
   1. Normalize input (lowercase, strip punctuation)
   2. Check for GREETING / THANKS first (exact phrase match only)
   3. For all other intents:
      a. Score trigger phrases (substring match → high score)
      b. Score keywords (exact word match → lower score)
      c. Combined score = trigger score + keyword score
   4. Pick the single highest-scoring intent above threshold
   5. Once matched, ignore all other intents entirely
   6. Pick a non-repeating variant from the matched intent

   Key differences from the old approach:
   - Triggers are weighted 3x heavier than keywords
   - GREETING only matches on exact greeting words, never on questions
   - No empathy/encouragement prepended — answers are clean and direct
   - Strict ~300 char limit enforced by the knowledge base itself
   ========================================================= */

import { INTENTS, FALLBACK_VARIANTS, type IntentEntry } from "./knowledgeBase";

/* ---------- normalization ---------- */

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(normalized: string): string[] {
  return normalized.split(" ").filter((w) => w.length > 0);
}

/* ---------- scoring ---------- */

function scoreIntent(normalized: string, inputWords: string[], entry: IntentEntry): number {
  let score = 0;

  // Phase 1: Trigger matching (high weight)
  // Check if any trigger phrase appears as a substring in the normalized input
  for (const trigger of entry.triggers) {
    if (normalized === trigger) {
      // Exact match to full trigger — very strong signal
      score += 10;
    } else if (normalized.includes(trigger)) {
      // Trigger found as substring — strong signal
      // Longer triggers are more specific, so they score higher
      score += 3 + trigger.split(" ").length;
    }
  }

  // Phase 2: Keyword matching (lower weight, additive)
  if (entry.keywords.length > 0) {
    let keywordHits = 0;
    for (const kw of entry.keywords) {
      if (inputWords.includes(kw)) {
        keywordHits++;
      }
    }
    // Keyword contribution: each hit adds 1 point
    score += keywordHits;
  }

  return score;
}

/* ---------- special intent detection ---------- */

const GREETING_WORDS = new Set(["hello", "hi", "hey", "howdy", "hiya", "yo"]);
const GREETING_PHRASES = new Set(["good morning", "good evening", "good afternoon", "hey there"]);

const THANKS_WORDS = new Set(["thanks", "thx", "cheers", "ty"]);
const THANKS_PHRASES = new Set([
  "thank you", "appreciate it", "got it", "perfect",
  "awesome", "great thanks", "thanks a lot", "many thanks",
]);

function isGreeting(normalized: string, inputWords: string[]): boolean {
  // Only match if the ENTIRE input is a greeting (not a question containing "hi")
  if (GREETING_PHRASES.has(normalized)) return true;
  // Single-word greetings
  if (inputWords.length <= 2 && inputWords.some((w) => GREETING_WORDS.has(w))) return true;
  return false;
}

function isThanks(normalized: string, inputWords: string[]): boolean {
  if (THANKS_PHRASES.has(normalized)) return true;
  if (inputWords.length <= 3 && inputWords.some((w) => THANKS_WORDS.has(w))) return true;
  return false;
}

/* ---------- variant tracking (no repeats) ---------- */

const lastVariant: Record<string, number> = {};

function pickVariant(entry: IntentEntry): string {
  const pool = entry.variants;
  if (pool.length <= 1) return pool[0] ?? "";

  const lastIdx = lastVariant[entry.intent] ?? -1;
  const candidates = pool
    .map((text, idx) => ({ text, idx }))
    .filter((c) => c.idx !== lastIdx);

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  lastVariant[entry.intent] = pick.idx;
  return pick.text;
}

/* ---------- fallback ---------- */

let lastFallbackIdx = -1;

function pickFallback(): string {
  const pool = FALLBACK_VARIANTS;
  const candidates = pool
    .map((text, idx) => ({ text, idx }))
    .filter((c) => c.idx !== lastFallbackIdx);
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  lastFallbackIdx = pick.idx;
  return pick.text;
}

/* =========================================================
   Main export
   ========================================================= */

export interface MatchResult {
  intent: string;
  answer: string;
  confidence: number;
}

export function matchIntent(userInput: string): MatchResult {
  const normalized = normalize(userInput);
  if (!normalized) {
    return { intent: "FALLBACK", answer: pickFallback(), confidence: 0 };
  }

  const inputWords = words(normalized);

  // Step 1: Check greeting / thanks first (special handling)
  if (isGreeting(normalized, inputWords)) {
    const entry = INTENTS.find((e) => e.intent === "GREETING");
    if (entry) {
      return { intent: "GREETING", answer: pickVariant(entry), confidence: 1 };
    }
  }

  if (isThanks(normalized, inputWords)) {
    const entry = INTENTS.find((e) => e.intent === "THANKS");
    if (entry) {
      return { intent: "THANKS", answer: pickVariant(entry), confidence: 1 };
    }
  }

  // Step 2: Score all non-greeting/non-thanks intents
  let bestEntry: IntentEntry | null = null;
  let bestScore = 0;

  for (const entry of INTENTS) {
    // Skip greeting/thanks — already handled above
    if (entry.intent === "GREETING" || entry.intent === "THANKS") continue;

    const score = scoreIntent(normalized, inputWords, entry);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  // Step 3: Threshold check — need at least 3 points to be confident
  const THRESHOLD = 3;

  if (!bestEntry || bestScore < THRESHOLD) {
    return { intent: "FALLBACK", answer: pickFallback(), confidence: 0 };
  }

  // Step 4: Single intent matched — pick a variant and return
  return {
    intent: bestEntry.intent,
    answer: pickVariant(bestEntry),
    confidence: Math.min(bestScore / 10, 1),
  };
}
