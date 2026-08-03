// BOUNDARY CHECK: did an edit change or remove any pre-existing line?
//
// WHY THIS EXISTS. `git diff --numstat` reports "N added, 0 deleted" for a
// mid-file INSERTION and for an end-of-file APPEND, identically. In phase 1 of
// this run I accepted "40 added, 0 deleted" as proof that a step had appended,
// and it had in fact inserted at line 33 (field guide 32). Zero deletions proves
// nothing was REMOVED; it says nothing about WHERE additions landed, and for
// public/quiz.js -- 346 lines of working UI -- where an edit lands is the whole
// question.
//
// WHAT IT PROVES. Every line of OLD appears in NEW, byte-identical, in the same
// relative order. That is a SUBSEQUENCE: it tolerates insertion anywhere and
// forbids deletion and modification.
//
// LINE ENDINGS. Both files are read as raw bytes and split on 0x0A with nothing
// trimmed, so a CRLF->LF flip is a DIFFERENCE rather than being invisible. It
// never goes through a git-mediated copy of the working tree (field guide 4:
// git archive / stash / clone re-apply autocrlf and silently flip every file).
// When OLD comes from `git show <sha>:<path>` the blob is LF-normalised, so pass
// --old-is-blob and the old side is compared after reconstructing CRLF, which is
// only sound when the file is uniformly CRLF -- asserted here, not assumed.
//
// ALLOWLIST. Some steps MUST edit pre-existing lines. Pass --allow=N,M,... with
// 1-based OLD line numbers. Each allowed line that is actually consumed is
// printed, so an unused allowance is visible rather than silently generous.
//
// usage: node subsequence-check.mjs <old> <new> [--old-is-blob] [--allow=1,2,3]
// exit 0 = OK, 1 = a pre-existing line was modified or removed, 2 = bad usage.

import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const files = args.filter((a) => !a.startsWith('--'));
if (files.length !== 2) {
  console.error('usage: node subsequence-check.mjs <old> <new> [--old-is-blob] [--allow=1,2,3]');
  process.exit(2);
}
const oldIsBlob = args.includes('--old-is-blob');
const allowArg = args.find((a) => a.startsWith('--allow='));
const allowed = new Set(
  allowArg
    ? allowArg
        .slice('--allow='.length)
        .split(',')
        .filter((s) => s.trim() !== '')
        .map((s) => Number(s))
    : []
);

let oldBuf = readFileSync(files[0]);
const newBuf = readFileSync(files[1]);

// If OLD is a git blob it is LF-normalised. Reconstruct CRLF only when NEW is
// uniformly CRLF -- otherwise the comparison would be meaningless either way.
if (oldIsBlob) {
  const newCR = newBuf.filter ? 0 : 0; // placeholder, computed below
  let cr = 0;
  let lf = 0;
  for (const b of newBuf) {
    if (b === 13) cr++;
    if (b === 10) lf++;
  }
  if (cr > 0 && cr === lf) {
    oldBuf = Buffer.from(
      oldBuf.toString('binary').replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'),
      'binary'
    );
  } else if (cr > 0 && cr !== lf) {
    console.error(`REFUSING: new file has MIXED endings (CR=${cr} LF=${lf}) -- fix that first`);
    process.exit(1);
  }
  void newCR;
}

const oldLines = oldBuf.toString('binary').split('\n');
const newLines = newBuf.toString('binary').split('\n');

let j = 0;
const consumedAllowances = [];
for (let i = 0; i < oldLines.length; i++) {
  const want = oldLines[i];
  let found = false;
  const startedAt = j;
  while (j < newLines.length) {
    if (newLines[j] === want) {
      j++;
      found = true;
      break;
    }
    j++;
  }
  if (!found) {
    if (allowed.has(i + 1)) {
      consumedAllowances.push(i + 1);
      j = startedAt; // this old line was permitted to change; do not consume new lines for it
      continue;
    }
    const preview = want.slice(0, 60).replace(/\r/g, '\\r');
    console.error(
      `SUBSEQ FAIL: old line ${i + 1} is missing or modified in the new file ` +
        `(scanned new up to line ${Math.min(j, newLines.length)})`
    );
    console.error(`  old line ${i + 1}: ${JSON.stringify(preview)}`);
    process.exit(1);
  }
}

for (const n of consumedAllowances) console.log(`ALLOWED ${n}`);
const unusedAllowances = [...allowed].filter((n) => !consumedAllowances.includes(n));
if (unusedAllowances.length) {
  console.log(`ALLOWANCES NOT USED: ${unusedAllowances.join(',')}`);
}
console.log(
  `SUBSEQ OK old=${oldLines.length} new=${newLines.length} inserted=${newLines.length - oldLines.length}`
);
process.exit(0);
