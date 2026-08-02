import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { wordsToGenerate, bandWords, clipsOnDisk, readStoryWords } from '../scripts/build-word-audio.js';
import { resolveLemma } from '../public/lemma.js';

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
  assert.ok(out.includes('words: 2254'), `words line wrong: ${out}`);
  assert.ok(out.includes('extras: 0'), `extras line wrong: ${out}`);
  assert.ok(out.includes('clips: 2254'), `clips line wrong: ${out}`);
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
