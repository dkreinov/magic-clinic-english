import { sendJson, readJsonBody } from '../lib/http.js';
import { chatJSON } from '../lib/openai.js';
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

  if (typeof body.word !== 'string' || body.word.trim() === '') {
    sendJson(res, 400, { ok: false, error: 'word required' });
    return;
  }

  const word = body.word.trim();

  try {
    const r = await chatJSON({
      system: 'Translate ONE English word to a single common Hebrew word. Respond ONLY with JSON {"he": "..."}.',
      user: word,
      temperature: 0,
    });
    sendJson(res, 200, { ok: true, data: { word, he: r.he } });
  } catch (err) {
    sendJson(res, 502, { ok: false, error: 'translation failed' });
  }
}
