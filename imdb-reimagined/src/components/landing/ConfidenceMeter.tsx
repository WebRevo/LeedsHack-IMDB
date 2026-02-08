"use client";

import { motion } from "framer-motion";
import { CONFIDENCE_FINAL_NOTE } from "./constants";

interface Props {
  /** 0-100 */
  percent: number;
  label: string;
}

const RING_SIZE = 120;
const STROKE = 6;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ConfidenceMeter({ percent, label }: Props) {
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
  const color =
    percent >= 75 ? "#22c55e" : percent >= 40 ? "#f5c518" : percent > 0 ? "#ef4444" : "rgba(150,150,150,0.2)";

  return (
    <div className="flex flex-col items-center gap-2.5">
      {/* Ring container */}
      <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
        {/* Gold glow pulse on every percent change */}
        {percent > 0 && (
          <motion.div
            key={`glow-${percent}`}
            className="absolute inset-[-6px] rounded-full"
            initial={{ boxShadow: "0 0 16px 4px rgba(245,197,24,0.2)" }}
            animate={{ boxShadow: "0 0 0 0 rgba(245,197,24,0)" }}
            transition={{ duration: 1.2, ease: "easeOut" as const }}
          />
        )}

        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          className="-rotate-90"
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        >
          {/* Background track */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            className="text-imdb-black/[0.05]"
            strokeWidth={STROKE}
          />
          {/* Animated arc */}
          <motion.circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
          />
        </svg>

        {/* Center number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={percent}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="font-display text-xl font-bold text-imdb-black"
          >
            {percent}%
          </motion.span>
        </div>

        {/* Sustained glow when high */}
        {percent >= 75 && (
          <motion.div
            className="absolute inset-[-2px] rounded-full"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(34,197,94,0)",
                "0 0 14px 3px rgba(34,197,94,0.12)",
                "0 0 0 0 rgba(34,197,94,0)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Label */}
      <motion.span
        key={label}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[16px] font-display text-[10px] uppercase tracking-widest text-imdb-gray"
      >
        {label}
      </motion.span>

      {/* Final note */}
      {percent >= 75 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-[160px] text-center text-[10px] leading-tight text-imdb-gold"
        >
          {CONFIDENCE_FINAL_NOTE}
        </motion.span>
      )}
    </div>
  );
}
