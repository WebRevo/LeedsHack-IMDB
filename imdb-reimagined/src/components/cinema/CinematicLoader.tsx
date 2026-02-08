"use client";

import { motion } from "framer-motion";

export default function CinematicLoader() {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Animated film reel */}
      <div className="relative">
        <motion.div
          className="h-12 w-12 rounded-full border-2 border-imdb-gold/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          {/* Sprocket dots */}
          {[0, 90, 180, 270].map((angle) => (
            <motion.div
              key={angle}
              className="absolute h-2 w-2 rounded-full bg-imdb-gold/60"
              style={{
                left: `calc(50% + ${20 * Math.cos((angle * Math.PI) / 180)}px - 4px)`,
                top: `calc(50% + ${20 * Math.sin((angle * Math.PI) / 180)}px - 4px)`,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-imdb-gold/40" />
          </div>
        </motion.div>

        {/* Pulsing glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-imdb-gold/20"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Gold sweep bar */}
      <div className="relative h-1 w-40 overflow-hidden rounded-full bg-imdb-black/[0.06]">
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-imdb-gradient"
          animate={{ x: ["-100%", "480%"] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <span className="font-display text-[10px] uppercase tracking-[0.3em] text-imdb-gray/60">
        Loading
      </span>
    </div>
  );
}
