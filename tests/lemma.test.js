import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveLemma } from '../public/lemma.js';
import { clipsOnDisk } from '../scripts/build-word-audio.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const wordsDir = path.join(root, 'public', 'audio', 'words');
const manifestPath = path.join(wordsDir, 'index.json');

const clipSet = new Set(
  readdirSync(wordsDir)
    .filter((f) => f.endsWith('.aac'))
    .map((f) => f.slice(0, -'.aac'.length))
);

// Phase 3 criterion 1. These are the forms the story actually prints -- the
// generator prompt says "inflected forms are allowed" -- and every one of them
// was silent before this phase.
test('inflected forms resolve to a lemma that has a clip', () => {
  const cases = {
    feels: 'feel',
    suddenly: 'sudden',
    walked: 'walk',
    running: 'run',
    stopped: 'stop',
    stories: 'story',
    boxes: 'box',
    making: 'make',
    bigger: 'big',
    cats: 'cat',
    happily: 'happy',
  };
  for (const [surface, want] of Object.entries(cases)) {
    const got = resolveLemma(surface, clipSet);
    assert.equal(got, want, `${surface} should resolve to ${want}, got ${got}`);
    assert.ok(clipSet.has(got), `${got} must have a clip`);
  }
});

// Phase 3 criterion 2, and the regression that matters most: a resolver that
// helps inflections but mangles ordinary words is a net loss. Exact-match-first
// is what protects these.
test('ordinary words that merely end in s/ly/er/ed resolve to themselves', () => {
  const words = [
    'bus', 'this', 'was', 'his', 'glass', 'dress', 'less', 'miss', 'class',
    'across', 'always', 'carpet', 'sunday', 'carrot', 'yes', 'its',
  ];
  for (const w of words) {
    if (!clipSet.has(w)) continue;
    assert.equal(resolveLemma(w, clipSet), w, `${w} must resolve to itself`);
  }
});

test('every word in the set resolves to itself', () => {
  const wrong = [...clipSet].filter((w) => resolveLemma(w, clipSet) !== w);
  assert.deepEqual(wrong.slice(0, 20), [], `${wrong.length} set words mis-resolved`);
});

test('a word we have nothing for resolves to null, not to a wrong clip', () => {
  for (const junk of ['zzzq', 'xylophonics', '', 'qqqqing', 'zzzzly']) {
    assert.equal(resolveLemma(junk, clipSet), null, `${junk} should be null`);
  }
  assert.equal(resolveLemma('feels', null), null, 'a missing set must not throw');
});

// WB-1: the manifest is what the browser resolves against, so it drifting from
// the clips on disk is the whole failure mode it exists to prevent.
test('the manifest matches the clips on disk and the derived word list', () => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.ok(Array.isArray(manifest));
  assert.deepEqual(manifest, [...manifest].sort(), 'manifest must be sorted');
  assert.deepEqual(new Set(manifest).size, manifest.length, 'no duplicates');

  // RE-EXPRESSED in phase 2 (field guide 22). This pin used to assert that the
  // manifest equalled the CURRICULUM-derived word list. Design section 3 A
  // deliberately overturned that: the manifest is now a statement about WHAT IS
  // ON DISK, so a manifest entry can never be a dead play button. The pin named
  // a real property -- the manifest agrees with the thing that produces it -- in
  // a spelling that named the wrong producer. The property survives; the
  // producer moved.
  const derived = clipsOnDisk();
  assert.deepEqual(manifest, derived, 'manifest must equal clipsOnDisk()');

  const missing = manifest.filter((w) => !clipSet.has(w));
  const extra = [...clipSet].filter((w) => !manifest.includes(w));
  assert.deepEqual(missing, [], 'manifest entries with no clip');
  assert.deepEqual(extra, [], 'clips missing from the manifest');
});
