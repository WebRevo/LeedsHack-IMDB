/* =========================================================
   Field Rule Engine — pure functions evaluating per-field tips
   ========================================================= */

import type { WizardFormState } from "@/store/types";
import { pickFieldVariant } from "./fieldVariants";

/* ---------- types ---------- */

export type Severity = "info" | "warning";

export interface FieldTip {
  primaryTip: string;
  secondaryTip?: string;
  severity: Severity;
}

export type FieldTipMap = Record<string, FieldTip>;

/* ---------- per-step evaluators ---------- */

function evaluateStep0(state: WizardFormState): FieldTipMap {
  const tips: FieldTipMap = {};
  const { title, titleChecked, type, status, year, contributorRole } = state.core;

  if (!title.trim()) {
    const v = pickFieldVariant("title_empty");
    tips["core.title"] = { primaryTip: v.text, severity: "info" };
  } else if (title.trim() && /^[a-z]/.test(title.trim())) {
    const v = pickFieldVariant("title_lowercase");
    tips["core.title"] = { primaryTip: v.text, severity: "warning" };
  } else if (title.trim() && !titleChecked) {
    const v = pickFieldVariant("title_not_verified");
    tips["core.title"] = { primaryTip: v.text, severity: "info" };
  }

  if (type === "") {
    const v = pickFieldVariant("type_empty");
    tips["core.type"] = { primaryTip: v.text, severity: "info" };
  }

  if (status === "") {
    const v = pickFieldVariant("status_empty");
    tips["core.status"] = { primaryTip: v.text, severity: "info" };
  }

  if (year == null) {
    const v = pickFieldVariant("year_missing");
    tips["core.year"] = { primaryTip: v.text, severity: "info" };
  } else if (year > new Date().getFullYear() + 5) {
    const v = pickFieldVariant("year_future");
    tips["core.year"] = { primaryTip: v.text, severity: "warning" };
  }

  if (contributorRole === "") {
    const v = pickFieldVariant("role_empty");
    tips["core.contributorRole"] = { primaryTip: v.text, severity: "info" };
  }

  return tips;
}

function evaluateStep1(state: WizardFormState): FieldTipMap {
  const tips: FieldTipMap = {};
  const { miscLinks, releaseDates } = state.mandatory;

  if (miscLinks.length === 0) {
    const v = pickFieldVariant("evidence_empty");
    tips["mandatory.evidence"] = { primaryTip: v.text, severity: "warning" };
  } else if (miscLinks.some((l) => l.url.length > 0 && !/^https?:\/\//.test(l.url))) {
    const v = pickFieldVariant("evidence_url_invalid");
    tips["mandatory.evidence"] = { primaryTip: v.text, severity: "warning" };
  }

  if (releaseDates.length === 0) {
    const v = pickFieldVariant("release_date_empty");
    tips["mandatory.releaseDates"] = { primaryTip: v.text, severity: "warning" };
  } else if (releaseDates.some((d) => !d.country || !d.month || !d.year)) {
    const v = pickFieldVariant("release_date_incomplete");
    tips["mandatory.releaseDates"] = { primaryTip: v.text, severity: "info" };
  }

  return tips;
}

function evaluateStep2(state: WizardFormState): FieldTipMap {
  const tips: FieldTipMap = {};
  const { countriesOfOrigin, languages, genres } = state.identity;

  if (countriesOfOrigin.length === 0) {
    const v = pickFieldVariant("countries_empty");
    tips["identity.countries"] = { primaryTip: v.text, severity: "info" };
  }

  if (languages.length === 0) {
    const v = pickFieldVariant("languages_empty");
    tips["identity.languages"] = { primaryTip: v.text, severity: "info" };
  }

  if (genres.length === 0) {
    const v = pickFieldVariant("genres_empty");
    tips["identity.genres"] = { primaryTip: v.text, severity: "info" };
  } else if (genres.length > 5) {
    const v = pickFieldVariant("genres_many");
    tips["identity.genres"] = { primaryTip: v.text, severity: "warning" };
  }

  return tips;
}

function evaluateStep3(state: WizardFormState): FieldTipMap {
  const tips: FieldTipMap = {};
  const { budget, directors } = state.production;

  if (budget.amount == null) {
    const v = pickFieldVariant("budget_missing");
    tips["production.budget"] = { primaryTip: v.text, severity: "info" };
  } else if (budget.amount < 1000) {
    const v = pickFieldVariant("budget_low");
    tips["production.budget"] = { primaryTip: v.text, severity: "warning" };
  }

  if (directors.length === 0) {
    const v = pickFieldVariant("directors_empty");
    tips["production.directors"] = { primaryTip: v.text, severity: "warning" };
  }

  return tips;
}

function evaluateStep4(state: WizardFormState): FieldTipMap {
  const tips: FieldTipMap = {};
  const mc = state.credits.majorCredits;
  const filled = Object.values(mc).filter((v) => v > 0).length;

  if (filled < 3) {
    const v = pickFieldVariant("credits_incomplete");
    tips["credits.major"] = { primaryTip: v.text, severity: "warning" };
  }

  return tips;
}

/* ---------- main export ---------- */

const STEP_EVALUATORS = [
  evaluateStep0,
  evaluateStep1,
  evaluateStep2,
  evaluateStep3,
  evaluateStep4,
];

export function evaluateFieldTips(
  state: WizardFormState,
  step: number,
): FieldTipMap {
  const evaluator = STEP_EVALUATORS[step];
  if (!evaluator) return {};
  return evaluator(state);
}
