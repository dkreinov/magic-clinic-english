// Contract QZ-1 in code: what makes a public/quiz/<lemma>.json item legal.
//
// Three PURE functions. No fs, no network, no npm. Callers pass the parsed band
// data and the manifest set in; that is what lets the gate, the generator and
// the tests all share one definition instead of three drifting copies.
//
// resolveLemma and tokenize are IMPORTED, never re-implemented: verifying code
// against a re-implementation of itself is how a wrong regex once put a bad
// count in all three bands. public/lemma.js is already imported by api/ and
// lib/ as well as the browser -- that precedent is deliberate.
//
// Rules 1, 2 and 9 are FILE-level (they must see every item in the file), so
// they live in validateItemFile. Rules 3-8 and 10 are ITEM-level and live in
// validateItem. A single validateItem() structurally cannot count its own
// siblings or compare their senses, which is why there are two functions.

import { resolveLemma } from '../public/lemma.js';
import { tokenize } from './vocab.js';

const ITEM_KEYS = ['lemma', 'sense', 'sentence', 'answer', 'distractors'];
const BLANK = '___';
const MIN_WORDS = 4;
const MAX_WORDS = 14;
const DISTRACTOR_COUNT = 8;
const MAX_SENSE = 80;

// Rule 8. Part of speech is a SET, not a value: 393 manifest lemmas have more
// than one band entry and 336 have a pos union bigger than one, so "kind" is
// {adj, n} and "back" is {adv, n, adj}. Each comma-segment is reduced to its
// FIRST WHITESPACE TOKEN because the source carries malformed cells like
// "v player n" (play) and "adj gently adv" (gentle).
//
// The `== null` guard is LOAD-BEARING: String(null) is the truthy string
// "null", so without it a null pos yields the set {"null"} instead of an empty
// one, the word stops being exempt, and rule 8 then wrongly rejects every real
// distractor against it. It changes the exempt count from 50 to 63 of 2254.
function posValues(pos) {
  return pos == null
    ? []
    : String(pos)
        .split(',')
        .map((s) => s.trim().split(/\s+/)[0].toLowerCase())
        .filter(Boolean);
}

// band1/band2: the parsed band JSON objects ({ meta, entries: [...] }).
// allowed: a Set of manifest lemmas -- only those get an entry, because a pos
// for a word with no audio clip can never be used by the quiz anyway.
export function buildPosIndex(band1, band2, allowed) {
  const index = new Map();
  for (const band of [band1, band2]) {
    const entries = (band && band.entries) || [];
    for (const entry of entries) {
      if (!entry) continue;
      const lemma = entry.lemma;
      if (typeof lemma !== 'string') continue;
      if (allowed && !allowed.has(lemma)) continue;
      let set = index.get(lemma);
      if (!set) {
        set = new Set();
        index.set(lemma, set);
      }
      for (const value of posValues(entry.pos)) set.add(value);
    }
  }
  return index;
}

function posSetFor(word, posIndex) {
  const set = posIndex && posIndex.get(word);
  return set || new Set();
}

function countOccurrences(haystack, needle) {
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) {
    n++;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return n;
}

// ctx = { allowed: Set of manifest lemmas, posIndex: Map<lemma, Set<string>> }
export function validateItem(item, ctx) {
  const errors = [];
  const allowed = (ctx && ctx.allowed) || new Set();
  const posIndex = (ctx && ctx.posIndex) || new Map();

  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    errors.push('rule 1: item must be a JSON object');
    return { ok: false, errors };
  }

  // Structural: exactly the five contract keys, no others. Named under rule 1
  // because that is where the file/item identity rules live.
  const keys = Object.keys(item);
  const missing = ITEM_KEYS.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !ITEM_KEYS.includes(k));
  if (missing.length) errors.push(`rule 1: missing key(s): ${missing.join(', ')}`);
  if (extra.length) errors.push(`rule 1: unexpected key(s): ${extra.join(', ')}`);

  const sentence = item.sentence;
  const answer = item.answer;
  const hasSentence = typeof sentence === 'string';
  const hasAnswer = typeof answer === 'string' && answer.length > 0;
  if (!hasSentence) errors.push('rule 1: sentence must be a string');
  if (!hasAnswer) errors.push('rule 1: answer must be a non-empty string');

  // --- rule 3: exactly one ___ and no other underscore -------------------
  if (hasSentence) {
    const blanks = countOccurrences(sentence, BLANK);
    const underscores = countOccurrences(sentence, '_');
    if (blanks !== 1 || underscores !== 3) {
      errors.push(
        `rule 3: sentence must contain exactly one "___" and no other "_" ` +
          `(found ${blanks} blank(s), ${underscores} underscore(s))`
      );
    }

    // --- rule 6: leading capital, terminal . ! or ? ----------------------
    if (!/^[A-Z]/.test(sentence)) {
      errors.push('rule 6: sentence must start with an uppercase letter');
    }
    if (!/[.!?]$/.test(sentence)) {
      errors.push('rule 6: sentence must end with ".", "!" or "?"');
    }
  }

  // The filled sentence is what she actually reads, so rules 4, 5 and 10 are
  // all measured on it rather than on the template.
  if (hasSentence && hasAnswer) {
    const filled = sentence.split(BLANK).join(answer);

    // --- rule 4: every TOKEN resolves into the manifest ------------------
    const tokens = tokenize(filled);
    const unresolved = [];
    for (const token of tokens) {
      if (resolveLemma(token, allowed) === null && !unresolved.includes(token)) {
        unresolved.push(token);
      }
    }
    // The detail is the bare offending tokens by design: a downstream worker
    // cannot fix "rule 4 failed", but it can fix "rule 4: children, after".
    if (unresolved.length) errors.push(`rule 4: ${unresolved.join(', ')}`);

    // --- rule 5: 4..14 WORDS (whitespace-separated, not tokens) ----------
    const words = filled.trim().split(/\s+/).filter(Boolean);
    if (words.length < MIN_WORDS || words.length > MAX_WORDS) {
      errors.push(
        `rule 5: filled sentence must be ${MIN_WORDS}-${MAX_WORDS} words, got ${words.length}`
      );
    }

    // --- rule 10: the answer must not be given away a second time ---------
    // Compared by RESOLVED LEMMA, not surface form. The rule's purpose is that
    // the sentence must not hand her the answer, and an inflection hands it to
    // her just as plainly: with answer "feel", "I ___ happy when the cat feels
    // warm." passed a bare surface-form check while showing her the word.
    // resolveLemma tries an exact match first, so ordinary words are safe --
    // "carpet" stays "carpet" and never collapses to "car".
    const answerLemma = resolveLemma(answer, allowed) || answer.toLowerCase();
    const giveaways = tokens.filter((t) => (resolveLemma(t, allowed) || t) === answerLemma);
    if (giveaways.length > 1) {
      errors.push(
        `rule 10: answer "${answer}" is given away ${giveaways.length} times ` +
          `in the filled sentence: ${[...new Set(giveaways)].join(', ')}`
      );
    }
  }

  // --- rule 7: exactly 8 distinct distractors, all in the manifest -------
  const distractors = item.distractors;
  if (!Array.isArray(distractors)) {
    errors.push('rule 7: distractors must be an array');
  } else {
    if (distractors.length !== DISTRACTOR_COUNT) {
      errors.push(
        `rule 7: distractors must be exactly ${DISTRACTOR_COUNT}, got ${distractors.length}`
      );
    }
    const nonStrings = distractors.filter((d) => typeof d !== 'string');
    if (nonStrings.length) {
      errors.push(`rule 7: distractors must all be strings (${nonStrings.length} are not)`);
    }
    const strings = distractors.filter((d) => typeof d === 'string');

    const seen = new Set();
    const duplicates = [];
    for (const d of strings) {
      if (seen.has(d) && !duplicates.includes(d)) duplicates.push(d);
      seen.add(d);
    }
    if (duplicates.length) errors.push(`rule 7: duplicate distractor(s): ${duplicates.join(', ')}`);

    if (hasAnswer && strings.includes(answer)) {
      errors.push(`rule 7: distractor equals the answer: ${answer}`);
    }

    const unknown = [];
    for (const d of strings) {
      if (!allowed.has(d) && !unknown.includes(d)) unknown.push(d);
    }
    if (unknown.length) errors.push(`rule 7: distractor(s) not in the manifest: ${unknown.join(', ')}`);

    // --- rule 8: pos SETS must intersect when both are non-empty --------
    // An empty set means exempt (63 of 2254 manifest words), because the bands
    // simply do not record a part of speech for those.
    if (hasAnswer) {
      const answerPos = posSetFor(answer, posIndex);
      if (answerPos.size > 0) {
        const clashes = [];
        for (const d of strings) {
          if (d === answer) continue;
          const dPos = posSetFor(d, posIndex);
          if (dPos.size === 0) continue;
          const shares = [...dPos].some((p) => answerPos.has(p));
          if (!shares && !clashes.includes(d)) clashes.push(d);
        }
        if (clashes.length) {
          errors.push(
            `rule 8: distractor(s) share no part of speech with "${answer}" ` +
              `{${[...answerPos].sort().join(',')}}: ${clashes.join(', ')}`
          );
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

// lemma: the filename minus ".json". items: the parsed JSON array.
// Item-level errors come back prefixed with "[i] " so the gate can name
// feel.json[1].
export function validateItemFile(lemma, items, ctx) {
  const errors = [];

  if (!Array.isArray(items)) {
    errors.push('rule 2: file must contain a JSON array of items');
    return { ok: false, errors };
  }

  // --- rule 2: 1..3 items per file ---------------------------------------
  if (items.length < 1 || items.length > 3) {
    errors.push(`rule 2: file must hold 1-3 items, got ${items.length}`);
  }

  const senses = [];
  items.forEach((item, i) => {
    const at = `[${i}] `;
    const isObject = item && typeof item === 'object' && !Array.isArray(item);

    // --- rule 1: filename === lemma === answer ---------------------------
    if (isObject) {
      if (item.lemma !== lemma) {
        errors.push(`${at}rule 1: lemma is ${JSON.stringify(item.lemma)}, expected "${lemma}"`);
      }
      if (item.answer !== lemma) {
        errors.push(`${at}rule 1: answer is ${JSON.stringify(item.answer)}, expected "${lemma}"`);
      }

      // --- rule 9: sense is a non-empty string <= 80 chars ---------------
      const sense = item.sense;
      if (typeof sense !== 'string' || sense.length === 0) {
        errors.push(`${at}rule 9: sense must be a non-empty string`);
      } else {
        if (sense.length > MAX_SENSE) {
          errors.push(`${at}rule 9: sense must be <= ${MAX_SENSE} characters, got ${sense.length}`);
        }
        senses.push({ i, sense });
      }
    }
  });

  // --- rule 9 (continued): senses must be distinct within a file ---------
  const seen = new Set();
  for (const { i, sense } of senses) {
    if (seen.has(sense)) {
      errors.push(`[${i}] rule 9: duplicate sense: ${JSON.stringify(sense)}`);
    } else {
      seen.add(sense);
    }
  }

  // --- rules 3-8 and 10, per item, indexed -------------------------------
  items.forEach((item, i) => {
    for (const err of validateItem(item, ctx).errors) {
      errors.push(`[${i}] ${err}`);
    }
  });

  return { ok: errors.length === 0, errors };
}
