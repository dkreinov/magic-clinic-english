#!/usr/bin/env node
// Contract QZ-3b: the correctness-pass harness.
//
//   node scripts/check-item-batch.mjs --stage <dir>
//   node scripts/check-item-batch.mjs --stage <dir> --verdicts
//
// ESM, zero npm dependencies. Sibling of scripts/check-quiz-bank.mjs, and it
// re-implements NOTHING from it: every QZ-1 rule is applied through the one
// imported validateItemFile, for that file's own stated reason -- "a gate that
// re-derives a rule is a second, drifting copy of the contract". The only thing
// this file adds is COUNTING, and the counts are the point.
//
// It exists because the shape gate is structurally blind to one defect class:
// a distractor that is ALSO a correct answer. `shine` offered as a wrong option
// for `glow` is shape-legal in every respect -- 8 distinct manifest words, a
// clean sentence, an intersecting part of speech -- and the child is marked
// wrong for a right answer. Nothing mechanical here can see that. Two blind
// adversarial recognition passes are what see it, and this harness's job is to
// make their result a MEASUREMENT rather than a paragraph of prose.
//
// ---------------------------------------------------------------------------
// MODE 1  --stage <dir>
// ---------------------------------------------------------------------------
// Walks <dir>/batch-*/ and applies the full QZ-1 contract to every staged
// *.json file, at full severity, before anything is promoted into public/quiz/.
// Prints:
//
//   BATCH files=<F> items=<I> multiSense=<M>
//   RULE8EXEMPT answers=<E> of <F>
//
// Exit 1 if any staged file fails the contract, 0 otherwise.
//
// RULE8EXEMPT is a WARNING and never an error. E counts the answers with NO
// band entry, which is 73 of the 2264 manifest words. For those, rule 8's
// pos-set intersection has an empty set on the answer side and does not fire at
// all -- the distractor class is UNENFORCED and must be curated by hand. That
// is not a defect to be fixed here; it is a fact about the source bands that
// the reviewer downstream has to be told, because the harness would otherwise
// print a clean report over items nothing checked. The three poison words are
// all exempt, which is not a coincidence.
//
// A stage directory that is missing or holds no batch-*/ is reported as
// files=0 and exits 0, exactly as check-quiz-bank.mjs treats a missing --dir:
// the harness has to be runnable before the batch exists. "files > 0" is
// deliberately NOT the gate here, because the caller has a strictly stronger
// one -- it compares files against its own WORDS.txt, which catches a batch
// that produced SOME files but silently dropped a word. A bare "> 0" passes
// that case.
//
// ---------------------------------------------------------------------------
// MODE 2  --stage <dir> --verdicts
// ---------------------------------------------------------------------------
// Reads the two blind reviewers verdict files and prints:
//
//   PASS A reviewed=<n> verdicts=<m> flags=<f> poisonRecall=<k>/3
//   PASS B reviewed=<n> verdicts=<m> flags=<f> poisonRecall=<k>/3
//   UNION items=<u> agreement=<a>%
//
// Exit 1 if reviewed is 0, if verdicts != reviewed, or if either poisonRecall
// is below 3/3. Those three clauses, and why each one is here:
//
//   reviewed == 0        a sweep that observed nothing is decoration. In a
//                        report it is indistinguishable from a sweep that
//                        observed everything and found nothing.
//   verdicts != reviewed a pass that silently skipped items once printed
//                        "40 of 50" and nobody noticed. This is that failure in
//                        a new costume, and this is the clause that names it.
//   poisonRecall < 3/3   a reviewer that cannot find PLANTED poison cannot be
//                        trusted on real items. Its verdicts are discarded and
//                        the pass is re-run with a fresh agent. This is the
//                        control: an assertion with nothing proving it can fire
//                        is not evidence.
//
// ---------------------------------------------------------------------------
// FILE FORMATS (this section is the schema; there is no other definition)
// ---------------------------------------------------------------------------
// An ITEM ID is "<batch-dir>/<file>#<index>", forward slashes always, e.g.
// "batch-1/glow.json#0". The index is the item's position in its file.
//
// <dir>/verdicts-A.json, <dir>/verdicts-B.json -- one per blind pass:
//
//   {
//     "pass": "A",
//     "reviewed": ["batch-1/glow.json#0", "batch-1/harm.json#0"],
//     "verdicts": [
//       { "item": "batch-1/glow.json#0", "fits": ["shine", "burn"],
//         "note": "both light up in a dark room" },
//       { "item": "batch-1/harm.json#0", "fits": [] }
//     ]
//   }
//
//   pass      "A" or "B". Informational; the FILENAME decides which pass it is.
//   reviewed  every item id the pass was handed AND looked at. Not the ids it
//             chose to comment on -- this is the denominator, and it is the
//             pass's own claim about its own coverage.
//   verdicts  one entry per reviewed item, INCLUDING the clean ones. `fits` is
//             the distractors the reviewer judges also correctly fill the
//             blank; empty means clean. `note` is optional and unread.
//
// Ids are DEDUPLICATED before counting, in both lists. That is deliberate: a
// pass that returns the same item twice to reach the right total is exactly the
// "silently skipped an item" defect, and deduplication is what makes clause 2
// catch it instead of being fooled by it. `fits` entries are compared trimmed
// and lowercased, because the verdict file is prose-adjacent and the substance
// is which WORD was named, not how it was capitalised.
//
// <dir>/POISON.json -- the control, written by whoever shuffled the poison into
// the batch:
//
//   [ { "item": "batch-1/glow.json#0", "leaks": ["shine", "burn"] }, ... ]
//
//   Exactly 3 entries, each naming a staged item and the wrong-answer traps
//   planted in it. A poison item counts as RECALLED only if the pass named at
//   least one of that item's own planted leaks. Flagging the item on some other
//   grounds does not count, and that is the whole difference between a control
//   and a formality: a reviewer that flagged everything indiscriminately would
//   otherwise score a perfect 3/3 while being useless. A missing or malformed
//   POISON.json is a hard failure -- with no control, poisonRecall is not a
//   measurement and the two passes are back to being unverified prose.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildPosIndex, validateItemFile } from '../lib/quiz-item.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const BATCH_PREFIX = 'batch-';
const POISON_COUNT = 3;

function usage(message) {
  console.error(`error: ${message}`);
  console.error('usage: node scripts/check-item-batch.mjs --stage <dir> [--verdicts]');
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { stage: null, verdicts: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--stage') {
      const value = argv[++i];
      if (value === undefined) usage('--stage needs a path');
      opts.stage = path.resolve(value);
    } else if (arg === '--verdicts') {
      opts.verdicts = true;
    } else {
      usage(`unknown argument "${arg}"`);
    }
  }
  if (opts.stage === null) usage('--stage is required');
  return opts;
}

function loadContext() {
  const read = (...p) => JSON.parse(readFileSync(path.join(root, ...p), 'utf8'));
  const allowed = new Set(read('public', 'audio', 'words', 'index.json'));
  const posIndex = buildPosIndex(read('data', 'band1.json'), read('data', 'band2.json'), allowed);
  return { allowed, posIndex };
}

function readdirOrEmpty(dir) {
  try {
    return readdirSync(dir);
  } catch (err) {
    if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) return [];
    throw err;
  }
}

// batch-10 sorts BEFORE batch-2 lexicographically, which would shuffle the
// report the moment a phase reaches ten batches. Numeric where it can be,
// lexicographic where it cannot, deterministic either way -- no locale is
// consulted, so two machines produce byte-identical output.
function compareBatchNames(a, b) {
  const na = Number(a.slice(BATCH_PREFIX.length));
  const nb = Number(b.slice(BATCH_PREFIX.length));
  if (Number.isInteger(na) && Number.isInteger(nb) && na !== nb) return na - nb;
  return a < b ? -1 : a > b ? 1 : 0;
}

function listBatchDirs(stageDir) {
  return readdirOrEmpty(stageDir)
    .filter((name) => name.startsWith(BATCH_PREFIX))
    .filter((name) => {
      try {
        return statSync(path.join(stageDir, name)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort(compareBatchNames);
}

function listJson(dir) {
  return readdirOrEmpty(dir)
    .filter((name) => name.endsWith('.json'))
    .filter((name) => {
      try {
        return statSync(path.join(dir, name)).isFile();
      } catch {
        return false;
      }
    })
    .sort();
}

function readJson(file) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (err) {
    return { error: err.code === 'ENOENT' ? 'missing' : `cannot be read: ${err.message}` };
  }
  try {
    return { value: JSON.parse(text) };
  } catch (err) {
    return { error: `invalid JSON: ${err.message}` };
  }
}

// Walks the staged batches ONCE and returns everything both modes need: the
// counts, the problems, and the ordered item-id list the verdict files are
// checked against. One walk, and exactly one definition of what an item id is.
function collectBatch(stageDir, ctx) {
  const problems = [];
  const ids = [];
  let files = 0;
  let items = 0;
  let multiSense = 0;
  let exempt = 0;

  for (const batch of listBatchDirs(stageDir)) {
    const dir = path.join(stageDir, batch);
    for (const name of listJson(dir)) {
      files++;
      const where = `${batch}/${name}`;
      const loaded = readJson(path.join(dir, name));
      if (loaded.error) {
        problems.push(`${where} ${loaded.error === 'missing' ? 'cannot be read' : loaded.error}`);
        continue;
      }
      const parsed = loaded.value;
      if (Array.isArray(parsed)) {
        items += parsed.length;
        if (parsed.length >= 2) multiSense++;
        parsed.forEach((_item, i) => ids.push(`${where}#${i}`));
      }

      const lemma = name.slice(0, -'.json'.length);
      // Rule 1 pins answer === lemma === filename, so the filename lemma IS the
      // answer, and asking the pos index about it is asking whether rule 8 has
      // anything at all to say about this file.
      const answerPos = ctx.posIndex.get(lemma);
      if (!answerPos || answerPos.size === 0) exempt++;

      for (const err of validateItemFile(lemma, parsed, ctx).errors) {
        // Item-level errors already carry their "[i] " index, so they are
        // concatenated to give batch-1/glow.json[0]; file-level ones get a space.
        problems.push(err.startsWith('[') ? `${where}${err}` : `${where} ${err}`);
      }
    }
  }

  return { problems, ids, files, items, multiSense, exempt };
}

function runStage(stageDir, ctx) {
  const batch = collectBatch(stageDir, ctx);

  console.log(`BATCH files=${batch.files} items=${batch.items} multiSense=${batch.multiSense}`);
  console.log(`RULE8EXEMPT answers=${batch.exempt} of ${batch.files}`);

  if (batch.problems.length) {
    for (const line of batch.problems) console.log(line);
    console.log(`BATCH FAILED: ${batch.problems.length} problems`);
    process.exit(1);
  }
  process.exit(0);
}

const norm = (s) => String(s).trim().toLowerCase();

function loadPoison(stageDir, idSet) {
  const file = path.join(stageDir, 'POISON.json');
  const loaded = readJson(file);
  if (loaded.error === 'missing') {
    return { errors: [`FAIL: POISON.json is missing from ${stageDir} -- the control cannot be measured`] };
  }
  if (loaded.error) return { errors: [`FAIL: POISON.json ${loaded.error}`] };

  const entries = loaded.value;
  if (!Array.isArray(entries)) return { errors: ['FAIL: POISON.json must be a JSON array'] };
  if (entries.length !== POISON_COUNT) {
    return {
      errors: [`FAIL: POISON.json must name exactly ${POISON_COUNT} poison items, got ${entries.length}`],
    };
  }

  const errors = [];
  const list = [];
  entries.forEach((entry, i) => {
    const at = `POISON.json[${i}]`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`FAIL: ${at} must be an object`);
      return;
    }
    if (typeof entry.item !== 'string' || entry.item.length === 0) {
      errors.push(`FAIL: ${at} needs a non-empty "item" id`);
      return;
    }
    if (!idSet.has(entry.item)) {
      errors.push(`FAIL: ${at} names "${entry.item}", which is not in the staged batch`);
      return;
    }
    const leaks = entry.leaks;
    if (!Array.isArray(leaks) || leaks.length === 0 || leaks.some((d) => typeof d !== 'string')) {
      // A poison entry with no planted leaks is unrecallable by construction,
      // so every pass would score 0/3 forever and nobody would learn why.
      errors.push(`FAIL: ${at} needs a non-empty "leaks" array of distractor strings`);
      return;
    }
    list.push({ item: entry.item, leaks: new Set(leaks.map(norm)) });
  });

  return errors.length ? { errors } : { list };
}

// Returns the counted shape of one pass, plus any structural complaint about
// its file. A MISSING verdict file is not a special case: it is a pass that
// reviewed nothing, and the reviewed==0 clause is exactly the right thing to
// say about it.
function loadPass(stageDir, letter, idSet, poison) {
  const errors = [];
  const label = `pass ${letter}`;
  const file = path.join(stageDir, `verdicts-${letter}.json`);
  const empty = { letter, reviewed: 0, verdicts: 0, flags: 0, recall: 0, flagged: new Set(), errors };

  const loaded = readJson(file);
  if (loaded.error === 'missing') {
    console.error(`warning: ${file} does not exist`);
    return empty;
  }
  if (loaded.error) {
    errors.push(`FAIL: ${label}: verdicts-${letter}.json ${loaded.error}`);
    return empty;
  }

  const data = loaded.value;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push(`FAIL: ${label}: verdicts-${letter}.json must be a JSON object`);
    return empty;
  }
  if (!Array.isArray(data.reviewed) || !Array.isArray(data.verdicts)) {
    errors.push(`FAIL: ${label}: verdicts-${letter}.json needs "reviewed" and "verdicts" arrays`);
    return empty;
  }

  const reviewed = new Set();
  for (const id of data.reviewed) {
    if (typeof id !== 'string') {
      errors.push(`FAIL: ${label}: reviewed holds a non-string id`);
      continue;
    }
    if (!idSet.has(id)) {
      // Otherwise a pass could inflate its own denominator with ids that do not
      // exist, and "reviewed=15" would stop meaning "looked at 15 real items".
      errors.push(`FAIL: ${label}: reviewed names "${id}", which is not in the staged batch`);
      continue;
    }
    reviewed.add(id);
  }

  const fitsById = new Map();
  data.verdicts.forEach((verdict, i) => {
    const at = `${label}: verdicts[${i}]`;
    if (!verdict || typeof verdict !== 'object' || Array.isArray(verdict)) {
      errors.push(`FAIL: ${at} must be an object`);
      return;
    }
    if (typeof verdict.item !== 'string' || verdict.item.length === 0) {
      errors.push(`FAIL: ${at} needs a non-empty "item" id`);
      return;
    }
    if (!Array.isArray(verdict.fits) || verdict.fits.some((d) => typeof d !== 'string')) {
      errors.push(`FAIL: ${at} needs a "fits" array of distractor strings (empty means clean)`);
      return;
    }
    if (!reviewed.has(verdict.item)) {
      errors.push(`FAIL: ${label}: returned a verdict for "${verdict.item}", which it never reviewed`);
      return;
    }
    // Deduplicated by id, and a repeat MERGES rather than counting twice.
    const set = fitsById.get(verdict.item) || new Set();
    for (const d of verdict.fits) set.add(norm(d));
    fitsById.set(verdict.item, set);
  });

  const flagged = new Set();
  for (const [id, fits] of fitsById) if (fits.size > 0) flagged.add(id);

  let recall = 0;
  for (const { item, leaks } of poison) {
    const fits = fitsById.get(item);
    if (fits && [...fits].some((d) => leaks.has(d))) recall++;
  }

  return {
    letter,
    reviewed: reviewed.size,
    verdicts: fitsById.size,
    flags: flagged.size,
    recall,
    flagged,
    errors,
  };
}

function gatePass(pass, poisonTotal) {
  const errors = [...pass.errors];
  const label = `pass ${pass.letter}`;
  if (pass.reviewed === 0) {
    errors.push(`FAIL: ${label}: reviewed=0 -- the pass observed nothing`);
  } else if (pass.verdicts !== pass.reviewed) {
    // `else if` on purpose: with reviewed=0 the count mismatch is a restatement
    // of the same fact, and two lines for one defect is how a report starts
    // reading as though it found more than it did.
    errors.push(`FAIL: ${label}: verdicts ${pass.verdicts} != reviewed ${pass.reviewed}`);
  }
  if (pass.recall < poisonTotal) {
    errors.push(`FAIL: ${label}: poisonRecall ${pass.recall}/${poisonTotal} -- pass NOT TRUSTED`);
  }
  return errors;
}

function runVerdicts(stageDir, ctx) {
  const batch = collectBatch(stageDir, ctx);
  const idSet = new Set(batch.ids);

  const poison = loadPoison(stageDir, idSet);
  if (poison.errors) {
    for (const line of poison.errors) console.log(line);
    process.exit(1);
  }

  const a = loadPass(stageDir, 'A', idSet, poison.list);
  const b = loadPass(stageDir, 'B', idSet, poison.list);

  // The counts print BEFORE any verdict on them, always, including on the way
  // to exit 1. A gate that fails silently teaches the next reader nothing about
  // WHY, and the numbers are the whole reason this harness exists.
  for (const pass of [a, b]) {
    console.log(
      `PASS ${pass.letter} reviewed=${pass.reviewed} verdicts=${pass.verdicts} ` +
        `flags=${pass.flags} poisonRecall=${pass.recall}/${POISON_COUNT}`
    );
  }

  // Agreement is JACCARD over the FLAGGED sets, not per-item agree/disagree.
  // The measured base rate is roughly one flagged item in five, so a plain
  // per-item rate is dominated by the ~80% both passes call clean: it would
  // read in the high eighties however violently they disagreed about the items
  // that actually matter. The recorded figure this is comparable to -- "two
  // passes agreed 53%" -- is the Jaccard one. Two passes that both flag nothing
  // are in perfect agreement, hence 100 on an empty union.
  const union = new Set([...a.flagged, ...b.flagged]);
  const both = [...a.flagged].filter((id) => b.flagged.has(id)).length;
  const agreement = union.size === 0 ? 100 : Math.round((both * 100) / union.size);
  console.log(`UNION items=${union.size} agreement=${agreement}%`);

  const errors = [...gatePass(a, POISON_COUNT), ...gatePass(b, POISON_COUNT)];
  if (errors.length) {
    for (const line of errors) console.log(line);
    process.exit(1);
  }
  process.exit(0);
}

const opts = parseArgs(process.argv.slice(2));
const ctx = loadContext();
if (opts.verdicts) {
  runVerdicts(opts.stage, ctx);
} else {
  runStage(opts.stage, ctx);
}
