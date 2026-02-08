"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceInput } from "@/hooks/useVoiceInput";

/* =========================================================
   ChatInput — text input + voice mic + send button

   Touch targets: min 44px on mobile for accessibility.
   ========================================================= */

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const voice = useVoiceInput();

  useEffect(() => {
    if (voice.transcript) {
      setText(voice.transcript);
    }
  }, [voice.transcript]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    voice.clear();
    inputRef.current?.focus();
  }, [text, disabled, onSend, voice]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (voice.listening) {
      voice.stop();
    } else {
      voice.clear();
      setText("");
      voice.start();
    }
  };

  return (
    <div
      className="shrink-0 border-t border-[#f5f5f5]/[0.06] bg-white px-3 pb-3 pt-2"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
    >
      {/* Listening indicator */}
      <AnimatePresence>
        {voice.listening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2">
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="block w-0.5 rounded-full bg-red-400"
                    animate={{
                      height: [4, 12 + Math.random() * 4, 4],
                    }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.3,
                      repeat: Infinity,
                      delay: i * 0.08,
                      ease: "easeInOut" as const,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-red-500">Listening...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mic button — 44px touch target */}
        {voice.supported && (
          <button
            type="button"
            onClick={toggleVoice}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all sm:h-9 sm:w-9 ${
              voice.listening
                ? "bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                : "bg-[#161616]/[0.04] text-[#969696] hover:bg-[#161616]/[0.08] hover:text-[#161616]"
            }`}
          >
            {voice.listening ? (
              <motion.svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path
                  d="M19 10v2a7 7 0 0 1-14 0v-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="12" y1="19" x2="12" y2="23"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </motion.svg>
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
              </svg>
            )}
          </button>
        )}

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about submissions, fields, rules..."
          disabled={disabled}
          className="h-10 flex-1 rounded-xl border border-[#161616]/[0.06] bg-[#f5f5f5]/50 px-3 text-sm text-[#161616] outline-none transition-all placeholder:text-[#969696]/60 focus:border-[#f5c518]/50 focus:ring-1 focus:ring-[#f5c518]/20 disabled:opacity-50 sm:h-9 sm:text-[13px]"
        />

        {/* Send button — 44px touch target */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5c518] text-[#161616] shadow-sm transition-all hover:bg-[#f5c518]/90 hover:shadow-[0_2px_8px_rgba(245,197,24,0.3)] active:scale-95 disabled:opacity-30 disabled:shadow-none sm:h-9 sm:w-9"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
