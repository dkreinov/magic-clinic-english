import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildPosIndex, validateItem, validateItemFile } from '../lib/quiz-item.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const read = (...p) => JSON.parse(readFileSync(path.join(root, ...p), 'utf8'));

// The real data, deliberately: rule 8 is only meaningful against the actual
// band pos unions, and the fixture sentences below are only legal because every
// one of their words was checked against the real manifest. The allowed
// vocabulary is NOT ordinary English -- "children", "after", "men", "women" and
// "feet" are all absent from it.
const band1 = read('data', 'band1.json');
const band2 = read('data', 'band2.json');
const allowed = new Set(read('public', 'audio', 'words', 'index.json'));
const posIndex = buildPosIndex(band1, band2, allowed);
const ctx = { allowed, posIndex };

const FEEL = {
  lemma: 'feel',
  sense: 'to touch something with your hand',
  sentence: 'I ___ the soft cat with my hand.',
  answer: 'feel',
  distractors: ['jump', 'sing', 'open', 'carry', 'paint', 'climb', 'wash', 'count'],
};

const feel = (over = {}) => ({ ...FEEL, ...over });
const broke = (res, n) => res.errors.some((e) => e.includes(`rule ${n}:`));
const why = (res) => res.errors.join(' | ');

// Rule 13 guards a hazard that D22 CREATED. While `sense` was private editorial
// metadata, a gloss mentioning a distractor was harmless; the moment D22 put the
// gloss on screen beside the options, "the PART that is left over" next to an
// option `part` points her at a wrong answer in the item's own explanation.
// Nine shipped glosses did this. Banned outright rather than "unless the mention
// is contrastive": the survivors were all negations ("correct and not wrong"
// beside `wrong`), negation is the first thing an ESL learner drops when
// skimming, and at phase 2's ~3150 glosses a contrastive//not judgement call does
// not hold where a mechanical ban does.
test('rule 13: a gloss may not name one of its own distractors', () => {
  const clean = validateItem(feel(), ctx);
  assert.ok(!broke(clean, 13), why(clean));

  // `jump` is one of FEEL's eight distractors.
  const names = validateItem(feel({ sense: 'to touch or jump at something' }), ctx);
  assert.ok(broke(names, 13), why(names));
  assert.ok(names.errors.some((e) => e.includes('jump')), `rule 13 must name the offender: ${why(names)}`);

  // Contrastive mentions are banned too -- this is the case that survived the
  // first sweep and the one the ban exists to settle.
  const contrastive = validateItem(feel({ sense: 'to touch a thing, not to jump' }), ctx);
  assert.ok(broke(contrastive, 13), `a contrastive mention is still a mention: ${why(contrastive)}`);

  // Compared by RESOLVED LEMMA, so an inflected mention is caught: "jumping"
  // resolves to the distractor `jump`.
  const inflected = validateItem(feel({ sense: 'to touch a thing while jumping' }), ctx);
  assert.ok(broke(inflected, 13), `inflected mentions must be caught: ${why(inflected)}`);

  // ...and the real bank must be clean of it.
  for (const w of ['back', 'complex', 'country', 'gentle', 'right']) {
    const items = read('public', 'quiz', `${w}.json`);
    const res = validateItemFile(w, items, ctx);
    assert.ok(!broke(res, 13), `${w}.json must not name its own distractors: ${why(res)}`);
  }
});

test('a valid single-item file passes validateItemFile with no errors', () => {
  const res = validateItemFile('feel', [feel()], ctx);
  assert.deepEqual(res.errors, [], why(res));
  assert.equal(res.ok, true);

  const one = validateItem(feel(), ctx);
  assert.deepEqual(one.errors, [], why(one));
  assert.equal(one.ok, true);
});

test('sentence shape: rules 3, 6 and 10', () => {
  // rule 3 -- exactly one "___".
  const none = validateItem(feel({ sentence: 'I like the soft cat with my hand.' }), ctx);
  assert.ok(broke(none, 3), why(none));
  const two = validateItem(feel({ sentence: 'I ___ the soft cat with my ___.' }), ctx);
  assert.ok(broke(two, 3), why(two));

  // ...and rule 3 counts UNDERSCORES as well as blanks, which is the half of it
  // nothing exercised: both mutations below survived the suite untouched. A
  // fourth underscore leaves "feel_" in the filled sentence, and an underscore
  // inside a word is not a blank at all but still corrupts what she reads.
  const fourBars = validateItem(feel({ sentence: 'I ____ the soft cat with my hand.' }), ctx);
  assert.ok(broke(fourBars, 3), `"____" must trip rule 3, got: ${why(fourBars)}`);
  const joined = validateItem(feel({ sentence: 'I ___ the soft_cat with my hand.' }), ctx);
  assert.ok(broke(joined, 3), `an underscore inside a word must trip rule 3, got: ${why(joined)}`);

  // rule 6 -- leading capital, terminal punctuation.
  const lower = validateItem(feel({ sentence: 'i ___ the soft cat with my hand.' }), ctx);
  assert.ok(broke(lower, 6), why(lower));
  assert.ok(!broke(lower, 3), 'lowercase start must not also trip rule 3');
  const unpunctuated = validateItem(feel({ sentence: 'I ___ the soft cat with my hand' }), ctx);
  assert.ok(broke(unpunctuated, 6), why(unpunctuated));

  // rule 10 -- the answer must not give itself away.
  const echo = validateItem(feel({ sentence: 'I ___ the cat and feel my hand.' }), ctx);
  assert.ok(broke(echo, 10), why(echo));

  // ...and an INFLECTION gives it away just as plainly. This one passed clean
  // before amendment A1: rule 10 compared surface forms, so "feels" sat in the
  // sentence handing her the answer while the gate stayed green.
  const inflected = validateItem(
    feel({ sentence: 'I ___ happy when the cat feels warm.' }),
    ctx
  );
  assert.ok(broke(inflected, 10), why(inflected));
  assert.ok(inflected.errors.some((e) => e.includes('feels')), why(inflected));

  // The exact-match-first guard in resolveLemma is what keeps this from
  // over-firing: an ordinary word must not collapse into the answer.
  const safe = validateItem(
    { ...feel({ lemma: 'car', answer: 'car' }), sentence: 'I ___ the carpet in my room.' },
    ctx
  );
  assert.ok(!broke(safe, 10), why(safe));
});

test('rule 4 names the offending token, and rule 5 bounds the word count', () => {
  // "men" is VERIFIED absent from the manifest -- irregular plurals are
  // exactly the trap rule 4 exists to catch.
  const res = validateItem(feel({ sentence: 'I ___ the men with my hand.' }), ctx);
  assert.ok(broke(res, 4), why(res));
  assert.ok(
    res.errors.some((e) => e.startsWith('rule 4:') && e.includes('men')),
    `rule 4 must name the offending token, got: ${why(res)}`
  );

  // rule 5 -- 3 words is too short, 15 is too long (4..14 inclusive).
  const short = validateItem(feel({ sentence: 'I ___ it.' }), ctx);
  assert.ok(broke(short, 5), why(short));
  const long = validateItem(
    feel({ sentence: 'I ___ the soft cat and the big dog and the bird in my box.' }),
    ctx
  );
  assert.ok(broke(long, 5), why(long));
  assert.ok(!broke(long, 4), 'every word in the long fixture is in the manifest');
});

test('rule 7: exactly 8 distinct distractors, none the answer, all in the manifest', () => {
  const seven = validateItem(feel({ distractors: FEEL.distractors.slice(0, 7) }), ctx);
  assert.ok(broke(seven, 7), why(seven));

  const dup = validateItem(
    feel({ distractors: ['jump', 'jump', 'open', 'carry', 'paint', 'climb', 'wash', 'count'] }),
    ctx
  );
  assert.ok(broke(dup, 7), why(dup));

  const isAnswer = validateItem(
    feel({ distractors: ['feel', 'sing', 'open', 'carry', 'paint', 'climb', 'wash', 'count'] }),
    ctx
  );
  assert.ok(broke(isAnswer, 7), why(isAnswer));

  const absent = validateItem(
    feel({ distractors: ['men', 'sing', 'open', 'carry', 'paint', 'climb', 'wash', 'count'] }),
    ctx
  );
  assert.ok(broke(absent, 7), why(absent));
  assert.ok(absent.errors.some((e) => e.includes('men')), why(absent));
});

test('rule 8: pos is a SET unioned across both bands, and empty means exempt', () => {
  assert.deepEqual([...posIndex.get('kind')].sort(), ['adj', 'n']);
  assert.deepEqual([...posIndex.get('back')].sort(), ['adj', 'adv', 'n']);

  // "cat" is {n} only -- no overlap with feel {v}.
  const clash = validateItem(
    feel({ distractors: ['cat', 'sing', 'open', 'carry', 'paint', 'climb', 'wash', 'count'] }),
    ctx
  );
  assert.ok(broke(clash, 8), why(clash));
  assert.ok(clash.errors.some((e) => e.includes('cat')), why(clash));

  // "kind" is {adj, n}, so a plain noun distractor shares one value and passes.
  const kind = {
    lemma: 'kind',
    sense: 'nice to other people',
    sentence: 'The ___ girl gave the small dog some warm milk.',
    answer: 'kind',
    distractors: ['small', 'warm', 'big', 'old', 'little', 'red', 'soft', 'cat'],
  };
  const shared = validateItem(kind, ctx);
  assert.deepEqual(shared.errors, [], why(shared));

  // Numerals are folded to one value. The bands tag "ten" as `cardinal`, "four"
  // as `number` and "second" as `ordinal`; untouched, rule 8 left `ten` with
  // only three legal same-class distractors (six, three, thousand) when rule 7
  // demands eight, so no legal item could exist for it.
  for (const n of ['ten', 'four', 'second', 'three', 'twelve', 'hundred']) {
    assert.ok(posIndex.get(n).has('num'), `${n} must carry the folded numeral pos`);
  }
  assert.ok(!posIndex.get('ten').has('cardinal'), 'raw "cardinal" must not survive folding');
  const tenPool = [...allowed].filter((w) => w !== 'ten' && (posIndex.get(w) || new Set()).has('num'));
  assert.ok(tenPool.length >= 8, `"ten" needs >=8 same-class distractors, found ${tenPool.length}`);
  // ...and folding must not reach past numerals into ordinary parts of speech.
  assert.deepEqual([...posIndex.get('kind')].sort(), ['adj', 'n']);

  // "gave" carries no pos in either band, so it is exempt rather than rejected.
  assert.equal((posIndex.get('gave') || new Set()).size, 0);
  const exempt = validateItem(
    feel({ distractors: ['gave', 'sing', 'open', 'carry', 'paint', 'climb', 'wash', 'count'] }),
    ctx
  );
  assert.deepEqual(exempt.errors, [], why(exempt));
});

test('file-level: rules 1, 2, 9 and the item index prefix', () => {
  // rule 1 -- the filename must match lemma and answer.
  const misnamed = validateItemFile('walk', [feel()], ctx);
  assert.ok(broke(misnamed, 1), why(misnamed));
  assert.equal(misnamed.errors.filter((e) => e.includes('rule 1:')).length, 2);

  // rule 1, structural -- exactly the five contract keys. Neither direction was
  // covered: deleting the whole extra/missing block left the suite green.
  const missingKey = { ...FEEL };
  delete missingKey.distractors;
  const short = validateItem(missingKey, ctx);
  assert.ok(
    short.errors.some((e) => e.startsWith('rule 1: missing key(s):') && e.includes('distractors')),
    `a 4-key item must name the missing key, got: ${why(short)}`
  );
  const sixKeys = validateItem({ ...FEEL, hint: 'it rhymes with wheel' }, ctx);
  assert.ok(
    sixKeys.errors.some((e) => e.startsWith('rule 1: unexpected key(s):') && e.includes('hint')),
    `a 6-key item must name the extra key, got: ${why(sixKeys)}`
  );

  // rule 2 -- 1..3 items.
  const four = validateItemFile('feel', [feel(), feel(), feel(), feel()], ctx);
  assert.ok(broke(four, 2), why(four));
  const empty = validateItemFile('feel', [], ctx);
  assert.ok(broke(empty, 2), why(empty));

  // rule 9 -- senses must be distinct within a file.
  // The gloss is in HER vocabulary because rule 11 now holds it to the same
  // standard as the sentence. This fixture used to read "to have an emotion",
  // which rule 11 rejects: "emotion" is not a manifest word, so under D22 she
  // would have been shown a gloss containing a word she cannot read.
  const second = feel({
    sense: 'to be happy or sad inside',
    sentence: 'I ___ happy when my dog can play.',
  });
  const distinct = validateItemFile('feel', [feel(), second], ctx);
  assert.deepEqual(distinct.errors, [], why(distinct));
  const sameSense = validateItemFile('feel', [feel(), feel({ ...second, sense: FEEL.sense })], ctx);
  assert.ok(broke(sameSense, 9), why(sameSense));

  // rule 9 -- the 80-character ceiling. No test asserted ANY sense length, so
  // MAX_SENSE could be raised, lowered or deleted with the suite still green.
  // Both fixtures are plain manifest words that straddle the limit at 79 and
  // 83 characters, so only the LENGTH can be what trips.
  const longSense = 'to touch a soft cat with your hand and then tell me how the soft cat feels now.';
  assert.equal(longSense.length, 79, 'the under-limit fixture must sit just inside the ceiling');
  const under = validateItemFile('feel', [feel({ sense: longSense })], ctx);
  assert.ok(!broke(under, 9), `79 characters must be legal, got: ${why(under)}`);
  const over = validateItemFile('feel', [feel({ sense: `${longSense} yes` })], ctx);
  assert.ok(broke(over, 9), `83 characters must trip rule 9, got: ${why(over)}`);
  assert.ok(over.errors.some((e) => e.includes('83')), why(over));

  // an item-level error comes back tagged with the item it came from.
  const indexed = validateItemFile(
    'feel',
    [feel(), { ...second, sentence: 'I ___ happy when my ___ can play.' }],
    ctx
  );
  assert.ok(
    indexed.errors.some((e) => e.startsWith('[1] rule 3:')),
    `item-level errors must carry their index, got: ${why(indexed)}`
  );
  assert.ok(!indexed.errors.some((e) => e.startsWith('[0] ')), why(indexed));
});

test('rule 12: the answer is a manifest word VERBATIM, reached by no transform', () => {
  // H1 -- nothing checked the answer itself, so an item could ship whose own
  // CORRECT answer has no audio clip: the one word she most needs to hear is
  // the one word that is silent. Both of these passed the entire gate clean.
  for (const bad of ['feels', 'cats']) {
    const res = validateItem(feel({ answer: bad }), ctx);
    assert.ok(broke(res, 12), `answer "${bad}" must trip rule 12, got: ${why(res)}`);
    assert.ok(
      res.errors.some((e) => e.startsWith('rule 12:') && e.includes(`"${bad}"`)),
      `rule 12 must name the offending answer, got: ${why(res)}`
    );
  }

  // H3 -- a trailing space makes resolveLemma return null, so rule 10's
  // answerLemma fell back to a raw string that no token can ever equal and the
  // sentence was free to hand her the answer. It echoes "feel" here and passed.
  const spaced = validateItem(
    feel({ answer: 'feel ', sentence: 'I ___ the cat and feel my hand.' }),
    ctx
  );
  assert.ok(broke(spaced, 12), `a trailing space must trip rule 12, got: ${why(spaced)}`);

  // H2 -- the regression that matters most. buildPosIndex is filtered by the
  // manifest, so "Feel" has no entry; an absent entry reads as an EMPTY pos
  // set; and an empty set means exempt. One capital letter therefore switched
  // the whole semantic-distractor check off, and "cat" {n} sailed past a {v}
  // answer that the lowercase spelling correctly rejects. Rule 12 must name it
  // AND rule 8 must not stay silently disabled underneath rule 12.
  const withCat = ['cat', 'sing', 'open', 'carry', 'paint', 'climb', 'wash', 'count'];
  const control = validateItem(feel({ distractors: withCat }), ctx);
  assert.ok(broke(control, 8), `the lowercase control must trip rule 8, got: ${why(control)}`);

  const capital = validateItem(feel({ answer: 'Feel', distractors: withCat }), ctx);
  assert.ok(broke(capital, 12), `"Feel" must trip rule 12, got: ${why(capital)}`);
  assert.ok(
    broke(capital, 8),
    `rule 8 must not fail open on a capitalised answer, got: ${why(capital)}`
  );
  assert.ok(
    capital.errors.some((e) => e.startsWith('rule 8:') && e.includes('cat')),
    `rule 8 must still name the clashing distractor, got: ${why(capital)}`
  );

  // ...and a legal answer is untouched by any of it.
  assert.ok(!broke(validateItem(feel(), ctx), 12), 'a manifest answer must not trip rule 12');
});

test('rule 4 hardened: the characters tokenize DISCARDS can no longer pass', () => {
  // tokenize is /[a-z]+(?:'[a-z]+)?/g, so it does not fail to match a digit or
  // a Cyrillic letter -- it drops them and hands rule 4 a clean token list.
  // Every fixture here passed the gate before the character whitelist.
  const illegal = (sentence) => {
    const res = validateItem(feel({ sentence }), ctx);
    assert.ok(broke(res, 4), `${JSON.stringify(sentence)} must trip rule 4, got: ${why(res)}`);
    const line = res.errors.find((e) => e.startsWith('rule 4: illegal character(s):'));
    assert.ok(line, `expected the illegal-character form of rule 4, got: ${why(res)}`);
    return line;
  };

  assert.ok(illegal('I ___ 42 soft cat toys.').includes('4'), 'a digit must be named');
  assert.ok(illegal('I ___ the кошка with my hand.').includes('к'), 'Cyrillic must be named');

  // The emoji must be reported as ONE character. Without the `u` flag the class
  // matches code UNITS, so an astral emoji comes back as two lone surrogates and
  // is reported as two unprintable halves. Counting the entries is what
  // distinguishes the two -- a whole emoji still *contains* its high surrogate,
  // so asserting on the halves directly proves nothing either way.
  const emoji = illegal('I ___ the soft cat \u{1F431} hand.');
  const listed = emoji.slice('rule 4: illegal character(s): '.length).split(', ');
  assert.deepEqual(
    listed,
    ['\u{1F431}'],
    `the emoji must be one character, not a pair of surrogate halves, got: ${emoji}`
  );

  // H5 -- accent residue was LAUNDERED, not caught: "caté" tokenises to "cat",
  // which IS a manifest word, so the garbage passed the token check outright.
  // "café" was blocked only by luck, because "cafe" happens not to be a word.
  const accent = illegal('I ___ the soft caté with my hand.');
  assert.ok(accent.includes('é'), `the accented character must be named, got: ${accent}`);

  // ...and the junk also padded rule 5's whitespace word count, so a sentence
  // too short to be legal could be inflated into range by characters rule 4
  // could not see. Three real words, five "words" counted.
  const padded = validateItem(feel({ sentence: 'I ___ 1 2 3.' }), ctx);
  assert.ok(broke(padded, 4), `rule-5 padding must now trip rule 4, got: ${why(padded)}`);

  // The pre-existing token check is UNCHANGED, and so is its bare-list format:
  // downstream workers parse "rule 4: men" and must keep being able to.
  const token = validateItem(feel({ sentence: 'I ___ the men with my hand.' }), ctx);
  assert.ok(
    token.errors.includes('rule 4: men'),
    `the bare rule-4 token format must survive verbatim, got: ${why(token)}`
  );
  assert.ok(
    !token.errors.some((e) => e.includes('illegal character')),
    `a plain ASCII sentence must not trip the character check, got: ${why(token)}`
  );
});

test('rule 11: the gloss D22 shows her must be in her vocabulary too', () => {
  // D22 puts `sense` on screen beside the sentence, so a gloss built from words
  // she cannot read is worse than no gloss: it is what she turns to when stuck.
  const bad = validateItem(feel({ sense: 'the brightness of a lamp' }), ctx);
  assert.ok(broke(bad, 11), `an unreadable gloss must trip rule 11, got: ${why(bad)}`);
  assert.ok(
    bad.errors.includes('rule 11: brightness'),
    `rule 11 must name the offending token in the bare rule-4 format, got: ${why(bad)}`
  );

  // ...and a gloss entirely inside the manifest passes.
  const good = validateItem(feel({ sense: 'to touch something with your hand' }), ctx);
  assert.ok(!broke(good, 11), `a readable gloss must not trip rule 11, got: ${why(good)}`);
  assert.deepEqual(good.errors, [], why(good));

  // An inflection is fine: rule 11 asks that the token RESOLVE into the
  // manifest, exactly as rule 4 does, not that it appear in it verbatim.
  const inflected = validateItem(feel({ sense: 'when your hands are touching a cat' }), ctx);
  assert.ok(!broke(inflected, 11), `an inflected gloss must resolve, got: ${why(inflected)}`);
});

test('rule 9 hardened: whitespace is not a sense, and neither is a stray space', () => {
  // "   " has length 3, so a bare length check called it non-empty. Under D22
  // that ships a blank gloss box to the learner.
  const blank = validateItemFile('feel', [feel({ sense: '   ' })], ctx);
  assert.ok(broke(blank, 9), `an all-whitespace sense must trip rule 9, got: ${why(blank)}`);
  assert.equal(blank.ok, false);

  // "  " and "   " differ as strings, so the distinctness check treated them as
  // two different senses. Neither is a sense at all, and the file must not pass.
  const pair = validateItemFile(
    'feel',
    [feel({ sense: '  ' }), feel({ sense: '   ', sentence: 'I ___ happy when my dog can play.' })],
    ctx
  );
  assert.equal(pair.ok, false, 'two blank senses must not pass as two distinct senses');
  assert.equal(
    pair.errors.filter((e) => e.includes('rule 9:')).length,
    2,
    `both blank senses must be reported, got: ${why(pair)}`
  );

  // ...and distinctness is compared TRIMMED, so one real gloss cannot ship
  // twice under two sentences by virtue of a trailing keystroke.
  const spaced = validateItemFile(
    'feel',
    [
      feel({ sense: 'to touch something with your hand' }),
      feel({ sense: 'to touch something with your hand ', sentence: 'I ___ happy when my dog can play.' }),
    ],
    ctx
  );
  assert.ok(broke(spaced, 9), `a trailing space must not make a sense distinct, got: ${why(spaced)}`);
  assert.ok(spaced.errors.some((e) => e.includes('duplicate sense')), why(spaced));
});

test('the "== null" pos guard is load-bearing, on a word that actually exercises it', () => {
  // This test replaces a VACUOUS one. It used to assert on "gave", which has no
  // band entry AT ALL -- posIndex has no such key, the `|| new Set()` fallback
  // supplied the empty set, and the assertion held whether the guard existed or
  // not. 50 manifest words are in that no-entry class and none of them can
  // detect the guard.
  //
  // The guard governs a DIFFERENT class: the 13 words that DO have a band entry
  // whose `pos` is null. String(null) is the truthy string "null", so without
  // the guard posValues returns ["null"] and the set is {"null"} -- size 1, not
  // 0 -- the word stops being exempt, and rule 8 then rejects every real
  // distractor against it.
  const guardGoverned = [
    'all', 'each', 'than', 'become', 'repeat', 'video', 'worst', 'writing',
    'zone', "let's", 'therefore', 'sparkling', 'environmentally',
  ];

  for (const word of guardGoverned) {
    const set = posIndex.get(word);
    assert.ok(set instanceof Set, `"${word}" must HAVE an entry, or it cannot test the guard`);
    assert.equal(
      set.size,
      0,
      `"${word}" must have an EMPTY pos set; without the "== null" guard it is {"null"}`
    );
    assert.ok(!set.has('null'), `the string "null" must never become a part of speech ("${word}")`);
  }

  // The behaviour that matters: an empty pos set means EXEMPT, so a
  // guard-governed word is a legal distractor rather than a rule 8 clash.
  const exempt = validateItem(
    feel({ distractors: ['all', 'sing', 'open', 'carry', 'paint', 'climb', 'wash', 'count'] }),
    ctx
  );
  assert.ok(!broke(exempt, 8), `a null-pos word must be exempt from rule 8, got: ${why(exempt)}`);
});
