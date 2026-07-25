import { sendJson, readJsonBody } from '../lib/http.js';
import { loadProfile, saveProfile } from '../lib/store.js';
import { defaultProfile, applyWordTap, markWordKnown, setLearner, logCheck } from '../lib/profile.js';
import { isAuthorized, rejectUnauthorized } from '../lib/auth.js';

const WORD_SOURCES = ['placement', 'tap', 'band'];

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

  if (body.action === 'word-tap') {
    if (typeof body.lemma !== 'string' || body.lemma.trim() === '') {
      sendJson(res, 400, { ok: false, error: 'lemma required' });
      return;
    }
    try {
      applyWordTap(p, { lemma: body.lemma, he: body.he ?? null });
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
      markWordKnown(p, { lemma: body.lemma, source: body.source, he: body.he ?? null });
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
  } else {
    sendJson(res, 400, { ok: false, error: 'unknown action' });
    return;
  }

  await saveProfile(p);
  sendJson(res, 200, { ok: true, data: p });
}
