# Field guide — band2-and-polish (budget: 40 lines)

1. Git Bash on Windows: forward slashes, `/dev/null`, CRLF warnings are noise. `curl` needs
   `--ssl-no-revoke`. npm global bin is off PATH — use `"$(npm prefix -g)/<tool>"` (e.g. `vercel`).
   Git Bash's `/tmp` is NOT node's (node reads `C:\tmp`, ENOENT) — use scratchpad/repo paths.
2. Secrets in `.env`, gitignored. Never commit or echo them. `APP_CODE` gates the prod API.
3. `npm test` = bare `node --test` over `tests/*.test.js`, and runs under cmd.exe not Git Bash, so
   always validate with `npm test` itself. Now 157 tests; the invariant is ZERO FAILURES, not a count.
4. Before touching any view/style/data, grep tests/ for exact-shape assertions: `shell.test.js`
   freezes `manifest.icons[0].src`, manifest colors, the sw CACHE string and PRECACHE;
   `placement-items.test.js` freezes task2 counts; view tests freeze class names and Hebrew strings.
   Hence "just replace `icons/icon.svg`" is IMPOSSIBLE — append alongside it.
5. Any change to a precached file REQUIRES bumping `CACHE` in `public/sw.js` (+ its assertion) in
   the SAME phase. That string is the ONLY sanctioned exception to "sw.js is untouchable"; PRECACHE
   stays byte-identical; ONE bump covers every `public/` change in the phase.
6. Validation chains: always `set -o pipefail` (`| tail` masks npm's exit code); a stray `;`
   DETACHES the rest, so `…-OK` prints over a broken build; `grep -qF --` before `--patterns`;
   never `! grep -q '<bare number>'` — it bans that digit run forever.
7. The learner profile is LIVE. `GET /api/profile` CREATES one when absent — a read that writes, so
   merely loading the app writes. Point `DATA_DIR` at scratch, then VERIFY real `.data/` stayed empty.
8. THE CONTRAST GATE ONLY SEES `:root` TOKENS. A raw hex painted in a background is invisible to it
   — that is how `--color-border` shipped at 2.92:1 against a binding 3:1 while the gate printed ALL
   PASS. Every colour painted in `body` must be a token with its own six pairs (VP-1). Also blind to:
   `<button>` not inheriting `color` (UA sets `buttontext`), and `color-mix()` resolving as
   `color(srgb …)` not `rgb(...)` — an `rgb()` regex reads those as black and FABRICATES passes.
   Plain hex tokens do resolve to `rgb(...)`.
9. Browser checks: a plain reload LIES — unregister the SW, `caches.delete(...)`, ctrl+shift+R, then
   confirm from the DOM. Restart dev servers after editing `data/*.json` (JSON imports are cached).
   Two traps that fake a BROKEN verdict: a view's `<style>` lives inside `#app`, so overwriting
   `innerHTML` deletes its CSS; and Chrome freezes animation clocks in hidden tabs (`currentTime`
   stays 0) — set `getAnimations()[0].currentTime` manually to prove an animation runs.
10. Images come from the FREE ChatGPT web route (paid API only for runtime generation). Capture by
    fetching the blob in-page and clicking ONE synthetic `<a download="name.png">` — never the
    download button, never "newest file in ~/Downloads"; confirm no stale file of that name first,
    then match by exact name. localhost sinks are CSP-blocked. After submitting, the DOM can show NO
    assistant turn while the image already exists server-side — RELOAD before calling it a failure.
11. sharp ignores your chain order: `resize` runs BEFORE `composite` ("must have same dimensions or
    smaller"), and `.stats()` re-opens the ORIGINAL input, silently ignoring a chained `.extract()`.
    Materialize with `.png().toBuffer()` before measuring a crop. `resize` → `extend` is safe.
