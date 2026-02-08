/* =========================================================
   Character Mode — Script engine with cooldowns
   ========================================================= */

import { CHARACTER_LINES, type CharacterEvent } from "./characterLines";

/* Per-event cooldowns (ms) */
const COOLDOWNS: Record<CharacterEvent, number> = {
  fieldValid: 5000,
  stepComplete: 3000,
  warningShown: 8000,
  idle10s: 30000,
};

const GLOBAL_COOLDOWN = 3000;

/* ---- state ---- */

const lastFired: Record<string, number> = {};
let lastGlobal = 0;

/* ---- public API ---- */

export function fireEvent(event: CharacterEvent): string | null {
  const now = Date.now();

  /* enforce minimum gap between any two messages */
  if (now - lastGlobal < GLOBAL_COOLDOWN) return null;

  /* per-event cooldown */
  const lastEvent = lastFired[event] ?? 0;
  if (now - lastEvent < COOLDOWNS[event]) return null;

  const lines = CHARACTER_LINES[event];
  const line = lines[Math.floor(Math.random() * lines.length)];

  lastFired[event] = now;
  lastGlobal = now;

  return line;
}

export function resetEngine() {
  for (const k of Object.keys(lastFired)) delete lastFired[k];
  lastGlobal = 0;
}
