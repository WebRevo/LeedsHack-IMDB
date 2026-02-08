"use client";

import { motion } from "framer-motion";
import { CONTINUOUS, ACTIVE, NUDGE, POINTER } from "./characterVariants";

/* =========================================================
   CharacterAvatar — premium cinematic film-reel character

   Design:
     - Film reel head with rotating sprockets & spokes
     - Pulsing central "eye" light with radial glow
     - Sleek projection-screen body
     - Ambient spotlight underneath
     - Gold #f5c518 on dark #161616

   Animation layers (nested motion.g wrappers):
     1. Float  — vertical oscillation
     2. Sway   — subtle rotation
     3. Breathe / Nudge — scale pulse

   All infinite loops run when `isAnimating=true`.
   When false, transitions to calm ACTIVE pose.
   ========================================================= */

interface Props {
  isAnimating: boolean;
  nudgeActive: boolean;
}

export default function CharacterAvatar({ isAnimating, nudgeActive }: Props) {
  /* Choose animation targets based on state */
  const floatAnim = isAnimating ? CONTINUOUS.float : ACTIVE.float;
  const swayAnim = isAnimating ? CONTINUOUS.sway : ACTIVE.sway;
  const breatheAnim = nudgeActive
    ? NUDGE.emphasis
    : isAnimating
      ? CONTINUOUS.breathe
      : ACTIVE.breathe;
  const reelAnim = isAnimating ? CONTINUOUS.reelSpin : ACTIVE.reelSpin;
  const eyeAnim = isAnimating ? CONTINUOUS.eyePulse : ACTIVE.eyePulse;
  const eyeGlowAnim = isAnimating
    ? CONTINUOUS.eyeGlowPulse
    : ACTIVE.eyeGlowPulse;
  const glowAnim = isAnimating ? CONTINUOUS.glowPulse : ACTIVE.glowPulse;

  return (
    <svg
      viewBox="0 0 80 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <defs>
        {/* Radial gradient for eye glow */}
        <radialGradient id="char-eye-glow">
          <stop offset="0%" stopColor="#f5c518" stopOpacity="1" />
          <stop offset="100%" stopColor="#f5c518" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---- Ambient spotlight underneath ---- */}
      <motion.ellipse
        cx="40"
        cy="91"
        rx="18"
        ry="4"
        fill="#f5c518"
        animate={
          isAnimating
            ? { opacity: [0.03, 0.07, 0.03] }
            : { opacity: 0.02 }
        }
        transition={
          isAnimating
            ? { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
            : { duration: 0.4 }
        }
      />

      {/* ---- Outer glow ring ---- */}
      <motion.circle
        cx="40"
        cy="44"
        r="36"
        fill="none"
        stroke="#f5c518"
        strokeWidth="1"
        animate={glowAnim}
      />

      {/* ---- Pointer sync glow overlay ---- */}
      {isAnimating && (
        <motion.circle
          cx="40"
          cy="44"
          r="30"
          fill="#f5c518"
          animate={POINTER.syncGlow}
        />
      )}

      {/* Layer 1 — Float */}
      <motion.g animate={floatAnim}>
        {/* Layer 2 — Sway */}
        <motion.g
          animate={swayAnim}
          style={{ transformOrigin: "40px 44px" }}
        >
          {/* Layer 3 — Breathe / Nudge */}
          <motion.g
            animate={breatheAnim}
            style={{ transformOrigin: "40px 44px" }}
          >
            {/* ======== Body (projection screen) ======== */}
            <rect
              x="28"
              y="62"
              width="24"
              height="20"
              rx="4"
              fill="#161616"
              stroke="#f5c518"
              strokeWidth="1"
              strokeOpacity={0.35}
            />
            {/* Screen inner glow area */}
            <rect
              x="32"
              y="65"
              width="16"
              height="7"
              rx="2"
              fill="#f5c518"
              opacity={0.05}
            />
            {/* Film frame dividers */}
            <line
              x1="30"
              y1="72"
              x2="50"
              y2="72"
              stroke="#f5c518"
              strokeWidth="0.5"
              opacity={0.2}
            />
            <line
              x1="30"
              y1="77"
              x2="50"
              y2="77"
              stroke="#f5c518"
              strokeWidth="0.5"
              opacity={0.15}
            />

            {/* ======== Neck connector ======== */}
            <rect
              x="37"
              y="58"
              width="6"
              height="6"
              rx="2"
              fill="#f5c518"
              opacity={0.15}
            />

            {/* ======== Base / stand ======== */}
            <ellipse
              cx="40"
              cy="84"
              rx="12"
              ry="2.5"
              fill="#161616"
              stroke="#f5c518"
              strokeWidth="0.6"
              strokeOpacity={0.2}
            />

            {/* ======== Head — Film Reel ======== */}

            {/* Outer ring */}
            <circle
              cx="40"
              cy="34"
              r="25"
              fill="#161616"
              stroke="#f5c518"
              strokeWidth="1.5"
              strokeOpacity={0.8}
            />

            {/* Rotating sprockets + spokes */}
            <motion.g
              animate={reelAnim}
              style={{ transformOrigin: "40px 34px" }}
            >
              {/* 8 sprocket holes at r=21.5 */}
              <circle cx="61.5" cy="34" r="2" fill="#f5c518" opacity={0.35} />
              <circle cx="55.2" cy="49.2" r="2" fill="#f5c518" opacity={0.35} />
              <circle cx="40" cy="55.5" r="2" fill="#f5c518" opacity={0.35} />
              <circle cx="24.8" cy="49.2" r="2" fill="#f5c518" opacity={0.35} />
              <circle cx="18.5" cy="34" r="2" fill="#f5c518" opacity={0.35} />
              <circle cx="24.8" cy="18.8" r="2" fill="#f5c518" opacity={0.35} />
              <circle cx="40" cy="12.5" r="2" fill="#f5c518" opacity={0.35} />
              <circle cx="55.2" cy="18.8" r="2" fill="#f5c518" opacity={0.35} />

              {/* 4 spokes: hub (r=7) → inner ring (r=16) */}
              <line x1="47" y1="34" x2="56" y2="34" stroke="#f5c518" strokeWidth="0.8" opacity={0.3} />
              <line x1="33" y1="34" x2="24" y2="34" stroke="#f5c518" strokeWidth="0.8" opacity={0.3} />
              <line x1="40" y1="27" x2="40" y2="18" stroke="#f5c518" strokeWidth="0.8" opacity={0.3} />
              <line x1="40" y1="41" x2="40" y2="50" stroke="#f5c518" strokeWidth="0.8" opacity={0.3} />
            </motion.g>

            {/* Inner ring */}
            <circle
              cx="40"
              cy="34"
              r="16"
              fill="none"
              stroke="#f5c518"
              strokeWidth="0.8"
              strokeOpacity={0.4}
            />

            {/* Hub */}
            <circle
              cx="40"
              cy="34"
              r="7"
              fill="#161616"
              stroke="#f5c518"
              strokeWidth="1"
              strokeOpacity={0.6}
            />

            {/* Eye glow halo (radial gradient) */}
            <motion.circle
              cx="40"
              cy="34"
              r="10"
              fill="url(#char-eye-glow)"
              animate={eyeGlowAnim}
            />

            {/* Central eye light */}
            <motion.circle
              cx="40"
              cy="34"
              r="4"
              fill="#f5c518"
              animate={eyeAnim}
            />

            {/* ======== Film strip detail (right side) ======== */}
            <g opacity={0.25}>
              <rect x="66" y="26" width="7" height="16" rx="1" stroke="#f5c518" strokeWidth="0.6" fill="none" />
              {/* Perforation holes */}
              <rect x="67" y="28" width="1.5" height="1.2" rx="0.4" fill="#f5c518" />
              <rect x="67" y="32" width="1.5" height="1.2" rx="0.4" fill="#f5c518" />
              <rect x="67" y="36" width="1.5" height="1.2" rx="0.4" fill="#f5c518" />
              <rect x="70.5" y="28" width="1.5" height="1.2" rx="0.4" fill="#f5c518" />
              <rect x="70.5" y="32" width="1.5" height="1.2" rx="0.4" fill="#f5c518" />
              <rect x="70.5" y="36" width="1.5" height="1.2" rx="0.4" fill="#f5c518" />
            </g>
          </motion.g>
        </motion.g>
      </motion.g>
    </svg>
  );
}
