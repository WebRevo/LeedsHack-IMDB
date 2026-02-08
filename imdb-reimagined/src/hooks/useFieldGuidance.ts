"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWizardStore } from "@/store/wizardStore";
import { useShallow } from "zustand/react/shallow";
import { evaluateFieldTips, type FieldTipMap } from "@/lib/guidance/fieldRules";
import type { WizardFormState } from "@/store/types";

/* =========================================================
   useFieldGuidance — debounced per-field tip evaluation
   Mirrors the pattern of useAssistantGuidance (useShallow +
   debounce via useRef/setTimeout).
   ========================================================= */

/** Step-specific selector to limit re-renders. */
function selectStepSlice(step: number) {
  return (s: ReturnType<typeof useWizardStore.getState>) => {
    switch (step) {
      case 0: return s.core;
      case 1: return s.mandatory;
      case 2: return s.identity;
      case 3: return s.production;
      case 4: return s.credits;
      default: return s.core;
    }
  };
}

function selectFormState(
  s: ReturnType<typeof useWizardStore.getState>,
): WizardFormState {
  return {
    core: s.core,
    mandatory: s.mandatory,
    identity: s.identity,
    production: s.production,
    credits: s.credits,
    meta: s.meta,
  };
}

export function useFieldGuidance(step: number): { tips: FieldTipMap } {
  // Subscribe to only the current step's slice via useShallow
  // to avoid re-renders from other steps.
  const selector = selectStepSlice(step);
  const _stepSlice = useWizardStore(useShallow(selector));

  const [tips, setTips] = useState<FieldTipMap>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const compute = useCallback(() => {
    const state = selectFormState(useWizardStore.getState());
    const result = evaluateFieldTips(state, step);
    setTips(result);
  }, [step]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(compute, 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [_stepSlice, compute]);

  return { tips };
}
