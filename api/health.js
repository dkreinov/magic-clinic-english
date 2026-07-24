import { sendJson } from '../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: `Method ${req.method} not allowed` });
    return;
  }
  sendJson(res, 200, { ok: true, data: { status: 'up', version: 1 } });
}
