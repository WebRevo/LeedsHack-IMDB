"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* =========================================================
   ChatMessages — animated message list with proper wrapping
   ========================================================= */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

const messageVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

export default function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4">
      <div className="space-y-2.5 sm:space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-[88%] break-words rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed sm:max-w-[85%] sm:px-4 sm:py-3 ${
                  msg.role === "user"
                    ? "bg-imdb-gold/[0.12] text-imdb-black"
                    : "bg-[#161616] text-[#f5f5f5]"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-imdb-gold/[0.04] to-transparent" />
                )}
                <span className="relative">{msg.text}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-1.5 rounded-2xl bg-[#161616] px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="block h-1.5 w-1.5 rounded-full bg-imdb-gold/60"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut" as const,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
