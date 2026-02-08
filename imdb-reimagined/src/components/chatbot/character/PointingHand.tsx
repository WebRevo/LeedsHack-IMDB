"use client";

import { motion } from "framer-motion";
import { POINTER } from "./characterVariants";

/* =========================================================
   PointingHand — director's baton pointing toward character

   A slim golden baton with arrow tip that repeatedly slides
   in from the left, holds, then retracts. Positioned outside
   the character's bounding box via absolute right-full.

   Only renders when `isAnimating` is true (chat closed +
   no reduced-motion preference).
   ========================================================= */

interface Props {
  isAnimating: boolean;
}

export default function PointingHand({ isAnimating }: Props) {
  if (!isAnimating) return null;

  return (
    <motion.div
      className="absolute right-full top-1/2 mr-1.5 -translate-y-1/2 sm:mr-2"
      animate={POINTER.cycle}
    >
      <svg
        width="56"
        height="22"
        viewBox="0 0 56 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-10 sm:h-5 sm:w-12 lg:h-[22px] lg:w-14 drop-shadow-[0_1px_6px_rgba(245,197,24,0.25)]"
      >
        {/* Grip (left end) */}
        <rect
          x="0"
          y="7"
          width="10"
          height="8"
          rx="3"
          fill="#969696"
          opacity={0.5}
        />
        {/* Rod */}
        <rect
          x="8"
          y="9"
          width="34"
          height="4"
          rx="2"
          fill="#f5c518"
          opacity={0.85}
        />
        {/* Arrow tip (pointing right → toward character) */}
        <path
          d="M40 4 L54 11 L40 18"
          stroke="#f5c518"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </motion.div>
  );
}
