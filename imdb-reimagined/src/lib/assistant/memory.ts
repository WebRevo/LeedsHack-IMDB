import { create } from "zustand";
import type { AssistantIntent } from "./intents";

/* =========================================================
   Assistant Memory Store — tracks context across interactions
   No persistence (resets on page reload)
   ========================================================= */

interface AssistantMemoryState {
  lastIntent: AssistantIntent | null;
  lastMessageId: string;
  intentCooldowns: Record<string, number>; // intent → timestamp when cooldown expires
  recentFixes: string[];
  frustrationScore: number;
  idleSince: number; // timestamp of last idle start
  prevConfidence: number;
}

interface AssistantMemoryActions {
  recordIntent: (intent: AssistantIntent, msgId: string) => void;
  recordFix: (fixId: string) => void;
  clearFixes: () => void;
  bumpFrustration: () => void;
  resetIdle: () => void;
  tick: (confidence: number) => void;
  isOnCooldown: (intent: AssistantIntent) => boolean;
  reset: () => void;
}

const INITIAL_STATE: AssistantMemoryState = {
  lastIntent: null,
  lastMessageId: "",
  intentCooldowns: {},
  recentFixes: [],
  frustrationScore: 0,
  idleSince: Date.now(),
  prevConfidence: 0,
};

/* Cooldown durations per intent (ms) */
const COOLDOWNS: Partial<Record<AssistantIntent, number>> = {
  MISSING_EVIDENCE: 20_000,
  MISSING_RELEASE_DATE: 20_000,
  CREDITS_REQUIRED: 25_000,
  YEAR_FORMAT: 15_000,
  TYPE_SUBTYPE_MISMATCH: 30_000,
  TITLE_CAPITALIZATION: 30_000,
  NEXT_BEST_ACTION: 15_000,
  ALMOST_READY: 25_000,
  IDLE_NUDGE: 30_000,
  SUCCESS_ACK: 10_000,
};

export const useAssistantMemory = create<
  AssistantMemoryState & AssistantMemoryActions
>()((set, get) => ({
  ...INITIAL_STATE,

  recordIntent: (intent, msgId) =>
    set(() => {
      const cooldownMs = COOLDOWNS[intent] ?? 20_000;
      return {
        lastIntent: intent,
        lastMessageId: msgId,
        intentCooldowns: {
          ...get().intentCooldowns,
          [intent]: Date.now() + cooldownMs,
        },
        // Reset idle timer on new intent
        idleSince: Date.now(),
      };
    }),

  recordFix: (fixId) =>
    set((s) => ({
      recentFixes: [...s.recentFixes, fixId],
      frustrationScore: Math.max(0, s.frustrationScore - 1),
      idleSince: Date.now(),
    })),

  clearFixes: () => set({ recentFixes: [] }),

  bumpFrustration: () =>
    set((s) => ({
      frustrationScore: Math.min(s.frustrationScore + 1, 5),
    })),

  resetIdle: () => set({ idleSince: Date.now() }),

  // Guard: only call set() when prevConfidence actually changes.
  // Zustand's set() with a function updater always creates a new state
  // object → always notifies listeners, even if values are unchanged.
  // Skipping the no-op avoids unnecessary cascading re-renders.
  tick: (confidence) => {
    if (get().prevConfidence === confidence) return;
    set({ prevConfidence: confidence });
  },

  isOnCooldown: (intent) => {
    const expires = get().intentCooldowns[intent];
    if (!expires) return false;
    return Date.now() < expires;
  },

  reset: () => set(INITIAL_STATE),
}));
