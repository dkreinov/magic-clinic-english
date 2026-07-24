# Field guide — warm-dark-theme (budget: 40 lines)

Inherited from first-build / delight-pass (still binding):
1. Shell is Git Bash on Windows: forward slashes, `/dev/null`; git CRLF warnings are noise.
2. `curl` on this machine needs `--ssl-no-revoke` (corporate TLS).
3. npm global bin is NOT on Git Bash PATH. Call global CLIs via `"$(npm prefix -g)/<tool>"`
   (e.g. the authenticated `vercel` CLI).
4. Secrets live in `.env` (gitignored). NEVER commit it or copy key values anywhere.
5. Tests: bare `node --test` via `npm test`; test files in `tests/*.test.js`, node:test only.
   Baseline for this run is 146 pass / 0 fail.
6. npm scripts run under cmd.exe, NOT Git Bash — always validate with `npm test` itself.
7. Before touching any view/style: grep tests/ for exact-shape and selector assertions —
   `shell.test.js` freezes the six token NAMES, the two manifest colors, the sw CACHE string,
   and the PRECACHE list. View tests freeze class names and Hebrew strings.
8. `grep -qF "$pat"` breaks when the pattern starts with `--` (parsed as a long option).
   Always write `grep -qF -- "$pat"`.
9. Shipping ANY change to precached shell files REQUIRES bumping the CACHE version in
   `public/sw.js` (+ its assertion string in `tests/shell.test.js`) — a byte-identical sw.js
   means returning clients serve the old shell from cache FOREVER.

New this run:
10. `npm test 2>&1 | tail -N && ...` reports the exit code of `tail`, NOT of npm — a real test
    failure sails straight through the `&&` chain. Always prefix with `set -o pipefail`.
11. `sharp` is a devDependency of THIS repo, so a script outside the repo cannot `import 'sharp'`.
    Import it by absolute file URL:
    `file:///C:/Users/dkreinov/claude/english-app/node_modules/sharp/dist/index.cjs`.
12. On a dark ground, `color-mix(..., white)` and `..., black)` are both light-theme idioms.
    Every tint in this app mixes into `var(--color-card)` — percentages frozen in plan WDT-5.
13. The learner profile is LIVE data. Verification must never start placement or tap a word;
    the home view is static markup and makes no API call, so it is the safe preview screen.
14. Verifying a style change in a browser: a plain reload LIES. A service worker from an earlier
    session serves the old shell, and unregistering it is NOT enough — the HTTP disk cache still
    holds the old styles.css. Always: unregister SW + `caches.delete(...)` + ctrl+shift+R, then
    confirm via `getComputedStyle(document.documentElement).getPropertyValue('--color-bg')`
    before believing any screenshot. Cost us two false "it didn't work" readings on 2026-07-24.
