/* =========================================================
   Character Mode — Canned dialogue lines
   ========================================================= */

export type CharacterEvent =
  | "fieldValid"
  | "stepComplete"
  | "warningShown"
  | "idle10s";

export const CHARACTER_LINES: Record<CharacterEvent, readonly string[]> = {
  fieldValid: [
    "Nice — that looks good.",
    "Got it, locked in.",
    "Solid choice.",
    "Looking good so far.",
    "Great, that one's done.",
  ],
  stepComplete: [
    "Step done! Let's keep going.",
    "All checked off — nice work.",
    "You're on a roll.",
    "That section's solid.",
    "Onward!",
  ],
  warningShown: [
    "Heads up — check the sidebar.",
    "Something flagged. Worth a look.",
    "A new warning popped up.",
  ],
  idle10s: [
    "Need help with anything?",
    "Still there? Take your time.",
    "I'm here if you need me.",
    "No rush — just checking in.",
  ],
};
