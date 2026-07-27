// Phase 3 acceptance criteria 3, 4 and 5, checked INDEPENDENTLY of the test suite.
//
// The suite is written by the same agents that wrote the code. These three are the
// criteria the owner actually cares about, so they are re-derived here from the
// criteria text and run against the REAL handler and the REAL consumer.
//
// Run: node .oplan/word-quiz/phase-3-gate.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

delete process.env.APP_CODE;
delete process.env.BLOB_READ_WRITE_TOKEN;

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-gate-'));
process.env.DATA_DIR = tmpRoot;

const { default: handler } = await import('../../api/profile.js');
const { knownLemmaSet } = await import('../../lib/vocab.js');

function res() {
  return { writeHead(s) { this.statusCode = s; }, end(b) { this.body = b; } };
}
async function call(req) {
  const r = res();
  await handler(req, r);
  return { status: r.statusCode, parsed: JSON.parse(r.body) };
}
async function post(body) {
  const req = Readable.from([Buffer.from(JSON.stringify(body), 'utf8')]);
  req.method = 'POST';
  const out = await call(req);
  if (out.status !== 200) throw new Error(`POST failed ${out.status}: ${out.parsed.error}`);
  return out.parsed.data;
}
const get = async () => (await call({ method: 'GET' })).parsed.data;

// Each criterion gets its own empty DATA_DIR so they cannot contaminate each other.
function freshDir(tag) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), `english-app-gate-${tag}-`));
  process.env.DATA_DIR = d;
  return d;
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}\n        ${detail}`);
}

try {
  // ---- CRITERION 3: D16 holds. Ten wrong answers in ONE session must not wipe a word.
  freshDir('c3');
  await post({ action: 'mark-known', lemma: 'light', source: 'placement' });
  for (let i = 0; i < 10; i++) {
    await post({ action: 'quiz-answer', lemma: 'light', correct: false, sessionId: 'one-sitting' });
  }
  {
    const e = (await get()).words.light;
    check(
      'CRIT-3  ten wrong answers in ONE sitting leave strikes=1 and status=known',
      (e.strikes ?? 0) === 1 && e.status === 'known',
      `strikes=${e.strikes ?? 0} status=${e.status} quizWrong=${e.quizWrong ?? 0}`
    );
  }

  // ---- CRITERION 4: the demotion reaches the STORY, not just the status field.
  freshDir('c4');
  await post({ action: 'mark-known', lemma: 'fair', source: 'placement' });
  const inSetBefore = knownLemmaSet(await get()).has('fair');
  for (const s of ['d1', 'd2', 'd3']) {
    await post({ action: 'quiz-answer', lemma: 'fair', correct: false, sessionId: s });
  }
  {
    const p = await get();
    const inSetAfter = knownLemmaSet(p).has('fair');
    check(
      'CRIT-4  three wrongs in three sittings remove the word from knownLemmaSet',
      inSetBefore === true && inSetAfter === false,
      `knownLemmaSet before=${inSetBefore} after=${inSetAfter}, status=${p.words.fair.status}`
    );
  }

  // ---- CRITERION 5: a tap is never a strike (D11).
  freshDir('c5');
  await post({ action: 'mark-known', lemma: 'method', source: 'placement' });
  for (let i = 0; i < 5; i++) await post({ action: 'word-tap', lemma: 'method' });
  {
    const p = await get();
    const e = p.words.method;
    check(
      'CRIT-5  five taps leave status=known, strikes=0, needsReview=true',
      e.status === 'known' && (e.strikes ?? 0) === 0 && e.needsReview === true &&
        knownLemmaSet(p).has('method'),
      `status=${e.status} strikes=${e.strikes ?? 0} needsReview=${e.needsReview} inKnownSet=${knownLemmaSet(p).has('method')}`
    );
  }
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

const failed = results.filter((r) => !r.ok);
console.log('');
if (failed.length === 0) {
  console.log('CRITERIA 3, 4, 5: ALL PASS');
} else {
  console.log(`CRITERIA 3, 4, 5: ${failed.length} FAILED`);
  process.exitCode = 1;
}
