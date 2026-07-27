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
// they live in validateItemFile. Rules 3-8, 10, 11 and 12 are ITEM-level and
// live in validateItem. A single validateItem() structurally cannot count its
// own siblings or compare their senses, which is why there are two functions.

import { resolveLemma } from '../public/lemma.js';
import { tokenize } from './vocab.js';

const ITEM_KEYS = ['lemma', 'sense', 'sentence', 'answer', 'distractors'];
const BLANK = '___';
const MIN_WORDS = 4;
const MAX_WORDS = 14;
const DISTRACTOR_COUNT = 8;
const MAX_SENSE = 80;

// Rule 4, second half. Every rule that reaches the answer or the sentence does
// so through a LOSSY transform, and each one used to fail OPEN:
//
//   tokenize is /[a-z]+(?:'[a-z]+)?/g, so it does not merely fail to match a
//   digit, a Cyrillic letter or an emoji -- it DISCARDS them. "I ___ 42 soft
//   cat toys." had six clean tokens and passed rule 4 while showing her a
//   numeral she has no clip for. Cyrillic passed. An emoji passed. Worse, the
//   discarded junk still counted toward rule 5's whitespace word count, so it
//   could pad a too-short sentence into legality.
//
//   Accent residue was LAUNDERED rather than caught: "caté" tokenises to "cat",
//   which is in the manifest, so the garbage word passed. "café" was blocked
//   only by luck -- "cafe" happens not to be a manifest word.
//
// So the filled sentence is additionally checked CHARACTER-wise against the
// closed set below, which is a whitelist for exactly that reason: a blacklist
// would have to enumerate every script and emoji plane, and the next one added
// to Unicode would fail open again. The `u` flag is load-bearing -- without it
// an astral emoji is matched as two lone surrogates and reported as two
// unprintable halves instead of one character.
const LEGAL_SENTENCE_CHARS = /[^A-Za-z' .!?,-]/gu;

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
// The bands tag the SAME category three different ways: "three six ten thousand"
// are `cardinal`, "two four five seven nine twelve twenty hundred third" are
// `number`, and `first` is `number` while `second` is `ordinal`. That is a
// transcription inconsistency in the source, not a fact about English, and left
// alone it makes rule 8 reject `four` as a distractor for `ten` -- which leaves
// `ten` just THREE legal same-class distractors when rule 7 demands eight, so no
// legal item can exist for it at all. Every number word in the bank hits this.
// Numerals are therefore folded to one value. Nothing else is normalised.
const NUMERAL = new Set(['cardinal', 'number', 'ordinal']);

function posValues(pos) {
  return pos == null
    ? []
    : String(pos)
        .split(',')
        .map((s) => s.trim().split(/\s+/)[0].toLowerCase())
        .filter(Boolean)
        .map((p) => (NUMERAL.has(p) ? 'num' : p));
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

  // --- rule 12: the answer is a manifest word, VERBATIM -------------------
  // The root cause of three separate gate holes was that nothing ever checked
  // the answer itself -- every rule reached it through a lossy transform, and
  // each transform failed open:
  //
  //   H1 "feels" and "cats" both passed the whole gate. Such an item has no
  //      audio clip for its own CORRECT ANSWER: the one word she most needs to
  //      hear is the one word that is silent.
  //   H2 buildPosIndex is filtered by `allowed`, so an answer outside the
  //      manifest has no entry, reads as an empty pos set, and rule 8 treats it
  //      as exempt. answer "feel" + distractor "cat" was correctly rejected;
  //      answer "Feel" + the same "cat" passed. One capital letter switched off
  //      the entire semantic-distractor check.
  //   H3 resolveLemma("feel ", allowed) is null, so rule 10's answerLemma fell
  //      back to a raw string no token can ever equal and the sentence was free
  //      to echo the answer.
  //
  // Checking allowed.has(answer) with NO transform at all is what closes all
  // three at the source. It is deliberately the strictest possible form of the
  // check: the answer is the word we play a clip for, so it must be that word
  // exactly -- not a form that resolves to it, not a capitalisation of it.
  if (hasAnswer && !allowed.has(answer)) {
    errors.push(`rule 12: answer "${answer}" is not a manifest word`);
  }

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
    // This exact format is depended on downstream and must not change.
    if (unresolved.length) errors.push(`rule 4: ${unresolved.join(', ')}`);

    // ...and the character whitelist, which catches everything tokenize threw
    // away before the token check could ever see it. Reported separately, and
    // as characters rather than tokens, because the fix is different in kind:
    // a rule-4 token is a word to replace, a rule-4 character is junk to strip.
    const illegal = [];
    for (const ch of filled.match(LEGAL_SENTENCE_CHARS) || []) {
      if (!illegal.includes(ch)) illegal.push(ch);
    }
    if (illegal.length) errors.push(`rule 4: illegal character(s): ${illegal.join(', ')}`);

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
      // Resolved before lookup, and that is the other half of the H2 fix. Rule
      // 12 already rejects an answer like "Feel" outright, but rule 8 must not
      // stay silently switched off underneath it: a rule that fails open the
      // moment an unrelated rule fails is a rule that reports nothing useful
      // about the item it was handed. With the answer resolved, "Feel" is
      // looked up as "feel" {v} and the "cat" {n} distractor is still named.
      // Distractors are NOT resolved: rule 7 already requires each one to be a
      // verbatim manifest member, so resolving them could only manufacture a
      // pos for a word rule 7 has already rejected.
      const answerPos = posSetFor(resolveLemma(answer, allowed) || answer, posIndex);
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

  // --- rule 11: the gloss is readable BY HER -----------------------------
  // Owner decision D22 shows `sense` to the learner alongside the sentence, so
  // the gloss stopped being an editorial note about the item and became text
  // she has to read. Rule 4 already holds the sentence to her vocabulary; the
  // moment the gloss is on screen too, exempting it would mean shipping a
  // "helpful" explanation built from words she cannot read -- which is worse
  // than no gloss, because it is the thing she turns to when stuck.
  //
  // Same resolveLemma test and the same bare-token-list format as rule 4, on
  // purpose: the same downstream workers fix both, and one format is one thing
  // to learn. Note this is a TOKEN check only, with no character whitelist:
  // "10" is legitimate in a gloss ("ten" and "million" both gloss themselves
  // numerically) where it would be meaningless in a sentence she must read
  // aloud, and tokenize discards digits so they never reach the token check.
  //
  const gloss = item.sense;
  if (typeof gloss === 'string') {
    const unreadable = [];
    for (const token of tokenize(gloss)) {
      if (resolveLemma(token, allowed) === null && !unreadable.includes(token)) {
        unreadable.push(token);
      }
    }
    if (unreadable.length) errors.push(`rule 11: ${unreadable.join(', ')}`);

    // --- rule 13: the gloss must not name one of the item's own distractors --
    // A hazard D22 CREATED. While the gloss was private editorial metadata this
    // was harmless; the moment it is shown next to the options, a gloss reading
    // "the PART that is left over" beside an option `part` is pointing her at a
    // wrong answer in the item's own explanation. Found by the R3 worker, not by
    // me: 9 glosses named one of their own distractors.
    //
    // Banned OUTRIGHT rather than "unless the mention is contrastive". The five
    // survivors were all negations -- "correct and not wrong" beside an option
    // `wrong` -- and negation is exactly what an ESL learner drops when skimming.
    // More decisively: "is this mention contrastive?" is a human judgement, and
    // phase 2 has ~3150 glosses. A mechanical ban holds at that scale and a
    // judgement call does not. Rewording costs a clause and never blocks a gloss.
    //
    // Compared by RESOLVED LEMMA so "towns" catches the distractor `town`.
    const glossLemmas = new Set(tokenize(gloss).map((t) => resolveLemma(t, allowed) || t));
    if (Array.isArray(distractors)) {
      const named = distractors.filter((d) => typeof d === 'string' && glossLemmas.has(d));
      if (named.length) errors.push(`rule 13: gloss names its own distractor(s): ${[...new Set(named)].join(', ')}`);
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
      // "Non-empty" is measured AFTER trimming: a sense of "   " has a length
      // of 3 and sailed through a bare length check, which under D22 means
      // shipping a blank gloss box to the learner. Whitespace is not a gloss.
      const sense = item.sense;
      if (typeof sense !== 'string' || sense.trim().length === 0) {
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
  // Compared TRIMMED. The point of the rule is that a multi-sense file teaches
  // two different meanings, and "to rest" versus "to rest " is one meaning with
  // a stray keystroke -- a surface-form comparison called them distinct and let
  // the same gloss ship twice under two different sentences.
  const seen = new Set();
  for (const { i, sense } of senses) {
    const key = sense.trim();
    if (seen.has(key)) {
      errors.push(`[${i}] rule 9: duplicate sense: ${JSON.stringify(sense)}`);
    } else {
      seen.add(key);
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
