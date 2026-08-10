#!/usr/bin/env node
// Does the RECORD leak the learner's vocabulary?  A PRE-PUSH TRIPWIRE.
//
// WHY. `.oplan/` is pushed to a PUBLIC GitHub repo. D27 covered profile FILES and
// never the WRITTEN RECORD, and that gap produced two incidents in two days: her
// words sat in design.md from 1-2 August 2026, and on 3 August a push was one
// command from publishing her 12-word list AND her per-word quiz scores. Ruling
// R-F3-5 had already NAMED the leak file by path, and nothing enforced it. A
// convention that is never executed is not a control.
//
// IT SCANS HISTORY, NOT THE WORKING TREE. The 3 August leak lived entirely in
// COMMITTED BLOBS; the working tree was already clean because the words had been
// "redacted" in a LATER commit while every earlier one kept them. A checker reading
// files on disk would have waved that push through.
//
// *** WHAT THIS CANNOT DO, STATED SO NOBODY TRUSTS IT TOO FAR. ***
// It does NOT know her words. It cannot: D27 requires her captured profile to be
// DELETED, so no exact list is on disk, and the only local profile is a SYNTHETIC
// 6-word fixture (md5 91eff5da...). Matching against that fixture was tried and
// produced pure false positives -- ordinary story text like "the grass was cold"
// -- because her real words are common English that ALSO ship as audio clips and
// quiz items. A hook that cries wolf gets switched off, so this matches the SHAPE
// OF A DISCLOSURE instead: a sentence claiming words belong to her, a bare list
// added to the record, a per-word score table. It is a tripwire, not a proof.
// Run with LEARNER_PROFILE=<path to a REAL capture> to add an exact-word pass.
//
//   usage:  node scripts/check-record-privacy.mjs [<git-range>]
//   exit 0 = nothing tripped · 1 = a disclosure shape · 2 = could not check

import { spawn, execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const W = "[a-z][a-z-]{1,14}";

// A RUN OF WORDS -- the part that makes a claim a DISCLOSURE. Without this the
// pattern fires on things that carry no vocabulary at all, and the real record is
// full of them: a COUNT ("only 1 of her ~40 words has a quiz item"), a quote of
// something SHE SAID ("HER WORDS: the trophies are all coloured now..."), and a
// PROCEDURE ("read her profile; take the words with status known"). All three were
// flagged by the looser version. A leak needs actual words listed out.
const RUN = [
  `(?:\`${W}\`[\\s,·]*){3,}`,               // `plinth` `garble` `wisp`
  `(?:${W}\\s*[,·]\\s*){2,}${W}`,           // plinth, garble, wisp
  `\\((?:${W}[\\s,·]+){2,}${W}\\)`,         // (plinth garble wisp korrel)
].join("|");

// SHAPE 1 -- a sentence that CLAIMS words are hers AND then lists them. The record
// may discuss the word bank freely; "her known words are X, Y, Z" is a disclosure
// whoever wrote it. Drawn from the real 2026-08-03 leaks.
const CLAIMS = [
  new RegExp(`\\bher\\b[^.\\n]{0,40}\\bwords?\\b[^\\n]{0,25}(?:are|were|:)\\s*(?:${RUN})`, "i"),
  new RegExp(`\\btop-?up list\\b[^\\n]{0,30}[:(]\\s*[^\\n]{0,20}(?:${RUN})`, "i"),
  new RegExp(`\\b(?:known|candidate) words\\b[^\\n]{0,25}(?:are|:)\\s*(?:${RUN})`, "i"),
  new RegExp(`\\bshe (?:knows|has|collected)\\b[^\\n]{0,20}:\\s*(?:${RUN})`, "i"),
];

// Long-standing lists in the record that are NOT hers, acknowledged once so the
// hook stays quiet enough to remain switched on. qz8-exclusions.txt is a band-word
// EXCLUSIONS list authored for the quiz builder.
const ALLOW = new Set([".oplan/word-quiz/qz8-exclusions.txt"]);

// SHAPE 2 -- a per-word SCORE table. Worse than the words alone: it is her
// performance. The real one read `<word> 0/3 · <word> 2/2`.
const SCORES = new RegExp(`${W}\\s+\\d/\\d\\s*[·|,]\\s*${W}\\s+\\d/\\d`, "i");

// SHAPE 3 -- a bare word LIST newly added to the record. Checked separately because
// a one-word-per-line file NEVER trips a cluster test: on 3 August that blind spot
// reported topup-1-words.txt, the most direct leak in the repo, as CLEAN.
function bareList(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 6) return null;
  const solo = lines.filter((l) => new RegExp(`^${W}$`).test(l)).length;
  if (solo >= 6 && solo / lines.length >= 0.8) {
    return `${solo} of ${lines.length} lines are a single bare word -- this file IS a word list`;
  }
  return null;
}

export function scanText(path, text, exactWords) {
  const found = [];
  const norm = String(path).replace(/\\/g, "/");
  const l = ALLOW.has(norm) ? null : bareList(text);
  if (l) found.push({ path, shape: "LIST", detail: l });

  const lines = text.split(/\r?\n/);
  for (const [i, line] of lines.entries()) {
    if (line.length > 4000 || /\[REDACTED/i.test(line)) continue;
    if (CLAIMS.some((r) => r.test(line))) {
      found.push({ path, shape: "CLAIM", detail: `line ${i + 1} states words are hers` });
    } else if (SCORES.test(line)) {
      found.push({ path, shape: "SCORES", detail: `line ${i + 1} looks like a per-word score table` });
    } else if (exactWords) {
      let hits = 0;
      for (const w of exactWords) {
        if (new RegExp("(^|[^A-Za-z])" + w + "([^A-Za-z]|$)", "i").test(line)) hits++;
      }
      if (hits >= 3) found.push({ path, shape: "EXACT", detail: `line ${i + 1} holds ${hits} of her words` });
    }
  }
  return found;
}

function blobsInRange(range) {
  // A RANGE, so only what this push ADDS is examined. Long-standing legitimate
  // word lists in the record (qz8-exclusions.txt, 37 words) are not re-litigated
  // on every push -- which is what keeps the hook quiet enough to stay switched on.
  const out = execFileSync("git", ["rev-list", "--objects", ...range.split(" "), "--", ".oplan"], {
    maxBuffer: 1 << 28,
  }).toString();
  const seen = new Map();
  for (const line of out.split(/\r?\n/)) {
    const i = line.indexOf(" ");
    if (i < 0) continue;
    const p = line.slice(i + 1);
    if (p.startsWith(".oplan") && /\.[a-z]+$/.test(p)) seen.set(line.slice(0, i), p);
  }
  return seen;
}

function readBlobs(seen, exactWords) {
  return new Promise((resolve) => {
    const found = [];
    if (!seen.size) return resolve(found);
    const cf = spawn("git", ["cat-file", "--batch"]);
    let buf = Buffer.alloc(0);
    cf.stdout.on("data", (d) => {
      buf = Buffer.concat([buf, d]);
      for (;;) {
        const nl = buf.indexOf(10);
        if (nl < 0) break;
        const m = /^([0-9a-f]{40}) (\w+) (\d+)$/.exec(buf.slice(0, nl).toString());
        if (!m) { buf = buf.slice(nl + 1); continue; }
        const size = Number(m[3]);
        if (buf.length < nl + 1 + size + 1) break;
        const body = buf.slice(nl + 1, nl + 1 + size);
        buf = buf.slice(nl + 1 + size + 1);
        if (m[2] === "blob") found.push(...scanText(seen.get(m[1]), body.toString("utf8"), exactWords));
      }
    });
    cf.on("close", () => resolve(found));
    for (const sha of seen.keys()) cf.stdin.write(sha + "\n");
    cf.stdin.end();
  });
}

if (process.argv[1] && process.argv[1].endsWith("check-record-privacy.mjs")) {
  const range = process.argv[2] || "HEAD";
  // The exact pass is OPT-IN and never defaults to the synthetic fixture.
  let exact = null;
  const src = process.env.LEARNER_PROFILE;
  if (src && existsSync(src)) {
    try {
      const p = JSON.parse(readFileSync(src, "utf8"));
      // GET /api/profile answers {ok, data:{...}}; a file saved straight from that
      // endpoint is therefore WRAPPED. This originally read p.words only, so against
      // a real capture it silently found ZERO words, fell back to tripwire-only and
      // exited 0 -- the strongest mode of the control that guards her vocabulary had
      // never once run. Accept both shapes. (Found 2026-08-10; the same wrong
      // assumption about this payload's shape also produced a "0 known words" reading
      // from a 30 KB file during the word-write run. Measure the shape, never recall it.)
      const words = (p && p.words) || (p && p.data && p.data.words) || {};
      const w = Object.keys(words).map((k) => k.toLowerCase()).filter((k) => /^[a-z]{2,20}$/.test(k));
      if (w.length) exact = w;
    } catch { /* fall through to tripwire-only, and say so below */ }
  }
  // FAIL LOUD, NOT OPEN. Asking for the exact pass and silently not getting it is
  // worse than not asking: the run reports "nothing tripped" and reads like proof.
  if (src && !exact) {
    console.error("RECORD PRIVACY: LEARNER_PROFILE was set to " + src +
      " but no usable word list came out of it -- refusing to pass.");
    console.error("  A silent fallback to tripwire-only is how a leak gets waved through.");
    process.exit(2);
  }

  let found;
  try {
    found = await readBlobs(blobsInRange(range), exact);
  } catch (err) {
    console.error("RECORD PRIVACY: could not read the range " + range + " -- refusing to pass.");
    process.exit(2);
  }

  const byPath = new Map();
  for (const f of found) {
    if (!byPath.has(f.path)) byPath.set(f.path, []);
    if (byPath.get(f.path).length < 3) byPath.get(f.path).push(f);
  }
  if (byPath.size) {
    console.error("\nRECORD PRIVACY: this push looks like it discloses her vocabulary.\n");
    for (const [p, items] of byPath) {
      console.error("  " + p);
      for (const it of items) console.error(`     [${it.shape}] ${it.detail}`);
    }
    console.error("\n.oplan IS PUBLISHED. Counts only -- never her words, never her scores.");
    console.error("Nothing of hers is public today; keep it that way. The 2026-08-03 incident");
    console.error("in .oplan/REQUESTS-FROM-THE-LEARNER.md records how to purge safely: scope to");
    console.error("exact LINES, never to words -- her words are also shipped content.");
    console.error("\nIf this is a false alarm, push again with SKIP_RECORD_PRIVACY=1.\n");
    process.exit(1);
  }
  console.log(
    `record privacy: nothing tripped (range ${range}, ` +
    (exact ? `${exact.length}-word exact pass ran` : "tripwire only -- no LEARNER_PROFILE set") + ")"
  );
}
