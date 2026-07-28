import { sendJson, readJsonBody } from '../lib/http.js';
import { loadProfile, saveProfile } from '../lib/store.js';
import { defaultProfile, promoteToCandidate } from '../lib/profile.js';
import { generateChapter } from '../lib/story.js';
import { chatJSON } from '../lib/openai.js';
import band1 from '../data/band1.json' with { type: 'json' };
import band2 from '../data/band2.json' with { type: 'json' };
import { isAuthorized, rejectUnauthorized } from '../lib/auth.js';

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    rejectUnauthorized(res, sendJson);
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

  if (body.action !== 'generate') {
    sendJson(res, 400, { ok: false, error: 'unknown action' });
    return;
  }

  let p = await loadProfile();
  if (p === null) p = defaultProfile();

  if (p.placement.completed !== true) {
    sendJson(res, 400, { ok: false, error: 'placement required' });
    return;
  }

  if (!p.learner.heroineName || !p.learner.petName) {
    sendJson(res, 400, { ok: false, error: 'learner required' });
    return;
  }

  // G1 (docs/growth.md section 5). The profile is already loaded here and is
  // about to be saved below, so no new load or save is needed. A candidate is
  // invisible to buildAllowedSet, so this cannot change the chapter generated.
  promoteToCandidate(p);

  const r = await generateChapter({ profile: p, band1, band2, chat: chatJSON });
  if (!r.ok) {
    sendJson(res, 502, { ok: false, error: 'chapter generation failed' });
    return;
  }

  p.story.chapters.push(r.chapter);
  p.story.summarySoFar = r.summarySoFar;
  p.story.cliffhanger = r.chapter.cliffhanger;
  await saveProfile(p);

  sendJson(res, 200, { ok: true, data: { chapter: r.chapter } });
}
