/* =========================================================
   IMDb Assistant — Intent-First Knowledge Base

   Architecture:
   - Each entry is a SINGLE intent with a unique ID
   - `triggers` are exact phrases / short patterns that map to this intent
   - `keywords` are individual words that boost match confidence
   - `variants` are 3-6 SHORT answers (~2-3 sentences, <300 chars)
   - Once an intent is matched, all others are ignored

   To extend: add a new IntentEntry. The matcher picks the
   single best intent based on trigger + keyword overlap.
   ========================================================= */

export interface IntentEntry {
  intent: string;
  triggers: string[];       // short phrases that strongly signal this intent
  keywords: string[];       // individual words that boost score
  variants: string[];       // 3-6 short answer variants
}

export const INTENTS: IntentEntry[] = [

  /* ---- GREETING ---- */
  {
    intent: "GREETING",
    triggers: ["hello", "hi", "hey", "hey there", "good morning", "good evening", "howdy"],
    keywords: [],
    variants: [
      "Hey. Ask me anything about the submission form, evidence, credits, or the review process.",
      "Hi there. I can help with any field on the form or answer questions about IMDb submissions.",
      "Hello. What do you need help with? I know the form inside and out.",
    ],
  },

  /* ---- THANKS ---- */
  {
    intent: "THANKS",
    triggers: ["thanks", "thank you", "thx", "cheers", "appreciate it", "got it", "perfect", "awesome", "great thanks"],
    keywords: [],
    variants: [
      "Anytime. Let me know if something else comes up.",
      "Glad that helped. I'm here if you need anything else.",
      "No problem. Keep going, you're doing well.",
    ],
  },

  /* ---- TITLE: HOW TO WRITE ---- */
  {
    intent: "HOW_TO_WRITE_TITLE",
    triggers: ["how to write title", "title format", "title rules", "how should i write", "perfect title", "correct title", "title capitalization", "how to name"],
    keywords: ["title", "name", "write", "format", "capitalize", "proper"],
    variants: [
      "Use the official release title exactly as it appears on the poster or marketing materials. Standard title case, no abbreviations.",
      "Enter the title as it would appear on an official poster. Use proper capitalization and include subtitles if any.",
      "Match the official release name exactly. If it has a subtitle like 'Part Two,' include the full thing. No nicknames or working titles.",
      "Type the title in standard title case using the official name. Check the press kit or poster if you're unsure about exact formatting.",
    ],
  },

  /* ---- TITLE: VERIFY ---- */
  {
    intent: "TITLE_VERIFY",
    triggers: ["verify button", "verify title", "check duplicate", "already exists", "title exists", "what does verify do"],
    keywords: ["verify", "duplicate", "exists", "check"],
    variants: [
      "The Verify button checks if this title already exists on IMDb. Always verify before submitting to avoid duplicates.",
      "It scans IMDb for matching titles. If a match is found, you should update the existing page instead of creating a new one.",
      "Verify checks for duplicates in the IMDb database. It's a required step that saves you and the review team time.",
    ],
  },

  /* ---- TITLE TYPE ---- */
  {
    intent: "TITLE_TYPE",
    triggers: ["title type", "what type", "which type", "film or tv", "type of title", "type field", "what is title type"],
    keywords: ["type", "film", "tv", "streaming", "video", "podcast", "game"],
    variants: [
      "Pick the type matching the primary release: Film for theatrical, Made for TV for TV movies, Made for Video for streaming-first or direct-to-video.",
      "'Film' = theatrical release. 'Made for TV' = TV movies/specials. 'Made for Video' = streaming or straight-to-video. Pick by how it was first distributed.",
      "Choose based on the widest release format. Netflix originals are usually 'Made for Video.' Festival-then-theatrical is 'Film.'",
    ],
  },

  /* ---- SUBTYPE ---- */
  {
    intent: "SUBTYPE",
    triggers: ["subtype", "sub-type", "feature length", "short subject", "short film", "feature vs short"],
    keywords: ["subtype", "feature", "short", "length", "runtime"],
    variants: [
      "Feature Length is 40+ minutes. Short Subject is under 40 minutes. Pick whichever matches your runtime.",
      "Over 40 minutes? Feature Length. Under 40? Short Subject. Most theatrical releases are feature length.",
      "The subtype just distinguishes shorts from features. The cutoff is roughly 40 minutes.",
    ],
  },

  /* ---- YEAR ---- */
  {
    intent: "YEAR_RULES",
    triggers: ["release year", "what year", "year format", "unknown year", "????", "question marks", "year field"],
    keywords: ["year", "yyyy", "date", "unknown"],
    variants: [
      "Enter a 4-digit year (e.g., 2024). If the year is genuinely unknown, use '????' — but only for truly undetermined dates, not titles in production.",
      "Use the year of the first public showing. For festival premieres, use the festival year. Enter '????' only if the date can't be determined at all.",
      "4-digit year, matching the first public release. Still in production? Use the expected year. Truly unknown? Enter '????'.",
    ],
  },

  /* ---- STATUS ---- */
  {
    intent: "STATUS",
    triggers: ["status field", "release status", "unreleased", "in production", "completed not shown", "limited screenings", "what status"],
    keywords: ["status", "released", "production", "complete", "screening"],
    variants: [
      "'Released' = publicly available. 'Limited screenings' = festival or private only. 'Completed but not shown' = finished, no public debut yet. 'Not complete' = still in production.",
      "Pick the current state: Released if anyone can watch it, Limited screenings for festivals only, Not complete if still filming or in post.",
      "Even one festival screening counts as 'Limited screenings.' If it's wrapped but never shown publicly, use 'Completed but not yet shown.'",
    ],
  },

  /* ---- EVIDENCE: WHAT COUNTS ---- */
  {
    intent: "WHAT_IS_EVIDENCE",
    triggers: ["what is evidence", "what counts as evidence", "evidence links", "what evidence", "valid evidence", "proof", "how to prove"],
    keywords: ["evidence", "proof", "link", "source", "valid"],
    variants: [
      "Evidence is a URL proving your title exists. Press releases, official websites, trade articles (Variety, Deadline), and festival listings all work.",
      "Link to official sources: studio websites, news articles, festival programs, or verified social media. You need at least one, but 2-3 is stronger.",
      "Any publicly accessible page confirming the title's existence. Official sites, press coverage, and distributor announcements are ideal.",
    ],
  },

  /* ---- EVIDENCE: BAD SOURCES ---- */
  {
    intent: "EVIDENCE_INVALID",
    triggers: ["wikipedia evidence", "blog evidence", "fan site", "bad evidence", "invalid evidence", "what not to use", "broken link"],
    keywords: ["wikipedia", "blog", "fan", "invalid", "broken", "expired", "reddit"],
    variants: [
      "Wikipedia, personal blogs, fan sites, and unverified social media are not accepted. Use the original sources cited on Wikipedia instead.",
      "Avoid user-edited sources like Wikipedia or Reddit. IMDb needs authoritative, independently verifiable links.",
      "Broken links, fan pages, and blogs won't pass review. Stick to official press, trade publications, or verified accounts.",
    ],
  },

  /* ---- RELEASE DATES ---- */
  {
    intent: "RELEASE_DATES",
    triggers: ["release date", "release dates", "add date", "premiere date", "when released", "date format", "date field"],
    keywords: ["release", "date", "premiere", "country", "month"],
    variants: [
      "Each entry needs a country, month, and year. Day is optional. Add separate entries for different countries or release types.",
      "Enter the earliest known public showing. If it premiered at a festival, add that as one entry, plus the general release as another.",
      "At minimum: country + month + year. Multiple releases in different markets should each be their own entry.",
    ],
  },

  /* ---- COUNTRY OF ORIGIN ---- */
  {
    intent: "COUNTRY_ORIGIN",
    triggers: ["country of origin", "countries of origin", "where made", "production country", "filming location vs origin"],
    keywords: ["country", "origin", "produced", "filmed", "made"],
    variants: [
      "Country of origin = where it was produced or financed, not where the story is set. List the lead production country first.",
      "This is about production, not setting. A film set in Tokyo but produced in the US lists United States. For co-productions, add all countries.",
      "Where was the money and production based? That's your country of origin. Filming locations are a separate concept.",
    ],
  },

  /* ---- LANGUAGES ---- */
  {
    intent: "LANGUAGES",
    triggers: ["language field", "what language", "add language", "spoken language", "subtitle language", "dialogue language"],
    keywords: ["language", "spoken", "dialogue", "subtitle", "dubbed"],
    variants: [
      "Add every language with spoken dialogue. Mark each as Primary, Secondary, or Subtitled only. Even brief scenes in another language count.",
      "List the main spoken language first, then any secondary ones. If a language only appears in subtitles, mark it 'Subtitled only.'",
      "Enter all spoken languages. The attribute dropdown lets you specify primary vs. secondary vs. subtitle-only for each.",
    ],
  },

  /* ---- GENRES ---- */
  {
    intent: "GENRES",
    triggers: ["genre", "genres", "how many genres", "which genre", "genre selection", "too many genres"],
    keywords: ["genre", "drama", "comedy", "action", "thriller", "horror"],
    variants: [
      "Pick 3 to 5 genres that best describe the title. Too many dilutes discoverability. Focus on the primary themes.",
      "Select the genres your audience would use to describe this title. IMDb recommends 3-5. Quality over quantity.",
      "Think: how would a viewer categorize this? Those are your genres. Three to five well-chosen ones outperform eight vague ones.",
    ],
  },

  /* ---- BUDGET ---- */
  {
    intent: "BUDGET",
    triggers: ["budget field", "production budget", "how to enter budget", "budget format", "budget required"],
    keywords: ["budget", "cost", "money", "amount", "currency"],
    variants: [
      "Enter a whole number without commas or symbols, then select the currency. For $45M, type 45000000 and pick USD.",
      "Budget is the total production cost. Enter it as a plain number. If it's confidential, a reasonable estimate works.",
      "Whole number, no formatting. Pick the currency from the dropdown. Under $1,000 may flag for review.",
    ],
  },

  /* ---- DIRECTORS ---- */
  {
    intent: "DIRECTORS",
    triggers: ["director field", "add director", "co-director", "who directed", "directors section", "multiple directors"],
    keywords: ["director", "directed", "helmed"],
    variants: [
      "Add at least one director with their full name. For co-directors, add each as a separate entry and note it in the attribute field.",
      "Enter the director's professional name as it should appear on IMDb. Multiple directors each get their own entry.",
      "Every title needs at least one director. Use full names. The attribute field can note 'co-director' or 'also producer.'",
    ],
  },

  /* ---- CREDITS: MAJOR ---- */
  {
    intent: "CREDITS_MAJOR",
    triggers: ["major credits", "credit categories", "minimum credits", "3 categories", "three categories", "how many credits", "cast writers producers"],
    keywords: ["credit", "credits", "cast", "writers", "producers", "minimum", "categories"],
    variants: [
      "Fill at least 3 of the 7 major categories: Cast, Self, Writers, Producers, Composers, Cinematographers, Editors. Pick the ones most relevant to your title.",
      "You need 3+ categories with at least one credit each. A typical film might fill Cast, Writers, and Producers.",
      "Three major credit categories is the minimum for approval. Start with the ones you're most confident about.",
    ],
  },

  /* ---- REJECTION REASONS ---- */
  {
    intent: "REJECTION_REASONS",
    triggers: ["why rejected", "rejection reason", "submission denied", "why was it rejected", "common rejections", "avoid rejection", "get rejected"],
    keywords: ["reject", "rejected", "denied", "refused", "fail"],
    variants: [
      "Top reasons: weak evidence, duplicate title, missing required fields, or ineligible content. Strong evidence links are the single biggest factor.",
      "Most rejections come from insufficient evidence or titles that already exist. Always verify first and provide 2-3 solid links.",
      "Incomplete fields, broken evidence links, and unverifiable information are the usual culprits. Aim for 70%+ confidence before submitting.",
    ],
  },

  /* ---- CONFIDENCE SCORE ---- */
  {
    intent: "CONFIDENCE_SCORE",
    triggers: ["confidence score", "confidence percentage", "what is confidence", "how is score calculated", "score meaning", "progress score"],
    keywords: ["confidence", "score", "percentage", "progress"],
    variants: [
      "It estimates approval likelihood based on completeness and data quality. Green (70%+) is strong. It updates as you fill fields.",
      "The score reflects how complete and accurate your submission is. Verified title, valid evidence, and 3+ credits give the biggest boosts.",
      "Think of it as a health check. Above 70% means you're in good shape. Below 40% means key fields are likely missing.",
    ],
  },

  /* ---- VOICE INPUT ---- */
  {
    intent: "VOICE_INPUT",
    triggers: ["voice input", "microphone", "mic button", "speech to text", "speak instead of type", "dictate"],
    keywords: ["voice", "mic", "speech", "speak", "dictate", "listening"],
    variants: [
      "Click the mic icon and speak. Your words appear in the text field. Review and edit before sending — it won't auto-submit.",
      "Voice input converts speech to text using your browser. Works best in Chrome/Edge. You can edit the transcript before sending.",
      "Tap the mic, speak clearly, then review the text. It won't send automatically. Not all browsers support this feature.",
    ],
  },

  /* ---- WHAT IS IMDB ---- */
  {
    intent: "WHAT_IS_IMDB",
    triggers: ["what is imdb", "about imdb", "tell me about imdb"],
    keywords: ["imdb", "internet", "movie", "database"],
    variants: [
      "IMDb is the world's largest entertainment database. As a contributor, you're adding titles that millions of people rely on daily.",
      "The Internet Movie Database catalogs films, TV, and more with cast, crew, and production details. Your submission adds to that record.",
      "IMDb is the industry-standard reference for entertainment. Contributing means your title becomes part of a permanent, globally used resource.",
    ],
  },

  /* ---- HOW SUBMISSIONS WORK ---- */
  {
    intent: "HOW_SUBMISSIONS_WORK",
    triggers: ["how does this work", "submission process", "how to submit", "how do i contribute", "steps to submit", "how do contributions work"],
    keywords: ["how", "submit", "process", "steps", "contribute"],
    variants: [
      "Five steps: Core info, Evidence & dates, Identity, Production, then Credits. Fill each, hit submit, and a reviewer processes it within 5-10 days.",
      "Fill the form step by step. The system validates as you go and shows a confidence score. After submission, IMDb reviewers verify everything.",
      "Work through each tab: title basics, evidence links, identity details, production info, credits. Submit when confident. Review takes about a week.",
    ],
  },

  /* ---- CONTRIBUTOR ROLE ---- */
  {
    intent: "CONTRIBUTOR_ROLE",
    triggers: ["contributor role", "my role", "what role should i pick", "i am a producer", "i am a director", "role field"],
    keywords: ["role", "contributor", "publicist", "producer", "writer"],
    variants: [
      "Pick the role that matches your connection. Director/Producer/Writer for those credits. Cast/Crew if you worked on set. Publicist if you represent the title.",
      "If you hold a creative credit, pick Producer/Director/Writer. Worked on the production? Cast/Crew. Representing it professionally? Publicist.",
      "Your role helps route the review. It doesn't affect approval odds. Just pick the most accurate description of your connection.",
    ],
  },

  /* ---- SAVE / RESUME ---- */
  {
    intent: "SAVE_PROGRESS",
    triggers: ["save progress", "save draft", "come back later", "will i lose my work", "auto save", "resume later"],
    keywords: ["save", "draft", "progress", "resume", "later", "lose"],
    variants: [
      "Your progress auto-saves as you type. You can close the browser and return anytime — your draft will be waiting.",
      "The form saves continuously. There's also a 'Save for Later' button on the last step for extra peace of mind.",
      "Don't worry about losing work. Everything is saved to the cloud automatically. Come back anytime to pick up where you left off.",
    ],
  },

  /* ---- REVIEW TIMELINE ---- */
  {
    intent: "REVIEW_TIMELINE",
    triggers: ["how long does review take", "review time", "when will it be approved", "how long to wait", "review timeline"],
    keywords: ["review", "long", "wait", "days", "approved", "timeline"],
    variants: [
      "Typically 5-10 business days. Strong evidence and high confidence scores tend to move faster. You'll get an email either way.",
      "Expect about one to two weeks. Straightforward submissions with solid evidence are often processed on the quicker end.",
      "Reviews run 5-10 business days. You'll receive an email when it's approved or if the team needs more information.",
    ],
  },

  /* ---- AFTER SUBMISSION ---- */
  {
    intent: "AFTER_SUBMIT",
    triggers: ["after i submit", "what happens next", "after submission", "submitted now what", "post submission"],
    keywords: ["after", "submit", "next", "happens", "done"],
    variants: [
      "Your title enters the review queue. A reviewer checks evidence, verifies details, and either approves it or asks for corrections via email.",
      "It goes to the review team. They verify evidence and data accuracy. If approved, the title page goes live within a few days.",
      "After submit, IMDb reviewers handle the rest. They check for duplicates, validate evidence, and create the page if everything checks out.",
    ],
  },

  /* ---- COLOR FORMAT ---- */
  {
    intent: "COLOR_FORMAT",
    triggers: ["color format", "black and white", "color or bw", "monochrome"],
    keywords: ["color", "monochrome", "bw"],
    variants: [
      "Pick Color or Black & White based on the predominant format. If it mixes both, choose the main one and note the other in the attribute field.",
      "Most modern titles are Color. Select Black & White for monochrome productions. Use the attribute for specifics like 'Partial B&W.'",
    ],
  },

  /* ---- DISTRIBUTORS ---- */
  {
    intent: "DISTRIBUTORS",
    triggers: ["distributor", "distributors", "distribution company", "who distributes"],
    keywords: ["distributor", "distribution"],
    variants: [
      "Add the company name, region, and distribution type (theatrical, digital, etc.). This section is optional if you don't have distribution details yet.",
      "Distributors handle release and marketing by region. Add each with their territory and type. For worldwide rights, just select 'Worldwide.'",
    ],
  },

  /* ---- PRODUCTION COMPANIES ---- */
  {
    intent: "PRODUCTION_COMPANIES",
    triggers: ["production company", "production companies", "studio", "who produced"],
    keywords: ["production", "company", "studio", "produced"],
    variants: [
      "Add the companies that financed or produced the title. List the lead company first. Use the attribute for notes like 'in association with.'",
      "Enter each production company and an optional attribute like 'presents' or 'co-production.' This appears on the IMDb title page.",
    ],
  },

  /* ---- OFFICIAL SITES ---- */
  {
    intent: "OFFICIAL_SITES",
    triggers: ["official site", "official sites", "official website", "title website"],
    keywords: ["official", "site", "website"],
    variants: [
      "Add URLs for pages officially tied to the title: production website, dedicated title site, or verified social profiles. Not personal blogs.",
      "These are web pages directly associated with the title that appear on its IMDb page. Enter a URL and a brief description for each.",
    ],
  },

  /* ---- MUSIC VIDEO ---- */
  {
    intent: "MUSIC_VIDEO",
    triggers: ["music video", "submit music video", "mv submission", "artist song"],
    keywords: ["music", "video", "artist", "song"],
    variants: [
      "Select 'Music Video' as the type. Format the title as 'Artist: Song Title.' Use the official video URL as evidence and credit the director.",
      "Music video titles follow the 'Artist: Song Name' convention. You'll need a director credit and a link to the official video.",
    ],
  },

  /* ---- RECOMMENDED INFO ---- */
  {
    intent: "RECOMMENDED_INFO",
    triggers: ["recommended information", "optional fields", "trivia", "plot summary", "running time", "certificates", "filming locations"],
    keywords: ["recommended", "optional", "trivia", "plot", "runtime", "tagline", "certificate"],
    variants: [
      "These are optional extras like runtime, certificates, filming locations, and trivia. Not required for approval but they enrich the page.",
      "Recommended info is bonus content. Add what you can now and update after approval. Running times and plot summaries are the most valued.",
    ],
  },
];

/* =========================================================
   FALLBACK — when no intent matches
   ========================================================= */

export const FALLBACK_VARIANTS = [
  "I can help with form fields, evidence rules, credits, and the review process. Could you rephrase that?",
  "I'm not sure I follow. Try asking about a specific field like title, evidence, genres, or credits.",
  "That's outside what I cover. Ask me about any form field, submission rules, or the review process.",
  "I didn't catch that. I know about titles, evidence links, release dates, credits, and rejection reasons.",
];
