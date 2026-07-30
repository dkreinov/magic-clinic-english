// Phase 3 (word-trophies), step 3.2 -- design.md T4: the trophies screen.
//
// THE HEBREW IN THIS FILE IS GENERATED, NEVER HAND-TYPED. Every Hebrew string
// below was EXTRACTED from its own source by $HOME/trophies-art/
// build-trophy-names.js (field-guide lesson 8): the eight trophy names from the
// T3 table in .oplan/word-trophies/design.md, the screen title from that file's
// tab-label line, and the progress-line word from public/quiz.js's score line.
// The builder re-reads what it wrote and compares decimal codepoint sums
// against the SK3-8 table; a mismatch of one stops the step.
//
// SK3-6: public/ can never import from lib/ -- the browser is served public/
// only -- so TROPHY_VIEW is a deliberate MIRROR of lib/profile.js's
// TROPHY_CATALOG: the same eight ids, the same order, the same 24 thresholds,
// behaviourally identical metrics. The duplication is held honest by tests, not
// by discipline: tests/trophies-ui.test.js pins the mirror with one
// deepStrictEqual and re-checks every metric against the engine over eight
// shared fixtures.
//
// This module NEVER awards, never writes a trophy and never posts (T2:
// awarding is server-side only). Nothing at module top level touches document,
// window, localStorage or navigator, so the module imports cleanly in node.

import { getJson } from "../api.js";

const VIEW_STYLE = `
  .trophies-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .trophy-card {
    background: var(--color-card);
    border-radius: var(--radius);
    box-shadow: var(--shadow-soft);
    padding: 16px 12px;
  }

  /* The tier layer. It carries the modifier class and lays the card out, so the
     frozen descendant selectors below apply and the card element itself stays a
     plain .trophy-card. */
  .trophy-card--bronze,
  .trophy-card--silver,
  .trophy-card--gold,
  .trophy-card--locked {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  /* The box is SQUARE and every source webp is 640x640 square, so object-fit:
     cover crops NOTHING -- not even quizRight, the tightest-framed of the nine. */
  .trophy-art {
    width: 96px;
    height: 96px;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: 50%;
    border: 3px solid var(--color-border);
  }

  /* T7: the three tier tokens are consumed ONLY as var(--color-...). They are
     never blended, because a blended colour fabricates a contrast pass. */
  .trophy-card--bronze .trophy-art {
    border-color: var(--color-bronze);
  }

  .trophy-card--silver .trophy-art {
    border-color: var(--color-silver);
  }

  .trophy-card--gold .trophy-art {
    border-color: var(--color-gold);
  }

  /* T4: a locked trophy is the SAME artwork dimmed -- no separate locked asset.
     Its ring stays var(--color-border), a pair already gated at 3:1 on card. */
  .trophy-card--locked .trophy-art {
    filter: grayscale(1);
    opacity: 0.45;
  }

  .trophy-name {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-ink);
    text-align: center;
  }

  /* T9: progress is plain text. No progress-bar component, no chart machinery. */
  .trophy-progress {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-muted);
    text-align: center;
  }
`;

// ---------------------------------------------------------------------------
// The metric helpers, re-expressed from lib/profile.js for the view's single
// job (SK3-6). Defensive in the engine's way: a missing words map, a non-object
// story or a non-numeric counter yields 0, never a throw.
// ---------------------------------------------------------------------------

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// The calendar day of a timestamp, FROZEN as the UTC day -- the engine's rule,
// round-trip guard included, so a string Date.parse happens to accept (like
// "January 1, 2026") can never masquerade as a day.
function trophyDay(value) {
  if (typeof value !== "string") return null;
  if (Number.isNaN(Date.parse(value))) return null;
  const day = value.slice(0, 10);
  if (day.length !== 10) return null;
  const ms = Date.parse(day + "T00:00:00.000Z");
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString().slice(0, 10) === day ? day : null;
}

function wordEntries(profile) {
  if (!isPlainObject(profile) || !isPlainObject(profile.words)) return [];
  return Object.values(profile.words).filter(isPlainObject);
}

function chapterList(profile) {
  if (!isPlainObject(profile) || !isPlainObject(profile.story)) return [];
  return Array.isArray(profile.story.chapters) ? profile.story.chapters : [];
}

// T3 'days': chapters[].generatedAt UNION words[].lastQuizAt UNION words[].lastSeen.
function activeDays(profile) {
  const days = new Set();
  for (const chapter of chapterList(profile)) {
    if (!isPlainObject(chapter)) continue;
    const day = trophyDay(chapter.generatedAt);
    if (day) days.add(day);
  }
  for (const entry of wordEntries(profile)) {
    for (const key of ["lastQuizAt", "lastSeen"]) {
      const day = trophyDay(entry[key]);
      if (day) days.add(day);
    }
  }
  return days;
}

// T3 'streak': the longest run of CONSECUTIVE days inside the day set, compared
// at UTC midnight, so month, year and DST boundaries are all just +86400000.
function longestStreak(days) {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prevMs = null;
  for (const day of sorted) {
    const ms = Date.parse(day + "T00:00:00.000Z");
    if (Number.isNaN(ms)) continue;
    run = prevMs !== null && ms - prevMs === 86400000 ? run + 1 : 1;
    if (run > best) best = run;
    prevMs = ms;
  }
  return best;
}

function countNum(value) {
  return Number.isFinite(value) ? value : 0;
}

// The browser mirror of lib/profile.js TROPHY_CATALOG (SK3-6). Ids, order and
// thresholds are owner-signed; the names are display data and live here.
export const TROPHY_VIEW = [
  { id: "chapters",  name: "הרפתקנית",  bronze: 5,  silver: 15, gold: 40,
    metric: (p) => chapterList(p).length },
  { id: "days",      name: "מתמידה",      bronze: 3,  silver: 10, gold: 30,
    metric: (p) => activeDays(p).size },
  { id: "streak",    name: "רצף קסום",    bronze: 2,  silver: 4,  gold: 7,
    metric: (p) => longestStreak(activeDays(p)) },
  { id: "known",     name: "אוצרת מילים",     bronze: 5,  silver: 15, gold: 30,
    metric: (p) => wordEntries(p).filter((e) => e.status === "known").length },
  { id: "quizRight", name: "אלופת התרגול", bronze: 10, silver: 40, gold: 100,
    metric: (p) => wordEntries(p).reduce((n, e) => n + countNum(e.quizRight), 0) },
  { id: "quizzer",   name: "מתאמנת אמיצה",   bronze: 20, silver: 60, gold: 150,
    metric: (p) => wordEntries(p).reduce((n, e) => n + countNum(e.quizRight) + countNum(e.quizWrong), 0) },
  { id: "curious",   name: "בלשית מילים",   bronze: 25, silver: 75, gold: 200,
    metric: (p) => wordEntries(p).reduce((n, e) => n + countNum(e.taps), 0) },
  { id: "proven",    name: "באמת יודעת",    bronze: 1,  silver: 5,  gold: 15,
    metric: (p) => wordEntries(p).filter((e) => e.status === "known" && countNum(e.nominations) >= 1).length },
];

export const TROPHY_TIERS_VIEW = ["bronze", "silver", "gold"];

// The screen title, extracted from design.md's tab-label line (SK3-8 item 9).
const SCREEN_TITLE = "הגביעים שלי";

// The progress-line word, extracted from public/quiz.js's score line -- the
// token between ${right} and ${total} in renderQuizDone (SK3-4, SK3-8 item 10).
// Nothing new is authored: this word is already on the child's screen today.
const MITOCH = "מתוך";

// The highest tier present in one trophy's earned map, or null when nothing is
// earned. Never-regress: phase 1 can produce a higher tier with no lower ones
// (test A3), and a lone gold still reads gold.
export function tierOf(entry) {
  if (!isPlainObject(entry)) return null;
  let best = null;
  for (const tier of TROPHY_TIERS_VIEW) {
    if (Object.prototype.hasOwnProperty.call(entry, tier)) best = tier;
  }
  return best;
}

// The threshold the next tier needs, or null when there is no next tier.
export function nextThreshold(trophy, tier) {
  if (tier === "gold") return null;
  if (tier === "silver") return trophy.gold;
  if (tier === "bronze") return trophy.silver;
  return trophy.bronze;
}

// SK3-4, frozen. Locked: metric against the bronze threshold. Bronze/silver:
// metric against the next threshold. Gold: nothing at all -- there is no next
// tier, and the gold ring is what says "finished".
//
// The metric is READ LIVE on every call. No high-water mark is stored anywhere,
// and the line is never phrased as a change, so a metric that falls (days and
// streak are not monotonic) simply reads lower. The EARNED TIER is what never
// regresses, and that is the ring, not the text.
export function progressLine(trophy, profile, tier) {
  const next = nextThreshold(trophy, tier);
  if (next === null) return "";
  return `${trophy.metric(profile)} ${MITOCH} ${next}`;
}

// One card: artwork, name, the tier ring, and the plain-text progress line.
// The artwork src is the SAME for every state (T4: no separate locked asset).
export function cardHtml(trophy, profile, trophies) {
  const earned = isPlainObject(trophies) ? trophies[trophy.id] : undefined;
  const tier = tierOf(earned);
  const layer = tier === null ? "trophy-card--locked" : `trophy-card--${tier}`;
  const line = progressLine(trophy, profile, tier);
  const progress = line === "" ? "" : `
          <p class="trophy-progress">${line}</p>`;
  return `
      <article class="trophy-card">
        <div class="${layer}">
          <img class="trophy-art" src="/assets/trophies/${trophy.id}.webp" alt="" />
          <p class="trophy-name">${trophy.name}</p>${progress}
        </div>
      </article>`;
}

// SK3-3 + the frozen screen order: the style tag, the shelf-header banner, the
// title, then the eight cards in TROPHY_VIEW order.
export function screenHtml(profile) {
  const trophies = isPlainObject(profile) && isPlainObject(profile.trophies) ? profile.trophies : {};
  const cards = TROPHY_VIEW.map((trophy) => cardHtml(trophy, profile, trophies)).join("");
  return `
    <style>${VIEW_STYLE}</style>

    <img class="hero-banner" src="/assets/trophies/shelf-header.webp" alt="" />

    <header class="app-header">
      <h1 class="app-title">${SCREEN_TITLE}</h1>
    </header>

    <div class="trophies-grid">${cards}
    </div>
  `;
}

// T5 lands in step 3.2's successor: these two are DECLARED here so steps 3.3
// and 3.4 can name them, and their bodies are step 3.4's. This step ships no
// celebration behaviour of any kind.
export function uncelebrated(profile, read) {
  return [];
}

export function maybeCelebrateTrophy(profile) {
  return null;
}

// The T4 entry point. A profile fetch failure must never blank the screen:
// frozen choice -- render from an EMPTY profile, so every trophy simply shows
// locked at its bronze threshold. Zero new strings, and a network blip costs
// nothing but the numbers.
export async function render(container, ctx) {
  let profile = {};
  try {
    profile = await getJson("/api/profile");
  } catch (err) {
    profile = {};
  }
  container.innerHTML = screenHtml(profile);
}
