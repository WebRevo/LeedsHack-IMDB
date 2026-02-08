"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import CinematicShell from "@/components/cinema/CinematicShell";
import HeroDemoTyper from "@/components/landing/HeroDemoTyper";
import ConfidenceMeter from "@/components/landing/ConfidenceMeter";
import RotatingMicrocopy from "@/components/landing/RotatingMicrocopy";
import RejectionReveal from "@/components/landing/RejectionReveal";
import VoicePreviewOverlay from "@/components/landing/VoicePreviewOverlay";
import StepPreviewBand from "@/components/landing/StepPreviewBand";

/* ── Animation variants ─────────────────────────────────── */

const ctaVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { type: "spring" as const, stiffness: 400, damping: 15 },
  },
  tap: { scale: 0.97 },
};

/* ── Page ──────────────────────────────────────────────── */

export default function Home() {
  const [confidence, setConfidence] = useState({ percent: 0, label: "" });
  const [voiceOpen, setVoiceOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const handleConfidence = useCallback(
    (percent: number, label: string) => setConfidence({ percent, label }),
    [],
  );

  return (
    <PageTransition>
      <CinematicShell>
        {/* ══════════════════════════════════════════════════
            Hero section
           ══════════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-8 sm:px-6 lg:px-8"
        >
          {/* ── Animated gradient orbs (Framer Motion) ────── */}

          {/* Large gold orb — top left, drifts slowly */}
          <motion.div
            className="pointer-events-none absolute left-[-5%] top-[5%] h-[450px] w-[450px] rounded-full blur-[100px]"
            style={{
              background:
                "radial-gradient(circle, rgba(245,197,24,0.35) 0%, rgba(255,200,50,0.12) 50%, transparent 70%)",
              y: orbY1,
            }}
            animate={{
              x: [0, 40, -20, 0],
              scale: [1, 1.15, 0.9, 1],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut" as const,
            }}
          />

          {/* Warm orange orb — bottom right, counter-drifts */}
          <motion.div
            className="pointer-events-none absolute bottom-[0%] right-[-3%] h-[400px] w-[400px] rounded-full blur-[100px]"
            style={{
              background:
                "radial-gradient(circle, rgba(255,104,0,0.30) 0%, rgba(245,197,24,0.10) 50%, transparent 70%)",
              y: orbY2,
            }}
            animate={{
              x: [-15, 30, -10, -15],
              y: [0, -40, 20, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut" as const,
            }}
          />

          {/* Center glow — reacts to scroll */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[38%] h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, rgba(249,220,116,0.25) 0%, rgba(245,197,24,0.08) 50%, transparent 70%)",
              scale: glowScale,
            }}
          />

          {/* Small accent orb — top right */}
          <motion.div
            className="pointer-events-none absolute right-[10%] top-[15%] h-[200px] w-[200px] rounded-full blur-[80px]"
            style={{
              background:
                "radial-gradient(circle, rgba(255,170,0,0.22) 0%, transparent 70%)",
            }}
            animate={{
              y: [0, -25, 15, 0],
              x: [0, 15, -10, 0],
              opacity: [0.7, 1, 0.6, 0.7],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut" as const,
            }}
          />

          {/* ── Main content container ─────────────────────── */}
          <motion.div
            className="relative z-10 flex w-full max-w-4xl flex-col items-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            {/* Eyebrow */}
            <motion.span
              className="font-display text-xs uppercase tracking-[0.3em] text-imdb-gold/80"
              variants={{
                hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.6 },
                },
              }}
            >
              IMDb Reimagined
            </motion.span>

            {/* Hero title — mt-3 from eyebrow */}
            <motion.h1
              className="page-heading mt-3 text-center"
              variants={{
                hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.7, ease: "easeOut" },
                },
              }}
            >
              Add a New{" "}
              <span className="relative">
                <span className="bg-imdb-gradient bg-clip-text text-transparent">
                  Title
                </span>
                {/* Animated underline sweep */}
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full bg-imdb-gradient"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    delay: 0.8,
                    duration: 0.6,
                    ease: "easeOut" as const,
                  }}
                />
              </span>
            </motion.h1>

            {/* Subtext — mt-4 from title */}
            <motion.p
              className="mt-4 max-w-md text-center text-lg leading-relaxed text-imdb-gray"
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5 },
                },
              }}
            >
              Voice-first. Real-time confidence. IMDb-themed.
            </motion.p>

            {/* Rotating microcopy — mt-2 from subtext */}
            <motion.div
              className="mt-2"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { duration: 0.5 },
                },
              }}
            >
              <RotatingMicrocopy />
            </motion.div>

            {/* ── Live Demo + Confidence Ring — Grid layout ──── */}
            <motion.div
              className="mt-10 grid w-full grid-cols-1 items-center gap-8 md:grid-cols-[1fr_140px] md:gap-10"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6 },
                },
              }}
            >
              <HeroDemoTyper onConfidenceChange={handleConfidence} />

              <div className="flex justify-center md:justify-end">
                <ConfidenceMeter
                  percent={confidence.percent}
                  label={confidence.label}
                />
              </div>
            </motion.div>

            {/* Rejection reveal — mt-6 from demo */}
            <motion.div
              className="mt-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { duration: 0.5, delay: 0.2 },
                },
              }}
            >
              <RejectionReveal />
            </motion.div>

            {/* ── CTAs — mt-10 from rejection ──────────────── */}
            <motion.div
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6"
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5 },
                },
              }}
            >
              {/* Voice CTA */}
              <motion.div
                variants={ctaVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <button
                  onClick={() => setVoiceOpen(true)}
                  className="btn-gold group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg
                      className="h-4 w-4 transition-transform group-hover:scale-110"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                    Talk it out
                  </span>
                  {/* Hover sheen */}
                  <motion.span
                    className="absolute inset-0 bg-white/10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </button>
              </motion.div>

              {/* Type CTA */}
              <motion.div
                variants={ctaVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  href="/new-title?mode=type"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-imdb-gold/30 bg-white/50 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-imdb-gold backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-imdb-gold hover:bg-imdb-gold/5 hover:shadow-[0_4px_20px_rgba(245,197,24,0.15)] active:translate-y-0"
                >
                  <svg
                    className="h-4 w-4 transition-transform group-hover:rotate-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="4 7 4 4 20 4 20 7" />
                    <line x1="9" y1="20" x2="15" y2="20" />
                    <line x1="12" y1="4" x2="12" y2="20" />
                  </svg>
                  Type with AI
                </Link>
              </motion.div>
            </motion.div>

            {/* ── Feature highlights — mt-16 from CTAs ─────── */}
            <motion.div
              className="mt-16 grid w-full max-w-lg grid-cols-1 gap-5 sm:grid-cols-3"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { duration: 0.5, staggerChildren: 0.1 },
                },
              }}
            >
              {[
                {
                  icon: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z",
                  label: "Voice Input",
                  gradient: "from-amber-500/15 via-yellow-400/8 to-transparent",
                },
                {
                  icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                  label: "Smart Validation",
                  gradient:
                    "from-emerald-500/15 via-green-400/8 to-transparent",
                },
                {
                  icon: "M13 10V3L4 14h7v7l9-11h-7z",
                  label: "AI Powered",
                  gradient:
                    "from-orange-500/15 via-amber-400/8 to-transparent",
                },
              ].map((feat) => (
                <motion.div
                  key={feat.label}
                  className="group relative flex flex-col items-center gap-2.5 rounded-2xl border border-imdb-black/[0.06] bg-white/70 px-6 py-5 backdrop-blur-sm transition-all duration-300 hover:border-imdb-gold/25 hover:shadow-[0_4px_24px_rgba(245,197,24,0.12)]"
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${feat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />
                  <svg
                    className="relative z-10 h-6 w-6 text-imdb-gold/60 transition-colors group-hover:text-imdb-gold"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={feat.icon} />
                  </svg>
                  <span className="relative z-10 font-display text-[10px] uppercase tracking-widest text-imdb-gray transition-colors group-hover:text-imdb-black/70">
                    {feat.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* ── Step preview band — mt-16 from features ──── */}
            <div className="mt-16 w-full">
              <StepPreviewBand />
            </div>

            {/* Bottom accent line */}
            <motion.div
              className="mb-8 mt-14 h-[2px] w-32 rounded-full bg-imdb-gradient"
              variants={{
                hidden: { opacity: 0, scaleX: 0 },
                visible: {
                  opacity: 1,
                  scaleX: 1,
                  transition: { duration: 0.6, delay: 0.1 },
                },
              }}
            />
          </motion.div>
        </section>

        {/* ── Voice preview overlay ──────────────────── */}
        <VoicePreviewOverlay
          open={voiceOpen}
          onClose={() => setVoiceOpen(false)}
        />
      </CinematicShell>
    </PageTransition>
  );
}
