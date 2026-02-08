"use client";

import { motion } from "framer-motion";

interface StepDef {
  key: string;
  label: string;
}

interface CinematicStepperProps {
  steps: StepDef[];
  currentStep: number;
  onStepClick: (index: number) => void;
  disabled?: boolean;
  maxReachableStep?: number;
}

export default function CinematicStepper({
  steps,
  currentStep,
  onStepClick,
  disabled = false,
  maxReachableStep,
}: CinematicStepperProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        const locked = maxReachableStep != null && i > maxReachableStep;

        return (
          <div key={step.key} className="flex items-center">
            {/* Step node */}
            <button
              onClick={() => !locked && onStepClick(i)}
              disabled={disabled || locked}
              className={`group relative flex flex-col items-center ${locked ? "cursor-not-allowed opacity-40" : ""}`}
            >
              {/* Dot */}
              <div className="relative">
                {/* Active pulse ring */}
                {active && (
                  <motion.div
                    className="absolute -inset-1.5 rounded-full border-2 border-imdb-gold/30"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <motion.div
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 font-display text-[11px] font-bold transition-colors ${
                    done
                      ? "border-imdb-gold bg-imdb-gold text-white"
                      : active
                        ? "border-imdb-gold bg-imdb-gold/10 text-imdb-gold"
                        : "border-imdb-black/10 bg-white text-imdb-gray"
                  }`}
                  animate={done ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {done ? (
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </motion.div>
              </div>

              {/* Label */}
              <span
                className={`mt-1.5 font-display text-[9px] uppercase tracking-[0.2em] transition-colors ${
                  done
                    ? "text-imdb-gold"
                    : active
                      ? "text-imdb-black"
                      : "text-imdb-gray/60"
                } ${!disabled ? "group-hover:text-imdb-gold" : ""}`}
              >
                {step.label}
              </span>
            </button>

            {/* Connecting line */}
            {i < steps.length - 1 && (
              <div className="mx-1 h-[2px] w-5 overflow-hidden rounded-full bg-imdb-black/[0.06] sm:mx-1.5 sm:w-12">
                <motion.div
                  className="h-full rounded-full bg-imdb-gradient"
                  initial={false}
                  animate={{
                    width: done ? "100%" : active ? "50%" : "0%",
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
