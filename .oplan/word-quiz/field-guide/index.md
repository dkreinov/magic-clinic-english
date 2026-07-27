# Field guide — word-quiz (inherited from word-audio, re-curated) (budget: 40 lines)

1. **A FORMAT GATE IS NOT A CONTENT GATE, and this project has been bitten twice.** "Valid ADTS
   header" passed 36 clips containing no speech. "Filenames match the allowed set" passed a set
   that did not match the words on screen. Both were chosen because they were mechanically
   checkable, and both measured something ADJACENT to what mattered. Before freezing a criterion,
   ask what the CHILD experiences and gate that. If a gate cannot see the failure, say so in the
   plan and add a human review — do not let a green check stand in for a look.
2. **A SOURCE-GREP TEST CATCHES A MISSING DECISION, NEVER A WRONG ONE.** If a decision matters,
   extract a PURE EXPORTED function and CALL it from a test. Views and `public/` modules import
   fine under Node (no DOM at module scope). Run every new regression test against the UNFIXED
   code first: a test never seen to fail is not evidence.
3. **NEVER verify code against your own RE-IMPLEMENTATION of it.** `^[a-z]+$` is not `tokenize`'s
   `[a-z]+(?:'[a-z]+)?`, and that proxy put a wrong number in all three bands. Import the real
   function. `public/lemma.js` is deliberately imported by `api/` and `lib/` as well as the
   browser — one implementation, precedent already set and approved.
4. Git Bash on Windows: forward slashes, CRLF warnings are noise. `curl` needs `--ssl-no-revoke`.
   npm global bin is off PATH — `"$(npm prefix -g)/<tool>"`. **Git Bash's `/tmp` is NOT node's** —
   passing `/c/Users/...` to node yields `C:\c\Users\...`. Write temp files to the scratchpad with
   a Windows-style path, NEVER into the repo (it dirties your own gate).
5. `npm test` = bare `node --test` over `tests/*.test.js`, run under cmd.exe not Git Bash, so
   always validate with `npm test` itself. It also runs the contrast gate. Invariant: ZERO FAILURES.
6. Before touching any view/style/data, grep `tests/` for exact-shape assertions: `shell.test.js`
   freezes the sw CACHE string and the exact PRECACHE array; view tests freeze class names and
   Hebrew strings — append beside a frozen thing, never replace it.
7. **HEBREW IS BIDI:** never anchor a patch, a grep or a heredoc on a Hebrew string copied out of
   TERMINAL OUTPUT — display reordering makes a wrong byte order look identical. Put frozen text in
   a FILE, have workers copy from the file, and verify with `grep -qF -f` plus a `comm` of every
   non-ASCII run before and after.
8. Validation chains: always `set -o pipefail`; a stray `;` DETACHES the rest so `…-OK` prints over
   a broken build; `grep -qF --` before `--patterns`; never `! grep -q '<bare number>'`.
   **But `cmd | grep -q` UNDER pipefail is a trap**: `grep -q` exits on its first match and
   SIGPIPEs the producer, so the pipeline fails while every check actually passed. Cost a real
   debug on a green tree. Capture into a variable and match with `case`, not a `grep -q` pipe.
9. **THE CONTRAST GATE ONLY SEES `:root` TOKENS.** A raw hex is invisible to it. It is also blind
   to `<button>` not inheriting `color` (the UA paints `buttontext`), and to `color-mix()`, which
   an `rgb()` regex reads as black and FABRICATES a pass for. Any new button class must declare
   `color` AND `background` explicitly, from an already-measured pair.
10. `PRECACHE` is frozen with TWO sanctioned exceptions: the `CACHE` version string, and a new
    first-party JS module that a precached file STATICALLY imports (`app.js` imports every view, and
    the sw never calls `cache.put`, so an un-precached import turns the offline shell into a blank
    page). Data and audio stay OUT. Any precached-file change needs a `CACHE` bump the same phase.
11. **The learner profile is LIVE.** `GET /api/profile` CREATES one when absent — a read that
    writes. Point `DATA_DIR` at a temp dir in tests, then VERIFY real `.data/` stayed empty. An
    UNAUTHENTICATED probe is safe and is the free way to prove a function bundled: it 401s before
    any store access. A 401 next to a 404 control is evidence; a bare 200 is not.
12. **A worker packet that NAMES a frozen contract without QUOTING it is a hole** — the worker will
    read the plan and fill the gap rather than stop. Build every packet as `contracts + step`, hand
    workers their validation as a script file, and make the report ask what it read outside the
    packet. Workers here have twice caught real contradictions in my own packets by doing this.
13. DEPLOY = `"$(npm prefix -g)/vercel" deploy --prod --yes`. Record the outgoing deployment
    id+url via `vercel inspect` BEFORE deploying — the only rollback target. Verify live by md5
    against the WORKTREE, never a git blob (CRLF on disk, LF in git). `cleanUrls` 308s every
    `*.html`, so fetch the shell as `/`.
