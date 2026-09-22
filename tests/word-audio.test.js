import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  wordsToGenerate,
  bandWords,
  clipsOnDisk,
  readStoryWords,
  readExamWords,
  examWordsToGenerate,
} from '../scripts/build-word-audio.js';
import { resolveLemma } from '../public/lemma.js';
import { probeAac, checkClip } from '../scripts/check-word-audio.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const scriptPath = path.join(root, 'scripts', 'build-word-audio.js');
const wordsDir = path.join(root, 'public', 'audio', 'words');
const manifestPath = path.join(wordsDir, 'index.json');

test('build-word-audio.js passes node --check', () => {
  const result = spawnSync(process.execPath, ['--check', scriptPath]);
  assert.strictEqual(result.status, 0, `node --check failed: ${result.stderr}`);
});

// RE-EXPRESSED in phase 2. The property this test has named since the first run
// is "the word list is DERIVED, never hardcoded here". Phase 2 adds a second
// source -- data/story-words.json -- which keeps that property true: the extras
// are a validated DATA FILE, not an array in this script. Every original
// assertion survives; the data file is added to them.
test('the generator derives its word list from the band data and a data file, never a hardcoded list', () => {
  const src = readFileSync(scriptPath, 'utf8');
  assert.ok(src.includes('buildAllowedSet'));
  assert.ok(src.includes('band1.json'));
  assert.ok(src.includes('band2.json'));
  assert.ok(src.includes("'A2'"));
  assert.ok(src.includes('story-words.json'), 'the extras must come from a data file');
  assert.ok(!src.includes("'apartment'"));
  assert.ok(!src.includes("'telecommunications'"));
  for (const w of ['after', 'deer', 'feet', 'glow', 'growl', 'harm', 'moon', 'nervous', 'scary', 'tight']) {
    assert.ok(!src.includes(`'${w}'`), `the story word '${w}' is hardcoded in the generator`);
  }
});

// A third source -- public/exam-words.json, a teacher-supplied exam word list --
// same property: a data file, never a literal array here.
test('the generator also derives an exam-words source, still never hardcoded', () => {
  const src = readFileSync(scriptPath, 'utf8');
  assert.ok(src.includes('exam-words.json'), 'the exam words must come from a data file');
  for (const w of ['sofa', 'afternoon', 'fireman']) {
    assert.ok(!src.includes(`'${w}'`), `the exam word '${w}' is hardcoded in the generator`);
  }
  // 'children' IS a deliberate literal -- RESERVED_ABSENT, not a generation target.
  assert.ok(src.includes('RESERVED_ABSENT'), 'children must be excluded by a named, commented constant');
});

test('the generator is resumable and retries', () => {
  const src = readFileSync(scriptPath, 'utf8');
  assert.ok(src.includes('existsSync'));
  assert.ok(src.includes('WORD_AUDIO_DRY_RUN'));
  assert.ok(src.includes('attempt'));
});

test('dry run reports the derived word count without a network call', () => {
  const result = spawnSync(process.execPath, [scriptPath], {
    env: { ...process.env, WORD_AUDIO_DRY_RUN: '1', OPENAI_API_KEY: '' },
  });
  assert.strictEqual(result.status, 0, `expected exit 0, got stderr: ${result.stderr}`);
  const out = result.stdout.toString();
  // 2264 -> 2266: F2-1 closed. `ellie` and `sparkle` -- her heroine's and pet's names --
  // come from profile.learner, so no band-derived top-up could ever reach them and she was
  // told "coming soon" on her own characters indefinitely. Adding them was measured safe
  // first: 18122 surface forms swept, 10 gains, 0 regressions, 0 key splits, and
  // migrateWordKeys leaves her keys and taps identical. `sparkling` still resolves to
  // itself, because resolveLemma tries an exact match before de-inflecting.
  assert.ok(out.includes('words: 2269'), `words line wrong: ${out}`);
  assert.ok(out.includes('extras: 12'), `extras line wrong: ${out}`);
  assert.ok(out.includes('examWords: 3'), `examWords line wrong: ${out}`);
  assert.ok(out.includes('clips: 2269'), `clips line wrong: ${out}`);
});

// Grade-6 exam words (public/exam-words.json), Oct 2025. "ice cream" is a phrase,
// not a lemma file -- it must contribute its tokens, not itself. "cookies" must
// NOT appear: resolveLemma already reaches it via "cookie" (see FC-6 above), so
// examWordsToGenerate() must leave it alone rather than giving it a splitting
// exact clip. "children" must ALSO never appear: it is the reserved
// known-absent-from-the-manifest fixture the quiz-item/item-batch/quiz-bank
// suites depend on (see RESERVED_ABSENT in the script).
test('examWordsToGenerate() is exactly the exam words with no existing clip, minus the reserved fixture', () => {
  assert.deepStrictEqual(examWordsToGenerate(), ['afternoon', 'fireman', 'sofa']);
  const examTokens = new Set(examWordsToGenerate());
  assert.ok(!examTokens.has('cookies'), 'cookies already resolves to "cookie" and must not get its own clip');
  assert.ok(!examTokens.has('children'), 'children is the reserved known-absent fixture and must never get a clip');
  assert.ok(!examTokens.has('ice cream'), '"ice cream" is a phrase, not a lemma -- it must split into tokens');
});

test('readExamWords() returns the raw exam phrase list, including "ice cream"', () => {
  const words = readExamWords();
  assert.ok(words.length > 40, `readExamWords() returned only ${words.length} -- this check inspected nothing`);
  assert.ok(words.includes('ice cream'));
  assert.ok(words.includes('cookies'));
});

// NEW in phase 2 -- THE HONESTY INVARIANT, and the whole point of the
// architecture change. The manifest is a statement about WHAT IS ON DISK. A
// manifest entry with no file is a dead speaker button in a child's story; a
// clip no manifest lists is merely invisible. Both directions are checked and
// the offenders are NAMED, because "the sets differ" is not a bug report.
//
// This calls the generator's OWN clipsOnDisk() rather than re-deriving the file
// list here: verifying code against a re-implementation of itself is how a
// wrong word-regex once put a wrong count in all three bands.
test('the manifest is exactly the set of clips on disk, both directions', () => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const disk = clipsOnDisk();
  assert.ok(manifest.length > 2000, `the manifest holds only ${manifest.length} entries -- this check inspected nothing`);
  assert.ok(disk.length > 2000, `only ${disk.length} clips on disk -- this check inspected nothing`);

  const ms = new Set(manifest);
  const ds = new Set(disk);
  const dead = manifest.filter((w) => !ds.has(w));
  const orphan = disk.filter((w) => !ms.has(w));

  assert.deepStrictEqual(dead, [], `manifest entries with NO CLIP (a dead play button): ${dead.slice(0, 20).join(', ')}`);
  assert.deepStrictEqual(orphan, [], `clips the manifest does not list: ${orphan.slice(0, 20).join(', ')}`);
  assert.deepStrictEqual(manifest, disk, 'the manifest must be clipsOnDisk() element for element, in order');
});

// NEW in phase 2 -- THE COVERAGE / DRIFT ALARM. This is the surviving property
// of the deleted "every allowed word has a clip" test: add a word to a band JSON
// or to data/story-words.json and this fails until the clip exists, instead of
// shipping a play button that silently does nothing.
test('every word we intend to generate has a clip on disk', () => {
  const intended = wordsToGenerate();
  const have = new Set(clipsOnDisk());
  assert.ok(intended.length > 2000, `wordsToGenerate() returned ${intended.length} -- this check inspected nothing`);
  const missing = intended.filter((w) => !have.has(w));
  assert.deepStrictEqual(missing, [], `words we intend to have but never generated: ${missing.slice(0, 20).join(', ')}`);
});

// NEW in phase 2 -- FC-6, THE SPLIT GUARD, and it is load-bearing.
//
// api/profile.js:6 imports the manifest DIRECTLY and hands it to migrateWordKeys
// (lib/profile.js:294), which rewrites the keys of her durable dictionary on
// EVERY profile POST. resolveLemma tries an EXACT match first, so putting an
// inflected surface form into the manifest stops it folding into its base form:
// "softly" would stop resolving to "soft", and her next tap would create a
// SECOND dictionary entry beside a word she has already collected.
//
// Ruling B2 (.oplan/word-polish/journal.md:41, owner-approved) is therefore:
// BASE LEMMAS ONLY in data/story-words.json. This is that ruling, executable.
test('FC-6: no story-word extra re-routes a word she may already hold', () => {
  const before = new Set(bandWords());
  const after = new Set(wordsToGenerate());
  const SUFFIXES = ['', 's', 'es', 'ed', 'ing', 'er', 'est', 'ly', 'ies'];

  let observed = 0;
  const splits = [];
  for (const base of before) {
    for (const suffix of SUFFIXES) {
      const form = base + suffix;
      observed++;
      const was = resolveLemma(form, before);
      const now = resolveLemma(form, after);
      if (was !== null && now !== null && was !== now) splits.push(`${form}: ${was} -> ${now}`);
    }
  }

  assert.ok(observed > 20000, `the split sweep observed only ${observed} surface forms -- it inspected nothing`);
  assert.deepStrictEqual(
    splits,
    [],
    `data/story-words.json holds an INFLECTED form. It will split words she already has: ${splits.slice(0, 10).join('; ')}`
  );

  for (const w of readStoryWords()) {
    assert.ok(!before.has(w), `data/story-words.json lists "${w}", which the bands already cover`);
  }
});

// ---------------------------------------------------------------------------
// STEP 2.2 -- the four mechanical checks design.md section 11 makes the ONLY
// gate on the audio batch, now that the owner has waived the listening gate.
// Every test below EXECUTES the shipped module; none is a source needle.
// ---------------------------------------------------------------------------

test('probeAac reads a real shipped clip correctly', () => {
  const p = probeAac(readFileSync(path.join(wordsDir, 'cat.aac')));
  assert.strictEqual(p.error, null, `cat.aac should decode cleanly, got: ${p.error}`);
  assert.strictEqual(p.sampleRate, 24000);
  assert.strictEqual(p.channels, 1);
  assert.strictEqual(p.frames, 33);
  assert.strictEqual(p.bytes, 12140);
  assert.ok(Math.abs(p.seconds - 1.408) < 0.001, `expected 1.408s, got ${p.seconds}`);
  assert.ok(p.voicedSeconds > 1.3 && p.voicedSeconds <= p.seconds, `voiced ${p.voicedSeconds}`);
});

// There is no ffprobe and no ffmpeg on this machine, so "must decode" is a frame
// walk. These are the four ways a TTS call actually goes wrong: nothing came
// back, an HTML error page came back, the transfer was cut, or the model spoke
// silence. A byte-size proxy sees only the first three.
test('probeAac names each way a clip can be broken', () => {
  const real = readFileSync(path.join(wordsDir, 'cat.aac'));

  const silentFrames = [];
  for (let i = 0; i < 40; i++) {
    const len = 11;
    const h = Buffer.alloc(len);
    h[0] = 0xff;
    h[1] = 0xf1;
    h[2] = (1 << 6) | (6 << 2) | 0;
    h[3] = (1 << 6) | ((len >> 11) & 0x03);
    h[4] = (len >> 3) & 0xff;
    h[5] = ((len & 0x07) << 5) | 0x1f;
    h[6] = 0xfc;
    silentFrames.push(h);
  }

  const inputs = [
    { name: 'empty', buf: Buffer.alloc(0) },
    { name: 'html', buf: Buffer.from('<html><title>502 Bad Gateway</title></html>', 'utf8') },
    { name: 'truncated', buf: real.subarray(0, real.length - 200) },
    { name: 'silent', buf: Buffer.concat(silentFrames) },
  ];

  let observed = 0;
  const seen = {};
  for (const input of inputs) {
    observed++;
    seen[input.name] = probeAac(input.buf);
  }
  assert.strictEqual(observed, 4, 'this test must drive exactly 4 inputs');

  assert.match(seen.empty.error, /no ADTS frames at all/, `empty: ${seen.empty.error}`);
  assert.match(seen.html.error, /lost ADTS sync at byte 0/, `html: ${seen.html.error}`);
  assert.match(seen.truncated.error, /TRUNCATED/, `truncated: ${seen.truncated.error}`);
  // the silent stream is the important one: it DECODES PERFECTLY and says nothing
  assert.strictEqual(seen.silent.error, null, 'the silent stream must decode -- that is the point');
  assert.strictEqual(seen.silent.voicedSeconds, 0, `silent voicedSeconds ${seen.silent.voicedSeconds}`);
  assert.ok(seen.silent.frames > 0, 'the silent stream must have real frames');
});

test('checkClip passes a real clip and fails a silent one', () => {
  const real = readFileSync(path.join(wordsDir, 'cat.aac'));
  const good = checkClip('cat', real);
  assert.deepStrictEqual(good.failures, [], `a shipped clip must pass: ${good.failures.join(' | ')}`);

  const silentFrames = [];
  for (let i = 0; i < 40; i++) {
    const len = 11;
    const h = Buffer.alloc(len);
    h[0] = 0xff;
    h[1] = 0xf1;
    h[2] = (1 << 6) | (6 << 2) | 0;
    h[3] = (1 << 6) | ((len >> 11) & 0x03);
    h[4] = (len >> 3) & 0xff;
    h[5] = ((len & 0x07) << 5) | 0x1f;
    h[6] = 0xfc;
    silentFrames.push(h);
  }
  const bad = checkClip('silent', Buffer.concat(silentFrames));
  assert.ok(bad.failures.length > 0, 'a silent clip must not pass');
  assert.ok(
    bad.failures.some((f) => f.includes('SILENT')),
    `the silent clip must be named SILENT, got: ${bad.failures.join(' | ')}`
  );
});

// THE CRY-WOLF CONTROL FOR THE WHOLE GATE. Step 2.6 acts on nothing but this
// script's EXIT CODE, so the exit code itself is proved here, in both
// directions, four steps before any money exists. The temp tree lives in
// os.tmpdir() and NEVER inside the repository (field guide 4).
test('check-word-audio.mjs exits 0 on the real tree and 1 on a broken one', () => {
  const checker = path.join(root, 'scripts', 'check-word-audio.mjs');

  const ok = spawnSync(process.execPath, [checker], { cwd: root });
  assert.strictEqual(ok.status, 0, `the real tree must pass: ${ok.stdout}${ok.stderr}`);
  assert.ok(ok.stdout.toString().includes('OBSERVED:'), 'the gate must print what it observed');

  const tmp = mkdtempSync(path.join(tmpdir(), 'word-audio-'));
  try {
    writeFileSync(path.join(tmp, 'healthy.aac'), readFileSync(path.join(wordsDir, 'cat.aac')));
    const manifest = path.join(tmp, 'index.json');
    writeFileSync(manifest, JSON.stringify(['healthy', 'nosuchword']) + '\n');

    const bad = spawnSync(process.execPath, [checker, '--dir', tmp, '--manifest', manifest], { cwd: root });
    assert.strictEqual(bad.status, 1, 'a manifest entry with no clip must exit 1');
    assert.ok(
      bad.stdout.toString().includes('nosuchword'),
      `the failing run must NAME the offender, got: ${bad.stdout}`
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
