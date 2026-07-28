# Plan — word-g1 (phase 1 in full; phases 2-3 skeletons)

Written 2026-07-28 by a fresh planner (Opus, files only), amended by the orchestrator
(step 1.4 flat-count 11/12 -> 8/9 — re-counted against the tree), pending plan review.

PHASE 1: G1 candidate engine — the `candidate` status, the promoter, and what she sees, deployed

GOAL: Make `docs/growth.md` the signed document of record, then build the G1 producer end to end:
`candidate` becomes a legal status, `migrateWordKeys` merges by trust (B4), `promoteToCandidate`
nominates quiet `learning` words with a hard 2-nomination cap (B5), `api/chapter.js` calls it on the
one path that already saves, and המילים שלי shows her a third badge `כמעט יודעת` while keeping the
claim button (B6 i/ii). Ends in a CACHE bump (QZ-22), a sanctioned D25 profile capture, a production
deploy, and her live data proven intact.

ACCEPTANCE CRITERIA (mechanical, re-runnable by the orchestrator from a clean tree)

1. `npm test` → `# pass 291` and `# fail 0`. The ledger moves 282 → **291**: exactly 9 new FLAT
   top-level `test()` calls (3 in `tests/profile-candidate-schema.test.js`, 4 in
   `tests/profile-promote-candidate.test.js`, 1 appended to `tests/api-chapter.test.js`, 1 appended
   to `tests/words-ui.test.js`). Baseline verified by the planner: 277 flat `^test(` + the 5 `t.test`
   subtests in `tests/dev-server.test.js:42-67` = 282.
2. `APP_CODE=dummy npm test` → `# pass 291` / `# fail 0`. (The two NEW test files are pure — they
   import `lib/profile.js` only and call no handler, so they need no gate; the appended
   `api-chapter` test MUST reuse that file's existing `withOpenGate` wrapper.)
3. `node scripts/check-contrast.mjs` exits 0, prints `ALL PASS`, and `grep -c '^PASS'` = **52**
   (never bare `grep -c PASS`, which returns 53 — field guide 7). No pair is added to
   `scripts/check-contrast.mjs`: the new badge deliberately reuses the already-proven pair
   `fg=--color-primary  bg=mix(--color-primary,18)` ("card icon on its plate").
4. `public/sw.js` line 1 is `const CACHE = "magic-vet-v16";` and
   `grep -rn 'magic-vet-v15' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.oplan .`
   returns nothing. `PRECACHE` is byte-unchanged.
5. `docs/growth.md` = the frozen 3-line SIGNED header + `.oplan/word-g1/design.md` lines 9-641
   byte-for-byte + the frozen 1-line closing STATUS note (637 lines; amended at intervention #1).
   No `AWAITING-OWNER-SIGN-OFF` and no `DRAFT-FOR-SIGNATURE` anywhere in it.
6. The phase's whole write set over `$BASE..HEAD` (`$BASE` = `git rev-parse HEAD` recorded by the
   orchestrator immediately before step 1.1) is EXACTLY these 10 files, zero deletions, `LC_ALL=C
   sort`:
   `api/chapter.js docs/growth.md lib/profile.js public/sw.js public/views/words.js
   tests/api-chapter.test.js tests/profile-candidate-schema.test.js
   tests/profile-promote-candidate.test.js tests/shell.test.js tests/words-ui.test.js`
   (plus `.oplan/**`, which is excluded from every changed-set check).
7. `.data/profile.json` absent; `git status --porcelain` empty after every step's commit; no byte of
   her profile anywhere inside the repo (backups live under `C:/Users/dkreinov/english-app-backups/`).
8. **THE DEPLOY IS PROVEN IN BYTES.** `git diff --name-only --diff-filter=ACMR 265dc86..HEAD --
   public/ | LC_ALL=C sort` = exactly `public/sw.js` + `public/views/words.js` (265dc86 is the commit
   whose `public/` bytes are live now — verified: that diff is empty at plan time). Both files md5
   live == **WORKTREE** (never a git blob: `public/views/words.js` is CRLF on disk). Live `/sw.js`
   contains `magic-vet-v16` and NOT `magic-vet-v15`. `/api/health` returns exactly
   `{"ok":true,"data":{"status":"up","version":1}}`. Unauthenticated `/api/chapter` → 401.
   The outgoing deployment id+url was recorded by `vercel inspect` BEFORE deploying.
9. **HER DATA IS INTACT (the only check ever run against her real data).** Post-deploy authenticated
   GET → 200; `validateProfile(live).ok`; live word-key count ≥ the capture's; set difference
   `capture \ live` EMPTY; and for every key in the capture:
   `live.status === backup.status` OR at least one of `taps`, `lastSeen`, `lastQuizAt`, `quizRight`,
   `quizWrong`, **`nominations`** differs. Additionally: every `learning` → `candidate` transition
   must satisfy `live.nominations === (backup.nominations ?? 0) + 1`; any other status change is
   REPORTED to the owner. Any violation → STOP, roll back code, owner.
10. **THE D25 CAPTURE EXISTS AND IS PROVEN** before the deploy: ≥200 bytes, parseable JSON, non-empty
    `words` map, `validateProfile(prof).ok`, prints `BACKUP OK bytes=… words=… known=…`. Only
    SHA-256 + counts are recorded in the workspace, never contents.
11. NON-MECHANICAL, stated as such (field guide 1, and self-served per the owner's process
    requirement 2 + field guide 12): the orchestrator's sandbox-browser verdict on the new badge —
    legible, distinguishable from יודעת/לומדת, RTL correct, claim button still present on a candidate
    row. Recorded verbatim in the journal. No browser ever on production.

DEPENDS ON

- `.oplan/word-g1/phase-state.md` — the run SEED: owner decisions of 2026-07-28, the phase cut, the
  frozen-contracts list, "every slice ends in a visible deploy".
- `.oplan/word-g1/design.md` (md5 `4fe040eb…`, byte-identical to
  `.oplan/word-quiz/night/growth-amended-DRAFT.md`) — the SIGNED spec: §5 the rule, §5.2 lifecycle,
  §8 B2-B7, §9 order, §10 what must not change, §12 sign-off.
- `.oplan/word-quiz/design.md` D18 (`WORD_STATUSES` becomes `['known','learning','candidate']`),
  D12/D13 (asymmetric trust), D24 (additive counters), D25 (capture before a new-field deploy),
  D27 (backup dir + the delete-at-close rider).
- `.oplan/word-quiz/journal.md` "PHASE 5 PLANNING" (~:1275) — the seven blockers' origin, and the
  verified fact that `promoteToCandidate` exists nowhere in `lib/ api/ public/ scripts/`.
- `.oplan/word-quiz/plan.md:1573-1594` — **the frozen APP_CODE subshell capture command** (steps 1.8
  and 1.10 reuse it verbatim); `:1512-1516` — the criterion-10 mechanical status rule this phase
  amends.
- `.oplan/word-quiz-reskin/phase-state.md` — tree state, live `dpl_HUjmYpAvumkWDXxsjkZiQzY7GRTn`
  (magic-vet-v15), canonical alias, rollback ladder, `background.test.js`/`shell.test.js` pins.
- `.oplan/word-audio/phase-state.md:55-66` — the frozen deploy recipe (field guide 10; the pointer in
  the other two docs is the corrected one).
- `.oplan/word-g1/field-guide/index.md` — 12 binding lessons.
- Code verified at plan time: `lib/profile.js:13,272,293-295,423,461` · `api/chapter.js:34,47,56` ·
  `public/quiz-core.js:50` · `public/views/words.js:117,155` · `public/quiz.js:171` ·
  `lib/vocab.js:baseForms/tokenize` · `lib/story.js:134,227-235` · `public/sw.js:1-16` ·
  `scripts/check-contrast.mjs` PAIRS (52).

SKELETON CHANGES (how reality differs from the seed's slice description, and why)

1. **HEAD is 35d1ebe, not 2cca28e** as `phase-state.md:63` says (two `.oplan` commits landed after
   the seed was written). `public/` is byte-unchanged since 265dc86, which is what matters — verified.
   Three `.oplan/word-g1/` files are still UNTRACKED; the orchestrator must commit them and record
   `$BASE` before dispatching 1.1, or every changed-set check is noisy.
2. **The growth.md header cannot be copied verbatim.** The signed source's lines 1-8 read
   `STATUS: DRAFT-FOR-SIGNATURE` and a blockquote saying "this file is a PROPOSAL … `docs/growth.md`
   is unchanged and still reads AWAITING-OWNER-SIGN-OFF". Copying those into `docs/growth.md` would
   freeze a false statement into the design of record — the exact failure B1 exists to prevent
   (journal, PHASE 5 PLANNING). Step 1.1 therefore replaces lines 1-8 with a frozen 3-line SIGNED
   header and copies lines 9-643 byte-for-byte. Flagged under RECORD GAPS.
3. **The call site moves a few lines.** §5.1 says "immediately after `loadProfile()`"; the two guards
   at `api/chapter.js:37-45` return 400 WITHOUT saving, so a nomination computed above them is thrown
   away on every rejected request. `promoteToCandidate(p)` therefore goes immediately before
   `generateChapter` (line 47) — still "before generateChapter", still no new load or save, and it
   cannot affect the generated chapter because `buildAllowedSet` reads `knownLemmaSet`, which tests
   `status === 'known'` exactly.
4. **B5 splits across phases.** The `nominations` counter, its cap, its validator and its `max` merge
   are PHASE 1 (they live in `promoteToCandidate` / `migrateWordKeys`). The *clock reset*
   (`lastSeen = now` on demotion) is PHASE 2, because the only thing that can demote a candidate is
   B2's one-wrong branch, which the owner put in slice (b). In phase 1 nothing demotes a candidate,
   so the promote/fail/promote loop B5 guards cannot exist yet.
5. **`applyQuizAnswer`'s candidate branch is PHASE 2**, not phase 1 — `pickQuizWords`
   (`public/quiz-core.js:52`) filters `status === 'known'` exactly and is frozen (QZ-17), so in phase
   1 a candidate can never be asked and the branch would be unreachable code with no test that could
   fail honestly. It ships in slice (b) alongside the new selection export that makes it reachable.
6. **Criterion 9's status rule had to be amended.** The word-quiz criterion-10 rule
   (`plan.md:1512-1516`) fails a status change with no activity-field delta — but a G1 nomination
   changes `status` and `nominations` and nothing else. `nominations` is added to the activity list
   and a stricter `learning→candidate ⇒ nominations+1` clause is frozen. Without this the phase's own
   success would trip its own alarm.
7. **The badge colour is not in the record.** `--color-primary` at 18% over `--color-card` is chosen
   because it is the one remaining brand token AND that exact pair is already row 19 of
   `check-contrast.mjs` — so the anchor stays 52 with no change to the gate. It is an owner-taste
   item put to the self-served visual gate at 1.7.

---

### STEP 1.1: `docs/growth.md` becomes the signed document of record  [tier: WORKER]

goal: `docs/growth.md` holds the SIGNED amendment: a frozen 3-line header, then
  `.oplan/word-g1/design.md` lines 9-641 byte-for-byte, then a frozen 1-line closing STATUS
  note replacing the source's self-referential 2-line note (lines 642-643). The suite does not
  move. [AMENDED at intervention #1 — the source's line 643 contains the literal string
  AWAITING-OWNER-SIGN-OFF, which the negative check rightly forbids; the executor stopped on
  the contradiction. The closing note, like the header, is wrapper text about the pre-copy
  world, not signed content.]

files (modify only): `docs/growth.md`

commands: none — direct file edits. (Copy the source text from `.oplan/word-g1/design.md`; do NOT
  retype it. The file is LF-only and UTF-8 — do not convert line endings.)

validation (frozen; run from the repo root in Git Bash):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
node -e '
const fs = require("fs");
const doc = fs.readFileSync("docs/growth.md", "utf8").split("\n");
const src = fs.readFileSync(".oplan/word-g1/design.md", "utf8").split("\n");
const HEAD = [
  "# Growth Design: how the app grows with her \u2014 AMENDED",
  "",
  "STATUS: SIGNED 2026-07-28 by the owner (section 12). Copied verbatim from the signed source .oplan/word-quiz/night/growth-amended-DRAFT.md (from its line 9 on) by the word-g1 run."
].join("\n");
const TAIL = "STATUS note: this document is now SIGNED. The word-g1 run copied it over docs/growth.md on 2026-07-28; this file IS the signed document of record.";
if (doc.slice(0, 3).join("\n") !== HEAD) { console.log("FAIL: header block"); process.exit(1); }
if (doc.slice(3, 636).join("\n") !== src.slice(8, 641).join("\n")) { console.log("FAIL: body != signed source lines 9-641"); process.exit(1); }
if (doc[636] !== TAIL) { console.log("FAIL: closing STATUS note"); process.exit(1); }
if (doc.length !== 638 || doc[637] !== "") { console.log("FAIL: trailing shape"); process.exit(1); }
const whole = doc.join("\n");
if (whole.indexOf("AWAITING-OWNER-SIGN-OFF") >= 0) { console.log("FAIL: AWAITING-OWNER-SIGN-OFF survives"); process.exit(1); }
if (whole.indexOf("DRAFT-FOR-SIGNATURE") >= 0) { console.log("FAIL: DRAFT-FOR-SIGNATURE survives"); process.exit(1); }
console.log("GROWTH-BODY-OK");
' || exit 1
lines=$(wc -l < docs/growth.md); [ "$lines" = "637" ] || { echo "FAIL: $lines lines, expected 637"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 282"*) ;; *) echo "FAIL: ledger not 282"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "docs/growth.md " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-1.1-OK
```

contracts (FROZEN, quoted verbatim):
  Lines 1-3 of the new `docs/growth.md` are EXACTLY these three lines (line 1's dash is an EM DASH
  U+2014, copied from `.oplan/word-g1/design.md` line 1 — not a hyphen; line 2 is empty):
  ```
  # Growth Design: how the app grows with her — AMENDED

  STATUS: SIGNED 2026-07-28 by the owner (section 12). Copied verbatim from the signed source .oplan/word-quiz/night/growth-amended-DRAFT.md (from its line 9 on) by the word-g1 run.
  ```
  Lines 4-636 = `.oplan/word-g1/design.md` lines 9-641, unmodified, in order. Line 4 is
  therefore EMPTY and line 5 is
  `## What changed from the unsigned version and why (read this first)`; line 636 is the
  `Signed: the owner, via chat ("Q2. accept"), …` line.
  Line 637 (the last line, single trailing newline after it) is EXACTLY:
  ```
  STATUS note: this document is now SIGNED. The word-g1 run copied it over docs/growth.md on 2026-07-28; this file IS the signed document of record.
  ```
  Discarded: source lines 1-8 (title, blank, `STATUS: DRAFT-FOR-SIGNATURE`, blank, the four-line
  `>` blockquote beginning `> This file is a PROPOSAL for what`) and source lines 642-643 (the
  old 2-line STATUS note, which described the pre-copy world and contains the forbidden string).

non-goals: `.oplan/word-g1/design.md` and `.oplan/word-quiz/night/growth-amended-DRAFT.md` are the
  SIGNED SOURCE — never edit either · `design.md` (project root) and `docs/visual-design.md` stay
  FROZEN (§10) · no code, no tests, no test-count change (282) · do not reflow, re-wrap, spell-fix or
  "improve" any line of the copied body, including the ones that read oddly out of context ·
  do not touch `docs/owner-handoff.md`.

tier: WORKER — a mechanical copy with a frozen 3-line header.

depends on: the orchestrator having committed the untracked `.oplan/word-g1/` files and recorded
  `$BASE = git rev-parse HEAD` in the journal. Nothing else.

---

### STEP 1.2: `candidate` becomes legal; B4 merge precedence; the `nominations` field  [tier: WORKER]

goal: `validateProfile` accepts `status: 'candidate'` and an optional non-negative-integer
  `nominations`; `migrateWordKeys` merges status by trust rank `known > candidate > learning` and
  merges `nominations` with `max`, staying idempotent and never inventing a key.

files: `lib/profile.js` (modify), `tests/profile-candidate-schema.test.js` (create)

commands: none — direct file edits.

validation (frozen):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
need() { n=$(grep -cF "$2" "$1") || n=0; [ "$n" -ge 1 ] || { echo "FAIL: missing in $1: $2"; exit 1; }; }
absent() { n=$(grep -cF "$2" "$1") || n=0; [ "$n" = "0" ] || { echo "FAIL: still present in $1: $2"; exit 1; }; }
need   lib/profile.js "const WORD_STATUSES = ['known', 'learning', 'candidate'];"
need   lib/profile.js "const STATUS_RANK = ['learning', 'candidate', 'known'];"
need   lib/profile.js "if (STATUS_RANK.indexOf(entry.status) > STATUS_RANK.indexOf(existing.status)) {"
need   lib/profile.js "existing.nominations = Math.max(existing.nominations ?? 0, entry.nominations ?? 0);"
need   lib/profile.js "expected a non-negative integer"
absent lib/profile.js "if (entry.status === 'known') existing.status = 'known';"
absent lib/profile.js "const WORD_STATUSES = ['known', 'learning'];"
flat=$(grep -c '^test(' tests/profile-candidate-schema.test.js) || flat=0
[ "$flat" = "3" ] || { echo "FAIL: expected 3 flat top-level tests, got $flat"; exit 1; }
sub=$(grep -c 't\.test(' tests/profile-candidate-schema.test.js) || sub=0
[ "$sub" = "0" ] || { echo "FAIL: subtests are forbidden (the ledger)"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 285"*) ;; *) echo "FAIL: ledger not 285"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 285"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 285"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "lib/profile.js tests/profile-candidate-schema.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-1.2-OK
```

contracts (FROZEN, verbatim — five edits, nothing else in `lib/profile.js` moves):

(a) line 13 becomes exactly (D18's order, quoted from `.oplan/word-quiz/design.md`: "`WORD_STATUSES`
    becomes `['known','learning','candidate']`"):
```js
const WORD_STATUSES = ['known', 'learning', 'candidate'];
```
(b) immediately after line 14 (`const WORD_SOURCES = …`), insert:
```js
// B4 (docs/growth.md section 8): merge precedence, LOWEST trust first.
// known > candidate > learning -- a merge must never discard a verdict she or
// the quiz produced. An unrecognised status ranks -1 and never wins.
const STATUS_RANK = ['learning', 'candidate', 'known'];
```
(c) in `validateProfile`, immediately after the `quizWrong` block that ends at line 158, insert:
```js
        if ('nominations' in entry) {
          if (!(Number.isInteger(entry.nominations) && entry.nominations >= 0)) {
            errors.push(`${path}.nominations: expected a non-negative integer`);
          }
        }
```
(d) in `migrateWordKeys`, line 272 — `if (entry.status === 'known') existing.status = 'known';` —
    becomes exactly:
```js
    if (STATUS_RANK.indexOf(entry.status) > STATUS_RANK.indexOf(existing.status)) {
      existing.status = entry.status;
    }
```
(e) in `migrateWordKeys`, immediately after the `strikes` merge block (lines 293-295), insert — the
    same "never add a key neither side carried" shape as `strikes`:
```js
    if ('nominations' in existing || 'nominations' in entry) {
      existing.nominations = Math.max(existing.nominations ?? 0, entry.nominations ?? 0);
    }
```

  `tests/profile-candidate-schema.test.js` — EXACTLY three FLAT top-level `test()` calls, no
  `describe`, no `t.test`, no handler call, no `DATA_DIR`, no `APP_CODE`; imports only
  `{ validateProfile, migrateWordKeys, defaultProfile }` from `../lib/profile.js`:
  1. `test('validateProfile accepts candidate status and an optional nominations integer, and rejects a bad one', …)`
     — a profile whose word entry is `{status:'candidate', source:'tap', he:null, taps:1,
     firstSeen, lastSeen, nominations:1}` validates; `nominations: -1` and `nominations: 1.5` and
     `nominations: '1'` each produce an error containing `nominations: expected a non-negative integer`;
     `status: 'bogus'` still fails.
  2. `test('migrateWordKeys merges status by rank known > candidate > learning and nominations by max', …)`
     — with `allowedSet = new Set(['feel'])`: `{feel:{status:'learning',nominations:1,…},
     feels:{status:'candidate',nominations:2,…}}` merges to `feel.status === 'candidate'` and
     `feel.nominations === 2`; the reverse ordering gives the same result (rank, not position);
     a `known` side always wins over `candidate`; running the function a SECOND time on its own
     output changes nothing (`JSON.stringify` equality — idempotence).
  3. `test('a pre-G1 profile still validates and gains no new key', …)` — **THIS IS A GUARD, not
     evidence** (field guide 2: it passes before the change too). A word entry with no
     `nominations` and `status:'learning'` validates, and after `migrateWordKeys` with no merge the
     entry still has no `nominations` key (`'nominations' in entry === false`).

  FAIL-FIRST, required before reporting: after implementing, mutate (d) to
  `if (entry.status === 'known') existing.status = 'known';` and confirm test 2 FAILS; mutate (e)
  to `Math.min` and confirm test 2 FAILS; revert both byte-identically. Paste both failing summary
  lines in the report.

non-goals: `promoteToCandidate` (that is 1.3) · `applyQuizAnswer` — the QZ-12 `known` rows stay
  byte-frozen, no candidate branch in this phase · `applyWordTap` · `markWordKnown` ·
  `defaultProfile` · `WORD_SOURCES` · any file under `public/`, `api/`, `scripts/` · touching any
  existing test file · exporting `STATUS_RANK` · reordering `WORD_STATUSES`.

tier: WORKER — five quoted edits and one new pure test file.

depends on: 1.1 committed (the changed-set check needs a clean start).

---

### STEP 1.3: `promoteToCandidate` — the G1 rule, with the B5 cap  [tier: WORKER]

goal: `lib/profile.js` exports a pure `promoteToCandidate(profile)` that turns a `learning` word into
  a `candidate` once it has appeared in ≥2 chapters generated after that word's `lastSeen`, capped at
  2 automatic nominations per word, touching nothing else.

files: `lib/profile.js` (modify), `tests/profile-promote-candidate.test.js` (create)

commands: none — direct file edits.

validation (frozen):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
need() { n=$(grep -cF "$2" "$1") || n=0; [ "$n" -ge 1 ] || { echo "FAIL: missing in $1: $2"; exit 1; }; }
need lib/profile.js "import { tokenize, baseForms } from './vocab.js';"
need lib/profile.js "export const KNOWN_AFTER_QUIET_CHAPTERS = 2;"
need lib/profile.js "export const MAX_AUTO_NOMINATIONS = 2;"
need lib/profile.js "export function promoteToCandidate(profile) {"
node -e '
import("./lib/profile.js").then((m) => {
  const p = { words: { dragon: { status: "learning", source: "tap", he: null, taps: 1, firstSeen: "2026-01-01T00:00:00.000Z", lastSeen: "2026-01-01T00:00:00.000Z" } },
              story: { chapters: [ { text: "The dragons came.", generatedAt: "2026-02-01T00:00:00.000Z" },
                                   { text: "A dragon slept.",  generatedAt: "2026-03-01T00:00:00.000Z" } ] } };
  m.promoteToCandidate(p);
  const e = p.words.dragon;
  if (e.status !== "candidate" || e.nominations !== 1) { console.log("FAIL: live probe " + JSON.stringify(e)); process.exit(1); }
  const before = JSON.stringify(p);
  m.promoteToCandidate(p);
  if (JSON.stringify(p) !== before) { console.log("FAIL: not idempotent"); process.exit(1); }
  console.log("PROMOTE-PROBE-OK");
}).catch((err) => { console.log("FAIL: " + err.message); process.exit(1); });
' || exit 1
flat=$(grep -c '^test(' tests/profile-promote-candidate.test.js) || flat=0
[ "$flat" = "4" ] || { echo "FAIL: expected 4 flat top-level tests, got $flat"; exit 1; }
sub=$(grep -c 't\.test(' tests/profile-promote-candidate.test.js) || sub=0
[ "$sub" = "0" ] || { echo "FAIL: subtests are forbidden (the ledger)"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 289"*) ;; *) echo "FAIL: ledger not 289"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 289"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 289"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "lib/profile.js tests/profile-promote-candidate.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-1.3-OK
```

contracts (FROZEN, verbatim — two edits to `lib/profile.js`):

(a) directly under line 1 (`import { resolveLemma } from '../public/lemma.js';`) add:
```js
import { tokenize, baseForms } from './vocab.js';
```
(b) append to the END of the file, after `applyQuizAnswer`, EXACTLY:
```js
// G1 (docs/growth.md section 5). A word she tapped and then met again -- in
// chapters generated AFTER that tap -- becomes a CANDIDATE: a status no story
// generator reads (knownLemmaSet counts only 'known'). Pure: no I/O, no clock.
// B5: at most MAX_AUTO_NOMINATIONS automatic nominations per word; after that
// only her own claim can promote it. Idempotent by construction.
export const KNOWN_AFTER_QUIET_CHAPTERS = 2;
export const MAX_AUTO_NOMINATIONS = 2;

export function promoteToCandidate(profile) {
  if (!profile || !isPlainObject(profile.words)) return profile;
  const chapters =
    profile.story && Array.isArray(profile.story.chapters) ? profile.story.chapters : [];
  if (chapters.length === 0) return profile;

  // Same matcher coverageAgainst uses, and the same normalisation verifyChapter
  // applies (lib/story.js:134): curly apostrophes folded, possessive 's dropped.
  const chapterForms = chapters.map((ch) => {
    const forms = new Set();
    if (!ch || typeof ch.text !== 'string') return forms;
    const normalized = ch.text.replace(/[\u2018\u2019]/g, "'").replace(/'s\b/g, '');
    for (const token of tokenize(normalized)) {
      for (const b of baseForms(token)) forms.add(b);
    }
    return forms;
  });

  for (const [lemma, entry] of Object.entries(profile.words)) {
    if (!isPlainObject(entry)) continue;
    if (entry.status !== 'learning') continue;
    if ((entry.nominations ?? 0) >= MAX_AUTO_NOMINATIONS) continue;
    const lastSeen = Date.parse(entry.lastSeen);
    if (Number.isNaN(lastSeen)) continue;

    let quiet = 0;
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const generatedAt = ch ? Date.parse(ch.generatedAt) : NaN;
      if (Number.isNaN(generatedAt)) continue;
      if (generatedAt <= lastSeen) continue;
      if (chapterForms[i].has(lemma)) quiet += 1;
    }

    if (quiet >= KNOWN_AFTER_QUIET_CHAPTERS) {
      entry.status = 'candidate';
      entry.nominations = (entry.nominations ?? 0) + 1;
    }
  }

  return profile;
}
```
  Frozen rule text it implements, from the SIGNED §5.1: *"a word with `status === 'learning'` is
  promoted to `status: 'candidate'` (keeping its existing `source`) once it has appeared — matched
  via `baseForms`, the same matcher `coverageAgainst` already uses — in at least
  `KNOWN_AFTER_QUIET_CHAPTERS = 2` chapters whose `generatedAt` is later than that word's
  `lastSeen`."* Frozen readings: only `chapter.text` is scanned (never `title`, `cliffhanger`,
  `glossary`, `questions`); strictly later means `generatedAt > lastSeen`; a chapter with an
  unparseable or missing `generatedAt` is skipped (safe direction); no `source` filter.

  `tests/profile-promote-candidate.test.js` — EXACTLY four FLAT top-level `test()` calls, pure
  (imports only from `../lib/profile.js` and `../lib/vocab.js`; no handler, no `DATA_DIR`, no
  `APP_CODE`):
  1. `test('two chapters generated after lastSeen promote a learning word; one is not enough', …)`
     — the POSITIVE and its NEGATIVE control in one place (field guide 2): with two qualifying
     chapters `status === 'candidate'` and `nominations === 1`; with ONE qualifying chapter the entry
     is untouched — `status === 'learning'` and `'nominations' in entry === false`.
  2. `test('inflected chapter forms match, and chapters generated before lastSeen never count', …)`
     — `dragons`/`dragon` and `camping`/`camp` count; two chapters whose `generatedAt` is EARLIER
     than `lastSeen` promote nothing; a chapter with `generatedAt` missing promotes nothing.
  3. `test('promoteToCandidate never touches known or candidate words and never enters knownLemmaSet', …)`
     — a `known` word and an existing `candidate` word, both meeting the chapter condition, are
     returned byte-identical (`JSON.stringify` equality); and after promoting a learning word,
     `knownLemmaSet(profile)` (from `../lib/vocab.js`) does NOT contain it. This is the gate the
     child actually experiences (field guide 1): the set the story generator consumes.
  4. `test('automatic nominations stop at MAX_AUTO_NOMINATIONS and the function is idempotent', …)`
     — an entry with `nominations: 2` and `status:'learning'` meeting the condition is NOT promoted;
     an entry with `nominations: 1` IS promoted to `nominations: 2`; calling the function twice in a
     row on any fixture produces `JSON.stringify`-identical output.

  FAIL-FIRST, required before reporting: (i) set `KNOWN_AFTER_QUIET_CHAPTERS = 1` → test 1's negative
  half must FAIL; (ii) change `generatedAt <= lastSeen` to `generatedAt < lastSeen` … then to
  `false` (i.e. remove the guard) → test 2 must FAIL; (iii) remove the
  `>= MAX_AUTO_NOMINATIONS` guard → test 4 must FAIL. Revert each byte-identically and paste the
  three failing summary lines.

non-goals: `api/chapter.js` (that is 1.4) · any UI file · `applyQuizAnswer` (no candidate branch in
  this phase) · `applyWordTap` (a tap on a candidate does NOT demote it — §5.2 shows candidate →
  learning only via a failed quiz) · resetting `lastSeen` anywhere (that is phase 2's demotion
  branch) · reading or writing `story.checkLog` (that is G2) · `evaluateBand` · exporting anything
  else · touching `lib/vocab.js` or `lib/story.js` · any existing test file.

tier: WORKER — one quoted function plus a pure test file with hand-written fixtures.

depends on: 1.2 committed (`candidate` must already be a legal status).

---

### STEP 1.4: the call site — `api/chapter.js` nominates on every generation  [tier: WORKER]

goal: Every successful chapter generation runs G1 exactly once, on the profile already in memory and
  about to be saved, and the promotion survives into the stored file.

files: `api/chapter.js` (modify), `tests/api-chapter.test.js` (append one test)

commands: none — direct file edits.

validation (frozen):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
need() { n=$(grep -cF "$2" "$1") || n=0; [ "$n" -ge 1 ] || { echo "FAIL: missing in $1: $2"; exit 1; }; }
need api/chapter.js "import { defaultProfile, promoteToCandidate } from '../lib/profile.js';"
need api/chapter.js "  promoteToCandidate(p);"
order=$(awk '/promoteToCandidate\(p\);/{a=NR} /const r = await generateChapter/{b=NR} END{print (a>0 && b>0 && a<b) ? "OK" : "BAD"}' api/chapter.js)
[ "$order" = "OK" ] || { echo "FAIL: promoteToCandidate must be called BEFORE generateChapter"; exit 1; }
flat=$(grep -c '^test(' tests/api-chapter.test.js) || flat=0
[ "$flat" = "9" ] || { echo "FAIL: api-chapter.test.js should hold 9 flat tests (8 + 1), got $flat"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 290"*) ;; *) echo "FAIL: ledger not 290"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 290"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 290"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "api/chapter.js tests/api-chapter.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-1.4-OK
```
  (`flat` = 9: the orchestrator re-counted 8 flat `^test(` in `tests/api-chapter.test.js` at plan
  review — the planner had written 11/12; AMENDED at plan time, logged in the journal. If the
  pre-edit count is not 8, STOP and report — do not adjust the number.)

contracts (FROZEN, verbatim — two edits to `api/chapter.js`):

(a) line 3 becomes exactly:
```js
import { defaultProfile, promoteToCandidate } from '../lib/profile.js';
```
(b) immediately BEFORE line 47 (`  const r = await generateChapter({ profile: p, band1, band2, chat: chatJSON });`)
    insert exactly these four lines:
```js
  // G1 (docs/growth.md section 5). The profile is already loaded here and is
  // about to be saved below, so no new load or save is needed. A candidate is
  // invisible to buildAllowedSet, so this cannot change the chapter generated.
  promoteToCandidate(p);

```
  Placement is deliberate and frozen: AFTER the `placement required` / `learner required` guards
  (lines 37-45), which return 400 without saving, and BEFORE `generateChapter`.

  New test, appended at the END of `tests/api-chapter.test.js`, exactly one FLAT top-level `test()`,
  wrapped in that file's EXISTING helpers (do not redefine them; they are already in the file at
  lines 23-47):
  `test('POST generate promotes a quiet learning word to candidate and saves it', async () => {`
  body shape, frozen:
  ```js
  await withOpenGate(() => withTempDataDir(async () => {
    const p = defaultProfile();
    p.placement.completed = true;
    p.learner.heroineName = 'מיקה';
    p.learner.petName = 'לונה';
    p.words.dragon = {
      status: 'learning', source: 'tap', he: null, taps: 1,
      firstSeen: '2026-01-01T00:00:00.000Z', lastSeen: '2026-01-01T00:00:00.000Z',
    };
    p.story.chapters = [
      { n: 1, text: 'The dragon came.',  generatedAt: '2026-02-01T00:00:00.000Z' },
      { n: 2, text: 'The dragons slept.', generatedAt: '2026-03-01T00:00:00.000Z' },
    ];
    await saveProfile(p);

    setTransport(async () => goodChapterFixture());
    try {
      const req = createPostReq({ action: 'generate' });
      const res = createMockRes();
      await chapterHandler(req, res);
      assert.strictEqual(res.statusCode, 200);
      const stored = await loadProfile();
      assert.strictEqual(stored.words.dragon.status, 'candidate');
      assert.strictEqual(stored.words.dragon.nominations, 1);
      assert.strictEqual(stored.story.chapters.length, 3);
    } finally {
      resetTransport();
    }
  }));
  ```
  FAIL-FIRST, required: comment out `promoteToCandidate(p);` and confirm ONLY this new test fails;
  restore byte-identically and paste both summary lines.

non-goals: no other line of `api/chapter.js` moves — not the guards, not `saveProfile`, not the
  response envelope · no second call site (`api/profile.js` is NOT a G1 call site in this phase) ·
  no `evaluateBand` · no change to any existing test in `api-chapter.test.js` · do not add
  `withOpenGate`/`withTempDataDir` definitions (they exist) · no UI file.

tier: WORKER — one import, one call, one test in an established pattern.

depends on: 1.3 committed.

---

### STEP 1.5: what she SEES — the third badge and the surviving claim button (B6 i/ii)  [tier: WORKER]

goal: A `candidate` row in המילים שלי shows the badge `כמעט יודעת` in its own colour and STILL offers
  the יודעת את זה button; `known` and `learning` rows are byte-unchanged.

files: `public/views/words.js` (modify), `tests/words-ui.test.js` (append one test)

commands: none — direct file edits.

validation (frozen; Hebrew is matched via `\u` escapes so no BiDi text is ever anchored on — field
guide 8):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
node -e '
import("./public/views/words.js").then((m) => {
  const ALMOST = "\u05DB\u05DE\u05E2\u05D8 \u05D9\u05D5\u05D3\u05E2\u05EA";
  const KNOWN  = "\u05D9\u05D5\u05D3\u05E2\u05EA";
  const LEARN  = "\u05DC\u05D5\u05DE\u05D3\u05EA";
  const words = {
    aaa: { status: "candidate", he: "x", taps: 1, lastSeen: "2026-01-03T00:00:00.000Z" },
    bbb: { status: "learning",  he: "x", taps: 1, lastSeen: "2026-01-02T00:00:00.000Z" },
    ccc: { status: "known",     he: "x", taps: 1, lastSeen: "2026-01-01T00:00:00.000Z" }
  };
  const html = m.renderList(words, null);
  const a = html.slice(html.indexOf("aaa"), html.indexOf("bbb"));
  const c = html.slice(html.indexOf("ccc"));
  const fail = (why) => { console.log("FAIL: " + why); process.exit(1); };
  if (a.indexOf("word-badge candidate") < 0) fail("no candidate badge class");
  if (a.indexOf(ALMOST) < 0) fail("no almost-knows badge text");
  if (a.indexOf("data-lemma=\"aaa\"") < 0) fail("claim button missing on a candidate row (B6 ii)");
  if (c.indexOf("data-lemma=\"ccc\"") >= 0) fail("claim button appeared on a known row");
  if (c.indexOf(">" + KNOWN + "<") < 0) fail("known badge changed");
  if (html.indexOf(">" + LEARN + "<") < 0) fail("learning badge changed");
  console.log("BADGE-PROBE-OK");
}).catch((e) => { console.log("FAIL: " + e.message); process.exit(1); });
' || exit 1
need() { n=$(grep -cF "$2" "$1") || n=0; [ "$n" -ge 1 ] || { echo "FAIL: missing in $1: $2"; exit 1; }; }
need public/views/words.js ".word-badge.candidate {"
need public/views/words.js "color-mix(in srgb, var(--color-primary) 18%, var(--color-card))"
crlf=$(file public/views/words.js); case "$crlf" in *CRLF*) ;; *) echo "FAIL: words.js line endings were normalised"; exit 1;; esac
cg=$(node scripts/check-contrast.mjs) || { echo "FAIL: contrast gate exit"; exit 1; }
p=$(printf "%s\n" "$cg" | grep -c '^PASS') || p=0
[ "$p" = "52" ] || { echo "FAIL: contrast anchor $p, expected 52"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 291"*) ;; *) echo "FAIL: ledger not 291"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 291"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 291"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/views/words.js tests/words-ui.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-1.5-OK
```

contracts (FROZEN, verbatim — three edits to `public/views/words.js`):

(a) `statusBadge` (lines 117-122) becomes exactly:
```js
function statusBadge(status) {
  if (status === "known") {
    return `<span class="word-badge known">יודעת</span>`;
  }
  if (status === "candidate") {
    return `<span class="word-badge candidate">כמעט יודעת</span>`;
  }
  return `<span class="word-badge learning">לומדת</span>`;
}
```
  The new Hebrew string is `כמעט יודעת` = code points
  `\u05DB\u05DE\u05E2\u05D8\u0020\u05D9\u05D5\u05D3\u05E2\u05EA` — the owner-accepted B6(i) text,
  verified byte-present in `.oplan/word-g1/design.md` §8 B6 and §12. COPY IT FROM THAT FILE. Never
  retype it and never copy Hebrew out of terminal output (field guide 8).

(b) the claim-button expression (lines 154-157) becomes exactly:
```js
      const knowHtml =
        entry.status === "learning" || entry.status === "candidate"
          ? `<button class="btn-know" type="button" data-action="know" data-lemma="${escapeHtml(lemma)}">יודעת את זה</button>`
          : "";
```
  Frozen reason, from the SIGNED §8 B6(ii): *"D13 says her claim outranks the app's guess; hiding the
  button would turn the app's guess into a barrier to her own claim, which inverts the design.
  `markWordKnown` already handles the transition and clears the strike fields, so no new endpoint is
  needed."*

(c) in `VIEW_STYLE`, immediately after the `.word-badge.learning { … }` rule (ends line 81), append:
```css
  .word-badge.candidate {
    background: color-mix(in srgb, var(--color-primary) 18%, var(--color-card));
    color: var(--color-primary);
  }
```
  This pair is ALREADY row 19 of `scripts/check-contrast.mjs`
  (`fg: --color-primary, bg: {mix: --color-primary, pct: 18}`, min 4.5) — so the anchor stays 52 and
  the gate file is NOT edited. Do not introduce a raw hex here; do not add a pair to the gate.

  New test, appended at the END of `tests/words-ui.test.js`, exactly one FLAT top-level `test()`:
  `test('a candidate row shows the almost-knows badge and keeps the claim button', …)` — builds the
  same three-row fixture as the probe above via the already-imported `renderList`, and asserts:
  the candidate slice contains `word-badge candidate` and the badge text; the candidate slice
  contains `data-lemma=` for its own key; the KNOWN row does NOT (negative control); the known and
  learning badge texts still render. Hebrew literals in the test file are written with `\u` escapes,
  not pasted characters.

  FAIL-FIRST, required: delete the `candidate` branch of `statusBadge` and confirm ONLY the new test
  fails; restore; then change (b) back to `entry.status === "learning"` alone and confirm ONLY the
  new test fails; restore byte-identically. Paste both summary lines.

non-goals: `public/quiz.js` — the softer miss-line `עוד לא — נמשיך ללמוד את המילה הזאת` is B6(iii)
  and belongs to PHASE 2 with the demotion that triggers it; QZ-18's text-node order is untouched
  this phase · `public/quiz-core.js` — `pickQuizWords`/`knownSetFromProfile` stay frozen (QZ-17),
  candidates are NOT quizzed in this phase · `renderQuizLauncher`, `markKnownBody`, the sort order,
  the empty state, `boot()`/`bindEvents()` · `scripts/check-contrast.mjs` (the 52 anchor) ·
  `public/styles.css` · `public/sw.js` (that is 1.6) · **do not let an editor convert
  `public/views/words.js` from CRLF to LF** — it is CRLF on disk and a normalisation makes the
  deploy's md5 enumeration a whole-file diff.

tier: WORKER — three quoted edits and one test in the file's established pattern.

depends on: 1.4 committed.

---

### STEP 1.6: CACHE bump `magic-vet-v15` → `magic-vet-v16` — LAST code change  [tier: WORKER]

goal: QZ-22 satisfied: one CACHE bump, after every precached file this phase touches
  (`/views/words.js` is in `PRECACHE`), so her phone actually receives the new badge.

files: `public/sw.js` (modify), `tests/shell.test.js` (modify)

commands: none — direct file edits.

validation (frozen):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
first=$(head -1 public/sw.js)
[ "$first" = 'const CACHE = "magic-vet-v16";' ] || { echo "FAIL: sw.js line 1 = [$first]"; exit 1; }
stale=$(grep -rln 'magic-vet-v15' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.oplan . | tr '\n' ' ')
[ -z "$stale" ] || { echo "FAIL: magic-vet-v15 survives in: $stale"; exit 1; }
n=$(grep -cF "assert.ok(sw.includes('magic-vet-v16'));" tests/shell.test.js) || n=0
[ "$n" = "1" ] || { echo "FAIL: shell.test.js does not pin v16"; exit 1; }
node -e '
const s = require("fs").readFileSync("public/sw.js", "utf8");
const m = s.match(/PRECACHE\s*=\s*(\[[\s\S]*?\])/);
if (!m) { console.log("FAIL: no PRECACHE array"); process.exit(1); }
const a = JSON.parse(m[1]);
const want = ["/","/styles.css","/app.js","/api.js","/lemma.js","/words-index.js","/quiz-core.js","/quiz.js","/views/home.js","/views/placement.js","/views/reader.js","/views/words.js","/manifest.webmanifest","/icons/icon.svg"];
if (JSON.stringify(a) !== JSON.stringify(want)) { console.log("FAIL: PRECACHE changed"); process.exit(1); }
console.log("PRECACHE-FROZEN-OK");
' || exit 1
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 291"*) ;; *) echo "FAIL: ledger not 291"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/sw.js tests/shell.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-1.6-OK
```

contracts (FROZEN, verbatim — exactly two literal edits, the only two occurrences outside `.oplan/`):
  `public/sw.js:1`  `const CACHE = "magic-vet-v15";` → `const CACHE = "magic-vet-v16";`
  `tests/shell.test.js:58`  `assert.ok(sw.includes('magic-vet-v15'));` →
  `assert.ok(sw.includes('magic-vet-v16'));`
  QZ-22, quoted from the SIGNED §10: *"Any change under `public/` ships with a `sw.js` `CACHE` bump in
  the same phase."* The `PRECACHE` array is byte-frozen — no file is added or removed; `words.js` is
  already in it at position 12.

non-goals: the `PRECACHE` array · the install/activate/fetch handlers · `public/app.js`'s
  controllerchange auto-reload (already shipped at v15) · `public/manifest.webmanifest` ·
  any other version string · `.oplan/` records of v15-as-live (historical — never edit them) ·
  no new test (291).

tier: WORKER — two literal edits.

depends on: 1.5 committed. MUST be the last code change of the phase.

---

### STEP 1.7: sandbox visual gate — the orchestrator looks at the badge  [tier: ORCHESTRATOR]

goal: The new badge and the surviving claim button are seen rendering in a real browser, in RTL, on
  the sandbox — before anything reaches production. Objective defects fixed; taste verdicts recorded.

files: none in the repo. Scratch and the sandbox profile edit live OUTSIDE the repo, under
  `$HOME/g1-scratch/` and `C:/Users/dkreinov/english-app-sandbox/` (field guide 4: never write
  scratch into the tree; Git Bash `/tmp` is not node's).

commands (orchestrator's shell, in order):
  1. `cp C:/Users/dkreinov/english-app-sandbox/profile.json $HOME/g1-scratch/sandbox-profile.bak`
  2. Edit the SANDBOX profile only: set one word to `"status": "candidate"` with `"nominations": 1`
     and one word to `"status": "learning"`, leaving the rest `known`. (The sandbox profile holds 12
     words, all `known`, and 1 chapter — measured at plan time.)
  3. `DATA_DIR='C:\Users\dkreinov\english-app-sandbox' npm run dev`
  4. Sandbox browser → `http://localhost:3000` → HARD-RELOAD past the stale localhost service worker
     (field guide 12) → המילים שלי → screenshot, plus a zoom on the three badge variants.
  5. Restore: `cp $HOME/g1-scratch/sandbox-profile.bak C:/Users/dkreinov/english-app-sandbox/profile.json`

validation: NOT mechanical, deliberately (field guide 1; the mechanical half is step 1.5's probe and
  test). Passes when the orchestrator has recorded, in the journal, a verdict on each of these five,
  with the screenshot referenced:
  (1) `כמעט יודעת` is legible at badge size and does not wrap or overflow the pill;
  (2) the purple badge is distinguishable at a glance from the teal `יודעת` and amber `לומדת`;
  (3) the row still reads correctly in RTL with the LTR lemma, the speaker, the claim button and the
      badge all present and not colliding;
  (4) the claim button on a candidate row is visibly the same button as on a learning row;
  (5) nothing else on the screen changed.
  Objective defects (overflow, collision, illegible) are FIXED as a follow-up to 1.5 with a fresh
  changed-set check before 1.8; taste-only items are recorded as KEEP and named to the owner in the
  post-deploy report.

contracts: NEVER a browser on production (field guide 12) · never `GET /api/profile` against
  production · the sandbox profile is a fixture, not her data; the live profile is never read here ·
  `git status --porcelain` must be empty when this step ends (the sandbox lives outside the repo).

non-goals: re-skinning anything · changing the badge colour on a hunch without re-running the
  contrast anchor · asking the owner to eyeball this (owner directive: visual gates are self-served) ·
  installing or testing the PWA.

tier: ORCHESTRATOR — a browser and a judgment call, not pattern work.

depends on: 1.6 committed and green.

---

### STEP 1.8: the D25 capture — her live profile, backed up before the deploy  [tier: ORCHESTRATOR]

goal: A timestamped, proven copy of her live profile exists outside the repo BEFORE the first deploy
  that can write the new fields (`status: 'candidate'`, `nominations`).

files: none in the repo except `.oplan/word-g1/backup-receipt.txt` (SHA-256 + counts ONLY, never
  contents). The capture itself lands in `C:/Users/dkreinov/english-app-backups/` (D27; the folder
  exists and is currently EMPTY — verified at plan time, the word-quiz backups were deleted at that
  run's close).

commands: **THE CAPTURE COMMAND IS FROZEN — this exact form, no improvisation at run time.** Source:
  `.oplan/word-quiz/plan.md:1573-1586` (step 6.2), the form the phase-6 journal records as executed
  twice without leaking:
```bash
set -o pipefail
mkdir -p /c/Users/dkreinov/english-app-backups   # Git-Bash path form — a Windows-style path here creates a stray repo file (field guide 4)
BK="/c/Users/dkreinov/english-app-backups/profile-$(date +%Y%m%d-%H%M%S).json"
code=$( ( set -a; . ./.env; set +a
          curl -s --ssl-no-revoke -H "x-app-code: $APP_CODE" \
               -o "$BK" -w '%{http_code}' \
               https://english-app-three-tan.vercel.app/api/profile ) )
case "$code" in 200) ;; 401) echo "FAIL: 401 - local .env APP_CODE != production (stop, owner supplies it out of band)"; exit 1;;
                *) echo "FAIL: GET -> $code"; exit 1;; esac
[ -z "${APP_CODE:-}" ] || { echo "FAIL: APP_CODE leaked into this shell"; exit 1; }
```
  Why this exact form, quoted from that plan: *"The subshell `( set -a; . ./.env; set +a; curl ... )`
  is the load-bearing part: `.env` is sourced INSIDE the parentheses so `APP_CODE` dies with the
  subshell — `isAuthorized` is open only when it is UNSET, and a leak silently 401s the whole suite
  for the rest of the phase; the post-assertion proves it did not leak. `$APP_CODE` is never echoed,
  never logged."* Stated openly, unchanged: this GET can rewrite her file into sorted-key order —
  byte-identical to what her own app does on every load.

validation (frozen; run in the SAME shell, `$BK` still bound):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
node -e '
const fs = require("fs");
const p = process.argv[1];
const raw = fs.readFileSync(p, "utf8");
if (raw.length < 200) { console.log("FAIL: capture is " + raw.length + " bytes"); process.exit(1); }
let env; try { env = JSON.parse(raw); } catch (e) { console.log("FAIL: unparseable"); process.exit(1); }
const prof = env && env.data ? env.data : env;
if (!prof || typeof prof.words !== "object" || Object.keys(prof.words).length === 0) { console.log("FAIL: empty words map"); process.exit(1); }
import("./lib/profile.js").then((m) => {
  const v = m.validateProfile(prof);
  if (!v.ok) { console.log("FAIL: " + JSON.stringify(v.errors)); process.exit(1); }
  const keys = Object.keys(prof.words);
  const known = keys.filter((k) => prof.words[k].status === "known").length;
  const cand  = keys.filter((k) => prof.words[k].status === "candidate").length;
  console.log("BACKUP OK bytes=" + raw.length + " words=" + keys.length + " known=" + known + " candidate=" + cand);
});
' "$BK" || exit 1
sha=$(sha256sum "$BK" | awk '{print $1}')
printf "capture %s sha256=%s\n" "$BK" "$sha" >> .oplan/word-g1/backup-receipt.txt
inside=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | tr '\n' ' ')
[ -z "$inside" ] || { echo "FAIL: repo is dirty outside .oplan: $inside"; exit 1; }
[ ! -f .data/profile.json ] || { echo "FAIL: .data/profile.json exists"; exit 1; }
echo STEP-1.8-OK
```

contracts: the backup destination is `C:/Users/dkreinov/english-app-backups/` (D27) · capture-only —
  **there is no restore path**; `vercel rollback` restores CODE only (D27, accepted by the owner) ·
  only SHA-256 + counts are ever recorded in the workspace, never contents · never `vercel env` ·
  never probe the live profile outside this sanctioned read · `APP_CODE` must never enter the
  orchestrator's shell, and the post-assert proves it did not.
  **OWNER QUESTION TO ASK AT THIS STEP** (`phase-state.md:60-61`): does the D27 rider — backups
  DELETED at phase close — apply again to this capture? Record the answer verbatim. If yes, the
  deletion happens strictly AFTER criterion 9's read-back has passed and the criteria have been
  re-run, and the journal must state plainly that the safety net ends there.

non-goals: any restore tooling (separately-authorized work) · reading her profile for any purpose
  other than this capture and step 1.10's read-back · a second capture (this phase's window is one
  deploy; if more than an hour elapses between this step and 1.9, re-capture with the same command
  and use the LATER file as `$BK`) · deploying (that is 1.9).

tier: ORCHESTRATOR — touches the live system and a secret.

depends on: 1.7 recorded (code frozen, nothing left to change).

---

### STEP 1.9: deploy to production per the frozen recipe  [tier: ORCHESTRATOR]

goal: `magic-vet-v16` live on the canonical alias; the outgoing deployment recorded as the rollback
  target BEFORE deploying; the two changed `public/` files proven live in BYTES.

files: none in the repo. Scratch ONLY at `$HOME/g1-deploy/`.

commands (orchestrator's shell, in order — recipe from `.oplan/word-audio/phase-state.md:55-66`,
field guide 10):
  1. `mkdir -p $HOME/g1-deploy`
  2. `"$(npm prefix -g)/vercel" inspect https://english-app-three-tan.vercel.app 2>&1 | tee $HOME/g1-deploy/outgoing.txt`
     — **HARD STOP** if the reported id is not `dpl_HUjmYpAvumkWDXxsjkZiQzY7GRTn`; record id+url in
     the journal BEFORE deploying. That id is the rollback target.
  3. `"$(npm prefix -g)/vercel" deploy --prod --yes`
  4. Record the new deployment id and the upload size in the journal.

validation (frozen):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
D="$HOME/g1-deploy"; mkdir -p "$D"
U=https://english-app-three-tan.vercel.app
files=$(git diff --name-only --diff-filter=ACMR 265dc86..HEAD -- public/ | LC_ALL=C sort | tr '\n' ' ')
[ "$files" = "public/sw.js public/views/words.js " ] || { echo "FAIL: public/ enumeration = [$files]"; exit 1; }
curl -s --ssl-no-revoke -o "$D/sw.js"     "$U/sw.js"          || { echo "FAIL: fetch /sw.js"; exit 1; }
curl -s --ssl-no-revoke -o "$D/words.js"  "$U/views/words.js" || { echo "FAIL: fetch /views/words.js"; exit 1; }
curl -s --ssl-no-revoke -o "$D/health"    "$U/api/health"     || { echo "FAIL: fetch /api/health"; exit 1; }
code=$(curl -s --ssl-no-revoke -o "$D/chapter" -w '%{http_code}' "$U/api/chapter")
[ "$code" = "401" ] || { echo "FAIL: /api/chapter -> $code (expected 401)"; exit 1; }
a=$(md5sum public/sw.js          | awk '{print $1}'); b=$(md5sum "$D/sw.js"    | awk '{print $1}')
[ "$a" = "$b" ] || { echo "FAIL: sw.js md5 worktree=$a live=$b"; exit 1; }
a=$(md5sum public/views/words.js | awk '{print $1}'); b=$(md5sum "$D/words.js" | awk '{print $1}')
[ "$a" = "$b" ] || { echo "FAIL: words.js md5 worktree=$a live=$b"; exit 1; }
n=$(grep -cF 'magic-vet-v16' "$D/sw.js") || n=0; [ "$n" -ge 1 ] || { echo "FAIL: live sw.js is not v16"; exit 1; }
n=$(grep -cF 'magic-vet-v15' "$D/sw.js") || n=0; [ "$n" = "0" ]  || { echo "FAIL: live sw.js still names v15"; exit 1; }
h=$(cat "$D/health")
[ "$h" = '{"ok":true,"data":{"status":"up","version":1}}' ] || { echo "FAIL: health payload = $h"; exit 1; }
[ -s "$D/outgoing.txt" ] || { echo "FAIL: no recorded outgoing deployment"; exit 1; }
echo DEPLOY-V16-OK
```
  `265dc86` is frozen as the enumeration base: it is the commit whose `public/` bytes are live now
  (word-quiz-reskin step 1.8), and `git diff 265dc86..HEAD -- public/` was EMPTY at plan time.
  `--diff-filter=ACMR` is load-bearing (word-quiz plan.md, criterion 9). Hash FILES, never
  `$(curl …)` output — command substitution strips trailing newlines and has already produced one
  false failure in this project.

contracts: `vercel` is off PATH — always `"$(npm prefix -g)/vercel"` · `curl` needs
  `--ssl-no-revoke` on this machine · md5 against the **WORKTREE**, never a git blob
  (`public/views/words.js` is CRLF on disk, LF in git; the CLI uploads worktree bytes) ·
  `cleanUrls` 308s `*.html` — `.js` paths are fetched directly · ROLLBACK (code only):
  `"$(npm prefix -g)/vercel" rollback https://english-d0roovfpq-dkreinovs-projects.vercel.app --yes`
  — write this line into `phase-state.md` verbatim BEFORE the deploy and re-confirm after.

non-goals: NEVER request `/api/profile` here (a GET creates one; the sanctioned read is 1.10) ·
  never `vercel env` · never a browser on production · never the real `APP_CODE` in this shell ·
  no `.data/` touches · no manual alias or promote · no deploy before `inspect` has recorded the
  outgoing id.

tier: ORCHESTRATOR — touches the live system.

depends on: 1.8 (`STEP-1.8-OK`) and criteria 1-7 green.

---

### STEP 1.10: her data, read back and proven intact  [tier: ORCHESTRATOR]

goal: The one check ever run against her real data: nothing she collected was lost, and every status
  that moved is mechanically explained.

files: none in the repo except an appended line in `.oplan/word-g1/backup-receipt.txt` (counts only).

commands: the SAME frozen subshell capture form as 1.8, writing to
  `$HOME/g1-deploy/live-readback.json` instead of the backup folder; `$BK` from 1.8 must still exist.

validation (frozen):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
LB="$HOME/g1-deploy/live-readback.json"
code=$( ( set -a; . ./.env; set +a
          curl -s --ssl-no-revoke -H "x-app-code: $APP_CODE" \
               -o "$LB" -w '%{http_code}' \
               https://english-app-three-tan.vercel.app/api/profile ) )
case "$code" in 200) ;; *) echo "FAIL: GET -> $code"; exit 1;; esac
[ -z "${APP_CODE:-}" ] || { echo "FAIL: APP_CODE leaked into this shell"; exit 1; }
node -e '
const fs = require("fs");
const un = (p) => { const e = JSON.parse(fs.readFileSync(p, "utf8")); return e && e.data ? e.data : e; };
const back = un(process.argv[1]), live = un(process.argv[2]);
import("./lib/profile.js").then((m) => {
  const fail = (w) => { console.log("FAIL: " + w); process.exit(1); };
  const v = m.validateProfile(live); if (!v.ok) fail(JSON.stringify(v.errors));
  const bk = Object.keys(back.words), lk = new Set(Object.keys(live.words));
  if (Object.keys(live.words).length < bk.length) fail("live has fewer words");
  const lost = bk.filter((k) => !lk.has(k));
  if (lost.length) fail("keys LOST: " + lost.join(","));
  const ACT = ["taps", "lastSeen", "lastQuizAt", "quizRight", "quizWrong", "nominations"];
  const report = [];
  for (const k of bk) {
    const b = back.words[k], l = live.words[k];
    if (l.status === b.status) continue;
    const moved = ACT.some((f) => JSON.stringify(b[f]) !== JSON.stringify(l[f]));
    if (!moved) fail("status change with NO activity evidence: " + k + " " + b.status + " -> " + l.status);
    if (b.status === "learning" && l.status === "candidate") {
      if (l.nominations !== ((b.nominations || 0) + 1)) fail("G1 nomination without nominations+1: " + k);
    }
    report.push(k + " " + b.status + " -> " + l.status);
  }
  const cand = Object.keys(live.words).filter((k) => live.words[k].status === "candidate");
  console.log("READBACK OK words=" + Object.keys(live.words).length + " candidates=" + cand.length);
  console.log("STATUS CHANGES (report to the owner): " + (report.length ? report.join(" | ") : "none"));
});
' "$BK" "$LB" || exit 1
echo STEP-1.10-OK
```
  The activity-field list and the `learning→candidate ⇒ nominations+1` clause AMEND the word-quiz
  criterion-10 rule (`.oplan/word-quiz/plan.md:1512-1516`), which reads: *"for every key in capture
  #2, `live.status === backup.status` OR at least one of the entry's activity fields (`taps`,
  `lastSeen`, `lastQuizAt`, `quizRight`, `quizWrong`) differs from the backup's — a status change
  WITHOUT any accompanying activity change fails the criterion outright."* Unamended, a correct G1
  nomination would fail it, because a nomination moves `status` and `nominations` and nothing else.

contracts: any lost key, or a status change with no activity evidence → **STOP, roll back code with
  the 1.9 rollback command, tell the owner** · never write her profile bytes into the repo · the
  D27 deletion (if the owner reconfirmed it at 1.8) happens only AFTER this step and the criteria
  re-run, and the journal records that the safety net ends there.

non-goals: "fixing" her data · re-running the deploy · reading her profile again for any other reason ·
  asserting that a candidate exists (see RISKS — zero candidates is a legitimate outcome).

tier: ORCHESTRATOR — touches the live system and a secret.

depends on: 1.9 (`DEPLOY-V16-OK`) and 1.8's `$BK`.

---

PHASE 2 SKELETON: candidates enter the quiz (slice b)
GOAL: a candidate can actually become `known` — the quiz asks about it, one wrong answer returns it
  to `learning` with its clock reset, and she is told so kindly.
INPUTS: phase 1's `candidate` status, `nominations`, `promoteToCandidate`; frozen QZ-12/17/18.
OUTPUTS: B3 — a NEW export in `public/quiz-core.js` selecting at most ONE candidate per session, the
  merge done at the CALL SITE, the frozen comparator untouched; B2 — a candidate branch in
  `applyQuizAnswer` placed BEFORE the strike machinery (a wrong answer sets `status='learning'`,
  `lastSeen = now` (B5's clock reset), still increments `quizWrong`, never touches `strikes`; a right
  answer sets `known`); B6(iii) — `עוד לא — נמשיך ללמוד את המילה הזאת` as a NEW text node in
  `public/quiz.js`, with the existing demotion line asserted ABSENT for a candidate (the cry-wolf
  negative control field guide 2 demands).
LIKELY FILES: `public/quiz-core.js`, `public/views/words.js`, `public/views/reader.js`, `public/quiz.js`,
  `lib/profile.js`, `public/sw.js` (v17), `tests/quiz-core.test.js`, `tests/quiz-ui.test.js`,
  `tests/profile-quiz-answer.test.js`, `tests/shell.test.js`.
GATE: hand-derived QZ-21-style transcript diffed EMPTY before the code exists; sandbox visual gate;
  CACHE v17 + deploy + read-back.
RISKS: the quota must not starve strike-bearing `known` words (the quiz's original job); a candidate
  with no item is silence, not a crash (D23); QZ-18's node ORDER is frozen — append, never replace.

PHASE 3 SKELETON: weekly top-ups cover candidates (slice c)
GOAL: close G1's deadlock — a candidate with no quiz item can never pass, so the top-up's word list
  becomes `known ∪ candidate` (B7 (a)), on-manifest words only.
INPUTS: the live profile capture that seeds every top-up; `.oplan/word-quiz/qz8-exclusions.txt` (37);
  `public/audio/words/index.json`; `scripts/check-quiz-bank.mjs`; D23's per-word cost (~9k tokens).
OUTPUTS: the completeness criterion inverted again — *"does every word she has claimed OR the app has
  nominated have an item"*; new `public/quiz/<lemma>.json` files; the QZ-8 exclusions and the
  non-manifest drop still honored, every dropped word REPORTED with its reason.
LIKELY FILES: `public/quiz/*.json` (new), `tests/quiz-bank.test.js` (the `>= 50` pin), the top-up
  operation record in `.oplan/word-quiz/plan.md` PHASE 2.
GATE: two blind adversarial passes over every new item + the owner's approval in the D28 hint form;
  then CACHE bump + deploy + read-back.
RISKS: off-list glossed words have NO clip and NO manifest entry — explicitly deferred by B7's rider
  to their own later step, not silently swept in; nomination rate is UNMEASURED, so the token cost is
  an estimate — the B3 quota is the throttle if it runs hot.

RISKS

- **G1 may nominate nothing on her real profile.** Promotion needs two chapters generated after a
  word's `lastSeen` that contain it; her 8 `learning` words may not qualify yet. The phase would then
  deploy a working engine and an invisible badge. Deliberately NOT an acceptance criterion — step
  1.10 prints `candidates=N`, so the fact is measured and reported rather than assumed either way.
- **Silent over-matching by `baseForms`.** "camping" matches "camp"; the promoter inherits every
  looseness of `coverageAgainst` by design. It fails in the SAFE direction (a candidate touches no
  chapter, §5.3) but could promote a word she does not know. Noticed as a wrong `כמעט יודעת` badge on
  her screen and, from phase 2, as a quiz failure that costs one question.
- **A stale cached shell renders a candidate as `לומדת`** (the old `statusBadge` falls through). It
  degrades gracefully and the v15 auto-reload fixes it on her next open — but do not misread it as a
  failed deploy (this exact confusion cost a debug at word-quiz gate B).
- **A worker normalising `public/views/words.js` from CRLF to LF** turns step 1.9's md5 check into a
  whole-file diff hunt. Called out as a non-goal in 1.5 and checked by `file` in its validation.
- **The em dash in the frozen `docs/growth.md` header.** A hyphen typed instead of U+2014 fails 1.1's
  header check — which is the point; it fails loudly, not silently.
- **`promoteToCandidate` mutating a profile that is never saved** (a 502 from `generateChapter`). No
  harm: the function is idempotent and re-runs on the next generation. Stated so it is not
  re-debugged.
- **Ledger drift.** Any accidental extra `test()` fails every later step's validation. Each worker
  step pins the exact cumulative number and forbids subtests.
- **APP_CODE leaking into the orchestrator's shell** silently 401s the entire suite for the rest of
  the phase. The frozen subshell plus its post-assert is the only mitigation and it is used in both
  1.8 and 1.10.
- **`grep -q` under `pipefail`** and locale-dependent `sort` — avoided throughout: every validation
  captures to a variable and matches with `case`/`[ ]`, and every frozen comparison uses `LC_ALL=C`.

BLOCKERS: none. Every decision phase 1 needs is in the record or is frozen above with its reason.
  The four decisions the record did not literally make are listed under RECORD GAPS; none of them
  blocks execution, and each is written so the owner can overturn it in one line.

RECORD GAPS

1. **The `docs/growth.md` header text.** `phase-state.md:13-15` says "copy the signed draft's text
   over `docs/growth.md` as ONE edit"; the draft's own lines 1-8 are self-referential and say the
   opposite of what the file will then be. Nothing decides the replacement wording. Frozen in step
   1.1; one line for the owner to overrule.
2. **Which chapter field "appeared in a chapter" means.** §5.1 says "appeared … in at least 2
   chapters" without naming a field. Frozen as `chapter.text` only (the body she reads, and the field
   `verifyChapter` measures coverage over), with `verifyChapter`'s own normalisation.
3. **The candidate badge's colour.** B6(i) fixes the STRING and §11(g) asks the owner to approve the
   strings — nothing anywhere chooses a colour. Frozen as `--color-primary` at 18% because that exact
   pair is already a passing row of the contrast gate, so the 52 anchor does not move. Put to the
   self-served visual gate at 1.7 and named to the owner in the post-deploy report.
4. **Where B5's clock reset lands.** The owner's phase cut lists "B5 clock/cap" in slice (a) and "B2
   one-wrong demotion" in slice (b), but the clock reset only ever fires inside the B2 branch.
   Split as stated in SKELETON CHANGES 4 — cap in phase 1, reset in phase 2.
5. **`phase-state.md:63` records the tree at `2cca28e`**; HEAD is `35d1ebe` and three
   `.oplan/word-g1/` files are untracked. Worked around by having the orchestrator commit them and
   record `$BASE` before step 1.1.
6. **The planner did not RUN the suite** (read-only mandate). The 282 baseline is derived from the
   two phase-state files plus a direct count (277 flat `^test(` + 5 `t.test` subtests in
   `dev-server.test.js`). Step 1.1's validation re-establishes it mechanically before any code moves.

PLAIN PLAN
  1.1 Put the growth document she signed into `docs/growth.md`, exactly as signed, with an honest
      "SIGNED" line on top — because everything after this is built from that document, and the file
      of record still says "awaiting signature".
  1.2 Teach the profile that a word can be "almost known", and that when two spellings of the same
      word get merged the more-trusted verdict wins — because a merge must never quietly throw away
      something she or the quiz decided.
  1.3 Write the actual rule: a word she looked up once, and then met again in two later chapters
      without looking it up, becomes "almost known" — at most twice ever, so no word can ping-pong.
  1.4 Run that rule once every time a new chapter is made — because that is the one moment her
      profile is already open and about to be saved.
  1.5 Show it to her: a third badge that reads "כמעט יודעת", and the "I know this" button stays on
      those words — because her own word always outranks the app's guess.
  1.6 Bump the app's cache version — because otherwise her phone keeps serving the old screen.
  1.7 Open the app in the practice sandbox and look at the new badge with our own eyes — because no
      test can tell whether it reads well in Hebrew on a real screen.
  1.8 Copy her live word collection to a safe folder off the computer's project — because this is the
      first release that writes new things into that file and there is no undo.
  1.9 Ship it to the real app, and prove the files that landed are byte-for-byte the ones we wrote —
      not just that the deploy "said OK".
  1.10 Read her collection back and prove nothing was lost and every change is explainable — the only
      time this phase touches her real data.
  DONE WHEN: the app is live at `magic-vet-v16`, its own files md5-proven on the server, the full
  suite green at 291 with and without the entry-code gate, contrast still 52, and her word collection
  read back from production with zero keys lost and every status change accounted for.