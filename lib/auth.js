// Simple shared-code gate for the API.
//
// The expected code lives in the APP_CODE environment variable — never in the repo — so the
// source can be published without publishing the code.
//
// If APP_CODE is not set the gate is OPEN. That keeps local dev and the test suite working
// without configuration, and means a missing production variable degrades to today's behaviour
// (unprotected) rather than locking the learner out of her own app.
//
// This is a low-bar gate: a short numeric code is guessable by brute force. It is meant to keep
// out crawlers and casual passers-by, not a determined attacker.

export function isAuthorized(req) {
  const expected = (process.env.APP_CODE || '').trim();
  if (!expected) return true;

  const headers = (req && req.headers) || {};
  const got = headers['x-app-code'];

  return typeof got === 'string' && got.trim() === expected;
}

export function rejectUnauthorized(res, sendJson) {
  sendJson(res, 401, { ok: false, error: 'קוד לא נכון' });
}
