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
---

# PHASE 2 IN FULL (planned 2026-07-28 by a fresh planner — Opus, files only, read-only mandate;
# supersedes the PHASE 2 SKELETON above; amendment #1 applied by the orchestrator at plan
# review — step 2.3 known-count 3 → 2, logged in the journal)

PHASE 2: candidates enter the quiz (slice b)

GOAL: A `candidate` can finally resolve. The quiz reserves exactly one slot per sitting for a
candidate (B3); one wrong answer returns it to `learning` with its promotion clock reset (B2 +
B5's reset half); one right answer makes it `known`; and she is told in the softer words the
owner signed (B6 iii) instead of the line written for a word she claimed herself. Ends in
`magic-vet-v17`, a D25 capture, a production deploy proven in bytes, and her live data read back
intact.

ACCEPTANCE CRITERIA (mechanical, re-runnable by the orchestrator from a clean tree)

1. `npm test` → `# pass 298` and `# fail 0`. The ledger moves 291 → **298**: exactly 7 new FLAT
   top-level `test()` calls — 2 appended to `tests/profile-quiz-answer.test.js` (10→12), 1 to
   `tests/quiz-core.test.js` (7→8), 1 to `tests/quiz-ui.test.js` (8→9), 1 to
   `tests/words-ui.test.js` (11→12), 1 to `tests/reader-ui.test.js` (11→12), 1 to
   `tests/quiz-experience.test.js` (5→6). **Baseline re-counted by this planner against the tree:
   286 flat `^test(` across `tests/*.js` + the 5 `t.test` subtests in `tests/dev-server.test.js:42-67`
   = 291. This matches the phase-1 close exactly; the arithmetic in the handoff is CONFIRMED.**
2. `APP_CODE=dummy npm test` → `# pass 298` / `# fail 0`. Only the `quiz-experience` episode calls a
   real handler, and it MUST reuse that file's existing `withOpenGate`/`withTempDataDir`; the other
   six new tests are pure (no handler, no `DATA_DIR`, no `APP_CODE`).
3. `node scripts/check-contrast.mjs` exits 0, prints `ALL PASS`, and `grep -c '^PASS'` = **52**
   (never bare `grep -c PASS`, which returns 53 — field guide 7). **No CSS is added by this phase
   at all:** the softer line reuses the existing `.quiz-demoted` rule, so no pair reaches the gate.
4. `public/sw.js` line 1 is `const CACHE = "magic-vet-v17";` and
   `grep -rln 'magic-vet-v16' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.oplan .`
   returns nothing. `PRECACHE` is byte-unchanged (all four changed `public/` modules are already
   in it).
5. **THE OLD GATE STILL PASSES.** `node .oplan/word-quiz/quiz-transcript.mjs` diffs EMPTY against
   `.oplan/word-quiz/quiz-transcript-expected.txt`. VERIFIED EMPTY by this planner today, so it is
   a real regression guard: it proves every claimed-word screen (QZ-18/QZ-23 text-node order,
   option order, gloss/hint, feedback, the hard demotion line) is byte-unchanged.
6. **THE NEW GATE PASSES AND WAS WRITTEN FIRST.** `node .oplan/word-g1/g1-transcript.mjs` diffs
   EMPTY against `.oplan/word-g1/g1-transcript-expected.txt`; and
   `git log --oneline -- .oplan/word-g1/g1-transcript-expected.txt | wc -l` = **1** — the expected
   file was committed once, at step 2.1, and never edited afterwards. That single fact is what
   makes it a hand-derived gate rather than a photograph of the implementation (field guide 2).
7. The phase's whole write set over `$BASE..HEAD` (`$BASE` = `git rev-parse HEAD` recorded by the
   orchestrator immediately before step 2.1) is EXACTLY these 13 files, zero deletions,
   `LC_ALL=C sort`:
   `lib/profile.js public/quiz-core.js public/quiz.js public/sw.js public/views/reader.js
   public/views/words.js tests/profile-quiz-answer.test.js tests/quiz-core.test.js
   tests/quiz-experience.test.js tests/quiz-ui.test.js tests/reader-ui.test.js tests/shell.test.js
   tests/words-ui.test.js`
   (plus `.oplan/**`, which is excluded from every changed-set check).
8. `.data/profile.json` absent; `git status --porcelain` empty after every step's commit; no byte of
   her profile anywhere inside the repo (captures live under
   `C:/Users/dkreinov/english-app-backups/`). The four CRLF files
   (`public/quiz-core.js`, `public/quiz.js`, `public/views/words.js`, `public/views/reader.js`) are
   still CRLF: `file <path>` reports `CRLF` for each. (`public/sw.js` is LF and stays LF.)
9. **THE DEPLOY IS PROVEN IN BYTES.**
   `git diff --name-only --diff-filter=ACMR 558a5bc..HEAD -- public/ | LC_ALL=C sort` = exactly
   `public/quiz-core.js public/quiz.js public/sw.js public/views/reader.js public/views/words.js`.
   (`558a5bc` is the enumeration base: it is the current HEAD, and its `public/` bytes ARE the live
   bytes — VERIFIED today: `git diff --name-only 70d0aa7..558a5bc -- public/` is EMPTY, and 70d0aa7
   is the commit md5-proven live at phase-1 step 1.9.) All five files md5 live == **WORKTREE**
   (never a git blob — four of them are CRLF on disk). Live `/sw.js` contains `magic-vet-v17` and
   NOT `magic-vet-v16`. `/api/health` returns exactly
   `{"ok":true,"data":{"status":"up","version":1}}`. Unauthenticated `/api/chapter` → 401. The
   outgoing deployment id+url was recorded by `vercel inspect` BEFORE deploying.
10. **HER DATA IS INTACT (the only check ever run against her real data).** Post-deploy
    authenticated GET → 200; `validateProfile(live).ok`; live word-key count ≥ the capture's; set
    difference `capture \ live` EMPTY; and for every key in the capture:
    `live.status === backup.status` OR at least one of `taps`, `lastSeen`, `lastQuizAt`,
    `quizRight`, `quizWrong`, `nominations` differs. Additionally, `learning → candidate` must
    satisfy `live.nominations === (backup.nominations ?? 0) + 1`. Any other status change is
    REPORTED to the owner verbatim. Any violation → STOP, roll back code, owner.
11. **THE D25 CAPTURE EXISTS AND IS PROVEN** before the deploy: ≥200 bytes, parseable JSON,
    non-empty `words` map, `validateProfile(prof).ok`, prints
    `BACKUP OK bytes=… words=… known=… candidate=…`. Only SHA-256 + counts are recorded in the
    workspace, never contents. (Phase 1's capture was DELETED at its close on the owner's
    instruction — journal:246-251 — so NO safety net exists right now and this capture is the only
    one for this deploy.)
12. NON-MECHANICAL, stated as such (field guide 1 + 12, owner directive: self-served): the
    orchestrator's sandbox-browser verdict on the candidate quiz — the softer line legible and
    correct in RTL, the claimed-word line absent, the candidate asked FIRST and only once, the rest
    of the card unchanged, and the word showing `לומדת` in המילים שלי afterwards. Recorded verbatim
    in the journal. No browser ever on production.

DEPENDS ON

- `.oplan/word-g1/phase-state.md:1-6,24-35` — phase 1 CLOSED 11/11; live `magic-vet-v16`,
  `dpl_9yj3HbhU7p5ZNAGQHUeTCvM2D3Dc`; ledger 291; contrast 52; and the explicit statement that
  "B2, B5-clock-reset, B6(iii), B3 quota = phase 2".
- `.oplan/word-g1/journal.md:224-227` — READBACK OK words=20 **candidates=0**; G1 first runs at her
  next chapter generation. Phase 2 therefore ships a consumer for a producer that has not yet
  produced anything on her real profile. Stated, not hidden (see RISKS).
- `.oplan/word-g1/journal.md:246-251` — the D27 rider was executed: phase 1's capture is DELETED,
  the backups folder is empty, "phase 2's own D25 capture will precede its first profile-writing
  deploy".
- Phase 1's shipped code, all re-verified against the tree today: `lib/profile.js:439-485`
  (`applyQuizAnswer`, QZ-12 rows), `:495` (`promoteToCandidate`), `:492-493` (the two constants),
  `WORD_STATUSES` with `candidate`, `nominations` validated and max-merged.
- The frozen QZ contracts this phase amends or must not break — quoted in the steps that touch
  them: QZ-12 (`.oplan/word-quiz/plan.md:562-616`), QZ-17 (`:882-921`), QZ-18 (`:923-1012`),
  QZ-23 (`:1619-1642`), QZ-21 (`:1027-1049`), QZ-22 (`:1051-1055`).
- `.oplan/word-g1/design.md` §8 B2 (`:396-404`), B3 (`:406-422`), B5 (`:441-458`), B6 iii
  (`:485-497`), §5.2, §10 (`:582-585`, the explicit amendment licence for QZ-12/17/18).
- `docs/growth.md:486` — the SIGNED source of the frozen Hebrew string (byte-identical copy also at
  `.oplan/word-g1/design.md:491`).
- `.oplan/word-audio/phase-state.md:55-66` — the frozen deploy recipe (field guide 10).
- `.oplan/word-quiz/plan.md:1573-1586` — the frozen APP_CODE subshell capture command.
- `.oplan/word-g1/plan.md` steps 1.7-1.10 — the template for 2.8-2.11.

SKELETON CHANGES (how reality differs from the PHASE 2 SKELETON, and why)

1. **The skeleton's "LIKELY FILES" list is complete and correct** — verified file by file against
   the tree. Nothing it names is already done, nothing it names has moved. `public/views/words.js`
   and `public/views/reader.js` both still read `lemmas = pickQuizWords(profile, 20);` (words.js:267,
   reader.js:335) with no candidate anywhere.
2. **The skeleton's "hand-derived QZ-21-style transcript" is now planned concretely.** QZ-21
   (`.oplan/word-quiz/plan.md:1027-1049`) is a script + a BY-HAND expected file, both written by the
   orchestrator BEFORE the implementing step is dispatched, diffed with `diff`. I re-ran the
   existing pair today: **it diffs EMPTY**, so I can derive the new expected file from a proven
   baseline rather than from prose. Step 2.1 writes the new pair; criterion 6 pins that it was
   written first and never edited.
3. **The new export does NOT require touching the frozen comparator, and does not require
   extracting it either.** `pickCandidateWords` projects candidates onto a throwaway profile in
   which they read as `known` and hands that to `pickQuizWords` itself. QZ-17's lines do not move by
   one byte, and "ordered inside its tier by the existing comparator" (B3) becomes true by
   construction rather than by a copied comparator that could drift.
4. **The skeleton says B6(iii) is "a NEW text node in `public/quiz.js`". It is not a new node — it
   is new TEXT in the existing node 7 slot**, and that is the safer reading. QZ-18 freezes the
   text-node ORDER; adding a second `<p class="quiz-demoted">` would add a node to a frozen order,
   while branching the text inside the one node leaves the order literally unchanged (and keeps
   criterion 5's transcript green). Frozen as QZ-25 in step 2.4.
5. **The candidate slot goes FIRST in the merged list, not last.** B3 says "a fixed quota — of the
   4 words in an after-chapter check, at most one is a candidate". A quota is a reserved slot; a
   candidate that is never reached can never become `known`, which is the deadlock §5.5 already
   warns about. A candidate with no bank item still costs nothing, because `startQuiz` skips a null
   item in silence (D23). Listed under RECORD GAPS — the record fixes the count, not the position.
6. **Ledger arithmetic re-derived, not inherited.** 286 flat + 5 subtests = 291 confirmed by direct
   count. Phase 2 targets 298.
7. **`docs/growth.md` is NOT edited this phase.** Nothing in §5/§8 becomes false when this ships;
   the document already describes exactly this behaviour as signed.

---

### STEP 2.1: the hand-derived candidate transcript, written BEFORE the code  [tier: ORCHESTRATOR]

goal: `.oplan/word-g1/g1-transcript.mjs` and `.oplan/word-g1/g1-transcript-expected.txt` exist,
  the expected file was derived BY HAND from the frozen render contract (never from output), and
  the gate is PROVEN CAPABLE OF FAILING: run against today's code it does NOT match.

files (create only): `.oplan/word-g1/g1-transcript.mjs`,
  `.oplan/word-g1/g1-transcript-expected.txt`. Nothing outside `.oplan/`.

commands: none — direct file writes. **Write both files with a tool that preserves bytes (the
  Write tool), never a bash heredoc or `bash -e` — field guide 13; both files contain an EM DASH
  (U+2014) and raw Hebrew.** Then verify the written bytes with a codepoint dump before validating.
  `mkdir -p $HOME/g1-scratch` first (scratch never goes in the repo — field guide 4).

validation (frozen; hand this over as a script FILE `.oplan/word-g1/validate-2.1.sh` and run the
file — field guide 9):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
mkdir -p "$HOME/g1-scratch" || exit 1
[ -f .oplan/word-g1/g1-transcript.mjs ] || { echo "FAIL: no g1-transcript.mjs"; exit 1; }
[ -f .oplan/word-g1/g1-transcript-expected.txt ] || { echo "FAIL: no g1-transcript-expected.txt"; exit 1; }
node -e '
const fs = require("fs");
const SOFT = "\u05E2\u05D5\u05D3 \u05DC\u05D0 \u2014 \u05E0\u05DE\u05E9\u05D9\u05DA \u05DC\u05DC\u05DE\u05D5\u05D3 \u05D0\u05EA \u05D4\u05DE\u05D9\u05DC\u05D4 \u05D4\u05D6\u05D0\u05EA";
const HARD = "\u05D4\u05DE\u05D9\u05DC\u05D4 \u05D4\u05D6\u05D0\u05EA \u05D7\u05D5\u05D6\u05E8\u05EA \u05DC\u05DC\u05DE\u05D9\u05D3\u05D4, \u05E0\u05DC\u05DE\u05D3 \u05D0\u05D5\u05EA\u05D4 \u05E9\u05D5\u05D1 \u05D9\u05D7\u05D3";
const lines = fs.readFileSync(".oplan/word-g1/g1-transcript-expected.txt", "utf8").split("\n");
const count = (s) => lines.filter((l) => l === s).length;
if (count(SOFT) !== 1) { console.log("FAIL: expected file holds the SOFT line " + count(SOFT) + " times, want 1"); process.exit(1); }
if (count(HARD) !== 1) { console.log("FAIL: expected file holds the HARD line " + count(HARD) + " times, want 1"); process.exit(1); }
if (lines.filter((l) => l.indexOf("=== SCREEN") === 0).length !== 3) { console.log("FAIL: want exactly 3 screen separators"); process.exit(1); }
if (lines[lines.length - 1] !== "") { console.log("FAIL: expected file must end with a single trailing newline"); process.exit(1); }
console.log("EXPECTED-SHAPE-OK");
' || exit 1
out=$(node .oplan/word-g1/g1-transcript.mjs 2>&1) || { echo "FAIL: transcript script did not run"; printf "%s\n" "$out" | tail -12; exit 1; }
printf "%s\n" "$out" > "$HOME/g1-scratch/g1-preimpl.txt"
if diff "$HOME/g1-scratch/g1-preimpl.txt" .oplan/word-g1/g1-transcript-expected.txt > /dev/null 2>&1; then
  echo "FAIL: the gate is GREEN before the code exists - it cannot fail, so it proves nothing"; exit 1
fi
node -e '
const fs = require("fs");
const SOFT = "\u05E2\u05D5\u05D3 \u05DC\u05D0 \u2014 \u05E0\u05DE\u05E9\u05D9\u05DA \u05DC\u05DC\u05DE\u05D5\u05D3 \u05D0\u05EA \u05D4\u05DE\u05D9\u05DC\u05D4 \u05D4\u05D6\u05D0\u05EA";
const act = fs.readFileSync(process.env.HOME + "/g1-scratch/g1-preimpl.txt", "utf8");
if (act.indexOf(SOFT) >= 0) { console.log("FAIL: todays code already prints the soft line"); process.exit(1); }
console.log("GATE-CAN-FAIL-OK");
' || exit 1
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ -z "$changed" ] || { echo "FAIL: touched files outside .oplan: [$changed]"; exit 1; }
echo STEP-2.1-OK
```

contracts (FROZEN, verbatim):

`.oplan/word-g1/g1-transcript.mjs` is EXACTLY:
```js
// PHASE 2 / B6(iii) -- the candidate-demotion transcript. WRITTEN BY THE ORCHESTRATOR BEFORE
// step 2.4 was dispatched, so the gate does not rest on output produced by the code it gates
// (QZ-21's rule; field guide 2). The expected file is derived BY HAND from QZ-18/QZ-23's frozen
// text-node order plus QZ-25's single amendment.
// Run: node .oplan/word-g1/g1-transcript.mjs
import { readFileSync } from "node:fs";
import { selectOptions } from "../../public/quiz-core.js";
import { renderQuizCard } from "../../public/quiz.js";

const items = JSON.parse(
  readFileSync(new URL("../../public/quiz/light.json", import.meta.url), "utf8")
);
const item = items[1]; // the lamp sense -- the same real bank item QZ-21 uses

// Frozen, exactly as QZ-21: empty knownSet, rand = () => 0, so the Fisher-Yates rotation is
// radio, television, oven, fan, camera, light -- derivable by hand, which is the point.
const options = selectOptions(item, new Set(), () => 0);

// Frozen projection, byte-identical to QZ-21's.
const project = (html) =>
  html
    .replace(/<[^>]*>/g, "\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");

const base = {
  lemma: "light",
  item,
  options,
  index: 0,
  total: 4,
  chosen: null,
  correct: null,
  demoted: false,
  hintShown: false,
  wasCandidate: true,
};

const screens = [
  ["=== SCREEN 1: a CANDIDATE question as she first sees it — nothing marks it out ===", base],
  [
    '=== SCREEN 2: she chose "radio" — wrong; one wrong answer is enough for a candidate ===',
    { ...base, chosen: "radio", correct: false, demoted: true },
  ],
  [
    '=== SCREEN 3: CONTROL — the same wrong answer on a word SHE claimed ===',
    { ...base, chosen: "radio", correct: false, demoted: true, wasCandidate: false },
  ],
];

for (const [title, state] of screens) {
  console.log(title);
  console.log(project(renderQuizCard(state)));
}
```

`.oplan/word-g1/g1-transcript-expected.txt` is EXACTLY these 55 lines plus a single trailing
newline. (DERIVATION, stated so it can be checked: screen 1 is the body of
`.oplan/word-quiz/quiz-transcript-expected.txt` screen 1; screens 2 and 3 are the body of its
screen 4; the ONLY hand-made change is the demotion line, soft on screen 2 and hard on screen 3.
That file was re-run today and diffs EMPTY, so the baseline is measured, not assumed.)
```
=== SCREEN 1: a CANDIDATE question as she first sees it — nothing marks it out ===
שאלה 1 מתוך 4
איזו מילה מתאימה?
Please turn on the ___ so that I can see my book.
רמז
radio
🔊
television
🔊
oven
🔊
fan
🔊
camera
🔊
light
🔊
=== SCREEN 2: she chose "radio" — wrong; one wrong answer is enough for a candidate ===
שאלה 1 מתוך 4
איזו מילה מתאימה?
Please turn on the ___ so that I can see my book.
a lamp that helps you to see when a room is dark
radio
🔊
television
🔊
oven
🔊
fan
🔊
camera
🔊
light
🔊
כמעט! המילה הנכונה היא
light
עוד לא — נמשיך ללמוד את המילה הזאת
הלאה
=== SCREEN 3: CONTROL — the same wrong answer on a word SHE claimed ===
שאלה 1 מתוך 4
איזו מילה מתאימה?
Please turn on the ___ so that I can see my book.
a lamp that helps you to see when a room is dark
radio
🔊
television
🔊
oven
🔊
fan
🔊
camera
🔊
light
🔊
כמעט! המילה הנכונה היא
light
המילה הזאת חוזרת ללמידה, נלמד אותה שוב יחד
הלאה
```
  The two Hebrew demotion lines and the two em dashes MUST be copied from files, never retyped:
  the soft line from `docs/growth.md:486` (or `.oplan/word-g1/design.md:491`), the hard line from
  `public/quiz.js:171`, and every other Hebrew line from
  `.oplan/word-quiz/quiz-transcript-expected.txt`. Soft line codepoints, verified by this planner:
  `\u05E2\u05D5\u05D3\u0020\u05DC\u05D0\u0020\u2014\u0020\u05E0\u05DE\u05E9\u05D9\u05DA\u0020\u05DC\u05DC\u05DE\u05D5\u05D3\u0020\u05D0\u05EA\u0020\u05D4\u05DE\u05D9\u05DC\u05D4\u0020\u05D4\u05D6\u05D0\u05EA`
  (34 chars; the dash is U+2014, NOT a hyphen).

non-goals: no code file · no test file · do not touch `.oplan/word-quiz/quiz-transcript*.{mjs,txt}`
  (historical and still green — they are criterion 5) · do not "fix" the expected file later; if it
  turns out wrong, that is an INTERVENTION recorded in the journal, not a silent edit (criterion 6
  counts its commits).

tier: ORCHESTRATOR — QZ-21 explicitly requires the orchestrator, not the implementer, to author the
  gate.

depends on: the orchestrator having recorded `$BASE = git rev-parse HEAD` (expected `558a5bc`) in
  the journal.

---

### STEP 2.2: B2 + B5's clock reset — the candidate branch in `applyQuizAnswer`  [tier: WORKER]

goal: `applyQuizAnswer` resolves a `candidate` in one answer — wrong sends it to `learning` and
  resets its promotion clock, right makes it `known` — without entering, or altering, the frozen
  strike machinery.

files: `lib/profile.js` (modify), `tests/profile-quiz-answer.test.js` (append two tests).

commands: none — direct file edits.

validation (frozen; hand over as `.oplan/word-g1/validate-2.2.sh`):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
need() { n=$(grep -cF "$2" "$1") || n=0; [ "$n" -ge 1 ] || { echo "FAIL: missing in $1: $2"; exit 1; }; }
need lib/profile.js "  if (entry.status === 'candidate') {"
need lib/profile.js "      entry.status = 'learning';"
need lib/profile.js "      entry.lastSeen = now;"
node -e '
const s = require("fs").readFileSync("lib/profile.js", "utf8");
const a = s.indexOf("  if (entry.status === \x27candidate\x27) {");
const b = s.indexOf("\n  if (correct) {");
if (a < 0) { console.log("FAIL: no candidate branch"); process.exit(1); }
if (b < 0) { console.log("FAIL: QZ-12 row 1 (the 2-space `if (correct) {`) is gone"); process.exit(1); }
if (a > b) { console.log("FAIL: the candidate branch must come BEFORE the strike machinery"); process.exit(1); }
console.log("BRANCH-ORDER-OK");
' || exit 1
node -e '
import("./lib/profile.js").then((m) => {
  const fail = (w) => { console.log("FAIL: " + w); process.exit(1); };
  // AMENDED at intervention #1 (phase 2, bad-spec): the planner's mk() built a bare
  // { words } object, which validateProfile rejects for six missing top-level keys no
  // matter what applyQuizAnswer does -- the probe could never pass. Rebuilt on
  // m.defaultProfile(), which validates clean. The executor caught it and stopped.
  const mk = (over) => { const p = m.defaultProfile(); p.words.feel = { status: "candidate", source: "tap", he: null, taps: 1,
    firstSeen: "2026-01-01T00:00:00.000Z", lastSeen: "2026-01-01T00:00:00.000Z", nominations: 1, ...over }; return p; };
  let p = mk({});
  m.applyQuizAnswer(p, { lemma: "feel", correct: false, sessionId: "s-1", now: "2026-06-01T00:00:00.000Z" });
  let e = p.words.feel;
  if (e.status !== "learning") fail("a wrong answer did not demote the candidate");
  if (e.lastSeen !== "2026-06-01T00:00:00.000Z") fail("B5 clock was not reset");
  if (e.lastQuizAt !== "2026-06-01T00:00:00.000Z") fail("lastQuizAt not stamped");
  if (e.quizWrong !== 1) fail("quizWrong not incremented");
  if ("strikes" in e) fail("the candidate branch touched the strike machinery");
  if ("lastStrikeSession" in e) fail("the candidate branch armed a strike session");
  if (e.nominations !== 1) fail("nominations must not move here");
  if (!m.validateProfile(p).ok) fail("profile no longer validates after a candidate demotion");
  p = mk({ strikes: 1, needsReview: true, lastStrikeSession: "old", nominations: 2 });
  m.applyQuizAnswer(p, { lemma: "feel", correct: true, sessionId: "s-2", now: "2026-06-01T00:00:00.000Z" });
  e = p.words.feel;
  if (e.status !== "known") fail("a right answer did not promote the candidate");
  if ("strikes" in e || "needsReview" in e || "lastStrikeSession" in e) fail("strike bookkeeping survived the promotion");
  if (e.lastSeen !== "2026-01-01T00:00:00.000Z") fail("a pass must not move lastSeen");
  if (e.quizRight !== 1) fail("quizRight not incremented");
  if (e.nominations !== 2) fail("nominations must not move here");
  p = { words: { feel: { status: "known", source: "tap", he: null, taps: 1,
    firstSeen: "2026-01-01T00:00:00.000Z", lastSeen: "2026-01-01T00:00:00.000Z" } } };
  m.applyQuizAnswer(p, { lemma: "feel", correct: false, sessionId: "s-3", now: "2026-06-01T00:00:00.000Z" });
  if (p.words.feel.status !== "known" || p.words.feel.strikes !== 1) fail("QZ-12 row 2 changed - a claimed word now demotes on one wrong answer");
  p = { words: { feel: { status: "learning", source: "tap", he: null, taps: 1,
    firstSeen: "2026-01-01T00:00:00.000Z", lastSeen: "2026-01-01T00:00:00.000Z" } } };
  m.applyQuizAnswer(p, { lemma: "feel", correct: true, sessionId: "s-4", now: "2026-06-01T00:00:00.000Z" });
  if (p.words.feel.status !== "learning") fail("QZ-12 row 1 changed - a learning word was promoted");
  console.log("CANDIDATE-BRANCH-PROBE-OK");
}).catch((err) => { console.log("FAIL: " + err.message); process.exit(1); });
' || exit 1
flat=$(grep -c '^test(' tests/profile-quiz-answer.test.js) || flat=0
[ "$flat" = "12" ] || { echo "FAIL: profile-quiz-answer.test.js should hold 12 flat tests (10 + 2), got $flat"; exit 1; }
sub=$(grep -c 't\.test(' tests/profile-quiz-answer.test.js) || sub=0
[ "$sub" = "0" ] || { echo "FAIL: subtests are forbidden (the ledger)"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 293"*) ;; *) echo "FAIL: ledger not 293"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 293"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 293"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "lib/profile.js tests/profile-quiz-answer.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-2.2-OK
```

contracts (FROZEN, verbatim — ONE insertion into `lib/profile.js`, nothing else moves):

Insert immediately after the `unknown word` throw (currently `lib/profile.js:452-454`,
`if (!entry) {` / `throw new Error('unknown word');` / `}`) and immediately BEFORE the existing
`  if (correct) {` on line 456, EXACTLY:
```js

  // B2 + B5 (docs/growth.md section 8). A candidate is the APP'S guess, never
  // her claim, so ONE answer resolves it and it never reaches the strike
  // machinery below -- QZ-12's `known` rows stay byte-frozen. A wrong answer
  // also resets the promotion clock (lastSeen = now), which is what stops the
  // promote/fail/promote loop B5 exists to prevent. The D24 counters move for
  // every status, so quiz history stays uniform.
  if (entry.status === 'candidate') {
    entry.lastQuizAt = now;
    if (correct) {
      entry.status = 'known';
      delete entry.strikes;
      delete entry.needsReview;
      delete entry.lastStrikeSession;
      entry.quizRight = (entry.quizRight ?? 0) + 1;
    } else {
      entry.status = 'learning';
      entry.lastSeen = now;
      entry.quizWrong = (entry.quizWrong ?? 0) + 1;
    }
    return profile;
  }
```
  Frozen rule text it implements, quoted from the SIGNED §8 B2: *"Recommendation: (b), one wrong
  answer. … `applyQuizAnswer` demotes only inside `if (entry.status === 'known')`
  (`lib/profile.js:461`). The candidate rule is a new branch BEFORE the strike machinery, so the
  frozen `known` rows of QZ-12 are untouched. A candidate's wrong answer still increments
  `quizWrong`, so the D24 counters stay uniform across statuses."* And from §8 B5:
  *"(d) Reset the clock AND cap automatic nominations at 2 per word."* The cap shipped in phase 1;
  **this is the reset half.**

  FROZEN READINGS, decided here so the worker never has to (each is a RECORD GAP, listed below):
  · the three `delete`s on the pass make a promoted candidate byte-identical in shape to a word
    promoted by her own claim — `markWordKnown` (`lib/profile.js:427-429`) deletes exactly those
    three. `delete` never ADDS a key, so QZ-9's no-backfill promise stays literally true.
  · a pass does NOT move `lastSeen`. B5 specifies the clock reset for DEMOTION only; `lastSeen`
    means "the last time she met the word in text", and inventing a second writer for it is not in
    the record.
  · the wrong branch does NOT touch `needsReview`. QZ-12 sets it false on every claimed-word
    answer; doing that here would add a key to entries that never had one.
  · `nominations` is untouched on both paths. B5's cap counts NOMINATIONS, and only
    `promoteToCandidate` nominates.

  Two new tests appended at the END of `tests/profile-quiz-answer.test.js`, both FLAT top-level
  `test()`, reusing that file's existing `baseWordEntry`/`ALLOWED` helpers (they are at the top of
  the file; do NOT redefine them), pure (imports only from `../lib/profile.js`, no handler, no
  `DATA_DIR`, no `APP_CODE`). One import line may be extended if the test needs `knownLemmaSet` —
  in that case add `import { knownLemmaSet } from '../lib/vocab.js';` as a NEW line and change
  nothing else:
  1. `test('applyQuizAnswer: a candidate answered WRONG returns to learning with its clock reset, counts the answer, and never touches the strike machinery', …)`
     — asserts everything the probe above asserts for the wrong path, `validateProfile(profile).ok`,
     AND the NEGATIVE CONTROL in the same test: a `known` word answered wrong once in a new session
     is still `known` with `strikes === 1` (the one-wrong rule must not have leaked into her claims).
  2. `test('applyQuizAnswer: a candidate answered RIGHT becomes known, clears strike bookkeeping, and leaves lastSeen alone', …)`
     — the right path as above, plus `knownLemmaSet(profile).has(lemma) === true` (the lens the
     story generator uses — field guide 1), plus the NEGATIVE CONTROL: a `learning` word answered
     right is STILL `learning` (QZ-12 row 1: "never promotes"), proving the branch keys on
     `candidate` exactly.

  FAIL-FIRST, required before reporting: (i) delete `entry.lastSeen = now;` → test 1 must FAIL;
  (ii) change the branch condition to `entry.status !== 'known'` → test 2's learning control must
  FAIL; (iii) move the whole branch to AFTER the `if (correct)` block → the wrong-path assertions
  must FAIL. Revert each byte-identically and paste the three failing summary lines.

non-goals: `promoteToCandidate` (phase 1, frozen) · `markWordKnown` · `applyWordTap` ·
  `migrateWordKeys` · `validateProfile` · QZ-12 rows 1-8 — not one character of the existing
  `if (correct)` block or the strike arithmetic below it moves · `api/profile.js` (its `quiz-answer`
  handler already looks the key up directly and returns the whole profile — no change needed) ·
  anything under `public/` · any existing test in this file.

tier: WORKER — one quoted insertion and two tests in the file's established pattern.

depends on: 2.1 committed.

---

### STEP 2.3: B3's quota — `pickCandidateWords` in `public/quiz-core.js`  [tier: WORKER]

goal: `public/quiz-core.js` gains ONE new export that returns at most `limit` candidate lemmas,
  ranked by the very comparator QZ-17 froze, without that comparator moving by a byte and without
  mutating the caller's profile.

files: `public/quiz-core.js` (modify — append only), `tests/quiz-core.test.js` (append one test).

commands: none — direct file edits.

validation (frozen; hand over as `.oplan/word-g1/validate-2.3.sh`):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
node --check public/quiz-core.js || { echo "FAIL: node --check"; exit 1; }
need() { n=$(grep -cF "$2" "$1") || n=0; [ "$n" -ge 1 ] || { echo "FAIL: missing in $1: $2"; exit 1; }; }
need public/quiz-core.js "export function pickCandidateWords(profile, limit = 1) {"
n=$(grep -cF "export function pickQuizWords(profile, limit = 20) {" public/quiz-core.js) || n=0
[ "$n" = "1" ] || { echo "FAIL: the frozen pickQuizWords signature moved"; exit 1; }
n=$(grep -cF "status === 'known'" public/quiz-core.js) || n=0
[ "$n" = "2" ] || { echo "FAIL: expected exactly 2 'known' comparisons, got $n"; exit 1; }
# AMENDED at plan time (orchestrator, amendment #1): the planner wrote 3, but the shadow
# ASSIGNS status: 'known' ({ ...entry, status: 'known' }) and never COMPARES it, so the
# frozen-contract code leaves the comparison count at 2 (knownSetFromProfile, pickQuizWords).
# The guard's job is unchanged: prove no existing 'known' test moved and none was added.
crlf=$(file public/quiz-core.js); case "$crlf" in *CRLF*) ;; *) echo "FAIL: quiz-core.js line endings were normalised"; exit 1;; esac
node -e '
import("./public/quiz-core.js").then((m) => {
  const fail = (w) => { console.log("FAIL: " + w); process.exit(1); };
  const e = (over) => ({ status: "candidate", source: "tap", he: null, taps: 1,
    firstSeen: "2026-01-01T00:00:00.000Z", lastSeen: "2026-01-01T00:00:00.000Z", ...over });
  const profile = { words: {
    aaa: e({ strikes: 2, lastSeen: "2026-01-01T00:00:00.000Z" }),
    bbb: e({ needsReview: true, lastSeen: "2026-01-02T00:00:00.000Z" }),
    ccc: e({ lastSeen: "2026-01-03T00:00:00.000Z" }),
    ddd: e({ lastSeen: "2026-01-05T00:00:00.000Z" }),
    kkk: e({ status: "known", lastSeen: "2026-01-09T00:00:00.000Z" }),
    lll: e({ status: "learning", lastSeen: "2026-01-08T00:00:00.000Z" }),
    zzz: null
  } };
  const before = JSON.stringify(profile);
  const one = m.pickCandidateWords(profile);
  if (JSON.stringify(one) !== JSON.stringify(["aaa"])) fail("default limit is not 1 / wrong head: " + JSON.stringify(one));
  const all = m.pickCandidateWords(profile, 10);
  if (JSON.stringify(all) !== JSON.stringify(["aaa", "bbb", "ddd", "ccc"])) fail("comparator order wrong: " + JSON.stringify(all));
  const known = m.pickQuizWords(profile, 20);
  if (JSON.stringify(known) !== JSON.stringify(["kkk"])) fail("pickQuizWords no longer returns known-only: " + JSON.stringify(known));
  if (JSON.stringify(profile) !== before) fail("pickCandidateWords mutated the profile");
  if (JSON.stringify(m.pickCandidateWords({}, 5)) !== "[]") fail("empty profile must give []");
  if (JSON.stringify(m.pickCandidateWords(null, 5)) !== "[]") fail("null profile must give []");
  console.log("CANDIDATE-PICK-PROBE-OK");
}).catch((err) => { console.log("FAIL: " + err.message); process.exit(1); });
' || exit 1
flat=$(grep -c '^test(' tests/quiz-core.test.js) || flat=0
[ "$flat" = "8" ] || { echo "FAIL: quiz-core.test.js should hold 8 flat tests (7 + 1), got $flat"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 294"*) ;; *) echo "FAIL: ledger not 294"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 294"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 294"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/quiz-core.js tests/quiz-core.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-2.3-OK
```

contracts (FROZEN, verbatim — ONE block appended at the very END of `public/quiz-core.js`, after
`pickQuizWords`; not one existing line changes):
```js

// B3 (docs/growth.md section 8): the candidate slot. A NEW export, so QZ-17's
// comparator above is not touched by a single byte -- candidates are ranked by
// projecting them onto a throwaway profile in which they read as `known` and
// handing THAT to pickQuizWords itself. So "ordered inside its tier by the
// existing comparator" is true by construction, not by a copy that can drift.
// The projection copies each entry, so the caller's profile is never mutated.
// The merge with the known pool happens at the CALL SITE: one candidate per
// sitting, and a candidate with no bank item is skipped in silence (D23).
export function pickCandidateWords(profile, limit = 1) {
  const words = (profile && profile.words) || {};
  const shadow = { words: {} };
  for (const k of Object.keys(words)) {
    const entry = words[k];
    if (entry && typeof entry === 'object' && entry.status === 'candidate') {
      shadow.words[k] = { ...entry, status: 'known' };
    }
  }
  return pickQuizWords(shadow, limit);
}
```
  QZ-17, quoted from `.oplan/word-quiz/plan.md:882-883`: *"Pure ESM, ZERO imports, no `fetch`, no
  DOM, no `Date.now()` except inside `newSessionId`. Exactly six named exports"* — this phase makes
  it SEVEN, under the licence the SIGNED §10 grants: *"QZ-17 (a new export, the comparator
  untouched)"*, and B3's builder note: *"Do this as a NEW export that selects the candidate slot,
  not as a change to the frozen comparator (QZ-17). The merge happens at the call site."* Purity is
  unchanged: still zero imports, no fetch, no DOM, no clock.

  One test appended at the END of `tests/quiz-core.test.js`, exactly one FLAT top-level `test()`,
  extending the existing import block with `pickCandidateWords`:
  `test('pickCandidateWords: candidates only, at most limit, ranked by the frozen comparator, and the profile is never mutated', …)`
  — builds the SAME seven-entry fixture as the probe above and asserts, in order:
  `pickCandidateWords(profile)` deep-equals `['aaa']` (the default quota is ONE);
  `pickCandidateWords(profile, 10)` deep-equals `['aaa','bbb','ddd','ccc']` (clause 1 strikes,
  clause 2 needsReview, clause 4 `lastSeen` descending — the comparator, reached through the
  shadow); `pickQuizWords(profile, 20)` still deep-equals `['kkk']` (the NEGATIVE CONTROL: the
  frozen export did not start returning candidates); `JSON.stringify(profile)` is unchanged;
  `pickCandidateWords({}, 5)` and `pickCandidateWords(null, 5)` are `[]`.

  FAIL-FIRST, required: (i) change `status: 'known'` in the shadow to `status: entry.status` →
  the order/length assertions must FAIL; (ii) change the default `limit = 1` to `limit = 20` →
  the default-quota assertion must FAIL. Revert both byte-identically; paste both failing lines.

non-goals: `pickQuizWords`, `knownSetFromProfile`, `selectOptions`, `isUsableItem`, `pickItem`,
  `newSessionId` — all frozen, all byte-unchanged · no extraction/refactor of the comparator ·
  no import added to this file (it must stay import-free) · `public/quiz.js` (that is 2.4) ·
  the call sites (that is 2.5) · **do not let an editor convert `public/quiz-core.js` from CRLF to
  LF** — it is CRLF on disk and a normalisation makes step 2.10's md5 enumeration a whole-file diff.

tier: WORKER — one appended function and one test in the file's established pattern.

depends on: 2.2 committed.

---

### STEP 2.4: B6(iii) — the softer line, and `wasCandidate` reaching the card  [tier: WORKER]

goal: When a demoted word was a CANDIDATE, the quiz says `עוד לא — נמשיך ללמוד את המילה הזאת`
  and never the claimed-word line; when it was a word she claimed, nothing about the screen
  changes. Both transcripts diff EMPTY.

files: `public/quiz.js` (modify), `tests/quiz-ui.test.js` (append one test).

commands: none — direct file edits. **Write the edits through a script FILE or a byte-preserving
  editor, never `bash -e`/`powershell -Command` — field guide 13 and phase 1's step 1.5 surprise;
  the new string is raw Hebrew containing U+2014. COPY IT from `docs/growth.md:486`. Never retype
  it and never copy Hebrew out of terminal output (field guide 8).**

validation (frozen; hand over as `.oplan/word-g1/validate-2.4.sh`):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
node --check public/quiz.js || { echo "FAIL: node --check"; exit 1; }
crlf=$(file public/quiz.js); case "$crlf" in *CRLF*) ;; *) echo "FAIL: quiz.js line endings were normalised"; exit 1;; esac
node -e '
const SOFT = "\u05E2\u05D5\u05D3 \u05DC\u05D0 \u2014 \u05E0\u05DE\u05E9\u05D9\u05DA \u05DC\u05DC\u05DE\u05D5\u05D3 \u05D0\u05EA \u05D4\u05DE\u05D9\u05DC\u05D4 \u05D4\u05D6\u05D0\u05EA";
const HARD = "\u05D4\u05DE\u05D9\u05DC\u05D4 \u05D4\u05D6\u05D0\u05EA \u05D7\u05D5\u05D6\u05E8\u05EA \u05DC\u05DC\u05DE\u05D9\u05D3\u05D4, \u05E0\u05DC\u05DE\u05D3 \u05D0\u05D5\u05EA\u05D4 \u05E9\u05D5\u05D1 \u05D9\u05D7\u05D3";
const src = require("fs").readFileSync("public/quiz.js", "utf8");
const fail = (w) => { console.log("FAIL: " + w); process.exit(1); };
if (src.split(SOFT).length - 1 !== 1) fail("the soft line must appear exactly once in quiz.js");
if (src.split(HARD).length - 1 !== 1) fail("the hard line must still appear exactly once in quiz.js");
import("./public/quiz.js").then((m) => {
  const item = { sense: "s", sentence: "a ___ b", answer: "x", distractors: ["p","q","r","s","t","u","v","w"] };
  const base = { lemma: "x", item, options: ["x","p","q","r","s","t"], index: 0, total: 4,
                 chosen: "p", correct: false, demoted: true, hintShown: false, wasCandidate: false };
  const cand = m.renderQuizCard({ ...base, wasCandidate: true });
  const claim = m.renderQuizCard(base);
  const none = m.renderQuizCard({ ...base, demoted: false, wasCandidate: true });
  if (cand.indexOf(SOFT) < 0) fail("candidate demotion did not render the soft line");
  if (cand.indexOf(HARD) >= 0) fail("candidate demotion still renders the claimed-word line");
  if (claim.indexOf(HARD) < 0) fail("claimed-word demotion lost its line");
  if (claim.indexOf(SOFT) >= 0) fail("claimed-word demotion renders the soft line");
  if (none.indexOf(SOFT) >= 0 || none.indexOf(HARD) >= 0) fail("a NON-demoting answer renders a demotion line (cry-wolf)");
  for (const [name, html] of [["candidate", cand], ["claimed", claim]]) {
    if (html.split("<p class=\"quiz-demoted\">").length - 1 !== 1) fail("the " + name + " card has != 1 quiz-demoted node - the frozen node order moved");
  }
  return m;
}).then(async (m) => {
  const item = { sense: "s", sentence: "a ___ b", answer: "x", distractors: ["p","q","r","s","t","u","v","w"] };
  const mkC = () => ({ innerHTML: "", querySelector: () => null, querySelectorAll: () => [] });
  const load = async () => item;
  const post = async () => ({ words: { x: { status: "learning" } } });
  let c = mkC();
  let s = await m.startQuiz(c, { lemmas: ["x"], knownSet: new Set(), candidateSet: new Set(["x"]), count: 1, load, post });
  await s.answer("p");
  if (c.innerHTML.indexOf(SOFT) < 0 || c.innerHTML.indexOf(HARD) >= 0) fail("startQuiz did not thread candidateSet into the card");
  c = mkC();
  s = await m.startQuiz(c, { lemmas: ["x"], knownSet: new Set(), count: 1, load, post });
  await s.answer("p");
  if (c.innerHTML.indexOf(HARD) < 0 || c.innerHTML.indexOf(SOFT) >= 0) fail("with no candidateSet the claimed-word line must render (default must be an EMPTY set)");
  console.log("SOFT-LINE-PROBE-OK");
}).catch((err) => { console.log("FAIL: " + err.message); process.exit(1); });
' || exit 1
a=$(node .oplan/word-g1/g1-transcript.mjs) || { echo "FAIL: g1 transcript did not run"; exit 1; }
printf "%s\n" "$a" > "$HOME/g1-scratch/g1-actual.txt"
diff "$HOME/g1-scratch/g1-actual.txt" .oplan/word-g1/g1-transcript-expected.txt || { echo "FAIL: g1 transcript diff is NOT empty"; exit 1; }
b=$(node .oplan/word-quiz/quiz-transcript.mjs) || { echo "FAIL: qz21 transcript did not run"; exit 1; }
printf "%s\n" "$b" > "$HOME/g1-scratch/qz21-actual.txt"
diff "$HOME/g1-scratch/qz21-actual.txt" .oplan/word-quiz/quiz-transcript-expected.txt || { echo "FAIL: the QZ-21 transcript regressed - a claimed-word screen changed"; exit 1; }
cg=$(node scripts/check-contrast.mjs) || { echo "FAIL: contrast gate exit"; exit 1; }
p=$(printf "%s\n" "$cg" | grep -c '^PASS') || p=0
[ "$p" = "52" ] || { echo "FAIL: contrast anchor $p, expected 52"; exit 1; }
flat=$(grep -c '^test(' tests/quiz-ui.test.js) || flat=0
[ "$flat" = "9" ] || { echo "FAIL: quiz-ui.test.js should hold 9 flat tests (8 + 1), got $flat"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 295"*) ;; *) echo "FAIL: ledger not 295"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 295"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 295"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/quiz.js tests/quiz-ui.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-2.4-OK
```

contracts (FROZEN — **QZ-25, the one amendment to QZ-18/QZ-23**, plus four mechanical edits to
`public/quiz.js`; nothing else in the file moves):

**QZ-25 — the candidate demotion line.** `renderQuizCard(state)`'s state gains `wasCandidate`
(bool, default falsy). **The frozen text-node ORDER of QZ-18 as amended by QZ-23 is UNCHANGED —
there is still exactly ONE `<p class="quiz-demoted">` node, in position 7, rendered iff `demoted`.
Only its TEXT branches:** when `wasCandidate` is truthy it reads
`עוד לא — נמשיך ללמוד את המילה הזאת`, otherwise it reads, byte-for-byte as today,
`המילה הזאת חוזרת ללמידה, נלמד אותה שוב יחד`. Same class, same position, no new CSS.
`startQuiz` gains one option, `candidateSet = new Set()`, and each question object gains
`wasCandidate: candidateSet.has(lemma)`. The licence is the SIGNED §10: *"QZ-18 (new text nodes for
the badge and the candidate demotion line)"*, and B6(iii): *"Recommendation: a separate, softer
line. Proposed text… **`עוד לא — נמשיך ללמוד את המילה הזאת`***" — accepted as written in §12.

(a) line 161 becomes exactly:
```js
  const { item, options, index, total, chosen, correct, demoted, hintShown, wasCandidate } = state;
```
(b) the `demotedHtml` expression (currently lines 170-172) becomes exactly:
```js
  // B6(iii): a candidate is a word the APP guessed she knew. She never claimed
  // it, so "goes back to learning" would describe a promotion she never saw
  // herself receive. Same node, same class, same position in the frozen
  // QZ-18/QZ-23 order -- only the text changes.
  const demotedHtml = demoted
    ? wasCandidate
      ? `<p class="quiz-demoted">עוד לא — נמשיך ללמוד את המילה הזאת</p>`
      : `<p class="quiz-demoted">המילה הזאת חוזרת ללמידה, נלמד אותה שוב יחד</p>`
    : '';
```
(c) in `startQuiz`'s destructured options (currently lines 214-223), insert `candidateSet` directly
    after `knownSet,` so the block reads:
```js
    lemmas,
    knownSet,
    candidateSet = new Set(),
    count = 4,
```
(d) the `questions.push(...)` line (currently line 230) becomes exactly:
```js
      questions.push({
        lemma,
        item,
        options: selectOptions(item, knownSet, rand),
        hintShown: false,
        wasCandidate: candidateSet.has(lemma),
      });
```
    and in `renderCurrent` (currently lines 263-278) insert, immediately after
    `      hintShown: q.hintShown,`:
```js
      wasCandidate: q.wasCandidate,
```
  The default `candidateSet = new Set()` is load-bearing: every existing caller and every existing
  test omits it, and must keep rendering the claimed-word line.

  One test appended at the END of `tests/quiz-ui.test.js`, exactly one FLAT top-level `test()`,
  pure (no handler — this file's `withOpenGate`/`withTempDataDir` are NOT needed and must not be
  invoked). Hebrew literals in the test file are written with `\u` escapes, not pasted characters:
  `test('B6(iii): a demoted candidate gets the softer line, a demoted claim keeps its own, and neither appears without a demotion', …)`
  — asserts, on `renderQuizCard`: soft present / hard absent when `wasCandidate: true, demoted: true`;
  hard present / soft absent when `wasCandidate: false, demoted: true` (the cry-wolf negative
  control); NEITHER present when `demoted: false, wasCandidate: true`; exactly ONE
  `<p class="quiz-demoted">` in each demoted card. And on `startQuiz` with a fake container and stub
  `load`/`post`: `candidateSet: new Set([lemma])` yields the soft line, and OMITTING `candidateSet`
  entirely yields the hard line.

  FAIL-FIRST, required: (i) drop the `wasCandidate` ternary so both cases render the soft line →
  the claimed-word half of the new test AND the QZ-21 transcript diff must both FAIL; (ii) remove
  `wasCandidate: q.wasCandidate` from `renderCurrent` → the `startQuiz` half must FAIL. Revert both
  byte-identically and paste both failing summary lines plus the failing transcript diff.

non-goals: the `VIEW_STYLE` block — **no new CSS rule, no new class, no raw hex, no `color-mix()`**
  (the contrast anchor must stay 52 with the gate file untouched) · `renderOptions`,
  `renderQuizDone`, `createQuizSession`, `answerBody`, `loadItem`, `session.hint`, `session.next`,
  `bind()` · the `demoted` expression in `session.answer` (`resp.words[q.lemma].status ===
  'learning'` is still sound: a candidate that answers wrong is `learning`-after-POST too) · the
  eight existing tests in `quiz-ui.test.js`, including its frozen-needle list (the hard line stays
  in it and must still pass) · `public/styles.css` · the call sites (that is 2.5) ·
  `.oplan/word-g1/g1-transcript-expected.txt` — **if the diff is not empty, the CODE is wrong; the
  expected file is never edited** (criterion 6 counts its commits) · **do not let an editor convert
  `public/quiz.js` from CRLF to LF.**

tier: WORKER — four quoted edits and one test in an established pattern.

depends on: 2.1 (both transcript files) and 2.3 committed.

---

### STEP 2.5: the merge at the call sites — one candidate per sitting  [tier: WORKER]

goal: Both places that start a quiz put at most ONE candidate at the head of the word list and tell
  the quiz which lemma that was — with the identical frozen three statements in each file.

files: `public/views/words.js` (modify), `public/views/reader.js` (modify),
  `tests/words-ui.test.js` (append one test), `tests/reader-ui.test.js` (append one test).

commands: none — direct file edits. Both view files are CRLF and contain raw Hebrew — edit through
  a byte-preserving path, never `bash -e`.

validation (frozen; hand over as `.oplan/word-g1/validate-2.5.sh`):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
for f in public/views/words.js public/views/reader.js; do
  node --check "$f" || { echo "FAIL: node --check $f"; exit 1; }
  crlf=$(file "$f"); case "$crlf" in *CRLF*) ;; *) echo "FAIL: $f line endings were normalised"; exit 1;; esac
  n=$(grep -cF 'import { pickQuizWords, knownSetFromProfile, pickCandidateWords } from "../quiz-core.js";' "$f") || n=0
  [ "$n" = "1" ] || { echo "FAIL: $f import line"; exit 1; }
  n=$(grep -cF 'const candidateLemmas = pickCandidateWords(profile, 1);' "$f") || n=0
  [ "$n" = "1" ] || { echo "FAIL: $f missing the frozen candidate pick"; exit 1; }
  n=$(grep -cF 'candidateSet = new Set(candidateLemmas);' "$f") || n=0
  [ "$n" = "1" ] || { echo "FAIL: $f missing the frozen candidateSet assignment"; exit 1; }
  n=$(grep -cF 'lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));' "$f") || n=0
  [ "$n" = "1" ] || { echo "FAIL: $f missing the frozen merge"; exit 1; }
  n=$(grep -cF 'lemmas = pickQuizWords(profile, 20);' "$f") || n=0
  [ "$n" = "0" ] || { echo "FAIL: $f still has the OLD unmerged pick"; exit 1; }
  n=$(grep -c 'candidateSet' "$f") || n=0
  [ "$n" = "3" ] || { echo "FAIL: $f mentions candidateSet $n times, expected exactly 3 (declaration, assignment, pass-through)"; exit 1; }
  n=$(grep -cF 'candidateSet,' "$f") || n=0
  [ "$n" = "1" ] || { echo "FAIL: $f does not pass candidateSet into startQuiz"; exit 1; }
done
fw=$(grep -c '^test(' tests/words-ui.test.js) || fw=0
[ "$fw" = "12" ] || { echo "FAIL: words-ui.test.js should hold 12 flat tests (11 + 1), got $fw"; exit 1; }
fr=$(grep -c '^test(' tests/reader-ui.test.js) || fr=0
[ "$fr" = "12" ] || { echo "FAIL: reader-ui.test.js should hold 12 flat tests (11 + 1), got $fr"; exit 1; }
cg=$(node scripts/check-contrast.mjs) || { echo "FAIL: contrast gate exit"; exit 1; }
p=$(printf "%s\n" "$cg" | grep -c '^PASS') || p=0
[ "$p" = "52" ] || { echo "FAIL: contrast anchor $p, expected 52"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 297"*) ;; *) echo "FAIL: ledger not 297"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 297"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 297"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/views/reader.js public/views/words.js tests/reader-ui.test.js tests/words-ui.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-2.5-OK
```

contracts (FROZEN, verbatim):

The comment + three statements below are IDENTICAL in both files apart from indentation (4 spaces
in `words.js`, 6 in `reader.js`, matching the surrounding block):
```js
    // B3 (docs/growth.md section 8): at most ONE candidate per sitting, merged
    // ahead of the known pool HERE, at the call site, so QZ-17's comparator is
    // untouched. The slot is RESERVED, not leftover: a candidate that is never
    // reached can never become known. A candidate with no bank item is skipped
    // in silence (D23), so an empty slot costs nothing.
    const candidateLemmas = pickCandidateWords(profile, 1);
    candidateSet = new Set(candidateLemmas);
    lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));
```

`public/views/words.js` — four edits:
  (a) line 5 becomes exactly:
```js
import { pickQuizWords, knownSetFromProfile, pickCandidateWords } from "../quiz-core.js";
```
  (b) immediately after `  let lemmas = [];` (line 198) insert:
```js
  let candidateSet = new Set();
```
  (c) in `boot()`, the single line `    lemmas = pickQuizWords(profile, 20);` (line 267) is
      REPLACED by the frozen block above at 4-space indent.
  (d) in the `start-quiz` click handler (lines 243-248), insert `          candidateSet,`
      immediately after `          knownSet: knownSetFromProfile(profile),`.

`public/views/reader.js` — four edits:
  (a) line 5 becomes exactly:
```js
import { pickQuizWords, knownSetFromProfile, pickCandidateWords } from "../quiz-core.js";
```
  (b) immediately after `  let knownSet = new Set();` (line 328) insert:
```js
  let candidateSet = new Set();
```
  (c) in `boot()`, the line `      lemmas = pickQuizWords(profile, 20);` (line 335) is REPLACED by
      the frozen block above at 6-space indent; the following line
      `      knownSet = knownSetFromProfile(profile);` stays exactly where it is, after the block.
  (d) in the `startQuiz(slot, {...})` call (lines 726-734), insert `          candidateSet,`
      immediately after `          knownSet,`.

  `count: 4` stays 4 in both places. B3, quoted: *"of the 4 words in an after-chapter check, at most
  one is a candidate; the rest come from the existing pool"* — the candidate occupies one of the
  four, it does not add a fifth (D17 froze 4).

  One test appended at the END of each UI test file, exactly one FLAT top-level `test()` each,
  following that file's existing source-needle pattern (`words-ui.test.js:209` and
  `reader-ui.test.js:171` are the models — read them, they are in the file):
  · `tests/words-ui.test.js`:
    `test('words.js reserves one candidate slot: the frozen merge, candidateSet, and the pre-existing quiz wiring', …)`
  · `tests/reader-ui.test.js`:
    `test('reader.js reserves one candidate slot: the frozen merge, candidateSet, and the pre-existing quiz wiring', …)`
  Each reads its own `viewPath` source and asserts these needles are present:
  `pickCandidateWords`, `const candidateLemmas = pickCandidateWords(profile, 1);`,
  `candidateSet = new Set(candidateLemmas);`,
  `lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));`, `candidateSet,`,
  `startQuiz`, `knownSetFromProfile`, `count: 4`; and asserts the OLD line
  `lemmas = pickQuizWords(profile, 20);` is ABSENT (the negative control that proves the merge
  replaced it rather than sitting beside it).

  FAIL-FIRST, required: in each file, revert (c) to the old single line and confirm ONLY that
  file's new test fails; restore byte-identically. Paste both failing summary lines.

non-goals: `renderList`, `statusBadge`, `renderQuizLauncher`, `markKnownBody`, `bindEvents`,
  `draw`, the sort order, the empty state (words.js) · `sentenceFor`, `afterChapterStage`,
  `chapterQuizState`, the popup, the tap handler (reader.js) · any style block in either file ·
  `public/quiz.js`, `public/quiz-core.js` · any existing test in either UI test file · `count`
  changing from 4 · a second candidate slot · **no CRLF→LF normalisation of either view.**

tier: WORKER — eight quoted edits and two tests in an established pattern.

depends on: 2.3 and 2.4 committed.

---

### STEP 2.6: the child's experience, end to end — episode 6  [tier: WORKER, fresh]

goal: One test drives the REAL handler and the REAL quiz component through the whole phase: G1
  nominates, the quota asks exactly one candidate first, a wrong answer takes it back with the
  softer words and a reset clock that G1 cannot immediately undo, a right answer makes it truly
  `known`, and a candidate with no bank item is silence.

files: `tests/quiz-experience.test.js` (append one test; its import block may be extended).

commands: none — direct file edits.

validation (frozen; hand over as `.oplan/word-g1/validate-2.6.sh`):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
flat=$(grep -c '^test(' tests/quiz-experience.test.js) || flat=0
[ "$flat" = "6" ] || { echo "FAIL: quiz-experience.test.js should hold 6 flat tests (5 + 1), got $flat"; exit 1; }
sub=$(grep -c 't\.test(' tests/quiz-experience.test.js) || sub=0
[ "$sub" = "0" ] || { echo "FAIL: subtests are forbidden (the ledger)"; exit 1; }
ep=$(node --test tests/quiz-experience.test.js 2>&1) || { echo "FAIL: episode file red"; printf "%s\n" "$ep" | tail -30; exit 1; }
case "$ep" in *"# pass 6"*) ;; *) echo "FAIL: episode file not 6 passing"; printf "%s\n" "$ep" | tail -15; exit 1;; esac
case "$ep" in *"# fail 0"*) ;; *) echo "FAIL: episode file has failures"; exit 1;; esac
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 298"*) ;; *) echo "FAIL: ledger not 298"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 298"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 298"; exit 1;; esac
[ ! -f .data/profile.json ] || { echo "FAIL: .data/profile.json exists - a test wrote outside its temp DATA_DIR"; exit 1; }
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "tests/quiz-experience.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-2.6-OK
```

contracts (FROZEN):

  The file's existing harness is REUSED VERBATIM and must not be redefined: `withTempDataDir`,
  `withOpenGate`, `createMockRes`, `createPostReq`, `createGetReq`, `makeItem`, `makeContainer`,
  `makeRealPost`, `getProfile` (they are at the top of the file, lines 23-105). Extend the import
  block with exactly these lines and nothing else:
```js
import { loadProfile, saveProfile } from '../lib/store.js';
import { defaultProfile, promoteToCandidate } from '../lib/profile.js';
```
  and add `pickCandidateWords, knownSetFromProfile` to the existing
  `import { pickQuizWords } from '../public/quiz-core.js';`.

  ONE flat top-level test, appended at the END, wrapped `withOpenGate(() => withTempDataDir(...))`
  exactly as episodes 1-5 are:
  `test('episode 6: G1 nominates, the quota asks ONE candidate first, one wrong answer takes it back kindly with the clock reset, one right answer makes it known, and a candidate with no item is silence', …)`

  FIXTURE, frozen (all lemmas are plain lowercase ASCII so `tokenize`/`baseForms` match them —
  VERIFIED by the planner: `baseForms('lantern') === ['lantern']`, likewise `pebble`, `kettle`):
```js
    const p = defaultProfile();
    const learning = (lastSeen) => ({ status: 'learning', source: 'tap', he: null, taps: 1,
      firstSeen: '2026-01-01T00:00:00.000Z', lastSeen });
    p.words.lantern = learning('2026-01-03T00:00:00.000Z');
    p.words.pebble  = learning('2026-01-02T00:00:00.000Z');
    p.words.kettle  = learning('2026-01-01T00:00:00.000Z');
    p.story.chapters = [
      { n: 1, text: 'The lantern and the pebble and the kettle were here.', generatedAt: '2026-02-01T00:00:00.000Z' },
      { n: 2, text: 'The lantern and the pebble and the kettle were here again.', generatedAt: '2026-03-01T00:00:00.000Z' },
    ];
    promoteToCandidate(p);
    await saveProfile(p);
    const post = makeRealPost();
    await post({ action: 'mark-known', lemma: 'basket', source: 'tap' });
    await post({ action: 'mark-known', lemma: 'ladder', source: 'tap' });
```
  ASSERTIONS, frozen, in this order (Hebrew written as `\u` escapes, never pasted):

  SITTING 1 — the wrong answer.
  · `profile = await getProfile()`; all three of `lantern`/`pebble`/`kettle` are `candidate` with
    `nominations === 1` (G1's producer really ran).
  · `const candidateLemmas = pickCandidateWords(profile, 1);` deep-equals `['lantern']` — the QUOTA
    is one, and the comparator picked the most recent `lastSeen`.
  · `const lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));` — `lemmas[0] === 'lantern'`
    and `lemmas.filter((l) => l === 'lantern' || l === 'pebble' || l === 'kettle').length === 1`
    (exactly one candidate reaches the sitting).
  · `startQuiz` with that `lemmas`, `knownSet: knownSetFromProfile(profile)`,
    `candidateSet: new Set(candidateLemmas)`, `count: 4`, `load: async (lemma) => makeItem(lemma)`,
    `post`. `session.questions[0].lemma === 'lantern'`.
  · `await session.answer(session.questions[0].item.distractors[0])` (a wrong option).
  · `container.innerHTML` CONTAINS the soft line and does NOT contain the hard line — the cry-wolf
    negative control field guide 2 demands.
  · after a fresh `getProfile()`: `lantern.status === 'learning'`; `lantern.quizWrong === 1`;
    `'strikes' in lantern === false`; `lantern.lastSeen !== '2026-01-03T00:00:00.000Z'` (B5's clock
    moved); `knownLemmaSet(profile2).has('lantern') === false`.
  · **THE LOOP IS CLOSED:** `promoteToCandidate(profile2)` leaves `lantern.status === 'learning'` —
    the two chapters are now older than its `lastSeen`, so G1 cannot re-nominate it on the next
    generation. This is the property B5 exists for and nothing else in the suite proves it.

  SITTING 2 — the right answer.
  · fresh `getProfile()`; `pickCandidateWords(profile3, 1)` deep-equals `['pebble']`.
  · a fresh `startQuiz` on `['pebble']` with `candidateSet: new Set(['pebble'])`, answer
    `session.questions[0].item.answer`.
  · `container.innerHTML` contains NEITHER demotion line.
  · after: `pebble.status === 'known'`, `knownLemmaSet(...).has('pebble') === true`,
    `pebble.quizRight === 1`, `'strikes' in pebble === false`, `pebble.nominations === 1`.

  SITTING 3 — the missing item is silence (D23).
  · fresh `getProfile()`; `pickCandidateWords(profile4, 1)` deep-equals `['kettle']`.
  · a `load` that returns `null` for `kettle` and `makeItem(lemma)` otherwise; a `post` wrapper that
    records every call.
  · `session.questions.map((q) => q.lemma)` does NOT contain `kettle`; the known words are still
    asked; no recorded call has `lemma === 'kettle'`; after the sitting `kettle.status` is still
    `'candidate'` with no `lastQuizAt`, no `quizRight`, no `quizWrong` key.

  FAIL-FIRST, required: comment out the `wasCandidate` line in `public/quiz.js`'s `renderCurrent`
  and confirm ONLY this new test fails; restore byte-identically; paste both summary lines.

non-goals: episodes 1-5 — not one character changes · no new harness helper · no change to any
  file outside `tests/quiz-experience.test.js` · no real network, no real `fetch` (always inject
  `load`/`post`) · no assertion about `public/quiz/*.json` (the bank is phase 3's business) ·
  no writing outside the temp `DATA_DIR` (the validation checks `.data/profile.json` is absent).

tier: WORKER — but dispatch to a FRESH worker that did NOT write 2.2-2.5, and instruct it to try to
  break the implementation. That is exactly how `4.6` was run and it is the reason this file
  catches things the unit tests do not.

depends on: 2.5 committed.

---

### STEP 2.7: CACHE bump `magic-vet-v16` → `magic-vet-v17` — LAST code change  [tier: WORKER]

goal: QZ-22 satisfied: one CACHE bump, after every precached file this phase touches
  (`/quiz-core.js`, `/quiz.js`, `/views/words.js`, `/views/reader.js` are ALL in `PRECACHE`), so her
  phone actually receives the new quiz.

files: `public/sw.js` (modify), `tests/shell.test.js` (modify).

commands: none — direct file edits.

validation (frozen; hand over as `.oplan/word-g1/validate-2.7.sh`):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
first=$(head -1 public/sw.js)
[ "$first" = 'const CACHE = "magic-vet-v17";' ] || { echo "FAIL: sw.js line 1 = [$first]"; exit 1; }
stale=$(grep -rln 'magic-vet-v16' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.oplan . | tr '\n' ' ')
[ -z "$stale" ] || { echo "FAIL: magic-vet-v16 survives in: $stale"; exit 1; }
n=$(grep -cF "assert.ok(sw.includes('magic-vet-v17'));" tests/shell.test.js) || n=0
[ "$n" = "1" ] || { echo "FAIL: shell.test.js does not pin v17"; exit 1; }
node -e '
const s = require("fs").readFileSync("public/sw.js", "utf8");
const m = s.match(/PRECACHE\s*=\s*(\[[\s\S]*?\])/);
if (!m) { console.log("FAIL: no PRECACHE array"); process.exit(1); }
const a = JSON.parse(m[1]);
const want = ["/","/styles.css","/app.js","/api.js","/lemma.js","/words-index.js","/quiz-core.js","/quiz.js","/views/home.js","/views/placement.js","/views/reader.js","/views/words.js","/manifest.webmanifest","/icons/icon.svg"];
if (JSON.stringify(a) !== JSON.stringify(want)) { console.log("FAIL: PRECACHE changed"); process.exit(1); }
console.log("PRECACHE-FROZEN-OK");
' || exit 1
lf=$(file public/sw.js); case "$lf" in *CRLF*) echo "FAIL: sw.js gained CRLF line endings"; exit 1;; esac
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 298"*) ;; *) echo "FAIL: ledger not 298"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/sw.js tests/shell.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-2.7-OK
```

contracts (FROZEN, verbatim — exactly two literal edits, the only two occurrences outside `.oplan/`,
VERIFIED by the planner today):
  `public/sw.js:1`  `const CACHE = "magic-vet-v16";` → `const CACHE = "magic-vet-v17";`
  `tests/shell.test.js:58`  `assert.ok(sw.includes('magic-vet-v16'));` →
  `assert.ok(sw.includes('magic-vet-v17'));`
  QZ-22, quoted from the SIGNED §10: *"Any change under `public/` ships with a `sw.js` `CACHE` bump
  in the same phase."* The `PRECACHE` array is byte-frozen — no file is added or removed; all four
  changed modules are already in it.

non-goals: the `PRECACHE` array · the install/activate/fetch handlers · `public/app.js`'s
  controllerchange auto-reload · `public/manifest.webmanifest` · any other version string ·
  `.oplan/` records of v16-as-live (historical — never edit them) · no new test (298).

tier: WORKER — two literal edits.

depends on: 2.6 committed. MUST be the last code change of the phase.

---

### STEP 2.8: sandbox visual gate — the orchestrator answers a quiz wrong  [tier: ORCHESTRATOR]

goal: The candidate question and the softer line are SEEN, in a real browser, in RTL, on the
  sandbox — before anything reaches production. Objective defects fixed; taste verdicts recorded.

files: none in the repo. Scratch and the sandbox profile edit live OUTSIDE the repo, under
  `$HOME/g1-scratch/` and `C:/Users/dkreinov/english-app-sandbox/` (field guide 4).

commands (orchestrator's shell, in order):
  1. `cp C:/Users/dkreinov/english-app-sandbox/profile.json $HOME/g1-scratch/sandbox-profile-p2.bak`
  2. Edit the SANDBOX profile only: set `camp` to `"status": "candidate"` with `"nominations": 1`,
     leave the other 11 words `known`. (MEASURED by the planner today: the sandbox profile holds
     exactly 12 words, all `known`, 1 chapter, `placement.completed = true`, and **all 12 have a
     bank item under `public/quiz/`** — so the candidate is guaranteed to be asked.)
  3. `DATA_DIR='C:\Users\dkreinov\english-app-sandbox' npm run dev`
  4. Sandbox browser → `http://localhost:3000` → HARD-RELOAD past the stale localhost service
     worker (field guide 12) → המילים שלי → `בואי נתרגל מילים` → screenshot the FIRST question →
     answer it WRONG → screenshot the feedback screen, with a zoom on the demotion line.
  5. Restore: `cp $HOME/g1-scratch/sandbox-profile-p2.bak C:/Users/dkreinov/english-app-sandbox/profile.json`

validation: NOT mechanical, deliberately (field guide 1; the mechanical half is 2.4's probe, 2.6's
episode and criterion 6's transcript). Passes when the orchestrator has recorded, in the journal, a
verdict on each of these five, with both screenshots referenced:
  (1) `עוד לא — נמשיך ללמוד את המילה הזאת` renders on one line, legible, correct RTL, no overflow;
  (2) the claimed-word line `המילה הזאת חוזרת ללמידה, נלמד אותה שוב יחד` is NOWHERE on the screen;
  (3) `camp` was the FIRST question of the sitting and the only candidate in it;
  (4) everything else on the card is unchanged from v16 — progress, prompt, LTR sentence, the רמז
      button then the revealed gloss, six options with speakers, `כמעט!` feedback, `הלאה`;
  (5) after `הלאה` to the end, המילים שלי shows `camp` with the `לומדת` badge and its claim button,
      and nothing else on that screen changed.
Objective defects (overflow, collision, illegible, wrong line) are FIXED as a follow-up to 2.4 with
a fresh changed-set check and a re-run of BOTH transcript diffs before 2.9; taste-only items are
recorded as KEEP and named to the owner in the post-deploy report.

contracts: NEVER a browser on production (field guide 12) · never `GET /api/profile` against
  production · the sandbox profile is a fixture, not her data · `git status --porcelain` must be
  empty when this step ends · the sandbox profile is restored byte-from-backup and the dev server
  stopped before the step is recorded.

non-goals: re-skinning anything · changing any Hebrew string on a hunch (they are owner-signed —
  §12 B6) · asking the owner to eyeball this (owner directive: visual gates are self-served) ·
  installing or testing the PWA · touching `.data/`.

tier: ORCHESTRATOR — a browser and a judgment call, not pattern work.

depends on: 2.7 committed and green.

---

### STEP 2.9: the D25 capture — her live profile, backed up before the deploy  [tier: ORCHESTRATOR]

goal: A timestamped, proven copy of her live profile exists outside the repo BEFORE the first deploy
  that can rewrite her word statuses through the quiz.

files: none in the repo except an appended line in `.oplan/word-g1/backup-receipt.txt` (SHA-256 +
  counts ONLY, never contents). The capture lands in `C:/Users/dkreinov/english-app-backups/` (D27;
  the folder is EMPTY right now — phase 1's capture was deleted at the owner's instruction,
  journal:246-251, so **there is currently no safety net at all**).

commands: **THE CAPTURE COMMAND IS FROZEN — this exact form, no improvisation at run time.** Source:
  `.oplan/word-quiz/plan.md:1573-1586`, reused verbatim by phase 1 steps 1.8 and 1.10:
```bash
set -o pipefail
mkdir -p /c/Users/dkreinov/english-app-backups   # Git-Bash path form -- a Windows-style path here creates a stray repo file (field guide 4)
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
printf "phase2 capture %s sha256=%s\n" "$BK" "$sha" >> .oplan/word-g1/backup-receipt.txt
inside=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | tr '\n' ' ')
[ -z "$inside" ] || { echo "FAIL: repo is dirty outside .oplan: $inside"; exit 1; }
[ ! -f .data/profile.json ] || { echo "FAIL: .data/profile.json exists"; exit 1; }
echo STEP-2.9-OK
```

contracts: the backup destination is `C:/Users/dkreinov/english-app-backups/` (D27) · capture-only —
  **there is no restore path**; `vercel rollback` restores CODE only · only SHA-256 + counts are
  ever recorded in the workspace, never contents · never `vercel env` · never probe the live profile
  outside this sanctioned read and 2.11's · `APP_CODE` must never enter the orchestrator's shell.
  **THE D27 RIDER, restated for this phase:** the owner answered it at the phase-1 close ("Delete it
  now (as last run)"), and that answer was about phase 1's capture. The SAFE default here is
  KEEP-until-answered, exactly as phase 1 executed it: the question goes in the phase-2 close report,
  the deletion happens strictly AFTER 2.11 and the criteria re-run, and the journal states plainly
  that the safety net ends there. Do not pre-delete on the assumption that "as last run" was a
  standing order (RECORD GAP 4).

non-goals: any restore tooling · reading her profile for any purpose other than this capture and
  2.11's read-back · a second capture (if more than an hour elapses between this step and 2.10,
  re-capture with the same command and use the LATER file as `$BK`) · deploying (that is 2.10).

tier: ORCHESTRATOR — touches the live system and a secret.

depends on: 2.8 recorded (code frozen, nothing left to change).

---

### STEP 2.10: deploy to production per the frozen recipe  [tier: ORCHESTRATOR]

goal: `magic-vet-v17` live on the canonical alias; the outgoing deployment recorded as the rollback
  target BEFORE deploying; the five changed `public/` files proven live in BYTES.

files: none in the repo. Scratch ONLY at `$HOME/g1-deploy2/`.

commands (orchestrator's shell, in order — recipe from `.oplan/word-audio/phase-state.md:55-66`,
field guide 10):
  1. `mkdir -p $HOME/g1-deploy2`
  2. `"$(npm prefix -g)/vercel" inspect https://english-app-three-tan.vercel.app 2>&1 | tee $HOME/g1-deploy2/outgoing.txt`
     — **HARD STOP** if the reported id is not `dpl_9yj3HbhU7p5ZNAGQHUeTCvM2D3Dc`. Record the id AND
     **the deployment url exactly as `inspect` reports it** in the journal BEFORE deploying; that
     pair is the rollback target. **Do NOT construct the url from the deployment name** — phase 1
     inherited a constructed url that pointed at the wrong deployment and had to correct it
     (journal:211-215). Write the rollback line into `phase-state.md` verbatim before deploying and
     re-confirm after.
  3. `"$(npm prefix -g)/vercel" deploy --prod --yes` — **once.** If the output is truncated, read the
     file, do not re-invoke (phase 1 deployed twice for exactly that reason).
  4. Record the new deployment id and the upload size in the journal.

validation (frozen):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
D="$HOME/g1-deploy2"; mkdir -p "$D"
U=https://english-app-three-tan.vercel.app
files=$(git diff --name-only --diff-filter=ACMR 558a5bc..HEAD -- public/ | LC_ALL=C sort | tr '\n' ' ')
[ "$files" = "public/quiz-core.js public/quiz.js public/sw.js public/views/reader.js public/views/words.js " ] || { echo "FAIL: public/ enumeration = [$files]"; exit 1; }
curl -s --ssl-no-revoke -o "$D/sw.js"        "$U/sw.js"            || { echo "FAIL: fetch /sw.js"; exit 1; }
curl -s --ssl-no-revoke -o "$D/quiz-core.js" "$U/quiz-core.js"     || { echo "FAIL: fetch /quiz-core.js"; exit 1; }
curl -s --ssl-no-revoke -o "$D/quiz.js"      "$U/quiz.js"          || { echo "FAIL: fetch /quiz.js"; exit 1; }
curl -s --ssl-no-revoke -o "$D/words.js"     "$U/views/words.js"   || { echo "FAIL: fetch /views/words.js"; exit 1; }
curl -s --ssl-no-revoke -o "$D/reader.js"    "$U/views/reader.js"  || { echo "FAIL: fetch /views/reader.js"; exit 1; }
curl -s --ssl-no-revoke -o "$D/health"       "$U/api/health"       || { echo "FAIL: fetch /api/health"; exit 1; }
code=$(curl -s --ssl-no-revoke -o "$D/chapter" -w '%{http_code}' "$U/api/chapter")
[ "$code" = "401" ] || { echo "FAIL: /api/chapter -> $code (expected 401)"; exit 1; }
check() { a=$(md5sum "$1" | awk '{print $1}'); b=$(md5sum "$2" | awk '{print $1}'); [ "$a" = "$b" ] || { echo "FAIL: $1 md5 worktree=$a live=$b"; exit 1; }; }
check public/sw.js           "$D/sw.js"
check public/quiz-core.js    "$D/quiz-core.js"
check public/quiz.js         "$D/quiz.js"
check public/views/words.js  "$D/words.js"
check public/views/reader.js "$D/reader.js"
n=$(grep -cF 'magic-vet-v17' "$D/sw.js") || n=0; [ "$n" -ge 1 ] || { echo "FAIL: live sw.js is not v17"; exit 1; }
n=$(grep -cF 'magic-vet-v16' "$D/sw.js") || n=0; [ "$n" = "0" ]  || { echo "FAIL: live sw.js still names v16"; exit 1; }
h=$(cat "$D/health")
[ "$h" = '{"ok":true,"data":{"status":"up","version":1}}' ] || { echo "FAIL: health payload = $h"; exit 1; }
[ -s "$D/outgoing.txt" ] || { echo "FAIL: no recorded outgoing deployment"; exit 1; }
echo DEPLOY-V17-OK
```
  `558a5bc` is frozen as the enumeration base: it is the commit whose `public/` bytes are live now —
  VERIFIED at plan time (`git diff --name-only 70d0aa7..558a5bc -- public/` is EMPTY, and 70d0aa7's
  bytes were md5-proven live at phase-1 step 1.9). `--diff-filter=ACMR` is load-bearing. Hash FILES,
  never `$(curl …)` output — command substitution strips trailing newlines and has already produced
  one false failure in this project. md5 against the **WORKTREE**, never a git blob: four of the
  five files are CRLF on disk and LF in git, and the CLI uploads worktree bytes.

contracts: `vercel` is off PATH — always `"$(npm prefix -g)/vercel"` · `curl` needs
  `--ssl-no-revoke` on this machine · `cleanUrls` 308s `*.html` — `.js` paths are fetched directly ·
  ROLLBACK (code only) uses the url `vercel inspect` reported at step 2, for
  `dpl_9yj3HbhU7p5ZNAGQHUeTCvM2D3Dc`.

non-goals: NEVER request `/api/profile` here (a GET creates one; the sanctioned read is 2.11) ·
  never `vercel env` · never a browser on production · never the real `APP_CODE` in this shell ·
  no `.data/` touches · no manual alias or promote · no deploy before `inspect` has recorded the
  outgoing id.

tier: ORCHESTRATOR — touches the live system.

depends on: 2.9 (`STEP-2.9-OK`) and criteria 1-8 green.

---

### STEP 2.11: her data, read back and proven intact  [tier: ORCHESTRATOR]

goal: The one check ever run against her real data: nothing she collected was lost, and every status
  that moved is mechanically explained.

files: none in the repo except an appended line in `.oplan/word-g1/backup-receipt.txt` (counts only).

commands: the SAME frozen subshell capture form as 2.9, writing to
  `$HOME/g1-deploy2/live-readback.json`; `$BK` from 2.9 must still exist.

validation (frozen):
```bash
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
LB="$HOME/g1-deploy2/live-readback.json"
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
echo STEP-2.11-OK
```
  The activity-field list and the `learning→candidate ⇒ nominations+1` clause are phase 1's
  amendment to the word-quiz criterion-10 rule (`.oplan/word-quiz/plan.md:1512-1516`), carried over
  unchanged. The transitions this phase newly makes possible — `candidate → known` (a quiz pass:
  `lastQuizAt` and `quizRight` move) and `candidate → learning` (a quiz fail: `lastQuizAt`,
  `quizWrong` and `lastSeen` move) — are already covered by the ACT list, so the rule needs no
  further amendment. They are REPORTED, not silently accepted.

contracts: any lost key, or a status change with no activity evidence → **STOP, roll back code with
  the 2.10 rollback command, tell the owner** · never write her profile bytes into the repo · the
  D27 deletion happens only AFTER this step and the criteria re-run, and only once the owner has
  answered the close-report question; the journal records that the safety net ends there.

non-goals: "fixing" her data · re-running the deploy · reading her profile again for any other
  reason · asserting that a candidate exists — `candidates=0` is a legitimate outcome and was the
  measured one at phase 1's close (see RISKS).

tier: ORCHESTRATOR — touches the live system and a secret.

depends on: 2.10 (`DEPLOY-V17-OK`) and 2.9's `$BK`.

---

RISKS

- **G1 may still have nominated nothing.** Phase 1's read-back measured `candidates=0`, and G1 only
  runs on a chapter generation. If she has not generated a chapter since 2026-07-28, this phase
  deploys a fully working consumer with nothing to consume. Deliberately NOT an acceptance
  criterion: 2.11 prints `candidates=N`, so the fact is measured and reported either way.
- **B7's deadlock is still open.** A candidate whose lemma has no `public/quiz/<lemma>.json` can
  never be asked and so can never become `known`. Phase 2 does not close that — phase 3 does. The
  close report must say so in those words rather than claiming G1 is "done".
- **The quota can starve strike-bearing `known` words.** One of the four after-chapter slots is
  reserved for a candidate, so a word actively degrading her stories may wait a sitting longer.
  This is B3 as signed; noticed as a `known` word lingering with `strikes: 1-2`.
- **`wasCandidate` is a client-side snapshot** taken when the view booted. If the profile changed
  server-side mid-sitting the wording could be wrong. Cost: one message in the wrong tone. Not
  worth a round trip to the server; stated so it is not re-debugged.
- **A stale cached shell (v16) against a v17 server** renders a candidate demotion with the OLD
  claimed-word line — `renderQuizCard` simply ignores the new field. It degrades gracefully and the
  auto-reload fixes it on her next open. Do NOT misread it as a failed deploy (this exact confusion
  cost a debug at word-quiz gate B).
- **A worker normalising one of the four CRLF files to LF** turns 2.10's md5 check into a
  whole-file diff hunt. Called out as a non-goal in 2.3/2.4/2.5 and checked with `file` in each.
- **The em dash (U+2014) in the new Hebrew line.** A hyphen typed instead fails 2.4's codepoint
  probe and both transcript diffs — loudly, which is the point. And per field guide 13, escapes
  collapse when written through `bash -e`: write through a file, then verify the written bytes.
- **The transcript being "fixed" to match the code.** That would silently convert a hand-derived
  gate into a photograph. Criterion 6 counts the expected file's commits (must be 1).
- **Ledger drift.** Any accidental extra `test()` fails every later step's validation. Each worker
  step pins the exact cumulative number and forbids subtests.
- **APP_CODE leaking into the orchestrator's shell** silently 401s the entire suite for the rest of
  the phase. The frozen subshell plus its post-assert is the only mitigation; used in 2.9 and 2.11.
- **No safety net exists right now.** Phase 1's capture was deleted. Between now and step 2.9 there
  is no copy of her profile anywhere. Nothing before 2.9 may touch production.
- **`grep -q` under `pipefail`** and locale-dependent `sort` — avoided throughout: every validation
  captures to a variable and matches with `case`/`[ ]`, and every frozen comparison uses `LC_ALL=C`.

BLOCKERS: none. Every decision this phase needs is in the signed design, the frozen QZ contracts, or
  the phase-1 record — or is frozen above with its reason and listed under RECORD GAPS, where the
  owner can overturn it in one line.

RECORD GAPS

1. **Where the candidate sits in the merged word list.** B3 fixes the QUOTA (one of four) and says
   "the merge happens at the call site"; nothing says first, last or interleaved. Frozen as FIRST
   (a reserved slot), because a candidate that is never reached can never pass, which is the
   deadlock §5.5 already names. One line for the owner to overrule.
2. **What a candidate's CORRECT answer does besides setting `known`.** The record says only "a
   candidate becomes `known` by passing one quiz item". Frozen: stamp `lastQuizAt`, `quizRight`+1,
   and `delete` the three strike keys so the entry is shaped exactly like one promoted by her own
   claim (`markWordKnown`); `lastSeen` is NOT moved, because B5 specifies the clock reset for
   demotion only.
3. **What a candidate's WRONG answer does to `needsReview`.** QZ-12 clears it on every claimed-word
   answer. Frozen: untouched, because setting it would add a key to entries that never had one and
   QZ-9's no-backfill promise is worth more than the symmetry.
4. **Whether the D27 delete-at-close rider is a standing order.** The owner said "Delete it now (as
   last run)" about PHASE 1's capture (journal:246). "As last run" reads like a pattern, but the
   answer was given about one file. Frozen: KEEP until the owner answers the same question in the
   phase-2 close report — the same way phase 1 actually executed it.
5. **The full rollback URL for `dpl_9yj3HbhU7p5ZNAGQHUeTCvM2D3Dc`.** The record holds the deployment
   NAME (`english-g80h5gnd9`) but not the url. Phase 1 was bitten by a constructed url pointing at
   the wrong deployment. Worked around: 2.10 records the url `vercel inspect` reports and never
   constructs one.
6. **Whether the softer line gets its own CSS class.** B6(iii) fixes the STRING; nothing chooses a
   presentation. Frozen: reuse `.quiz-demoted` — no new rule, no new token, contrast anchor
   untouched at 52. Put to the self-served visual gate at 2.8.
7. **The planner did not run the suite** (read-only mandate). The 291 baseline is a direct count
   from the tree (286 flat `^test(` + 5 `t.test` in `dev-server.test.js`) and matches phase 1's
   recorded close. Step 2.2's validation re-establishes it mechanically the first time code moves.

PLAIN PLAN: for the human, no jargon — one line per step:
  2.1 Write down, by hand and before any code exists, exactly what the quiz screen should say when
      a "almost known" word is taken back — because a check written after the fact only proves the
      code agrees with itself.
  2.2 Teach the app the rule she signed: one wrong answer sends an "almost known" word back to
      learning and restarts its clock, one right answer makes it properly known — and the clock
      restart is what stops the same word bouncing back and forth forever.
  2.3 Add a way to pick the single "almost known" word that gets a turn in a practice round —
      because two quiet chapters can nominate several at once and they must not crowd out the words
      that are actually causing trouble in her stories.
  2.4 Change the wording she sees: a word she never claimed gets "עוד לא — נמשיך ללמוד את המילה
      הזאת" instead of the line written for a word she did claim — because telling her a word "goes
      back to learning" describes a promotion she never saw herself get.
  2.5 Wire that one reserved slot into both places a practice round starts — after a chapter, and
      from her word collection — because the rule is useless if the quiz never asks.
  2.6 Write one test that plays the whole thing through like a child would: the app nominates a
      word, asks about it first, she gets it wrong, gets the kind message, and the app cannot
      re-nominate it straight away; then a second word she gets right and it sticks; then a word
      with no question is simply skipped in silence.
  2.7 Bump the app's cache version — because otherwise her phone keeps serving the old screen.
  2.8 Open the app in the practice sandbox, deliberately answer a question wrong, and look at the
      result with our own eyes — because no test can tell whether it reads kindly in Hebrew on a
      real screen.
  2.9 Copy her live word collection to a safe folder — because this release can change word
      statuses and there is currently no backup at all.
  2.10 Ship it, and prove the files that landed are byte-for-byte the ones we wrote — not just that
      the deploy "said OK".
  2.11 Read her collection back and prove nothing was lost and every change is explainable — the
      only time this phase touches her real data.
  DONE WHEN: the app is live at `magic-vet-v17` with its five changed files md5-proven on the
  server, the full suite green at 298 with and without the entry-code gate, contrast still 52, BOTH
  screen transcripts (the old one and the new hand-written one) matching exactly, and her word
  collection read back from production with zero words lost and every status change accounted for.
