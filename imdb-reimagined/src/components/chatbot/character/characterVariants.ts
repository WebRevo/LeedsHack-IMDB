/* =========================================================
   Character Animation Variants — all timing & motion configs

   Organized into layers:
   1. CONTINUOUS — always-running infinite loops (chat closed)
   2. POINTER   — external pointing hand cycle
   3. ACTIVE    — calm static pose (chat open)
   4. NUDGE     — periodic emphasis pulse
   5. TOOLTIP   — fade for nudge text
   6. WINDOW    — chat window enter/exit

   Tweak guide:
     - Float amplitude: CONTINUOUS.float.y array (±px)
     - Sway range: CONTINUOUS.sway.rotate array (±degrees)
     - Reel speed: CONTINUOUS.reelSpin.transition.duration (seconds)
     - Pointer pace: POINTER.cycle.transition.duration + repeatDelay
     - Nudge interval: NUDGE_INTERVAL_MS (ms between nudges)
     - Nudge display: NUDGE_DISPLAY_MS (ms tooltip stays visible)
   ========================================================= */

/* ---------- 1. Continuous (chat closed, infinite loops) ---- */

export const CONTINUOUS = {
  /** Gentle vertical float ±4px, 3.5s cycle */
  float: {
    y: [0, -4, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },

  /** Subtle rotation sway ±1.5 degrees, 6s cycle */
  sway: {
    rotate: [0, 1.5, 0, -1.5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },

  /** Breathing scale 1 → 1.015, 4s cycle */
  breathe: {
    scale: [1, 1.015, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },

  /** Gold glow ring opacity pulse, 3s cycle */
  glowPulse: {
    opacity: [0.1, 0.3, 0.1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },

  /** Reel sprocket/spoke slow rotation, 12s full turn */
  reelSpin: {
    rotate: [0, 360],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },

  /** Central eye light pulse */
  eyePulse: {
    scale: [1, 1.25, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },

  /** Eye glow halo pulse (larger, softer) */
  eyeGlowPulse: {
    opacity: [0.08, 0.2, 0.08],
    scale: [1, 1.1, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/* ---------- 2. Pointer hand cycle ---------- */

export const POINTER = {
  /** Extend in → hold → retract → pause → repeat.
   *  Total visible: 5s, then 1.5s pause = 6.5s cycle. */
  cycle: {
    x: [-28, 0, 0, -28],
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut" as const,
      times: [0, 0.2, 0.7, 1],
      repeatDelay: 1.5,
    },
  },

  /** Sync glow overlay on character body during pointer extend */
  syncGlow: {
    opacity: [0, 0.12, 0.12, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut" as const,
      times: [0, 0.2, 0.7, 1],
      repeatDelay: 1.5,
    },
  },
};

/* ---------- 3. Active (chat open — calm pose) ---------- */

export const ACTIVE = {
  float: { y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  sway: { rotate: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  breathe: { scale: 0.93, transition: { duration: 0.4, ease: "easeOut" as const } },
  glowPulse: { opacity: 0.06, transition: { duration: 0.3 } },
  reelSpin: { rotate: 0, transition: { duration: 2, ease: "easeOut" as const } },
  eyePulse: { scale: 1, opacity: 0.4, transition: { duration: 0.4 } },
  eyeGlowPulse: { opacity: 0.04, scale: 1, transition: { duration: 0.4 } },
};

/* ---------- 4. Nudge emphasis (one-shot) ---------- */

export const NUDGE = {
  emphasis: {
    scale: [1, 1.06, 1],
    y: [0, -3, 0],
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

/* ---------- 5. Chat window ---------- */

export const WINDOW = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.92,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 28,
    },
  },
};

/* ---------- 6. Nudge config ---------- */

export const NUDGE_TEXTS = ["Ask me", "Need help?"] as const;

/** Interval between nudge tooltips (ms) */
export const NUDGE_INTERVAL_MS = 8000;

/** How long each tooltip stays visible (ms) */
export const NUDGE_DISPLAY_MS = 2500;
