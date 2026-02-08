-- =========================================================
-- help_qa — Q&A table for the AI Help panel
-- Run this in your Supabase SQL editor to create & seed.
-- =========================================================

create table if not exists public.help_qa (
  id        uuid primary key default gen_random_uuid(),
  question  text not null,
  answer    text not null,
  keywords  text not null default '',
  category  text not null default 'general'
);

alter table public.help_qa enable row level security;

-- Allow public reads (no auth required)
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'Public read' and tablename = 'help_qa'
  ) then
    create policy "Public read" on public.help_qa for select using (true);
  end if;
end $$;

-- =========================================================
-- Seed data — 45 rows across 7 categories
-- =========================================================

-- ---- evidence (8) ----

insert into public.help_qa (question, answer, keywords, category) values
(
  'What counts as valid evidence for my submission?',
  'Valid evidence includes official studio or distributor websites, press releases from trade publications (Variety, Deadline, THR), news articles from reputable outlets, and festival or market screening listings. Social media posts from verified official accounts are also acceptable.',
  'evidence valid proof link url acceptable',
  'evidence'
),
(
  'Can I use social media as evidence?',
  'Official social media pages from the production company or verified cast/crew accounts are acceptable. Personal fan pages, unverified accounts, or user-generated content on platforms like Reddit are not considered reliable evidence.',
  'social media twitter instagram facebook evidence',
  'evidence'
),
(
  'Is Wikipedia accepted as evidence?',
  'No, Wikipedia is not accepted as a primary evidence source because it is user-edited and can be changed by anyone. Use the original sources cited in Wikipedia articles instead — those are usually acceptable.',
  'wikipedia wiki evidence source',
  'evidence'
),
(
  'What if my evidence link is broken?',
  'Broken or expired links will cause your submission to be rejected. Use the Wayback Machine (web.archive.org) to find archived versions, or replace the link with a current, working URL from the same or equivalent source.',
  'broken link expired url dead 404',
  'evidence'
),
(
  'Can I use a trailer as evidence?',
  'Yes, an official trailer on YouTube or Vimeo from a verified account is good evidence. Make sure it is from the official production company or distributor channel, not a fan-uploaded copy.',
  'trailer video youtube vimeo evidence',
  'evidence'
),
(
  'Can I use a crowdfunding page as evidence?',
  'Crowdfunding pages (Kickstarter, Indiegogo) can serve as evidence for titles in production. They demonstrate the project exists and is being actively developed. Include additional evidence if the campaign is completed.',
  'crowdfunding kickstarter indiegogo evidence',
  'evidence'
),
(
  'How many evidence links should I add?',
  'At least one evidence link is required, but adding 2-3 different sources strengthens your submission. Diverse evidence (e.g., a press release plus a festival listing) is more convincing than multiple links to the same source.',
  'evidence links how many number count',
  'evidence'
),
(
  'Can I use my own website as evidence?',
  'A personal website alone is usually insufficient evidence. However, an official production website combined with at least one independent third-party source (news article, festival listing) makes a strong case.',
  'personal website own site evidence',
  'evidence'
);

-- ---- dates (7) ----

insert into public.help_qa (question, answer, keywords, category) values
(
  'Can I submit a partial release date?',
  'You need at least the country, month, and year for each release date entry. The day field is optional. If you only know the year, enter it with the month set to January as an estimate and add a note explaining the approximation.',
  'partial date incomplete month year',
  'dates'
),
(
  'What release type should I choose?',
  'Choose "Theatrical" for cinema releases, "Digital / Streaming" for platforms like Netflix or iTunes, "Physical" for DVD/Blu-ray, "TV Premiere" for first TV broadcast, and "Festival" for film festival screenings. Pick the type that best matches the first public showing.',
  'release type theatrical digital festival streaming',
  'dates'
),
(
  'Can I add festival screening dates?',
  'Yes, festival screenings count as release dates. Select "Festival" as the release type and add the country where the festival took place. Include the festival name in the note field (e.g., "Sundance Film Festival").',
  'festival screening premiere date',
  'dates'
),
(
  'What year format should I use?',
  'Enter the year as a 4-digit number (e.g., 2024). If the release year is completely unknown, you can enter "????" in the release year field on the Core step. Each release date entry requires a specific 4-digit year.',
  'year format yyyy four digit',
  'dates'
),
(
  'Can I add multiple release dates?',
  'Yes, you should add release dates for each country or market where the title was released. Different formats (theatrical vs. streaming) in the same country should be separate entries. This helps IMDb show accurate regional availability.',
  'multiple release dates countries',
  'dates'
),
(
  'What if my title has not been released yet?',
  'If your title is not yet released, set the status to "Not yet complete" or "Completed but not yet shown" on the Core step. You can still add anticipated release dates — just note in the description that these are planned dates.',
  'unreleased not released yet upcoming',
  'dates'
),
(
  'Should I include the premiere date?',
  'Yes, the premiere date is valuable. If the title premiered at a festival before its general release, add both: the festival premiere as one entry and the general release as another. The premiere is often the earliest date on record.',
  'premiere first showing date',
  'dates'
);

-- ---- core (7) ----

insert into public.help_qa (question, answer, keywords, category) values
(
  'What is the difference between title types?',
  '"Film" is for theatrically released movies. "Made for TV" covers TV movies and specials. "Made for Video" is for straight-to-video or streaming-first releases. "Music Video", "Podcast Series", and "Video Game" are self-explanatory categories.',
  'title type film tv video difference',
  'core'
),
(
  'Can I add a TV series?',
  'This form is currently designed for non-episodic titles (films, TV movies, music videos, etc.). TV series with multiple episodes have a different submission process on IMDb. Use this form for standalone titles or TV specials.',
  'tv series show television episodes',
  'core'
),
(
  'How do I submit an unreleased title?',
  'Set the status to "Not yet complete" if still in production, or "Completed but not yet shown" if finished but not publicly released. You will still need evidence that the project exists (press release, production company announcement).',
  'unreleased upcoming in production not released',
  'core'
),
(
  'What if I do not know the release year?',
  'Enter "????" (four question marks) in the release year field. This tells IMDb that the year is genuinely unknown. Only use this for older titles or projects with truly undetermined release dates — not for titles still in production.',
  'unknown year question marks ????',
  'core'
),
(
  'What does the Verify button do?',
  'The Verify button checks whether a title with the same name already exists on IMDb. This helps prevent duplicate submissions. Always verify before proceeding — if a match is found, you may need to update the existing entry instead of creating a new one.',
  'verify button check duplicate title',
  'core'
),
(
  'What contributor role should I select?',
  'Select "Producer, Director, or Writer" if you hold any of those credits. Choose "Cast or Crew" if you acted in or worked on the production. Pick "Publicist" if you represent the title professionally. Select "None of the above" if you are a fan or journalist.',
  'contributor role producer director writer cast crew',
  'core'
),
(
  'Can I submit a music video?',
  'Yes, select "Music Video" as the title type. You will need the artist name as part of the title, the director in production credits, and evidence such as the official video URL or a press release about its release.',
  'music video submit add',
  'core'
);

-- ---- identity (6) ----

insert into public.help_qa (question, answer, keywords, category) values
(
  'How many genres should I select?',
  'IMDb recommends selecting 3 to 5 genres. Choose the genres that most accurately describe the primary themes and style of the title. Selecting too many genres dilutes discoverability and may cause your submission to be flagged for review.',
  'genres how many count number recommend',
  'identity'
),
(
  'What if my language is not listed?',
  'Type the language name directly into the input field — you are not limited to the dropdown suggestions. IMDb supports hundreds of languages. Make sure to spell the language name correctly in English (e.g., "Tagalog", "Swahili").',
  'language not listed missing unlisted custom',
  'identity'
),
(
  'Can I add a custom genre?',
  'You can type a custom genre into the genre input field. However, IMDb may map it to an existing standard genre during review. For best results, use the standard genres provided in the chip selector whenever possible.',
  'custom genre add new',
  'identity'
),
(
  'What is country of origin?',
  'Country of origin is where the title was primarily produced or financed — not where it is set or where the story takes place. For co-productions, add all countries involved in the production. Order matters: list the primary production country first.',
  'country origin production where made',
  'identity'
),
(
  'What is the color format field?',
  'Select "Color" if the title was filmed or rendered in color, or "Black & White" if it was produced in monochrome. If the title mixes both, choose the predominant format and note the other in the attribute field (e.g., "Partial B&W").',
  'color black white format bw monochrome',
  'identity'
),
(
  'Can I add multiple countries of origin?',
  'Yes, add all countries involved in the production. This is common for international co-productions. The order matters — list the lead production country first, followed by co-production partners in order of their contribution.',
  'multiple countries co-production international',
  'identity'
);

-- ---- production (6) ----

insert into public.help_qa (question, answer, keywords, category) values
(
  'Is the budget field required?',
  'Budget is listed as required in the form, but IMDb understands that exact figures may be confidential. Enter your best estimate if the exact budget is not public. For very low-budget independent titles, even a rough estimate is helpful.',
  'budget required mandatory confidential',
  'production'
),
(
  'What format should the budget be in?',
  'Enter the budget as a whole number without commas, decimal points, or currency symbols. Select the currency from the dropdown. For example, a $45 million budget would be entered as 45000000 with USD selected.',
  'budget format number amount currency',
  'production'
),
(
  'What are distributors?',
  'Distributors are companies that handle the release and marketing of the title in specific regions. They may hold theatrical rights, home video rights, or digital distribution rights. Add all known distributors with their regions and distribution types.',
  'distributor distribution company release',
  'production'
),
(
  'What goes in the company attribute field?',
  'The attribute field adds context to a production company credit, such as "co-production", "in association with", "presents", or "in partnership with". Leave it blank if the company is a straightforward production credit.',
  'attribute company production field',
  'production'
),
(
  'Can a title have co-directors?',
  'Yes, add each director as a separate entry. You can note "co-director" in the attribute field to clarify the arrangement. Both directors should have the role set to "Director" unless one held a different title like "Second Unit Director".',
  'co-directors multiple directors two',
  'production'
),
(
  'What are official sites?',
  'Official sites are web pages directly associated with the title, such as the production company website, a dedicated title website, or an official social media page. These are displayed on the IMDb title page for viewers to visit.',
  'official sites website url link',
  'production'
);

-- ---- credits (6) ----

insert into public.help_qa (question, answer, keywords, category) values
(
  'What is the minimum credit requirement?',
  'You need to fill at least 3 major credit categories (e.g., Cast, Writers, Producers). This ensures the title has enough verifiable information. You do not need to fill every category — just the ones relevant to your title.',
  'minimum credits required three 3 categories',
  'credits'
),
(
  'What are the major credit categories?',
  'Major credits include: Cast (actors), Self (people appearing as themselves), Writers, Producers, Composers (music), Cinematographers, and Editors. Select the number of credits you plan to add in each relevant category.',
  'major credits categories cast writers producers',
  'credits'
),
(
  'How many cast members should I add?',
  'There is no strict minimum for cast, but adding at least the lead actors strengthens your submission. For feature films, 5-10 principal cast members is a good starting point. You can always add more after the initial submission.',
  'cast members actors how many',
  'credits'
),
(
  'What is the difference between major and recommended?',
  'Major credits are the primary creative roles (cast, writers, directors, etc.) and at least 3 categories are required. Recommended information includes supplementary data like certificates, running times, filming locations, and trivia — these are optional but improve the title page.',
  'major recommended difference optional required',
  'credits'
),
(
  'Can I add more credits after submission?',
  'Yes, you can add and update credits after your initial submission is approved. IMDb allows ongoing updates to title pages. Focus on meeting the 3-category minimum for initial approval, then enhance the page over time.',
  'add credits later after update edit',
  'credits'
),
(
  'What does No Change mean in the credit dropdown?',
  'Selecting "No change" (0) means you are not adding any credits in that category. Choose a number greater than 0 to indicate how many credits you plan to submit. You will enter the actual names and details in a later step.',
  'no change zero 0 credit dropdown select',
  'credits'
);

-- ---- general (5) ----

insert into public.help_qa (question, answer, keywords, category) values
(
  'Why might my submission be rejected?',
  'Common rejection reasons include: insufficient or invalid evidence links, duplicate titles already on IMDb, incomplete required fields, unverifiable information, and titles that do not meet IMDb eligibility criteria (e.g., home videos, school projects without public distribution).',
  'rejected rejection reason why denied',
  'general'
),
(
  'How long does review take?',
  'IMDb typically reviews new title submissions within 5-10 business days. Complex submissions or those requiring additional verification may take longer. You will receive an email notification when your submission is approved or if additional information is needed.',
  'review time how long wait days',
  'general'
),
(
  'Can I save my progress and continue later?',
  'Yes, use the "Save for Later" button at the bottom of the last step to save your current progress. Your draft is automatically saved to the cloud as you fill in fields. You can return to this page later to continue where you left off.',
  'save progress draft continue later resume',
  'general'
),
(
  'What is the confidence score?',
  'The confidence score estimates how likely your submission is to be approved based on completeness and data quality. A higher score means more fields are filled correctly. Aim for 70% or above for the best chance of approval, though lower scores can still succeed.',
  'confidence score percentage number meaning',
  'general'
),
(
  'What happens after I submit?',
  'After submission, your title enters the IMDb review queue. A reviewer will verify your evidence, check for duplicates, and validate the information. If approved, the title page goes live. If issues are found, you will be contacted for corrections.',
  'after submit next step what happens review',
  'general'
);
