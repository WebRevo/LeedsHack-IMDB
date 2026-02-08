"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWizardStore } from "@/store/wizardStore";
import type {
  TitleType,
  TitleSubtype,
  TitleStatus,
  ContributorRole,
  ColorFormat,
  ReleaseType,
  ReleaseDate,
  MiscLink,
  OfficialSite,
  ProductionDirector,
  Distributor,
  ProductionCompany,
  MajorCreditCounts,
  RecommendedInfoCounts,
} from "@/store/types";
import { FieldTipSlot } from "@/components/wizard/FieldTip";

/* ================================================================
   Shared helpers
   ================================================================ */

function ValidIcon({ valid }: { valid: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {valid && (
        <motion.span
          key="check"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring" as const, stiffness: 500, damping: 20 }}
          className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500"
        >
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2 6 5 9 10 3" />
          </svg>
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function Hint({ show, text }: { show: boolean; text: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="mt-1.5 text-xs text-red-400/80"
        >
          {text}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function RowCheck({ valid }: { valid: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {valid ? (
        <motion.span
          key="ok"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring" as const, stiffness: 500, damping: 20 }}
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500"
        >
          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2 6 5 9 10 3" />
          </svg>
        </motion.span>
      ) : (
        <motion.span
          key="empty"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-imdb-black/[0.08]"
        />
      )}
    </AnimatePresence>
  );
}

function RequiredMark() {
  return <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-imdb-gold" />;
}

/* Row card styling */
const rowCard =
  "rounded-xl border border-imdb-black/[0.05] bg-imdb-white/60 p-3.5 space-y-2.5";

/* ================================================================
   Step 1 constants
   ================================================================ */

const TYPE_OPTIONS: { value: TitleType; label: string }[] = [
  { value: "film", label: "Film (theatrically released)" },
  { value: "madeForTv", label: "Made for TV (TV movies & specials)" },
  { value: "madeForVideo", label: "Made for Video (straight-to-video/streaming)" },
  { value: "musicVideo", label: "Music Video" },
  { value: "podcastSeries", label: "Podcast Series" },
  { value: "videoGame", label: "Video Game" },
];

const SUBTYPE_OPTIONS: { value: TitleSubtype; label: string }[] = [
  { value: "featureLength", label: "Feature Length" },
  { value: "shortSubject", label: "Short Subject" },
];

const STATUS_OPTIONS: { value: TitleStatus; label: string }[] = [
  { value: "released", label: "Released (widely available to the public)" },
  { value: "limitedScreenings", label: "Limited screenings (festival / private only)" },
  { value: "completedNotShown", label: "Completed but not yet shown publicly" },
  { value: "notComplete", label: "Not yet complete (in production)" },
];

const ROLE_OPTIONS: { value: ContributorRole; label: string }[] = [
  { value: "producerDirectorWriter", label: "I am a producer, director, or writer of this title" },
  { value: "castCrew", label: "I am a member of the cast or crew" },
  { value: "publicist", label: "I am a publicist or representative" },
  { value: "noneOfAbove", label: "None of the above" },
];

const YEAR_RE = /^(\d{4}|\?{4})$/;

/* =========================================================
   Step 1 — Core
   ========================================================= */
export function StepBasicInfo() {
  const { title, titleChecked, type, subtype, status, year, contributorRole } =
    useWizardStore((s) => s.core);
  const updateCore = useWizardStore((s) => s.updateCore);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) =>
    setTouched((p) => ({ ...p, [field]: true }));

  const [yearRaw, setYearRaw] = useState(
    year != null ? year.toString() : "",
  );

  const titleValid = title.trim().length > 0;
  const yearValid = yearRaw === "" || YEAR_RE.test(yearRaw);
  const yearFilled = YEAR_RE.test(yearRaw);

  const handleYear = (v: string) => {
    const cleaned = v.replace(/[^0-9?]/g, "").slice(0, 4);
    setYearRaw(cleaned);
    if (/^\d{4}$/.test(cleaned)) {
      updateCore({ year: parseInt(cleaned, 10) });
    } else {
      updateCore({ year: null });
    }
  };

  const handleTitleChange = (v: string) => {
    updateCore({ title: v, titleChecked: false });
  };

  const handleVerify = () => {
    if (titleValid) {
      updateCore({ titleChecked: true });
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          Core Information
        </h2>
        <p className="mt-1 text-sm text-imdb-gray/70">
          Title, type, status, and release year.
        </p>
      </div>

      {/* Title with Verify button */}
      <div>
        <div className="flex items-center">
          <label className="label-cinema">
            Title <RequiredMark />
          </label>
          <ValidIcon valid={titleChecked} />
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={() => touch("title")}
            placeholder="e.g. The Last Horizon"
            className="input-cinema flex-1"
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={!titleValid || titleChecked}
            className={`flex h-11 shrink-0 items-center gap-1.5 rounded-xl border px-4 font-display text-[10px] uppercase tracking-widest transition-all ${
              titleChecked
                ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-600"
                : titleValid
                  ? "border-imdb-gold bg-imdb-gold/10 text-imdb-gold hover:bg-imdb-gold/20"
                  : "border-imdb-black/[0.08] text-imdb-gray/40"
            }`}
          >
            {titleChecked ? (
              <>
                <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2 6 5 9 10 3" />
                </svg>
                Verified
              </>
            ) : (
              "Verify"
            )}
          </button>
        </div>
        <Hint show={touched.title === true && !titleValid} text="Title is required" />
        {titleValid && !titleChecked && (
          <p className="mt-1.5 text-xs text-amber-500/80">
            Please verify the title before proceeding
          </p>
        )}
        <FieldTipSlot fieldId="core.title" />
      </div>

      {/* Title Type */}
      <div>
        <label className="label-cinema">
          Title Type <RequiredMark />
        </label>
        <select
          value={type}
          onChange={(e) => updateCore({ type: e.target.value as TitleType })}
          className="select-cinema mt-2"
        >
          <option value="">Select type...</option>
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <FieldTipSlot fieldId="core.type" />
      </div>

      {/* Sub-type — only shown after type is selected */}
      <AnimatePresence>
        {type !== "" && (
          <motion.div
            key="subtype"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div>
              <label className="label-cinema">
                Sub-type
              </label>
              <select
                value={subtype}
                onChange={(e) => updateCore({ subtype: e.target.value as TitleSubtype })}
                className="select-cinema mt-2"
              >
                <option value="">Select sub-type...</option>
                {SUBTYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status */}
      <div>
        <label className="label-cinema">
          Status <RequiredMark />
        </label>
        <select
          value={status}
          onChange={(e) => updateCore({ status: e.target.value as TitleStatus })}
          className="select-cinema mt-2"
        >
          <option value="">Select status...</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <FieldTipSlot fieldId="core.status" />
      </div>

      {/* Year — only shown after status is selected */}
      <AnimatePresence>
        {status !== "" && (
          <motion.div
            key="year"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div>
              <div className="flex items-center">
                <label className="label-cinema">
                  Release Year <RequiredMark />
                </label>
                <ValidIcon valid={yearFilled} />
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={yearRaw}
                onChange={(e) => handleYear(e.target.value)}
                onBlur={() => touch("year")}
                placeholder="YYYY or ????"
                maxLength={4}
                className="input-cinema mt-2"
              />
              <Hint
                show={touched.year === true && yearRaw.length > 0 && !yearValid}
                text="Enter a 4-digit year or ????"
              />
              <FieldTipSlot fieldId="core.year" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contributor role — dropdown */}
      <div>
        <label className="label-cinema">
          I am... <RequiredMark />
        </label>
        <select
          value={contributorRole}
          onChange={(e) => updateCore({ contributorRole: e.target.value as ContributorRole })}
          className="select-cinema mt-2"
        >
          <option value="">Select your role...</option>
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <FieldTipSlot fieldId="core.contributorRole" />
      </div>
    </div>
  );
}

/* ================================================================
   Step 2 — helpers / constants
   ================================================================ */

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "France",
  "Germany", "Japan", "South Korea", "India", "Brazil", "Mexico",
  "Italy", "Spain", "China", "Sweden", "Denmark", "Norway",
];

const RELEASE_TYPE_OPTIONS: { value: ReleaseType; label: string }[] = [
  { value: "theatrical", label: "Theatrical" },
  { value: "digital", label: "Digital / Streaming" },
  { value: "physical", label: "Physical (DVD/Blu-ray)" },
  { value: "tv", label: "TV Premiere" },
  { value: "festival", label: "Festival" },
];

const MONTHS = [
  { value: "01", label: "Jan" }, { value: "02", label: "Feb" },
  { value: "03", label: "Mar" }, { value: "04", label: "Apr" },
  { value: "05", label: "May" }, { value: "06", label: "Jun" },
  { value: "07", label: "Jul" }, { value: "08", label: "Aug" },
  { value: "09", label: "Sep" }, { value: "10", label: "Oct" },
  { value: "11", label: "Nov" }, { value: "12", label: "Dec" },
];

function isReleaseDateRowValid(rd: ReleaseDate): boolean {
  return rd.country !== "" && rd.month !== "" && rd.year.length === 4 && rd.releaseType !== "";
}

const URL_RE = /^https?:\/\/.+\..+/;

function isMiscLinkRowValid(link: MiscLink): boolean {
  return URL_RE.test(link.url) && link.label.trim().length > 0;
}

let _nextRdId = Date.now();
let _nextMlId = Date.now();

/* =========================================================
   Step 2 — Mandatory
   ========================================================= */
export function StepMandatory() {
  const releaseDates = useWizardStore((s) => s.mandatory.releaseDates);
  const miscLinks = useWizardStore((s) => s.mandatory.miscLinks);
  const addReleaseDate = useWizardStore((s) => s.addReleaseDate);
  const removeReleaseDate = useWizardStore((s) => s.removeReleaseDate);
  const updateMandatory = useWizardStore((s) => s.updateMandatory);
  const addMiscLink = useWizardStore((s) => s.addMiscLink);
  const removeMiscLink = useWizardStore((s) => s.removeMiscLink);

  const [showInfoPopup, setShowInfoPopup] = useState(false);

  const patchRd = (id: string, patch: Partial<ReleaseDate>) => {
    updateMandatory({
      releaseDates: releaseDates.map((r) =>
        r.id === id ? { ...r, ...patch } : r,
      ),
    });
  };
  const patchMl = (id: string, patch: Partial<MiscLink>) => {
    updateMandatory({
      miscLinks: miscLinks.map((l) =>
        l.id === id ? { ...l, ...patch } : l,
      ),
    });
  };

  const hasValidRd = releaseDates.some(isReleaseDateRowValid);
  const hasValidMl = miscLinks.some(isMiscLinkRowValid);

  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          Mandatory Details
        </h2>
        <p className="mt-1 text-sm text-imdb-gray/70">
          At least one evidence link and one release date are required.
        </p>
      </div>

      {/* ============ A) Evidence / Misc Links (first) ============ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="label-cinema">
            Evidence Links <RequiredMark />
          </label>
          {/* Info button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowInfoPopup((p) => !p)}
              className="flex h-4 w-4 items-center justify-center rounded-full border border-imdb-gold/40 text-[10px] font-bold leading-none text-imdb-gold transition-colors hover:bg-imdb-gold/10"
            >
              i
            </button>
            <AnimatePresence>
              {showInfoPopup && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-6 z-20 w-80 rounded-xl border border-imdb-black/[0.08] bg-white p-4 shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-display text-xs font-bold uppercase tracking-widest text-imdb-black">
                      Evidence Guidelines
                    </h4>
                    <button type="button" onClick={() => setShowInfoPopup(false)} className="text-imdb-gray transition-colors hover:text-imdb-black">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 space-y-2.5 text-xs leading-relaxed text-imdb-gray">
                    <div>
                      <p className="font-semibold text-emerald-600">Suitable evidence:</p>
                      <ul className="mt-1 list-inside list-disc space-y-0.5">
                        <li>Official studio or distributor websites</li>
                        <li>Press releases or trade publications</li>
                        <li>News articles from reputable outlets</li>
                        <li>Official social media announcements</li>
                        <li>Festival or market screening listings</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-red-500">Not suitable:</p>
                      <ul className="mt-1 list-inside list-disc space-y-0.5">
                        <li>Personal blogs or fan sites</li>
                        <li>Wikipedia or other user-edited sources</li>
                        <li>Social media posts from unverified accounts</li>
                        <li>Expired or broken links</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ValidIcon valid={hasValidMl} />
          <span className="ml-auto text-xs text-imdb-gray/60">
            {miscLinks.length} {miscLinks.length === 1 ? "link" : "links"}
          </span>
        </div>
        <FieldTipSlot fieldId="mandatory.evidence" />

        <AnimatePresence initial={false}>
          {miscLinks.map((link) => {
            const rowValid = isMiscLinkRowValid(link);
            const urlBad = link.url.length > 0 && !URL_RE.test(link.url);
            const descBad = link.url.length > 0 && link.label.trim().length === 0;
            return (
              <motion.div key={link.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className={rowCard}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RowCheck valid={rowValid} />
                      <span className="text-xs text-imdb-gray/60">Evidence Link</span>
                    </div>
                    <button type="button" onClick={() => removeMiscLink(link.id)} className="text-xs text-red-400/60 transition-colors hover:text-red-400">Remove</button>
                  </div>
                  <div>
                    <label className="label-cinema-sub">URL</label>
                    <input type="url" value={link.url} onChange={(e) => patchMl(link.id, { url: e.target.value })} placeholder="https://..." className="input-cinema-sm" />
                    <Hint show={urlBad} text="Enter a valid URL starting with http:// or https://" />
                  </div>
                  <div>
                    <label className="label-cinema-sub">Description</label>
                    <input type="text" value={link.label} onChange={(e) => patchMl(link.id, { label: e.target.value })} placeholder="e.g. Official press release" className="input-cinema-sm" />
                    <Hint show={descBad} text="Add a short description for this link" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => addMiscLink({ id: `ml-${++_nextMlId}`, label: "", url: "" })}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-imdb-black/[0.08] py-2.5 text-xs text-imdb-gray/60 transition-all hover:border-imdb-gold/40 hover:text-imdb-gold"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Evidence Link
        </button>
      </div>

      {/* ============ B) Release Dates ============ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="label-cinema">
            Release Dates <RequiredMark />
          </label>
          <ValidIcon valid={hasValidRd} />
          <span className="ml-auto text-xs text-imdb-gray/60">
            {releaseDates.length} {releaseDates.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <FieldTipSlot fieldId="mandatory.releaseDates" />

        <AnimatePresence initial={false}>
          {releaseDates.map((rd) => {
            const rowValid = isReleaseDateRowValid(rd);
            return (
              <motion.div key={rd.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className={rowCard}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RowCheck valid={rowValid} />
                      <span className="text-xs text-imdb-gray/60">Release Date</span>
                    </div>
                    <button type="button" onClick={() => removeReleaseDate(rd.id)} className="text-xs text-red-400/60 transition-colors hover:text-red-400">Remove</button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <label className="label-cinema-sub">Country</label>
                      <input list={`countries-${rd.id}`} value={rd.country} onChange={(e) => patchRd(rd.id, { country: e.target.value })} placeholder="Type or select..." className="input-cinema-sm" />
                      <datalist id={`countries-${rd.id}`}>
                        {COUNTRIES.map((c) => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="label-cinema-sub">Release Type</label>
                      <select value={rd.releaseType} onChange={(e) => patchRd(rd.id, { releaseType: e.target.value as ReleaseType })} className="select-cinema-sm">
                        <option value="">Select...</option>
                        {RELEASE_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="label-cinema-sub">Day</label>
                      <input type="text" inputMode="numeric" value={rd.day} onChange={(e) => patchRd(rd.id, { day: e.target.value.replace(/\D/g, "").slice(0, 2) })} placeholder="DD" maxLength={2} className="input-cinema-sm" />
                    </div>
                    <div>
                      <label className="label-cinema-sub">Month</label>
                      <select value={rd.month} onChange={(e) => patchRd(rd.id, { month: e.target.value })} className="select-cinema-sm">
                        <option value="">--</option>
                        {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-cinema-sub">Year</label>
                      <input type="text" inputMode="numeric" value={rd.year} onChange={(e) => patchRd(rd.id, { year: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="YYYY" maxLength={4} className="input-cinema-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="label-cinema-sub">Note (optional)</label>
                    <input type="text" value={rd.note} onChange={(e) => patchRd(rd.id, { note: e.target.value })} placeholder="e.g. Limited release" className="input-cinema-sm" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => addReleaseDate({ id: `rd-${++_nextRdId}`, country: "", day: "", month: "", year: "", releaseType: "", note: "" })}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-imdb-black/[0.08] py-2.5 text-xs text-imdb-gray/60 transition-all hover:border-imdb-gold/40 hover:text-imdb-gold"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Release Date
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   Step 3 — Identity constants
   ================================================================ */

const IDENTITY_COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "France",
  "Germany", "Japan", "South Korea", "India", "Brazil", "Mexico",
  "Italy", "Spain", "China", "Sweden", "Denmark", "Norway", "Ireland",
  "New Zealand", "Netherlands", "Argentina", "Poland", "Belgium",
];

const LANGUAGES = [
  "English", "French", "Spanish", "German", "Japanese", "Korean",
  "Mandarin", "Cantonese", "Hindi", "Portuguese", "Italian", "Russian",
  "Arabic", "Swedish", "Danish", "Norwegian", "Dutch", "Polish",
];

const LANGUAGE_ATTRS = [
  { value: "", label: "None" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "subtitled", label: "Subtitled only" },
];

const COLOR_OPTIONS: { value: ColorFormat; label: string }[] = [
  { value: "color", label: "Color" },
  { value: "blackAndWhite", label: "Black & White" },
];

const GENRE_OPTIONS = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "Film-Noir", "History",
  "Horror", "Music", "Musical", "Mystery", "News", "Reality-TV",
  "Romance", "Sci-Fi", "Short", "Sport", "Talk-Show", "Thriller",
  "War", "Western",
];

/* =========================================================
   Step 3 — Identity
   ========================================================= */
export function StepIdentity() {
  const countriesOfOrigin = useWizardStore((s) => s.identity.countriesOfOrigin);
  const languages = useWizardStore((s) => s.identity.languages);
  const colorFormat = useWizardStore((s) => s.identity.colorFormat);
  const colorAttribute = useWizardStore((s) => s.identity.colorAttribute);
  const genres = useWizardStore((s) => s.identity.genres);
  const addCountry = useWizardStore((s) => s.addCountry);
  const removeCountry = useWizardStore((s) => s.removeCountry);
  const addLanguage = useWizardStore((s) => s.addLanguage);
  const removeLanguage = useWizardStore((s) => s.removeLanguage);
  const addGenre = useWizardStore((s) => s.addGenre);
  const removeGenre = useWizardStore((s) => s.removeGenre);
  const updateIdentity = useWizardStore((s) => s.updateIdentity);

  const [countryDraft, setCountryDraft] = useState("");
  const [langDraft, setLangDraft] = useState("");
  const [langAttr, setLangAttr] = useState("");
  const [genreDraft, setGenreDraft] = useState("");

  const hasCountry = countriesOfOrigin.length > 0;
  const hasLang = languages.length > 0;
  const hasGenre = genres.length > 0;

  const commitCountry = () => {
    const v = countryDraft.trim();
    if (v && !countriesOfOrigin.includes(v)) addCountry(v);
    setCountryDraft("");
  };

  const commitLang = () => {
    const base = langDraft.trim();
    if (!base) return;
    const display = langAttr ? `${base} (${langAttr})` : base;
    if (!languages.includes(display)) addLanguage(display);
    setLangDraft("");
    setLangAttr("");
  };

  const commitGenre = () => {
    const v = genreDraft.trim();
    if (v && !genres.includes(v)) addGenre(v);
    setGenreDraft("");
  };

  const addBtnClass =
    "h-9 shrink-0 rounded-xl border border-imdb-gold/30 px-3 font-display text-[10px] uppercase tracking-widest text-imdb-gold transition-all hover:bg-imdb-gold/10 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          Identity
        </h2>
        <p className="mt-1 text-sm text-imdb-gray/70">
          Countries, languages, color format, and genres.
        </p>
      </div>

      {/* ---- Countries ---- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="label-cinema">
            Countries of Origin <RequiredMark />
          </label>
          <ValidIcon valid={hasCountry} />
        </div>
        <FieldTipSlot fieldId="identity.countries" />
        {countriesOfOrigin.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {countriesOfOrigin.map((c, i) => (
              <span key={c} className="group inline-flex items-center gap-1 rounded-full border border-imdb-black/[0.06] bg-imdb-black/[0.02] py-0.5 pl-2.5 pr-1 text-xs text-imdb-black/70">
                <span className="text-imdb-gray/40 mr-0.5">{i + 1}.</span>
                {c}
                <button type="button" onClick={() => removeCountry(c)} className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-imdb-gray/40 transition-colors hover:bg-red-500/20 hover:text-red-400">&times;</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <input list="identity-countries" value={countryDraft} onChange={(e) => setCountryDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitCountry(); } }} placeholder="Type or select country..." className="input-cinema-sm" />
            <datalist id="identity-countries">
              {IDENTITY_COUNTRIES.filter((c) => !countriesOfOrigin.includes(c)).map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <button type="button" onClick={commitCountry} disabled={!countryDraft.trim()} className={addBtnClass}>Add</button>
        </div>
      </div>

      {/* ---- Languages ---- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="label-cinema">
            Languages <RequiredMark />
          </label>
          <ValidIcon valid={hasLang} />
        </div>
        <FieldTipSlot fieldId="identity.languages" />
        {languages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {languages.map((l) => (
              <span key={l} className="group inline-flex items-center gap-1 rounded-full border border-imdb-black/[0.06] bg-imdb-black/[0.02] py-0.5 pl-2.5 pr-1 text-xs text-imdb-black/70">
                {l}
                <button type="button" onClick={() => removeLanguage(l)} className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-imdb-gray/40 transition-colors hover:bg-red-500/20 hover:text-red-400">&times;</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <input list="identity-languages" value={langDraft} onChange={(e) => setLangDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitLang(); } }} placeholder="Type or select language..." className="input-cinema-sm" />
            <datalist id="identity-languages">
              {LANGUAGES.map((l) => <option key={l} value={l} />)}
            </datalist>
          </div>
          <select value={langAttr} onChange={(e) => setLangAttr(e.target.value)} className="select-cinema-sm w-32 shrink-0">
            {LANGUAGE_ATTRS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
          <button type="button" onClick={commitLang} disabled={!langDraft.trim()} className={addBtnClass}>Add</button>
        </div>
      </div>

      {/* ---- Color / Black & White ---- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="label-cinema">
            Color / Black &amp; White
          </label>
          <ValidIcon valid={colorFormat !== ""} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-cinema-sub">Format</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => updateIdentity({ colorFormat: o.value })}
                  className={`flex-1 rounded-xl border px-3 py-2.5 font-display text-xs uppercase tracking-widest transition-all ${
                    colorFormat === o.value
                      ? "border-imdb-gold bg-imdb-gold/15 text-imdb-gold shadow-[0_0_0_3px_rgba(245,197,24,0.08)]"
                      : "border-imdb-black/[0.08] text-imdb-gray hover:border-imdb-black/15 hover:text-imdb-black"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-cinema-sub">Attribute (optional)</label>
            <input
              type="text"
              value={colorAttribute}
              onChange={(e) => updateIdentity({ colorAttribute: e.target.value })}
              placeholder="e.g. Technicolor, DeLuxe"
              className="input-cinema-sm"
            />
          </div>
        </div>
      </div>

      {/* ---- Genres ---- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="label-cinema">
            Genres <RequiredMark />
          </label>
          <ValidIcon valid={hasGenre} />
          <span className="ml-auto text-xs text-imdb-gray/60">
            {genres.length} selected
          </span>
        </div>
        <FieldTipSlot fieldId="identity.genres" />

        {/* Clickable genre chips */}
        <div className="flex flex-wrap gap-1.5">
          {GENRE_OPTIONS.map((g) => {
            const selected = genres.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => selected ? removeGenre(g) : addGenre(g)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                  selected
                    ? "border-imdb-gold bg-imdb-gold/15 text-imdb-gold shadow-[0_0_0_3px_rgba(245,197,24,0.06)]"
                    : "border-imdb-black/[0.08] text-imdb-gray hover:border-imdb-black/15 hover:text-imdb-black"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* Custom genre input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={genreDraft}
            onChange={(e) => setGenreDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitGenre(); } }}
            placeholder="Add custom genre..."
            className="input-cinema-sm flex-1"
          />
          <button type="button" onClick={commitGenre} disabled={!genreDraft.trim()} className={addBtnClass}>Add</button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Step 4 — Production constants
   ================================================================ */

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "JPY", label: "JPY — Japanese Yen" },
  { value: "KRW", label: "KRW — Korean Won" },
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "CNY", label: "CNY — Chinese Yuan" },
  { value: "BRL", label: "BRL — Brazilian Real" },
];

const DISTRIBUTOR_REGIONS = [
  "worldwide", "northAmerica", "usa", "canada", "europe", "uk",
  "france", "germany", "asia", "japan", "southKorea", "china",
  "india", "latinAmerica", "australiaNz", "middleEast", "africa",
];

const DISTRIBUTOR_REGION_LABELS: Record<string, string> = {
  worldwide: "Worldwide", northAmerica: "North America", usa: "USA",
  canada: "Canada", europe: "Europe", uk: "United Kingdom",
  france: "France", germany: "Germany", asia: "Asia",
  japan: "Japan", southKorea: "South Korea", china: "China",
  india: "India", latinAmerica: "Latin America",
  australiaNz: "Australia / NZ", middleEast: "Middle East", africa: "Africa",
};

const DISTRIBUTOR_TYPES = [
  { value: "theatrical", label: "Theatrical" },
  { value: "homeVideo", label: "Home Video / DVD" },
  { value: "digital", label: "Digital / Streaming" },
  { value: "tv", label: "TV" },
  { value: "allMedia", label: "All Media" },
];

let _nextOsId = Date.now();
let _nextPdId = Date.now();
let _nextDistId = Date.now();
let _nextPcId = Date.now();

/* =========================================================
   Step 4 — Production
   ========================================================= */
export function StepProduction() {
  const budget = useWizardStore((s) => s.production.budget);
  const officialSites = useWizardStore((s) => s.production.officialSites);
  const directors = useWizardStore((s) => s.production.directors);
  const distributors = useWizardStore((s) => s.production.distributors);
  const productionCompanies = useWizardStore((s) => s.production.productionCompanies);
  const updateProduction = useWizardStore((s) => s.updateProduction);
  const addOfficialSite = useWizardStore((s) => s.addOfficialSite);
  const removeOfficialSite = useWizardStore((s) => s.removeOfficialSite);
  const addProductionDirector = useWizardStore((s) => s.addProductionDirector);
  const removeProductionDirector = useWizardStore((s) => s.removeProductionDirector);
  const addDistributor = useWizardStore((s) => s.addDistributor);
  const removeDistributor = useWizardStore((s) => s.removeDistributor);
  const addProductionCompany = useWizardStore((s) => s.addProductionCompany);
  const removeProductionCompany = useWizardStore((s) => s.removeProductionCompany);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((p) => ({ ...p, [f]: true }));

  const [amountRaw, setAmountRaw] = useState(
    budget.amount != null ? budget.amount.toString() : "",
  );

  /* ---- draft states ---- */
  const [osDraft, setOsDraft] = useState({ url: "", description: "" });
  const [dirDraft, setDirDraft] = useState({ name: "", role: "", attribute: "" });
  const [distDraft, setDistDraft] = useState({ companyName: "", region: "", year: "", distributionType: "", attribute: "" });
  const [pcDraft, setPcDraft] = useState({ companyName: "", attribute: "" });

  const currencyValid = budget.currency !== "";
  const amountNumeric = /^\d+$/.test(amountRaw);
  const amountFilled = amountRaw.length > 0 && amountNumeric;
  const bothValid = currencyValid && amountFilled;

  const handleAmount = (v: string) => {
    const cleaned = v.replace(/\D/g, "");
    setAmountRaw(cleaned);
    if (/^\d+$/.test(cleaned) && cleaned.length > 0) {
      updateProduction({ budget: { ...budget, amount: parseInt(cleaned, 10) } });
    } else {
      updateProduction({ budget: { ...budget, amount: null } });
    }
  };

  /* ---- inline patch helpers ---- */
  const patchOs = (id: string, patch: Partial<OfficialSite>) => {
    updateProduction({ officialSites: officialSites.map((x) => x.id === id ? { ...x, ...patch } : x) });
  };
  const patchDir = (id: string, patch: Partial<ProductionDirector>) => {
    updateProduction({ directors: directors.map((x) => x.id === id ? { ...x, ...patch } : x) });
  };
  const patchDist = (id: string, patch: Partial<Distributor>) => {
    updateProduction({ distributors: distributors.map((x) => x.id === id ? { ...x, ...patch } : x) });
  };
  const patchPc = (id: string, patch: Partial<ProductionCompany>) => {
    updateProduction({ productionCompanies: productionCompanies.map((x) => x.id === id ? { ...x, ...patch } : x) });
  };

  const addBtnClass =
    "h-9 shrink-0 rounded-xl border border-imdb-gold/30 px-3 font-display text-[10px] uppercase tracking-widest text-imdb-gold transition-all hover:bg-imdb-gold/10 disabled:opacity-30 disabled:hover:bg-transparent";

  const addRowBtnClass =
    "flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-imdb-black/[0.08] py-2.5 text-xs text-imdb-gray/60 transition-all hover:border-imdb-gold/40 hover:text-imdb-gold";

  const PlusIcon = () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          Production
        </h2>
        <p className="mt-1 text-sm text-imdb-gray/70">
          Budget, official sites, directors, distributors, and production companies.
        </p>
      </div>

      {/* ---- Budget ---- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="label-cinema">
            Budget <RequiredMark />
          </label>
          <ValidIcon valid={bothValid} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-cinema-sub">Currency</label>
            <select value={budget.currency} onChange={(e) => updateProduction({ budget: { ...budget, currency: e.target.value } })} className="select-cinema mt-1">
              <option value="">Select currency...</option>
              {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-cinema-sub">Amount</label>
            <input type="text" inputMode="numeric" value={amountRaw} onChange={(e) => handleAmount(e.target.value)} onBlur={() => touch("amount")} placeholder="e.g. 45000000" className="input-cinema mt-1" />
            <Hint show={touched.amount === true && amountRaw.length > 0 && !amountNumeric} text="Amount must be a whole number" />
          </div>
        </div>
        {bothValid && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-imdb-gray/70">
            Formatted: <span className="text-imdb-black">{budget.currency} {budget.amount!.toLocaleString()}</span>
          </motion.p>
        )}
        <FieldTipSlot fieldId="production.budget" />
      </div>

      {/* ---- Official Sites ---- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="label-cinema">Official Sites</label>
          <ValidIcon valid={officialSites.length > 0} />
          <span className="ml-auto text-xs text-imdb-gray/60">{officialSites.length} {officialSites.length === 1 ? "site" : "sites"}</span>
        </div>
        <AnimatePresence initial={false}>
          {officialSites.map((site) => (
            <motion.div key={site.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className={rowCard}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RowCheck valid={URL_RE.test(site.url) && site.description.trim().length > 0} />
                    <span className="text-xs text-imdb-gray/60">Official Site</span>
                  </div>
                  <button type="button" onClick={() => removeOfficialSite(site.id)} className="text-xs text-red-400/60 transition-colors hover:text-red-400">Remove</button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="label-cinema-sub">URL</label>
                    <input type="url" value={site.url} onChange={(e) => patchOs(site.id, { url: e.target.value })} placeholder="https://..." className="input-cinema-sm" />
                  </div>
                  <div>
                    <label className="label-cinema-sub">Description</label>
                    <input type="text" value={site.description} onChange={(e) => patchOs(site.id, { description: e.target.value })} placeholder="e.g. Official Website" className="input-cinema-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <button type="button" onClick={() => { addOfficialSite({ id: `os-${++_nextOsId}`, url: osDraft.url, description: osDraft.description }); setOsDraft({ url: "", description: "" }); }} className={addRowBtnClass}>
          <PlusIcon /> Add Official Site
        </button>
      </div>

      {/* ---- Directors ---- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="label-cinema">Directors <RequiredMark /></label>
          <ValidIcon valid={directors.length > 0} />
          <span className="ml-auto text-xs text-imdb-gray/60">{directors.length} {directors.length === 1 ? "person" : "people"}</span>
        </div>
        <FieldTipSlot fieldId="production.directors" />
        <AnimatePresence initial={false}>
          {directors.map((d) => (
            <motion.div key={d.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className={rowCard}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-imdb-black">{d.name} <span className="text-xs text-imdb-gray/60">-- {d.role || "Director"}</span></span>
                  <button type="button" onClick={() => removeProductionDirector(d.id)} className="text-xs text-red-400/60 transition-colors hover:text-red-400">Remove</button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <label className="label-cinema-sub">Name</label>
                    <input type="text" value={d.name} onChange={(e) => patchDir(d.id, { name: e.target.value })} className="input-cinema-sm" />
                  </div>
                  <div>
                    <label className="label-cinema-sub">Role</label>
                    <input type="text" value={d.role} onChange={(e) => patchDir(d.id, { role: e.target.value })} placeholder="e.g. Director" className="input-cinema-sm" />
                  </div>
                  <div>
                    <label className="label-cinema-sub">Attribute</label>
                    <input type="text" value={d.attribute} onChange={(e) => patchDir(d.id, { attribute: e.target.value })} placeholder="e.g. also producer" className="input-cinema-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input type="text" value={dirDraft.name} onChange={(e) => setDirDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Name..." className="input-cinema-sm" />
          <input type="text" value={dirDraft.role} onChange={(e) => setDirDraft((p) => ({ ...p, role: e.target.value }))} placeholder="Role..." className="input-cinema-sm" />
          <input type="text" value={dirDraft.attribute} onChange={(e) => setDirDraft((p) => ({ ...p, attribute: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (dirDraft.name.trim()) { addProductionDirector({ id: `pd-${++_nextPdId}`, ...dirDraft }); setDirDraft({ name: "", role: "", attribute: "" }); } } }} placeholder="Attribute..." className="input-cinema-sm" />
          <button type="button" onClick={() => { if (dirDraft.name.trim()) { addProductionDirector({ id: `pd-${++_nextPdId}`, name: dirDraft.name, role: dirDraft.role || "Director", attribute: dirDraft.attribute }); setDirDraft({ name: "", role: "", attribute: "" }); } }} disabled={!dirDraft.name.trim()} className={addBtnClass}>Add</button>
        </div>
      </div>

      {/* ---- Distributors ---- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="label-cinema">Distributors</label>
          <ValidIcon valid={distributors.length > 0} />
          <span className="ml-auto text-xs text-imdb-gray/60">{distributors.length} {distributors.length === 1 ? "entry" : "entries"}</span>
        </div>
        <AnimatePresence initial={false}>
          {distributors.map((dist) => (
            <motion.div key={dist.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className={rowCard}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-imdb-black">{dist.companyName || "Untitled"}</span>
                  <button type="button" onClick={() => removeDistributor(dist.id)} className="text-xs text-red-400/60 transition-colors hover:text-red-400">Remove</button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="label-cinema-sub">Company Name</label>
                    <input type="text" value={dist.companyName} onChange={(e) => patchDist(dist.id, { companyName: e.target.value })} className="input-cinema-sm" />
                  </div>
                  <div>
                    <label className="label-cinema-sub">Region</label>
                    <select value={dist.region} onChange={(e) => patchDist(dist.id, { region: e.target.value })} className="select-cinema-sm">
                      <option value="">Select region...</option>
                      {DISTRIBUTOR_REGIONS.map((r) => <option key={r} value={r}>{DISTRIBUTOR_REGION_LABELS[r]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <label className="label-cinema-sub">Year</label>
                    <input type="text" inputMode="numeric" value={dist.year} onChange={(e) => patchDist(dist.id, { year: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="YYYY" maxLength={4} className="input-cinema-sm" />
                  </div>
                  <div>
                    <label className="label-cinema-sub">Type</label>
                    <select value={dist.distributionType} onChange={(e) => patchDist(dist.id, { distributionType: e.target.value })} className="select-cinema-sm">
                      <option value="">Select type...</option>
                      {DISTRIBUTOR_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-cinema-sub">Attribute</label>
                    <input type="text" value={dist.attribute} onChange={(e) => patchDist(dist.id, { attribute: e.target.value })} placeholder="e.g. theatrical rights" className="input-cinema-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <button type="button" onClick={() => { addDistributor({ id: `dist-${++_nextDistId}`, companyName: distDraft.companyName, region: distDraft.region, year: distDraft.year, distributionType: distDraft.distributionType, attribute: distDraft.attribute }); setDistDraft({ companyName: "", region: "", year: "", distributionType: "", attribute: "" }); }} className={addRowBtnClass}>
          <PlusIcon /> Add Distributor
        </button>
      </div>

      {/* ---- Production Companies ---- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="label-cinema">Production Companies</label>
          <ValidIcon valid={productionCompanies.length > 0} />
          <span className="ml-auto text-xs text-imdb-gray/60">{productionCompanies.length} {productionCompanies.length === 1 ? "company" : "companies"}</span>
        </div>
        <AnimatePresence initial={false}>
          {productionCompanies.map((pc) => (
            <motion.div key={pc.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="rounded-xl border border-imdb-black/[0.05] bg-imdb-white/60 px-3.5 py-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-imdb-gray/60">Production Company</span>
                  <button type="button" onClick={() => removeProductionCompany(pc.id)} className="text-xs text-red-400/60 transition-colors hover:text-red-400">Remove</button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="label-cinema-sub">Company Name</label>
                    <input type="text" value={pc.companyName} onChange={(e) => patchPc(pc.id, { companyName: e.target.value })} placeholder="Company name" className="input-cinema-sm" />
                  </div>
                  <div>
                    <label className="label-cinema-sub">Attribute</label>
                    <input type="text" value={pc.attribute} onChange={(e) => patchPc(pc.id, { attribute: e.target.value })} placeholder="Attribute" className="input-cinema-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="flex gap-2">
          <input type="text" value={pcDraft.companyName} onChange={(e) => setPcDraft((p) => ({ ...p, companyName: e.target.value }))} placeholder="Company name..." className="input-cinema-sm flex-1" />
          <input type="text" value={pcDraft.attribute} onChange={(e) => setPcDraft((p) => ({ ...p, attribute: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (pcDraft.companyName.trim()) { addProductionCompany({ id: `pc-${++_nextPcId}`, companyName: pcDraft.companyName, attribute: pcDraft.attribute }); setPcDraft({ companyName: "", attribute: "" }); } } }} placeholder="Attribute..." className="input-cinema-sm flex-1" />
          <button type="button" onClick={() => { if (pcDraft.companyName.trim()) { addProductionCompany({ id: `pc-${++_nextPcId}`, companyName: pcDraft.companyName, attribute: pcDraft.attribute }); setPcDraft({ companyName: "", attribute: "" }); } }} disabled={!pcDraft.companyName.trim()} className={addBtnClass}>Add</button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Step 5 — Credits constants
   ================================================================ */

const MAJOR_CREDIT_CATS: { key: keyof MajorCreditCounts; label: string }[] = [
  { key: "cast", label: "Cast" },
  { key: "self", label: "Self" },
  { key: "writers", label: "Writers" },
  { key: "producers", label: "Producers" },
  { key: "composers", label: "Composers" },
  { key: "cinematographers", label: "Cinematographers" },
  { key: "editors", label: "Editors" },
];

const MAJOR_CREDIT_OPTIONS = [0, 1, 2, 3, 4, 5, 10, 15, 30];

const RECOMMENDED_INFO_CATS: { key: keyof RecommendedInfoCounts; label: string }[] = [
  { key: "certificates", label: "Certificate (Ratings) Information" },
  { key: "runningTimes", label: "Running Times" },
  { key: "filmingLocations", label: "Filming Locations" },
  { key: "soundMix", label: "Sound Mix" },
  { key: "aspectRatio", label: "Aspect Ratio" },
  { key: "taglines", label: "Taglines" },
  { key: "plotOutlines", label: "Plot Outlines" },
  { key: "plotSummaries", label: "Plot Summaries" },
  { key: "keywords", label: "Keywords" },
  { key: "trivia", label: "Trivia" },
];

const RECOMMENDED_OPTIONS = [0, 1, 2, 3, 4, 5];

/* =========================================================
   Step 5 — Credits
   ========================================================= */
export function StepCredits() {
  const majorCredits = useWizardStore((s) => s.credits.majorCredits);
  const recommendedInfo = useWizardStore((s) => s.credits.recommendedInfo);
  const updateCredits = useWizardStore((s) => s.updateCredits);

  const filledCount = Object.values(majorCredits).filter((v) => v > 0).length;
  const meetsMinimum = filledCount >= 3;

  const setMajor = (key: keyof MajorCreditCounts, value: number) => {
    updateCredits({ majorCredits: { ...majorCredits, [key]: value } });
  };

  const setRecommended = (key: keyof RecommendedInfoCounts, value: number) => {
    updateCredits({ recommendedInfo: { ...recommendedInfo, [key]: value } });
  };

  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          Credits &amp; Information
        </h2>
        <p className="mt-1 text-sm text-imdb-gray/70">
          Select how many credits and information items to add.
        </p>
      </div>

      {/* ---- Major Credits ---- */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="label-cinema">
            Major Credits <RequiredMark />
          </label>
          <ValidIcon valid={meetsMinimum} />
          <span className="ml-auto text-xs text-imdb-gray/60">
            {filledCount} of 3 minimum
          </span>
        </div>

        <div className="space-y-2">
          {MAJOR_CREDIT_CATS.map((cat) => (
            <div key={cat.key} className="flex items-center justify-between rounded-xl border border-imdb-black/[0.05] bg-imdb-white/60 px-4 py-3">
              <span className="text-sm text-imdb-black">{cat.label}</span>
              <select
                value={majorCredits[cat.key]}
                onChange={(e) => setMajor(cat.key, parseInt(e.target.value, 10))}
                className="select-cinema-sm w-36"
              >
                {MAJOR_CREDIT_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? "No change" : `Add ${n}`}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {!meetsMinimum && filledCount > 0 && (
          <p className="text-xs text-amber-500/80">
            Select at least {3 - filledCount} more {3 - filledCount === 1 ? "category" : "categories"}
          </p>
        )}
        <FieldTipSlot fieldId="credits.major" />
      </div>

      {/* ---- Recommended Information ---- */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="label-cinema">
            Recommended Information
          </label>
          <span className="ml-auto text-xs text-imdb-gray/60">Optional</span>
        </div>

        <div className="space-y-2">
          {RECOMMENDED_INFO_CATS.map((cat) => (
            <div key={cat.key} className="flex items-center justify-between rounded-xl border border-imdb-black/[0.05] bg-imdb-white/60 px-4 py-3">
              <span className="text-sm text-imdb-black">{cat.label}</span>
              <select
                value={recommendedInfo[cat.key]}
                onChange={(e) => setRecommended(cat.key, parseInt(e.target.value, 10))}
                className="select-cinema-sm w-36"
              >
                {RECOMMENDED_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? "No change" : `Add ${n}`}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
