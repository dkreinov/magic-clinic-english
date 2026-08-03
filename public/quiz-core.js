// Pure quiz core: no imports, no fetch, no DOM. QZ-17.
// Date.now() is used only inside newSessionId.

// STEP 2.2: the one new import in this file. resolveLemma de-inflects a word INTO the audio
// manifest (field guide 26) -- measuring listen-type availability at the raw Set with .has()
// would report "no audio" for a word like "softly" that already speaks fine as "soft".
import { resolveLemma } from './lemma.js';

export function newSessionId() {
  return 'q-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

// Deliberately duplicates lib/vocab.js's knownLemmaSet: this module ships to
// the browser and lib/ does not, so the three-line logic is kept in sync by
// test 2 rather than by a shared import.
export function knownSetFromProfile(profile) {
  const known = new Set();
  const words = profile && profile.words;
  if (!words) return known;
  for (const k of Object.keys(words)) {
    if (words[k] && typeof words[k] === 'object' && words[k].status === 'known') known.add(k);
  }
  return known;
}

export function selectOptions(item, knownSet, rand = Math.random) {
  const known = item.distractors.filter((d) => knownSet.has(d));
  const rest = item.distractors.filter((d) => !knownSet.has(d));
  const chosen = known.concat(rest).slice(0, 5);
  const arr = [item.answer, ...chosen];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// STEP 1.3: options for a Hebrew-prompt question. WK-2: distractors are drawn from HER OWN
// other words, excluding any whose stored `he` equals the answer's `he` after trim() -- two
// different English words can share one Hebrew word, and this app already shipped that defect
// once. No normalisation beyond trim(): Hebrew has no case, and anything cleverer is an invented
// rule nobody signed off. Fisher-Yates using the exact loop idiom at lines 26-29 above.
// words is never mutated -- only Object.keys and property reads happen here.
export function selectHeOptions(answerLemma, words, rand = Math.random, count = 4) {
  if (!words || typeof words !== 'object') return null;
  const answerEntry = words[answerLemma];
  if (!answerEntry || typeof answerEntry !== 'object') return null;
  const answerHe = typeof answerEntry.he === 'string' ? answerEntry.he.trim() : '';
  if (answerHe === '') return null;

  const candidates = [];
  for (const k of Object.keys(words)) {
    if (k === answerLemma) continue;
    const entry = words[k];
    if (!entry || typeof entry !== 'object') continue;
    const he = typeof entry.he === 'string' ? entry.he.trim() : '';
    if (he === '') continue;
    if (he === answerHe) continue;
    candidates.push(k);
  }

  if (candidates.length < count - 1) return null;

  const pool = candidates.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const arr = [answerLemma, ...pool.slice(0, count - 1)];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function isUsableItem(x) {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return false;
  if (typeof x.sense !== 'string' || x.sense.trim() === '') return false;
  if (typeof x.sentence !== 'string' || !x.sentence.includes('___')) return false;
  if (typeof x.answer !== 'string' || x.answer.trim() === '') return false;
  if (!Array.isArray(x.distractors) || x.distractors.length < 5) return false;
  if (!x.distractors.every((d) => typeof d === 'string')) return false;
  return true;
}

export function pickItem(items, rand = Math.random) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const filtered = items.filter(isUsableItem);
  if (filtered.length === 0) return null;
  return filtered[Math.floor(rand() * filtered.length)];
}

export function pickQuizWords(profile, limit = 20) {
  const words = (profile && profile.words) || {};
  const candidates = Object.keys(words)
    .filter((k) => words[k] && words[k].status === 'known')
    .map((k) => ({ ...words[k], key: k }));

  candidates.sort((a, b) => {
    const strikeDiff = (b.strikes ?? 0) - (a.strikes ?? 0);
    if (strikeDiff !== 0) return strikeDiff;

    const needsReviewDiff = (b.needsReview === true) - (a.needsReview === true);
    if (needsReviewDiff !== 0) return needsReviewDiff;

    const aNever = a.lastQuizAt === undefined || Number.isNaN(Date.parse(a.lastQuizAt));
    const bNever = b.lastQuizAt === undefined || Number.isNaN(Date.parse(b.lastQuizAt));
    if (aNever !== bNever) return aNever ? -1 : 1;

    if (aNever && bNever) {
      const diff = (Date.parse(b.lastSeen) || 0) - (Date.parse(a.lastSeen) || 0);
      if (diff !== 0) return diff;
    } else {
      const diff = (Date.parse(a.lastQuizAt) || 0) - (Date.parse(b.lastQuizAt) || 0);
      if (diff !== 0) return diff;
    }

    return a.key < b.key ? -1 : 1;
  });

  return candidates.slice(0, limit).map((c) => c.key);
}

// B3 (docs/growth.md section 8): the candidate slot. A NEW export, so QZ-17's
// comparator above is not touched by a single byte -- candidates are ranked by
// projecting them onto a throwaway profile in which they read as `known` and
// handing THAT to pickQuizWords itself. So "ordered inside its tier by the
// existing comparator" is true by construction, not by a copy that can drift.
// The projection copies each entry, so the caller's profile is never mutated.
// The merge with the known pool happens at the CALL SITE: one candidate per
// sitting, and a candidate with no bank item is skipped in silence (D23).
export function pickCandidateWords(profile, limit = 1) {
  const words = (profile && profile.words) || {};
  const shadow = { words: {} };
  for (const k of Object.keys(words)) {
    const entry = words[k];
    if (entry && typeof entry === 'object' && entry.status === 'candidate') {
      shadow.words[k] = { ...entry, status: 'known' };
    }
  }
  return pickQuizWords(shadow, limit);
}

// STEP 1.1: grading a typed answer. Pure functions -- no DOM, no fetch, no network (D7 / R-W-6).
// isNearMiss uses Damerau-Levenshtein distance restricted to adjacent transpositions (the
// "optimal string alignment" variant), computed by the unexported osaDistance helper below.
export function normalizeTyped(s) {
  return String(s ?? '').trim().toLowerCase();
}

function osaDistance(a, b) {
  const al = a.length;
  const bl = b.length;
  const d = [];
  for (let i = 0; i <= al; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    d[0][j] = j;
  }
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, d[i - 2][j - 2] + 1);
      }
      d[i][j] = best;
    }
  }
  return d[al][bl];
}

export function isNearMiss(typed, answer) {
  const a = normalizeTyped(typed);
  const b = normalizeTyped(answer);
  if (a === '' || a === b) return false;
  return osaDistance(a, b) === 1;
}

export function gradeTyped(typed, answer, { isRetry = false } = {}) {
  const a = normalizeTyped(typed);
  const b = normalizeTyped(answer);
  if (a === b) return 'correct';
  if (isRetry) return 'wrong';
  if (isNearMiss(typed, answer)) return 'near-miss';
  return 'wrong';
}

// STEP 1.2: reorder the ranked pool so the same word is not question #1 every time.
// WK-5: the ranked list is REORDERED, never TRUNCATED -- pickQuizWords itself is untouched.
// Fisher-Yates over the FIRST min(8, length) entries only, using the exact loop idiom at
// lines 26-29 above. The tail (index slice..end) is left in ranked order. ranked is never
// mutated: we shuffle a copy. D7 / R-W-6: pure function, no DOM, no fetch, no network.
export function sampleRanked(ranked, count, rand = Math.random) {
  if (!Array.isArray(ranked) || ranked.length === 0) return [];
  const arr = ranked.slice();
  const slice = Math.min(8, arr.length);
  for (let i = slice - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// STEP 1.4: question kind rotation. Four kinds cycle by position in the sitting so audio
// (listen-type) is at most one question in four. WK-1: rotation is a PREFERENCE, not a rule --
// chooseKind receives availability FLAGS (not a profile, manifest, or item bank) and walks
// forward from the starting kind with WRAPAROUND, returning the first buildable kind, or null
// if none is buildable. D7 / R-W-6: pure function, no DOM, no fetch, no network.
export const QUESTION_KINDS = Object.freeze(['cloze-pick', 'he-pick', 'he-type', 'listen-type']);

const KIND_FLAG_NAMES = Object.freeze({
  'cloze-pick': 'clozePick',
  'he-pick': 'hePick',
  'he-type': 'heType',
  'listen-type': 'listenType',
});

export function chooseKind(position, avail) {
  const n = Number(position);
  const start = Number.isInteger(n) && n >= 0 ? n % 4 : 0;
  for (let i = 0; i < 4; i++) {
    const kind = QUESTION_KINDS[(start + i) % 4];
    const flagName = KIND_FLAG_NAMES[kind];
    if (avail && avail[flagName]) return kind;
  }
  return null;
}

// STEP 2.2: measure what is actually buildable for this word, then assemble the question.
// WK-1: a kind is never faked and a prompt is never blank. cloze-pick deliberately returns
// options: null -- the existing caller's own selectOptions(item, knownSet, rand) line must
// stay byte-identical, because today's tapped question must not change at all.
export function buildQuestion(position, lemma, { item, entry, audioSet, words } = {}, rand = Math.random) {
  const clozePick = item !== null && item !== undefined && isUsableItem(item);

  const entryHe = entry && typeof entry === 'object' && typeof entry.he === 'string' ? entry.he.trim() : '';
  const heType = entryHe !== '';

  const heOptions = heType ? selectHeOptions(lemma, words, rand, 6) : null;
  const hePick = heType && heOptions !== null;

  const resolvedLemma = resolveLemma(lemma, audioSet);
  const listenType = resolvedLemma !== null;

  const kind = chooseKind(position, { clozePick, hePick, heType, listenType });
  if (kind === null) return null;

  if (kind === 'cloze-pick') {
    return { kind, lemma, item, options: null, answer: item.answer, promptHe: null, sayLemma: null };
  }
  if (kind === 'he-pick') {
    return { kind, lemma, item, options: heOptions, answer: lemma, promptHe: entry.he, sayLemma: null };
  }
  if (kind === 'he-type') {
    return { kind, lemma, item, options: null, answer: lemma, promptHe: entry.he, sayLemma: null };
  }
  return { kind, lemma, item, options: null, answer: lemma, promptHe: null, sayLemma: resolvedLemma };
}

