// QZ-16 — the criterion-9 transcript.
//
// WRITTEN BY THE ORCHESTRATOR, BEFORE STEP 3.4 WAS DISPATCHED, AND DELIBERATELY
// NOT BY THE AGENT THAT WRITES THE HANDLER. The owner's approval is the last gate
// on this phase, and phase 1 closed once on an assurance that turned out to be
// false. A gate whose measuring instrument was built by the thing being measured
// is not a gate.
//
// It drives the REAL handler over one imagined week of answers and prints one
// line per event. The expected stdout is frozen beside it in
// transcript-expected.txt and is diffed before the output reaches the owner.
//
// Run: node .oplan/word-quiz/transcript.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

// Field guide 5: isAuthorized returns TRUE only when APP_CODE is unset, so a
// developer machine that exports it would get 401s on every event. And the Blob
// token must be gone or the store would reach for production storage.
delete process.env.APP_CODE;
delete process.env.BLOB_READ_WRITE_TOKEN;

// Field guide 6: os.tmpdir() from inside node -- Git Bash's /tmp is not node's.
// Set DATA_DIR before the handler is imported so the store never sees the real one.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'english-app-transcript-'));
process.env.DATA_DIR = tmpDir;

const { default: profileHandler } = await import('../../api/profile.js');
const { knownLemmaSet } = await import('../../lib/vocab.js');

function createMockRes() {
  return {
    statusCode: undefined,
    headers: undefined,
    body: undefined,
    writeHead(status, headers) {
      this.statusCode = status;
      this.headers = headers;
    },
    end(body) {
      this.body = body;
    },
  };
}

function createPostReq(bodyObj) {
  const req = Readable.from([Buffer.from(JSON.stringify(bodyObj), 'utf8')]);
  req.method = 'POST';
  return req;
}

async function post(body) {
  const res = createMockRes();
  await profileHandler(createPostReq(body), res);
  const parsed = JSON.parse(res.body);
  if (res.statusCode !== 200 || parsed.ok !== true) {
    // Never print a stale line over a failed event -- that is exactly how a
    // transcript would lie to the owner.
    throw new Error(
      `event failed: ${JSON.stringify(body)} -> ${res.statusCode} ${JSON.stringify(parsed)}`
    );
  }
  return parsed.data;
}

// The frozen event script. One imagined week:
//   she claims three words, taps "light" twice to hear it, then answers.
//   s1..s6 are six separate sittings.
const claim = (lemma) => ['claim', lemma, { action: 'mark-known', lemma, source: 'placement' }];
const tap = (lemma) => ['tap', lemma, { action: 'word-tap', lemma }];
const quiz = (lemma, correct, sessionId) => [
  `quiz ${correct ? 'RIGHT' : 'WRONG'} ${sessionId}`,
  lemma,
  { action: 'quiz-answer', lemma, correct, sessionId },
];

const EVENTS = [
  claim('light'),
  claim('fair'),
  claim('method'),
  tap('light'),
  tap('light'),
  quiz('light', false, 's1'),
  quiz('light', false, 's1'),
  quiz('light', false, 's1'),
  quiz('light', false, 's2'),
  quiz('fair', true, 's2'),
  quiz('light', true, 's3'),
  quiz('light', false, 's4'),
  quiz('light', false, 's5'),
  quiz('light', false, 's6'),
  quiz('method', false, 's6'),
];

const lines = [];
let profile;

try {
  for (const [label, lemma, body] of EVENTS) {
    profile = await post(body);
    const e = profile.words[lemma] ?? {};
    lines.push(
      `${label} -> ${lemma}: status=${e.status} strikes=${e.strikes ?? 0} ` +
        `needsReview=${e.needsReview ?? false} right=${e.quizRight ?? 0} wrong=${e.quizWrong ?? 0}`
    );
  }
  lines.push(`knownLemmaSet: ${[...knownLemmaSet(profile)].sort().join(', ')}`);
  process.stdout.write(lines.join('\n') + '\n');
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
