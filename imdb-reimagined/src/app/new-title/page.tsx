"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import WizardLayout from "@/components/wizard/WizardLayout";
import ConfidenceSidebar from "@/components/wizard/ConfidenceSidebar";
import CinematicStepper from "@/components/cinema/CinematicStepper";
import StepHeader from "@/components/cinema/StepHeader";
import CinematicLoader from "@/components/cinema/CinematicLoader";
import {
  StepBasicInfo,
  StepMandatory,
  StepIdentity,
  StepProduction,
  StepCredits,
} from "@/components/wizard/WizardSteps";
import { useWizardStore } from "@/store/wizardStore";
import { useStepValidation } from "@/hooks/useStepValidation";
import GlobalVoiceBar from "@/components/wizard/GlobalVoiceBar";
import Character from "@/components/Character";
import { useAssistantGuidance } from "@/hooks/useAssistantGuidance";
import { useSupabaseDraft } from "@/hooks/useSupabaseDraft";
import type { SaveStatus } from "@/hooks/useSupabaseDraft";
import InlineAssistantHint from "@/components/InlineAssistantHint";
import AssistantDevPanel from "@/components/AssistantDevPanel";
import { FieldGuidanceProvider } from "@/components/wizard/FieldTip";

/* ---- step definitions ---- */

const STEPS = [
  { key: "core", label: "Core" as const, component: StepBasicInfo },
  { key: "mandatory", label: "Mandatory" as const, component: StepMandatory },
  { key: "identity", label: "Identity" as const, component: StepIdentity },
  { key: "production", label: "Production" as const, component: StepProduction },
  { key: "credits", label: "Credits" as const, component: StepCredits },
] as const;

/* ---- checklist derivation ---- */

type StoreState = ReturnType<typeof useWizardStore.getState>;

const REQUIRED_CHECKS = [
  { label: "Title", test: (s: StoreState) => (s.core?.title ?? "").trim().length > 0 },
  { label: "Title Verified", test: (s: StoreState) => s.core?.titleChecked === true },
  { label: "Title Type", test: (s: StoreState) => (s.core?.type ?? "") !== "" },
  { label: "Sub-type", test: (s: StoreState) => (s.core?.subtype ?? "") !== "" },
  { label: "Status", test: (s: StoreState) => (s.core?.status ?? "") !== "" },
  { label: "Release Year", test: (s: StoreState) => s.core?.year != null },
  { label: "Role", test: (s: StoreState) => (s.core?.contributorRole ?? "") !== "" },
  { label: "Evidence Link", test: (s: StoreState) => (s.mandatory?.miscLinks ?? []).length > 0 },
  { label: "Release Date", test: (s: StoreState) => (s.mandatory?.releaseDates ?? []).length > 0 },
  { label: "Country of Origin", test: (s: StoreState) => (s.identity?.countriesOfOrigin ?? []).length > 0 },
  { label: "Language", test: (s: StoreState) => (s.identity?.languages ?? []).length > 0 },
  { label: "Genre", test: (s: StoreState) => (s.identity?.genres ?? []).length > 0 },
  { label: "Budget", test: (s: StoreState) => (s.production?.budget?.amount != null && (s.production?.budget?.currency ?? "") !== "") },
  { label: "Major Credits (3 required)", test: (s: StoreState) => {
    const mc = s.credits?.majorCredits;
    if (mc == null || typeof mc !== "object") return false;
    return Object.values(mc).filter((v) => v > 0).length >= 3;
  }},
];

/* ---- animation variants ---- */

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 28 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  }),
};

/* ---- save status indicator ---- */

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.15 }}
        className={`flex items-center gap-1.5 font-display text-[10px] uppercase tracking-widest ${
          status === "saving"
            ? "text-imdb-gray/60"
            : status === "saved"
              ? "text-emerald-500"
              : "text-red-400"
        }`}
      >
        {status === "saving" && (
          <motion.span
            className="inline-block h-2.5 w-2.5 rounded-full border border-imdb-gray/40 border-t-imdb-gray"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" as const }}
          />
        )}
        {status === "saving" && "Saving..."}
        {status === "saved" && "Saved"}
        {status === "error" && "Save failed"}
      </motion.span>
    </AnimatePresence>
  );
}

/* =========================================================
   Page
   ========================================================= */

export default function NewTitlePage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [characterMode, setCharacterMode] = useState(false);

  const store = useWizardStore();
  const { fillMockData, resetForm } = store;
  const guidance = useAssistantGuidance();
  const { steps: stepValidations, completionPercent } = useStepValidation();
  const router = useRouter();
  const { draftId, saveStatus, isLoading: draftLoading, persistStep, saveDraft, submitDraft } = useSupabaseDraft();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Persist step index whenever it changes
  useEffect(() => {
    if (draftId) persistStep(step);
  }, [step, draftId, persistStep]);

  // Compute max reachable step: highest consecutive valid step + 1
  const maxReachableStep = (() => {
    let max = 0;
    for (let i = 0; i < stepValidations.length; i++) {
      if (stepValidations[i].valid) {
        max = i + 1;
      } else {
        break;
      }
    }
    return Math.min(max, STEPS.length - 1);
  })();

  const currentStepValid = stepValidations[step]?.valid ?? false;

  const navigate = useCallback(
    (next: number) => {
      if (next < 0 || next >= STEPS.length || loading) return;
      // Always allow going back
      if (next > step) {
        // Forward: check all intermediate steps are valid
        for (let i = step; i < next; i++) {
          if (!stepValidations[i]?.valid) return;
        }
      }
      setLoading(true);
      setDirection(next > step ? 1 : -1);
      setTimeout(() => {
        setStep(next);
        setLoading(false);
      }, 600);
    },
    [step, loading, stepValidations],
  );

  const checklist = REQUIRED_CHECKS.map((c) => {
    let done = false;
    try {
      done = c.test(store);
    } catch {
      done = false;
    }
    return { label: c.label, done };
  });

  const handleSaveForLater = useCallback(async () => {
    const ok = await saveDraft();
    if (ok) {
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    }
  }, [saveDraft]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    const ok = await submitDraft();
    if (ok) {
      setSubmitted(true);
      // Redirect after showing success
      setTimeout(() => {
        resetForm();
        router.push("/");
      }, 3000);
    }
    setSubmitting(false);
  }, [submitDraft, resetForm, router]);

  const StepComponent = STEPS[step].component;

  // Show loading state while draft is being fetched/created
  if (draftLoading) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <CinematicLoader />
            <p className="mt-4 font-display text-xs uppercase tracking-widest text-imdb-gray/60">
              Loading your draft...
            </p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <>
    <PageTransition>
      <WizardLayout
        left={
          <div className="flex flex-1 flex-col">
            {/* Cinematic header strip */}
            <StepHeader
              stepLabel={STEPS[step].label}
              stepNumber={step + 1}
              totalSteps={STEPS.length}
              confidence={store.meta?.confidenceScore ?? 0}
              completionPercent={completionPercent}
              currentStep={step}
            />

            {/* Cinematic stepper */}
            <div className="mb-4 flex flex-wrap items-center gap-3 sm:mb-6 sm:gap-4">
              <div className="-mx-1 overflow-x-auto px-1">
              <CinematicStepper
                steps={STEPS.map((s) => ({ key: s.key, label: s.label }))}
                currentStep={step}
                onStepClick={navigate}
                disabled={loading}
                maxReachableStep={maxReachableStep}
              />
              </div>

              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                {/* Save status indicator */}
                <SaveIndicator status={saveStatus} />

                {/* Global voice bar */}
                <GlobalVoiceBar />

                {/* Character mode toggle */}
                <div
                  className="flex cursor-pointer items-center gap-2"
                  onClick={() => setCharacterMode((p) => !p)}
                  role="switch"
                  aria-checked={characterMode}
                >
                  <span className="font-display text-[10px] uppercase tracking-widest text-imdb-gray/60">
                    Character
                  </span>
                  <div className="relative">
                    <div className={`h-5 w-9 rounded-full transition-colors ${characterMode ? "bg-imdb-gold" : "bg-imdb-black/[0.08]"}`} />
                    <motion.div
                      className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                      animate={{ x: characterMode ? 16 : 0 }}
                      transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>

                {/* Dev-only controls */}
                {process.env.NODE_ENV === "development" && (
                  <div className="flex gap-2">
                    <button
                      onClick={fillMockData}
                      className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 py-1 font-display text-[10px] uppercase tracking-widest text-emerald-500 transition-colors hover:bg-emerald-500/15"
                    >
                      Fill Mock
                    </button>
                    <button
                      onClick={resetForm}
                      className="rounded-lg border border-red-500/20 bg-red-500/[0.07] px-2.5 py-1 font-display text-[10px] uppercase tracking-widest text-red-400 transition-colors hover:bg-red-500/15"
                    >
                      Reset
                    </button>
                    {guidance != null && (
                      <AssistantDevPanel guidance={guidance} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Animated step content */}
            <div className="relative flex-1">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={STEPS[step].key}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-imdb-black/[0.06] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] sm:p-6">
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-imdb-gradient" />
                    <FieldGuidanceProvider step={step}>
                      <StepComponent />
                    </FieldGuidanceProvider>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Cinematic loader overlay */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CinematicLoader />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Inline assistant hint */}
            <InlineAssistantHint
              primary={guidance?.primary ?? null}
              secondary={guidance?.secondary ?? []}
              thinking={guidance?.thinking ?? false}
              onNavigate={navigate}
            />

            {/* Navigation */}
            <div className="mt-4 flex items-center justify-between sm:mt-6">
              <button
                onClick={() => navigate(step - 1)}
                disabled={step === 0 || loading}
                className="flex h-11 items-center gap-2 rounded-xl border border-imdb-black/[0.06] px-3.5 py-2.5 font-display text-xs uppercase tracking-widest text-imdb-gray transition-all hover:border-imdb-black/15 hover:text-imdb-black disabled:opacity-30 disabled:hover:border-imdb-black/[0.06] disabled:hover:text-imdb-gray sm:h-auto sm:px-4"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => navigate(step + 1)}
                  disabled={loading || !currentStepValid}
                  className="btn-gold h-11 sm:h-auto"
                >
                  Next
                  <svg className="ml-2 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={handleSaveForLater}
                    disabled={submitting}
                    className="flex h-11 items-center gap-2 rounded-xl border border-imdb-gold/30 px-3 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-imdb-gold transition-all hover:bg-imdb-gold/5 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed sm:h-auto sm:px-5 sm:py-3 sm:text-sm"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    Save for Later
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-gold h-11 disabled:opacity-50 disabled:cursor-not-allowed sm:h-auto"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          className="inline-block h-4 w-4 rounded-full border-2 border-imdb-black/20 border-t-imdb-black"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" as const }}
                        />
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 2L11 13" />
                          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                        Submit
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        }
        right={
          <ConfidenceSidebar
            score={store.meta?.confidenceScore ?? 0}
            warnings={store.meta?.warnings ?? []}
            assumptions={store.meta?.assumptions ?? []}
            currentStep={step}
            totalSteps={STEPS.length}
            checklist={checklist}
            assistantNote={
              guidance?.primary
                ? { text: guidance.primary.text, intent: guidance.primary.intent }
                : null
            }
          />
        }
      />
    </PageTransition>
    <Character enabled={characterMode} currentStep={step} />

    {/* Save toast */}
    <AnimatePresence>
      {saveToast && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
          className="fixed left-1/2 z-[60] -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-imdb-black px-4 py-3 shadow-2xl sm:px-6 sm:py-4"
          style={{ bottom: "max(2rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))" }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
            <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wider text-white">Draft Saved</p>
            <p className="text-xs text-imdb-gray">You can continue later anytime</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Submit success overlay */}
    <AnimatePresence>
      {submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-imdb-black/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring" as const, stiffness: 200, damping: 20, delay: 0.2 }}
            className="flex flex-col items-center text-center"
          >
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" as const, stiffness: 200, damping: 15, delay: 0.4 }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-imdb-gradient shadow-[0_0_60px_rgba(245,197,24,0.3)]"
            >
              <motion.svg
                className="h-12 w-12 text-imdb-black"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <motion.polyline
                  points="20 6 9 17 4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                />
              </motion.svg>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-8 font-display text-4xl font-bold uppercase tracking-tight text-white"
            >
              Title <span className="bg-imdb-gradient bg-clip-text text-transparent">Submitted</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-3 text-imdb-gray"
            >
              Your submission is now being reviewed
            </motion.p>

            {/* Gold particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-imdb-gold"
                initial={{
                  opacity: 0,
                  x: 0,
                  y: 0,
                  scale: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 8) * 120,
                  y: Math.sin((i * Math.PI * 2) / 8) * 120,
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 1.2,
                  delay: 0.5 + i * 0.05,
                  ease: "easeOut" as const,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
