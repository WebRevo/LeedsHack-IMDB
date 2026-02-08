import type { WizardFormState } from "@/store/types";

/* =========================================================
   Per-step validation — pure function (no React dependency)
   ========================================================= */

export interface StepValidation {
  valid: boolean;
  met: number;
  total: number;
}

export interface StepValidationResult {
  steps: StepValidation[];
  completionPercent: number;
}

export function computeStepValidation(state: WizardFormState): StepValidationResult {
  const { core, mandatory, identity, production, credits } = state;

  /* ---- Step 0: Core ---- */
  const s0checks = [
    core.title.trim().length > 0,
    core.titleChecked,
    core.type !== "",
    core.status !== "",
    core.year != null,
    core.contributorRole !== "",
  ];
  const s0met = s0checks.filter(Boolean).length;
  const s0: StepValidation = { valid: s0checks.every(Boolean), met: s0met, total: s0checks.length };

  /* ---- Step 1: Mandatory ---- */
  const hasValidRd = mandatory.releaseDates.some(
    (rd) => rd.country !== "" && rd.month !== "" && rd.year.length === 4 && rd.releaseType !== "",
  );
  const hasValidMl = mandatory.miscLinks.some(
    (ml) => /^https?:\/\/.+\..+/.test(ml.url) && ml.label.trim().length > 0,
  );
  const s1checks = [hasValidRd, hasValidMl];
  const s1met = s1checks.filter(Boolean).length;
  const s1: StepValidation = { valid: s1checks.every(Boolean), met: s1met, total: s1checks.length };

  /* ---- Step 2: Identity ---- */
  const s2checks = [
    identity.countriesOfOrigin.length > 0,
    identity.languages.length > 0,
  ];
  const s2met = s2checks.filter(Boolean).length;
  const s2: StepValidation = { valid: s2checks.every(Boolean), met: s2met, total: s2checks.length };

  /* ---- Step 3: Production ---- */
  const s3checks = [
    production.budget.currency !== "" && production.budget.amount != null,
  ];
  const s3met = s3checks.filter(Boolean).length;
  const s3: StepValidation = { valid: s3checks.every(Boolean), met: s3met, total: s3checks.length };

  /* ---- Step 4: Credits ---- */
  const mc = credits.majorCredits;
  const filledCats = Object.values(mc).filter((v) => v > 0).length;
  const s4checks = [
    production.directors.length > 0,
    filledCats >= 3,
  ];
  const s4met = s4checks.filter(Boolean).length;
  const s4: StepValidation = { valid: s4checks.every(Boolean), met: s4met, total: s4checks.length };

  const steps = [s0, s1, s2, s3, s4];
  const totalMet = steps.reduce((sum, s) => sum + s.met, 0);
  const totalRequired = steps.reduce((sum, s) => sum + s.total, 0);
  const completionPercent = totalRequired > 0 ? Math.round((totalMet / totalRequired) * 100) : 0;

  return { steps, completionPercent };
}
