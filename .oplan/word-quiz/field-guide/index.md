# Field guide — word-quiz (re-curated at the phase-3 boundary) (budget: 40 lines)

1. **A FORMAT GATE IS NOT A CONTENT GATE. This project has now been bitten three times.** "Valid
   ADTS header" passed 36 silent clips; "filenames match the allowed set" passed a set that did not
   match the screen; and phase 1's own gate had five holes while its suite passed with the entire
   data bank DELETED. All were chosen because they were easy to check. Before freezing a criterion,
   ask what the CHILD experiences and gate that. If a gate cannot see the failure, say so and add a
   human review — never let a green check stand in for a look.
2. **A test never seen to FAIL is not evidence.** Run every new regression test against the unfixed
   (or deliberately mutated) code first. A source-grep catches a missing decision, never a wrong
   one: extract a PURE EXPORTED function and CALL it. `public/` modules import fine under Node.
3. **NEVER verify code against your own RE-IMPLEMENTATION.** `^[a-z]+$` is not `tokenize`'s
   `[a-z]+(?:'[a-z]+)?`, and that proxy put a wrong number in all three bands. Import the real one.
4. **Rules that reach their subject through a TRANSFORM fail OPEN.** Phase 1's rules touched the
   answer via `tokenize` / a Map lookup / `resolveLemma`; every one silently passed bad input, and
   `answer:"Feel"` disabled a whole rule. Prefer a direct check (`allowed.has(x)`) over a derived one.
5. **THE PROFILE IS LIVE, AND IT IS THE ONE FILE THAT HOLDS EVERYTHING SHE HAS COLLECTED.**
   · In production it is in Vercel Blob behind `APP_CODE` — unreadable from this repo, never probe it.
   · `GET /api/profile` CREATES one when absent — a read that writes. Point `DATA_DIR` at a temp dir,
     then VERIFY real `.data/` stayed empty.
   · `migrateWordKeys` runs on EVERY load and, when two keys merge, copies **named fields only** —
     anything you add and do not name there is silently dropped.
   · `saveProfile` mutates `meta.updatedAt`, so any "unchanged" assertion must allow for it.
   · `validateProfile` is **never called at runtime** — "an old profile must still validate" is a
     test-suite guarantee, not a production one.
   · `lib/auth.js:isAuthorized` returns TRUE when `APP_CODE` is unset; frozen commands must
     `delete process.env.APP_CODE` or they 401 on a machine that exports it.
6. Windows/Git Bash: forward slashes; CRLF warnings are noise; `curl` needs `--ssl-no-revoke`; npm
   global bin is off PATH (`"$(npm prefix -g)/<tool>"`). **Git Bash's `/tmp` is NOT node's** —
   `/c/Users/...` reaches node as `C:\c\Users\...`. Use `os.tmpdir()` from inside node; never write
   scratch into the repo (it dirties your own gate).
7. `npm test` = bare `node --test` over `tests/*.test.js`, under cmd.exe. It also runs the contrast
   gate. Invariant: ZERO failures. The ledger only stays checkable if every new test is a FLAT
   top-level `test()` — `dev-server.test.js`'s 5 subtests are why 220 files-worth prints as 225.
8. Validation chains: `set -o pipefail`; a stray `;` DETACHES the rest so `…-OK` prints over a broken
   build. **`cmd | grep -q` under pipefail is a trap** — `grep -q` exits on first match, SIGPIPEs the
   producer, and fails the pipeline though every check passed. Capture to a variable, match with `case`.
9. Before touching a view/style/data file, grep `tests/` for exact-shape assertions (the sw `CACHE`
   string, the exact `PRECACHE` array, class names, Hebrew strings) — append beside a frozen thing,
   never replace it. `PRECACHE` admits only first-party JS a precached file STATICALLY imports; data
   and audio stay OUT; any precached-file change needs a `CACHE` bump the same phase. The contrast
   gate sees only `:root` tokens — a raw hex is invisible and `color-mix()` FABRICATES a pass.
10. **HEBREW IS BIDI:** never anchor a patch, grep or heredoc on Hebrew copied from TERMINAL OUTPUT —
    display reordering hides a wrong byte order. Put frozen text in a FILE and `grep -qF -f` it.
11. **A packet that NAMES a frozen contract without QUOTING it is a hole** — the worker fills the gap
    instead of stopping. Build every packet as `contracts + step`, hand the validation over as a
    script file, and make the report ask what it read outside the packet. Workers have caught real
    contradictions in my packets three times by answering that honestly.
12. DEPLOY = `"$(npm prefix -g)/vercel" deploy --prod --yes`. Record the outgoing deployment id+url
    via `vercel inspect` FIRST — the only rollback target. Verify live by md5 against the WORKTREE,
    never a git blob (CRLF on disk, LF in git). `cleanUrls` 308s `*.html`, so fetch the shell as `/`.
