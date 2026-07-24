import { sendJson, readJsonBody } from '../lib/http.js';
import { loadProfile, saveProfile } from '../lib/store.js';
import { defaultProfile, markWordKnown } from '../lib/profile.js';
import { scoreTask1, scoreTask2, bandForScore, clientView } from '../lib/placement.js';
import bank from '../data/placement-items.json' with { type: 'json' };

export default async function handler(req, res) {
  if (req.method === 'GET') {
    sendJson(res, 200, { ok: true, data: clientView(bank) });
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

  if (body.action !== 'submit') {
    sendJson(res, 400, { ok: false, error: 'unknown action' });
    return;
  }

  const hasTask1 = Array.isArray(body.task1);
  const hasTask2 = Array.isArray(body.task2);
  if (!hasTask1 && !hasTask2) {
    sendJson(res, 400, { ok: false, error: 'no answers' });
    return;
  }

  let p = await loadProfile();
  if (p === null) p = defaultProfile();
  const now = new Date().toISOString();

  if (hasTask1) {
    const r = scoreTask1(bank, body.task1);
    if (r.total === 0) {
      sendJson(res, 400, { ok: false, error: 'no valid answers' });
      return;
    }
    p.skills.receptiveVocab = { state: 'estimated', score: r.score, band: bandForScore(r.score) };
    for (const { lemma, he } of r.knownLemmas) {
      markWordKnown(p, { lemma, source: 'placement', he });
    }
    p.placement.task1 = { correct: r.correct, total: r.total, score: r.score, answeredAt: now };
  }

  if (hasTask2) {
    const r2 = scoreTask2(bank, body.task2);
    if (r2.total === 0) {
      sendJson(res, 400, { ok: false, error: 'no valid answers' });
      return;
    }
    p.skills.readingComprehension = { state: 'estimated', score: r2.score, band: bandForScore(r2.score) };
    p.placement.task2 = { correct: r2.correct, total: r2.total, score: r2.score, answeredAt: now };
  }

  if (p.placement.task1 && p.placement.task2) {
    p.placement.completed = true;
    p.placement.completedAt = now;
  }

  await saveProfile(p);
  sendJson(res, 200, { ok: true, data: p });
}
