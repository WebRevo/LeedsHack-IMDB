"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useTranscriptParser } from "@/hooks/useTranscriptParser";
import { useWizardStore } from "@/store/wizardStore";

/* =========================================================
   Global voice mic button + transcript drawer
   Lives in the toolbar area across all wizard steps
   ========================================================= */

export default function GlobalVoiceBar() {
  const voice = useVoiceInput();
  const parser = useTranscriptParser();
  const mergeVoiceParsed = useWizardStore((s) => s.mergeVoiceParsed);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "listening" | "parsing" | "success" | "error">("idle");

  // Sync listening state
  useEffect(() => {
    if (voice.listening) setStatus("listening");
    else if (status === "listening") setStatus("idle");
  }, [voice.listening, status]);

  // Sync parsing state
  useEffect(() => {
    if (parser.parsing) setStatus("parsing");
  }, [parser.parsing]);

  // Auto-merge when parsedData arrives
  useEffect(() => {
    if (parser.parsedData) {
      mergeVoiceParsed(
        parser.parsedData as unknown as Record<string, unknown>,
        parser.assumptions,
      );
      setStatus("success");
      const timer = setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [parser.parsedData, parser.assumptions, mergeVoiceParsed]);

  // Show error
  useEffect(() => {
    if (parser.error) setStatus("error");
  }, [parser.error]);

  const handleMicToggle = useCallback(() => {
    if (voice.listening) {
      voice.stop();
    } else {
      voice.clear();
      parser.clearParsed();
      setStatus("idle");
      voice.start();
      setOpen(true);
    }
  }, [voice, parser]);

  const handleParse = useCallback(() => {
    parser.parse(voice.transcript);
  }, [parser, voice.transcript]);

  const handleClear = useCallback(() => {
    voice.clear();
    parser.clearParsed();
    setStatus("idle");
  }, [voice, parser]);

  if (!voice.supported) return null;

  const statusText =
    status === "listening"
      ? "Listening..."
      : status === "parsing"
        ? "Parsing..."
        : status === "success"
          ? "Autofilled \u2713"
          : status === "error"
            ? parser.error ?? "Error"
            : null;

  return (
    <div className="relative">
      {/* Mic button */}
      <button
        type="button"
        onClick={handleMicToggle}
        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 font-display text-[10px] uppercase tracking-widest transition-all ${
          voice.listening
            ? "border-red-500/40 bg-red-500/10 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
            : open
              ? "border-imdb-gold bg-imdb-gold/10 text-imdb-gold"
              : "border-imdb-black/[0.08] text-imdb-gray hover:border-imdb-gold/40 hover:text-imdb-gold"
        }`}
      >
        <div className="relative">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          {voice.listening && (
            <motion.div
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
        Voice
      </button>

      {/* Transcript drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-imdb-gold/20 bg-white p-4 shadow-xl"
          >
            {/* Status line */}
            {statusText && (
              <div className={`mb-3 flex items-center gap-2 text-xs font-medium ${
                status === "success"
                  ? "text-emerald-600"
                  : status === "error"
                    ? "text-red-400"
                    : status === "listening"
                      ? "text-red-500"
                      : "text-imdb-gold"
              }`}>
                {status === "listening" && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1 w-1 rounded-full bg-red-500"
                        animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" as const }}
                      />
                    ))}
                  </div>
                )}
                {status === "parsing" && (
                  <motion.div
                    className="h-3 w-3 rounded-full border-2 border-imdb-gold/30 border-t-imdb-gold"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                )}
                {statusText}
              </div>
            )}

            {/* Live transcript */}
            {voice.transcript && (
              <div className="mb-3 rounded-lg border border-imdb-black/[0.06] bg-imdb-black/[0.02] p-3">
                <span className="font-display text-[10px] uppercase tracking-widest text-imdb-gray/60">
                  Transcript
                </span>
                <p className="mt-1 text-sm leading-relaxed text-imdb-black">
                  {voice.transcript}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleParse}
                disabled={voice.listening || parser.parsing || !voice.transcript.trim()}
                className="flex items-center gap-1.5 rounded-xl border border-imdb-gold bg-imdb-gold/10 px-3 py-2 font-display text-[10px] uppercase tracking-widest text-imdb-gold transition-all hover:bg-imdb-gold/20 disabled:opacity-40"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                Parse &amp; Autofill
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-imdb-gray/50 transition-colors hover:text-imdb-gray"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto text-xs text-imdb-gray/50 transition-colors hover:text-imdb-gray"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
