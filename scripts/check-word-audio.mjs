// The four mechanical checks design.md section 11 (AMENDMENT #4) makes the ONLY
// gate on the audio batch, after the owner waived the listening gate.
//
// THERE IS NO ffprobe AND NO ffmpeg ON THE BUILD MACHINE. Duration is therefore
// COUNTED, not decoded: every clip is an ADTS-framed AAC stream, each frame
// header carries its own length, and every AAC frame is exactly 1024 samples, so
//     duration = frames * 1024 / sampleRate
// is exact. Walking the frame chain to the last byte is also the "must decode"
// check: a truncated file, an empty file, an HTML error body or a re-encode
// loses sync or leaves a tail, and this says at which byte.
//
// Every threshold below was derived from the 2254 clips already shipped, and the
// observed value is quoted beside it. A threshold with no measurement behind it
// is a guess, and a guess in a gate is worse than no gate.
//
// Usage:
//   node scripts/check-word-audio.mjs                    # the batch gate
//   node scripts/check-word-audio.mjs --dir <d> --manifest <f>   # any tree (used by the fail-first)
//   node scripts/check-word-audio.mjs --drift <lemma> <fresh.aac>
//   node scripts/check-word-audio.mjs --missing <profile.json>
//
// Exit 0 = every check passed. Exit 1 = at least one failed, and each failure is
// named with the word that caused it.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ---- thresholds, each with the value measured over the 2254 shipped clips ----
const SAMPLE_RATE = 24000;   // observed: 24000 on 2254/2254, no exceptions
const CHANNELS = 1;          // observed: 1 on 2254/2254
const MIN_BYTES = 4000;      // observed min 5238
const MIN_SECONDS = 0.60;    // observed min 0.683
const MAX_SECONDS = 3.60;    // observed max 3.243
const MIN_VOICED_SECONDS = 0.35; // observed min 0.555; 0 clips below 0.40
const VOICED_FRAME_BYTES = 100;  // a digitally silent AAC frame is ~11 bytes
const MIN_BPS = 3500;        // observed min 4451  (VBR: this is a sanity band, not an identity)
const MAX_BPS = 13000;       // observed max 10695
// drift tolerances. THESE ARE A JUDGEMENT, NOT A MEASUREMENT: the run-to-run
// variance of gpt-4o-mini-tts cannot be measured without spending money, so the
// band is set wide enough that only a GROSS change (a different voice, a
// different speaking rate, a different encoder) can trip it. See the plan, SK-F2-6.
const DRIFT_MIN = 0.5;
const DRIFT_MAX = 2.0;

const ADTS_RATES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350, 0, 0, 0];

export function probeAac(buf) {
  let off = 0, frames = 0, voiced = 0, sampleRate = 0, channels = 0, error = null;
  while (off + 7 <= buf.length) {
    if (buf[off] !== 0xff || (buf[off + 1] & 0xf0) !== 0xf0) { error = `lost ADTS sync at byte ${off}`; break; }
    const profile = (buf[off + 2] >> 6) & 0x03;             // 0 = AAC Main, 1 = AAC LC
    const srIdx = (buf[off + 2] >> 2) & 0x0f;
    const chCfg = ((buf[off + 2] & 0x01) << 2) | ((buf[off + 3] >> 6) & 0x03);
    const len = ((buf[off + 3] & 0x03) << 11) | (buf[off + 4] << 3) | ((buf[off + 5] >> 5) & 0x07);
    if (len < 7) { error = `impossible frame length ${len} at byte ${off}`; break; }
    if (off + len > buf.length) {
      error = `TRUNCATED -- the frame at byte ${off} declares ${len} bytes but only ${buf.length - off} remain`;
      break;
    }
    if (frames === 0) {
      sampleRate = ADTS_RATES[srIdx];
      channels = chCfg;
      if (profile !== 1) { error = `not AAC-LC (ADTS profile bits ${profile})`; break; }
    } else if (ADTS_RATES[srIdx] !== sampleRate || chCfg !== channels) {
      error = `format changes mid-file at byte ${off}`; break;
    }
    if (len > VOICED_FRAME_BYTES) voiced++;
    frames++;
    off += len;
  }
  if (error === null && frames === 0) error = 'no ADTS frames at all';
  if (error === null && off !== buf.length) error = `${buf.length - off} trailing bytes after the last frame`;
  const seconds = sampleRate ? (frames * 1024) / sampleRate : 0;
  const voicedSeconds = sampleRate ? (voiced * 1024) / sampleRate : 0;
  return { bytes: buf.length, frames, voiced, sampleRate, channels, seconds, voicedSeconds, error };
}

function fail(list, word, message) { list.push(`${word}: ${message}`); }

export function checkClip(word, buf) {
  const out = [];
  const p = probeAac(buf);
  if (p.error) { fail(out, word, `DOES NOT DECODE -- ${p.error}`); return { p, failures: out }; }
  if (p.sampleRate !== SAMPLE_RATE) fail(out, word, `sample rate ${p.sampleRate}, every shipped clip is ${SAMPLE_RATE}`);
  if (p.channels !== CHANNELS) fail(out, word, `${p.channels} channels, every shipped clip is ${CHANNELS}`);
  if (p.bytes < MIN_BYTES) fail(out, word, `${p.bytes} bytes, below the ${MIN_BYTES} floor (smallest shipped clip 5238)`);
  if (p.voicedSeconds < MIN_VOICED_SECONDS) fail(out, word, `SILENT -- only ${p.voicedSeconds.toFixed(3)}s of voiced audio, floor ${MIN_VOICED_SECONDS} (smallest shipped 0.555)`);
  if (p.seconds < MIN_SECONDS || p.seconds > MAX_SECONDS) fail(out, word, `implausible duration ${p.seconds.toFixed(3)}s, envelope ${MIN_SECONDS}..${MAX_SECONDS} (shipped 0.683..3.243)`);
  const bps = p.seconds ? p.bytes / p.seconds : 0;
  if (bps < MIN_BPS || bps > MAX_BPS) fail(out, word, `implausible bitrate ${bps.toFixed(0)} B/s, band ${MIN_BPS}..${MAX_BPS} (shipped 4451..10695)`);
  return { p, failures: out };
}

function loadWordList(file) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(raw)) throw new Error(`${file} is not a JSON array`);
  return raw;
}

function batch(dir, manifestPath, generationPath) {
  const failures = [];
  let observedClips = 0;

  const manifest = loadWordList(manifestPath);
  const files = readdirSync(dir).filter((f) => f.endsWith('.aac'));
  const clips = new Set(files.map((f) => f.slice(0, -4)));

  // CHECK 4 -- manifest/file correspondence, BOTH directions, offenders named.
  const dead = manifest.filter((w) => !clips.has(w));
  const orphan = [...clips].filter((w) => !manifest.includes(w));
  for (const w of dead) fail(failures, w, 'IN THE MANIFEST WITH NO CLIP -- this is a dead speaker button');
  for (const w of orphan) fail(failures, w, 'a clip on disk that the manifest does not list');

  // CHECKS 2 and 3 -- every clip decodes, is not silent, and is plausible.
  for (const f of files.sort()) {
    observedClips++;
    const word = f.slice(0, -4);
    const r = checkClip(word, readFileSync(path.join(dir, f)));
    for (const m of r.failures) failures.push(m);
  }

  // COVERAGE -- everything we said we would generate exists. This is the drift
  // alarm the old deriveWordList() test carried: add a word to a band or to
  // data/story-words.json and this fails until the clip exists.
  let observedTargets = 0;
  if (generationPath) {
    const targets = generationPath;
    observedTargets = targets.length;
    for (const w of targets) if (!clips.has(w)) fail(failures, w, 'a generation target with no clip on disk');
  }

  console.log(`OBSERVED: ${observedClips} clips, ${manifest.length} manifest entries, ${observedTargets} generation targets`);
  if (observedClips === 0) { console.log('FAIL: observed 0 clips -- this check inspected nothing'); return 1; }
  if (failures.length === 0) { console.log(`WORD AUDIO OK: ${observedClips} clips, ${manifest.length} manifest entries`); return 0; }
  for (const m of failures.slice(0, 40)) console.log('FAIL: ' + m);
  if (failures.length > 40) console.log(`FAIL: ... and ${failures.length - 40} more`);
  console.log(`${failures.length} FAILURES`);
  return 1;
}

function drift(lemma, freshPath, dir) {
  const shippedPath = path.join(dir, `${lemma}.aac`);
  if (!existsSync(shippedPath)) { console.log(`FAIL: there is no shipped clip for "${lemma}" to control against`); return 1; }
  if (!existsSync(freshPath)) { console.log(`FAIL: the control clip ${freshPath} was not written`); return 1; }
  const resolvedFresh = path.resolve(freshPath);
  const publicDir = path.join(ROOT, 'public');
  if (resolvedFresh.startsWith(publicDir)) {
    console.log(`FAIL: the control clip must be written OUTSIDE public/, got ${resolvedFresh}`);
    return 1;
  }
  const shipped = probeAac(readFileSync(shippedPath));
  const fresh = checkClip(`${lemma} (control)`, readFileSync(freshPath));
  const out = [];
  for (const m of fresh.failures) out.push(m);
  const f = fresh.p;
  if (!f.error) {
    if (f.sampleRate !== shipped.sampleRate) out.push(`sample rate moved ${shipped.sampleRate} -> ${f.sampleRate}`);
    if (f.channels !== shipped.channels) out.push(`channel count moved ${shipped.channels} -> ${f.channels}`);
    const dur = f.seconds / shipped.seconds;
    const byt = f.bytes / shipped.bytes;
    const voi = shipped.voicedSeconds ? f.voicedSeconds / shipped.voicedSeconds : 0;
    console.log(`DRIFT CONTROL "${lemma}":`);
    console.log(`  shipped  ${shipped.bytes} B  ${shipped.seconds.toFixed(3)}s  voiced ${shipped.voicedSeconds.toFixed(3)}s  ${shipped.sampleRate}Hz x${shipped.channels}`);
    console.log(`  fresh    ${f.bytes} B  ${f.seconds.toFixed(3)}s  voiced ${f.voicedSeconds.toFixed(3)}s  ${f.sampleRate}Hz x${f.channels}`);
    console.log(`  ratios   duration ${dur.toFixed(3)}  bytes ${byt.toFixed(3)}  voiced ${voi.toFixed(3)}   (band ${DRIFT_MIN}..${DRIFT_MAX})`);
    if (dur < DRIFT_MIN || dur > DRIFT_MAX) out.push(`duration ratio ${dur.toFixed(3)} is outside ${DRIFT_MIN}..${DRIFT_MAX}`);
    if (byt < DRIFT_MIN || byt > DRIFT_MAX) out.push(`byte ratio ${byt.toFixed(3)} is outside ${DRIFT_MIN}..${DRIFT_MAX}`);
    if (voi < DRIFT_MIN || voi > DRIFT_MAX) out.push(`voiced ratio ${voi.toFixed(3)} is outside ${DRIFT_MIN}..${DRIFT_MAX}`);
  }
  if (out.length === 0) { console.log('DRIFT CONTROL OK -- the model behind the fixed name has not moved detectably'); return 0; }
  for (const m of out) console.log('FAIL: ' + m);
  console.log('STOP: the voice-drift control failed. Do NOT run the batch. Report and escalate.');
  return 1;
}

function missing(profilePath, dir) {
  // The routine top-up lister. Reads a SAVED capture, never the live service
  // (field guide 3: GET /api/profile CREATES one). Writes nothing.
  const clips = new Set(readdirSync(dir).filter((f) => f.endsWith('.aac')).map((f) => f.slice(0, -4)));
  const p = JSON.parse(readFileSync(profilePath, 'utf8'));
  const profile = p && p.data ? p.data : p;
  const want = new Set();
  for (const k of Object.keys(profile.words || {})) want.add(String(k).toLowerCase());
  for (const ch of (profile.story && profile.story.chapters) || []) {
    for (const g of ch.glossary || []) if (g && typeof g.word === 'string') want.add(g.word.toLowerCase());
  }
  const WORD_RE = /^[a-z]+(?:'[a-z]+)?$/;
  const gaps = [...want].filter((w) => !clips.has(w)).sort();
  const usable = gaps.filter((w) => WORD_RE.test(w));
  const unusable = gaps.filter((w) => !WORD_RE.test(w));
  console.log(`OBSERVED: ${want.size} distinct words (dictionary keys + chapter glossaries), ${clips.size} clips on disk`);
  console.log(`WITHOUT A CLIP: ${gaps.length}`);
  console.log(`  add to data/story-words.json (${usable.length}): ${usable.join(' ') || '(none)'}`);
  console.log(`  cannot ever be a lemma file (${unusable.length}): ${unusable.join(' | ') || '(none)'}`);
  console.log('This script wrote nothing.');
  return 0;
}

async function main(argv) {
  const REAL_DIR = path.join(ROOT, 'public', 'audio', 'words');
  let dir = REAL_DIR;
  let manifestPath = null;
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dir') dir = argv[++i];
    else if (argv[i] === '--manifest') manifestPath = argv[++i];
    else rest.push(argv[i]);
  }
  if (manifestPath === null) manifestPath = path.join(dir, 'index.json');

  if (rest[0] === '--drift') return drift(rest[1], rest[2], dir);
  if (rest[0] === '--missing') return missing(rest[1], dir);

  // COVERAGE is asserted only against the real tree, and it calls the generator's
  // OWN wordsToGenerate() rather than re-deriving the list here. Verifying code
  // against a re-implementation of itself is field-guide lesson 2's cardinal sin.
  // Importing build-word-audio.js spends NOTHING: its isDirectRun guard means
  // main() only runs when it is the process entry point.
  let targets = null;
  if (path.resolve(dir) === path.resolve(REAL_DIR)) {
    const gen = await import(pathToFileURL(path.join(ROOT, 'scripts', 'build-word-audio.js')).href);
    targets = gen.wordsToGenerate();
  }
  return batch(dir, manifestPath, targets);
}

const isDirectRun = process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) process.exit(await main(process.argv.slice(2)));
