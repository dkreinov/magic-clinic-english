# Field guide — word-quiz (re-curated at the phase-3 → phase-4 boundary) (budget: 40 lines)

1. **A FORMAT GATE IS NOT A CONTENT GATE — bitten three times.** "Valid ADTS header" passed 36 silent
   clips; phase 1's gate had five holes while its suite passed with the data bank DELETED. Gate what
   the CHILD experiences — phase 3 gated `knownLemmaSet`, not `status`, because the set is what the
   story generator consumes. If a gate cannot see the failure, say so and add a human one.
2. **WHAT COUNTS AS EVIDENCE.** · A test never seen to FAIL is not evidence — run it against mutated
   code first. · Say which CAN fail first: byte-identity guards ("an old profile still validates",
   "a first tap adds no key") pass before the change too and were a third of every frozen assertion
   list this run. Report guards as guards. · **Derive the expected output BY HAND from the contract
   BEFORE the code exists, then diff it.** Deriving it from the implementation makes the gate
   circular, which is how phase 1 closed on a false assurance; phase 3's transcript was written
   before its handler and diffed empty. · Never verify against your own RE-IMPLEMENTATION, and note
   that anything reaching its subject through a TRANSFORM (`tokenize`, `resolveLemma`) fails OPEN.
3. **THE PROFILE IS LIVE — the one file holding everything she has collected.**
   · Production is Vercel Blob behind `APP_CODE`, unreadable from here. NEVER probe it.
   · `GET /api/profile` CREATES one when absent — a read that writes. Point `DATA_DIR` at a temp dir
     (`os.tmpdir()` from INSIDE node), then verify the real `.data/` stayed empty.
   · The only path that touches her file is load → `migrateWordKeys` → conditional save. That migrate
     SORTS keys and rebuilds, so a GET rewrites any profile not already in alphabetical key order;
     and on a merge it copies NAMED FIELDS ONLY — unnamed keys vanish.
   · `saveProfile` always moves `meta.updatedAt`: prove "nothing was written" by BYTE-comparing the
     file, never by comparing fields. `validateProfile` is never called at runtime.
   · `isAuthorized` returns TRUE only when `APP_CODE` is UNSET — and of the 8 test files copy-pasting
     `withTempDataDir`, only ONE deletes it; the rest 401 wherever it is exported.
4. Windows/Git Bash: forward slashes; CRLF warnings are noise; `curl` needs `--ssl-no-revoke`; npm
   global bin is off PATH (`"$(npm prefix -g)/<tool>"`). **Git Bash's `/tmp` is NOT node's** —
   `/c/Users/...` reaches node as `C:\c\Users\...`. Never write scratch into the repo.
5. `npm test` = bare `node --test`, and it also runs the contrast gate. Invariant: ZERO failures. The
   ledger stays checkable only if every new test is a FLAT top-level `test()` — `dev-server.test.js`'s
   5 subtests are why 252 files-worth prints as 257.
6. Validation chains: `set -o pipefail`; a stray `;` DETACHES the rest so `…-OK` prints over a broken
   build. **`cmd | grep -q` under pipefail is a trap** — `grep -q` SIGPIPEs the producer and fails the
   pipeline though every check passed; capture to a variable, match with `case`. Put the file-BOUNDARY
   check (`git status --porcelain`, minus `.oplan`) in the STEP's script, not only at the phase gate.
7. Before touching a view/style/data file, grep `tests/` for exact-shape assertions (the sw `CACHE`
   string, the exact `PRECACHE` array, class names, Hebrew strings) — append beside a frozen thing,
   never replace it. `PRECACHE` admits only first-party JS a precached file STATICALLY imports; data
   and audio stay OUT; any precached-file change needs a `CACHE` bump the same phase. The contrast
   gate sees only `:root` tokens: a raw hex is invisible, `color-mix()` FABRICATES a pass, and the
   anchor is `grep -c '^PASS'` = 52 (bare `grep -c PASS` returns 53 — that has cost a debug twice).
8. **HEBREW IS BIDI:** never anchor a patch, grep or heredoc on Hebrew copied from TERMINAL OUTPUT.
   Put frozen text in a FILE and `grep -qF -f` it.
9. **A packet that NAMES a frozen contract without QUOTING it is a hole** — the worker fills the gap
   instead of stopping. That includes shared-LOOKING test harnesses: quote them verbatim, since the
   step's file list will not permit reading their source. Hand validation over as a script FILE, and
   ask in the report what was read outside the packet. Phase 3's A3 and A4 were contradictions found
   only while WRITING the packets, after two full plan-review rounds had passed that plan.
10. DEPLOY: `"$(npm prefix -g)/vercel" deploy --prod --yes`, but `vercel inspect` FIRST to record the
    outgoing id+url — the only rollback target. Full recipe and rollback: the word-audio journal.
