"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import ChatMessages, { type ChatMessage } from "./ChatMessages";
import ChatInput from "./ChatInput";
import { matchIntent } from "./intentMatcher";

/* =========================================================
   ChatbotWindow — header + messages + input area

   Mobile:  fills parent container (bottom sheet from launcher)
   Tablet+: fixed-size card (380×520)
   ========================================================= */

interface ChatbotWindowProps {
  onClose: () => void;
}

let messageCounter = 0;
function nextId(): string {
  return `msg-${++messageCounter}-${Date.now()}`;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Welcome to the IMDb Assistant. I can help with submission rules, field guidance, evidence requirements, and more. What would you like to know?",
  timestamp: Date.now(),
};

export default function ChatbotWindow({ onClose }: ChatbotWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleSend = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: nextId(),
      role: "user",
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const delay = 300 + Math.random() * 400;
    typingTimeout.current = setTimeout(() => {
      const result = matchIntent(text);
      const assistantMsg: ChatMessage = {
        id: nextId(),
        role: "assistant",
        text: result.answer,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, delay);
  }, []);

  return (
    <motion.div
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#161616]/[0.06] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] sm:h-[520px] sm:w-[380px]"
    >
      {/* ---- Header ---- */}
      <div className="relative shrink-0 overflow-hidden bg-[#161616] px-4 py-3 sm:px-5 sm:py-4">
        {/* Gold accent line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#f5c518] via-[#f5c518]/80 to-[#f5c518]/40" />

        {/* Blurred gold glow */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#f5c518]/[0.08] blur-2xl" />

        <div className="relative flex items-start justify-between">
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-[#f5f5f5]">
              IMDb Assistant
            </h2>
            <p className="mt-0.5 text-[11px] text-[#969696]">
              Here to help you submit with confidence
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#969696] transition-colors hover:bg-[#f5f5f5]/10 hover:text-[#f5f5f5] sm:h-7 sm:w-7"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ---- Messages (scrollable) ---- */}
      <ChatMessages messages={messages} isTyping={isTyping} />

      {/* ---- Input (fixed at bottom) ---- */}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </motion.div>
  );
}
