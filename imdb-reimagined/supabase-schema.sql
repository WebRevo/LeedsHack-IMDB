-- =========================================================
-- IMDb Reimagined — Full Supabase Schema
-- Copy-paste this entire file into the Supabase SQL Editor
-- and run it in one go.
--
-- Includes:
--   1. Custom types (enums)
--   2. Profiles table (extends auth.users)
--   3. Title submissions (core fields)
--   4. Child tables (release_dates, misc_links, official_sites,
--      directors, distributors, production_companies,
--      warnings, assumptions)
--   5. Row Level Security (RLS) policies
--   6. Triggers (auto-create profile on signup, auto-update timestamps)
--   7. Indexes for performance
-- =========================================================


-- =========================================================
-- 0. EXTENSIONS
-- =========================================================

create extension if not exists "uuid-ossp";


-- =========================================================
-- 1. CUSTOM ENUM TYPES
-- =========================================================

create type title_type as enum (
  'film',
  'madeForTv',
  'madeForVideo',
  'musicVideo',
  'podcastSeries',
  'videoGame'
);

create type title_subtype as enum (
  'featureLength',
  'shortSubject'
);

create type title_status as enum (
  'released',
  'limitedScreenings',
  'completedNotShown',
  'notComplete'
);

create type contributor_role as enum (
  'producerDirectorWriter',
  'castCrew',
  'publicist',
  'noneOfAbove'
);

create type color_format as enum (
  'color',
  'blackAndWhite'
);

create type release_type as enum (
  'theatrical',
  'digital',
  'physical',
  'tv',
  'festival'
);

create type submission_status as enum (
  'draft',
  'submitted',
  'approved',
  'rejected'
);


-- =========================================================
-- 2. PROFILES TABLE (extends auth.users)
-- =========================================================

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  full_name     text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Profile is auto-created by trigger (insert policy for service role)
create policy "Profiles are created via trigger"
  on public.profiles for insert
  with check (auth.uid() = id);


-- =========================================================
-- 3. TITLE SUBMISSIONS (main table — all scalar fields)
-- =========================================================

create table public.title_submissions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users (id) on delete cascade,

  -- submission meta
  status              submission_status not null default 'draft',
  confidence_score    integer not null default 0,
  current_step        integer not null default 0,

  -- Step 0: Core
  title               text not null default '',
  title_checked       boolean not null default false,
  title_type          title_type,
  title_subtype       title_subtype,
  title_status        title_status,
  release_year        integer,
  contributor_role    contributor_role,

  -- Step 2: Identity
  countries_of_origin text[] not null default '{}',
  languages           text[] not null default '{}',
  color_format        color_format,
  color_attribute     text not null default '',
  genres              text[] not null default '{}',

  -- Step 3: Production — budget
  budget_currency     text not null default 'USD',
  budget_amount       bigint,

  -- Step 4: Credits — major credits
  credits_cast            integer not null default 0,
  credits_self            integer not null default 0,
  credits_writers         integer not null default 0,
  credits_producers       integer not null default 0,
  credits_composers       integer not null default 0,
  credits_cinematographers integer not null default 0,
  credits_editors         integer not null default 0,

  -- Step 4: Credits — recommended info
  info_certificates       integer not null default 0,
  info_running_times      integer not null default 0,
  info_filming_locations  integer not null default 0,
  info_sound_mix          integer not null default 0,
  info_aspect_ratio       integer not null default 0,
  info_taglines           integer not null default 0,
  info_plot_outlines      integer not null default 0,
  info_plot_summaries     integer not null default 0,
  info_keywords           integer not null default 0,
  info_trivia             integer not null default 0,

  -- timestamps
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.title_submissions enable row level security;


-- =========================================================
-- 4. CHILD TABLES (one-to-many arrays)
-- =========================================================

-- 4a. Release Dates (Step 1: Mandatory)
create table public.release_dates (
  id                uuid primary key default uuid_generate_v4(),
  submission_id     uuid not null references public.title_submissions (id) on delete cascade,
  country           text not null default '',
  day               text not null default '',
  month             text not null default '',
  year              text not null default '',
  release_type      release_type,
  note              text not null default '',
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.release_dates enable row level security;


-- 4b. Evidence / Misc Links (Step 1: Mandatory)
create table public.misc_links (
  id                uuid primary key default uuid_generate_v4(),
  submission_id     uuid not null references public.title_submissions (id) on delete cascade,
  label             text not null default '',
  url               text not null default '',
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.misc_links enable row level security;


-- 4c. Official Sites (Step 3: Production)
create table public.official_sites (
  id                uuid primary key default uuid_generate_v4(),
  submission_id     uuid not null references public.title_submissions (id) on delete cascade,
  url               text not null default '',
  description       text not null default '',
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.official_sites enable row level security;


-- 4d. Directors (Step 3: Production)
create table public.directors (
  id                uuid primary key default uuid_generate_v4(),
  submission_id     uuid not null references public.title_submissions (id) on delete cascade,
  name              text not null default '',
  role              text not null default 'Director',
  attribute         text not null default '',
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.directors enable row level security;


-- 4e. Distributors (Step 3: Production)
create table public.distributors (
  id                uuid primary key default uuid_generate_v4(),
  submission_id     uuid not null references public.title_submissions (id) on delete cascade,
  company_name      text not null default '',
  region            text not null default '',
  year              text not null default '',
  distribution_type text not null default '',
  attribute         text not null default '',
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.distributors enable row level security;


-- 4f. Production Companies (Step 3: Production)
create table public.production_companies (
  id                uuid primary key default uuid_generate_v4(),
  submission_id     uuid not null references public.title_submissions (id) on delete cascade,
  company_name      text not null default '',
  attribute         text not null default '',
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.production_companies enable row level security;


-- 4g. Warnings (Meta)
create table public.warnings (
  id                uuid primary key default uuid_generate_v4(),
  submission_id     uuid not null references public.title_submissions (id) on delete cascade,
  field             text not null default '',
  message           text not null default '',
  created_at        timestamptz not null default now()
);

alter table public.warnings enable row level security;


-- 4h. Assumptions (Meta)
create table public.assumptions (
  id                uuid primary key default uuid_generate_v4(),
  submission_id     uuid not null references public.title_submissions (id) on delete cascade,
  field             text not null default '',
  value             text not null default '',
  message           text not null default '',
  created_at        timestamptz not null default now()
);

alter table public.assumptions enable row level security;


-- =========================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =========================================================

-- ---- title_submissions ----

-- Users can only see their own submissions
create policy "Users can view own submissions"
  on public.title_submissions for select
  using (auth.uid() = user_id);

-- Users can create submissions for themselves
create policy "Users can create own submissions"
  on public.title_submissions for insert
  with check (auth.uid() = user_id);

-- Users can update their own submissions
create policy "Users can update own submissions"
  on public.title_submissions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own submissions
create policy "Users can delete own submissions"
  on public.title_submissions for delete
  using (auth.uid() = user_id);


-- ---- Helper: check if user owns the parent submission ----
-- We use a function so all child table policies can reuse it.

create or replace function public.owns_submission(p_submission_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.title_submissions
    where id = p_submission_id
      and user_id = auth.uid()
  );
$$;


-- ---- release_dates ----

create policy "Users can view own release dates"
  on public.release_dates for select
  using (public.owns_submission(submission_id));

create policy "Users can insert own release dates"
  on public.release_dates for insert
  with check (public.owns_submission(submission_id));

create policy "Users can update own release dates"
  on public.release_dates for update
  using (public.owns_submission(submission_id))
  with check (public.owns_submission(submission_id));

create policy "Users can delete own release dates"
  on public.release_dates for delete
  using (public.owns_submission(submission_id));


-- ---- misc_links ----

create policy "Users can view own misc links"
  on public.misc_links for select
  using (public.owns_submission(submission_id));

create policy "Users can insert own misc links"
  on public.misc_links for insert
  with check (public.owns_submission(submission_id));

create policy "Users can update own misc links"
  on public.misc_links for update
  using (public.owns_submission(submission_id))
  with check (public.owns_submission(submission_id));

create policy "Users can delete own misc links"
  on public.misc_links for delete
  using (public.owns_submission(submission_id));


-- ---- official_sites ----

create policy "Users can view own official sites"
  on public.official_sites for select
  using (public.owns_submission(submission_id));

create policy "Users can insert own official sites"
  on public.official_sites for insert
  with check (public.owns_submission(submission_id));

create policy "Users can update own official sites"
  on public.official_sites for update
  using (public.owns_submission(submission_id))
  with check (public.owns_submission(submission_id));

create policy "Users can delete own official sites"
  on public.official_sites for delete
  using (public.owns_submission(submission_id));


-- ---- directors ----

create policy "Users can view own directors"
  on public.directors for select
  using (public.owns_submission(submission_id));

create policy "Users can insert own directors"
  on public.directors for insert
  with check (public.owns_submission(submission_id));

create policy "Users can update own directors"
  on public.directors for update
  using (public.owns_submission(submission_id))
  with check (public.owns_submission(submission_id));

create policy "Users can delete own directors"
  on public.directors for delete
  using (public.owns_submission(submission_id));


-- ---- distributors ----

create policy "Users can view own distributors"
  on public.distributors for select
  using (public.owns_submission(submission_id));

create policy "Users can insert own distributors"
  on public.distributors for insert
  with check (public.owns_submission(submission_id));

create policy "Users can update own distributors"
  on public.distributors for update
  using (public.owns_submission(submission_id))
  with check (public.owns_submission(submission_id));

create policy "Users can delete own distributors"
  on public.distributors for delete
  using (public.owns_submission(submission_id));


-- ---- production_companies ----

create policy "Users can view own production companies"
  on public.production_companies for select
  using (public.owns_submission(submission_id));

create policy "Users can insert own production companies"
  on public.production_companies for insert
  with check (public.owns_submission(submission_id));

create policy "Users can update own production companies"
  on public.production_companies for update
  using (public.owns_submission(submission_id))
  with check (public.owns_submission(submission_id));

create policy "Users can delete own production companies"
  on public.production_companies for delete
  using (public.owns_submission(submission_id));


-- ---- warnings ----

create policy "Users can view own warnings"
  on public.warnings for select
  using (public.owns_submission(submission_id));

create policy "Users can insert own warnings"
  on public.warnings for insert
  with check (public.owns_submission(submission_id));

create policy "Users can update own warnings"
  on public.warnings for update
  using (public.owns_submission(submission_id))
  with check (public.owns_submission(submission_id));

create policy "Users can delete own warnings"
  on public.warnings for delete
  using (public.owns_submission(submission_id));


-- ---- assumptions ----

create policy "Users can view own assumptions"
  on public.assumptions for select
  using (public.owns_submission(submission_id));

create policy "Users can insert own assumptions"
  on public.assumptions for insert
  with check (public.owns_submission(submission_id));

create policy "Users can update own assumptions"
  on public.assumptions for update
  using (public.owns_submission(submission_id))
  with check (public.owns_submission(submission_id));

create policy "Users can delete own assumptions"
  on public.assumptions for delete
  using (public.owns_submission(submission_id));


-- =========================================================
-- 6. TRIGGERS
-- =========================================================

-- 6a. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- 6b. Auto-update updated_at on title_submissions
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.title_submissions
  for each row
  execute function public.update_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at();


-- =========================================================
-- 7. INDEXES
-- =========================================================

-- Fast lookup of all submissions by a user
create index idx_title_submissions_user_id
  on public.title_submissions (user_id);

-- Fast lookup of submissions by status
create index idx_title_submissions_status
  on public.title_submissions (status);

-- Fast lookup of submissions by user + status (e.g. "my drafts")
create index idx_title_submissions_user_status
  on public.title_submissions (user_id, status);

-- Child table FK indexes (Postgres doesn't auto-index FK columns)
create index idx_release_dates_submission
  on public.release_dates (submission_id);

create index idx_misc_links_submission
  on public.misc_links (submission_id);

create index idx_official_sites_submission
  on public.official_sites (submission_id);

create index idx_directors_submission
  on public.directors (submission_id);

create index idx_distributors_submission
  on public.distributors (submission_id);

create index idx_production_companies_submission
  on public.production_companies (submission_id);

create index idx_warnings_submission
  on public.warnings (submission_id);

create index idx_assumptions_submission
  on public.assumptions (submission_id);


-- =========================================================
-- 8. STORAGE BUCKET (optional — for future poster uploads)
-- =========================================================

-- Uncomment below if you want a storage bucket for file uploads:
--
-- insert into storage.buckets (id, name, public)
-- values ('title-assets', 'title-assets', false);
--
-- create policy "Users can upload to own folder"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'title-assets'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
--
-- create policy "Users can view own uploads"
--   on storage.objects for select
--   using (
--     bucket_id = 'title-assets'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
--
-- create policy "Users can delete own uploads"
--   on storage.objects for delete
--   using (
--     bucket_id = 'title-assets'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );


-- =========================================================
-- DONE. Your database is ready.
--
-- Make sure you have Email auth enabled in Supabase Dashboard:
--   Authentication → Providers → Email → Enabled ✓
--
-- .env.local should have:
--   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
--   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
-- =========================================================
