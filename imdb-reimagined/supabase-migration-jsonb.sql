-- =========================================================
-- Migration: Add form_data JSONB + completion_percent
-- to title_submissions
--
-- Run this in the Supabase SQL Editor AFTER the initial schema.
-- This adds a JSONB column to store the full wizard form state
-- as a single JSON blob, plus a completion_percent column.
-- =========================================================

-- Add form_data column (stores the entire WizardFormState as JSON)
alter table public.title_submissions
  add column if not exists form_data jsonb not null default '{}';

-- Add completion_percent column
alter table public.title_submissions
  add column if not exists completion_percent integer not null default 0;

-- =========================================================
-- DONE. The title_submissions table now has:
--   form_data        jsonb    (full wizard state as JSON)
--   completion_percent integer (0-100)
-- These work alongside the existing confidence_score and
-- current_step columns.
-- =========================================================
