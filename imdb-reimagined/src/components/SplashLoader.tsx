"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* =========================================================
   IMDb Reimagined — Cinematic Splash Loader
   Full-screen loading animation with film-inspired visuals
   ========================================================= */

export default function SplashLoader() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState(0); // 0: bars, 1: logo, 2: exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => setVisible(false), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-imdb-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" as const }}
        >
          {/* Film grain texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "128px 128px",
            }}
          />

          {/* Animated radial gold glow */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 1 }}
            style={{
              background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(245,197,24,0.08), transparent 70%)",
            }}
          />

          {/* Horizontal film-strip bars — top */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-16 overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" as const }}
            style={{ transformOrigin: "left" }}
          >
            <div className="flex h-full items-center gap-1 px-4">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-8 w-6 rounded-sm bg-white/[0.04]"
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: 0.1 + i * 0.02, duration: 0.2 }}
                />
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-imdb-gold/20" />
          </motion.div>

          {/* Horizontal film-strip bars — bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" as const, delay: 0.1 }}
            style={{ transformOrigin: "right" }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-imdb-gold/20" />
            <div className="flex h-full items-center gap-1 px-4">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-8 w-6 rounded-sm bg-white/[0.04]"
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: 0.15 + i * 0.02, duration: 0.2 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Center content */}
          <div className="relative flex flex-col items-center">
            {/* Spinning film reel icon */}
            <AnimatePresence mode="wait">
              {phase < 1 && (
                <motion.div
                  key="reel"
                  exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <motion.svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    {/* Outer ring */}
                    <circle cx="40" cy="40" r="36" stroke="rgba(245,197,24,0.3)" strokeWidth="2" />
                    <circle cx="40" cy="40" r="28" stroke="rgba(245,197,24,0.15)" strokeWidth="1" />
                    {/* Sprocket holes */}
                    {[0, 60, 120, 180, 240, 300].map((angle) => (
                      <circle
                        key={angle}
                        cx={40 + 32 * Math.cos((angle * Math.PI) / 180)}
                        cy={40 + 32 * Math.sin((angle * Math.PI) / 180)}
                        r="4"
                        fill="rgba(245,197,24,0.4)"
                      />
                    ))}
                    {/* Center hub */}
                    <circle cx="40" cy="40" r="8" fill="rgba(245,197,24,0.6)" />
                    <circle cx="40" cy="40" r="3" fill="#161616" />
                  </motion.svg>
                </motion.div>
              )}

              {phase >= 1 && phase < 2 && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, y: -20 }}
                  transition={{ type: "spring" as const, stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  {/* Logo */}
                  <div className="font-display text-5xl font-bold tracking-tight md:text-6xl">
                    <motion.span
                      className="bg-imdb-gradient bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                    >
                      IMDb
                    </motion.span>
                    <motion.span
                      className="text-white"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      {" "}Reimagined
                    </motion.span>
                  </div>

                  {/* Gold bar */}
                  <motion.div
                    className="mt-4 h-[2px] rounded-full bg-imdb-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: 120 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" as const }}
                  />

                  {/* Tagline */}
                  <motion.p
                    className="mt-4 font-display text-xs uppercase tracking-[0.4em] text-imdb-gold/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Cinema Awaits
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating gold particles */}
            <div className="pointer-events-none absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-imdb-gold"
                  style={{
                    width: Math.random() * 3 + 1,
                    height: Math.random() * 3 + 1,
                    left: `${Math.random() * 200 - 50}%`,
                    top: `${Math.random() * 200 - 50}%`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    y: [0, -40 - Math.random() * 60],
                    x: (Math.random() - 0.5) * 40,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeOut" as const,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Scanning gold line */}
          <motion.div
            className="pointer-events-none absolute left-0 right-0 h-px bg-imdb-gradient"
            initial={{ top: "0%", opacity: 0 }}
            animate={{
              top: ["0%", "100%", "0%"],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut" as const,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
