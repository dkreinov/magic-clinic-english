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
    <img class="shelf-banner" src="/assets/trophies/shelf-header.webp" alt="" />

    <header class="app-header">
      <h1 class="app-title">${SCREEN_TITLE}</h1>
    </header>

    <div class="trophies-grid">${cards}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// T5 -- the celebration, step 3.4. Nothing below runs at module top level, so
// the module still imports cleanly in node (SK3-6): the DOM is touched only
// inside showCelebration, and only when `document` exists.
// ---------------------------------------------------------------------------

// Design T5's storage contract, quoted: "'Already celebrated' lives in
// localStorage (trophyCelebrated:<id>:<tier> = ISO)".
function celebrationKey(id, tier) {
  return `trophyCelebrated:${id}:${tier}`;
}

// Every localStorage access is wrapped in try/catch -- the public/api.js:3-9
// precedent. Private mode THROWS on the very first access, and a throw must
// never break the screen or the quiz. A read that throws means "not
// celebrated": we fail towards SHOWING the overlay, never towards crashing.
// There is exactly ONE try/catch on this path, on purpose -- a second, outer
// one would swallow the first and make its removal undetectable.
function readCelebrated(key) {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

// A write that throws means "could not record it": the overlay was still
// shown, and this phone will simply show it again. public/api.js:54-58.
function writeCelebrated(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    /* private mode -- the celebration just will not be remembered */
  }
}

// The list itself, in TROPHY_VIEW order then TROPHY_TIERS_VIEW order
// (bronze, silver, gold). A trophy id present in the profile that this build
// does not know is IGNORED, never shown (T1 forward compatibility).
function collectUncelebrated(profile, read) {
  const earnedMap = isPlainObject(profile) && isPlainObject(profile.trophies) ? profile.trophies : {};
  const reader = typeof read === "function" ? read : readCelebrated;
  const out = [];
  for (const trophy of TROPHY_VIEW) {
    const earned = earnedMap[trophy.id];
    if (!isPlainObject(earned)) continue;
    for (const tier of TROPHY_TIERS_VIEW) {
      if (!Object.prototype.hasOwnProperty.call(earned, tier)) continue;
      const seen = reader(celebrationKey(trophy.id, tier));
      if (seen === null || seen === undefined || seen === "") out.push({ id: trophy.id, tier });
    }
  }
  return out;
}

// The overlay markup: artwork + name (T5). The TIER IS THE RING (SK3-8), so
// no tier word is authored -- this module's Hebrew inventory stays at the ten
// strings step 3.2 extracted. The ring arrives through the same
// .trophy-card--<tier> layer class the shelf card uses.
//
// A1 (design.md 9, owner 2026-07-30): the name is a SIBLING of the card, not
// a child of it, so the card can be the medallion itself; and it carries
// .trophy-celebrate-name, the headline class, instead of the shelf caption
// class. The rays element is empty and decorative -- it is painted entirely
// by CSS. No Hebrew string is added or changed by any of this.
function celebrateHtml(trophy, tier) {
  return `
      <div class="trophy-celebrate-rays"></div>
      <div class="trophy-celebrate-card trophy-card--${tier}">
        <img class="trophy-celebrate-art trophy-art" src="/assets/trophies/${trophy.id}.webp" alt="" />
      </div>
      <p class="trophy-celebrate-name">${trophy.name}</p>`;
}

// A2 (design.md §9). Reinstates sound, which signed T5/T9 had cut. Synthesised with
// Web Audio so nothing is downloaded, shipped, precached, versioned or licensed --
// the app has no audio-asset pipeline for anything but word pronunciation, and a
// celebration chime does not justify inventing one.
// C5-E5-G5-C6, ~85ms apart, each note short. Silence is an acceptable outcome of a
// blocked or unavailable AudioContext; an exception is NOT -- it must never break
// the celebration, the screen or the quiz.
function playEarnedSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = notes[i];
      const at = ctx.currentTime + i * 0.085;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.15, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.42);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.47);
    }
  } catch (err) {
    // Deliberately silent. A2: no mute setting exists, and a device that blocks or
    // has no audio must still get the whole celebration.
  }
}

// document.body.appendChild -- the public/api.js:44 precedent -- so the
// overlay survives the active view re-rendering its own container.innerHTML.
// One tap anywhere dismisses it (public/views/reader.js:713-719). T9: this
// path constructs no audio object and mounts no media element -- the step
// gate greps this whole file for those two literals, so they may not appear
// even inside a comment.
function showCelebration(trophy, tier) {
  if (typeof document === "undefined" || !document || !document.body) return;
  const overlay = document.createElement("div");
  overlay.className = "trophy-celebrate";
  overlay.innerHTML = celebrateHtml(trophy, tier);
  overlay.addEventListener("click", () => overlay.remove());
  document.body.appendChild(overlay);
  // A2: the earn moment gets its sound the instant the overlay lands.
  // Guarded exactly the way the DOM is guarded above -- under node there is
  // no window, so nothing is attempted at all.
  if (typeof window === "undefined") return;
  playEarnedSound();
}

// SK3-10 as amended by P3-AMENDMENT #2 (owner ruling, 2026-07-30): show the
// FIRST uncelebrated tier and mark ONLY THAT ONE, so the backlog DRAINS one
// per earning moment instead of being discarded. Still exactly ONE overlay
// per pass: no queue object, no parade, no state machine.
function celebrateFirst(profile) {
  const pending = collectUncelebrated(profile);
  if (pending.length === 0) return null;
  const shown = pending[0];
  writeCelebrated(celebrationKey(shown.id, shown.tier), new Date().toISOString());
  const trophy = TROPHY_VIEW.find((t) => t.id === shown.id);
  if (trophy) showCelebration(trophy, shown.tier);
  return shown;
}

// T5 lands in step 3.2's successor: these two are DECLARED here so steps 3.3
// and 3.4 can name them, and their bodies are step 3.4's. This step ships no
// celebration behaviour of any kind.
// STEP 3.4, additive correction (the docs/growth.md:113 precedent): the two
// bodies below are now live and delegate to the helpers above. Step 3.4's
// deletion budget for this file is ZERO, so every line of the declarations
// step 3.2 wrote survives verbatim and the new work is inserted around it.
export function uncelebrated(profile, read) {
  const pending = collectUncelebrated(profile, read);
  if (pending.length > 0) return pending;
  return [];
}

export function maybeCelebrateTrophy(profile) {
  const shown = celebrateFirst(profile);
  if (shown !== null) return shown;
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
