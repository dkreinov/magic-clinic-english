# Field guide — band2-and-polish (budget: 40 lines)

Inherited (still binding):
1. Shell is Git Bash on Windows: forward slashes, `/dev/null`; git CRLF warnings are noise.
2. `curl` on this machine needs `--ssl-no-revoke` (corporate TLS).
3. npm global bin is NOT on Git Bash PATH. Call global CLIs via `"$(npm prefix -g)/<tool>"`
   (e.g. the authenticated `vercel` CLI).
4. Secrets live in `.env` (gitignored). NEVER commit it or copy key values anywhere.
   `APP_CODE` gates the API in production; unset locally means the gate is open.
5. Tests: bare `node --test` via `npm test`; `tests/*.test.js`, node:test only. This run's
   invariant is ZERO FAILURES (the count rises from 146 to 151 when band2.test.js lands).
6. npm scripts run under cmd.exe, NOT Git Bash — always validate with `npm test` itself.
7. Before touching any view/style/data: grep tests/ for exact-shape assertions —
   `shell.test.js` freezes the six token NAMES, the manifest colors, the sw CACHE string and the
   PRECACHE list; `placement-items.test.js` freezes the task2 counts; view tests freeze class
   names and Hebrew strings.
8. `grep -qF "$pat"` breaks when the pattern starts with `--`. Write `grep -qF -- "$pat"`.
9. Shipping ANY change to a precached file REQUIRES bumping the CACHE version in `public/sw.js`
   (+ its assertion in `tests/shell.test.js`), in the SAME phase — otherwise returning devices
   serve the old shell forever.
10. `npm test 2>&1 | tail -N && ...` reports `tail`'s exit code, NOT npm's. Always prefix with
    `set -o pipefail`. Related: a stray `;` anywhere in a validation chain DETACHES everything
    after it, so the final `echo …-OK` prints even when the build is broken.
11. The learner profile is LIVE data and is never read or written during verification. Note
    `GET /api/profile` CREATES a default profile when none exists — a read that writes. Use a
    local server with `DATA_DIR` pointed at a scratch dir.
12. Verifying anything in the browser: a plain reload LIES. Unregister the service worker,
    `caches.delete(...)`, then ctrl+shift+R, and confirm from the DOM before believing a
    screenshot. Also restart long-running dev servers after editing `data/*.json` — node caches
    JSON imports at module load, so a stale server serves the old data.
13. `<button>` does not inherit `color` (the UA sets `buttontext`). Any control on a re-themed
    surface needs an EXPLICIT `color:`; a token-level contrast gate cannot see this, because the
    bad foreground comes from the browser and appears in no file.
14. Chrome reports a resolved `color-mix()` as `color(srgb 0.30 0.18 0.15)`, NOT `rgb(...)`. A
    script reading computed styles with an `rgb()` regex silently parses those as black and
    FABRICATES passing contrast numbers for exactly the states most worth checking.
15. Image generation goes through the FREE ChatGPT web route (owner policy: the paid API is only
    for what the app generates at runtime). Capture by fetching the blob in-page and clicking ONE
    synthetic `<a download="name.png">` — never the download button, never "newest file in
    ~/Downloads". Posting bytes to a localhost sink is blocked by chatgpt.com's CSP.
16. Git Bash's `/tmp` is NOT Node's `/tmp` on Windows: node resolves `/tmp/x` as `C:\tmp\x` and
    throws ENOENT. Pass files via a repo-relative or scratchpad path, or avoid the handoff
    entirely (compare `md5sum` hashes in the shell rather than diffing inside node).
