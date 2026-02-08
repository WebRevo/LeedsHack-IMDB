import type { WizardFormState } from "@/store/types";

/* =========================================================
   Assistant Intent Types
   ========================================================= */

export type AssistantIntent =
  | "MISSING_EVIDENCE"
  | "MISSING_RELEASE_DATE"
  | "CREDITS_REQUIRED"
  | "YEAR_FORMAT"
  | "TYPE_SUBTYPE_MISMATCH"
  | "TITLE_CAPITALIZATION"
  | "NEXT_BEST_ACTION"
  | "ALMOST_READY"
  | "IDLE_NUDGE"
  | "SUCCESS_ACK";

/* ---- Signal flags derived from form state ---- */

export interface FormSignals {
  missingEvidence: boolean;
  missingReleaseDate: boolean;
  yearInvalid: boolean;
  titleLowercase: boolean;
  typeSubtypeMismatch: boolean;
  creditsIncomplete: boolean;
  titleMissing: boolean;
  typeMissing: boolean;
  statusMissing: boolean;
  roleMissing: boolean;
  countriesMissing: boolean;
  languagesMissing: boolean;
  genresMissing: boolean;
  budgetMissing: boolean;
}

export interface EvaluationResult {
  confidence: number;
  blockers: AssistantIntent[];
  warnings: AssistantIntent[];
  suggestions: AssistantIntent[];
  nextBestAction: string;
  signals: FormSignals;
}

/* =========================================================
   evaluateForm — derives signals from wizard store state
   ========================================================= */

export function evaluateForm(state: WizardFormState): EvaluationResult {
  const { core, mandatory, identity, production, credits, meta } = state;

  const mc = credits.majorCredits;
  const filledCredits = Object.values(mc).filter((v) => v > 0).length;

  const signals: FormSignals = {
    missingEvidence: mandatory.miscLinks.length === 0,
    missingReleaseDate: mandatory.releaseDates.length === 0,
    yearInvalid: core.year == null,
    titleLowercase:
      core.title.length > 0 &&
      core.title[0] !== core.title[0].toUpperCase(),
    typeSubtypeMismatch:
      core.type === "musicVideo" && core.subtype === "featureLength",
    creditsIncomplete: filledCredits < 3,
    titleMissing: core.title.trim().length === 0,
    typeMissing: core.type === "",
    statusMissing: core.status === "",
    roleMissing: core.contributorRole === "",
    countriesMissing: identity.countriesOfOrigin.length === 0,
    languagesMissing: identity.languages.length === 0,
    genresMissing: identity.genres.length === 0,
    budgetMissing:
      production.budget.amount == null || production.budget.currency === "",
  };

  const blockers: AssistantIntent[] = [];
  const warnings: AssistantIntent[] = [];

  if (signals.missingEvidence) blockers.push("MISSING_EVIDENCE");
  if (signals.missingReleaseDate) blockers.push("MISSING_RELEASE_DATE");
  if (signals.creditsIncomplete) blockers.push("CREDITS_REQUIRED");
  if (signals.yearInvalid) blockers.push("YEAR_FORMAT");
  if (signals.typeSubtypeMismatch) blockers.push("TYPE_SUBTYPE_MISMATCH");
  if (signals.titleLowercase) warnings.push("TITLE_CAPITALIZATION");

  // Determine next best action
  const nextBestAction = deriveNextAction(signals);

  return {
    confidence: meta.confidenceScore,
    blockers,
    warnings,
    suggestions: nextBestAction ? ["NEXT_BEST_ACTION"] : [],
    nextBestAction,
    signals,
  };
}

/* ---- Helper: what should the user do next? ---- */

function deriveNextAction(signals: FormSignals): string {
  if (signals.titleMissing) return "Enter a title for your submission";
  if (signals.typeMissing) return "Select a title type";
  if (signals.statusMissing) return "Set the release status";
  if (signals.yearInvalid) return "Add the release year";
  if (signals.roleMissing) return "Choose your contributor role";
  if (signals.missingEvidence) return "Add an evidence link";
  if (signals.missingReleaseDate) return "Add at least one release date";
  if (signals.countriesMissing) return "Add a country of origin";
  if (signals.languagesMissing) return "Add at least one language";
  if (signals.genresMissing) return "Select at least one genre";
  if (signals.budgetMissing) return "Enter the production budget";
  if (signals.creditsIncomplete) return "Fill in at least 3 credit categories";
  return "";
}

/* =========================================================
   selectIntent — picks primary + secondary intents
   ========================================================= */

export interface IntentSelection {
  primary: AssistantIntent;
  secondary: AssistantIntent[];
}

export interface AssistantMemorySnapshot {
  recentFixes: string[];
  frustrationScore: number;
  idleSince: number;
  isOnCooldown: (intent: AssistantIntent) => boolean;
}

export function selectIntent(
  evaluation: EvaluationResult,
  memory: AssistantMemorySnapshot,
): IntentSelection | null {
  const { blockers, warnings, suggestions, confidence } = evaluation;
  const now = Date.now();
  const idleMs = memory.idleSince > 0 ? now - memory.idleSince : 0;

  // Check for recent fixes → SUCCESS_ACK
  if (memory.recentFixes.length > 0 && !memory.isOnCooldown("SUCCESS_ACK")) {
    const remaining = [
      ...blockers.filter((b) => !memory.isOnCooldown(b)),
      ...warnings.filter((w) => !memory.isOnCooldown(w)),
    ];
    return { primary: "SUCCESS_ACK", secondary: remaining.slice(0, 2) };
  }

  // Priority 1: Blockers
  const activeBlockers = blockers.filter((b) => !memory.isOnCooldown(b));
  if (activeBlockers.length > 0) {
    return {
      primary: activeBlockers[0],
      secondary: [...activeBlockers.slice(1), ...warnings].slice(0, 2),
    };
  }

  // Priority 2: Warnings
  const activeWarnings = warnings.filter((w) => !memory.isOnCooldown(w));
  if (activeWarnings.length > 0) {
    return {
      primary: activeWarnings[0],
      secondary: activeWarnings.slice(1, 3),
    };
  }

  // Priority 3: Next best action
  if (suggestions.length > 0 && !memory.isOnCooldown("NEXT_BEST_ACTION")) {
    return { primary: "NEXT_BEST_ACTION", secondary: [] };
  }

  // Priority 4: Encouragement
  if (confidence >= 80 && !memory.isOnCooldown("ALMOST_READY")) {
    return { primary: "ALMOST_READY", secondary: [] };
  }

  if (idleMs > 20_000 && !memory.isOnCooldown("IDLE_NUDGE")) {
    return { primary: "IDLE_NUDGE", secondary: [] };
  }

  return null;
}
