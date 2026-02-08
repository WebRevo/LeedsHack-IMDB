<div align="center">

# IMDb Reimagined

### A Luxury, Cinematic Reimagining of the IMDb Title Submission Experience

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.33-FF0050?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Supabase](https://img.shields.io/badge/Supabase-2.78-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-FF9900?style=for-the-badge)](https://zustand-demo.pmnd.rs/)

<br />

**Voice-first input** &bull; **AI-powered guidance** &bull; **Real-time confidence tracking** &bull; **Cinematic animations**

---

<img src="https://img.shields.io/badge/IMDb-Gold-%23f5c518?style=flat-square" /> <img src="https://img.shields.io/badge/Theme-Cinematic_Dark-%23161616?style=flat-square" /> <img src="https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white" />

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Routes & Pages](#routes--pages)
- [The Wizard — Step by Step](#the-wizard--step-by-step)
- [Voice Input System](#voice-input-system)
- [Confidence Engine](#confidence-engine)
- [AI Assistant & Guidance](#ai-assistant--guidance)
- [Chatbot & Character System](#chatbot--character-system)
- [Draft Persistence & Supabase](#draft-persistence--supabase)
- [API Routes](#api-routes)
- [Design System & Theme](#design-system--theme)
- [Animations & Transitions](#animations--transitions)
- [State Management](#state-management)
- [Custom Hooks](#custom-hooks)
- [Error Handling & Fallbacks](#error-handling--fallbacks)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Known Gotchas](#known-gotchas)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**IMDb Reimagined** transforms the traditionally utilitarian IMDb title submission process into a premium, cinematic experience. Instead of a flat form, users are guided through a beautifully animated 5-step wizard with voice input, real-time AI guidance, an animated character assistant, and a live confidence score that updates as they fill in each field.

The application was built for the **Leeds Hackathon** as a proof-of-concept for what entertainment industry data entry could look and feel like when treated as a first-class product experience.

### What does it do?

1. **Landing Page** — A cinematic hero with animated gradient orbs, interactive typing demo, and voice preview
2. **Title Submission Wizard** — 5-step form collecting title metadata (core info, release dates, identity, production details, credits)
3. **Voice-First Input** — Speak naturally; AI parses your speech into structured form fields
4. **Real-Time Confidence** — A live gauge (0-100) shows how likely your submission is to be accepted
5. **AI Assistant** — Intent-based guidance system with tone adaptation, inline tips, and proactive help
6. **Draft Persistence** — Auto-saves to Supabase so you never lose progress
7. **Review Page** — Layout for writing title reviews with ratings

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **5-Step Submission Wizard** | Guided multi-step form: Core Info, Mandatory, Identity, Production, Credits |
| **Voice Input** | Web Speech API integration — speak your title details naturally |
| **AI Transcript Parsing** | Google Gemini Flash converts spoken words into structured form data |
| **Live Confidence Score** | Weight-based scoring (0-100) with color-coded gauge |
| **Auto-Save Drafts** | Debounced Supabase persistence with status tracking |
| **AI Guidance Engine** | Intent-based assistant with validation, blocking, and guidance modes |
| **Animated Character** | IMDb-themed character with reactive dialogue and pointing gestures |
| **Knowledge Base Chatbot** | 50+ intents covering every aspect of title submission |
| **Field-Level Tips** | Contextual info/warning tips per field based on current state |

### UI/UX Features

| Feature | Description |
|---------|-------------|
| **Cinematic Splash Loader** | Film reel animation with gold particles on initial load |
| **Gradient Orb Backgrounds** | Animated warm gold/orange/amber orbs across all pages |
| **Spring Page Transitions** | Framer Motion spring animations between routes |
| **Cinematic Shell** | Vignette, mesh orbs, aurora bands, film grain overlay |
| **Interactive Hero Demo** | Type a title on the landing page and watch it parse into chips |
| **Voice Preview Overlay** | Try voice input directly from the home page |
| **Step Preview Carousel** | Preview what each wizard step collects before starting |
| **Responsive Design** | Mobile-first with breakpoints at 640px, 768px, 1024px |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14.2.35 | App Router, SSR, API routes |
| **Language** | TypeScript 5 | Type safety across the entire codebase |
| **Styling** | TailwindCSS 3.4 | Utility-first CSS with custom IMDb theme |
| **Animations** | Framer Motion 12.33 | Page transitions, wizard steps, character, loaders |
| **State** | Zustand 5.0 | Persisted global store for wizard form data |
| **Database** | Supabase 2.78 | PostgreSQL backend, auth, real-time draft storage |
| **AI/LLM** | OpenRouter (Gemini Flash) | Voice transcript parsing, help Q&A fallback |
| **Fonts** | Google Fonts | Oswald (display headings), Inter Tight (body text) |
| **Deployment** | Netlify | Edge functions, @netlify/plugin-nextjs |

---

## Architecture

```
                    +------------------+
                    |   Landing Page   |
                    |   (Voice Demo)   |
                    +--------+---------+
                             |
                    +--------v---------+
                    |  Submission       |
                    |  Wizard           |
                    |  (5 Steps)        |
                    +--------+---------+
                             |
          +------------------+------------------+
          |                  |                  |
  +-------v-------+  +------v------+  +-------v-------+
  |  Voice Input  |  |  Confidence |  |  AI Assistant  |
  |  (Speech API) |  |  Engine     |  |  (Guidance)    |
  +-------+-------+  +------+------+  +-------+-------+
          |                  |                  |
  +-------v-------+         |          +-------v-------+
  |  /api/parse   |         |          |  /api/help    |
  |  (Gemini AI)  |         |          |  (Supabase +  |
  +-------+-------+         |          |   OpenRouter) |
          |                  |          +---------------+
          +------------------+
                    |
           +--------v---------+
           |  Zustand Store   |
           |  (Persisted)     |
           +--------+---------+
                    |
           +--------v---------+
           |  Supabase DB     |
           |  (Auto-Save)     |
           +------------------+
```

### Data Flow

1. **User enters data** (keyboard or voice) into wizard step fields
2. **Voice transcripts** are sent to `/api/parse` for AI-powered field extraction
3. **Zustand store** is updated with form data, triggering re-renders
4. **Confidence engine** recalculates the score on every store change
5. **AI guidance** evaluates field state and shows contextual tips
6. **Auto-save** debounces changes and persists to Supabase every 1 second
7. **Character** reacts to events (field valid, step complete, warnings, idle)

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (comes with Node.js)
- A **Supabase** project (free tier works)
- An **OpenRouter** API key (for AI features — optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/imdb-reimagined.git

# Navigate into the project
cd imdb-reimagined

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env.local
```

### Configure Environment

Edit `.env.local` with your credentials (see [Environment Variables](#environment-variables)).

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# ──────────────────────────────────────────────
# Supabase (Required for draft persistence & auth)
# ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ──────────────────────────────────────────────
# OpenRouter (Required for AI features)
# ──────────────────────────────────────────────
OPENROUTER_API_KEY=your-openrouter-api-key

# ──────────────────────────────────────────────
# App URL (Optional — used for metadata)
# ──────────────────────────────────────────────
APP_URL=https://your-app.example.com
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous/public key |
| `OPENROUTER_API_KEY` | Yes* | OpenRouter API key for Gemini Flash (*AI features degrade gracefully without it) |
| `APP_URL` | No | Public URL of your deployed app |

> **Note:** The app works without AI keys — voice parsing and help API will return graceful fallbacks, and users can fill forms manually.

---

## Project Structure

```
imdb-reimagined/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, navbar, splash, character)
│   │   ├── globals.css               # Custom Tailwind classes & animations
│   │   ├── page.tsx                  # Home / Landing page
│   │   ├── new-title/
│   │   │   └── page.tsx              # Title submission wizard
│   │   ├── review/
│   │   │   └── page.tsx              # Review writing page
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── signup/
│   │   │   └── page.tsx              # Signup page
│   │   └── api/
│   │       ├── help/
│   │       │   └── route.ts          # Help Q&A endpoint
│   │       └── parse/
│   │           └── route.ts          # Voice transcript parser
│   │
│   ├── components/
│   │   ├── wizard/                   # Wizard components
│   │   │   ├── WizardLayout.tsx      # Two-column layout (form + sidebar)
│   │   │   ├── WizardSteps.tsx       # All 5 step components
│   │   │   ├── ConfidenceSidebar.tsx  # Live confidence gauge & checklist
│   │   │   ├── FieldTip.tsx          # Inline field-level tips
│   │   │   ├── HelpPanel.tsx         # Help search with voice input
│   │   │   └── GlobalVoiceBar.tsx    # Voice recording indicator
│   │   │
│   │   ├── cinema/                   # Cinematic UI primitives
│   │   │   ├── CinematicShell.tsx    # Ambient background (orbs, vignette, grain)
│   │   │   ├── CinematicStepper.tsx  # Step progress bar
│   │   │   ├── CinematicLoader.tsx   # Loading spinner
│   │   │   ├── StepHeader.tsx        # Step title + progress + confidence
│   │   │   └── FilmCard.tsx          # Card component
│   │   │
│   │   ├── chatbot/                  # Chatbot system
│   │   │   ├── ChatbotWindow.tsx     # Chat interface
│   │   │   ├── ChatMessages.tsx      # Message list display
│   │   │   ├── ChatInput.tsx         # Message input
│   │   │   ├── ChatbotLauncher.tsx   # Floating open button
│   │   │   ├── knowledgeBase.ts      # 50+ intent Q&A database
│   │   │   ├── intentMatcher.ts      # Intent detection logic
│   │   │   └── character/            # Animated character
│   │   │       ├── CharacterLauncher.tsx    # Character with animations
│   │   │       ├── CharacterAvatar.tsx      # Avatar visuals
│   │   │       ├── PointingHand.tsx         # Pointing gesture
│   │   │       ├── useCharacterAnimation.ts # Animation hook
│   │   │       └── characterVariants.ts     # Framer Motion variants
│   │   │
│   │   ├── landing/                  # Landing page components
│   │   │   ├── HeroDemoTyper.tsx     # Interactive typing demo
│   │   │   ├── ConfidenceMeter.tsx   # Confidence ring gauge
│   │   │   ├── RotatingMicrocopy.tsx # Rotating taglines
│   │   │   ├── RejectionReveal.tsx   # "Why rejected" section
│   │   │   ├── VoicePreviewOverlay.tsx # Voice demo modal
│   │   │   ├── StepPreviewBand.tsx   # Step preview carousel
│   │   │   └── constants.ts          # Demo scenarios & parsing
│   │   │
│   │   ├── Navbar.tsx                # Fixed navigation bar
│   │   ├── SplashLoader.tsx          # Cinematic splash screen
│   │   ├── PageTransition.tsx        # Page entrance animation
│   │   ├── Character.tsx             # Character mode toggle
│   │   ├── InlineAssistantHint.tsx   # Inline AI guidance display
│   │   └── AssistantDevPanel.tsx     # Dev-only testing panel
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useVoiceInput.ts          # Web Speech API wrapper
│   │   ├── useSupabaseDraft.ts       # Draft load/save/submit
│   │   ├── useAssistantGuidance.ts   # AI guidance system
│   │   ├── useFieldGuidance.ts       # Per-field tip generation
│   │   ├── useStepValidation.ts      # Step completion checks
│   │   └── useTranscriptParser.ts    # Speech-to-form parsing
│   │
│   ├── lib/                          # Utilities & business logic
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client
│   │   │   ├── server.ts             # Server Supabase client
│   │   │   ├── middleware.ts          # Auth session middleware
│   │   │   └── mapFormToDb.ts         # Form-to-database mapper
│   │   ├── assistant/
│   │   │   ├── intents.ts            # Intent evaluation logic
│   │   │   ├── variants.ts           # Response variant selection
│   │   │   ├── tone.ts               # Tone mode (encouraging/neutral/stern)
│   │   │   ├── autofix.ts            # Suggested auto-corrections
│   │   │   └── memory.ts             # User frustration/history tracking
│   │   ├── guidance/
│   │   │   ├── fieldRules.ts         # Per-field validation rules
│   │   │   └── fieldVariants.ts      # Tip text variants
│   │   ├── characterLines.ts         # Character dialogue lines
│   │   ├── scriptEngine.ts           # Script templating engine
│   │   └── validation.ts             # Step validation logic
│   │
│   ├── store/                        # State management
│   │   ├── wizardStore.ts            # Zustand persisted store
│   │   └── types.ts                  # TypeScript type definitions
│   │
│   └── middleware.ts                 # Next.js middleware (Supabase session)
│
├── public/                           # Static assets
├── supabase/                         # Supabase migration scripts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── netlify.toml                      # Netlify deployment config
├── .env.example                      # Environment template
├── .eslintrc.json
└── postcss.config.mjs
```

---

## Routes & Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Cinematic hero with animated gradient orbs, interactive typing demo, voice preview overlay, feature highlights, step preview carousel |
| `/new-title` | Wizard | 5-step title submission form with sidebar confidence gauge, voice input, AI guidance, character assistant, auto-save |
| `/review` | Review | Title review writing interface with 1-10 rating scale |
| `/login` | Login | User authentication |
| `/signup` | Signup | New user registration |
| `/api/help` | API | Help Q&A endpoint (Supabase + OpenRouter fallback) |
| `/api/parse` | API | Voice transcript to structured data parser (Gemini Flash) |

---

## The Wizard — Step by Step

The title submission wizard is the heart of the application. It collects all metadata required for an IMDb title entry across 5 carefully ordered steps.

### Step 0 — Core Information

> The foundation. What is this title?

| Field | Type | Required | Details |
|-------|------|----------|---------|
| **Title** | Text | Yes | The official title of the work |
| **Title Verified** | Button | Yes | User must click "Verify" to confirm the title |
| **Title Type** | Radio | Yes | Film, Made for TV, Made for Video, Music Video, Podcast Series, Video Game |
| **Sub-type** | Radio | Yes | Feature Length or Short Subject |
| **Status** | Radio | Yes | Released, Limited Screenings, Completed Not Shown, Not Complete |
| **Release Year** | Number | No | 4-digit year (e.g., 2024) or `????` for unknown |
| **Contributor Role** | Radio | Yes | Producer/Director/Writer, Cast/Crew, Publicist, None of the Above |

### Step 1 — Mandatory Information

> Evidence and dates. Prove this title exists.

| Field | Type | Required | Details |
|-------|------|----------|---------|
| **Release Dates** | Array | Yes (1+) | Each entry: Country, Day, Month, Year, Release Type (theatrical/digital/physical/TV/festival), Note |
| **Evidence Links** | Array | Yes (1+) | Each entry: Label + URL (must be valid HTTP/HTTPS) |

### Step 2 — Identity

> Where, what language, what genre?

| Field | Type | Required | Details |
|-------|------|----------|---------|
| **Countries of Origin** | String Array | Yes (1+) | Country names |
| **Languages** | String Array | Yes (1+) | Language names |
| **Genres** | String Array | Yes (1+) | Genre names |
| **Color Format** | Radio | No | Color or Black & White |
| **Color Attribute** | Text | No | Special color notes (e.g., "Colorized", "IMAX") |

### Step 3 — Production

> Who made it, who distributed it, what did it cost?

| Field | Type | Required | Details |
|-------|------|----------|---------|
| **Budget** | Object | No | Currency (ISO 4217: USD, EUR, GBP, etc.) + Amount (positive integer) |
| **Official Sites** | Array | No | URL + Description for each |
| **Directors** | Array | No | Name (required), Role, Attribute |
| **Distributors** | Array | No | Company Name, Region, Year, Distribution Type, Attribute |
| **Production Companies** | Array | No | Company Name, Attribute |

### Step 4 — Credits

> How complete is the cast & crew information?

| Category | Fields |
|----------|--------|
| **Major Credits** | Cast, Self, Writers, Producers, Composers, Cinematographers, Editors (all integers) |
| **Recommended Info** | Certificates, Running Times, Filming Locations, Sound Mix, Aspect Ratio, Taglines, Plot Outlines, Plot Summaries, Keywords, Trivia |

**Validation:** At least 3 major credit categories must have values greater than 0.

---

## Voice Input System

The voice input system allows users to describe their title naturally in spoken English. The AI then extracts structured data from the transcript.

### How It Works

```
User speaks → Web Speech API → Raw transcript
                                      ↓
                              POST /api/parse
                                      ↓
                           Google Gemini Flash
                                      ↓
                        Structured JSON + Assumptions
                                      ↓
                         Zustand store merge
                                      ↓
                       Form fields pre-populated
```

### Supported Input Examples

> *"This is a feature-length film called The Last Horizon, released in 2024. It's a sci-fi drama produced in the United States, English language."*

The AI would extract:
- **Title:** The Last Horizon
- **Type:** Film
- **Sub-type:** Feature Length
- **Status:** Released
- **Year:** 2024
- **Genres:** Sci-Fi, Drama
- **Countries:** United States
- **Languages:** English

### Voice Entry Points

1. **Home page** — "Talk it out" CTA opens the Voice Preview Overlay
2. **Wizard header** — Global voice bar for recording at any step
3. **Help panel** — Voice input for asking questions

### Browser Support

Uses the Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`). Supported in:
- Chrome (desktop & Android)
- Edge
- Safari (macOS & iOS)
- Not supported in Firefox (graceful fallback to text input)

---

## Confidence Engine

The confidence engine calculates a real-time score (0-100) representing how likely the submission is to be accepted.

### Scoring Weights

| Field | Points |
|-------|--------|
| Title entered | 12 |
| Title verified | 5 |
| Title type selected | 8 |
| Sub-type selected | 5 |
| Status selected | 5 |
| Release year provided | 5 |
| Contributor role selected | 5 |
| Evidence link provided | 10 |
| Release date provided | 10 |
| Country of origin provided | 8 |
| Language provided | 7 |
| Genre provided | 7 |
| Budget provided | 5 |
| Major credits (3+ categories) | 8 |
| **Total** | **100** |

### Color Coding

| Score Range | Color | Meaning |
|-------------|-------|---------|
| 0 – 39 | Red | Incomplete — many required fields missing |
| 40 – 69 | Amber | Partial — getting there, but gaps remain |
| 70 – 100 | Green | Strong — ready or nearly ready to submit |

### Sidebar Display

The confidence sidebar (right column on desktop, below form on mobile) shows:

1. **Animated gauge** — Color-coded circular progress
2. **Numeric score** — Large number display
3. **Required checklist** — 13 items with check/cross indicators
4. **Warnings** — Issues needing attention
5. **Assumptions** — AI-inferred values (from voice parsing)
6. **Assistant note** — Current guidance message

---

## AI Assistant & Guidance

The assistant engine provides intelligent, context-aware guidance throughout the wizard.

### Intent System

| Intent Type | Priority | Purpose |
|-------------|----------|---------|
| `BLOCKING` | Highest | Critical issues preventing submission |
| `VALIDATION` | High | Field-level validation errors |
| `GUIDANCE` | Medium | Helpful tips and best practices |
| `ENCOURAGEMENT` | Low | Positive reinforcement |

### Tone Adaptation

The assistant adapts its tone based on user behavior:

| Tone | Trigger | Example |
|------|---------|---------|
| **Encouraging** | User making progress | "Great choice! That type looks right." |
| **Neutral** | Normal interaction | "Release dates need a country and year." |
| **Stern** | Repeated errors or ignored warnings | "This field is required and cannot be left empty." |

### Frustration Detection

The memory system tracks:
- **Recent fixes** — How many corrections the user has made
- **Idle time** — Time since last interaction (triggers proactive help at 10s+)
- **Cooldown** — Prevents overwhelming the user with tips

### Auto-Fix Suggestions

The assistant can suggest corrections for common issues:
- Lowercase title → Suggest title case
- Invalid year format → Suggest correction
- Missing required fields → Highlight what's needed

### Field-Level Tips

Each field can display contextual tips:

| Severity | Appearance | Example |
|----------|-----------|---------|
| `info` | Blue/neutral | "Use the official title as it appears on screen." |
| `warning` | Amber/gold | "Year seems unusually far in the future." |

---

## Chatbot & Character System

### Knowledge Base Chatbot

The chatbot answers questions about the submission process using a built-in knowledge base of 50+ intents.

**Covered Topics:**
- How to write a title correctly
- Title verification process
- Title types and subtypes explained
- Release year rules
- Status definitions
- Release date formatting
- Evidence link requirements
- Genre selection
- Budget entry
- Director credits
- Color format options
- Language and country entry
- What happens after submission
- Processing times
- Common rejection reasons
- How to make corrections

**Intent Matching:**
1. Check trigger phrases (exact match)
2. Score keyword overlap (boosted)
3. Select from answer variants (randomized for variety)
4. Fall back to `/api/help` for unmatched queries

### Animated Character

An IMDb-themed character appears in the wizard to provide reactive feedback:

| Event | Dialogue Example |
|-------|-----------------|
| `fieldValid` | "Nice — that looks good" |
| `stepComplete` | "Step done! Let's keep going" |
| `warningShown` | "Heads up — check the sidebar" |
| `idle10s` | "Need help with anything?" |

**Character Features:**
- Responsive sizing: 80px (mobile) → 96px (tablet) → 110px (desktop)
- Floating animation with subtle bounce
- Pointing hand gesture for drawing attention
- "Need help?" label always visible
- Toggle on/off via character mode switch

---

## Draft Persistence & Supabase

### Auto-Save System

```
User edits field → Zustand store updated
                          ↓
              Debounce timer (1000ms)
                          ↓
              POST to Supabase (upsert)
                          ↓
    title_submissions table + child tables synced
                          ↓
           Save status: idle → saving → saved
```

### Database Schema

**Main Table: `title_submissions`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `status` | Text | `draft` or `submitted` |
| `form_data` | JSONB | Complete wizard form state |
| `confidence_score` | Integer | Last computed confidence |
| `completion_percent` | Integer | Form completion percentage |
| `title` | Text | Indexed title column |
| `type` | Text | Title type |
| `subtype` | Text | Sub-type |
| ... | ... | Individual columns for all fields |

**Child Tables:**
- `release_dates` — Release date entries
- `misc_links` — Evidence/miscellaneous links
- `countries_of_origin` — Country entries
- `languages` — Language entries
- `genres` — Genre entries
- `production_companies` — Company entries
- `official_sites` — Official site URLs
- `directors` — Director entries
- `distributors` — Distributor entries

### Draft Lifecycle

1. **Create** — New draft created on first visit to `/new-title`
2. **Auto-Save** — Every change debounced and persisted
3. **Resume** — Returning users see their last draft auto-loaded
4. **Submit** — Status changes from `draft` to `submitted`

---

## API Routes

### POST `/api/help`

Answers user questions about the submission process.

**Request:**
```json
{
  "question": "What counts as evidence?"
}
```

**Response:**
```json
{
  "answer": "Evidence links should point to official sources...",
  "source": "knowledge_base"
}
```

**Resolution Order:**
1. Query Supabase `help_qa` table (keyword match)
2. Fall back to OpenRouter Gemini Flash (AI generation)
3. Return hardcoded fallback if all sources fail

**Response Sources:** `"knowledge_base"` | `"ai"` | `"fallback"`

---

### POST `/api/parse`

Converts a voice transcript into structured form data.

**Request:**
```json
{
  "transcript": "This is a feature film called The Last Horizon, released in 2024, it's a drama"
}
```

**Response:**
```json
{
  "parsed": {
    "title": "The Last Horizon",
    "type": "film",
    "subtype": "featureLength",
    "status": "released",
    "year": "2024",
    "genres": ["Drama"]
  },
  "assumptions": [
    "Inferred status as 'released' from context",
    "Inferred sub-type as 'featureLength' from 'feature film'"
  ]
}
```

**Model:** Google Gemini Flash 1.5 via OpenRouter

**Validation:** Sanitizes enum values, validates years, validates currencies, ensures safe output.

**Graceful Degradation:** Returns `{ parsed: {}, assumptions: [] }` if the API is unavailable.

---

## Design System & Theme

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `imdb.gold` | `#f5c518` | Primary brand color, CTAs, accents |
| `imdb.black` | `#161616` | Backgrounds, text |
| `imdb.white` | `#f5f5f5` | Light text, card backgrounds |
| `imdb.gray` | `#969696` | Secondary text, borders |
| `imdb-gradient` | `#f9dc74 → #f5c518 → #ff6800` | Buttons, hero elements, overlays |

### Typography

| Font | Family | Usage |
|------|--------|-------|
| **Oswald** | Display | Page headings, step titles, hero text |
| **Inter Tight** | Body | Form labels, body text, descriptions |

### Component Classes

| Class | Description |
|-------|-------------|
| `.btn-gold` | Primary CTA button — gradient background, gold shadow, hover scale |
| `.input-cinema` | Form text input — dark background, gold focus ring, smooth transitions |
| `.select-cinema` | Form select dropdown — matching input style |
| `.label-cinema` | Field labels — gold color, uppercase, letter-spacing |
| `.card` | Base card — dark background, subtle border |
| `.card-interactive` | Hoverable card — lift effect, glow border |
| `.card-glass` | Glassmorphism card — backdrop blur, semi-transparent |
| `.page-heading` | Large display heading — 5xl to 7xl responsive |

---

## Animations & Transitions

### Splash Loader (Initial Load)

| Phase | Animation | Duration |
|-------|-----------|----------|
| 1 | Film strip bars fade in (top & bottom) | 0.4s |
| 2 | Film reel rotates into view | 0.6s |
| 3 | Logo appears with gold glow | 0.8s |
| 4 | Gold particles float upward | 1.0s |
| 5 | Scanning gold line sweeps | 0.5s |
| 6 | Exit fade to transparent | 0.5s |
| **Total** | | **~2.8s** |

### Page Transitions

```typescript
// Spring animation config
opacity: 0 → 1
y: 20px → 0px
stiffness: 100
damping: 20
mass: 0.8
```

### Cinematic Shell (Background)

| Layer | Effect |
|-------|--------|
| Base | Warm ambient gold/orange radial gradients |
| Vignette | Darker corners (inset shadow) |
| Mesh Orbs | 2 floating animated orbs (CSS keyframes) |
| Aurora | Gradient color-shifting band |
| Film Grain | Subtle texture overlay |
| Dot Grid | Faint dot pattern |

### Custom CSS Animations

| Animation | Effect |
|-----------|--------|
| `animate-shimmer` | Sheen/glint effect sweeping across elements |
| `animate-pulse-gold` | Pulsing gold box-shadow |
| `animate-gradient-drift` | Slow horizontal drift for gradient orbs |
| `animate-mesh-1` | Float pattern #1 for mesh orbs |
| `animate-mesh-2` | Float pattern #2 for mesh orbs |
| `animate-aurora` | Color-shifting aurora gradient |

### Wizard Step Transitions

- **Direction-aware:** Slides left when advancing, right when going back
- **Spring physics:** Framer Motion spring with configurable stiffness/damping
- **Fade:** Opacity transition accompanies the slide

---

## State Management

### Zustand Store (`wizardStore.ts`)

The entire wizard state is managed by a single Zustand store with localStorage persistence.

### Store Shape

```typescript
interface WizardFormState {
  core: {
    title: string
    titleVerified: boolean
    type: TitleType | ""
    subtype: TitleSubtype | ""
    status: TitleStatus | ""
    year: string
    contributorRole: ContributorRole | ""
  }
  mandatory: {
    releaseDates: ReleaseDate[]
    miscLinks: MiscLink[]
  }
  identity: {
    countriesOfOrigin: string[]
    languages: string[]
    genres: string[]
    colorFormat: "color" | "bw" | ""
    colorAttribute: string
  }
  production: {
    budget: Budget
    officialSites: OfficialSite[]
    directors: ProductionDirector[]
    distributors: Distributor[]
    productionCompanies: ProductionCompany[]
  }
  credits: {
    majorCredits: { cast, self, writers, producers, composers, cinematographers, editors }
    recommendedInfo: { certificates, runningTimes, ... }
  }
  meta: {
    confidence: number
    warnings: string[]
    assumptions: string[]
  }
}
```

### Key Type Definitions

```typescript
type TitleType = "film" | "madeForTv" | "madeForVideo" | "musicVideo" | "podcastSeries" | "videoGame"
type TitleSubtype = "featureLength" | "shortSubject"
type TitleStatus = "released" | "limitedScreenings" | "completedNotShown" | "notComplete"
type ContributorRole = "producerDirectorWriter" | "castCrew" | "publicist" | "noneOfAbove"
```

### Store Actions

| Action | Purpose |
|--------|---------|
| `updateCore()` | Update core info fields |
| `updateMandatory()` | Update release dates/links |
| `updateIdentity()` | Update country/language/genre |
| `updateProduction()` | Update budget/directors/companies |
| `updateCredits()` | Update credit counts |
| `updateMeta()` | Update confidence/warnings |
| `addReleaseDate()` | Add a release date entry |
| `removeReleaseDate()` | Remove a release date entry |
| `addCountry()` / `removeCountry()` | Manage countries array |
| `addWarning()` / `removeWarning()` | Manage warnings |
| `addAssumption()` / `removeAssumption()` | Manage AI assumptions |
| `mergeVoiceParsed()` | Merge voice-parsed data into store |
| `resetForm()` | Clear all form data |
| `fillMockData()` | Populate with test data (dev only) |
| `hydrateForm()` | Load saved draft into store |

---

## Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useVoiceInput()` | `hooks/useVoiceInput.ts` | Wraps Web Speech API. Returns `{ listening, transcript, supported, start(), stop(), clear() }` |
| `useSupabaseDraft()` | `hooks/useSupabaseDraft.ts` | Manages draft lifecycle: load, auto-save (1s debounce), submit. Tracks `draftId` and `saveStatus` |
| `useAssistantGuidance()` | `hooks/useAssistantGuidance.ts` | Evaluates intents, selects tone, provides auto-fix suggestions. Tracks frustration and idle time |
| `useFieldGuidance()` | `hooks/useFieldGuidance.ts` | Generates per-field tips based on current field state and validation rules |
| `useStepValidation()` | `hooks/useStepValidation.ts` | Validates each wizard step's required fields. Returns completion status per step |
| `useTranscriptParser()` | `hooks/useTranscriptParser.ts` | Sends transcript to `/api/parse`, receives structured data, merges into store |

---

## Error Handling & Fallbacks

The application is designed to degrade gracefully at every level.

| Scenario | Behavior |
|----------|----------|
| **Voice API unavailable** | Shows "Not supported in this browser" message; text input remains available |
| **OpenRouter API error (429)** | Rate limit message; user fills fields manually |
| **OpenRouter API error (401/403)** | Auth error logged; empty parsed object returned |
| **OpenRouter API unavailable** | Returns `{ parsed: {}, assumptions: [] }`; manual entry fallback |
| **Supabase connection failure** | Draft creation retries; "Save failed" indicator shown |
| **Auth session expired** | Redirects to login page |
| **Speech recognition error** | Logs error; clears state; allows retry |
| **No speech detected** | Clear state and allow user to try again |
| **Invalid transcript parse** | Returns empty object; no fields overwritten |

---

## Deployment

### Netlify (Recommended)

The project includes a `netlify.toml` configuration file pre-configured for deployment.

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

**Configuration highlights:**
- Uses `@netlify/plugin-nextjs` for optimal Next.js support
- Automatic edge function deployment for API routes
- Environment variables configured in Netlify dashboard

### Manual Deployment

```bash
# Build the production bundle
npm run build

# Start the production server
npm run start
```

The `npm run build` output can be deployed to any Node.js hosting provider that supports Next.js 14.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on `localhost:3000` with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server (requires `build` first) |
| `npm run lint` | Run ESLint across the codebase |

---

## Known Gotchas

### Framer Motion + TypeScript Strict Types

String literals like `"easeOut"` or `"spring"` get widened to `string` by TypeScript, causing type errors with Framer Motion's animation types.

**Fix:** Use `as const` on individual string values:
```typescript
// Good
transition: { type: "spring" as const, ease: "easeOut" as const }

// Bad — makes arrays readonly, which Framer Motion rejects
const animation = { ... } as const
```

### Zustand v5 + useShallow

Selecting object slices from Zustand creates new references on every render, causing infinite re-render loops.

**Fix:** Use `useShallow()` wrapper:
```typescript
const { title, type } = useWizardStore(useShallow(s => ({ title: s.core.title, type: s.core.type })))
```

### TypeScript 5.5+ Inferred Type Predicates

`array.filter(x => x !== "foo")` narrows the element type, excluding `"foo"` from the union. This breaks subsequent `.includes()` calls.

**Fix:** Explicitly annotate the result:
```typescript
const result: WideType[] = arr.filter(x => x !== "foo")
```

### ESLint Global Directive

Comments starting with `/* global ` are interpreted as ESLint global variable declarations, not regular comments.

**Fix:** Rephrase or capitalize the comment to avoid the pattern.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Tips

- Run `npm run dev` for hot-reload development
- Use the **Fill Mock** button (dev mode only) to quickly populate the wizard with test data
- Use the **Assistant Dev Panel** (dev mode only) to test guidance intents
- Check the browser console for voice recognition status and API responses

---

## License

This project was built for the **Leeds Hackathon**. All rights reserved.

---

<div align="center">

**Built with passion for cinema.**

<img src="https://img.shields.io/badge/IMDb-Reimagined-%23f5c518?style=for-the-badge" />

</div>
