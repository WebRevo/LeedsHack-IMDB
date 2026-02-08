import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WizardFormState,
  StepCore,
  StepMandatory,
  StepIdentity,
  StepProduction,
  StepCredits,
  FormMeta,
  TitleType,
  TitleSubtype,
  TitleStatus,
  ContributorRole,
  ReleaseType,
  ReleaseDate,
  MiscLink,
  OfficialSite,
  ProductionDirector,
  Distributor,
  ProductionCompany,
  Warning,
  Assumption,
} from "./types";
import { EMPTY_FORM } from "./types";

/* =========================================================
   Store shape
   ========================================================= */

interface WizardStore extends WizardFormState {
  /* ---- scalar field updaters ---- */
  updateCore: (partial: Partial<StepCore>) => void;
  updateMandatory: (partial: Partial<StepMandatory>) => void;
  updateIdentity: (partial: Partial<StepIdentity>) => void;
  updateProduction: (partial: Partial<StepProduction>) => void;
  updateCredits: (partial: Partial<StepCredits>) => void;
  updateMeta: (partial: Partial<FormMeta>) => void;

  /* ---- mandatory array helpers ---- */
  addReleaseDate: (row: ReleaseDate) => void;
  removeReleaseDate: (id: string) => void;
  addMiscLink: (row: MiscLink) => void;
  removeMiscLink: (id: string) => void;

  /* ---- identity string-array helpers ---- */
  addCountry: (country: string) => void;
  removeCountry: (country: string) => void;
  addLanguage: (language: string) => void;
  removeLanguage: (language: string) => void;
  addGenre: (genre: string) => void;
  removeGenre: (genre: string) => void;

  /* ---- production array helpers ---- */
  addOfficialSite: (site: OfficialSite) => void;
  removeOfficialSite: (id: string) => void;
  addProductionDirector: (dir: ProductionDirector) => void;
  removeProductionDirector: (id: string) => void;
  addDistributor: (dist: Distributor) => void;
  removeDistributor: (id: string) => void;
  addProductionCompany: (co: ProductionCompany) => void;
  removeProductionCompany: (id: string) => void;

  /* ---- warning / assumption helpers ---- */
  addWarning: (w: Warning) => void;
  removeWarning: (id: string) => void;
  addAssumption: (a: Assumption) => void;
  removeAssumption: (id: string) => void;

  /* ---- voice merge ---- */
  mergeVoiceParsed: (data: Record<string, unknown>, assumptions: string[]) => void;

  /* ---- bulk ---- */
  resetForm: () => void;
  fillMockData: () => void;
  hydrateForm: (data: WizardFormState) => void;
}

/* =========================================================
   Mock data
   ========================================================= */

const MOCK_DATA: WizardFormState = {
  core: {
    title: "The Last Horizon",
    titleChecked: true,
    type: "film",
    subtype: "featureLength",
    status: "released",
    year: 2026,
    contributorRole: "producerDirectorWriter",
  },
  mandatory: {
    releaseDates: [
      {
        id: "rd-1",
        country: "United States",
        day: "18",
        month: "07",
        year: "2026",
        releaseType: "theatrical",
        note: "",
      },
      {
        id: "rd-2",
        country: "United Kingdom",
        day: "01",
        month: "08",
        year: "2026",
        releaseType: "theatrical",
        note: "Limited release",
      },
    ],
    miscLinks: [
      {
        id: "ml-1",
        label: "Official Site",
        url: "https://thelasthorizon.movie",
      },
    ],
  },
  identity: {
    countriesOfOrigin: ["United States", "United Kingdom"],
    languages: ["English", "French"],
    colorFormat: "color",
    colorAttribute: "",
    genres: ["Action", "Sci-Fi", "Drama"],
  },
  production: {
    budget: { currency: "USD", amount: 45_000_000 },
    officialSites: [
      { id: "os-1", url: "https://thelasthorizon.movie", description: "Official Website" },
    ],
    directors: [
      { id: "pd-1", name: "Ava Chen", role: "Director", attribute: "" },
    ],
    distributors: [
      { id: "dist-1", companyName: "Universal Pictures", region: "worldwide", year: "2026", distributionType: "theatrical", attribute: "" },
    ],
    productionCompanies: [
      { id: "pc-1", companyName: "Horizon Films", attribute: "Production" },
    ],
  },
  credits: {
    majorCredits: {
      cast: 5,
      self: 0,
      writers: 2,
      producers: 3,
      composers: 1,
      cinematographers: 1,
      editors: 0,
    },
    recommendedInfo: {
      certificates: 1,
      runningTimes: 1,
      filmingLocations: 3,
      soundMix: 1,
      aspectRatio: 1,
      taglines: 2,
      plotOutlines: 1,
      plotSummaries: 1,
      keywords: 5,
      trivia: 0,
    },
  },
  meta: {
    confidenceScore: 87,
    warnings: [
      {
        id: "w-1",
        field: "budget",
        message: "Budget not verified by a second source",
      },
    ],
    assumptions: [
      {
        id: "a-1",
        field: "status",
        value: "released",
        message: "Status inferred from announced release date",
      },
    ],
  },
};

/* =========================================================
   Confidence computation — purely completion-based
   ========================================================= */

const CONFIDENCE_WEIGHTS: { test: (s: WizardFormState) => boolean; weight: number }[] = [
  { test: (s) => s.core.title.length > 0, weight: 12 },
  { test: (s) => s.core.type !== "", weight: 8 },
  { test: (s) => s.core.subtype !== "", weight: 4 },
  { test: (s) => s.core.status !== "", weight: 4 },
  { test: (s) => s.core.year != null, weight: 8 },
  { test: (s) => s.core.contributorRole !== "", weight: 4 },
  { test: (s) => s.mandatory.releaseDates.length > 0, weight: 8 },
  { test: (s) => s.mandatory.miscLinks.length > 0, weight: 5 },
  { test: (s) => s.identity.countriesOfOrigin.length > 0, weight: 6 },
  { test: (s) => s.identity.languages.length > 0, weight: 5 },
  { test: (s) => s.identity.colorFormat !== "", weight: 2 },
  { test: (s) => s.identity.genres.length > 0, weight: 4 },
  { test: (s) => s.production.budget.amount != null, weight: 5 },
  { test: (s) => s.production.officialSites.length > 0, weight: 2 },
  { test: (s) => s.production.directors.length > 0, weight: 5 },
  { test: (s) => s.production.distributors.length > 0, weight: 3 },
  { test: (s) => s.production.productionCompanies.length > 0, weight: 3 },
  { test: (s) => {
    const mc = s.credits.majorCredits;
    const filled = Object.values(mc).filter((v) => v > 0).length;
    return filled >= 3;
  }, weight: 10 },
  { test: (s) => {
    const ri = s.credits.recommendedInfo;
    return Object.values(ri).some((v) => v > 0);
  }, weight: 2 },
];

function computeConfidence(s: WizardFormState): number {
  let score = 0;
  for (const w of CONFIDENCE_WEIGHTS) {
    if (w.test(s)) score += w.weight;
  }
  return Math.min(score, 100);
}

/* =========================================================
   Store creation
   ========================================================= */

export const useWizardStore = create<WizardStore>()(
  persist(
    (rawSet, get) => {
      // Wrap set so every mutation also recomputes confidence
      const set = (
        updater:
          | Partial<WizardStore>
          | ((s: WizardStore) => Partial<WizardStore>),
      ) => {
        rawSet(updater);
        const next = get();
        const score = computeConfidence(next);
        if (next.meta.confidenceScore !== score) {
          rawSet({ meta: { ...next.meta, confidenceScore: score } });
        }
      };

      return {
      ...EMPTY_FORM,

      /* ---- scalar updaters ---- */

      updateCore: (partial) =>
        set((s) => ({ core: { ...s.core, ...partial } })),

      updateMandatory: (partial) =>
        set((s) => ({ mandatory: { ...s.mandatory, ...partial } })),

      updateIdentity: (partial) =>
        set((s) => ({ identity: { ...s.identity, ...partial } })),

      updateProduction: (partial) =>
        set((s) => ({ production: { ...s.production, ...partial } })),

      updateCredits: (partial) =>
        set((s) => ({ credits: { ...s.credits, ...partial } })),

      updateMeta: (partial) =>
        set((s) => ({ meta: { ...s.meta, ...partial } })),

      /* ---- release dates ---- */

      addReleaseDate: (row) =>
        set((s) => ({
          mandatory: {
            ...s.mandatory,
            releaseDates: [...s.mandatory.releaseDates, row],
          },
        })),

      removeReleaseDate: (id) =>
        set((s) => ({
          mandatory: {
            ...s.mandatory,
            releaseDates: s.mandatory.releaseDates.filter((r) => r.id !== id),
          },
        })),

      /* ---- misc links ---- */

      addMiscLink: (row) =>
        set((s) => ({
          mandatory: {
            ...s.mandatory,
            miscLinks: [...s.mandatory.miscLinks, row],
          },
        })),

      removeMiscLink: (id) =>
        set((s) => ({
          mandatory: {
            ...s.mandatory,
            miscLinks: s.mandatory.miscLinks.filter((l) => l.id !== id),
          },
        })),

      /* ---- identity string arrays ---- */

      addCountry: (country) =>
        set((s) => ({
          identity: {
            ...s.identity,
            countriesOfOrigin: s.identity.countriesOfOrigin.includes(country)
              ? s.identity.countriesOfOrigin
              : [...s.identity.countriesOfOrigin, country],
          },
        })),

      removeCountry: (country) =>
        set((s) => ({
          identity: {
            ...s.identity,
            countriesOfOrigin: s.identity.countriesOfOrigin.filter(
              (c) => c !== country,
            ),
          },
        })),

      addLanguage: (language) =>
        set((s) => ({
          identity: {
            ...s.identity,
            languages: s.identity.languages.includes(language)
              ? s.identity.languages
              : [...s.identity.languages, language],
          },
        })),

      removeLanguage: (language) =>
        set((s) => ({
          identity: {
            ...s.identity,
            languages: s.identity.languages.filter((l) => l !== language),
          },
        })),

      addGenre: (genre) =>
        set((s) => ({
          identity: {
            ...s.identity,
            genres: s.identity.genres.includes(genre)
              ? s.identity.genres
              : [...s.identity.genres, genre],
          },
        })),

      removeGenre: (genre) =>
        set((s) => ({
          identity: {
            ...s.identity,
            genres: s.identity.genres.filter((g) => g !== genre),
          },
        })),

      /* ---- production arrays ---- */

      addOfficialSite: (site) =>
        set((s) => ({
          production: {
            ...s.production,
            officialSites: [...s.production.officialSites, site],
          },
        })),

      removeOfficialSite: (id) =>
        set((s) => ({
          production: {
            ...s.production,
            officialSites: s.production.officialSites.filter((x) => x.id !== id),
          },
        })),

      addProductionDirector: (dir) =>
        set((s) => ({
          production: {
            ...s.production,
            directors: [...s.production.directors, dir],
          },
        })),

      removeProductionDirector: (id) =>
        set((s) => ({
          production: {
            ...s.production,
            directors: s.production.directors.filter((x) => x.id !== id),
          },
        })),

      addDistributor: (dist) =>
        set((s) => ({
          production: {
            ...s.production,
            distributors: [...s.production.distributors, dist],
          },
        })),

      removeDistributor: (id) =>
        set((s) => ({
          production: {
            ...s.production,
            distributors: s.production.distributors.filter((x) => x.id !== id),
          },
        })),

      addProductionCompany: (co) =>
        set((s) => ({
          production: {
            ...s.production,
            productionCompanies: [...s.production.productionCompanies, co],
          },
        })),

      removeProductionCompany: (id) =>
        set((s) => ({
          production: {
            ...s.production,
            productionCompanies: s.production.productionCompanies.filter((x) => x.id !== id),
          },
        })),

      /* ---- warnings / assumptions ---- */

      addWarning: (w) =>
        set((s) => ({
          meta: { ...s.meta, warnings: [...s.meta.warnings, w] },
        })),

      removeWarning: (id) =>
        set((s) => ({
          meta: {
            ...s.meta,
            warnings: s.meta.warnings.filter((w) => w.id !== id),
          },
        })),

      addAssumption: (a) =>
        set((s) => ({
          meta: { ...s.meta, assumptions: [...s.meta.assumptions, a] },
        })),

      removeAssumption: (id) =>
        set((s) => ({
          meta: {
            ...s.meta,
            assumptions: s.meta.assumptions.filter((a) => a.id !== id),
          },
        })),

      /* ---- voice merge ---- */

      mergeVoiceParsed: (data: Record<string, unknown>, rawAssumptions: string[]) =>
        set((s) => {
          const next = { ...s } as Record<string, unknown>;

          // Merge core (only non-empty fields, don't overwrite user edits)
          const dc = data.core as Record<string, unknown> | undefined;
          if (dc && typeof dc === "object") {
            const corePatch: Partial<StepCore> = {};
            if (typeof dc.title === "string" && dc.title && !s.core.title)
              corePatch.title = dc.title;
            if (typeof dc.type === "string" && dc.type && !s.core.type)
              corePatch.type = dc.type as TitleType;
            if (typeof dc.subtype === "string" && dc.subtype && !s.core.subtype)
              corePatch.subtype = dc.subtype as TitleSubtype;
            if (typeof dc.status === "string" && dc.status && !s.core.status)
              corePatch.status = dc.status as TitleStatus;
            if (typeof dc.year === "number" && dc.year && s.core.year == null)
              corePatch.year = dc.year;
            if (typeof dc.contributorRole === "string" && dc.contributorRole && !s.core.contributorRole)
              corePatch.contributorRole = dc.contributorRole as ContributorRole;
            if (Object.keys(corePatch).length > 0)
              next.core = { ...s.core, ...corePatch };
          }

          // Merge identity (append, don't duplicate)
          const di = data.identity as Record<string, unknown> | undefined;
          if (di && typeof di === "object") {
            const idPatch: Partial<StepIdentity> = {};
            if (Array.isArray(di.countriesOfOrigin)) {
              const existing = new Set(s.identity.countriesOfOrigin);
              const newItems = (di.countriesOfOrigin as string[]).filter(
                (c) => typeof c === "string" && c && !existing.has(c),
              );
              if (newItems.length > 0)
                idPatch.countriesOfOrigin = [...s.identity.countriesOfOrigin, ...newItems];
            }
            if (Array.isArray(di.languages)) {
              const existing = new Set(s.identity.languages);
              const newItems = (di.languages as string[]).filter(
                (l) => typeof l === "string" && l && !existing.has(l),
              );
              if (newItems.length > 0)
                idPatch.languages = [...s.identity.languages, ...newItems];
            }
            if (Array.isArray(di.genres)) {
              const existing = new Set(s.identity.genres);
              const newItems = (di.genres as string[]).filter(
                (g) => typeof g === "string" && g && !existing.has(g),
              );
              if (newItems.length > 0)
                idPatch.genres = [...s.identity.genres, ...newItems];
            }
            if (Object.keys(idPatch).length > 0)
              next.identity = { ...s.identity, ...idPatch };
          }

          // Merge mandatory — append release dates
          const dm = data.mandatory as Record<string, unknown> | undefined;
          if (dm && typeof dm === "object" && Array.isArray(dm.releaseDates)) {
            const newRds: ReleaseDate[] = (dm.releaseDates as Record<string, string>[])
              .filter((rd) => rd && typeof rd === "object" && rd.country)
              .map((rd, i) => ({
                id: `voice-rd-${Date.now()}-${i}`,
                country: rd.country || "",
                day: rd.day || "",
                month: rd.month || "",
                year: rd.year || "",
                releaseType: (rd.releaseType || "") as ReleaseType,
                note: rd.note || "",
              }));
            if (newRds.length > 0)
              next.mandatory = {
                ...s.mandatory,
                releaseDates: [...s.mandatory.releaseDates, ...newRds],
              };
          }

          // Merge production — budget + append directors
          const dp = data.production as Record<string, unknown> | undefined;
          if (dp && typeof dp === "object") {
            // Budget merge — only fill if user hasn't set values
            const dpBudget = dp.budget as Record<string, unknown> | undefined;
            if (dpBudget && typeof dpBudget === "object") {
              const budgetPatch = { ...s.production.budget };
              let budgetChanged = false;
              if (typeof dpBudget.currency === "string" && dpBudget.currency && s.production.budget.amount == null) {
                budgetPatch.currency = dpBudget.currency;
                budgetChanged = true;
              }
              if (typeof dpBudget.amount === "number" && dpBudget.amount > 0 && s.production.budget.amount == null) {
                budgetPatch.amount = dpBudget.amount;
                budgetChanged = true;
              }
              if (budgetChanged) {
                next.production = { ...(next.production as StepProduction ?? s.production), budget: budgetPatch };
              }
            }
          }
          if (dp && typeof dp === "object" && Array.isArray(dp.directors)) {
            const newDirs: ProductionDirector[] = (dp.directors as Record<string, string>[])
              .filter((d) => d && typeof d === "object" && d.name)
              .map((d, i) => ({
                id: `voice-dir-${Date.now()}-${i}`,
                name: d.name || "",
                role: d.role || "Director",
                attribute: d.attribute || "",
              }));
            if (newDirs.length > 0)
              next.production = {
                ...s.production,
                directors: [...s.production.directors, ...newDirs],
              };
          }

          // Add voice-parsing assumptions to meta
          const newAssumptions: Assumption[] = rawAssumptions.map((msg, i) => ({
            id: `voice-a-${Date.now()}-${i}`,
            field: "voice",
            value: "",
            message: msg,
          }));
          if (newAssumptions.length > 0) {
            const current = (next.meta as FormMeta) ?? s.meta;
            next.meta = {
              ...current,
              assumptions: [...current.assumptions, ...newAssumptions],
            };
          }

          return next as Partial<WizardStore>;
        }),

      /* ---- bulk ---- */

      resetForm: () => set({ ...EMPTY_FORM }),

      fillMockData: () => set({ ...MOCK_DATA }),

      hydrateForm: (data: WizardFormState) => set({ ...data }),
    };
    },
    {
      name: "imdb-wizard-form",
    },
  ),
);
