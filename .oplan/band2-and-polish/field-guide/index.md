# Field guide — band2-and-polish (budget: 40 lines)

1. Git Bash on Windows: forward slashes, `/dev/null`, CRLF warnings are noise. `curl` needs
   `--ssl-no-revoke`. npm global bin is off PATH — `"$(npm prefix -g)/<tool>"`. Git Bash's `/tmp` is
   NOT node's — write temp files to the scratchpad, NEVER the repo root (it dirties your own gate).
2. Secrets in `.env`, gitignored; never commit or echo them. `APP_CODE` gates the prod API: every
   `/api/*` except `/api/health` answers 401 without the header. Never run `vercel env`.
3. `npm test` = bare `node --test` over `tests/*.test.js`, run under cmd.exe not Git Bash, so always
   validate with `npm test` itself. It now also runs the contrast gate. Invariant: ZERO FAILURES.
4. Before touching any view/style/data, grep tests/ for exact-shape assertions: `shell.test.js`
   freezes `manifest.icons[0].src`, manifest colors, the sw CACHE string and PRECACHE; view tests
   freeze class names and Hebrew strings. So "just replace icon.svg" is IMPOSSIBLE — append beside it.
5. Any change to a precached file REQUIRES bumping `CACHE` in `public/sw.js` (+ its assertion) in
   the SAME phase. That string is the ONLY sanctioned exception to "sw.js is untouchable"; PRECACHE
   stays byte-identical; ONE bump covers every `public/` change in the phase.
6. Validation chains: always `set -o pipefail`; a stray `;` DETACHES the rest so `…-OK` prints over
   a broken build; `grep -qF --` before `--patterns`; never `! grep -q '<bare number>'`. Gate a DOC
   edit on a substring of EVERY new line plus `wc -l`, or a silent reflow passes every content grep.
7. The learner profile is LIVE. `GET /api/profile` CREATES one when absent — a read that writes, so
   merely loading the app writes. Point `DATA_DIR` at scratch, then VERIFY real `.data/` stayed
   empty. This is also why production can never be browser-verified: the views fetch it on load.
8. THE CONTRAST GATE ONLY SEES `:root` TOKENS. A raw hex painted in a background is invisible to it —
   that is how `--color-border` shipped at 2.92:1 against a binding 3:1 while the gate printed ALL
   PASS. Every colour painted in `body` must be a token with its own six pairs (VP-1). Also blind to:
   `<button>` not inheriting `color` (UA sets `buttontext`), and `color-mix()` resolving as
   `color(srgb …)` not `rgb(...)` — an `rgb()` regex reads those as black and FABRICATES passes.
9. Browser checks: a plain reload LIES — unregister the SW, `caches.delete(...)`, ctrl+shift+R, then
   confirm from the DOM. Restart dev servers after editing `data/*.json` (JSON imports are cached).
   A view's `<style>` lives inside `#app`, so overwriting `innerHTML` deletes its CSS; Chrome freezes
   animation clocks in hidden tabs — set `getAnimations()[0].currentTime` to prove motion.
10. Images come from the FREE ChatGPT web route (paid API only for runtime generation). Capture by
    fetching the blob in-page and clicking ONE synthetic `<a download="name.png">` — never "newest
    file in ~/Downloads". The DOM can show NO reply while the image exists — RELOAD before despairing.
11. sharp ignores chain order: `resize` runs BEFORE `composite`, and `.stats()` re-opens the ORIGINAL
    input, ignoring a chained `.extract()` — materialize with `.png().toBuffer()` before measuring.
12. DEPLOY = `"$(npm prefix -g)/vercel" deploy --prod --yes`. Record the outgoing deployment
    id+url+commit via `vercel inspect <canonical-url>` BEFORE deploying — it is the only rollback
    target, and `vercel rollback <prev-url> --yes` needs it. Verify live by md5 against the WORKTREE,
    never a git blob (index.html is CRLF on disk, LF in git). `cleanUrls` makes `/index.html` a 308 —
    fetch the shell as `/`. A 401 reject-path probe proves a function + its bundled JSON loaded, free.
