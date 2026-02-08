import type { AssistantIntent } from "./intents";

/* =========================================================
   Auto-fix Actions — deterministic store mutations
   ========================================================= */

/* ---- Generic store shape we need ---- */

interface WizardStoreActions {
  updateCore: (partial: { title?: string; year?: number | null }) => void;
  addReleaseDate: (row: {
    id: string;
    country: string;
    day: string;
    month: string;
    year: string;
    releaseType: "" | "theatrical" | "digital" | "physical" | "tv" | "festival";
    note: string;
  }) => void;
  addMiscLink: (row: { id: string; label: string; url: string }) => void;
  addAssumption: (a: {
    id: string;
    field: string;
    value: string;
    message: string;
  }) => void;
  core: { title: string };
}

/* ---- Title Case helper ---- */

function toTitleCase(str: string): string {
  return str.replace(
    /\b\w+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );
}

/* ---- Fix: capitalize title ---- */

export function fixTitleCapitalization(store: WizardStoreActions): void {
  const fixed = toTitleCase(store.core.title);
  store.updateCore({ title: fixed });
}

/* ---- Fix: set unknown year ---- */

export function setUnknownYear(store: WizardStoreActions): void {
  store.updateCore({ year: 9999 });
  store.addAssumption({
    id: `autofix-year-${Date.now()}`,
    field: "year",
    value: "????",
    message: "Year set to unknown (????) by editorial assistant",
  });
}

/* ---- Fix: add empty release date ---- */

export function addEmptyReleaseDate(store: WizardStoreActions): void {
  store.addReleaseDate({
    id: `autofix-rd-${Date.now()}`,
    country: "",
    day: "",
    month: "",
    year: "",
    releaseType: "",
    note: "",
  });
}

/* ---- Fix: add empty evidence link ---- */

export function addEmptyEvidenceLink(store: WizardStoreActions): void {
  store.addMiscLink({
    id: `autofix-ml-${Date.now()}`,
    label: "",
    url: "",
  });
}

/* =========================================================
   getAutofix — maps intent to an auto-fix action
   Returns null if no auto-fix is available for this intent
   ========================================================= */

export interface AutofixAction {
  label: string;
  action: (store: WizardStoreActions) => void;
  fixId: string;
  targetStep: number; // which wizard step to navigate to
}

export function getAutofix(intent: AssistantIntent): AutofixAction | null {
  switch (intent) {
    case "TITLE_CAPITALIZATION":
      return {
        label: "Capitalize title",
        action: fixTitleCapitalization,
        fixId: "fix-title-cap",
        targetStep: 0,
      };
    case "YEAR_FORMAT":
      return {
        label: "Set year as unknown",
        action: setUnknownYear,
        fixId: "fix-unknown-year",
        targetStep: 0,
      };
    case "MISSING_RELEASE_DATE":
      return {
        label: "Add release date",
        action: addEmptyReleaseDate,
        fixId: "fix-add-release-date",
        targetStep: 1,
      };
    case "MISSING_EVIDENCE":
      return {
        label: "Add evidence link",
        action: addEmptyEvidenceLink,
        fixId: "fix-add-evidence",
        targetStep: 1,
      };
    default:
      return null;
  }
}
