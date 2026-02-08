"use client";

import { useMemo } from "react";
import { useWizardStore } from "@/store/wizardStore";
import { computeStepValidation } from "@/lib/validation";

/* Re-export types from the pure module */
export type { StepValidation, StepValidationResult } from "@/lib/validation";

export function useStepValidation() {
  const core = useWizardStore((s) => s.core);
  const mandatory = useWizardStore((s) => s.mandatory);
  const identity = useWizardStore((s) => s.identity);
  const production = useWizardStore((s) => s.production);
  const credits = useWizardStore((s) => s.credits);
  const meta = useWizardStore((s) => s.meta);

  return useMemo(
    () => computeStepValidation({ core, mandatory, identity, production, credits, meta }),
    [core, mandatory, identity, production, credits, meta],
  );
}
