import type { AssistantIntent } from "./intents";

/* =========================================================
   Variant Pools — 10-15 templates per intent
   Professional IMDb-editor tone. Placeholders: {fieldName},
   {confidence}, {nextAction}, {missingCount}
   ========================================================= */

export const VARIANT_POOLS: Record<AssistantIntent, string[]> = {
  MISSING_EVIDENCE: [
    "Every title needs at least one evidence link. Add a URL that proves this title exists.",
    "IMDb requires supporting evidence. Add a link to an official source or press release.",
    "No evidence links yet. Include a verifiable URL — press coverage, festival listing, or official page.",
    "Submissions without evidence are flagged for review. Add a supporting link now.",
    "Evidence is required before submission. A trailer link, distributor page, or news article works well.",
    "Add an evidence URL to support this title's existence. Official sources are preferred.",
    "Missing evidence link. Festival listings, distributor pages, and press articles all qualify.",
    "No supporting links found. IMDb needs at least one verifiable source.",
    "Your submission needs proof. Add an evidence link — even a social media announcement counts.",
    "Evidence links are mandatory. Add a URL that independently confirms this title.",
    "A verifiable source is required. Link to any official page, article, or announcement.",
    "No evidence provided yet. Add a link so reviewers can verify this title.",
  ],

  MISSING_RELEASE_DATE: [
    "Add at least one release date. Even an approximate date helps.",
    "Release date is required. Include the country, month, and year at minimum.",
    "No release dates yet. Add when and where this title was first shown.",
    "Every title needs a release date. Festival premieres count too.",
    "Missing release date. If unreleased, add the planned or expected date.",
    "Add a release date entry — country, date, and release type.",
    "Release information is required. Include at least one market and date.",
    "No release dates found. This is a required field for submission.",
    "A release date is needed. Even partial dates (month + year) are accepted.",
    "Release date missing. Theatrical, digital, or festival — any type works.",
    "Add the release date to proceed. Specify country and date.",
    "Submissions require at least one release date. Add it in the Mandatory step.",
  ],

  CREDITS_REQUIRED: [
    "At least 3 credit categories need entries. Currently {missingCount} short.",
    "Fill in more credits — {missingCount} more categories needed to meet the minimum.",
    "IMDb requires at least 3 credit types. Add cast, writers, producers, or others.",
    "Credit information is incomplete. Add entries in {missingCount} more categories.",
    "More credits needed. Cast, writers, and producers are the most common starting point.",
    "You need {missingCount} more credit categories. Each needs at least 1 entry.",
    "Credits are below minimum. Fill in at least 3 of the 7 available categories.",
    "Add more credit entries. Directors, writers, and cast are recommended.",
    "Incomplete credits — {missingCount} more categories required.",
    "The submission needs more credits. Start with the principal cast and key crew.",
    "Major credits are incomplete. Add entries in {missingCount} more categories to qualify.",
  ],

  YEAR_FORMAT: [
    "Release year is missing. Enter a 4-digit year.",
    "Add the release year. If unknown, you can mark it as such.",
    "Year is required. Enter the year this title was first released.",
    "No release year set. This is needed for the title record.",
    "The release year field is empty. Add it to proceed.",
    "Year is missing. Even an estimated year helps with cataloging.",
    "Release year not set. Enter when this title was or will be released.",
    "A release year is required for all submissions.",
    "Add the year of release. This is a required field.",
    "Missing year. All titles need at least a release year.",
  ],

  TYPE_SUBTYPE_MISMATCH: [
    "Music videos are typically short-form. \"Feature Length\" may not apply here.",
    "Check the subtype — music videos are usually classified as Short Subject.",
    "Type and subtype may conflict. Music videos are rarely feature-length.",
    "The subtype \"Feature Length\" seems unusual for a music video. Please verify.",
    "Potential mismatch: music videos are generally short subjects, not features.",
    "Review the subtype selection. Feature-length music videos are uncommon.",
    "Type/subtype conflict detected. Consider changing subtype to Short Subject.",
    "Music Video + Feature Length is an unusual combination. Is this correct?",
    "This combination is flagged — most music videos are short subjects.",
    "Double-check: is this music video truly feature-length?",
  ],

  TITLE_CAPITALIZATION: [
    "The title starts with a lowercase letter. Consider capitalizing it.",
    "Title capitalization: \"{fieldName}\" — should the first letter be uppercase?",
    "Titles typically start with a capital letter. You can auto-fix this.",
    "Lowercase title detected. IMDb titles usually use title case.",
    "The title appears to start lowercase. Would you like to capitalize it?",
    "Check capitalization — \"{fieldName}\" may need an uppercase first letter.",
    "Title formatting: consider capitalizing the first character.",
    "IMDb style guide recommends title case. Current title starts lowercase.",
    "Capitalization note: the title begins with a lowercase letter.",
    "Quick fix available: capitalize the title's first letter.",
  ],

  NEXT_BEST_ACTION: [
    "Next step: {nextAction}.",
    "Recommended: {nextAction}.",
    "To improve your submission, {nextAction}.",
    "Your next move: {nextAction}.",
    "Keep going — {nextAction}.",
    "Focus on: {nextAction}.",
    "Up next: {nextAction}.",
    "Suggestion: {nextAction}.",
    "Progress tip: {nextAction}.",
    "To move forward, {nextAction}.",
    "Action needed: {nextAction}.",
    "The next priority is to {nextAction}.",
  ],

  ALMOST_READY: [
    "Looking strong at {confidence}%. Just a few details left.",
    "Almost there — {confidence}% confidence. Review and submit when ready.",
    "Great progress! Score is {confidence}%. Final checks recommended.",
    "Submission is nearly complete at {confidence}%.",
    "{confidence}% confidence. The finish line is close.",
    "Well done — {confidence}%. Consider reviewing before submitting.",
    "Your submission scores {confidence}%. Nearly ready to go.",
    "Strong submission at {confidence}%. Polish any remaining details.",
    "At {confidence}%, you're in great shape. Final review time.",
    "Excellent work — {confidence}% and counting.",
    "{confidence}% confidence achieved. Just finishing touches remain.",
  ],

  IDLE_NUDGE: [
    "Still working? Let me know if you need guidance.",
    "Take your time — I'm here when you're ready to continue.",
    "Need help deciding what to fill in next?",
    "Whenever you're ready, there are still fields to complete.",
    "Paused? No rush — pick up where you left off anytime.",
    "I can suggest what to work on next if you'd like.",
    "Ready to continue? Check the sidebar for remaining items.",
    "Still here. The checklist shows what's left to do.",
    "Looking for what's next? I can point you in the right direction.",
    "Don't forget — your progress is saved automatically.",
  ],

  SUCCESS_ACK: [
    "Nice — that field is now complete.",
    "Got it. One more item checked off.",
    "Good progress. That's been updated.",
    "Done. Moving in the right direction.",
    "Noted. The confidence score should reflect that.",
    "Field updated successfully.",
    "That's locked in. Keep going.",
    "Checked off. Your score is improving.",
    "Great — that's taken care of.",
    "Update confirmed. What's next?",
    "Solid. That brings you closer to a complete submission.",
  ],
};

/* =========================================================
   Template filling
   ========================================================= */

export function fillTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? vars[key] : match,
  );
}

/* =========================================================
   Variant picker — random, avoids repeating last-used
   ========================================================= */

export function pickVariant(
  intent: AssistantIntent,
  excludeId?: string,
): { text: string; id: string } {
  const pool = VARIANT_POOLS[intent];
  let idx: number;

  if (excludeId && pool.length > 1) {
    const excludeIdx = parseInt(excludeId.split("-").pop() ?? "-1", 10);
    do {
      idx = Math.floor(Math.random() * pool.length);
    } while (idx === excludeIdx);
  } else {
    idx = Math.floor(Math.random() * pool.length);
  }

  return {
    text: pool[idx],
    id: `${intent}-${idx}`,
  };
}
