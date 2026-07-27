import { sendJson, readJsonBody } from '../lib/http.js';
import { loadProfile, saveProfile } from '../lib/store.js';
import { defaultProfile, applyWordTap, markWordKnown, setLearner, logCheck, migrateWordKeys, applyQuizAnswer } from '../lib/profile.js';
import { isAuthorized, rejectUnauthorized } from '../lib/auth.js';
import { resolveLemma } from '../public/lemma.js';
import wordManifest from '../public/audio/words/index.json' with { type: 'json' };

const WORD_SOURCES = ['placement', 'tap', 'band'];

// The exact list the browser resolves against -- imported rather than re-derived
// so the two can never disagree about what "feels" means.
const ALLOWED_WORDS = new Set(wordManifest);

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    rejectUnauthorized(res, sendJson);
    return;
  }

  if (req.method === 'GET') {
    let p = await loadProfile();
    if (p === null) {
      p = defaultProfile();
      await saveProfile(p);
    } else {
      // Fold any surface-form keys ("feels") into their lemma ("feel"). Only
      // write when it actually changed, so a migrated profile stops costing a
      // write on every load.
      const before = JSON.stringify(p.words);
      migrateWordKeys(p, ALLOWED_WORDS);
      if (JSON.stringify(p.words) !== before) await saveProfile(p);
    }
    sendJson(res, 200, { ok: true, data: p });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: `Method ${req.method} not allowed` });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    sendJson(res, 400, { ok: false, error: 'invalid JSON body' });
    return;
  }

  let p = await loadProfile();
  if (p === null) p = defaultProfile();
  else migrateWordKeys(p, ALLOWED_WORDS);

  if (body.action === 'word-tap') {
    if (typeof body.lemma !== 'string' || body.lemma.trim() === '') {
      sendJson(res, 400, { ok: false, error: 'lemma required' });
      return;
    }
    try {
      // Resolve here too, not only in the browser: the stored key is then a
      // lemma whatever version of the page made the call.
      const lemma = resolveLemma(body.lemma, ALLOWED_WORDS) || body.lemma;
      applyWordTap(p, { lemma, he: body.he ?? null, context: body.context });
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err.message });
      return;
    }
  } else if (body.action === 'mark-known') {
    if (typeof body.lemma !== 'string' || body.lemma.trim() === '') {
      sendJson(res, 400, { ok: false, error: 'lemma required' });
      return;
    }
    if (!WORD_SOURCES.includes(body.source)) {
      sendJson(res, 400, { ok: false, error: 'source required' });
      return;
    }
    try {
      const lemma = resolveLemma(body.lemma, ALLOWED_WORDS) || body.lemma;
      markWordKnown(p, { lemma, source: body.source, he: body.he ?? null });
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err.message });
      return;
    }
  } else if (body.action === 'set-learner') {
    if (body.heroineName === undefined && body.petName === undefined) {
      sendJson(res, 400, { ok: false, error: 'name required' });
      return;
    }
    try {
      setLearner(p, { heroineName: body.heroineName, petName: body.petName });
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err.message });
      return;
    }
  } else if (body.action === 'log-check') {
    if (
      typeof body.questionId !== 'string' ||
      typeof body.chosenIndex !== 'number' ||
      typeof body.correctIndex !== 'number'
    ) {
      sendJson(res, 400, { ok: false, error: 'invalid check' });
      return;
    }
    logCheck(p, {
      chapter: body.chapter,
      questionId: body.questionId,
      chosenIndex: body.chosenIndex,
      correctIndex: body.correctIndex,
    });
  } else if (body.action === 'quiz-answer') {
    if (typeof body.lemma !== 'string' || body.lemma.trim() === '') {
      sendJson(res, 400, { ok: false, error: 'lemma required' });
      return;
    }
    if (
      typeof body.sessionId !== 'string' ||
      body.sessionId.trim() === '' ||
      body.sessionId.length > 64
    ) {
      sendJson(res, 400, { ok: false, error: 'session required' });
      return;
    }
    if (body.correct !== true && body.correct !== false) {
      sendJson(res, 400, { ok: false, error: 'answer required' });
      return;
    }
    // Deliberately NOT resolveLemma: the quiz client sends a key it read
    // straight out of the profile, so we look it up directly.
    const k = String(body.lemma).trim().toLowerCase();
    if (!p.words[k]) {
      sendJson(res, 400, { ok: false, error: 'unknown word' });
      return;
    }
    applyQuizAnswer(p, { lemma: body.lemma, correct: body.correct, sessionId: body.sessionId });
  } else {
    sendJson(res, 400, { ok: false, error: 'unknown action' });
    return;
  }

  await saveProfile(p);
  sendJson(res, 200, { ok: true, data: p });
}
