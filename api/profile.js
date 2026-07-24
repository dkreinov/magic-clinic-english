import { sendJson } from '../lib/http.js';
import { loadProfile, saveProfile } from '../lib/store.js';
import { defaultProfile } from '../lib/profile.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: `Method ${req.method} not allowed` });
    return;
  }

  let p = await loadProfile();
  if (p === null) {
    p = defaultProfile();
    await saveProfile(p);
  }
  sendJson(res, 200, { ok: true, data: p });
}
