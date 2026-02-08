"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWizardStore } from "@/store/wizardStore";
import type { WizardFormState } from "@/store/types";
import { computeStepValidation } from "@/lib/validation";
import { mapFormToColumns, syncChildTables } from "@/lib/supabase/mapFormToDb";

/* =========================================================
   useSupabaseDraft — Persistence hook for the wizard
   - Loads the latest draft (or creates one) on mount
   - Hydrates the Zustand store once
   - Debounced autosave on every store change
   - Saves BOTH form_data JSONB AND individual columns + child tables
   - Exposes save status for the UI
   ========================================================= */

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseDraftReturn {
  draftId: string | null;
  saveStatus: SaveStatus;
  isLoading: boolean;
  /** Persist the current step index to the DB */
  persistStep: (step: number) => void;
  /** Immediately save the draft (not debounced) */
  saveDraft: () => Promise<boolean>;
  /** Change draft status to 'submitted' */
  submitDraft: () => Promise<boolean>;
}

const DEBOUNCE_MS = 1000;

/** Check if the form is effectively empty (no user data) */
function isFormEmpty(s: WizardFormState): boolean {
  return (
    s.core.title.trim() === "" &&
    !s.core.titleChecked &&
    s.core.type === "" &&
    s.core.status === "" &&
    s.core.year == null &&
    s.core.contributorRole === "" &&
    s.mandatory.releaseDates.length === 0 &&
    s.mandatory.miscLinks.length === 0 &&
    s.identity.countriesOfOrigin.length === 0 &&
    s.identity.languages.length === 0 &&
    s.production.directors.length === 0 &&
    s.production.budget.amount == null
  );
}

/** Extract only the data slices from the store (no actions) */
function getFormData(): WizardFormState {
  const s = useWizardStore.getState();
  return {
    core: s.core,
    mandatory: s.mandatory,
    identity: s.identity,
    production: s.production,
    credits: s.credits,
    meta: s.meta,
  };
}

/**
 * Full persistence: update title_submissions row (JSONB + individual columns)
 * AND sync all child tables.
 */
async function persistFull(
  draftId: string,
  formData: WizardFormState,
  extraFields?: Record<string, unknown>,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { completionPercent } = computeStepValidation(formData);

  // Build the parent row update payload
  const payload = {
    form_data: formData,
    confidence_score: formData.meta.confidenceScore,
    completion_percent: completionPercent,
    ...mapFormToColumns(formData),
    ...extraFields,
  };

  // Update parent row and sync child tables in parallel
  const [parentResult, childResult] = await Promise.all([
    supabase.from("title_submissions").update(payload).eq("id", draftId),
    syncChildTables(supabase, draftId, formData),
  ]);

  if (parentResult.error) {
    return { error: `Parent update failed: ${parentResult.error.message}` };
  }
  if (childResult.error) {
    return { error: childResult.error };
  }

  return { error: null };
}

export function useSupabaseDraft(): UseDraftReturn {
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoading, setIsLoading] = useState(true);

  // Refs to prevent stale closures and save loops
  const draftIdRef = useRef<string | null>(null);
  const skipSaveRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // ---- Init: load or create draft ----
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      // Fetch latest draft for this user
      const { data: drafts, error: fetchErr } = await supabase
        .from("title_submissions")
        .select("id, form_data")
        .eq("user_id", user.id)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (cancelled) return;

      if (fetchErr) {
        console.error("Failed to fetch drafts:", fetchErr);
        setIsLoading(false);
        return;
      }

      let draft = drafts?.[0] ?? null;

      // No existing draft — create one
      if (!draft) {
        const formData = getFormData();
        const { completionPercent } = computeStepValidation(formData);

        const { data: newDraft, error: insertErr } = await supabase
          .from("title_submissions")
          .insert({
            user_id: user.id,
            form_data: formData,
            current_step: 0,
            confidence_score: formData.meta.confidenceScore,
            completion_percent: completionPercent,
            ...mapFormToColumns(formData),
          })
          .select("id, form_data")
          .single();

        if (cancelled) return;

        if (insertErr || !newDraft) {
          console.error("Failed to create draft:", insertErr);
          setIsLoading(false);
          return;
        }

        draft = newDraft;
      }

      // Hydrate the store from the loaded draft (only if the draft has data)
      const savedForm = draft.form_data as WizardFormState | null;
      if (savedForm && !isFormEmpty(savedForm)) {
        // Prevent the subscribe callback from saving right after hydration
        skipSaveRef.current = true;
        useWizardStore.getState().hydrateForm(savedForm);
        // Allow saves again after a tick
        requestAnimationFrame(() => {
          skipSaveRef.current = false;
        });
      }

      if (!cancelled) {
        draftIdRef.current = draft.id;
        setDraftId(draft.id);
        setIsLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Autosave: subscribe to store changes ----
  useEffect(() => {
    const unsubscribe = useWizardStore.subscribe(() => {
      if (skipSaveRef.current || !draftIdRef.current) return;

      // Clear any pending debounce
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

      debounceTimerRef.current = setTimeout(async () => {
        if (!mountedRef.current || !draftIdRef.current) return;

        const formData = getFormData();
        setSaveStatus("saving");

        const { error } = await persistFull(draftIdRef.current, formData);

        if (!mountedRef.current) return;

        if (error) {
          console.error("Autosave failed:", error);
          setSaveStatus("error");
        } else {
          setSaveStatus("saved");
          savedTimerRef.current = setTimeout(() => {
            if (mountedRef.current) setSaveStatus("idle");
          }, 3000);
        }
      }, DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  // ---- Persist step ----
  const persistStep = useCallback((step: number) => {
    if (!draftIdRef.current) return;
    const supabase = createClient();
    supabase
      .from("title_submissions")
      .update({ current_step: step })
      .eq("id", draftIdRef.current)
      .then(({ error }) => {
        if (error) console.error("Failed to persist step:", error);
      });
  }, []);

  // ---- Explicit save (non-debounced) ----
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (!draftIdRef.current) return false;

    // Cancel any pending debounce
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

    const formData = getFormData();
    setSaveStatus("saving");

    const { error } = await persistFull(draftIdRef.current, formData);

    if (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
      return false;
    }

    setSaveStatus("saved");
    savedTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setSaveStatus("idle");
    }, 3000);
    return true;
  }, []);

  // ---- Submit draft ----
  const submitDraft = useCallback(async (): Promise<boolean> => {
    if (!draftIdRef.current) return false;

    const formData = getFormData();
    setSaveStatus("saving");

    const { error } = await persistFull(draftIdRef.current, formData, {
      status: "submitted",
    });

    if (error) {
      console.error("Submit failed:", error);
      setSaveStatus("error");
      return false;
    }

    setSaveStatus("saved");
    return true;
  }, []);

  return { draftId, saveStatus, isLoading, persistStep, saveDraft, submitDraft };
}
