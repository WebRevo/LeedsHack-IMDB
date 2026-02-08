"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceInput } from "@/hooks/useVoiceInput";

/* =========================================================
   HelpPanel — AI Help button + dropdown panel with voice
   ========================================================= */

const STEP_SUGGESTIONS: string[][] = [
  // Step 0 — Core
  [
    "What does the Verify button do?",
    "What title type should I choose?",
    "What contributor role fits me?",
  ],
  // Step 1 — Mandatory
  [
    "What counts as valid evidence?",
    "Can I use social media as evidence?",
    "Can I submit a partial release date?",
  ],
  // Step 2 — Identity
  [
    "How many genres should I select?",
    "What is country of origin?",
    "What if my language is not listed?",
  ],
  // Step 3 — Production
  [
    "Is the budget field required?",
    "What are official sites?",
    "Can a title have co-directors?",
  ],
  // Step 4 — Credits
  [
    "What is the minimum credit requirement?",
    "What are the major credit categories?",
    "Can I add more credits after submission?",
  ],
];

interface HelpPanelProps {
  currentStep: number;
}

export default function HelpPanel({ currentStep }: HelpPanelProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"knowledge_base" | "ai" | "fallback" | "">("");
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const voice = useVoiceInput();

  // Sync voice transcript into query input
  useEffect(() => {
    if (voice.transcript) {
      setQuery(voice.transcript);
    }
  }, [voice.transcript]);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const submit = async (q?: string) => {
    const question = (q ?? query).trim();
    if (!question || loading) return;
    setLoading(true);
    setAnswer("");
    setSource("");

    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (data.answer) {
        setAnswer(data.answer);
        setSource(data.source ?? "fallback");
      } else {
        setAnswer("Sorry, I could not find an answer. Try rephrasing your question.");
        setSource("fallback");
      }
    } catch {
      setAnswer("Something went wrong. Please try again.");
      setSource("fallback");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (q: string) => {
    setQuery(q);
    submit(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const toggleVoice = () => {
    if (voice.listening) {
      voice.stop();
    } else {
      voice.clear();
      setQuery("");
      voice.start();
    }
  };

  const suggestions = STEP_SUGGESTIONS[currentStep] ?? STEP_SUGGESTIONS[0];

  return (
    <div className="relative" ref={panelRef}>
      {/* AI Help button — gold outline chip */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-[10px] uppercase tracking-widest transition-all ${
          open
            ? "border-imdb-gold bg-imdb-gold/15 text-imdb-gold"
            : "border-imdb-gold/20 bg-imdb-gold/[0.07] text-imdb-gold hover:bg-imdb-gold/15"
        }`}
      >
        {/* Chat bubble icon */}
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        AI Help
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-9 z-30 w-[calc(100vw-3rem)] max-w-80 rounded-xl border border-imdb-black/[0.08] bg-white p-3 shadow-xl sm:w-80 sm:p-4"
          >
            {/* Input row */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this step..."
                className="input-cinema-sm flex-1"
              />

              {/* Mic button */}
              {voice.supported && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
                    voice.listening
                      ? "border-red-400 bg-red-50 text-red-500"
                      : "border-imdb-black/[0.08] text-imdb-gray hover:border-imdb-gold/30 hover:text-imdb-gold"
                  }`}
                >
                  {voice.listening ? (
                    <motion.svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="12" y1="19" x2="12" y2="23" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </motion.svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                    </svg>
                  )}
                </button>
              )}

              {/* Submit button */}
              <button
                type="button"
                onClick={() => submit()}
                disabled={loading || !query.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-imdb-gold text-imdb-black transition-all hover:bg-imdb-gold/90 disabled:opacity-30"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>

            {/* Suggested questions */}
            {!answer && !loading && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSuggestion(q)}
                    className="rounded-full border border-imdb-black/[0.06] bg-imdb-black/[0.02] px-2.5 py-1 text-[10px] text-imdb-gray transition-all hover:border-imdb-gold/30 hover:text-imdb-gold"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Loading shimmer */}
            {loading && (
              <div className="mt-3 space-y-2">
                <motion.div
                  className="h-3 rounded-full bg-imdb-gold/10"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <motion.div
                  className="h-3 w-3/4 rounded-full bg-imdb-gold/10"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                />
              </div>
            )}

            {/* Answer area */}
            {answer && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-lg border-l-2 border-imdb-gold/40 bg-imdb-gold/[0.04] px-3 py-2.5"
              >
                <p className="text-xs leading-relaxed text-imdb-black/80">
                  {answer}
                </p>
                {source && (
                  <p className="mt-1.5 text-[10px] text-imdb-gray/50">
                    {source === "knowledge_base"
                      ? "From knowledge base"
                      : source === "ai"
                        ? "AI-powered"
                        : "General guidance"}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
