"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FilmCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  goldTop?: boolean;
}

export default function FilmCard({
  children,
  className = "",
  hover = false,
  goldTop = true,
}: FilmCardProps) {
  return (
    <motion.div
      className={`film-card relative overflow-hidden rounded-2xl border border-imdb-black/[0.06] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] ${className}`}
      {...(hover
        ? {
            whileHover: {
              y: -2,
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)",
            },
            transition: {
              type: "spring" as const,
              stiffness: 400,
              damping: 25,
            },
          }
        : {})}
    >
      {/* Gold gradient hairline */}
      {goldTop && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-imdb-gradient" />
      )}
      <div className="p-6">{children}</div>
    </motion.div>
  );
}
