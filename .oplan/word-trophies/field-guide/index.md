# Field guide — word-g1 (amended: word-trophies phase-1 close widened lessons 4 and 8) (budget: 40 lines; at 57 because the two new traps are commands+mechanisms that do not compress — justification in word-trophies journal)

1. A FORMAT GATE IS NOT A CONTENT GATE — bitten three times. Gate what the CHILD experiences
   (phase 3 gated `knownLemmaSet`, not `status`). If no gate can see the failure, add a human one.
2. WHAT COUNTS AS EVIDENCE. A test never seen to FAIL is not evidence — mutate first (fail-first),
   and report guards as guards. A positive assertion needs its NEGATIVE control (cry-wolf). Derive
   the expected output BY HAND from the contract BEFORE the code exists, then diff (the QZ-21 and
   G1 transcripts); commit the expected file ONCE and never edit it — a red diff means the CODE is
   wrong. Never verify against your own re-implementation; anything reaching its subject through a
   transform (`tokenize`, `resolveLemma`) fails OPEN.
3. THE PROFILE IS LIVE (Vercel Blob behind `APP_CODE`). NEVER probe it. `GET /api/profile` CREATES
   one — a read that writes (re-bitten at phase 2's visual gate via a stale localhost server).
   Tests point `DATA_DIR` at a temp dir; prove "nothing written" by BYTE-comparing. `isAuthorized`
   is open only when `APP_CODE` is UNSET; the frozen subshell capture
   (`.oplan/word-quiz/plan.md:1573-1586`) is the ONLY sanctioned live read — its post-assert
   proves no leak, and a leak silently 401s the whole suite.
4. Windows/Git Bash: forward slashes; git's CRLF warnings are noise but FILE line endings are law
   (`quiz-core.js`/`quiz.js`/`views/words.js`/`views/reader.js` are CRLF, `sw.js` LF — one
   normalisation turns the deploy's md5 proof into a whole-file hunt); `curl` needs
   `--ssl-no-revoke`; `vercel` via `"$(npm prefix -g)/vercel"`; Git Bash `/tmp` is NOT node's;
   never write scratch into the repo. core.autocrlf=true makes DISK endings unstable: checkout
   materialises CRLF, an Edit-tool insert CRLF'd a whole LF file, and `git diff` normalises so
   the damage is INVISIBLE to any git-based gate — edit LF files byte-preservingly (python
   `newline=''`) and verify endings with an `rb` byte count, never grep/`file`. GIT-MEDIATED
   COPIES TOO: `git archive`, `git stash`, a fresh clone or worktree re-apply autocrlf and
   silently flip EVERY file's endings — a byte comparison inside such a copy is meaningless;
   only the working tree you measured is evidence (measured live, word-trophies phase 1).
5. `npm test` = bare `node --test` + the contrast gate; every new test is a FLAT top-level
   `test()`; pin the exact cumulative ledger per step (298 at the phase-2 close = 293 flat + 5
   subtests in dev-server.test.js). Contrast anchor = `grep -c '^PASS'` = 52 (bare `PASS` gives
   53). `color-mix()` FABRICATES a contrast pass; a raw hex is invisible to the gate.
6. Validation chains: `set -o pipefail`; capture to variables, match with `case`; `LC_ALL=C sort`;
   `cmd | grep -q` SIGPIPEs under pipefail. Put the file-boundary check in the STEP's script.
7. Before touching a view/style/data file, grep `tests/` for exact-shape assertions (the `CACHE`
   string, the `PRECACHE` array, class names, Hebrew strings) — append beside a frozen thing,
   never replace it. Any precached-file change ships a `CACHE` bump the same phase (QZ-22).
8. HEBREW IS BIDI + ESCAPES COLLAPSE IN ANY TRANSPORT: never retype Hebrew and never copy it
   from terminal output — EXTRACT it from its source file by script. ANY backslash through ANY
   transport is at risk: `bash -e`, quoted heredocs, regex `\\d`, and JSON strings (an agent
   packet is JSON — `\uXXXX` in it DECODES to the raw glyph in transit; caused a false-positive
   audit, word-trophies phase 1: double the backslashes or ship evidence as byte counts). Write
   scripts to FILES and verify the WRITTEN BYTES (codepoint dump). In test files `\u` only.
9. A packet that NAMES a frozen contract without QUOTING it is a hole — and a frozen VALIDATION
   can itself be the bug: this run's three bad-specs (self-referential wrapper text, a
   forbidden-string tail, a probe fixture that could never validate) were each caught by a
   DIFFERENT layer, the last by the executor stop-rule. Honour the stop-rule; never "fix" a frozen
   script silently — escalate, rule, log.
10. DEPLOY: `vercel inspect` FIRST and record the id AND the url exactly as inspect reports it (a
    hand-constructed url once pointed at the WRONG deployment); deploy ONCE with output to a FILE
    (truncated output once caused a double deploy); md5 the WORKTREE vs live, never a git blob;
    recipe: `.oplan/word-audio/phase-state.md:55-66`.
11. VISUAL GATES ARE SELF-SERVED (owner directive): sandbox browser only, NEVER production; CHECK
    PORT 3000 FOR A STALE SERVER FIRST (one squatted with the wrong DATA_DIR and answered a
    probe); hard-reload past the stale localhost SW; restore the sandbox profile byte-from-backup
    and stop the server before recording the step.
12. A COPIED-IN SIGNED DOCUMENT carries wrapper text (header/tail) that becomes FALSE the moment
    it is copied — re-derive wrapper lines to state the post-copy truth; copy only the signed BODY.
