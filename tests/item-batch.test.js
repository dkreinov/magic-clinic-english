import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { buildPosIndex, validateItemFile } from '../lib/quiz-item.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const batchScript = path.join(root, 'scripts', 'check-item-batch.mjs');
const bankScript = path.join(root, 'scripts', 'check-quiz-bank.mjs');

const read = (...p) => JSON.parse(readFileSync(path.join(root, ...p), 'utf8'));

// The real bands and the real manifest, for the same reason tests/quiz-item.test.js
// uses them: rule 8 is only meaningful against the actual pos unions, and the
// fixture sentences below are legal only because every word in them was checked
// against the real manifest, which is NOT ordinary English.
const allowed = new Set(read('public', 'audio', 'words', 'index.json'));
const ctx = { allowed, posIndex: buildPosIndex(read('data', 'band1.json'), read('data', 'band2.json'), allowed) };

// ---------------------------------------------------------------------------
// THE POISON SET, verbatim.
// ---------------------------------------------------------------------------
// These three files are the phase's control. Each is a shape-legal quiz item
// that carries deliberate WRONG-ANSWER TRAPS: distractors that also correctly
// fill the blank, so a child choosing one is marked wrong for a right answer.
//
// They are embedded here as TEXT, not rebuilt from an object literal, and their
// md5s are pinned against the frozen copies at C:/Users/dkreinov/f3-poison/.
// Rebuilding them from a literal would let a well-meaning edit quietly "tidy" a
// trap out of existence, and every assertion below would stay green while
// measuring nothing.
const POISON_TEXT = {
  'glow.json':
    '[{"lemma":"glow","sense":"to give a soft warm light in the dark","sentence":"The little lamp will ___ in the dark room so we can sleep.","answer":"glow","distractors":["shine","burn","sing","cry","break","hurt","call","laugh"]}]\n',
  'harm.json':
    '[{"lemma":"harm","sense":"to make a person or animal feel bad pain","sentence":"Please do not ___ the little bird, it is very small.","answer":"harm","distractors":["hurt","damage","sing","call","shout","laugh","cry","close"]}]\n',
  'moon.json':
    '[{"lemma":"moon","sense":"the big round thing we see in the sky at night","sentence":"We looked up and saw the ___ in the dark sky.","answer":"moon","distractors":["star","sun","cloud","bird","deer","horse","sheep","cow"]}]\n',
};

const POISON_MD5 = {
  'glow.json': 'a529d185d3605173ed6b7716fa53ae29',
  'harm.json': '2f5a1da3d0a28432a7607b553d890a2e',
  'moon.json': 'ef04e3c4c7f10c8bf5f519f7a3f8e50b',
};

// The planted traps, by hand. `shine` and `burn` both fill "The little lamp will
// ___ in the dark room"; `hurt` is a plain synonym of `harm`; and four of moon's
// eight options are things you can look up and see in the sky.
const PLANTED = {
  'glow.json': ['shine', 'burn'],
  'harm.json': ['hurt'],
  'moon.json': ['star', 'sun', 'cloud', 'bird'],
};

const FROZEN_DIR = 'C:/Users/dkreinov/f3-poison';

const md5 = (text) => createHash('md5').update(text, 'utf8').digest('hex');

// ---------------------------------------------------------------------------
// Fixtures live in an OS temp dir, NEVER in public/quiz/ and never in the
// staging tree a real run uses. A stray file in public/quiz/ would dirty the
// very bank tests/quiz-bank.test.js measures, and tests/word-audio.test.js and
// tests/lemma.test.js assert exact file counts elsewhere in the tree.
// os.tmpdir() is read inside node on purpose -- Git Bash's /tmp is not node's,
// and handing node a /c/Users/... path yields C:\c\Users\...
// ---------------------------------------------------------------------------
function withFiles(files, fn) {
  const dir = mkdtempSync(path.join(tmpdir(), 'f3-stage-'));
  try {
    for (const [rel, content] of Object.entries(files)) {
      if (content === null) continue; // an explicit "this file is absent"
      const full = path.join(dir, ...rel.split('/'));
      mkdirSync(path.dirname(full), { recursive: true });
      writeFileSync(full, typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`);
    }
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const runBatch = (...args) => spawnSync(process.execPath, [batchScript, ...args], { encoding: 'utf8' });
const runBank = (...args) => spawnSync(process.execPath, [bankScript, ...args], { encoding: 'utf8' });
const out = (r) => `${r.stdout}${r.stderr}`;

// Two ordinary, gate-legal items to sit beside the poison, reused verbatim from
// tests/quiz-bank.test.js. feel.json carries two senses so multiSense has
// something to count; kind.json carries one.
const FEEL_TOUCH = {
  lemma: 'feel',
  sense: 'to touch something with your hand',
  sentence: 'I ___ the soft cat with my hand.',
  answer: 'feel',
  distractors: ['jump', 'sing', 'open', 'carry', 'paint', 'climb', 'wash', 'count'],
};
const FEEL_EMOTION = { ...FEEL_TOUCH, sense: 'to be happy or sad inside', sentence: 'I ___ happy when my dog can play.' };
const KIND = {
  lemma: 'kind',
  sense: 'nice to other people',
  sentence: 'The ___ girl gave the small dog some warm milk.',
  answer: 'kind',
  distractors: ['small', 'warm', 'big', 'old', 'little', 'red', 'soft', 'cat'],
};

const GLOW = 'batch-1/glow.json#0';
const HARM = 'batch-1/harm.json#0';
const MOON = 'batch-1/moon.json#0';
const FEEL0 = 'batch-2/feel.json#0';
const FEEL1 = 'batch-2/feel.json#1';
const KIND0 = 'batch-2/kind.json#0';
const ALL_IDS = [GLOW, HARM, MOON, FEEL0, FEEL1, KIND0];

const STAGE_ITEMS = {
  'batch-1/glow.json': POISON_TEXT['glow.json'],
  'batch-1/harm.json': POISON_TEXT['harm.json'],
  'batch-1/moon.json': POISON_TEXT['moon.json'],
  'batch-2/feel.json': [FEEL_TOUCH, FEEL_EMOTION],
  'batch-2/kind.json': [KIND],
};

const POISON_MANIFEST = [
  { item: GLOW, leaks: PLANTED['glow.json'] },
  { item: HARM, leaks: PLANTED['harm.json'] },
  { item: MOON, leaks: PLANTED['moon.json'] },
];

// Pass A finds every planted trap and additionally flags kind.
const VERDICTS_A = {
  pass: 'A',
  reviewed: ALL_IDS,
  verdicts: [
    { item: GLOW, fits: ['shine', 'burn'] },
    { item: HARM, fits: ['hurt'] },
    { item: MOON, fits: ['star', 'sun', 'cloud'] },
    { item: FEEL0, fits: [] },
    { item: FEEL1, fits: [] },
    { item: KIND0, fits: ['soft'] },
  ],
};

// Pass B finds every planted trap too, but disagrees with A about the two real
// items -- which is what makes the agreement figure non-trivial.
const VERDICTS_B = {
  pass: 'B',
  reviewed: ALL_IDS,
  verdicts: [
    { item: GLOW, fits: ['shine'] },
    { item: HARM, fits: ['hurt'] },
    { item: MOON, fits: ['star'] },
    { item: FEEL0, fits: [] },
    { item: FEEL1, fits: ['sing'] },
    { item: KIND0, fits: [] },
  ],
};

const stage = (over = {}) => ({
  ...STAGE_ITEMS,
  'POISON.json': POISON_MANIFEST,
  'verdicts-A.json': VERDICTS_A,
  'verdicts-B.json': VERDICTS_B,
  ...over,
});

// Deep-enough clone plus one edit, so a mutation in one test cannot leak into
// the next through a shared object.
const withVerdicts = (base, edit) => edit({ ...base, reviewed: [...base.reviewed], verdicts: base.verdicts.map((v) => ({ ...v, fits: [...v.fits] })) });

test('check-item-batch.mjs passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', batchScript]);
  assert.equal(result.status, 0, `node --check failed: ${result.stderr}`);
});

// ===========================================================================
// THE INVERTED TEST. A GREEN RESULT HERE IS THE FAILURE SIGNAL EVERYWHERE ELSE.
// ===========================================================================
// Every other assertion in this repo says "the gate catches the bad item". This
// one says the OPPOSITE, on purpose: the three poison items must PASS the shape
// gate clean -- exit 0, zero errors -- while carrying wrong-answer traps.
//
// That is the whole claim of this phase. scripts/check-quiz-bank.mjs and
// lib/quiz-item.js check SHAPE: eight distinct manifest distractors, one blank,
// a readable sentence, an intersecting part of speech. None of those rules can
// ask whether a distractor is ALSO a correct answer, and no rule that could be
// written from the item alone can. `shine` for `glow` satisfies every one of
// them. So the fact that this test is green is the mechanical proof that the
// defect class is invisible to the mechanical gate -- and therefore that the two
// blind human-shaped review passes are not optional ceremony.
//
// IF THIS TEST EVER STARTS FAILING, the poisons have stopped being poisons and
// MUST BE REBUILT. A red result here does not mean the gate got better at
// spotting wrong answers -- it cannot -- it means somebody edited a poison into
// shape-illegality, and the control is now measuring nothing.
//
// The trap assertion below is why this test is not vacuous. Asking only "does it
// pass the gate?" would stay green against a poison whose traps had been tidied
// away, which is precisely the "what would make this pass while broken?" case:
// a clean item passing a clean gate proves nothing at all. So the planted
// distractors are asserted PRESENT first, and only then is the pass asserted.
test('THE INVERTED GATE: the poison items pass the shape contract, traps and all', () => {
  for (const [name, text] of Object.entries(POISON_TEXT)) {
    // 1. The traps are still in there. Without this the rest is decoration.
    const items = JSON.parse(text);
    assert.equal(items.length, 1, `${name} must hold exactly one item`);
    for (const trap of PLANTED[name]) {
      assert.ok(
        items[0].distractors.includes(trap),
        `${name} has lost its planted trap "${trap}" -- it is no longer a poison and must be rebuilt`
      );
    }

    // 2. ...and the contract sees nothing wrong with it.
    const lemma = name.slice(0, -'.json'.length);
    const result = validateItemFile(lemma, items, ctx);
    assert.deepEqual(
      result.errors,
      [],
      `${name} no longer passes the shape contract, so the poison set must be rebuilt: ${result.errors.join(' | ')}`
    );
    assert.ok(result.ok, `${name} must be shape-legal`);
  }

  // 3. And end to end, through the shipped gate, exactly as the phase claims.
  const result = withFiles(POISON_TEXT, (dir) => runBank('--dir', dir));
  assert.equal(result.status, 0, `the poison set must pass the shape gate, got exit ${result.status}: ${out(result)}`);
  assert.ok(
    result.stdout.includes('QUIZ BANK OK: 3 files, 3 items'),
    `expected the poison set to gate clean at 3 files, 3 items, got: ${result.stdout}`
  );
});

test('the embedded poison matches the frozen copy byte for byte', () => {
  // The pinned md5s are the link between this file and the frozen artifact
  // outside the repo. They fire if either copy is retyped, reformatted, or
  // "improved".
  for (const [name, text] of Object.entries(POISON_TEXT)) {
    assert.equal(md5(text), POISON_MD5[name], `the embedded ${name} no longer matches its pinned md5`);
  }

  // The frozen set lives outside the repository on the owner's machine, so this
  // half is conditional -- but it is NOT silent about being skipped, because a
  // check that quietly does nothing is worse than no check.
  if (!existsSync(FROZEN_DIR)) {
    console.log(`note: ${FROZEN_DIR} is absent on this machine; the on-disk half of this test did not run`);
    return;
  }
  for (const name of Object.keys(POISON_TEXT)) {
    const onDisk = readFileSync(path.join(FROZEN_DIR, name), 'utf8');
    assert.equal(md5(onDisk), POISON_MD5[name], `${FROZEN_DIR}/${name} has drifted from the frozen poison`);
  }
});

test('--stage counts every staged file, item and multi-sense file', () => {
  const result = withFiles(stage(), (dir) => runBatch('--stage', dir));
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}: ${out(result)}`);
  // 3 poison + feel(2 items) + kind(1) = 5 files, 6 items, and feel.json is the
  // only file with >= 2 items.
  assert.ok(result.stdout.includes('BATCH files=5 items=6 multiSense=1'), `wrong BATCH line: ${result.stdout}`);
});

test('--stage walks every batch-*/ directory, not just the first', () => {
  // batch-2 holds feel and kind. A harness that stopped after batch-1 would
  // report files=3 and still look perfectly healthy, which is the shape of every
  // silent-drop defect this project has shipped.
  const onlyFirst = withFiles({ ...stage(), 'batch-2/feel.json': null, 'batch-2/kind.json': null }, (dir) =>
    runBatch('--stage', dir)
  );
  assert.ok(onlyFirst.stdout.includes('BATCH files=3 items=3'), `wrong BATCH line: ${onlyFirst.stdout}`);

  const both = withFiles(stage(), (dir) => runBatch('--stage', dir));
  assert.ok(both.stdout.includes('files=5'), `both batches must be walked: ${both.stdout}`);
});

test('--stage fails on a staged file that breaks the contract, and names it', () => {
  // "men" is verified absent from the manifest, so this trips rule 4.
  const broken = { ...KIND, sentence: 'The ___ girl gave the men some warm milk.' };
  const result = withFiles(stage({ 'batch-2/kind.json': [broken] }), (dir) => runBatch('--stage', dir));
  assert.equal(result.status, 1, `expected exit 1, got ${result.status}: ${out(result)}`);
  assert.ok(
    result.stdout.includes('batch-2/kind.json[0] rule 4:'),
    `a problem must name its batch, file, item and rule, got: ${result.stdout}`
  );
  assert.ok(result.stdout.includes('men'), `rule 4 must name the offending token, got: ${result.stdout}`);
  assert.ok(result.stdout.includes('BATCH FAILED: '), `missing the FAILED line, got: ${result.stdout}`);
  // The counts still print. A gate that fails without saying what it observed
  // leaves the next reader with nothing to act on.
  assert.ok(result.stdout.includes('BATCH files=5'), `the counts must print even on failure, got: ${result.stdout}`);
});

test('RULE8EXEMPT counts the answers rule 8 cannot check, and never fails the run', () => {
  // glow, harm and moon have NO band entry, so rule 8's pos set on the answer
  // side is empty and the check does not fire at all. feel and kind do have
  // entries. That is 3 of 5, and it is a WARNING: the batch is still green.
  const result = withFiles(stage(), (dir) => runBatch('--stage', dir));
  assert.equal(result.status, 0, `RULE8EXEMPT must never fail the run, got exit ${result.status}: ${out(result)}`);
  assert.ok(result.stdout.includes('RULE8EXEMPT answers=3 of 5'), `wrong RULE8EXEMPT line: ${result.stdout}`);

  // ...and the count MOVES with its input. A constant would be indistinguishable
  // from a correct count on this one fixture.
  const noPoison = withFiles({ ...stage(), 'batch-1/glow.json': null, 'batch-1/harm.json': null, 'batch-1/moon.json': null }, (dir) =>
    runBatch('--stage', dir)
  );
  assert.ok(noPoison.stdout.includes('RULE8EXEMPT answers=0 of 2'), `wrong RULE8EXEMPT line: ${noPoison.stdout}`);
});

test('--stage reports a missing stage directory as zero rather than crashing', () => {
  // Same documented behaviour as check-quiz-bank.mjs on a missing --dir: the
  // harness has to be runnable before the batch exists. The caller's own gate is
  // "files == the number of words I asked for", which is strictly stronger than
  // "files > 0" and is where a dropped word is actually caught.
  const result = withFiles({}, (dir) => runBatch('--stage', path.join(dir, 'not-here')));
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}: ${out(result)}`);
  assert.ok(result.stdout.includes('BATCH files=0 items=0 multiSense=0'), `wrong BATCH line: ${result.stdout}`);
});

test('--verdicts prints both passes and the union when everything is sound', () => {
  const result = withFiles(stage(), (dir) => runBatch('--stage', dir, '--verdicts'));
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}: ${out(result)}`);
  assert.ok(
    result.stdout.includes('PASS A reviewed=6 verdicts=6 flags=4 poisonRecall=3/3'),
    `wrong PASS A line: ${result.stdout}`
  );
  assert.ok(
    result.stdout.includes('PASS B reviewed=6 verdicts=6 flags=4 poisonRecall=3/3'),
    `wrong PASS B line: ${result.stdout}`
  );
  // A flags {glow, harm, moon, kind}; B flags {glow, harm, moon, feel#1}. Union
  // is 5, intersection 3, so Jaccard agreement is 60%. Asserting the number and
  // not merely the presence of the line is what makes this a measurement.
  assert.ok(result.stdout.includes('UNION items=5 agreement=60%'), `wrong UNION line: ${result.stdout}`);
});

test('--verdicts fails when a pass returns fewer verdicts than it reviewed', () => {
  // The "--sample 50 showed 40 of the 50 words" failure in a new costume: the
  // pass claims six items and speaks about five, and without this clause the
  // report reads exactly like a complete sweep.
  const short = withVerdicts(VERDICTS_A, (v) => ({ ...v, verdicts: v.verdicts.filter((x) => x.item !== KIND0) }));
  const result = withFiles(stage({ 'verdicts-A.json': short }), (dir) => runBatch('--stage', dir, '--verdicts'));
  assert.equal(result.status, 1, `expected exit 1, got ${result.status}: ${out(result)}`);
  assert.ok(result.stdout.includes('verdicts 5 != reviewed 6'), `wrong failure text: ${result.stdout}`);
  assert.ok(result.stdout.includes('PASS A reviewed=6 verdicts=5'), `the counts must print too: ${result.stdout}`);
});

test('a repeated verdict id cannot pad a pass back up to its reviewed count', () => {
  // Drop one verdict and duplicate another: the raw array is still six long, so
  // a naive length check would call this complete. Ids are deduplicated for
  // exactly this reason.
  const padded = withVerdicts(VERDICTS_B, (v) => ({
    ...v,
    verdicts: [...v.verdicts.filter((x) => x.item !== KIND0), { item: GLOW, fits: ['shine'] }],
  }));
  const result = withFiles(stage({ 'verdicts-B.json': padded }), (dir) => runBatch('--stage', dir, '--verdicts'));
  assert.equal(result.status, 1, `a duplicate id must not pad the count, got exit ${result.status}: ${out(result)}`);
  assert.ok(result.stdout.includes('PASS B reviewed=6 verdicts=5'), `wrong PASS B line: ${result.stdout}`);
  assert.ok(result.stdout.includes('verdicts 5 != reviewed 6'), `wrong failure text: ${result.stdout}`);
});

test('--verdicts fails when a pass misses a planted poison', () => {
  const blind = withVerdicts(VERDICTS_B, (v) => ({
    ...v,
    verdicts: v.verdicts.map((x) => (x.item === MOON ? { ...x, fits: [] } : x)),
  }));
  const result = withFiles(stage({ 'verdicts-B.json': blind }), (dir) => runBatch('--stage', dir, '--verdicts'));
  assert.equal(result.status, 1, `expected exit 1, got ${result.status}: ${out(result)}`);
  assert.ok(result.stdout.includes('poisonRecall 2/3 -- pass NOT TRUSTED'), `wrong failure text: ${result.stdout}`);
  assert.ok(result.stdout.includes('PASS B reviewed=6 verdicts=6 flags=3 poisonRecall=2/3'), `wrong PASS B line: ${result.stdout}`);
});

test('poison recall requires NAMING the planted trap, not merely flagging the item', () => {
  // The question "what would make this pass while broken?" answers itself here:
  // a reviewer that flags every item on any pretext would score a perfect 3/3
  // on a count of flagged items, and its verdicts on the real bank would still
  // be worthless. `cry` and `laugh` are real distractors of glow.json and both
  // are genuinely wrong in that sentence -- so this pass flagged the item, and
  // still did not see the poison.
  const wrongGrounds = withVerdicts(VERDICTS_A, (v) => ({
    ...v,
    verdicts: v.verdicts.map((x) => (x.item === GLOW ? { ...x, fits: ['cry', 'laugh'] } : x)),
  }));
  const result = withFiles(stage({ 'verdicts-A.json': wrongGrounds }), (dir) => runBatch('--stage', dir, '--verdicts'));
  assert.equal(result.status, 1, `expected exit 1, got ${result.status}: ${out(result)}`);
  assert.ok(result.stdout.includes('PASS A reviewed=6 verdicts=6 flags=4 poisonRecall=2/3'), `wrong PASS A line: ${result.stdout}`);
  assert.ok(result.stdout.includes('poisonRecall 2/3 -- pass NOT TRUSTED'), `wrong failure text: ${result.stdout}`);

  // ...and capitalisation or stray spacing must NOT cost a pass its recall: the
  // substance is which word was named.
  const shouty = withVerdicts(VERDICTS_A, (v) => ({
    ...v,
    verdicts: v.verdicts.map((x) => (x.item === GLOW ? { ...x, fits: ['  Shine  '] } : x)),
  }));
  const ok = withFiles(stage({ 'verdicts-A.json': shouty }), (dir) => runBatch('--stage', dir, '--verdicts'));
  assert.equal(ok.status, 0, `capitalisation must not cost recall, got exit ${ok.status}: ${out(ok)}`);
  assert.ok(ok.stdout.includes('PASS A reviewed=6 verdicts=6 flags=4 poisonRecall=3/3'), `wrong PASS A line: ${ok.stdout}`);
});

test('--verdicts fails when a pass observed nothing at all', () => {
  // An empty verdict file...
  const empty = { pass: 'A', reviewed: [], verdicts: [] };
  const emptied = withFiles(stage({ 'verdicts-A.json': empty }), (dir) => runBatch('--stage', dir, '--verdicts'));
  assert.equal(emptied.status, 1, `expected exit 1, got ${emptied.status}: ${out(emptied)}`);
  assert.ok(emptied.stdout.includes('reviewed=0 -- the pass observed nothing'), `wrong failure text: ${emptied.stdout}`);

  // ...and a verdict file that was never written at all are the same fact, and
  // must produce the same verdict rather than a crash or a silent skip.
  const absent = withFiles(stage({ 'verdicts-B.json': null }), (dir) => runBatch('--stage', dir, '--verdicts'));
  assert.equal(absent.status, 1, `a missing verdict file must fail, got exit ${absent.status}: ${out(absent)}`);
  assert.ok(absent.stdout.includes('PASS B reviewed=0 verdicts=0'), `wrong PASS B line: ${absent.stdout}`);
  assert.ok(absent.stdout.includes('reviewed=0 -- the pass observed nothing'), `wrong failure text: ${absent.stdout}`);
});

test('a pass cannot inflate its own denominator with items that are not in the batch', () => {
  const ghosts = withVerdicts(VERDICTS_A, (v) => ({ ...v, reviewed: [...v.reviewed, 'batch-9/ghost.json#0'] }));
  const result = withFiles(stage({ 'verdicts-A.json': ghosts }), (dir) => runBatch('--stage', dir, '--verdicts'));
  assert.equal(result.status, 1, `expected exit 1, got ${result.status}: ${out(result)}`);
  assert.ok(
    result.stdout.includes('reviewed names "batch-9/ghost.json#0", which is not in the staged batch'),
    `wrong failure text: ${result.stdout}`
  );
});

test('--verdicts fails when the control itself is missing or the wrong size', () => {
  // With no control there is no poisonRecall, and with no poisonRecall the two
  // passes are unverified prose again -- which is the state this whole harness
  // exists to leave behind.
  const gone = withFiles(stage({ 'POISON.json': null }), (dir) => runBatch('--stage', dir, '--verdicts'));
  assert.equal(gone.status, 1, `a missing control must fail, got exit ${gone.status}: ${out(gone)}`);
  assert.ok(gone.stdout.includes('POISON.json is missing'), `wrong failure text: ${gone.stdout}`);

  const short = withFiles(stage({ 'POISON.json': POISON_MANIFEST.slice(0, 2) }), (dir) => runBatch('--stage', dir, '--verdicts'));
  assert.equal(short.status, 1, `a two-item control must fail, got exit ${short.status}: ${out(short)}`);
  assert.ok(short.stdout.includes('must name exactly 3 poison items, got 2'), `wrong failure text: ${short.stdout}`);

  const unplanted = withFiles(stage({ 'POISON.json': [{ item: GLOW, leaks: [] }, { item: HARM, leaks: ['hurt'] }, { item: MOON, leaks: ['star'] }] }), (dir) =>
    runBatch('--stage', dir, '--verdicts')
  );
  assert.equal(unplanted.status, 1, `a control with no planted leaks must fail, got exit ${unplanted.status}: ${out(unplanted)}`);
  assert.ok(unplanted.stdout.includes('needs a non-empty "leaks" array'), `wrong failure text: ${unplanted.stdout}`);
});

test('UNION agreement is measured over the flagged sets, not over every item', () => {
  // Both passes flag exactly the three poisons and nothing else: perfect
  // agreement on what matters.
  const clean = (letter) => ({
    pass: letter,
    reviewed: ALL_IDS,
    verdicts: [
      { item: GLOW, fits: ['shine'] },
      { item: HARM, fits: ['hurt'] },
      { item: MOON, fits: ['star'] },
      { item: FEEL0, fits: [] },
      { item: FEEL1, fits: [] },
      { item: KIND0, fits: [] },
    ],
  });
  const agreed = withFiles(stage({ 'verdicts-A.json': clean('A'), 'verdicts-B.json': clean('B') }), (dir) =>
    runBatch('--stage', dir, '--verdicts')
  );
  assert.equal(agreed.status, 0, `expected exit 0, got ${agreed.status}: ${out(agreed)}`);
  assert.ok(agreed.stdout.includes('UNION items=3 agreement=100%'), `wrong UNION line: ${agreed.stdout}`);

  // Now B additionally flags all three ordinary items. Six flagged in the union,
  // three in common: 50%. A per-item agree/disagree rate would have called this
  // 50% too on a six-item fixture, but on a real batch -- where four items in
  // five are clean and both passes say so -- it would read in the high eighties
  // no matter how badly the passes disagreed about the ones that matter.
  const noisyB = { ...clean('B'), verdicts: clean('B').verdicts.map((v) => (v.fits.length ? v : { ...v, fits: ['cat'] })) };
  const split = withFiles(stage({ 'verdicts-A.json': clean('A'), 'verdicts-B.json': noisyB }), (dir) =>
    runBatch('--stage', dir, '--verdicts')
  );
  assert.equal(split.status, 0, `expected exit 0, got ${split.status}: ${out(split)}`);
  assert.ok(split.stdout.includes('UNION items=6 agreement=50%'), `wrong UNION line: ${split.stdout}`);
});
