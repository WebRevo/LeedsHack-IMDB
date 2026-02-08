/* =========================================================
   Tone Selection & Application
   ========================================================= */

export type ToneMode = "neutral" | "encouraging" | "calm" | "direct";

/* ---- Select tone based on context ---- */

export function selectTone(
  confidence: number,
  prevConfidence: number,
  frustrationScore: number,
  hasBlocker: boolean,
  idleSince: number,
): ToneMode {
  const now = Date.now();
  const idleMs = idleSince > 0 ? now - idleSince : 0;

  // High frustration → calm, reassuring tone
  if (frustrationScore >= 3) return "calm";

  // Confidence dropping → encouraging
  if (prevConfidence > 0 && confidence < prevConfidence) return "encouraging";

  // Idle for a while → calm nudge
  if (idleMs > 15_000) return "calm";

  // Blockers present → direct, get things done
  if (hasBlocker) return "direct";

  // Score improving → encouraging
  if (confidence > prevConfidence && prevConfidence > 0) return "encouraging";

  return "neutral";
}

/* ---- Apply tone adjustments to text ---- */

const TONE_PREFIXES: Record<ToneMode, string[]> = {
  neutral: [],
  encouraging: ["Great progress.", "You're doing well.", "Keep it up."],
  calm: ["No worries.", "Take your time.", "No rush."],
  direct: [],
};

const TONE_SUFFIXES: Record<ToneMode, string[]> = {
  neutral: [],
  encouraging: ["You've got this.", "Almost there."],
  calm: ["I'm here to help.", "One step at a time."],
  direct: [],
};

export function applyTone(text: string, tone: ToneMode): string {
  // Neutral and direct tones don't modify the text
  if (tone === "neutral" || tone === "direct") return text;

  const prefixes = TONE_PREFIXES[tone];
  const suffixes = TONE_SUFFIXES[tone];

  // 40% chance to add a prefix, 30% chance to add a suffix
  // This keeps it from feeling formulaic
  let result = text;

  if (prefixes.length > 0 && Math.random() < 0.4) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    result = `${prefix} ${result}`;
  } else if (suffixes.length > 0 && Math.random() < 0.3) {
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    // Ensure there's a space before suffix
    result = `${result} ${suffix}`;
  }

  return result;
}
