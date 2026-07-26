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
  // "children" is VERIFIED absent from the manifest -- irregular plurals are
  // exactly the trap rule 4 exists to catch.
  const res = validateItem(feel({ sentence: 'I ___ the children with my hand.' }), ctx);
  assert.ok(broke(res, 4), why(res));
  assert.ok(
    res.errors.some((e) => e.startsWith('rule 4:') && e.includes('children')),
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
    feel({ distractors: ['children', 'sing', 'open', 'carry', 'paint', 'climb', 'wash', 'count'] }),
    ctx
  );
  assert.ok(broke(absent, 7), why(absent));
  assert.ok(absent.errors.some((e) => e.includes('children')), why(absent));
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

  // rule 2 -- 1..3 items.
  const four = validateItemFile('feel', [feel(), feel(), feel(), feel()], ctx);
  assert.ok(broke(four, 2), why(four));
  const empty = validateItemFile('feel', [], ctx);
  assert.ok(broke(empty, 2), why(empty));

  // rule 9 -- senses must be distinct within a file.
  const second = feel({
    sense: 'to have an emotion',
    sentence: 'I ___ happy when my dog can play.',
  });
  const distinct = validateItemFile('feel', [feel(), second], ctx);
  assert.deepEqual(distinct.errors, [], why(distinct));
  const sameSense = validateItemFile('feel', [feel(), feel({ ...second, sense: FEEL.sense })], ctx);
  assert.ok(broke(sameSense, 9), why(sameSense));

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
