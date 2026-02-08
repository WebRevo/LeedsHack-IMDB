import type { WizardFormState } from "@/store/types";
import type { SupabaseClient } from "@supabase/supabase-js";

/* =========================================================
   Maps WizardFormState → individual DB columns + child rows
   ========================================================= */

/** Convert empty string to null (PostgreSQL enums reject '') */
function enumOrNull<T extends string>(val: T | ""): T | null {
  return val === "" ? null : val;
}

/**
 * Build the column payload for the title_submissions row.
 * Does NOT include: id, user_id, status, current_step, form_data,
 * confidence_score, completion_percent (those are set separately).
 */
export function mapFormToColumns(f: WizardFormState) {
  return {
    // Core
    title: f.core.title,
    title_checked: f.core.titleChecked,
    title_type: enumOrNull(f.core.type),
    title_subtype: enumOrNull(f.core.subtype),
    title_status: enumOrNull(f.core.status),
    release_year: f.core.year,
    contributor_role: enumOrNull(f.core.contributorRole),

    // Identity
    countries_of_origin: f.identity.countriesOfOrigin,
    languages: f.identity.languages,
    color_format: enumOrNull(f.identity.colorFormat),
    color_attribute: f.identity.colorAttribute,
    genres: f.identity.genres,

    // Production — budget
    budget_currency: f.production.budget.currency || "USD",
    budget_amount: f.production.budget.amount,

    // Credits — major
    credits_cast: f.credits.majorCredits.cast,
    credits_self: f.credits.majorCredits.self,
    credits_writers: f.credits.majorCredits.writers,
    credits_producers: f.credits.majorCredits.producers,
    credits_composers: f.credits.majorCredits.composers,
    credits_cinematographers: f.credits.majorCredits.cinematographers,
    credits_editors: f.credits.majorCredits.editors,

    // Credits — recommended info
    info_certificates: f.credits.recommendedInfo.certificates,
    info_running_times: f.credits.recommendedInfo.runningTimes,
    info_filming_locations: f.credits.recommendedInfo.filmingLocations,
    info_sound_mix: f.credits.recommendedInfo.soundMix,
    info_aspect_ratio: f.credits.recommendedInfo.aspectRatio,
    info_taglines: f.credits.recommendedInfo.taglines,
    info_plot_outlines: f.credits.recommendedInfo.plotOutlines,
    info_plot_summaries: f.credits.recommendedInfo.plotSummaries,
    info_keywords: f.credits.recommendedInfo.keywords,
    info_trivia: f.credits.recommendedInfo.trivia,
  };
}

/**
 * Sync all child tables for a given submission.
 * Strategy: delete all existing rows, then bulk insert current ones.
 * Runs all deletes in parallel, then all inserts in parallel.
 */
export async function syncChildTables(
  supabase: SupabaseClient,
  submissionId: string,
  f: WizardFormState,
): Promise<{ error: string | null }> {
  const sid = submissionId;

  // ---- Delete existing rows (all in parallel) ----
  const deletes = await Promise.all([
    supabase.from("release_dates").delete().eq("submission_id", sid),
    supabase.from("misc_links").delete().eq("submission_id", sid),
    supabase.from("official_sites").delete().eq("submission_id", sid),
    supabase.from("directors").delete().eq("submission_id", sid),
    supabase.from("distributors").delete().eq("submission_id", sid),
    supabase.from("production_companies").delete().eq("submission_id", sid),
    supabase.from("warnings").delete().eq("submission_id", sid),
    supabase.from("assumptions").delete().eq("submission_id", sid),
  ]);

  const deleteErr = deletes.find((d) => d.error);
  if (deleteErr?.error) {
    return { error: `Delete failed: ${deleteErr.error.message}` };
  }

  // ---- Insert current rows (all in parallel) ----
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inserts: PromiseLike<any>[] = [];

  if (f.mandatory.releaseDates.length > 0) {
    inserts.push(
      supabase.from("release_dates").insert(
        f.mandatory.releaseDates.map((rd, i) => ({
          submission_id: sid,
          country: rd.country,
          day: rd.day,
          month: rd.month,
          year: rd.year,
          release_type: enumOrNull(rd.releaseType),
          note: rd.note,
          sort_order: i,
        })),
      ),
    );
  }

  if (f.mandatory.miscLinks.length > 0) {
    inserts.push(
      supabase.from("misc_links").insert(
        f.mandatory.miscLinks.map((ml, i) => ({
          submission_id: sid,
          label: ml.label,
          url: ml.url,
          sort_order: i,
        })),
      ),
    );
  }

  if (f.production.officialSites.length > 0) {
    inserts.push(
      supabase.from("official_sites").insert(
        f.production.officialSites.map((os, i) => ({
          submission_id: sid,
          url: os.url,
          description: os.description,
          sort_order: i,
        })),
      ),
    );
  }

  if (f.production.directors.length > 0) {
    inserts.push(
      supabase.from("directors").insert(
        f.production.directors.map((d, i) => ({
          submission_id: sid,
          name: d.name,
          role: d.role,
          attribute: d.attribute,
          sort_order: i,
        })),
      ),
    );
  }

  if (f.production.distributors.length > 0) {
    inserts.push(
      supabase.from("distributors").insert(
        f.production.distributors.map((d, i) => ({
          submission_id: sid,
          company_name: d.companyName,
          region: d.region,
          year: d.year,
          distribution_type: d.distributionType,
          attribute: d.attribute,
          sort_order: i,
        })),
      ),
    );
  }

  if (f.production.productionCompanies.length > 0) {
    inserts.push(
      supabase.from("production_companies").insert(
        f.production.productionCompanies.map((pc, i) => ({
          submission_id: sid,
          company_name: pc.companyName,
          attribute: pc.attribute,
          sort_order: i,
        })),
      ),
    );
  }

  if (f.meta.warnings.length > 0) {
    inserts.push(
      supabase.from("warnings").insert(
        f.meta.warnings.map((w) => ({
          submission_id: sid,
          field: w.field,
          message: w.message,
        })),
      ),
    );
  }

  if (f.meta.assumptions.length > 0) {
    inserts.push(
      supabase.from("assumptions").insert(
        f.meta.assumptions.map((a) => ({
          submission_id: sid,
          field: a.field,
          value: a.value,
          message: a.message,
        })),
      ),
    );
  }

  if (inserts.length > 0) {
    const results = await Promise.all(inserts);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertErr = results.find((r: any) => r.error);
    if (insertErr?.error) {
      return { error: `Insert failed: ${insertErr.error.message}` };
    }
  }

  return { error: null };
}
