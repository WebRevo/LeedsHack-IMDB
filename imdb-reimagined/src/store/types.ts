/* =========================================================
   IMDb New-Title Wizard — Form Schema
   ========================================================= */

/* ---------- enums / unions ---------- */

export type TitleType =
  | "film"
  | "madeForTv"
  | "madeForVideo"
  | "musicVideo"
  | "podcastSeries"
  | "videoGame"
  | "";

export type TitleSubtype =
  | "featureLength"
  | "shortSubject"
  | "";

export type TitleStatus =
  | "released"
  | "limitedScreenings"
  | "completedNotShown"
  | "notComplete"
  | "";

export type ContributorRole =
  | "producerDirectorWriter"
  | "castCrew"
  | "publicist"
  | "noneOfAbove"
  | "";

export type ColorFormat = "color" | "blackAndWhite" | "";

/* ---------- row types for arrays ---------- */

export type ReleaseType =
  | "theatrical"
  | "digital"
  | "physical"
  | "tv"
  | "festival"
  | "";

export interface ReleaseDate {
  id: string;
  country: string;
  day: string;
  month: string;
  year: string;
  releaseType: ReleaseType;
  note: string;
}

export interface MiscLink {
  id: string;
  label: string;
  url: string;
}

export interface Budget {
  currency: string;
  amount: number | null;
}

export interface OfficialSite {
  id: string;
  url: string;
  description: string;
}

export interface ProductionDirector {
  id: string;
  name: string;
  role: string;
  attribute: string;
}

export interface Distributor {
  id: string;
  companyName: string;
  region: string;
  year: string;
  distributionType: string;
  attribute: string;
}

export interface ProductionCompany {
  id: string;
  companyName: string;
  attribute: string;
}

/* ---------- step slices ---------- */

export interface StepCore {
  title: string;
  titleChecked: boolean;
  type: TitleType;
  subtype: TitleSubtype;
  status: TitleStatus;
  year: number | null;
  contributorRole: ContributorRole;
}

export interface StepMandatory {
  releaseDates: ReleaseDate[];
  miscLinks: MiscLink[];
}

export interface StepIdentity {
  countriesOfOrigin: string[];
  languages: string[];
  colorFormat: ColorFormat;
  colorAttribute: string;
  genres: string[];
}

export interface StepProduction {
  budget: Budget;
  officialSites: OfficialSite[];
  directors: ProductionDirector[];
  distributors: Distributor[];
  productionCompanies: ProductionCompany[];
}

export interface MajorCreditCounts {
  cast: number;
  self: number;
  writers: number;
  producers: number;
  composers: number;
  cinematographers: number;
  editors: number;
}

export interface RecommendedInfoCounts {
  certificates: number;
  runningTimes: number;
  filmingLocations: number;
  soundMix: number;
  aspectRatio: number;
  taglines: number;
  plotOutlines: number;
  plotSummaries: number;
  keywords: number;
  trivia: number;
}

export interface StepCredits {
  majorCredits: MajorCreditCounts;
  recommendedInfo: RecommendedInfoCounts;
}

/* ---------- meta ---------- */

export interface Warning {
  id: string;
  field: string;
  message: string;
}

export interface Assumption {
  id: string;
  field: string;
  value: string;
  message: string;
}

export interface FormMeta {
  confidenceScore: number;
  warnings: Warning[];
  assumptions: Assumption[];
}

/* ---------- full form state ---------- */

export interface WizardFormState {
  core: StepCore;
  mandatory: StepMandatory;
  identity: StepIdentity;
  production: StepProduction;
  credits: StepCredits;
  meta: FormMeta;
}

/* ---------- initial/empty values ---------- */

export const EMPTY_FORM: WizardFormState = {
  core: {
    title: "",
    titleChecked: false,
    type: "",
    subtype: "",
    status: "",
    year: null,
    contributorRole: "",
  },
  mandatory: {
    releaseDates: [],
    miscLinks: [],
  },
  identity: {
    countriesOfOrigin: [],
    languages: [],
    colorFormat: "",
    colorAttribute: "",
    genres: [],
  },
  production: {
    budget: { currency: "USD", amount: null },
    officialSites: [],
    directors: [],
    distributors: [],
    productionCompanies: [],
  },
  credits: {
    majorCredits: {
      cast: 0,
      self: 0,
      writers: 0,
      producers: 0,
      composers: 0,
      cinematographers: 0,
      editors: 0,
    },
    recommendedInfo: {
      certificates: 0,
      runningTimes: 0,
      filmingLocations: 0,
      soundMix: 0,
      aspectRatio: 0,
      taglines: 0,
      plotOutlines: 0,
      plotSummaries: 0,
      keywords: 0,
      trivia: 0,
    },
  },
  meta: {
    confidenceScore: 0,
    warnings: [],
    assumptions: [],
  },
};
