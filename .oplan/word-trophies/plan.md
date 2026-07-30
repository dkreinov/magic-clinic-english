# Plan — word-trophies

(phases 2-4 exist as the signed design §5 sketch; each is detailed only when reached.)

---

# WORD-TROPHIES — PHASE 1 IN FULL (planned 2026-07-29 by a fresh planner — Opus, files only,
# read-only-of-the-repo mandate; the planner measured its claims in an isolated scratch
# prototype, incl. the public/ digest, per-file ending counts, and every expected test value).
#
# ORCHESTRATOR VERIFICATION before review: digest 2362 74e736d7d83b22a24945eae87cb9fe33
# CONFIRMED · endings lib/profile.js 0/558, api/profile.js 0/142, api/chapter.js 64/0,
# tests/profile.test.js 0/137 CONFIRMED (plan pins are post-edit values) · all quoted anchors
# byte-checked · harness files + GOOD_TEXT:91 + the bytes-unchanged GET test exist as cited.
# AMENDMENT #1 (orchestrator, pre-review): (a) step-1.4 / criterion-11 line pins corrected
# 143->146 and 65->67 — the frozen edits insert commented blocks (4 and 3 lines), and the
# planner pins assumed bare 1-line inserts; a correct implementation would have failed the
# frozen gate (the bad-spec class, caught at plan time). (b) VAL-COMMON transcript scratch
# moved outside the repo (HOME/trophies-val). (c) PORC gains the standard .oplan/ filter.
# AMENDMENT #2 (after plan review, fix-first, findings 1-4): step COMMANDS no longer contain
# git add/commit — commits are the ORCHESTRATOR's, at acceptance, with the messages the plan
# recorded (house practice; also moots the missing-git-add findings); VAL-COMMON's DELS gate
# widened to include tests/trophies.test.js, matching criterion 10.
# AMENDMENT #3 (execution, step 1.4, worker stop-with-question 2026-07-29, orchestrator
# ruling): M1.4b as planned was wrong twice. (a) Its companion clause — that the
# api-profile-quiz bytes-unchanged GET test "must fail too" — is IMPOSSIBLE at the frozen
# insertion point: GET makes both of its save decisions (fresh-profile create; migration
# rewrite) BEFORE line 33, so an awardTrophies inserted before sendJson can never cause a
# second disk write; clause DROPPED. (b) Test 3's literal fixture (5 known + known.bronze
# already awarded, nothing else near a threshold) was a NO-OP DETECTOR — the mutation would
# award nothing and test 3 could not fail at all. FIX: test 3's seed also carries
# story.chapters = 3 entries with valid distinct pre-NOW generatedAt days (earned-but-
# unawarded days/streak tiers), and M1.4b's expected failure is test 3's RESPONSE assertion
# (deepStrictEqual(parsed.data.trophies, { known: { bronze: NOW } }) — the mutation makes
# extra tiers appear in the response). The byte assertion STAYS in test 3 (it guards the
# migrateWordKeys-resort trap); it is just not M1.4b's detector. The bad-spec class again —
# caught by the executor stop-rule (lesson 9), not by any earlier gate.

# PHASE 1: the engine

**GOAL:** Put trophy awarding into the server and nothing else. `lib/profile.js` gains `TROPHY_TIERS`, `TROPHY_CATALOG` (the 8 signed ids + thresholds) and a pure, idempotent, never-regressing `awardTrophies(profile, now)`; `defaultProfile()` gains `trophies: {}`; `validateProfile` gains the T1 optional block; the two designed save moments call it. No UI, no artwork, no tokens, no CACHE bump, no `public/` byte moves, no deploy, no touch of the live profile.

---

## ACCEPTANCE CRITERIA (mechanical — all re-run at the phase close, step 1.5)

1. `npm test` exits 0 and prints `# tests 328`, `# fail 0`, and a top-level plan of `1..323`.
2. `APP_CODE=dummy npm test` exits 0 and prints the identical `# tests 328` / `# fail 0`.
3. Flat ledger: `grep -h -c '^test(' tests/*.js | awk '{s+=$1} END{print s+0}'` = **323** (298 baseline + 25 new). 323 flat + 5 subtests in `tests/dev-server.test.js` = 328 reported.
4. `node scripts/check-contrast.mjs` exits 0 and `grep -c '^PASS'` over its output = **52** (unchanged anchor).
5. `public/` byte-unchanged: the recursive byte digest equals the phase-open value **`2362 74e736d7d83b22a24945eae87cb9fe33`** (2362 files; command frozen in §VAL-COMMON below). And no write-set path begins with `public/`.
6. `node .oplan/word-quiz/quiz-transcript.mjs` diffed against `.oplan/word-quiz/quiz-transcript-expected.txt` is EMPTY.
7. `node .oplan/word-g1/g1-transcript.mjs` diffed against `.oplan/word-g1/g1-transcript-expected.txt` is EMPTY.
8. `.data/profile.json` is absent (`test -e` false).
9. Write set exact — `git status --porcelain | LC_ALL=C sort` at the close is exactly:
   ```
    M api/chapter.js
    M api/profile.js
    M lib/profile.js
    M tests/profile.test.js
   ```
   plus, once committed per step, nothing untracked but the two `.oplan/word-trophies/` record files of step 1.5. (`tests/trophies.test.js` is `?? ` until its step commits it.)
10. Zero deletions: no file removed (`git diff --diff-filter=D --name-only HEAD` empty) **and** the total deleted-line budget is exactly **2** — the two `import` lines at `api/profile.js:3` and `api/chapter.js:3`. `git diff --numstat HEAD -- lib/profile.js tests/profile.test.js tests/trophies.test.js` deletions = 0.
11. Line endings unchanged in kind (git-invisible, so byte-counted): `lib/profile.js` CRLF=0; `api/profile.js` CRLF=0 bareLF=**146** (AMENDED: the frozen edit inserts 4 lines incl. its 3-line comment); `api/chapter.js` CRLF=**67** bareLF=**0** (AMENDED: 3 inserted lines incl. comment); `tests/profile.test.js` CRLF=0 bareLF=**138**; `tests/trophies.test.js` CRLF=0.
12. `tests/trophies.test.js` contains no raw non-ASCII byte (every Hebrew codepoint is a `\u` escape) and no `describe(`/nested `test(` — flat `test()` only.
13. `awardTrophies` appears at exactly two call sites: one in `api/profile.js`, one in `api/chapter.js`, zero in `api/placement.js`, zero under `public/`.

---

## DEPENDS ON (verified on disk, 2026-07-29, tree clean at `8df5484`)

| thing | file:line | verified |
|---|---|---|
| signed design, T1/T2/T3/T8/T9 | `.oplan/word-trophies/design.md` §4 | read |
| run record | `.oplan/word-trophies/journal.md` | read |
| binding lessons 4/5/6/8 | `.oplan/word-trophies/field-guide/index.md` | read |
| `defaultProfile` object literal | `lib/profile.js:30-46` | read |
| `validateProfile` + its `meta` block | `lib/profile.js:48-222`, meta at `:207` | read |
| `isPlainObject` / `isParseableDateString` helpers | `lib/profile.js:22-28` | read |
| `promoteToCandidate` — the awarding pattern (mutate in place, return profile, guard non-object) | `lib/profile.js:517-558` | read |
| `applyQuizAnswer` | `lib/profile.js:439-507` | read |
| the single `saveProfile` on POST | `api/profile.js:140` | read |
| the chapter `saveProfile` | `api/chapter.js:61` | read |
| `promoteToCandidate(p)` in the chapter flow | `api/chapter.js:50` | read |
| the `defaultProfile` deepStrictEqual pin | `tests/profile.test.js:7-24` | read |
| harness patterns `withTempDataDir` / `withOpenGate` / `createMockRes` / `createPostReq` | `tests/api-profile-post.test.js:9-60` (identical copies in `api-profile-quiz.test.js:9-60`, `api-chapter.test.js:23-74`) | read |
| `setTransport`/`resetTransport` for the chapter test | `lib/openai.js`, used at `tests/api-chapter.test.js:13,147` | read |
| frozen contracts | `.oplan/word-g1/phase-state.md:34-42` | read |
| both transcript gates | `.oplan/word-quiz/quiz-transcript.mjs`, `.oplan/word-g1/g1-transcript.mjs` | run |

**Baseline measured, not trusted:** tree clean at `8df5484` (`git status --porcelain` = 0 lines); `npm test` → `# tests 303 / # fail 0`, plan `1..298`; `APP_CODE=dummy npm test` → identical; flat count 298; contrast `grep -c '^PASS'` = 52; both transcripts diff EMPTY; `.data/` exists but is empty (no `profile.json`).

---

## SKELETON CHANGES (where reality differs from design §5's sketch)

**SK-1 — the chapter call site moves AFTER the push. T2 says "api/chapter.js (immediately after `promoteToCandidate`)". That position is wrong and I measured it wrong.** `promoteToCandidate` is at `api/chapter.js:50`; the new chapter is pushed at `:58`. Awarding at `:50` sees one chapter fewer and never sees the new chapter's `generatedAt` day. Measured in the prototype with a 4-prior-chapter profile generating its 5th: post-push position → `trophy keys: ["chapters"]`; T2's literal position → `trophy keys: []`. **Frozen: the call goes between `api/chapter.js:60` and `:61`, i.e. after `p.story.cliffhanger = …` and immediately before `await saveProfile(p);`.** This is a refinement of T2's wording, not a change to its intent ("immediately before saveProfile" is the invariant T2 actually states for the other call site).

**SK-2 — there is no shared `now` in `api/profile.js`.** T2 says "Award timestamps use the same `now` the calling action already uses." `api/profile.js` never computes a `now`; each mutator defaults its own (`api/placement.js:46` is the only handler that has one, and placement is not wired). **Frozen: both call sites call `awardTrophies(p)` with no second argument; the default `new Date().toISOString()` is taken at call time — milliseconds after the action's own timestamp, same instant for practical purposes, and never a clock the caller has to thread.** No new variable is introduced.

**SK-3 — the Hebrew trophy names do NOT enter `lib/profile.js` this phase.** T3 lists 8 Hebrew names; the engine needs none of them, and `public/` can never import from `lib/` (verified: zero `../lib` imports anywhere under `public/`), so a name in the catalogue would be unreachable by the phase-3 view anyway. Retyping 8 Hebrew strings now buys nothing and walks straight into field-guide lesson 8 with no gate able to see a wrong glyph. **Frozen: `TROPHY_CATALOG` carries `id`, `bronze`, `silver`, `gold`, `metric` only. The T3 names land in phase 3's view, extracted from `design.md` by script, never retyped.**

**SK-4 — the day derivation is frozen without a regex.** The recommended "first 10 chars after a validity parse" needs a well-formedness guard (`Date.parse("January 1, 2026")` succeeds and `slice(0,10)` yields `"January 1,"`). The obvious guard is `/^\d{4}-\d{2}-\d{2}$/` — and I watched the shell eat those backslashes twice this session (lesson 8, new costume). **Frozen: a backslash-free round-trip guard** — `Date.parse(day + 'T00:00:00.000Z')` must parse and `new Date(ms).toISOString().slice(0,10)` must equal `day`. Same semantics, zero escape surface.

**SK-5 — `profile.trophies` present but not a plain object → award nothing, touch nothing.** T1 does not say. Overwriting would be a deletion, and the never-regress law forbids that more strongly than it demands an award. Frozen and tested.

**SK-6 — an unearned trophy gets no key at all.** T1 says "A tier key exists iff earned"; frozen to the stronger form: `profile.trophies[id]` is only created when at least one tier is earned, so an untouched profile keeps `trophies: {}`.

---

## §VAL-COMMON — the frozen validation preamble (every step's block starts with this verbatim)

```bash
#!/usr/bin/env bash
set -o pipefail
cd C:/Users/dkreinov/claude/english-app || { echo "FAIL: cannot cd to the repo"; exit 1; }
RC=0
fail() { echo "FAIL: $*"; RC=1; }

# --- suite (plain) ---
OUT="$(npm test 2>&1)"; STAT=$?
case "$STAT" in 0) ;; *) fail "npm test exited $STAT";; esac
TOTAL="$(printf '%s\n' "$OUT" | sed -n 's/^# tests \([0-9][0-9]*\).*$/\1/p')"
FAILED="$(printf '%s\n' "$OUT" | sed -n 's/^# fail \([0-9][0-9]*\).*$/\1/p')"
PLAN="$(printf '%s\n' "$OUT" | sed -n 's/^1\.\.\([0-9][0-9]*\).*$/\1/p')"

# --- suite (gated) ---
GOUT="$(APP_CODE=dummy npm test 2>&1)"; GSTAT=$?
case "$GSTAT" in 0) ;; *) fail "APP_CODE=dummy npm test exited $GSTAT";; esac
GTOTAL="$(printf '%s\n' "$GOUT" | sed -n 's/^# tests \([0-9][0-9]*\).*$/\1/p')"
GFAILED="$(printf '%s\n' "$GOUT" | sed -n 's/^# fail \([0-9][0-9]*\).*$/\1/p')"

# --- flat ledger ---
FLAT="$(grep -h -c '^test(' tests/*.js | awk '{s+=$1} END{print s+0}')"

# --- contrast anchor 52 ---
CON="$(node scripts/check-contrast.mjs 2>&1)"; CSTAT=$?
case "$CSTAT" in 0) ;; *) fail "check-contrast exited $CSTAT";; esac
PASSES="$(printf '%s\n' "$CON" | grep -c '^PASS')"
case "$PASSES" in 52) ;; *) fail "contrast anchor moved: expected 52 PASS lines, got '$PASSES'";; esac

# --- public/ byte digest (no backslashes anywhere: lesson 8) ---
PUB="$(node -e 'const fs=require("fs"),path=require("path"),crypto=require("crypto");const out=[];(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);const s=fs.statSync(f);if(s.isDirectory())walk(f);else out.push(f.split(path.sep).join("/")+" "+crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex"));}})("public");console.log(out.length+" "+crypto.createHash("md5").update(out.join(String.fromCharCode(10))).digest("hex"));')"
case "$PUB" in "2362 74e736d7d83b22a24945eae87cb9fe33") ;; *) fail "public/ moved: expected '2362 74e736d7d83b22a24945eae87cb9fe33', got '$PUB'";; esac

# --- both transcripts must diff EMPTY ---
VD="$HOME/trophies-val"; mkdir -p "$VD"
node .oplan/word-quiz/quiz-transcript.mjs > "$VD/qz.out" 2>&1 || fail "quiz-transcript.mjs exited non-zero"
QZ="$(diff "$VD/qz.out" .oplan/word-quiz/quiz-transcript-expected.txt)"
case "$QZ" in "") ;; *) fail "QZ-21 transcript moved";; esac
node .oplan/word-g1/g1-transcript.mjs > "$VD/g1.out" 2>&1 || fail "g1-transcript.mjs exited non-zero"
G1="$(diff "$VD/g1.out" .oplan/word-g1/g1-transcript-expected.txt)"
case "$G1" in "") ;; *) fail "G1 transcript moved";; esac
rm -f "$VD/qz.out" "$VD/g1.out"

# --- her profile must never appear locally ---
if [ -e .data/profile.json ]; then fail ".data/profile.json exists — a local write leaked"; fi

# --- line endings are LAW and git normalises them away (field guide lesson 4) ---
ENDS="$(node -e 'const fs=require("fs");const out=[];for(const f of process.argv.slice(1)){if(!fs.existsSync(f)){out.push(f+" MISSING");continue;}const b=fs.readFileSync(f);let c=0,l=0;for(let i=0;i<b.length;i++){if(b[i]===10){if(i>0&&b[i-1]===13)c++;else l++;}}out.push(f+" CRLF="+c+" LF="+l);}console.log(out.join("; "));' lib/profile.js api/profile.js api/chapter.js tests/profile.test.js tests/trophies.test.js)"
echo "ENDINGS: $ENDS"

# --- no raw non-ASCII in the new test file, flat tests only ---
if [ -f tests/trophies.test.js ]; then
  NONASCII="$(node -e 'const b=require("fs").readFileSync("tests/trophies.test.js");let n=0;for(const x of b) if(x>127) n++;console.log(n);')"
  case "$NONASCII" in 0) ;; *) fail "tests/trophies.test.js has $NONASCII raw non-ASCII bytes — Hebrew must be \\u escapes";; esac
  NEST="$(grep -c 'describe(\|  test(\|t\.test(' tests/trophies.test.js)"
  case "$NEST" in 0) ;; *) fail "tests/trophies.test.js has $NEST nested/suite constructs — flat test() only";; esac
fi

# --- deletion budget ---
DELS="$(git diff --numstat HEAD -- lib/profile.js tests/profile.test.js tests/trophies.test.js | awk '{s+=$2} END{print s+0}')"
case "$DELS" in 0) ;; *) fail "lib/profile.js + tests/profile.test.js + tests/trophies.test.js deleted $DELS lines; budget is 0";; esac
GONE="$(git diff --diff-filter=D --name-only HEAD)"
case "$GONE" in "") ;; *) fail "files were deleted: $GONE";; esac

PORC="$(git status --porcelain | awk '$NF !~ /^\.oplan\//' | LC_ALL=C sort)"   # .oplan is the orchestrator record, never the executor write set
```

Per-step blocks continue from here with their own `case` assertions on `$TOTAL`, `$FAILED`, `$PLAN`, `$GTOTAL`, `$GFAILED`, `$FLAT`, `$ENDS`, `$PORC`, then `exit $RC`.

---

## FROZEN CONTRACTS — quoted, in force for every step

From `.oplan/word-g1/phase-state.md:34-42`:
> "FROZEN CONTRACTS IN FORCE (for any future run): signed design §10 · both transcripts (QZ-21 + g1) must diff EMPTY forever; expected files committed ONCE, never edited · QZ-22: next CACHE bump = v18 whenever public/ next moves · ledger flat test() 303 · contrast anchor 52 · APP_CODE never in an orchestrator shell; the frozen subshell (.oplan/word-quiz/plan.md:1573-1586) is the only sanctioned live read · GET /api/profile creates one — never probe"

From the field guide, lesson 4:
> "core.autocrlf=true makes DISK endings unstable: checkout materialises CRLF, an Edit-tool insert CRLF'd a whole LF file, and `git diff` normalises so the damage is INVISIBLE to any git-based gate — edit LF files byte-preservingly (python `newline=''`) and verify endings with an `rb` byte count, never grep/`file`."

Lesson 5:
> "`npm test` = bare `node --test` + the contrast gate; every new test is a FLAT top-level `test()`; pin the exact cumulative ledger per step … Contrast anchor = `grep -c '^PASS'` = 52 (bare `PASS` gives 53)."

Lesson 6:
> "Validation chains: `set -o pipefail`; capture to variables, match with `case`; `LC_ALL=C sort`; `cmd | grep -q` SIGPIPEs under pipefail. Put the file-boundary check in the STEP's script."

Lesson 8:
> "HEBREW IS BIDI + SHELLS EAT ESCAPES: never retype Hebrew and never copy it from terminal output — EXTRACT it from its source file by script; `\uXXXX` collapses through `bash -e` … Write scripts to FILES and verify the WRITTEN BYTES (codepoint dump). In test files Hebrew is `\u` escapes only."

Lesson 2:
> "A test never seen to FAIL is not evidence — mutate first (fail-first) … A positive assertion needs its NEGATIVE control (cry-wolf)."

Lesson 3:
> "THE PROFILE IS LIVE (Vercel Blob behind `APP_CODE`). NEVER probe it. `GET /api/profile` CREATES one — a read that writes … Tests point `DATA_DIR` at a temp dir; prove 'nothing written' by BYTE-comparing."

From `design.md` T1:
> "A tier key exists iff earned, value = awardedAt ISO, written ONCE, never modified, never removed (the never-regress law). … unknown trophyIds ACCEPTED (forward compatibility — an old shell must never crash on a new profile)."

From `design.md` T2:
> "Called at BOTH server save moments and nowhere else … Never in GET … Never client-side. It computes each trophy's metric from the profile, compares against thresholds, and fills in missing tier timestamps only — it never deletes or lowers."

From `design.md` T9:
> "no new API route · no runtime image generation · no reworking renderQuizDone or any frozen string … no backfill migration (her existing history already produces awards on the first pass through awardTrophies — that IS the backfill, free)."

**Executor stop-rule (lesson 9):** never silently "fix" a frozen command or a pinned number. If a gate contradicts reality, STOP, report, and wait for a ruling.

**Editing rule (lesson 4, mandatory):** every edit to `lib/profile.js`, `api/profile.js`, `tests/profile.test.js` and the new `tests/trophies.test.js` is **LF only**; every edit to `api/chapter.js` is **CRLF only**. Do not use a git-mediated copy (`git archive`, `git stash`, a fresh clone) to inspect or reason about disk bytes — it re-applies `core.autocrlf=true` and silently flips every ending (measured this session). Verify endings with the byte counter in §VAL-COMMON, never with `grep`, `file`, or `git diff`.

---

# STEP 1.1 — the schema (T1)

**GOAL:** `defaultProfile()` gains `trophies: {}`; `validateProfile` gains the optional trophies block; `TROPHY_TIERS` is exported. The `tests/profile.test.js` pin moves in lockstep. No catalogue, no `awardTrophies`.

**TIER:** WORKER. **DEPENDS ON:** nothing (phase base = `8df5484`).

**FILES (exhaustive):**
- `lib/profile.js` — MODIFY (LF). Three edits.
- `tests/profile.test.js` — MODIFY (LF). One inserted line.
- `tests/trophies.test.js` — CREATE (LF). 3 flat tests.

**Edit 1 — `lib/profile.js`, after line 15.** Anchor, quoted exactly:
```js
const WORD_SOURCES = ['placement', 'tap', 'band'];
```
becomes
```js
const WORD_SOURCES = ['placement', 'tap', 'band'];

// T1. The only legal tier keys inside profile.trophies[id]. Declared here, above
// validateProfile, so there is no temporal-dead-zone question at any call order.
export const TROPHY_TIERS = ['bronze', 'silver', 'gold'];
```

**Edit 2 — `lib/profile.js`, inside `defaultProfile`.** Anchor, quoted exactly (lines 43-44):
```js
    story: { chapters: [], summarySoFar: '', cliffhanger: '', checkLog: [] },
    meta: { createdAt: nowIso, updatedAt: nowIso },
```
becomes
```js
    story: { chapters: [], summarySoFar: '', cliffhanger: '', checkLog: [] },
    trophies: {},
    meta: { createdAt: nowIso, updatedAt: nowIso },
```
(Position frozen: after `story`, before `meta`, so `meta` stays last.)

**Edit 3 — `lib/profile.js`, immediately before the `meta` block.** Anchor, quoted exactly (lines 207-208):
```js
  // meta
  if ('meta' in profile) {
```
becomes
```js
  // trophies (T1). ABSENT IS LEGAL -- 'trophies' is deliberately NOT added to
  // topLevelKeys, mirroring the word-entry optional pattern. Unknown trophy ids
  // are ACCEPTED so an old shell never crashes on a profile a newer catalogue
  // wrote.
  if ('trophies' in profile) {
    if (isPlainObject(profile.trophies)) {
      for (const [trophyId, tiers] of Object.entries(profile.trophies)) {
        const path = `trophies.${trophyId}`;
        if (!isPlainObject(tiers)) {
          errors.push(`${path}: expected an object`);
          continue;
        }
        for (const [tier, awardedAt] of Object.entries(tiers)) {
          if (!TROPHY_TIERS.includes(tier)) {
            errors.push(`${path}.${tier}: unknown tier key`);
            continue;
          }
          if (!isParseableDateString(awardedAt)) {
            errors.push(`${path}.${tier}: expected a parseable date string`);
          }
        }
      }
    } else {
      errors.push('trophies: expected an object');
    }
  }

  // meta
  if ('meta' in profile) {
```
The four error strings above are FROZEN wording; the tests assert them exactly.

**Edit 4 — `tests/profile.test.js`, inside the pin.** Anchor, quoted exactly (lines 21-22):
```js
    story: { chapters: [], summarySoFar: '', cliffhanger: '', checkLog: [] },
    meta: { createdAt: NOW, updatedAt: NOW },
```
becomes
```js
    story: { chapters: [], summarySoFar: '', cliffhanger: '', checkLog: [] },
    trophies: {},
    meta: { createdAt: NOW, updatedAt: NOW },
```

**Edit 5 — CREATE `tests/trophies.test.js`** with a header comment (phase/step/design reference) and exactly these 3 flat tests, names FROZEN:
1. `'defaultProfile carries an empty trophies map'` — `deepStrictEqual(defaultProfile(NOW).trophies, {})`, and `strictEqual(Object.keys(defaultProfile(NOW)).indexOf('trophies') , 6)` is NOT asserted (key order is not a contract); instead assert `'trophies' in profile` and that `validateProfile(defaultProfile(NOW))` is `{ ok: true, errors: [] }`.
2. `'validateProfile accepts an absent trophies key, an empty map, unknown trophy ids, and all three tier keys'` — four sub-cases in one flat test: `delete p.trophies` → ok; `{}` → ok; `{ zzzFutureTrophy: { bronze: NOW } }` → ok; `{ known: { bronze: NOW, silver: NOW, gold: NOW } }` → ok. Each asserts `deepEqual(result.errors, [])`.
3. `'validateProfile rejects a non-object trophies, a non-object trophy entry, an unknown tier key, and an unparseable award timestamp'` — one profile carrying `{ known: { platinum: NOW }, days: { bronze: 'nope' }, streak: 5 }` must produce EXACTLY, as an `LC_ALL=C`-independent set comparison via `deepStrictEqual([...errors].sort(), [...expected].sort())`:
   ```
   trophies.days.bronze: expected a parseable date string
   trophies.known.platinum: unknown tier key
   trophies.streak: expected an object
   ```
   plus a separate profile with `trophies = 'oops'` producing exactly `['trophies: expected an object']`.
   (These three strings were produced by the prototype and are copied from its output, not invented.)

**COMMANDS:**
```bash
cd C:/Users/dkreinov/claude/english-app
node --check lib/profile.js
npm test
APP_CODE=dummy npm test
# COMMIT (orchestrator, at acceptance — workers never run git writes): "step 1.1: trophies schema (T1) — defaultProfile trophies:{}, validateProfile optional block, TROPHY_TIERS; ledger 301 flat / 306 reported"
```

**MANDATED FAIL-FIRST (run BEFORE the commit; restore after each):**
- **M1.1a** — delete the line `    trophies: {},` from `lib/profile.js`'s `defaultProfile`. `tests/profile.test.js › defaultProfile produces the expected schema-v1 shape` **and** `tests/trophies.test.js › defaultProfile carries an empty trophies map` must BOTH fail. Restore; both pass.
- **M1.1b** — in the new validate block change `if (!TROPHY_TIERS.includes(tier)) {` to `if (false) {`. `tests/trophies.test.js › validateProfile rejects a non-object trophies, …` must fail on the missing `unknown tier key` error. Restore; passes.
- **M1.1c** — add `'trophies'` to the `topLevelKeys` array at `lib/profile.js:59`. `tests/trophies.test.js › validateProfile accepts an absent trophies key, …` must fail. Restore; passes. (This is the guard that keeps "absent is legal" real.)

Record each observed failure line verbatim in the step report. A mutation that does not fail is a STOP.

**FROZEN VALIDATION:** §VAL-COMMON, then:
```bash
case "$TOTAL"  in 306) ;; *) fail "expected 306 reported tests, got '$TOTAL'";; esac
case "$PLAN"   in 301) ;; *) fail "expected top-level plan 1..301, got '1..$PLAN'";; esac
case "$FAILED" in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL" in 306) ;; *) fail "APP_CODE=dummy: expected 306, got '$GTOTAL'";; esac
case "$GFAILED" in 0)  ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"   in 301) ;; *) fail "expected 301 flat tests, got '$FLAT'";; esac
case "$ENDS" in
  *"lib/profile.js CRLF=0 "*) ;; *) fail "lib/profile.js gained CRLF: $ENDS";; esac
case "$ENDS" in
  *"tests/profile.test.js CRLF=0 LF=138"*) ;; *) fail "tests/profile.test.js endings/线count wrong: $ENDS";; esac
case "$ENDS" in
  *"tests/trophies.test.js CRLF=0 "*) ;; *) fail "tests/trophies.test.js must be LF-only: $ENDS";; esac
case "$ENDS" in
  *"api/profile.js CRLF=0 LF=142"*) ;; *) fail "api/profile.js must be untouched this step: $ENDS";; esac
case "$ENDS" in
  *"api/chapter.js CRLF=64 LF=0"*)   ;; *) fail "api/chapter.js must be untouched this step: $ENDS";; esac
EXPECT=' M lib/profile.js
 M tests/profile.test.js
?? tests/trophies.test.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```
(Run the block BEFORE `git add`; the `$PORC` expectation is the pre-commit state.)

**NON-GOALS:** no `TROPHY_CATALOG`, no `awardTrophies`, no touch of `api/`, no touch of `public/`, no Hebrew anywhere, no new file outside the three listed, no `.oplan` writes.

---

# STEP 1.2 — the catalogue and its metrics (T3)

**GOAL:** `TROPHY_CATALOG` with the 8 signed ids and thresholds, and the metric derivations, each independently testable through `entry.metric(profile)`.

**TIER:** WORKER. **DEPENDS ON:** 1.1 (`TROPHY_TIERS`, `isPlainObject`).

**FILES (exhaustive):**
- `lib/profile.js` — MODIFY (LF). Append-only, at the very end of the file after `promoteToCandidate`.
- `tests/trophies.test.js` — MODIFY (LF). +10 flat tests.

**The appended block — FROZEN source (append verbatim at EOF, LF endings):**
```js

// ---------------------------------------------------------------------------
// Trophies (design .oplan/word-trophies/design.md, T3). The engine only. Names
// are display data and live with the view (SK-3); nothing here is user-visible.
// ---------------------------------------------------------------------------

// The calendar day of a timestamp, FROZEN as the UTC day: the ISO string's own
// date field, guarded by a round-trip so a string Date.parse happens to accept
// ("January 1, 2026") can never masquerade as a day. Every timestamp this app
// writes comes from toISOString(), so the date field IS the UTC day.
//
// HONESTY NOTE: Israel is UTC+2/+3. Activity between midnight and ~03:00 local
// therefore counts toward the PREVIOUS day, and a late-night session can look
// like the day before. Streaks are UTC streaks. This is deliberate: it is
// deterministic, testable, and never dependent on the server's own zone.
function trophyDay(value) {
  if (typeof value !== 'string') return null;
  if (Number.isNaN(Date.parse(value))) return null;
  const day = value.slice(0, 10);
  if (day.length !== 10) return null;
  const ms = Date.parse(day + 'T00:00:00.000Z');
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString().slice(0, 10) === day ? day : null;
}

function wordEntries(profile) {
  if (!isPlainObject(profile) || !isPlainObject(profile.words)) return [];
  return Object.values(profile.words).filter(isPlainObject);
}

function chapterList(profile) {
  if (!isPlainObject(profile) || !isPlainObject(profile.story)) return [];
  return Array.isArray(profile.story.chapters) ? profile.story.chapters : [];
}

// T3 'days': chapters[].generatedAt UNION words[].lastQuizAt UNION words[].lastSeen.
function activeDays(profile) {
  const days = new Set();
  for (const ch of chapterList(profile)) {
    if (!isPlainObject(ch)) continue;
    const d = trophyDay(ch.generatedAt);
    if (d) days.add(d);
  }
  for (const entry of wordEntries(profile)) {
    for (const key of ['lastQuizAt', 'lastSeen']) {
      const d = trophyDay(entry[key]);
      if (d) days.add(d);
    }
  }
  return days;
}

// T3 'streak': the longest run of CONSECUTIVE days inside the day set. Compared
// at UTC midnight, so month, year and DST boundaries are all just +86400000.
function longestStreak(days) {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prevMs = null;
  for (const day of sorted) {
    const ms = Date.parse(day + 'T00:00:00.000Z');
    if (Number.isNaN(ms)) continue;
    run = prevMs !== null && ms - prevMs === 86400000 ? run + 1 : 1;
    if (run > best) best = run;
    prevMs = ms;
  }
  return best;
}

function countNum(value) {
  return Number.isFinite(value) ? value : 0;
}

// The signed catalogue (design T3). Ids and thresholds are OWNER-SIGNED; the
// order is T3's table order. Thresholds are provisional and expected to tune --
// tuning DOWN never revokes an earned trophy (never-regress).
export const TROPHY_CATALOG = [
  { id: 'chapters',  bronze: 5,  silver: 15, gold: 40,
    metric: (p) => chapterList(p).length },
  { id: 'days',      bronze: 3,  silver: 10, gold: 30,
    metric: (p) => activeDays(p).size },
  { id: 'streak',    bronze: 2,  silver: 4,  gold: 7,
    metric: (p) => longestStreak(activeDays(p)) },
  { id: 'known',     bronze: 5,  silver: 15, gold: 30,
    metric: (p) => wordEntries(p).filter((e) => e.status === 'known').length },
  { id: 'quizRight', bronze: 10, silver: 40, gold: 100,
    metric: (p) => wordEntries(p).reduce((n, e) => n + countNum(e.quizRight), 0) },
  { id: 'quizzer',   bronze: 20, silver: 60, gold: 150,
    metric: (p) => wordEntries(p).reduce((n, e) => n + countNum(e.quizRight) + countNum(e.quizWrong), 0) },
  { id: 'curious',   bronze: 25, silver: 75, gold: 200,
    metric: (p) => wordEntries(p).reduce((n, e) => n + countNum(e.taps), 0) },
  { id: 'proven',    bronze: 1,  silver: 5,  gold: 15,
    metric: (p) => wordEntries(p).filter((e) => e.status === 'known' && countNum(e.nominations) >= 1).length },
];
```

**The 10 new flat tests — names FROZEN, expected values HAND-DERIVED and prototype-confirmed:**

1. `'TROPHY_CATALOG and TROPHY_TIERS are exactly the signed catalogue'` —
   `deepStrictEqual(TROPHY_TIERS, ['bronze','silver','gold'])`; and
   `deepStrictEqual(TROPHY_CATALOG.map(({id,bronze,silver,gold}) => ({id,bronze,silver,gold})), [...])` against the literal T3 table in T3's order; plus `strictEqual(TROPHY_CATALOG.length, 8)`, ids unique, every `metric` is a function, and `bronze < silver < gold` for all 8.
2. `'the chapters metric counts story.chapters and is defensive about a missing or malformed story'` — 0/4/5/15/40 chapters → 0/4/5/15/40; `{}`, `{story:null}`, `{story:{chapters:'x'}}` → 0.
3. `'the known metric counts words whose status is known'` — 5 known + 3 learning + 2 candidate → 5; negative control: a candidate does not count.
4. `'the quizRight metric sums quizRight over words'` — words with 4, 6, and none → 10; a non-numeric `quizRight` contributes 0.
5. `'the quizzer metric sums quizRight plus quizWrong over words'` — 4+6 right, 7+3 wrong → 20; negative control: `quizRight` alone is not enough to reach 20.
6. `'the curious metric sums taps over words'` — 10+15 → 25.
7. `'the proven metric counts known words with at least one nomination'` — known+nominations 1 → counts; known+nominations 0 → does NOT; **candidate**+nominations 2 → does NOT; learning+nominations 3 → does NOT.
8. `'the days metric unions chapter generatedAt with word lastQuizAt and lastSeen and de-duplicates by UTC day'` — the frozen fixture (words `a.lastSeen=2026-01-01`, `b.lastSeen=2026-01-02`, `c.lastSeen=2026-01-01` + `c.lastQuizAt=2026-01-03`; chapters `2026-01-05`, `2026-01-06`, one with NO `generatedAt`, one with `generatedAt:'not-a-date'`) → **days = 5**. Also: two timestamps in the same UTC day count once.
9. `'the streak metric is the longest run of consecutive days, across month and year boundaries'` — the same fixture → **streak = 3** (01-01/02/03 run; 01-05/06 run of 2). Boundary fixture `{2025-12-31, 2026-01-01, 2026-01-31, 2026-02-01}` → **days = 4, streak = 2**. Empty profile → streak 0. One day → streak 1.
10. `'a value that is not a well-formed ISO date never becomes an active day'` — `'not-a-date'`, `'January 1, 2026'` (parses, but its first ten chars are not a date), `'2026-02-30T00:00:00.000Z'`, `12345`, `null`, `undefined` each contribute nothing; a lone valid `lastSeen` alongside them still yields 1.

All expected numbers above were produced by running the frozen implementation in an isolated prototype; if the executor's run disagrees, that is a STOP, not a number to adjust.

**COMMANDS:** `node --check lib/profile.js`; `npm test`; `APP_CODE=dummy npm test`.
(COMMIT at orchestrator acceptance: "step 1.2: trophy catalogue (T3) — 8 signed ids/thresholds + metric derivations; ledger 311 flat / 316 reported")

**MANDATED FAIL-FIRST:**
- **M1.2a** — change `days` bronze from `3` to `4` in `TROPHY_CATALOG`. `'TROPHY_CATALOG and TROPHY_TIERS are exactly the signed catalogue'` must fail. Restore.
- **M1.2b** — in `activeDays`, change `['lastQuizAt', 'lastSeen']` to `['lastQuizAt']`. `'the days metric unions chapter generatedAt with word lastQuizAt and lastSeen…'` must fail (5 → 2) and `'the streak metric…'` must fail (3 → 1). Restore.
- **M1.2c** — in `longestStreak`, change `ms - prevMs === 86400000` to `ms - prevMs >= 0`. `'the streak metric…'` must fail (the boundary fixture would report 4 instead of 2). Restore.
- **M1.2d** — in `trophyDay`, delete the round-trip line `return new Date(ms).toISOString().slice(0, 10) === day ? day : null;` and return `day` unconditionally. `'a value that is not a well-formed ISO date never becomes an active day'` must fail. Restore.

**FROZEN VALIDATION:** §VAL-COMMON, then `$TOTAL`=316, `$PLAN`=311, `$FAILED`=0, `$GTOTAL`=316, `$GFAILED`=0, `$FLAT`=311; `$ENDS` must contain `lib/profile.js CRLF=0 `, `api/profile.js CRLF=0 LF=142`, `api/chapter.js CRLF=64 LF=0`, `tests/profile.test.js CRLF=0 LF=138`, `tests/trophies.test.js CRLF=0 `; `$PORC` (pre-commit) must equal exactly:
```
 M lib/profile.js
 M tests/trophies.test.js
```
then `exit $RC`.

**NON-GOALS:** no `awardTrophies`, no Hebrew names in the catalogue (SK-3), no touch of `api/`, no touch of `tests/profile.test.js`, no change to any threshold (they are owner-signed).

---

# STEP 1.3 — `awardTrophies` (T2, the pure function)

**GOAL:** the awarding function itself: pure, idempotent, fill-only, never-regressing.

**TIER:** WORKER. **DEPENDS ON:** 1.1, 1.2.

**FILES (exhaustive):** `lib/profile.js` — MODIFY (LF, append at EOF after `TROPHY_CATALOG`). `tests/trophies.test.js` — MODIFY (LF), +7 flat tests.

**The appended function — FROZEN source:**
```js

// T2. Pure in this codebase's sense: no I/O, no network, no clock unless the
// caller omits `now`. Mutates profile.trophies IN PLACE and returns the profile
// -- the exact promoteToCandidate pattern (lib/profile.js promoteToCandidate).
//
// The never-regress law, mechanically: it only ever ADDS a tier key whose
// threshold the current metric meets, and only when that key is absent. It never
// deletes, never rewrites, never lowers, and never touches a trophy id it does
// not know about. A trophy with no earned tier gets NO key at all (SK-6).
//
// A `trophies` value that is present but not a plain object is left EXACTLY as
// it is and nothing is awarded (SK-5): overwriting it would be a deletion, and
// deleting is the one thing this function must never do.
export function awardTrophies(profile, now = new Date().toISOString()) {
  if (!isPlainObject(profile)) return profile;
  if ('trophies' in profile && !isPlainObject(profile.trophies)) return profile;
  if (!('trophies' in profile)) profile.trophies = {};

  for (const trophy of TROPHY_CATALOG) {
    const metric = trophy.metric(profile);
    let earned = profile.trophies[trophy.id];
    if (earned !== undefined && !isPlainObject(earned)) continue;
    for (const tier of TROPHY_TIERS) {
      if (metric < trophy[tier]) continue;
      if (earned === undefined) {
        earned = {};
        profile.trophies[trophy.id] = earned;
      }
      if (tier in earned) continue;
      earned[tier] = now;
    }
  }

  return profile;
}
```

**The 7 new flat tests — names FROZEN:**
1. `'awardTrophies awards a tier exactly at its threshold and writes no key for an unearned trophy'` — 5 known words, `now = '2026-06-01T09:00:00.000Z'` → `deepStrictEqual(p.trophies, { known: { bronze: '2026-06-01T09:00:00.000Z' } })`; **negative control**: 4 known → `deepStrictEqual(p.trophies, {})`. Prototype-confirmed.
2. `'awardTrophies is idempotent: a second call with a different now changes nothing'` — award at `2026-06-01…`, snapshot `structuredClone(p.trophies)`, award again at `2027-01-01…`, `deepStrictEqual(p.trophies, snapshot)`.
3. `'awardTrophies never regresses: a fabricated higher tier survives a metric below every threshold'` — seed `trophies = { known: { gold: '2020-01-01T09:00:00.000Z' } }` on a profile with **zero** known words; after awarding, `deepStrictEqual(p.trophies.known, { gold: '2020-01-01T09:00:00.000Z' })` — gold survives, bronze is NOT invented.
4. `'awardTrophies never rewrites an existing tier timestamp'` — seed `{ known: { bronze: '2020-01-01T09:00:00.000Z' } }` with 30 known words; after awarding at `2026-06-01…`, bronze is still `2020-…` while silver and gold are `2026-06-01…`.
5. `'awardTrophies leaves an unknown trophy id and a non-object trophies value untouched'` — `{ ghostTrophy: { bronze: '2020-01-01T09:00:00.000Z' } }` survives byte-for-byte; a profile with `trophies = 'oops'` comes back with `trophies === 'oops'` and nothing added.
6. `'awardTrophies mutates nothing outside profile.trophies and returns the same object'` — `structuredClone` the profile, delete `trophies` from both clone and result, `deepStrictEqual`; and `strictEqual(awardTrophies(p, NOW), p)`.
7. `'every profile awardTrophies produces still passes validateProfile'` — run it over five fixtures (empty, partial, all-gold, fabricated-higher-tier, unknown-id) and assert `deepStrictEqual(validateProfile(p), { ok: true, errors: [] })` each time.

**COMMANDS:** `node --check lib/profile.js`; `npm test`; `APP_CODE=dummy npm test`.
(COMMIT at orchestrator acceptance: "step 1.3: awardTrophies (T2) — pure, idempotent, never-regress; ledger 318 flat / 323 reported")

**MANDATED FAIL-FIRST:**
- **M1.3a** — change `if (tier in earned) continue;` to `if (false) continue;`. Tests 2 (idempotence) and 4 (no rewrite) must BOTH fail. Restore.
- **M1.3b** — change `if (metric < trophy[tier]) continue;` to `if (metric <= trophy[tier]) continue;`. Test 1 must fail on the exactly-at-threshold case. Restore.
- **M1.3c** — remove the guard line `if ('trophies' in profile && !isPlainObject(profile.trophies)) return profile;`. Test 5 must fail. Restore.
- **M1.3d** — in the never-regress path, add `delete profile.trophies[trophy.id];` before the tier loop. Test 3 must fail. Restore.

**FROZEN VALIDATION:** §VAL-COMMON, then `$TOTAL`=323, `$PLAN`=318, `$FAILED`=0, `$GTOTAL`=323, `$GFAILED`=0, `$FLAT`=318; same `$ENDS` assertions as 1.2; `$PORC` (pre-commit) exactly:
```
 M lib/profile.js
 M tests/trophies.test.js
```
then `exit $RC`.

**NON-GOALS:** no call sites yet (`api/` untouched — the `$ENDS` pins on `api/profile.js` and `api/chapter.js` enforce it), no client code, no `.oplan` writes.

---

# STEP 1.4 — the two call sites (T2 wiring)

**GOAL:** wire `awardTrophies` immediately before each of the two existing `saveProfile` calls, and prove behaviourally that a threshold-crossing action awards, that GET never does, that a 400 never does, that the chapter award counts the NEW chapter, and that `api/placement.js` is untouched.

**TIER:** WORKER. **DEPENDS ON:** 1.3.

**FILES (exhaustive):**
- `api/profile.js` — MODIFY (**LF**). Two edits.
- `api/chapter.js` — MODIFY (**CRLF — this file is the one CRLF file in the write set**). Two edits.
- `tests/trophies.test.js` — MODIFY (LF), +5 flat tests.

**Edit 1 — `api/profile.js:3`, quoted exactly:**
```js
import { defaultProfile, applyWordTap, markWordKnown, setLearner, logCheck, migrateWordKeys, applyQuizAnswer } from '../lib/profile.js';
```
becomes
```js
import { defaultProfile, applyWordTap, markWordKnown, setLearner, logCheck, migrateWordKeys, applyQuizAnswer, awardTrophies } from '../lib/profile.js';
```

**Edit 2 — `api/profile.js`, between lines 139 and 140. The surrounding lines, quoted exactly (135-142):**
```js
  } else {
    sendJson(res, 400, { ok: false, error: 'unknown action' });
    return;
  }

  await saveProfile(p);
  sendJson(res, 200, { ok: true, data: p });
}
```
becomes
```js
  } else {
    sendJson(res, 400, { ok: false, error: 'unknown action' });
    return;
  }

  // T2. The one place every POST action converges before its single write, so
  // this is the one place awarding belongs -- the promoteToCandidate precedent
  // (api/chapter.js). NEVER in GET: a read stays a read.
  awardTrophies(p);
  await saveProfile(p);
  sendJson(res, 200, { ok: true, data: p });
}
```

**Edit 3 — `api/chapter.js:3`, quoted exactly:**
```js
import { defaultProfile, promoteToCandidate } from '../lib/profile.js';
```
becomes
```js
import { defaultProfile, promoteToCandidate, awardTrophies } from '../lib/profile.js';
```

**Edit 4 — `api/chapter.js`, between lines 60 and 61. The surrounding lines, quoted exactly (56-64):**
```js
  }

  p.story.chapters.push(r.chapter);
  p.story.summarySoFar = r.summarySoFar;
  p.story.cliffhanger = r.chapter.cliffhanger;
  await saveProfile(p);

  sendJson(res, 200, { ok: true, data: { chapter: r.chapter } });
}
```
becomes
```js
  }

  p.story.chapters.push(r.chapter);
  p.story.summarySoFar = r.summarySoFar;
  p.story.cliffhanger = r.chapter.cliffhanger;
  // T2, refined (SK-1). AFTER the push, not after promoteToCandidate: awarding
  // before the push sees one chapter fewer and misses the new chapter's day.
  awardTrophies(p);
  await saveProfile(p);

  sendJson(res, 200, { ok: true, data: { chapter: r.chapter } });
}
```
**These two edits are the CRLF ones.** Every inserted line must end `\r\n`. Verify with the byte counter, never with `git diff`.

**The 5 new flat tests — names FROZEN. They need the harness copied from `tests/api-profile-post.test.js:9-60` (`withTempDataDir`, `withOpenGate`, `createMockRes`, `createGetReq`, `createPostReq`) plus `setTransport`/`resetTransport` from `lib/openai.js` for the chapter test.**

1. `'a threshold-crossing POST /api/profile awards through the real handler and persists the award'` — five `mark-known` POSTs (`dog`, `cat`, `light`, `fair`, `method`, `source: 'placement'`). After the FOURTH, `deepStrictEqual(parsed.data.trophies, {})`; after the FIFTH, `deepStrictEqual(Object.keys(parsed.data.trophies), ['known'])` and `deepStrictEqual(Object.keys(parsed.data.trophies.known), ['bronze'])`, and the value is a parseable date string. Then re-read `profile.json` from the temp dir and assert the same award is on disk. Prototype-confirmed.
2. `'a POST /api/profile that 400s awards nothing and writes nothing to disk'` — after seeding 5 known words (award present), byte-snapshot `profile.json`, POST `{ action: 'nope' }` → 400 `'unknown action'`, and POST `{ action: 'word-tap' }` → 400; assert the file bytes are IDENTICAL both times.
3. `'GET /api/profile never awards, even on a profile that has already earned trophies'` — write, by hand, a profile whose `words` keys are **already `LC_ALL=C` sorted on-manifest lemmas** `cat, dog, fair, light, method` (all `status: 'known'`) and whose `trophies` is `{ known: { bronze: NOW } }`. **AMENDED #3: the seed ALSO carries `story.chapters` = 3 entries with valid, distinct, pre-NOW `generatedAt` days — earned-but-unawarded `days`/`streak` tiers — because without them this fixture is a no-op detector and mutation M1.4b would be invisible.** **Frozen note the executor must honour: `migrateWordKeys` re-sorts `profile.words` on every GET, so an unsorted seed rewrites the file and destroys the byte check.** GET → 200; assert file bytes unchanged; assert `deepStrictEqual(parsed.data.trophies, { known: { bronze: NOW } })` — no `silver`, no `days`, no `streak`, no new trophy of any kind. Prototype-confirmed (`bytes unchanged: true`).
4. `'POST /api/chapter awards after the new chapter is pushed, so the new chapter counts'` — seed `placement.completed = true`, both learner names, and **four** prior chapters all carrying `generatedAt: '2026-01-01T00:00:00.000Z'` (one day, so `days` stays at 2 and `chapters` is the only metric near a threshold). `setTransport` returns the frozen fixture (`GOOD_TEXT` copied verbatim from `tests/api-chapter.test.js:91`, glossary `hurt/old/happy`, two questions). Assert 200; `stored.story.chapters.length === 5`; `deepStrictEqual(Object.keys(stored.trophies), ['chapters'])`; `deepStrictEqual(Object.keys(stored.trophies.chapters), ['bronze'])`. `resetTransport()` in a `finally`.
   **The fixture's Hebrew is `\u` escapes ONLY** — every codepoint below already exists in `tests/api-chapter.test.js` and was extracted by script, not retyped:
   ```js
   const Q = '\u05e9\u05d0\u05dc\u05d4';                                  // "question"
   const OPTS = ['\u05d0', '\u05d1', '\u05d2', '\u05d3'];                 // the first four Hebrew letters
   const GLOSS = [
     { word: 'hurt',  he: '\u05e4\u05e6\u05d5\u05e2' },
     { word: 'old',   he: '\u05d6\u05e7\u05df' },
     { word: 'happy', he: '\u05e9\u05de\u05d7' },
   ];
   ```
   The two question `prompt`s must DIFFER (use `Q` and `Q + Q`) and the four `options` must be distinct — `verifyChapter` (`lib/story.js:101-113`) rejects a non-Hebrew prompt or option and requires 4 distinct strings. After writing the file, dump the codepoints of these lines and confirm they decode to U+05D0–U+05EA before running anything (lesson 8).
5. `'awardTrophies is wired at exactly the two designed call sites and nowhere else'` — a source-needle test: read `api/profile.js`, `api/chapter.js`, `api/placement.js`, `api/translate.js`, `api/health.js` and every `.js` under `public/` (reuse `tests/shell.test.js:32-44`'s `listJsFiles`); assert exactly one occurrence of `awardTrophies(` **as a call** in `api/profile.js`, exactly one in `api/chapter.js`, **zero** in `api/placement.js` (the T2 non-goal — placement awards land on the next action), zero in the other handlers, and zero anywhere under `public/` (T2: "Never client-side"). Also assert `api/chapter.js`'s call sits AFTER the substring `p.story.chapters.push(r.chapter);` (SK-1, gated in source as well as in behaviour).

**COMMANDS:** `node --check api/profile.js`; `node --check api/chapter.js`; `npm test`; `APP_CODE=dummy npm test`.
(COMMIT at orchestrator acceptance: "step 1.4: wire awardTrophies at the two save moments (T2, SK-1); ledger 323 flat / 328 reported")

**MANDATED FAIL-FIRST:**
- **M1.4a** — move `awardTrophies(p);` in `api/chapter.js` from after the push to immediately after `promoteToCandidate(p);` (T2's literal wording). Test 4 must fail. **Measured in the prototype: post-push → `trophy keys: ["chapters"]`; pre-push → `trophy keys: []`.** Restore.
- **M1.4b (AMENDED #3)** — add `awardTrophies(p);` into the GET branch of `api/profile.js` (before `sendJson` at `:33`). Test 3 must fail on its RESPONSE assertion — the seeded earned-but-unawarded tiers appear in `parsed.data.trophies`. (The original byte-comparison expectation and the api-profile-quiz companion clause were wrong: at that insertion point GET has already made both save decisions and disk bytes cannot change — found by the executor stop-rule at execution, orchestrator-ruled.) Restore.
- **M1.4c** — move `awardTrophies(p);` in `api/profile.js` to AFTER `await saveProfile(p);`. Test 1's on-disk assertion must fail. Restore.
- **M1.4d** — add `awardTrophies(p);` to `api/placement.js` before its `saveProfile` at `:76`. Test 5 must fail. Restore.

**FROZEN VALIDATION:** §VAL-COMMON, then:
```bash
case "$TOTAL"  in 328) ;; *) fail "expected 328 reported tests, got '$TOTAL'";; esac
case "$PLAN"   in 323) ;; *) fail "expected top-level plan 1..323, got '1..$PLAN'";; esac
case "$FAILED" in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL" in 328) ;; *) fail "APP_CODE=dummy: expected 328, got '$GTOTAL'";; esac
case "$GFAILED" in 0)  ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"   in 323) ;; *) fail "expected 323 flat tests, got '$FLAT'";; esac
case "$ENDS" in *"api/profile.js CRLF=0 LF=146"*) ;; *) fail "api/profile.js endings/line count wrong (want CRLF=0 LF=146): $ENDS";; esac
case "$ENDS" in *"api/chapter.js CRLF=67 LF=0"*)  ;; *) fail "api/chapter.js endings/line count wrong (want CRLF=67 LF=0): $ENDS";; esac
case "$ENDS" in *"lib/profile.js CRLF=0 "*)       ;; *) fail "lib/profile.js gained CRLF: $ENDS";; esac
APIDEL="$(git diff --numstat HEAD -- api/profile.js api/chapter.js | awk '{s+=$2} END{print s+0}')"
case "$APIDEL" in 2) ;; *) fail "api deletion budget is exactly 2 (the two import lines), got '$APIDEL'";; esac
EXPECT=' M api/chapter.js
 M api/profile.js
 M tests/trophies.test.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```

**NON-GOALS:** no change to `lib/profile.js`, `tests/profile.test.js`, `api/placement.js`, `api/translate.js`, `api/health.js`, `lib/store.js`; no new API route; no change to any response envelope shape beyond the profile object naturally gaining `trophies`; no dev server; no network.

---

# STEP 1.5 — phase close

**GOAL:** re-run every acceptance criterion on the committed tree and write the record.

**TIER:** ORCHESTRATOR-authoring. **DEPENDS ON:** 1.1–1.4 all accepted.

**FILES (exhaustive):**
- `.oplan/word-trophies/journal.md` — APPEND (append-only file).
- `.oplan/word-trophies/phase-state.md` — CREATE (the `word-g1` `phase-state.md` shape: CURRENT / PLAN / BASE+ACCEPTED / STATE OF THE TREE / FROZEN CONTRACTS / OPEN QUESTIONS / BLOCKED).

**COMMANDS:** run §VAL-COMMON plus the step-1.4 assertion set unmodified (it IS the phase acceptance run); then `git commit -m "oplan: word-trophies PHASE 1 CLOSED — engine live at ledger 323 flat / 328 reported, contrast 52, both transcripts empty, public/ untouched"`.

**The record must state, for phase 2/3 to consume:** the final ledger (323 flat / 328 reported); contrast still 52; CACHE still `magic-vet-v17` and QZ-22's next bump is still v18, unused (phase 1 never touched `public/`); the `public/` digest `2362 74e736d7d83b22a24945eae87cb9fe33` unchanged; that **no D25 capture exists and none was made**; that `awardTrophies` will award on the first real POST after deploy (the free backfill, T9) and that on her profile as last measured — 12 known, 0 candidates — `known` bronze lands immediately and `proven` stays locked, exactly as T3's honesty note says; SK-1 through SK-6 as amendments to the signed design; and the phase-3 handoff items in RECORD GAPS below.

**NON-GOALS:** no deploy, no capture, no `public/` change, no CACHE bump, no code change of any kind.

---

## RISKS

1. **The `days` and `streak` metrics are not monotonic.** `lastSeen` is *overwritten* by `applyWordTap`/`markWordKnown`, so a day that once contributed can vanish from the set as words get re-touched. Earned tiers are protected by the never-regress law (test A3 in step 1.3), but a child who sees "12 of 15" may later see "9 of 15" on the phase-3 progress line. Mitigation: phase 3 must render progress from the *metric*, not from a stored high-water mark, and must never render a decrease as a loss. Flagged for phase 3, not fixable here.
2. **A wrong award cannot be retracted by design.** T2 forbids deletion. A metric bug that awards early is an owner ruling (§6 of the design), not a code fix. Mitigation: the engine ships with hand-derived expected values and a fail-first mutation per behaviour; nothing is verified against a re-implementation (lesson 2).
3. **CRLF damage in `api/chapter.js` is invisible to git.** Measured live this session: a `git archive` copy of this repo silently CRLF'd every file, and `git diff` would have shown nothing. Mitigation: the byte counter pins `api/chapter.js CRLF=65 LF=0` and `api/profile.js CRLF=0 LF=143` exactly, in every step's block including the steps that must NOT touch them.
4. **Shell escape collapse.** `\\d` and `\uXXXX` were both eaten twice while preparing this plan. Mitigation: SK-4 removes every backslash from the frozen engine source; the chapter fixture's `\u` escapes must be written with a file tool (never a heredoc) and then codepoint-dumped before use; §VAL-COMMON fails the step if `tests/trophies.test.js` contains a single raw non-ASCII byte.
5. **Test-count drift.** Any extra or merged `test()` breaks the pinned ledger and the executor may be tempted to "adjust" the number. The stop-rule applies: pinned numbers are frozen; a mismatch is escalated.
6. **`tests/api-chapter.test.js › POST generate promotes a quiet learning word to candidate and saves it` now silently earns `days` bronze** (its two seeded chapters are on 2026-02-01 and 2026-03-01, plus the generated one → 3 distinct days). It asserts nothing about `trophies` and passes — measured. If a future step tightens that test to a whole-profile comparison, it will break.
7. **Thresholds are provisional (owner-signed as such).** Tuning them later is safe downward and unsafe upward only in the cosmetic sense (an already-earned tier persists). No code accommodation needed.

## BLOCKERS

**None.** Every decision the executor could need is frozen above: catalogue shape and contents, day derivation, streak definition, the two guard behaviours (SK-5, SK-6), the `now` question (SK-2), the chapter call-site position (SK-1, measured), where the Hebrew names live (SK-3), the exact error strings, the exact insertion points with surrounding lines quoted, the exact fixtures with hand-derived expected values, the per-step ledger, the per-file line-ending pins, and every fail-first mutation.

## RECORD GAPS

1. **`api/chapter.js` does not return a profile.** `api/chapter.js:63` is `sendJson(res, 200, { ok: true, data: { chapter: r.chapter } })`. Design T5 says the celebration fires "When a POST /api/profile response (**or chapter generation response**) returns a profile whose trophies map contains a tier timestamp the phone has not yet celebrated." No such profile is in that response. Phase 3 must choose: widen the chapter response, or re-GET after generation (and GET creates a profile — lesson 3). Worked around here only in the sense that phase 1 does not depend on it; **phase 3 must rule.**
2. **T2's "immediately after `promoteToCandidate`" is wrong** — see SK-1. Recorded as an amendment, not silently fixed.
3. **T2's "the same `now` the calling action already uses"** has no referent in `api/profile.js` — see SK-2.
4. **No captured profile exists**, so design T3's "she has 12 known today → bronze lands on the first award pass" is unverified this phase. It is stated as an expectation in the step-1.5 record and must be confirmed by phase 4's read-back, not asserted by any test.
5. **The field guide has no lesson covering git-mediated copies.** Lesson 4 covers checkout and the Edit tool; it does not warn that `git archive` (and by extension `git stash`, a fresh clone, or a worktree) re-applies `core.autocrlf=true` and flips every file, making byte comparisons in such a copy meaningless. Measured this session. Recommend adding it at the phase-1 close.
6. **Lesson 8's escape-collapse trap is broader than recorded.** It names `\uXXXX` through `bash -e`; a regex `\\d` collapsed the same way in a quoted heredoc, producing a silently wrong-but-syntactically-valid regex that made a metric return 0. Recommend widening the lesson to "any backslash, any shell path."
7. **No `.oplan/word-trophies/phase-state.md` exists yet** — every prior run has one; step 1.5 creates it.

---

## PLAIN PLAN

- **Step 1.1** — Teach the profile file that a "trophies" box exists and what a legal trophy record looks like, so a saved profile can carry awards without any older part of the app choking on them. *Why: the storage shape has to be settled and guarded before anything writes into it.*
- **Step 1.2** — Write down the eight trophies with their bronze/silver/gold numbers, and the exact rules for counting each one (chapters read, days active, longest run of days in a row, words known, quiz answers right, quiz answers attempted, word taps, words the app guessed and she proved). *Why: the counting rules are what decide whether a child is told the truth about what she earned.*
- **Step 1.3** — Write the one function that looks at a profile, works out each count, and stamps the date on any tier she has newly reached — never removing one, never changing one already stamped, never inventing one she has not earned. *Why: this is the whole engine, and it must be safe to run over and over.*
- **Step 1.4** — Call that function at the two moments the server already saves her profile: after any action on the words screen, and after a new chapter is written (after the chapter is added, so the new chapter counts). Never when merely reading. *Why: awards should appear at exactly the moments something real happened, and never as a side effect of opening the app.*
- **Step 1.5** — Re-run every check on the finished tree and write down what happened, what changed from the signed design and why, and what phase 2 and 3 need to know. *Why: the next person starts from files, not from memory.*

**DONE WHEN:** the full suite passes at 323 flat tests (328 reported) both with and without the app code set, the contrast gate still reports 52, both frozen transcripts still print exactly their committed expected text, nothing under `public/` has moved by a single byte, no local profile file exists, and only the five intended files changed — with a recorded failure observed for every mutation that should break a test.

---

# WORD-TROPHIES — PHASE 2 IN FULL (planned 2026-07-29 by a fresh planner — Opus, files only;
# the planner measured its claims: suffix 388 bytes md5 51b97a774dc52aa272850bb686c22188,
# sw.js md5 f16579d50af8b49a04e45a80975c6acf, exclusion digest == the phase-1 pin, sharp probe,
# binary blob==disk probe, tests/ grep for asset assertions).
#
# ORCHESTRATOR VERIFICATION before review (2026-07-29, tree clean at 4966d89): suffix md5+388
# CONFIRMED by independent extraction · sw.js md5 CONFIRMED · chat URL at docs/visual-design.md:266
# CONFIRMED · exclusion digest 2362 74e736d7d83b22a24945eae87cb9fe33 CONFIRMED ·
# scripts/optimize-placement.js precedent matches the frozen 2.4 script line-for-line · sharp OK
# (heroine.png 1254x1254) · no .gitattributes · doc CRLF=0 LF=317 · briefing.md + STATUS.md read:
# NO phase-2 owner instruction beyond the record (closes planner RECORD GAP 8).
# P2-AMENDMENT #1 (orchestrator, pre-review): (a) the draft invoked §VAL-P2 as a CHILD bash and
# then used its fail/$PORC/$RC in the tail — undefined there, so every tail would exit 0
# unconditionally (the silent-pass class); each step validation is ONE script = §VAL-P2 verbatim +
# the tail. (b) step 2.1 cleanliness check gains the standard .oplan/ filter. (c) step 2.6 opens
# with BASE=<the phase-2 base hash recorded at go-ahead> so its diff-filter=D is runnable as frozen.

PHASE 2: the assets (T6 artwork — 9 masters, 9 derivatives, owner-gated)

GOAL: Nine owner-approved images exist as committed PNG masters under `assets/delight/trophies/` and as committed 640×640 webp derivatives under `public/assets/trophies/`, produced through the free ChatGPT-web route in the one dedicated art chat with the FROZEN STYLE SUFFIX appended verbatim, reproducible by a committed script, and recorded in `docs/visual-design.md`. No app code, no test, no CSS, no CACHE bump, no deploy, no touch of her profile — the suite, the contrast anchor, both transcripts and every byte of `public/` outside the new trophies directory are exactly where phase 1 left them.

ACCEPTANCE CRITERIA (mechanical, frozen; all re-run by the orchestrator at the close, step 2.6)

1. `assets/delight/trophies/` contains exactly nine files — `chapters.png days.png streak.png known.png quizRight.png quizzer.png curious.png proven.png shelf-header.png` — each `format=png`, square (`width === height`), `width >= 1024`, and md5-distinct from each other, from all nine existing `assets/delight/*.png` masters, and from `assets/design-tests/dragon-clinic-test.png`.
2. `public/assets/trophies/` contains exactly nine files with the same stems and `.webp`, each `format=webp` and exactly `640x640`, all md5-distinct from each other and from the eight existing `public/assets/*.webp`; re-running `node scripts/optimize-trophies.js` twice leaves the nine md5s unchanged (byte-reproducible).
3. `.oplan/word-trophies/journal.md` carries, for each of the nine ids, a last-occurring line `TROPHY-ART <id>: APPROVED...` and a line `TROPHY-ART-MD5 <id> <md5>` whose md5 equals the committed master's bytes (GC-D8 bound to bytes, not to a memory).
4. `public/` outside `public/assets/trophies/` is byte-identical to the phase-1 close: the exclusion digest equals **`2362 74e736d7d83b22a24945eae87cb9fe33`** (measured today; identical to the phase-1 pin), and the full recursive digest counts exactly **2371** files (2362 + 9).
5. `public/sw.js` md5 = **`f16579d50af8b49a04e45a80975c6acf`** — `CACHE` stays `magic-vet-v17`, `PRECACHE` byte-unchanged, no bump this phase (see SKELETON CHANGES #3).
6. Suite unmoved: `npm test` exits 0 with `# tests 328`, `# fail 0`, plan `1..323`; identical under `APP_CODE=dummy`; flat ledger `grep -h -c '^test(' tests/*.js` = **323**; `node scripts/check-contrast.mjs` exits 0 with `grep -c '^PASS'` = **52**.
7. Both frozen transcripts diff EMPTY (`.oplan/word-quiz/quiz-transcript.mjs`, `.oplan/word-g1/g1-transcript.mjs`); `.data/profile.json` absent.
8. Write set vs the phase base is exactly: nine new masters, nine new webps, new `scripts/optimize-trophies.js`, modified `docs/visual-design.md` — nothing else. Zero files deleted (`git diff --diff-filter=D --name-only <BASE>` empty) and `git diff --numstat <BASE> -- docs/visual-design.md` deletions = **0** (additive edit only).
9. Binary integrity vs the autocrlf trap: for each of the 18 committed binaries, `md5(worktree file)` equals `md5(git cat-file blob HEAD:<path>)`; and `scripts/optimize-trophies.js` has CRLF=0 (LF only), byte-counted, never `git diff`.
10. `docs/visual-design.md` contains, whitespace-normalized, each of the nine prompt bodies exactly once, plus the nine inventory rows naming `assets/delight/trophies/<id>.png`.
11. No file under `lib/`, `api/`, `tests/`, `public/views/`, `public/*.js`, `public/styles.css` changed; `awardTrophies` call-site count unchanged (implied by criterion 6's unmoved suite).

DEPENDS ON (all verified on disk today, tree clean at `4966d89`)

| thing | source | verified |
|---|---|---|
| the 8 frozen trophy ids `chapters days streak known quizRight quizzer curious proven` | `lib/profile.js` `TROPHY_CATALOG` (phase 1 step 1.2, commit `344f0de`; journal "STEP 1.2") | imported and printed today |
| `public/` byte pin `2362 74e736d7d83b22a24945eae87cb9fe33` | `phase-state.md:14`, journal "PHASE 1 CLOSED" criterion 5 | recomputed today: identical |
| ledger 323 flat / 328 reported, contrast 52, transcripts empty, no `.data/profile.json` | `phase-state.md:13-17` | all four re-measured today: 328/0, plan 1..323, flat 323, 52 PASS, both diffs EMPTY, no profile |
| `CACHE = magic-vet-v17` live AND in worktree; next bump v18, **unused** (phase 1 never touched `public/`) | `phase-state.md:15`, journal "FOR PHASE 2/3 TO CONSUME" | `public/sw.js:1` read; md5 pinned |
| T6 artwork contract (9 images, masters path, ChatGPT WEB never the paid API, suffix verbatim, derivatives square/640, NOT precached, CSS-only tiers, GC-D8, md5-distinctness) | `design.md` §4 T6, SIGNED §8 | read |
| FROZEN STYLE SUFFIX | `docs/visual-design.md` §6, heading `### FROZEN STYLE SUFFIX`, **lines 201-205** | extracted by script: 5 blockquote lines, joined by single spaces = **388 bytes, md5 `51b97a774dc52aa272850bb686c22188`** |
| the art pipeline rules (ONE dedicated chat `https://chatgpt.com/c/6a632008-2d04-83ed-8557-370a2881a0dc`, one image at a time, blob-capture supersedes "newest in ~/Downloads", md5 distinctness) | `docs/visual-design.md` §7 | read |
| the ORCHESTRATOR-RUN art-step precedent (mechanical checks, then owner verdict line, then integration) | `.oplan/band2-and-polish/plan.md` steps 2.5-2.6 | read |
| the subdirectory derivative precedent | `scripts/optimize-placement.js` (SRC `assets/placement`, OUT `public/assets/placement`, one script per group) | read |
| `sharp ^0.35.3` devDependency, installed and working | `package.json`, live probe | `sharp('assets/delight/heroine.png')` → `png 1254x1254`; webp read OK |
| binary files are not autocrlf-normalized here (no `.gitattributes`, `core.autocrlf=true`) | live probe | `md5(disk) == md5(git cat-file blob HEAD:…)` for `heroine.png` and `heroine.webp` |
| no test reads `assets/` or `public/assets/`; `shell.test.js` `listJsFiles` filters `.js`; `item-review.test.js` counts only html-referenced assets | grep of `tests/` (field-guide lesson 7 done before planning any file move) | read |

Phase 1 produced nothing this phase blocks on beyond the eight ids and the frozen tree state — the engine and the artwork are independent. Nothing in phase 2 is already done: `assets/delight/trophies/` and `public/assets/trophies/` do not exist.

SKELETON CHANGES

**SK2-1 — "No code" is wrong by one build script.** Design §5 says phase 2 is "No code"; T6 says derivatives come "via the existing `scripts/optimize-assets.js` pipeline". `optimize-assets.js` cannot produce them: its `WIDTHS` map is flat, its single `mkdir(OUT)` never creates a subdirectory, and **re-running it would rewrite all eight existing `public/assets/*.webp`** (a different sharp build could change their bytes and break the digest pin — band2's plan already declared re-running it a non-goal for exactly this reason). The house pattern for a new asset group is a sibling script: `scripts/optimize-placement.js` is that precedent, byte-for-byte the same shape. **Frozen: a new `scripts/optimize-trophies.js` (source frozen in step 2.4), and `scripts/optimize-assets.js` is never run and never edited.** "The existing pipeline" is honoured as the recipe (sharp, `withoutEnlargement`, `webp quality 72 effort 4`), not as the literal file. This is build-time tooling, outside `public/`, outside the test ledger.

**SK2-2 — the shelf-header is square, and it is named `shelf-header`.** T6 names no filename and carves out no aspect: it says nine assets, `<id>.png`, derivatives "square, width 640". Read literally, all nine are square. **Frozen: `assets/delight/trophies/shelf-header.png` → `public/assets/trophies/shelf-header.webp`, 640×640.** `shelf-header` cannot collide with any trophy id. Consequence phase 3 inherits: if the header must read as a band, that is `object-fit`/`aspect-ratio` in CSS, not a regeneration — T4 never places the header at all (see RECORD GAPS 1).

**SK2-3 — this phase does NOT bump `CACHE`, and that is a decision, not an omission.** The record contains two readings. (a) word-g1's signed §10, restated in this run's frozen-contract list, says "public/ byte-frozen until a phase whose plan moves it (then v18)" — a literal reading demands v18 here. (b) This run's SIGNED design assigns the bump to phase 3: T4 says "PRECACHE += `/views/trophies.js`; CACHE v17 → v18 (QZ-22)", and T6 says trophy art is "NOT precached (art rule, §2(iv))", where §2(iv) states artwork is "runtime-fetched and never cached". **Frozen: phase 2 leaves `public/sw.js` byte-identical at v17 (acceptance criterion 5); the single v17→v18 bump lands in phase 3, where the signed design puts it, and covers this phase's `public/` addition as well as phase 3's own.** The reasons: QZ-22's failure mode is "returning devices serve the old shell forever", which is a **deploy**-time hazard, and neither phase 2 nor phase 3 deploys — phase 4 does, once, after the v18 bump exists; the trophy webps are never in `PRECACHE`, so no cache entry can go stale; and bumping here would make the signed T4 sentence false and force phase 3 to v19. Carried obligation, to be written into `phase-state.md` at the close: *phase 3's v18 bump is mandatory and now also covers phase 2's `public/assets/trophies/` addition.* If the orchestrator or owner rules the other way, the whole change is local: step 2.4 additionally edits `public/sw.js:1` to `magic-vet-v18` and `tests/shell.test.js:58`'s assertion string in lockstep, criterion 5 flips to the v18 md5, and phase 3's bump becomes a no-op.

**SK2-4 — the `public/` frozen expectation becomes an EXCLUSION digest for this phase, and is re-pinned at the close.** The full-tree pin cannot survive a phase that adds files. **Frozen mechanism:** during phase 2 the gate is the same walker with `public/assets/trophies` skipped; measured today it returns exactly the phase-1 pin `2362 74e736d7d83b22a24945eae87cb9fe33`, so it is a real invariant and not a tautology, and it will still return that value after the nine webps land. At the close (2.6) the orchestrator computes the **full** digest (file count asserted = 2371) and writes it into `phase-state.md` as the new frozen pin phase 3 inherits, alongside the exclusion pin, which stays valid forever as "everything outside the trophies directory".

**SK2-5 — binary files and the endings law.** There is no `.gitattributes` and `core.autocrlf=true`. Measured today on known-good binaries (`heroine.png`, `heroine.webp`): worktree md5 == blob md5, i.e. git's binary detection already keeps PNG/webp out of the clean filter. **Frozen: no `.gitattributes` is added** (adding one would re-normalize text files across the repo — precisely the lesson-4 hazard), and the protection is a *check*, not a config: criterion 9 compares each committed binary's worktree md5 against `git cat-file blob HEAD:<path>`. The only text file this phase creates, `scripts/optimize-trophies.js`, is LF-only (matching all three sibling scripts, byte-counted today at CRLF=0) and is byte-counted, never `git diff`-ed (lesson 4).

**SK2-6 — T10 (the `docs/visual-design.md` §3 palette truth-fix) is NOT in this phase.** Design §5 never assigns T10 to a phase. It is a palette correction; phase 3 is the phase that works the palette (T7: three new tokens in `:root` plus their contrast pairs, moving the 52 anchor). **Frozen: phase 2's doc edit is confined to §6 (inventory + prompts) and §7 (one pipeline bullet); T10 is handed to phase 3** and recorded as such in `phase-state.md`. Doing both in one phase would put an unrelated palette rewrite into an artwork step's diff.

**SK2-7 — no new test file, and the ledger stays 323/328.** T6's "md5-distinctness is asserted" is satisfied by the frozen validation commands (criteria 1-2), which the orchestrator re-runs in a clean state. A committed `tests/trophies-art.test.js` would move the ledger and force a re-pin of a number four other documents quote — for assets no shipping code references yet. **Frozen: the asset-existence/distinctness test belongs to phase 3**, where the view actually references `/assets/trophies/<id>.webp` and the ledger moves once for the whole screen. Recorded as a phase-3 obligation.

**SK2-8 — the nine trophy images are objects, not characters (7+1), and carry no tier metal.** Design §6 names style drift across nine images as this phase's own risk. Characters drift; objects do not. **Frozen: the eight trophy prompts depict objects only, with no people; the shelf-header is the only prompt that carries a cast member (the teal baby dragon).** And because T6 makes tier differentiation CSS-only (ring colour + grayscale dim, T4), every prompt explicitly forbids a metal cup or medal — a gold-coloured trophy in the art would fight the bronze ring the CSS draws over it.

---

## §VAL-P2 — the frozen validation preamble (steps 2.2, 2.4, 2.5, 2.6 begin with this verbatim)

The `sed`/`awk` lines below are copied byte-for-byte from `plan.md` §VAL-COMMON, which ran clean 30+ times in phase 1. **Deliver this to any executor as a FILE, never inline in a JSON packet** — its backslashes collapsed in transit twice in phase 1 (field-guide lesson 8).

```bash
#!/usr/bin/env bash
set -o pipefail
cd C:/Users/dkreinov/claude/english-app || { echo "FAIL: cannot cd to the repo"; exit 1; }
RC=0
fail() { echo "FAIL: $*"; RC=1; }

# --- suite (plain) ---
OUT="$(npm test 2>&1)"; STAT=$?
case "$STAT" in 0) ;; *) fail "npm test exited $STAT";; esac
TOTAL="$(printf '%s\n' "$OUT" | sed -n 's/^# tests \([0-9][0-9]*\).*$/\1/p')"
FAILED="$(printf '%s\n' "$OUT" | sed -n 's/^# fail \([0-9][0-9]*\).*$/\1/p')"
PLAN="$(printf '%s\n' "$OUT" | sed -n 's/^1\.\.\([0-9][0-9]*\).*$/\1/p')"
case "$TOTAL"  in 328) ;; *) fail "expected 328 reported tests, got '$TOTAL'";; esac
case "$FAILED" in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$PLAN"   in 323) ;; *) fail "expected top-level plan 1..323, got '1..$PLAN'";; esac

# --- suite (gated) ---
GOUT="$(APP_CODE=dummy npm test 2>&1)"; GSTAT=$?
case "$GSTAT" in 0) ;; *) fail "APP_CODE=dummy npm test exited $GSTAT";; esac
GTOTAL="$(printf '%s\n' "$GOUT" | sed -n 's/^# tests \([0-9][0-9]*\).*$/\1/p')"
GFAILED="$(printf '%s\n' "$GOUT" | sed -n 's/^# fail \([0-9][0-9]*\).*$/\1/p')"
case "$GTOTAL"  in 328) ;; *) fail "APP_CODE=dummy: expected 328, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac

# --- flat ledger (phase 2 adds no tests) ---
FLAT="$(grep -h -c '^test(' tests/*.js | awk '{s+=$1} END{print s+0}')"
case "$FLAT" in 323) ;; *) fail "expected 323 flat tests, got '$FLAT'";; esac

# --- contrast anchor 52 (phase 2 adds no tokens) ---
CON="$(node scripts/check-contrast.mjs 2>&1)"; CSTAT=$?
case "$CSTAT" in 0) ;; *) fail "check-contrast exited $CSTAT";; esac
PASSES="$(printf '%s\n' "$CON" | grep -c '^PASS')"
case "$PASSES" in 52) ;; *) fail "contrast anchor moved: expected 52 PASS lines, got '$PASSES'";; esac

# --- public/ OUTSIDE the trophies dir is byte-frozen (SK2-4; no backslashes: lesson 8) ---
PUBX="$(node -e 'const fs=require("fs"),path=require("path"),crypto=require("crypto");const out=[];(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);const p=f.split(path.sep).join("/");const s=fs.statSync(f);if(s.isDirectory()){if(p==="public/assets/trophies")continue;walk(f);}else out.push(p+" "+crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex"));}})("public");console.log(out.length+" "+crypto.createHash("md5").update(out.join(String.fromCharCode(10))).digest("hex"));')"
case "$PUBX" in "2362 74e736d7d83b22a24945eae87cb9fe33") ;; *) fail "public/ outside the trophies dir moved: expected '2362 74e736d7d83b22a24945eae87cb9fe33', got '$PUBX'";; esac

# --- the service worker does not move this phase (SK2-3) ---
SWMD5="$(md5sum public/sw.js | cut -d' ' -f1)"
case "$SWMD5" in f16579d50af8b49a04e45a80975c6acf) ;; *) fail "public/sw.js moved: $SWMD5 (phase 2 does not bump CACHE)";; esac

# --- both transcripts must diff EMPTY ---
VD="$HOME/trophies-val"; mkdir -p "$VD"
node .oplan/word-quiz/quiz-transcript.mjs > "$VD/qz.out" 2>&1 || fail "quiz-transcript.mjs exited non-zero"
QZ="$(diff "$VD/qz.out" .oplan/word-quiz/quiz-transcript-expected.txt)"
case "$QZ" in "") ;; *) fail "QZ-21 transcript moved";; esac
node .oplan/word-g1/g1-transcript.mjs > "$VD/g1.out" 2>&1 || fail "g1-transcript.mjs exited non-zero"
G1="$(diff "$VD/g1.out" .oplan/word-g1/g1-transcript-expected.txt)"
case "$G1" in "") ;; *) fail "G1 transcript moved";; esac
rm -f "$VD/qz.out" "$VD/g1.out"

# --- her profile must never appear locally ---
if [ -e .data/profile.json ]; then fail ".data/profile.json exists -- a local write leaked"; fi

# --- write set (.oplan is the orchestrator record, never an executor write set) ---
PORC="$(git status --porcelain -uall | awk '$NF !~ /^\.oplan\//' | LC_ALL=C sort)"
```

Per-step blocks continue from here with their own assertions on `$PORC` and their own checks, then `exit $RC`.

## FROZEN CONTRACTS — in force for every step of this phase

- **The nine filenames.** Masters `assets/delight/trophies/{chapters,days,streak,known,quizRight,quizzer,curious,proven,shelf-header}.png`; derivatives `public/assets/trophies/<same stem>.webp`. The eight stems are the `TROPHY_CATALOG` ids **exactly**, camelCase included (`quizRight.png`, not `quizright.png`) — phase 3 builds the src as `/assets/trophies/${id}.webp`. Nine, not 24: one image per trophy, tiers are CSS (T6, T4).
- **The FROZEN STYLE SUFFIX**, extracted from `docs/visual-design.md` §6 (heading `### FROZEN STYLE SUFFIX`, lines 201-205 today), the five blockquote lines with `> ` stripped and joined by single spaces — **388 bytes, md5 `51b97a774dc52aa272850bb686c22188`**:
  > Warm cozy cartoon illustration in exactly the same style, palette and rendering as the earlier girl-and-dragon clinic image in this chat: soft painterly 3D-cartoon look, warm golden lighting, wood-and-magic fantasy world, teal + violet + amber accents on warm cream. Aimed at an 11-year-old — charming and adventurous, not babyish. No text, no letters, no watermark, no frame or border.

  It is **never retyped**: every prompt file is built by extracting it from the doc by script (step 2.1), and every gate verifies the tail bytes against that md5.
- **The one chat.** `https://chatgpt.com/c/6a632008-2d04-83ed-8557-370a2881a0dc` ("Image Request Cartoon Style"), the free ChatGPT **web** route. Never a new chat, never the paid API, one generation at a time (`docs/visual-design.md` §7; delight-pass field-guide lessons 10-12).
- **Capture.** Fetch the image blob in-page and click **exactly ONE** synthetic `<a download="trophy-<id>.png">`; never the Download control, never the "newest file in ~/Downloads" heuristic (that produced the 89-duplicate burst, `docs/visual-design.md` §7). Verify no file of that name exists in `C:/Users/dkreinov/Downloads` **before** the click; poll from the shell afterwards; do not re-click.
- **Scratch lives outside the repo** (field-guide lesson 4): prompts at `$HOME/trophies-art/prompts/`, previews and contact sheets at `$HOME/trophies-art/preview/`, validation scratch at `$HOME/trophies-val/`. Nothing scratch is ever written under the repo.
- **The owner gate (GC-D8)** is per asset and precedes integration. Verdict format, appended by the orchestrator to `journal.md`: `TROPHY-ART <id>: APPROVED` or `TROPHY-ART <id>: REJECTED - <reason>`; paired with `TROPHY-ART-MD5 <id> <md5>`. A regeneration appends a **new** pair; the last line for an id wins.
- **Commits are the ORCHESTRATOR's, at acceptance** (plan amendment #2). No step's COMMANDS contain `git add`/`git commit`.
- **Executor stop-rule (lesson 9).** Never silently "fix" a frozen command, a pinned md5 or a prompt. If a gate contradicts reality, STOP, report, wait for a ruling.

---

STEP 2.1: build the nine prompt files, suffix extracted verbatim
  goal: Nine plain-text prompt files exist outside the repo, one per asset, each = the frozen ASCII body + one space + the FROZEN STYLE SUFFIX **bytes taken from `docs/visual-design.md`, never retyped**. The repo is untouched. These files are the only thing that ever gets pasted into the chat, and the only source step 2.5 records into the doc.
  files: `$HOME/trophies-art/prompts/chapters.txt`, `days.txt`, `streak.txt`, `known.txt`, `quizRight.txt`, `quizzer.txt`, `curious.txt`, `proven.txt`, `shelf-header.txt` — CREATE. **Nothing inside the repository.**
  commands:
```bash
mkdir -p "$HOME/trophies-art/prompts"
# then one node script (written to $HOME/trophies-art/build-prompts.js and run with `node`,
# NEVER a heredoc and never inline in a packet -- lesson 8) which:
#   1. reads docs/visual-design.md, finds the line "### FROZEN STYLE SUFFIX", collects the
#      following contiguous lines that begin "> ", strips the two-character "> " prefix,
#      joins them with single spaces -> SUFFIX;
#   2. asserts md5(SUFFIX) === "51b97a774dc52aa272850bb686c22188" and its byte length is 388,
#      STOPPING if not (the doc moved -> escalate, do not adapt);
#   3. writes each file as BODY + " " + SUFFIX, no trailing newline, LF-irrelevant (single line).
node "$HOME/trophies-art/build-prompts.js"
```
  validation:
```bash
cd C:/Users/dkreinov/claude/english-app && set -o pipefail && node -e '
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const NL=String.fromCharCode(10);
const L=fs.readFileSync("docs/visual-design.md","utf8").split(NL);
const i=L.indexOf("### FROZEN STYLE SUFFIX");
if(i<0) throw new Error("suffix heading not found in docs/visual-design.md");
const acc=[];
for(let j=i+1;j<L.length;j++){const t=L[j];if(t.indexOf("> ")===0)acc.push(t.slice(2));else if(acc.length)break;}
const SUF=Buffer.from(acc.join(" "),"utf8");
const SUF_MD5=crypto.createHash("md5").update(SUF).digest("hex");
if(SUF_MD5!=="51b97a774dc52aa272850bb686c22188") throw new Error("the FROZEN STYLE SUFFIX in the doc changed: md5="+SUF_MD5);
if(SUF.length!==388) throw new Error("suffix length "+SUF.length+", expected 388");
const IDS=["chapters","days","streak","known","quizRight","quizzer","curious","proven","shelf-header"];
const DIR=path.join(process.env.HOME,"trophies-art","prompts");
const got=fs.readdirSync(DIR).sort().join(",");
const want=IDS.map(x=>x+".txt").sort().join(",");
if(got!==want) throw new Error("prompt dir holds ["+got+"], expected ["+want+"]");
const bodies=new Set();
for(const id of IDS){
  const b=fs.readFileSync(path.join(DIR,id+".txt"));
  if(b.length<=SUF.length+1) throw new Error(id+": file too short");
  if(!b.slice(b.length-SUF.length).equals(SUF)) throw new Error(id+": does not end with the frozen suffix bytes");
  if(b[b.length-SUF.length-1]!==32) throw new Error(id+": body and suffix must be joined by exactly one space");
  const body=b.slice(0,b.length-SUF.length-1);
  for(const x of body) if(x<32||x>126) throw new Error(id+": body byte "+x+" is not printable ASCII");
  const s=body.toString("ascii");
  if(s.indexOf("Square image (1:1): ")!==0) throw new Error(id+": body must start with the frozen opener");
  if(bodies.has(s)) throw new Error(id+": duplicate prompt body");
  bodies.add(s);
}
console.log("PROMPTS-OK 9 files, bodies pure ASCII and distinct, suffix verbatim "+SUF_MD5);
' && [ -z "$(git status --porcelain | awk '$NF !~ /^.oplan//')" ] && echo STEP-2.1-OK   # P2-AMENDMENT #1b: .oplan is the orchestrator record
```
  contracts: **The nine prompt bodies, frozen, pure ASCII, each written as ONE line (no em-dashes, no curly quotes — the suffix is the only non-ASCII text in the file, and that arrives from the doc by extraction).**

  - **chapters** — `Square image (1:1): a thick open storybook lying on a warm wooden table, a glowing winding path and two tiny floating islands rising up out of its open pages like a small magical world, warm amber glow from the pages, violet and teal sparkles drifting above it, completely blank pages with no writing of any kind, no people, no metal cup and no medal, the book centered with generous empty margin on all four sides, soft warm background.`
  - **days** — `Square image (1:1): a small potted magical herb on a sunlit wooden windowsill, one stem showing three clear stages of growth from sprout to full glowing leaves, a little copper watering can beside the pot with one amber droplet caught in mid air, teal and violet leaf tips, no people, no metal cup and no medal, the plant centered with generous empty margin on all four sides, soft warm background.`
  - **streak** — `Square image (1:1): a gentle arc of five small round paper lanterns strung along a cord, each lantern lit a little warmer and brighter than the one before it, tiny amber sparks travelling along the cord between them, violet and teal glass panes in the lanterns, no people, no metal cup and no medal, the arc of lanterns centered with generous empty margin on all four sides, soft warm background.`
  - **known** — `Square image (1:1): a small rounded wooden treasure chest with brass corner fittings and its lid open, filled with glowing gem-like crystals in violet, teal and amber whose light spills onto the underside of the lid, three loose crystals resting on the wooden table in front of it, a wooden chest and not a glass jar, no people, no metal cup and no medal, the chest centered with generous empty margin on all four sides, soft warm background.`
  - **quizRight** — `Square image (1:1): a round wooden practice target with concentric painted rings in violet, teal and amber, three slim glowing arrows clustered together dead center in the bullseye, faint rings of sparkle spreading outward from the hits, the target leaning against a warm wooden wall, no people, no metal cup and no medal, the target centered with generous empty margin on all four sides, soft warm background.`
  - **quizzer** — `Square image (1:1): a well used brown leather apprentice satchel standing open on a wooden floor with practice gear spilling gently out of it, a rolled white bandage, a small wooden mortar and pestle, a coil of teal cord and a folded cloth, warm amber lamplight on the worn leather, violet and teal stitching along the flap, no people, no metal cup and no medal, the satchel centered with generous empty margin on all four sides, soft warm background.`
  - **curious** — `Square image (1:1): a large round brass rimmed magnifying glass resting at an angle over a wooden table, its lens magnifying a single glowing violet paw print on the wood, tiny amber sparkles drifting up through the lens, soft teal reflections in the glass, no people, no metal cup and no medal, the magnifying glass centered with generous empty margin on all four sides, soft warm background.`
  - **proven** — `Square image (1:1): a rolled parchment scroll tied with a teal ribbon and closed with a large glowing amber wax seal stamped with a paw print, resting on a warm wooden table with soft violet light around the seal, the parchment completely blank with no writing of any kind, no people, no metal cup and no medal, the scroll centered with generous empty margin on all four sides, soft warm background.`
  - **shelf-header** — `Square image (1:1): a warm wooden shelf inside the magical veterinary clinic seen straight on, holding a row of small glowing keepsakes, a tiny paper lantern, a violet crystal, a ribboned scroll and a little potted sprout, a string of soft amber lights running along the front edge of the shelf, the same small teal baby dragon from this chat curled up asleep at one end of the shelf, violet and teal glow in the air around the objects, no signs and no labels of any kind, the shelf centered with generous empty margin above and below, soft warm background.`

  Each body maps to its trophy's meaning (T3): chapters = adventures read; days = showing up and growing; streak = an unbroken run; known = the word hoard; quizRight = hitting the mark; quizzer = turning up to practise; curious = investigating words; proven = the app guessed and she proved it. Every body forbids people, metal cups and medals (SK2-8), demands generous margin (the card crops), and asks for the app's violet/teal/amber palette.
  non-goals: do not open a browser; do not generate any image; do not write anything under the repo (not even a scratch file); do not edit `docs/visual-design.md` (step 2.5 records the prompts); do not translate anything into Hebrew — image prompts are English and the suffix forbids letters in the art; do not "improve" a body.
  tier: WORKER — mechanical file construction with a byte-exact gate.
  depends on: nothing (phase base = the phase-2 `$BASE` the orchestrator records before dispatch).

STEP 2.2: generate the nine masters in the one chat and place them
  goal: `assets/delight/trophies/` holds the nine PNG masters, each square, at least 1024 wide, and byte-distinct from every other asset in the repo — generated one at a time in the frozen chat from the step-2.1 prompt files. Not yet approved, not yet committed, no derivative.
  files: `assets/delight/trophies/<id>.png` ×9 — CREATE. Staging in `C:/Users/dkreinov/Downloads` and previews in `$HOME/trophies-art/preview/` (outside the repo). Nothing else.
  commands: **interactive — orchestrator + browser.** Per asset, in the frozen order `chapters, days, streak, known, quizRight, quizzer, curious, proven, shelf-header`:
    1. Open the ONE dedicated chat `https://chatgpt.com/c/6a632008-2d04-83ed-8557-370a2881a0dc` (never a new chat; never the paid API).
    2. Paste the whole of `$HOME/trophies-art/prompts/<id>.txt`. **Before sending, read the composer back and confirm it starts with `Square image (1:1):` and ends with `no frame or border.`** — the composer has been observed prepending stray em-dashes (delight-pass lesson 14).
    3. Wait for the single image. One generation at a time — the chat serializes.
    4. `ls "C:/Users/dkreinov/Downloads/trophy-<id>.png"` must be **absent**. Then capture with the blob method: fetch the image blob in-page and click **exactly one** synthetic `<a download="trophy-<id>.png">`. Do not re-click. Poll from the shell for the file.
    5. `mv "C:/Users/dkreinov/Downloads/trophy-<id>.png" assets/delight/trophies/<id>.png`.
    6. Run the frozen validation below; if it reports a duplicate or a wrong shape for this asset, delete it and regenerate (regenerate, never settle — design §6).
  After all nine: record the nine `TROPHY-ART-MD5 <id> <md5>` lines printed by the validation into `journal.md` (orchestrator record), and render 320px previews plus one 3×3 contact sheet into `$HOME/trophies-art/preview/` for the step-2.3 gate.
  validation:
```bash
# TAIL of the step single validation script, which BEGINS with §VAL-P2 verbatim in the SAME file (P2-AMENDMENT #1a -- a child bash cannot supply fail/$PORC/$RC to this tail)
node --input-type=module -e '
import sharp from "sharp";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
const IDS=["chapters","days","streak","known","quizRight","quizzer","curious","proven","shelf-header"];
const DIR="assets/delight/trophies";
const got=readdirSync(DIR).sort().join(",");
const want=IDS.map(x=>x+".png").sort().join(",");
if(got!==want) throw new Error("master set is ["+got+"], expected ["+want+"]");
const h=p=>createHash("md5").update(readFileSync(p)).digest("hex");
const seen=new Map();
for(const f of readdirSync("assets/delight")) if(f.endsWith(".png")) seen.set(h("assets/delight/"+f),"assets/delight/"+f);
seen.set(h("assets/design-tests/dragon-clinic-test.png"),"assets/design-tests/dragon-clinic-test.png");
const lines=[];
for(const id of IDS){
  const p=DIR+"/"+id+".png";
  const m=await sharp(p).metadata();
  if(m.format!=="png") throw new Error(p+" is "+m.format+", expected png");
  if(m.width!==m.height) throw new Error(p+" is not square: "+m.width+"x"+m.height);
  if(m.width<1024) throw new Error(p+" is only "+m.width+" wide, minimum 1024");
  const d=h(p);
  if(seen.has(d)) throw new Error(p+" is byte-identical to "+seen.get(d));
  seen.set(d,p);
  lines.push("TROPHY-ART-MD5 "+id+" "+d);
}
console.log(lines.join(String.fromCharCode(10)));
console.log("MASTERS-OK 9 square png, all >=1024, all byte-distinct");
' || fail "master gate failed"
EXPECT='?? assets/delight/trophies/chapters.png
?? assets/delight/trophies/curious.png
?? assets/delight/trophies/days.png
?? assets/delight/trophies/known.png
?? assets/delight/trophies/proven.png
?? assets/delight/trophies/quizRight.png
?? assets/delight/trophies/quizzer.png
?? assets/delight/trophies/shelf-header.png
?? assets/delight/trophies/streak.png'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```
  contracts: the nine filenames; the one chat URL; the blob-capture rule and the exactly-once click; `>= 1024` square PNG masters (the band2 app-icon precedent); md5-distinctness across the nine new masters, the nine existing `assets/delight/*.png` and the anchor `assets/design-tests/dragon-clinic-test.png` (the §7 duplicate-burst rule); the `TROPHY-ART-MD5` record line format.
  non-goals: no derivative and no touch of `public/` (step 2.4 owns that, and only after the gate); no owner gate here (step 2.3); no edit to `docs/`, `scripts/`, `tests/`, `lib/`, `api/`; do not run `scripts/optimize-assets.js` — it would rewrite the eight existing webps and break the digest; do not touch or regenerate any existing master; do not open a second chat; no paid-API generation; do not upscale, crop, retouch or convert a downloaded image by hand — if it is not square or under 1024, regenerate.
  tier: ORCHESTRATOR — browser-driven generation on the free web route is not dispatchable to a clean-context worker, and the capture rule is a one-shot manual action (band2 step 2.5 precedent).
  depends on: 2.1 (the prompt files must exist and have passed their byte gate).

STEP 2.3: the owner gate, GC-D8, bound to the bytes
  goal: For each of the nine assets the owner has looked at the image and recorded a verdict, and the file on disk is byte-identical to the image that verdict was given about. Nothing may be integrated before this passes.
  files: none in the repo. `journal.md` verdict lines are the orchestrator's record, written at this step's acceptance. Previews in `$HOME/trophies-art/preview/`.
  commands: **interactive — orchestrator + owner.** Show the owner the 3×3 contact sheet and the nine individual previews (also at the sizes the screen will use, 160px and 320px — T4 renders one card per trophy). For each id record exactly one line: `TROPHY-ART <id>: APPROVED` or `TROPHY-ART <id>: REJECTED - <reason>`. A REJECTED asset goes back to step 2.2 for regeneration in the same chat, and its new bytes get a **new** `TROPHY-ART-MD5` line and a **new** verdict line appended (last line wins). The step is not finished until the last verdict for all nine reads APPROVED.
  validation:
```bash
cd C:/Users/dkreinov/claude/english-app && set -o pipefail && node -e '
const fs=require("fs"),crypto=require("crypto");
const NL=String.fromCharCode(10);
const IDS=["chapters","days","streak","known","quizRight","quizzer","curious","proven","shelf-header"];
const J=fs.readFileSync(".oplan/word-trophies/journal.md","utf8").split(NL);
const verdict=new Map(), md5s=new Map();
for(const raw of J){
  const t=raw.trim();
  if(t.indexOf("TROPHY-ART-MD5 ")===0){
    const p=t.slice(15).split(" ").filter(Boolean);
    if(p.length===2) md5s.set(p[0],p[1]);
  } else if(t.indexOf("TROPHY-ART ")===0){
    const rest=t.slice(11); const i=rest.indexOf(": ");
    if(i>0) verdict.set(rest.slice(0,i),rest.slice(i+2));
  }
}
for(const id of IDS){
  const v=verdict.get(id);
  if(v===undefined) throw new Error("no owner verdict recorded for "+id);
  if(v.indexOf("APPROVED")!==0) throw new Error(id+": last verdict is not APPROVED -> "+v);
  const want=md5s.get(id);
  if(!want) throw new Error("no TROPHY-ART-MD5 line recorded for "+id);
  const got=crypto.createHash("md5").update(fs.readFileSync("assets/delight/trophies/"+id+".png")).digest("hex");
  if(got!==want) throw new Error(id+": the file on disk ("+got+") is not the approved image ("+want+")");
}
console.log("GATE-OK 9 assets owner-approved, on-disk bytes match the approved images");
' && echo STEP-2.3-OK
```
  contracts: GC-D8 is per asset and precedes integration (T6, `docs/visual-design.md` §8 DO-list); the verdict line format above; the last verdict for an id wins; the approval binds to an md5, not to a memory. On this step's acceptance the orchestrator commits the nine masters — message: `step 2.3: nine trophy masters (T6), owner-gated GC-D8 — assets/delight/trophies/, all square >=1024, md5-distinct`.
  non-goals: do not "self-serve" this gate — GC-D8 names the owner and the design signature (§8, T6 row) makes it an owner gate, unlike the sandbox UI audits the field guide self-serves (lesson 11); do not adjust a rejected image in an editor; do not proceed to 2.4 on anything less than nine APPROVED lines; do not touch any file.
  tier: ORCHESTRATOR — a human judgement with a recorded artifact.
  depends on: 2.2 (nine masters on disk, nine `TROPHY-ART-MD5` lines recorded).

STEP 2.4: the derivative script and the nine webps
  goal: A committed, deterministic `scripts/optimize-trophies.js` turns the nine approved masters into nine 640×640 webps under `public/assets/trophies/`, and nothing else under `public/` moves by a byte.
  files: `scripts/optimize-trophies.js` — CREATE (LF only). `public/assets/trophies/<id>.webp` ×9 — CREATE. Nothing else.
  commands: `node scripts/optimize-trophies.js`
  validation:
```bash
# TAIL of the step single validation script, which BEGINS with §VAL-P2 verbatim in the SAME file (P2-AMENDMENT #1a -- a child bash cannot supply fail/$PORC/$RC to this tail)
node scripts/optimize-trophies.js > /dev/null || fail "optimize-trophies.js exited non-zero"
H1="$(md5sum public/assets/trophies/*.webp | cut -d' ' -f1 | LC_ALL=C sort | tr '\n' ' ')"
node scripts/optimize-trophies.js > /dev/null || fail "second optimize-trophies.js run exited non-zero"
H2="$(md5sum public/assets/trophies/*.webp | cut -d' ' -f1 | LC_ALL=C sort | tr '\n' ' ')"
case "$H1" in "$H2") ;; *) fail "derivatives are not byte-reproducible: $H1 vs $H2";; esac
node --input-type=module -e '
import sharp from "sharp";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
const IDS=["chapters","days","streak","known","quizRight","quizzer","curious","proven","shelf-header"];
const DIR="public/assets/trophies";
const got=readdirSync(DIR).sort().join(",");
const want=IDS.map(x=>x+".webp").sort().join(",");
if(got!==want) throw new Error("derivative set is ["+got+"], expected ["+want+"]");
const h=p=>createHash("md5").update(readFileSync(p)).digest("hex");
const seen=new Map();
for(const f of readdirSync("public/assets")) if(f.endsWith(".webp")) seen.set(h("public/assets/"+f),"public/assets/"+f);
for(const id of IDS){
  const p=DIR+"/"+id+".webp";
  const m=await sharp(p).metadata();
  if(m.format!=="webp") throw new Error(p+" is "+m.format+", expected webp");
  if(m.width!==640||m.height!==640) throw new Error(p+" is "+m.width+"x"+m.height+", expected 640x640");
  const d=h(p);
  if(seen.has(d)) throw new Error(p+" is byte-identical to "+seen.get(d));
  seen.set(d,p);
}
console.log("DERIVATIVES-OK 9 webp, all 640x640, all byte-distinct, reproducible");
' || fail "derivative gate failed"
ENDS="$(node -e 'const fs=require("fs");const b=fs.readFileSync("scripts/optimize-trophies.js");let c=0,l=0;for(let i=0;i<b.length;i++){if(b[i]===10){if(i>0&&b[i-1]===13)c++;else l++;}}console.log("scripts/optimize-trophies.js CRLF="+c+" LF="+l);')"
echo "ENDINGS: $ENDS"
case "$ENDS" in *"CRLF=0 "*) ;; *) fail "scripts/optimize-trophies.js must be LF-only: $ENDS";; esac
EXPECT='?? public/assets/trophies/chapters.webp
?? public/assets/trophies/curious.webp
?? public/assets/trophies/days.webp
?? public/assets/trophies/known.webp
?? public/assets/trophies/proven.webp
?? public/assets/trophies/quizRight.webp
?? public/assets/trophies/quizzer.webp
?? public/assets/trophies/shelf-header.webp
?? public/assets/trophies/streak.webp
?? scripts/optimize-trophies.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```
  contracts: **the frozen source of `scripts/optimize-trophies.js` — write exactly this, LF endings, byte-preservingly (field-guide lesson 4):**
```js
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "..", "assets", "delight", "trophies");
const OUT = path.resolve(__dirname, "..", "public", "assets", "trophies");

// The 8 signed trophy ids (lib/profile.js TROPHY_CATALOG) plus the shelf header.
// Square masters in, square 640 derivatives out (design T6). NOT precached.
const NAMES = [
  "chapters",
  "days",
  "streak",
  "known",
  "quizRight",
  "quizzer",
  "curious",
  "proven",
  "shelf-header",
];
const WIDTH = 640;
const QUALITY = 72;

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const name of NAMES) {
    const src = path.join(SRC, name + ".png");
    const out = path.join(OUT, name + ".webp");
    await sharp(src)
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(out);
    console.log("wrote", out);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
```
  This mirrors `scripts/optimize-placement.js` line for line (the subdirectory precedent) and keeps the frozen recipe of `optimize-assets.js` (quality 72, effort 4, `withoutEnlargement`). Commit at acceptance — message: `step 2.4: trophy webp derivatives (T6) — scripts/optimize-trophies.js, nine 640x640 webps, public/ otherwise byte-frozen`.
  non-goals: do NOT run or edit `scripts/optimize-assets.js` (it would rewrite the eight existing webps and break the §VAL-P2 exclusion digest); do not add the trophies to its `WIDTHS`; do not add anything to `public/sw.js` `PRECACHE` and do not bump `CACHE` (SK2-3, T6: art is never precached); do not add an npm script; do not touch `tests/` (no test moves this phase, SK2-7); do not create a `.gitattributes`; do not hand-edit a webp; do not produce extra sizes, a sprite sheet, or per-tier variants (tiers are CSS, T4/T6).
  tier: WORKER — a 30-line script copied from an in-repo precedent, with a fully mechanical gate.
  depends on: 2.3 (GC-D8 APPROVED for all nine; masters committed).

STEP 2.5: record the prompts and the inventory in docs/visual-design.md
  goal: The doc that governs this app's art records what was made and exactly how, so the next run can reproduce or extend the set without asking anyone: nine inventory rows, nine verbatim prompts, and the one pipeline note about the new script.
  files: `docs/visual-design.md` — MODIFY (LF, additive only; the file is CRLF=0 / LF=317 today).
  commands: none — direct file edits.
  validation:
```bash
# TAIL of the step single validation script, which BEGINS with §VAL-P2 verbatim in the SAME file (P2-AMENDMENT #1a -- a child bash cannot supply fail/$PORC/$RC to this tail)
node -e '
const fs=require("fs"),path=require("path");
const NL=String.fromCharCode(10);
const norm=s=>s.split(NL).join(" ").split(" ").filter(Boolean).join(" ");
const doc=norm(fs.readFileSync("docs/visual-design.md","utf8"));
const IDS=["chapters","days","streak","known","quizRight","quizzer","curious","proven","shelf-header"];
const DIR=path.join(process.env.HOME,"trophies-art","prompts");
for(const id of IDS){
  const b=fs.readFileSync(path.join(DIR,id+".txt"));
  const body=norm(b.slice(0,b.length-389).toString("ascii"));
  let n=0,i=0;
  for(;;){const k=doc.indexOf(body,i);if(k<0)break;n++;i=k+1;}
  if(n!==1) throw new Error(id+": its prompt body appears "+n+" times in the doc, expected exactly 1");
  if(doc.indexOf("assets/delight/trophies/"+id+".png")<0) throw new Error(id+": no inventory row naming assets/delight/trophies/"+id+".png");
}
if(doc.indexOf("scripts/optimize-trophies.js")<0) throw new Error("no pipeline note naming scripts/optimize-trophies.js");
if(doc.indexOf("public/assets/trophies/")<0) throw new Error("the derivative path is not recorded");
console.log("DOC-OK 9 prompts recorded verbatim, 9 inventory rows, pipeline note present");
' || fail "doc gate failed"
DOCDEL="$(git diff --numstat HEAD -- docs/visual-design.md | awk '{s+=$2} END{print s+0}')"
case "$DOCDEL" in 0) ;; *) fail "docs/visual-design.md deleted $DOCDEL lines; the edit must be additive";; esac
DENDS="$(node -e 'const fs=require("fs");const b=fs.readFileSync("docs/visual-design.md");let c=0,l=0;for(let i=0;i<b.length;i++){if(b[i]===10){if(i>0&&b[i-1]===13)c++;else l++;}}console.log("docs/visual-design.md CRLF="+c+" LF="+l);')"
echo "ENDINGS: $DENDS"
case "$DENDS" in *"CRLF=0 "*) ;; *) fail "docs/visual-design.md gained CRLF: $DENDS";; esac
EXPECT=' M docs/visual-design.md'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```
  contracts: three additive edits, all appended inside existing sections, nothing existing rewritten (the doc is FROZEN; T6 authorises exactly this recording, and §6's own "Per-asset generation prompts" is the precedent format).
  - **Edit 1 — §6 Inventory**, immediately after the existing inventory table, a new sub-block headed `#### Trophies (word-trophies run, 2026-07-29)` with a nine-row table `| File (assets/delight/trophies/<name>.png) | Aspect | Dimensions | Used for |`, in the frozen order `chapters, days, streak, known, quizRight, quizzer, curious, proven, shelf-header`, Aspect = `square` for all nine, **Dimensions read from the files with sharp, not guessed**, "Used for" = `trophy card: <id>` for the eight and `trophies screen header` for `shelf-header`. Add one sentence: masters for this set live in the `trophies/` subdirectory of `assets/delight/`; derivatives are `public/assets/trophies/<id>.webp` at 640×640; the eight stems are the signed `TROPHY_CATALOG` ids in `lib/profile.js` and must not be renamed.
  - **Edit 2 — §6 Per-asset generation prompts**, appended after the `app-icon` entry: `#### Trophy prompts (word-trophies run, 2026-07-29)` and the nine bullets `- **<id>**: "<body>" + SUFFIX`, each body **copied from `$HOME/trophies-art/prompts/<id>.txt`** (the bytes actually sent), wrapped for readability but otherwise unaltered. One sentence: each prompt was sent with the FROZEN STYLE SUFFIX appended verbatim, extracted from this document by script and verified by md5 `51b97a774dc52aa272850bb686c22188`.
  - **Edit 3 — §7 Generation pipeline**, one appended bullet: trophy derivatives are produced by `scripts/optimize-trophies.js` (sharp, width 640, quality 72, effort 4) from `assets/delight/trophies/` into `public/assets/trophies/`; `scripts/optimize-assets.js` must NOT be re-run, because it rewrites all eight existing `public/assets/*.webp`; trophy art is NOT in `PRECACHE` (design §2(iv): artwork is runtime-fetched and never cached).
  Commit at acceptance — message: `step 2.5: record the nine trophy prompts, inventory and derivative pipeline in docs/visual-design.md (T6)`.
  non-goals: **do not touch §3** — the stale warm-dark palette table is T10's job and T10 belongs to phase 3 (SK2-6); do not touch the FROZEN STYLE SUFFIX text, §1, §2, §4, §5 or §8; do not delete or rewrite one existing line (deletions budget 0); do not add Hebrew; do not edit `README.md`, `design.md` or `.oplan/`; do not add a `CACHE`/`PRECACHE` claim.
  tier: WORKER — a bounded additive edit with an exact-match gate.
  depends on: 2.4 (the derivatives exist, so the pipeline note is true) and 2.1 (the prompt files are the source the gate diffs against — they must still be on disk).

STEP 2.6: phase close
  goal: Every phase acceptance criterion re-run on the committed tree; the new `public/` digest re-pinned; the record written for phase 3.
  files: `.oplan/word-trophies/journal.md` — APPEND. `.oplan/word-trophies/phase-state.md` — REWRITE (orchestrator record; not an executor write set).
  commands: §VAL-P2 plus the close block below; then the records commit.
  validation:
```bash
# TAIL of the step single validation script, which BEGINS with §VAL-P2 verbatim in the SAME file (P2-AMENDMENT #1a -- a child bash cannot supply fail/$PORC/$RC to this tail)
BASE=PHASE2_BASE_HASH   # P2-AMENDMENT #1c: substituted by the orchestrator from the go-ahead record before running
# 1. the full public/ digest: count pinned, md5 RECORDED as the new frozen expectation
PUBFULL="$(node -e 'const fs=require("fs"),path=require("path"),crypto=require("crypto");const out=[];(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);const s=fs.statSync(f);if(s.isDirectory())walk(f);else out.push(f.split(path.sep).join("/")+" "+crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex"));}})("public");console.log(out.length+" "+crypto.createHash("md5").update(out.join(String.fromCharCode(10))).digest("hex"));')"
echo "NEW PUBLIC PIN: $PUBFULL"
case "$PUBFULL" in "2371 "*) ;; *) fail "public/ file count is not 2362+9: $PUBFULL";; esac
# 2. binaries survived autocrlf: worktree bytes == committed blob bytes
node -e '
const { execFileSync }=require("child_process");
const fs=require("fs"),crypto=require("crypto");
const IDS=["chapters","days","streak","known","quizRight","quizzer","curious","proven","shelf-header"];
const paths=IDS.map(i=>"assets/delight/trophies/"+i+".png").concat(IDS.map(i=>"public/assets/trophies/"+i+".webp"));
for(const p of paths){
  const disk=crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");
  const blob=crypto.createHash("md5").update(execFileSync("git",["cat-file","blob","HEAD:"+p],{maxBuffer:1<<28})).digest("hex");
  if(disk!==blob) throw new Error(p+": worktree "+disk+" != blob "+blob+" (autocrlf mangled a binary)");
}
console.log("BINARY-OK 18 files, worktree bytes == committed blob bytes");
' || fail "binary integrity gate failed"
# 3. nothing deleted, nothing left uncommitted
GONE="$(git diff --diff-filter=D --name-only "$BASE")"
case "$GONE" in "") ;; *) fail "files were deleted: $GONE";; esac
case "$PORC" in "") ;; *) fail "tree not clean at the close:
$PORC";; esac
exit $RC
```
  contracts: the record must state, for phase 3 and 4 to consume — the nine filenames and that the eight stems are the `TROPHY_CATALOG` ids exactly (camelCase `quizRight`); the derivative path `/assets/trophies/<id>.webp`, 640×640, **runtime-fetched, NOT precached**; **the new full `public/` pin `2371 <md5>` replaces `2362 74e736…`, and the exclusion pin `2362 74e736d7d83b22a24945eae87cb9fe33` remains valid forever as "public/ outside the trophies directory"**; that `CACHE` is still `magic-vet-v17` and **phase 3's v17→v18 bump is now mandatory and also covers this phase's `public/` addition** (SK2-3); that ledger 323 flat / 328 reported and contrast 52 did not move, so phase 3 starts from the same numbers phase 1 left; that **T10 is unassigned by §5 and is handed to phase 3** (SK2-6); that **no asset test exists yet and phase 3 must add one** when the view references the files (SK2-7); that the shelf-header is square and T4 never placed it, so phase 3 must decide its framing in CSS (SK2-2, RECORD GAP 1); that no D25 capture exists and none was made; and the nine `TROPHY-ART <id>: APPROVED` verdicts with their md5s. Commit message: `oplan: word-trophies PHASE 2 CLOSED — nine owner-gated trophy assets, masters + 640 webps, public/ re-pinned 2371, CACHE untouched at v17`.
  non-goals: no deploy, no capture, no `CACHE` bump, no code change, no test change, no `public/` change beyond what 2.4 committed.
  tier: ORCHESTRATOR — it re-runs the frozen gates in a clean state and writes the run record.
  depends on: 2.1-2.5 all accepted.

RISKS

1. **Style drift across nine images** (design §6's own named risk). Nothing mechanical can see it. Noticed by: the GC-D8 gate on a 3×3 contact sheet, where drift is obvious side by side; mitigated by one chat, one generation at a time, the suffix verbatim, and objects-not-characters (SK2-8). Regenerate, never settle.
2. **A duplicate or stale capture** — the 89-duplicate burst was exactly this. Would pass any per-file format check. Noticed by: md5-distinctness across the nine new masters, the nine existing masters and the anchor (step 2.2), repeated over the derivatives (step 2.4) — and by the pre-click absence check on `trophy-<id>.png`.
3. **Approval drifting off the bytes** — an image approved, then regenerated, then integrated. Noticed by: step 2.3 comparing on-disk md5 against the recorded `TROPHY-ART-MD5` line; a regeneration that forgets to re-record fails the gate loudly.
4. **`scripts/optimize-assets.js` run "helpfully"** — it would silently rewrite all eight existing webps, possibly with different bytes from a different sharp build. Noticed by: the §VAL-P2 exclusion digest, which covers every existing `public/assets/*.webp`. Declared a non-goal in steps 2.2 and 2.4.
5. **autocrlf mangling a binary.** Measured today as not happening (`heroine.png`/`.webp` disk == blob), but the trap is invisible to `git diff` (lesson 4). Noticed by: the close-step blob-identity check over all 18 binaries.
6. **A prompt reaching the composer altered** — em-dash injection (lesson 14), or an escape collapsing in a JSON packet (lesson 8, this run's own false-positive costume). Mitigated structurally: the bodies are pure ASCII, the only non-ASCII text (the suffix's em-dash) is never retyped but extracted from the doc and md5-verified, and the composer is read back before every send.
7. **The frozen chat is gone or the free route refuses to generate.** Not testable from files. This is a STOP, not an adaptation — a new chat breaks the style-consistency rule that the whole asset library rests on (`docs/visual-design.md` §7, lesson 11). Escalate to the owner.
8. **The webp derivatives are not byte-reproducible** across a future sharp upgrade, so a later re-run would move the `public/` digest. Noticed by: the run-twice determinism check now, and the fact that no future phase has any reason to re-run the script. Recorded, not engineered around.
9. **Someone reads the `public/` exclusion digest as a licence to move other files under `public/`.** Noticed by: the digest itself — it covers everything except the nine new webps, and its expected value is the phase-1 pin unchanged.

BLOCKERS

**None.** Everything an executor needs is frozen above: the nine filenames, the nine full prompt bodies, the suffix's exact bytes and md5, the chat URL, the capture method, the master and derivative gates with their thresholds, the complete source of the new script, the doc edits, the per-step write sets and porcelain expectations, the CACHE decision with its fallback, and the digest mechanism. The two places where the record was silent — the shelf-header's filename/aspect and the `CACHE` question — are decided in SKELETON CHANGES with the citations, not guessed.

RECORD GAPS

1. **T4 never places the shelf-header.** T6 mandates a ninth "shelf-header" image; T4 describes the screen as "one card per trophy" and mentions no header. So the header's role, position and framing are unspecified by the signed design. Worked around: this phase produces it square (literal T6) and hands phase 3 the framing decision (CSS `object-fit`, not a regeneration). **Phase 3 must rule.**
2. **T6 cites `docs/visual-design.md:190-195` for the FROZEN STYLE SUFFIX; the suffix is actually at lines 201-205** — the doc grew by the background-composition amendment after the design was written. Worked around by extracting via the `### FROZEN STYLE SUFFIX` heading and pinning the md5, so line drift can never silently deliver the wrong text.
3. **QZ-22's scope is stated two ways, and this phase is the first to sit in the gap.** word-g1's signed §10 and this run's frozen-contract line say *any* `public/` change ships a bump; field-guide lesson 7 and design §2(iv)/T6 say precached files only, and art is never precached; this run's T4 explicitly assigns the single v18 bump to phase 3. Decided in SK2-3 (no bump here; phase 3's v18 covers both; no deploy before phase 4). One line for the orchestrator or owner to overrule, with the exact fallback written into SK2-3.
4. **Design §5 assigns no phase to T10** (the `docs/visual-design.md` §3 palette truth-fix). Decided in SK2-6: phase 3, where the palette is worked. Recorded in the close so it cannot be lost.
5. **Design §5 says phase 2 is "No code", and T6 says the derivatives come through `scripts/optimize-assets.js`** — both are false as written: that script structurally cannot write to a subdirectory, and re-running it would rewrite eight frozen files. Resolved in SK2-1 with the in-repo `optimize-placement.js` precedent. Recorded as an amendment, not silently fixed.
6. **The record does not say how the owner reviews images** (GC-D8 says only "the owner approves every asset before integration"; the band2 precedent recorded a verdict line with no procedure). Frozen here as a contact sheet plus per-size previews, with the verdict bound to an md5. Note the tension with the standing self-serve-visual-audit habit: that habit is about auditing the *UI in the sandbox browser*, whereas GC-D8 is a signed **owner** gate on art (design §8, T6 row) — the record wins and the owner looks.
7. **No test anywhere asserts that a referenced asset exists under `public/assets/`** (`item-review.test.js` only checks assets referenced by a docs page). Nothing mechanical would notice if a trophy webp were deleted. Deliberately left to phase 3, which introduces the references and can move the ledger once (SK2-7) — flagged so it is not forgotten.
8. **`.oplan/word-trophies/STATUS.md` and `briefing.md` are named in `phase-state.md` but were not consulted** — `phase-state.md`, `plan.md`, `journal.md`, `design.md` and the field guide carried every fact this plan needed. If either holds an owner instruction about phase 2, it has not been folded in.

PLAIN PLAN: for the human, no jargon — one line per step:
  2.1 Write the nine picture requests into nine small text files, each one ending with the app's official "house style" paragraph copied straight out of the design document rather than typed again — because the style paragraph is what keeps all the app's pictures looking like one family, and a single retyped word would quietly break that.
  2.2 In the one ChatGPT chat that has drawn every picture in this app, make the nine images one at a time and save them into the project — because using the same chat is the only thing that keeps the new trophies looking like they came from the same world as the storybook pictures; a check then confirms each one is square, large enough, and genuinely a new image rather than an accidental copy of another.
  2.3 Show you all nine, and record your yes or no for each one, tied to the exact file — because you approve every new picture before it goes into the app, and tying the approval to the file means the picture you approved is provably the picture that ships.
  2.4 Add a tiny build script that shrinks the nine approved pictures into small fast web versions, and run it — because the phone should download a small image, and a script (rather than hand work) means anyone can rebuild them later and get identical files.
  2.5 Write the nine requests and the new picture list into the app's visual design document — because the next person, months from now, should be able to make a tenth trophy that matches without asking anyone what was done.
  2.6 Re-run every check on the finished result and write down what changed, including the new "nothing in the public folder moved" fingerprint — because the next phase starts from these notes, not from anyone's memory.
  DONE WHEN: nine trophy pictures you approved are in the project as full-size originals and as small web versions, all nine provably different from each other and from every picture already in the app; the app itself is untouched — same 328 tests passing, same colour check, same service worker, and not one other byte anywhere in the shipped folder has moved.

# WORD-TROPHIES — PHASE 3 IN FULL (planned 2026-07-30 by a fresh planner — Opus, read-only of
# the repository; every number below was measured on disk TODAY, tree clean at `2ee5ca6`.
# ORCHESTRATOR NOTE: the tree is now `86ae76e`; the only intervening commit corrected
# .oplan/word-trophies/phase-state.md (field-guide line count + the lesson-4 endings flag),
# so no measurement below is stale -- verified by diffing the two commits.)

## WHAT THIS PLANNER MEASURED (nothing here is quoted from the record without re-measurement)

Run today, 2026-07-30, against the clean worktree at `2ee5ca6` (`git status --porcelain -uall`
= 0 lines):

| measured | command / method | result |
|---|---|---|
| suite, plain | `npm test` | `# tests 328`, `# fail 0`, plan `1..323` |
| flat ledger | `grep -h -c '^test(' tests/*.js \| awk '{s+=$1} END{print s+0}'` | **323** |
| contrast anchor | `node scripts/check-contrast.mjs \| grep -c '^PASS'` | **52** (PAIRS = `scripts/check-contrast.mjs:9-60`, 52 entries) |
| `public/` full digest | the frozen walker (see §VAL-P3) | **`2371 644f333395566079ef6d0441438c7a4a`** — identical to the phase-2 close pin |
| `public/sw.js` md5 | `md5sum` | `f16579d50af8b49a04e45a80975c6acf`, `CACHE = "magic-vet-v17"` at `sw.js:1` |
| `public/quiz.js` md5 | `md5sum` | `69b6d71117cf776715374abc6f0abb02` (QZ-18 frozen file) |
| `public/quiz-core.js` md5 | `md5sum` | `9a2131be8b9d1b77c219f1e8c3482a71` (frozen file) |
| both transcripts | `quiz-transcript.mjs`, `g1-transcript.mjs` diffed against their expected files | both **EMPTY** |
| `.data/profile.json` | `test -e` | **absent** |
| the nine trophy webps | `ls public/assets/trophies/` | all nine present (`chapters days known proven quizRight quizzer shelf-header streak curious`) |
| `TROPHY_CATALOG` | imported from `lib/profile.js` and printed | 8 ids, thresholds exactly as design T3 — `chapters 5/15/40 · days 3/10/30 · streak 2/4/7 · known 5/15/30 · quizRight 10/40/100 · quizzer 20/60/150 · curious 25/75/200 · proven 1/5/15`; `TROPHY_TIERS = ["bronze","silver","gold"]` |
| `api/chapter.js` response | read `api/chapter.js:66` | `sendJson(res, 200, { ok: true, data: { chapter: r.chapter } });` — **NO profile** (phase-1 RECORD GAP 1 CONFIRMED) |
| `public/` cannot import `lib/` | `grep -rn "\.\./lib\|/lib/" public/` | **zero hits** |
| the three tier hexes | a byte-copy of `check-contrast.mjs` + `styles.css` run OUTSIDE the repo with the six new pairs | exit 0, **58 PASS lines**, ratios recorded in SK3-5 |
| line endings of every file phase 3 touches | an `rb` byte counter (never `grep`/`file`/`git diff`) | the table in **SK3-1** — the field guide is WRONG about `sw.js` |

Nothing in the repository was changed by this planning pass. The contrast simulation ran in
`C:/Users/dkreinov/AppData/Local/Temp/claude/.../scratchpad/probe/`, on copies, never in the tree.

**No raw Hebrew glyph appears anywhere in this plan.** Every Hebrew string phase 3 needs is
named by its SOURCE FILE and its `\u` codepoints plus a decimal codepoint sum, and is
EXTRACTED by script at execution time (field-guide lesson 8; an agent packet is JSON and a
`\uXXXX` decodes in transit, so the decimal sums are the transport-proof evidence).

---

# PHASE 3: the screen

**GOAL:** Build the trophies screen and its earn-moment celebration, and nothing else. A new
route `/trophies` in `public/app.js`'s `ROUTES` map; a new `public/views/trophies.js` exporting
`render(container, ctx)`; a fourth nav tab in `public/index.html` in DOM order AFTER the words
tab; one card per trophy (artwork, name, a tier-coloured ring, a plain-text progress line);
locked trophies are the SAME artwork dimmed by CSS; three new `:root` tier tokens with six new
contrast pairs moving the anchor 52 → 58; a one-overlay celebration hooked at the three
moments the signed design names; `PRECACHE += "/views/trophies.js"` and `CACHE magic-vet-v17 →
magic-vet-v18`; the SK2-7 asset test; and T10's dated additive correction to
`docs/visual-design.md`. **No deploy, no D25 capture, no touch of her live profile, no server
change of any kind** (`lib/`, `api/`, `data/` are untouched all phase).

---

## ACCEPTANCE CRITERIA (mechanical — all re-run at the phase close, step 3.7)

1. `npm test` exits 0 and prints `# tests 346`, `# fail 0`, and a top-level plan of `1..341`.
2. `APP_CODE=dummy npm test` exits 0 and prints the identical `# tests 346` / `# fail 0`.
3. Flat ledger: `grep -h -c '^test(' tests/*.js | awk '{s+=$1} END{print s+0}'` = **341**
   (323 measured today + 18 new). 341 flat + 5 subtests in `tests/dev-server.test.js` = 346
   reported. **The 5 subtests are measured, not assumed: 328 − 323 = 5 today.**
4. `node scripts/check-contrast.mjs` exits 0 and `grep -c '^PASS'` over its output = **58**
   (the moved anchor; 52 + 6 tier-ring pairs). It also prints `ALL PASS`.
5. `public/` full recursive digest counts exactly **2372** files (2371 measured today + the one
   new shipped file `public/views/trophies.js`). Its md5 necessarily moves; the close records
   the new pin. **No other path under `public/` is created or deleted.**
6. `node .oplan/word-quiz/quiz-transcript.mjs` diffed against
   `.oplan/word-quiz/quiz-transcript-expected.txt` is EMPTY.
7. `node .oplan/word-g1/g1-transcript.mjs` diffed against
   `.oplan/word-g1/g1-transcript-expected.txt` is EMPTY.
8. `.data/profile.json` is absent (`test -e` false).
9. Write set vs the phase base is exactly these **15** paths and nothing else:
   ```
    M README.md
    M docs/visual-design.md
    M public/app.js
    M public/index.html
    M public/styles.css
    M public/sw.js
    M public/views/reader.js
    M public/views/words.js
    M scripts/check-contrast.mjs
    M tests/quiz-ui.test.js
    M tests/reader-ui.test.js
    M tests/shell.test.js
    M tests/words-ui.test.js
   ?? public/views/trophies.js
   ?? tests/trophies-ui.test.js
   ```
   (2 created + 13 modified = 15. `.oplan/` is the orchestrator record and is filtered out of
   every executor write set.)
10. **Zero files deleted** (`git diff --diff-filter=D --name-only <BASE>` empty) and the total
    deleted-line budget across the whole phase is exactly **8**, distributed as:
    `tests/quiz-ui.test.js` 1 · `tests/reader-ui.test.js` 1 · `tests/words-ui.test.js` 1 ·
    `README.md` 1 · `public/sw.js` 1 · `tests/shell.test.js` 1 · `public/views/words.js` 1 ·
    `public/views/reader.js` 1. **Arithmetic check: 1+1+1+1+1+1+1+1 = 8, and the per-step
    budgets below are 4 (step 3.1) + 0 (3.2) + 2 (3.3) + 2 (3.4) + 0 (3.5) = 8.** Every other
    touched file has a deletion budget of **0**, including `docs/visual-design.md`
    (SK3-9 makes every doc correction additive) and `public/styles.css`.
11. Line endings unchanged in KIND for every touched file, byte-counted with an `rb` counter,
    never `grep`/`file`/`git diff`. The kinds are the SK3-1 table. Exact post-edit line counts
    are deliberately NOT pinned for edited files (phase 1's AMENDMENT #1 was caused by pinning
    a post-edit line count the planner could not compute); exact counts ARE pinned for the two
    frozen files that must not move at all (`public/quiz.js` CRLF=346 LF=0,
    `public/quiz-core.js` CRLF=99 LF=0).
12. `tests/trophies-ui.test.js` contains no raw non-ASCII byte (every Hebrew codepoint is a
    `\u` escape) and no `describe(` / nested `test(` — flat top-level `test()` only.
13. `public/quiz.js` md5 is still `69b6d71117cf776715374abc6f0abb02` and
    `public/quiz-core.js` md5 is still `9a2131be8b9d1b77c219f1e8c3482a71` — the QZ-18 frozen
    files are byte-untouched by the whole phase.
14. `lib/`, `api/` and `data/` are byte-untouched: `git diff --name-only <BASE> -- lib api data`
    is empty. `awardTrophies(` still appears exactly once in `api/profile.js`, once in
    `api/chapter.js`, and **zero** times anywhere under `public/` (T2: "Never client-side").
15. `public/sw.js` contains `magic-vet-v18` and does NOT contain `magic-vet-v17`; its
    `PRECACHE` array is exactly the 14 measured entries plus `"/views/trophies.js"` appended
    immediately AFTER `"/views/words.js"` (15 entries), and **no trophy artwork path appears in
    `PRECACHE`** (design §2(iv)/T6: artwork is runtime-fetched and never cached).
16. `/placement` is still tab-less and `/parent` is still invisible:
    `tests/parent-access.test.js` and `tests/parent-ui.test.js` pass unmodified, and
    `public/index.html` contains exactly **4** occurrences of `class="nav-tab"` (3 measured
    today + 1).

---

## DEPENDS ON (every row verified on disk today, tree clean at `2ee5ca6`)

| thing | file:line | verified |
|---|---|---|
| signed design T4/T5/T7/T9/T10 | `.oplan/word-trophies/design.md:104-123`, `:137-143`, `:153-165` | read in full |
| the eight carried obligations | `.oplan/word-trophies/phase-state.md:36-62` | read in full |
| phase 1 + phase 2 plan SHAPE (this plan matches it) | `.oplan/word-trophies/plan.md:39-782` and `:784-1322` | read in full |
| PHASE 1 CLOSED / PHASE 2 CLOSED records | `.oplan/word-trophies/journal.md:262-309`, `:605-664` | read |
| field guide, all 13 lessons | `.oplan/word-trophies/field-guide/index.md` (`wc -l` = **73** today; `phase-state.md:9` says 66 — that pin is stale, a record nit, not a blocker) | read |
| frozen contracts still in force | `.oplan/word-g1/phase-state.md:34-42` | read |
| `ROUTES` map, `OWNER_ROUTE`, `setActiveTab` | `public/app.js:1-21`, `:13`, `:23-33` | read |
| the three nav tabs, DOM order, SVG shape | `public/index.html:25-77` (reader `:26-47`, home `:49-68`, words `:70-76`) | read |
| `CACHE` + `PRECACHE` | `public/sw.js:1`, `:2-17` (14 entries, `"/views/words.js"` at `:14`) | read |
| the `CACHE` string pin and the `PRECACHE` deepStrictEqual pin | `tests/shell.test.js:58` and `:64-79` | read |
| `:root` token block | `public/styles.css:1-24` (`--transition-fast` last, at `:23`) | read |
| the contrast PAIRS array | `scripts/check-contrast.mjs:8-61` — 52 pairs, `--color-border`/`--color-bg-glow-amber` last at `:60` | read and counted |
| the entry-code CSS marker and its forbidden strings | `tests/entry-code.test.js:30-43` — from `/* ---------- Entry code gate ---------- */` (`public/styles.css:408`) onward, `#`, `background-image`, `color-mix` are all forbidden | read |
| the `background-image` first-match regex | `tests/background.test.js:21-31` — `css.match(/background-image:\s*([^;]*);/)` takes the FIRST occurrence, which is `public/styles.css:39` | read |
| the three contrast-anchor test pins | `tests/quiz-ui.test.js:501`, `tests/reader-ui.test.js:105`, `tests/words-ui.test.js:161` | read |
| the two contrast-anchor prose pins | `docs/visual-design.md:135`, `README.md:45` | read |
| `chapterQuizState` deepStrictEqual-pinned as exactly `{ started, done }` | `tests/reader-ui.test.js:189-202`, the `deepStrictEqual` at `:192-196`; the object literal is `public/views/reader.js:304` | read |
| `renderQuizDone` and its two frozen text nodes (QZ-18) | `public/quiz.js:202-207` | read |
| the no-questions path fires `onDone({right:0,total:0})` with NO done screen | `public/quiz.js:247-250` | read |
| the real done path renders then calls back | `public/quiz.js:334-339` (`renderQuizDone` at `:336`, `onDone` at `:337`) | read |
| words' quiz `onDone` hook | `public/views/words.js:243-252`, the callback at `:249` (`onDone: () => boot(),`) | read |
| words' `boot()` already re-GETs the profile | `public/views/words.js:255-278`, `getJson("/api/profile")` at `:258` | read |
| reader's quiz `onDone` hook | `public/views/reader.js:728-745`, the callback at `:739-742` | read |
| reader's chapter-done stage (`runGenerate`) | `public/views/reader.js:373-388`, the POST at `:378`, `stage = "chapter"; draw();` at `:381-382` | read |
| `postJson` returns `payload.data`, i.e. the whole profile for POST `/api/profile` | `public/api.js:68-119` (`return payload.data` at `:81`) | read |
| `document.body.appendChild(overlay)` overlay precedent + `try/catch` localStorage precedent | `public/api.js:44`, `:3-9`, `:54-58` | read |
| the `.entry-gate` fixed-overlay CSS precedent (`z-index: 100`) | `public/styles.css:410-419` | read |
| the `prefers-reduced-motion` precedent | `public/views/reader.js:110` | read |
| the per-view `VIEW_STYLE` template-literal precedent | `public/views/words.js:7-87`, `public/views/reader.js:9-244`, `public/quiz.js:5` | read |
| the `.hero-banner` class (`width:100%; aspect-ratio: 3/2; object-fit: cover` + fade mask) and its in-view usage | `public/styles.css:372-387`; `public/views/home.js:54` | read |
| the `.spot-image` square class | `public/styles.css:389-406` | read |
| tests may import a `public/views/*.js` module directly | `tests/reader-ui.test.js:7`, `tests/words-ui.test.js:10` | read |
| the `node --check` sweep auto-covers any new `public/**/*.js` | `tests/shell.test.js:33-54` | read |
| `item-review.test.js` only checks assets referenced by `docs/item-bank-review.html` — it cannot see `public/assets/trophies/` | `tests/item-review.test.js:53-60` | read |
| nothing pins the tab list | grep of `tests/` for `nav-tab` / `data-route` / `bottom-nav`: only `tests/parent-access.test.js:34-40` (absence of `/parent`) and `tests/parent-ui.test.js:74-82` | grepped |
| `tests/parent-ui.test.js:80` forbids `from "./views/parent.js"` in `app.js` — not `trophies.js` | `tests/parent-ui.test.js:80` | read |
| the eight ids and thresholds the view must mirror | `lib/profile.js` `TROPHY_CATALOG` (imported and printed today) | imported |
| the nine derivatives | `public/assets/trophies/*.webp` — nine files, sizes 16124–39078 bytes | listed |
| the dev server for the self-served visual gate | `scripts/dev-server.js`, `npm run dev`, `.webp` in `MIME_TYPES` at `:19` | read |

**Baseline measured, not trusted:** tree clean at `2ee5ca6`; `npm test` → 328 reported / 0 fail
/ plan `1..323`; flat 323; contrast 52; `public/` `2371 644f333395566079ef6d0441438c7a4a`;
`sw.js` md5 `f16579d50af8b49a04e45a80975c6acf`; both transcripts EMPTY; no `.data/profile.json`.

Nothing in phase 3 is already done: `public/views/trophies.js` and `tests/trophies-ui.test.js`
do not exist; `styles.css` has no `--color-bronze`/`--color-silver`/`--color-gold`;
`check-contrast.mjs` has 52 pairs; `sw.js` is at v17.

---

## SKELETON CHANGES (where reality differs from the record — each quotes its sources and rules)

### SK3-1 — THE FIELD GUIDE IS WRONG ABOUT `sw.js`, AND ABOUT MOST OF `public/`

Field-guide lesson 4 states:

> "`quiz-core.js`/`quiz.js`/`views/words.js`/`views/reader.js` are CRLF, `sw.js` LF"

**Measured today with an `rb` byte counter (never `grep`, never `file`, never `git diff`):**

| file | CRLF | bare LF | verdict |
|---|---|---|---|
| `public/sw.js` | **50** | **0** | **CRLF — the field guide says LF. The guide is WRONG.** |
| `public/styles.css` | **501** | 0 | CRLF (the guide never says) |
| `public/index.html` | **81** | 0 | CRLF (the guide never says) |
| `public/views/words.js` | 281 | 0 | CRLF — guide correct |
| `public/views/reader.js` | 749 | 0 | CRLF — guide correct |
| `public/quiz.js` | 346 | 0 | CRLF — guide correct (frozen, not touched) |
| `public/quiz-core.js` | 99 | 0 | CRLF — guide correct (frozen, not touched) |
| `public/app.js` | 0 | **65** | **LF** |
| `public/views/home.js` | 0 | 93 | LF (the new view's precedent) |
| `scripts/check-contrast.mjs` | 0 | 184 | LF |
| `tests/shell.test.js` | 0 | 94 | LF |
| `tests/reader-ui.test.js` | 0 | 224 | LF |
| `tests/quiz-ui.test.js` | 0 | 584 | LF |
| `tests/words-ui.test.js` | 0 | 272 | LF |
| `tests/trophies.test.js` | 0 | 586 | LF |
| `docs/visual-design.md` | 0 | 403 | LF |
| `README.md` | 0 | 108 | LF |
| `api/chapter.js` | 67 | 0 | CRLF (not touched this phase) |
| `api/profile.js` | 0 | 146 | LF (not touched this phase) |
| `lib/profile.js` | 0 | 719 | LF (not touched this phase) |

The prior (lost) planning pass claimed the same thing about `sw.js`, `styles.css` and
`index.html`. **My measurement agrees, and it is my measurement that this plan stands on.** The
likely mechanism is exactly what lesson 4 already warns about — `core.autocrlf=true` means the
*blob* is LF and the *worktree* is CRLF, and the guide recorded the blob.

**Frozen ruling.** Of the seven code/markup files phase 3 edits, **four are CRLF**
(`public/sw.js`, `public/styles.css`, `public/index.html`, `public/views/words.js`,
`public/views/reader.js` — five, in fact) and the rest are LF. Every step below states its
files' endings explicitly and every step's validation byte-counts them. **`public/sw.js` must
be edited CRLF-preservingly.** A phase that trusted the guide here would have normalised the
service worker to LF, `git diff` would have shown nothing, and phase 4's md5 deploy proof would
have become a whole-file hunt — the exact failure lesson 4 describes.

**Recommend at the close:** amend field-guide lesson 4 to say *"measure, never remember: on this
worktree `sw.js`, `styles.css` and `index.html` are CRLF; `app.js`, `home.js`, everything under
`scripts/`, `tests/`, `docs/` and `lib/` is LF"*. Logged in RECORD GAPS.

### SK3-2 — THE CELEBRATION'S SOURCE: the phone re-reads `/api/profile`; the server does not change

Design T5 (`design.md:116-118`) says the celebration fires

> "When a POST /api/profile response (or chapter generation response) returns a profile whose
> trophies map contains a tier timestamp the phone has not yet celebrated"

**Measured: `api/chapter.js:66` is `sendJson(res, 200, { ok: true, data: { chapter: r.chapter } });`.
There is no profile in that response.** (Phase-1 RECORD GAP 1, CONFIRMED today by reading the
file, not the record.) `public/views/reader.js:378` destructures exactly `const { chapter } = …`.

Two candidate rulings were weighed:

* **(a) widen the chapter response to carry the profile.** Rejected: it edits `api/chapter.js`,
  which drags `tests/api-chapter.test.js` into a screen phase, changes a response envelope on a
  route the child's phone hits during a paid OpenAI call, and phase 3's whole point is that
  `lib/` and `api/` do not move (acceptance criterion 14). It is also a server change in a phase
  the design calls "the screen".
* **(b) the phone reads the profile it already has, or asks for it once.** CHOSEN.

**FROZEN: `maybeCelebrateTrophy(profile)` is called at exactly the three moments design T5 names,
from the two views only, and never from `quiz.js`, `quiz-core.js` or `renderQuizDone`:**

1. `public/views/words.js` — the quiz `onDone` callback (`words.js:249`). `boot()` already
   performs `getJson("/api/profile")` at `words.js:258`, so the freshly-assigned module-scope
   `profile` IS the post-award profile. **No extra request.**
2. `public/views/reader.js` — the quiz `onDone` callback (`reader.js:739-742`). Reader has no
   fresh profile there, so it performs ONE `getJson("/api/profile")` into a **local** variable.
3. `public/views/reader.js` — the chapter-done stage, inside `runGenerate` after
   `stage = "chapter"; draw();` (`reader.js:381-382`). Same ONE local `getJson`.

**Why the extra GET is safe (lesson 3 says `GET /api/profile` CREATES a profile — "a read that
writes").** At all three moments a profile provably already exists on the server: hook 1 and 2
run after `quiz.js:303` has POSTed at least one `quiz-answer` (which saves), and hook 3 runs
after `api/chapter.js:64` has saved. Both views ALREADY issue this exact GET on every boot
(`words.js:258`, `reader.js:335`), so this adds no new class of request and no new write path.
The lesson-3 hazard is about an *orchestrator or a test* probing the live profile — that is
forbidden and this plan never does it; it is not about the child's own app reading her own
profile, which is the app's normal operation.

**Frozen: reader NEVER reassigns its module-scope `profile` from this GET.** It reads into a
local (`const fresh = await getJson("/api/profile");`) and passes that to
`maybeCelebrateTrophy`. Reassigning would silently change what `latestChapter()`,
`decideStage()` and the already-computed `lemmas`/`knownSet` see, which is a behaviour change
this phase has no licence to make.

**Guard, frozen (design T5: "never on the no-questions path"):** `public/quiz.js:247-250` calls
`onDone({ right: 0, total: 0 })` and RETURNS **without rendering a done screen**. Both views'
`onDone` callbacks therefore destructure `{ total }` and celebrate only when `total > 0`. Hook 3
(chapter generation) is not a quiz and needs no such guard.

### SK3-3 — THE SHELF-HEADER IS THE SCREEN'S TOP BANNER, USING THE EXISTING `.hero-banner` CLASS

`phase-state.md:47-49` and phase 2's RECORD GAP 1 hand this decision to phase 3: the asset is a
square 640×640 webp and design T4 (`design.md:104-113`) never places it. A regeneration is not
an option.

**FROZEN: `public/views/trophies.js` renders, as the first element of the screen,
`<img class="hero-banner" src="/assets/trophies/shelf-header.webp" alt="" />`, immediately
above the `<header class="app-header">` — byte-for-byte the shape of `public/views/home.js:54`.**

Why: `.hero-banner` already exists at `public/styles.css:372-385` with
`width: 100%; aspect-ratio: 3 / 2; object-fit: cover; border-radius: var(--radius);` and the
bottom fade mask. A square source in a 3:2 box crops the top and bottom ~17% each and keeps the
shelf and the sleeping dragon, which the phase-2 prompt put along the shelf's horizontal band.
The cost is **zero new CSS, zero new contrast pairs, zero new tokens** — the design's own
"reuses already-checked token pairs (the zero-cost path, §2(vi))".

**Fallback, one word, if the crop reads badly at the step-3.6 visual gate:** change the class to
`spot-image` (`public/styles.css:389-400`: 160×160, `aspect-ratio: 1/1`, circular mask) — the
square asset then shows uncropped. The gate ruling is recorded either way; a regeneration is
still not an option.

### SK3-4 — WHAT THE PROGRESS LINE SAYS FOR A LOCKED TROPHY AND FOR A MAXED (GOLD) ONE

Design T4 (`design.md:109-110`) says: *"progress toward the next tier as plain text (e.g. `12
<MITOCH> 15`)"* — where `<MITOCH>` stands for the Hebrew word this plan never retypes. It does
not say what to print when there IS no next tier, nor when nothing is earned yet.

**FROZEN, three cases, all reading the LIVE metric every render (risk 1, never a stored
high-water mark):**

| state | highest earned tier | progress line |
|---|---|---|
| locked (no tier earned) | none | `<metric> <MITOCH> <bronze threshold>` — e.g. `0 … 5` |
| bronze or silver earned | bronze / silver | `<metric> <MITOCH> <next threshold>` |
| **gold earned (maxed)** | gold | **no progress line at all — the element is omitted** |

`<MITOCH>` is the existing Hebrew word already shipped in `public/quiz.js:205` — the middle
token of `renderQuizDone`'s score line, i.e. the text between `${right}` and `${total}`.
**EXTRACTED from `public/quiz.js` by script, never retyped.** Measured today:
length **4**, escapes `\\u05de\\u05ea\\u05d5\\u05da` (written here with DOUBLED backslashes on
purpose — see the note below), decimal codepoints
`[1502, 1514, 1493, 1498]`, **decimal sum 6007**. The extraction regex is frozen in step 3.2.

**Why gold prints nothing rather than a number.** The design's own words are "progress toward
the NEXT tier"; at gold there is no next tier, so there is nothing to render, and any invented
alternative either (a) needs a new Hebrew word (SK3-8 forbids authoring one) or (b) prints
`<metric> … <gold>` where `metric` may exceed `gold` (e.g. `120 … 100`, which reads as
nonsense to an 11-year-old) or (c) clamps the numerator to the threshold, which understates what
she actually did. The gold ring and the undimmed artwork are what say "this one is finished" —
consistent with T6's "tier differentiation is CSS-only (ring colour + dimming)".

**Never-regress in the text (risk 1, phase-1 plan RISKS 1).** `days` and `streak` are NOT
monotonic — `lastSeen` is overwritten by `applyWordTap`/`markWordKnown`, so a day can leave the
set. The numerator can therefore FALL between two renders. **Frozen: the line is a plain
statement of the live metric against the next threshold. It is never phrased as a change, never
compared to a previous value, and the code stores no previous value to compare against.** The
never-regress law protects the EARNED TIER (the ring never dims back), which is what the child
reads as "mine". Falling text with a ring that never falls is the honest rendering, and it is
the only one the phase-1 record permits.

**Fallback if the owner dislikes a blank line at gold:** print `<gold> <MITOCH> <gold>` — a
one-expression change, still zero new Hebrew.

### SK3-5 — THE ANCHOR MOVES 52 → 58; THE THREE HEXES ARE CHOSEN AND MEASURED HERE

Design T7 requires the hexes be chosen at plan time and pass **3:1 as non-text rings** against
BOTH `--color-card` and `--color-surface-2`. Measured today (`--color-card: #fffaf0`,
`--color-surface-2: #fdeed6`, read from `public/styles.css:11-12`).

**FROZEN TOKENS — exact bytes, to be inserted into `:root`:**

```css
  --color-bronze: #a4622a;
  --color-silver: #6f6a63;
  --color-gold: #9a7200;
```

**FROZEN PAIRS — exact bytes, appended to `scripts/check-contrast.mjs`'s `PAIRS` array
immediately AFTER the last entry (`scripts/check-contrast.mjs:60`) and before the closing `];`
at `:61`:**

```js
  { fg: "--color-bronze", bg: "--color-card", min: 3, label: "bronze trophy ring on card (WCAG 1.4.11)" },
  { fg: "--color-bronze", bg: "--color-surface-2", min: 3, label: "bronze trophy ring on raised surface (WCAG 1.4.11)" },
  { fg: "--color-silver", bg: "--color-card", min: 3, label: "silver trophy ring on card (WCAG 1.4.11)" },
  { fg: "--color-silver", bg: "--color-surface-2", min: 3, label: "silver trophy ring on raised surface (WCAG 1.4.11)" },
  { fg: "--color-gold", bg: "--color-card", min: 3, label: "gold trophy ring on card (WCAG 1.4.11)" },
  { fg: "--color-gold", bg: "--color-surface-2", min: 3, label: "gold trophy ring on raised surface (WCAG 1.4.11)" },
```

**MEASURED RATIOS — produced by running a byte-copy of the real `scripts/check-contrast.mjs`
against a byte-copy of `public/styles.css` carrying the three tokens, OUTSIDE the repository.
Exit 0, `ALL PASS`, `grep -c '^PASS'` = 58:**

| pair | ratio | min |
|---|---|---|
| `--color-bronze` on `--color-card` | **4.63** | 3 |
| `--color-bronze` on `--color-surface-2` | **4.22** | 3 |
| `--color-silver` on `--color-card` | **5.15** | 3 |
| `--color-silver` on `--color-surface-2` | **4.69** | 3 |
| `--color-gold` on `--color-card` | **4.22** | 3 |
| `--color-gold` on `--color-surface-2` | **3.84** | 3 |

Every one clears 3:1 with at least 0.84 of headroom; the tightest is gold on the raised surface.
None duplicates an existing token value (measured against all 17 `:root` hexes). The three are
mutually distinguishable by hue: bronze is a warm copper (`R>G>B`, B non-zero), gold is a
saturated dark amber (`B = 0`), silver is a warm neutral grey (`R≈G≈B`). All three sit in the
parchment palette's warmth as T7 requires.

**Two traps honoured.** (i) `color-mix()` FABRICATES a contrast pass (lesson 5) — none of the
three tokens is ever consumed through `color-mix()`, and the new view's `VIEW_STYLE` is tested
to contain no `color-mix(`. (ii) A raw hex is invisible to the gate — **the three hexes appear
ONLY inside `:root` in `public/styles.css`** and nowhere else in shipped code; everything that
draws a ring uses `var(--color-bronze|silver|gold)`.

**EVERY PIN OF "52", ENUMERATED — all five move in step 3.1, together:**

| # | file:line | today | becomes |
|---|---|---|---|
| 1 | `tests/quiz-ui.test.js:501` | `assert.strictEqual(passLines.length, 52, \`expected exactly 52 PASS lines, got ${passLines.length}\`);` | both `52` → `58` (the number AND the message) |
| 2 | `tests/reader-ui.test.js:105` | `assert.strictEqual(passLines.length, 52, 'contrast gate should print exactly 52 PASS lines');` | both `52` → `58` |
| 3 | `tests/words-ui.test.js:161` | `assert.strictEqual(passLines.length, 52, \`expected exactly 52 PASS lines, got ${passLines.length}\`);` | both `52` → `58` |
| 4 | `docs/visual-design.md:135` | `enforces this mechanically over 52 pairs, reads its token values live from public/styles.css,` | **NOT edited** — a dated additive CORRECTION line is appended after `:136` (SK3-9) |
| 5 | `README.md:45` | `- **Accessibility is enforced, not assumed.** \`scripts/check-contrast.mjs\` mechanically checks 52` | `52` → `58` (one line; the sentence continues on `:46`, which is untouched) |

**DECOYS THAT CONTAIN "52" AND MUST NOT BE TOUCHED — enumerated so no executor "helpfully" moves them:**

| file:line | text | why it is not the anchor |
|---|---|---|
| `public/styles.css:40` | `radial-gradient(circle 520px at 8% 2%, …` | a gradient radius; also byte-pinned by `tests/background.test.js:27` |
| `tests/background.test.js:27` | the same `circle 520px` inside the frozen expected string | the same gradient |
| `public/styles.css:450` | `min-height: 52px;` | the entry-code input's height |
| `scripts/check-contrast.mjs:140` | `return 0.2126 * R + 0.7152 * G + 0.0722 * B;` | the WCAG luminance coefficient |
| `docs/growth.md:407` | `` `pickQuizWords` (`public/quiz-core.js:52`) `` | a line-number citation |
| `docs/visual-design.md:62` | `` `#ef9a7d` … `#b05525` `` | hex digits |
| `docs/visual-design.md:282` | md5 `51b97a774dc52aa272850bb686c22188` | the FROZEN STYLE SUFFIX digest |
| `package-lock.json:151` | a `sha512-…` integrity string | not ours |

(Search performed today over `*.js *.mjs *.css *.html *.json *.md`, excluding `node_modules/`,
`.oplan/`, `data/`, `public/quiz/` and `public/words-index.js`.)

### SK3-6 — `public/` CANNOT IMPORT `lib/`, SO THE METRICS ARE DUPLICATED — AND THE DUPLICATE IS GATED

**Measured: `grep -rn "\.\./lib\|/lib/" public/` returns ZERO hits.** The browser is served
`public/` only (`scripts/dev-server.js:8` sets `PUBLIC_DIR` to `public`; Vercel serves the same
tree), so `public/views/trophies.js` cannot `import { TROPHY_CATALOG } from "../../lib/profile.js"`.
Phase 1 already ruled the mirror of this in SK-3 (`plan.md:101`): *"`public/` can never import
from `lib/` (verified: zero `../lib` imports anywhere under `public/`)"*.

The screen must show progress from the **live** metric on every render (risk 1). The metric
functions therefore have to exist in the browser. **FROZEN: `public/views/trophies.js` carries
its own `TROPHY_VIEW` array — the same eight ids, in the same order, with the same thresholds
and behaviourally identical metric functions — and the duplication is held honest by a
mandatory agreement test, not by discipline.**

The gate (test 4 of step 3.2, `'every view metric agrees with the engine metric over the shared
fixtures'`): the test imports `TROPHY_CATALOG` from `../lib/profile.js` AND `TROPHY_VIEW` from
`../public/views/trophies.js` — both imports are legal in a node test, and
`tests/reader-ui.test.js:7` / `tests/words-ui.test.js:10` are the precedent for importing a
view module — then asserts, over **eight shared fixtures** frozen in step 3.2:

* `deepStrictEqual(TROPHY_VIEW.map(({id,bronze,silver,gold}) => ({id,bronze,silver,gold})),
   TROPHY_CATALOG.map(({id,bronze,silver,gold}) => ({id,bronze,silver,gold})))` — ids, ORDER
   and all 24 thresholds in one assertion;
* for every fixture × every id: `strictEqual(view.metric(p), engine.metric(p))`.

**Consequence, frozen:** `public/views/trophies.js` must be importable in node with **no DOM**.
Nothing at module top level may touch `document`, `window`, `localStorage` or `navigator`; all
of those live inside functions. (This is why the module can be tested at all.)

**This is NOT a copy of `lib/profile.js`.** The engine's `awardTrophies`, `trophyDay`,
`longestStreak` etc. are re-expressed for the view's single job. `awardTrophies(` must appear
**zero** times under `public/` (T2: "Never client-side"; acceptance criterion 14). The view
never awards, never writes trophies, never posts.

### SK3-7 — THE SCREEN'S CSS LIVES IN THE VIEW, NOT IN `styles.css`

Three shipped views already carry their own CSS in a `VIEW_STYLE` template literal injected as a
`<style>` tag: `public/views/words.js:7-87` + `:98-100`, `public/views/reader.js:9-244` +
`:245`, `public/quiz.js:5`. **FROZEN: `public/views/trophies.js` follows that house pattern.
`public/styles.css` gains ONLY the three `:root` tier tokens (SK3-5) and nothing else.**

Three concrete hazards this avoids, all measured:

1. `tests/entry-code.test.js:30-43` slices `styles.css` from the marker
   `/* ---------- Entry code gate ---------- */` (**`public/styles.css:408`**) to EOF and
   forbids `#`, `background-image` and `color-mix(` in that slice. Any new rule appended at the
   end of `styles.css` would land inside that slice. Adding tokens at `:23` is far above it.
2. `tests/background.test.js:21-31` matches the FIRST `background-image:` in the file
   (`public/styles.css:39`) and compares it byte-exactly. Inserting inside `:root` at `:23`
   cannot move which occurrence is first. The trophy CSS uses no `background-image` at all.
3. `tests/shell.test.js:88-94` asserts six token names are present; adding tokens cannot break it.

The view's `VIEW_STYLE` is itself gated (test 9 of step 3.2) for **no `#`** and **no
`color-mix(`** — the same assertion `tests/quiz-ui.test.js:493-494` and
`tests/words-ui.test.js:153-154` already make of their views. All colour comes from
`var(--color-…)`.

### SK3-8 — NOT ONE HEBREW STRING IS AUTHORED; EVERY GLYPH ON THE SCREEN IS EXTRACTED

Field-guide lesson 8: *"never retype Hebrew and never copy it from terminal output — EXTRACT it
from its source file by script."* Design §3 also requires that *"every Hebrew name … [is]
owner-approved before deploy"*, and design §5 gives phase 3 an "owner approves strings" gate.

I searched the whole repository today for Hebrew words for gold / silver / bronze:
**zero occurrences of the words for "gold" and "bronze"; one occurrence of the word for "silver"
in `docs/owner-handoff.md:99`, in an unrelated sense.** So a tier WORD would have to be
authored. **FROZEN: no tier word is authored. The tier is shown exactly as design T6 specifies —
"tier differentiation is CSS-only (ring colour + dimming)".** The celebration overlay shows
artwork + name + the tier-coloured ring, which is literally T5's "artwork + name + tier".

**The complete Hebrew inventory of the trophies screen, with its extraction source — five items,
all pre-existing, none authored:**

| # | what | source to extract from | measured length | decimal codepoint sum |
|---|---|---|---|---|
| 1-8 | the eight trophy names | `.oplan/word-trophies/design.md:89-96`, column 2 of the T3 table, keyed by column 1's id | 8 / 6 / 8 / 11 / 12 / 12 / 11 / 10 | 12052 / 8998 / 10571 / 15046 / 16536 / 16545 / 15042 / 13526 |
| 9 | the nav-tab label and the screen title | `.oplan/word-trophies/design.md:189`, the text after the literal marker `(b) tab label = ` to end of line | 11 | 15014 |
| 10 | `<MITOCH>` in the progress line | `public/quiz.js:205`, between `${right}` and `${total}` | 4 | 6007 |

(The eight name sums are in T3 table order: `chapters, days, streak, known, quizRight, quizzer,
curious, proven` — measured today by reading `design.md` and summing codepoints. Three of the
eight contain one space, U+0020, which is included in the length and the sum.)

**No greeting line.** `words.js`/`home.js` render `<header class="app-header"><p
class="greeting">…</p><h1 class="app-title">…</h1></header>`. The trophies screen renders the
`<h1 class="app-title">` **only**, so no ninth string has to come from anywhere. `.app-header`
is `display:flex; flex-direction:column; gap:4px` (`public/styles.css:76-81`) and degrades to a
single child cleanly.

**The escape trap, freshly re-measured while writing this plan (lesson 8, new evidence).** While
drafting SK3-4 I wrote four `\u05XX` escapes into a tool call; **they arrived in the file as raw
Hebrew glyphs** — the JSON transport decoded them, exactly as the phase-1 close recorded. That
is why every Hebrew fact in this plan is carried as a **decimal codepoint sum**, which no
transport can silently rewrite, and why the two mechanical rules below are frozen:

* **In `tests/trophies-ui.test.js`: `\u` escapes ONLY, zero raw non-ASCII bytes** (acceptance
  criterion 12, enforced in §VAL-P3).
* **In `public/views/trophies.js`: the Hebrew is written as raw UTF-8 glyphs** (every other
  shipped view does — `public/views/words.js`, `home.js`, `reader.js`, `public/api.js`), but it
  gets there ONLY by an extraction script that reads `design.md` and `public/quiz.js`, writes
  the file, and then **dumps the codepoints of what it wrote and compares the decimal sums to
  the table above**. If a sum differs by one, the step STOPS. Never a heredoc, never a
  hand-typed glyph, never a copy from terminal output.

### SK3-9 — DOC CORRECTIONS ARE ADDITIVE; `docs/visual-design.md` DELETES ZERO LINES ALL PHASE

Design T10 (`design.md:161-165`) asks for

> "A dated, additive correction to docs/visual-design.md §3 recording that the live palette is
> Sunrise Parchment (styles.css is the source of truth), growth.md-correction style: additive,
> ASCII where possible, byte-preserving edit."

Two facts in §3 are stale, not one:

1. **The palette table** (`docs/visual-design.md:48-66`) records the warm-DARK era —
   `--color-bg: #241305`, `--color-card: #3a1d08`, `--color-ink: #fdf1d8` — while
   `public/styles.css:5, 11, 6` today read `#fff4e2`, `#fffaf0`, `#3a2412`. The amendment block
   at `:68-107` is dark-era too (`--color-bg-top: #361d08` vs today's `#ffe9c9`, which
   `tests/background.test.js:14` byte-pins). This is design §2(ix)'s RECORD DISCREPANCY and is
   what T10 exists for.
2. **The gate size**: `docs/visual-design.md:135` says the gate runs "over 52 pairs". After
   step 3.1 that is false.

**FROZEN: both corrections are ADDITIVE — new dated lines inserted, zero lines deleted or
rewritten.** The precedent is quoted from `docs/growth.md:113`:

> "- CORRECTION (2026-07-28, word-g1 phase 3, B7 accepted): …"

So `docs/visual-design.md` has a deletion budget of **0** for the whole phase (acceptance
criterion 10), the FROZEN STYLE SUFFIX at `:216` and its md5 `51b97a774dc52aa272850bb686c22188`
are untouched, and phase 2's guarantee that §3 is byte-identical becomes "§3's original bytes
all survive, in order, with dated corrections inserted". This also removes any conflict between
T10's "byte-preserving" wording and the anchor move: the "52 pairs" line is not edited at all.

### SK3-10 — ONE OVERLAY PER PASS, AND THE DAY-ONE BACKFILL DOES NOT PRODUCE A PARADE

Design T5 says "the active view shows **ONE** overlay". Design T9's free backfill means her
first real POST after phase 4's deploy awards **several** tiers at once — on her profile as last
measured (12 known, 0 candidates, per `journal.md:294-296`) at minimum `known` bronze and
`known` silver, and plausibly `days`, `streak`, `curious` and `quizzer` tiers too. A naive
"celebrate each uncelebrated tier" would queue six or eight overlays.

**FROZEN selection rule — SUPERSEDED BY P3-AMENDMENT #2 (owner ruling, 2026-07-30).**
SK3-10 as drafted showed the first uncelebrated tier and marked ALL of them celebrated in the
same pass, so a backlog was silently discarded. It was written against an ESTIMATE of six to
eight day-one tiers. The estimate was wrong: the 2026-07-30 capture measures **four**, all
bronze (`days`, `streak`, `known`, `curious`) — see journal.md "D25 CAPTURE TAKEN EARLY".
The owner, shown the real numbers, ruled: **one per sitting until caught up.**

**FROZEN selection rule, as amended:** on each celebration pass the view collects every
`(id, tier)` present in `profile.trophies` that has no `localStorage` key
`trophyCelebrated:<id>:<tier>`, **shows the FIRST one in `TROPHY_VIEW` order × `TROPHY_TIERS`
order (`bronze, silver, gold`)**, and **marks ONLY THAT ONE celebrated** (writing
`trophyCelebrated:<id>:<tier>` = `new Date().toISOString()` for exactly that entry). Still ONE
overlay per pass — there is still no parade and no queue object and no state machine — but the
backlog DRAINS one per earning moment instead of being thrown away. Day one therefore yields four
celebrations spread across four earning moments, not one celebration and three silent trophies.
The `uncelebrated()` helper still returns the whole list (it is what makes the ordering testable);
only the WRITE narrows to the shown entry.

Design T5's storage contract is quoted and honoured verbatim:

> "'Already celebrated' lives in localStorage (`trophyCelebrated:<id>:<tier>` = ISO) — clearing
> site data replays celebrations once; accepted at the grill."

Every `localStorage` access is wrapped in `try/catch` and treats a throw as "not celebrated,
and could not record it" — the `public/api.js:3-9` / `:54-58` precedent (private mode). A
storage failure must never break the screen or the quiz.

### SK3-11 — EXACTLY THE THREE DESIGNED HOOKS; THE FREE FOURTH ONE IS DELIBERATELY NOT TAKEN

`public/views/words.js:226-239` handles the "I know this" button: it POSTs `mark-known` and
**already receives the full post-award profile** (`public/api.js:81` returns `payload.data`;
`api/profile.js` sends `{ ok: true, data: p }` after `awardTrophies(p)`). Celebrating there
would cost one line and zero requests.

**FROZEN: that hook is NOT taken.** Design T5 names three hook points — the two views' quiz
`onDone` callbacks and the reader's chapter-done stage — and the briefing's own constraint is
"Do not exceed the signed design." A fourth celebration site is a design change, not an
implementation detail. Recorded here so it is a decision rather than an oversight, and so a
future run can add it in one line if the owner wants it.

---

## §VAL-P3 — the frozen validation preamble

**Deliver this to any executor as a FILE, never inline in a JSON packet** — its backslashes
collapsed in transit twice in phase 1, and this planner reproduced the same decoding trap while
writing SK3-8. **Every step's validation is ONE script = §VAL-P3 verbatim + that step's tail, in
the SAME file** (P2-AMENDMENT #1a: a child `bash` cannot supply `fail` / `$PORC` / `$RC` to a
tail). The `sed` and `awk` lines are copied byte-for-byte from `plan.md` §VAL-COMMON and
§VAL-P2:919, which ran clean 30+ times across phases 1 and 2. **The `.oplan` filter is
`awk '$NF !~ /^\.oplan\//'` — four characters of backslash. `plan.md:989` carries a
collapsed-backslash copy that is a bash SYNTAX ERROR (P2-NOTE #1): never copy that line.**

Unlike §VAL-P2, this preamble does NOT hard-code the suite totals or the contrast anchor —
both move during phase 3, so both are captured into variables here and asserted in each step's
tail (the §VAL-COMMON shape from phase 1).

```bash
#!/usr/bin/env bash
set -o pipefail
cd C:/Users/dkreinov/claude/english-app || { echo "FAIL: cannot cd to the repo"; exit 1; }
RC=0
fail() { echo "FAIL: $*"; RC=1; }

# --- suite (plain) ---
OUT="$(npm test 2>&1)"; STAT=$?
case "$STAT" in 0) ;; *) fail "npm test exited $STAT";; esac
TOTAL="$(printf '%s\n' "$OUT" | sed -n 's/^# tests \([0-9][0-9]*\).*$/\1/p')"
FAILED="$(printf '%s\n' "$OUT" | sed -n 's/^# fail \([0-9][0-9]*\).*$/\1/p')"
PLAN="$(printf '%s\n' "$OUT" | sed -n 's/^1\.\.\([0-9][0-9]*\).*$/\1/p')"

# --- suite (gated) ---
GOUT="$(APP_CODE=dummy npm test 2>&1)"; GSTAT=$?
case "$GSTAT" in 0) ;; *) fail "APP_CODE=dummy npm test exited $GSTAT";; esac
GTOTAL="$(printf '%s\n' "$GOUT" | sed -n 's/^# tests \([0-9][0-9]*\).*$/\1/p')"
GFAILED="$(printf '%s\n' "$GOUT" | sed -n 's/^# fail \([0-9][0-9]*\).*$/\1/p')"

# --- flat ledger ---
FLAT="$(grep -h -c '^test(' tests/*.js | awk '{s+=$1} END{print s+0}')"

# --- contrast gate: exit code checked here, the ANCHOR is asserted in the step tail ---
CON="$(node scripts/check-contrast.mjs 2>&1)"; CSTAT=$?
case "$CSTAT" in 0) ;; *) fail "check-contrast exited $CSTAT";; esac
PASSES="$(printf '%s\n' "$CON" | grep -c '^PASS')"
case "$CON" in *"ALL PASS"*) ;; *) fail "check-contrast did not print ALL PASS";; esac

# --- public/ OUTSIDE the seven paths phase 3 may touch is byte-frozen (no backslashes: lesson 8) ---
PUBX="$(node -e 'const fs=require("fs"),path=require("path"),crypto=require("crypto");const SKIP=new Set(["public/views/trophies.js","public/sw.js","public/styles.css","public/index.html","public/app.js","public/views/words.js","public/views/reader.js"]);const out=[];(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);const p=f.split(path.sep).join("/");const s=fs.statSync(f);if(s.isDirectory())walk(f);else if(!SKIP.has(p))out.push(p+" "+crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex"));}})("public");console.log(out.length+" "+crypto.createHash("md5").update(out.join(String.fromCharCode(10))).digest("hex"));')"
case "$PUBX" in "2365 a4c1d7a5723900f228e82e70f0f1cd78") ;; *) fail "public/ moved outside the seven touchable paths: expected '2365 a4c1d7a5723900f228e82e70f0f1cd78', got '$PUBX'";; esac

# --- public/ file count: 2371 today, 2372 once trophies.js lands; asserted in the step tail ---
PUBN="$(node -e 'const fs=require("fs"),path=require("path");let n=0;(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);if(fs.statSync(f).isDirectory())walk(f);else n++;}})("public");console.log(n);')"

# --- the QZ-18 frozen quiz files must not move by one byte, all phase ---
QMD5="$(md5sum public/quiz.js | cut -d' ' -f1)"
case "$QMD5" in 69b6d71117cf776715374abc6f0abb02) ;; *) fail "public/quiz.js moved: $QMD5 (QZ-18 frozen)";; esac
QCMD5="$(md5sum public/quiz-core.js | cut -d' ' -f1)"
case "$QCMD5" in 9a2131be8b9d1b77c219f1e8c3482a71) ;; *) fail "public/quiz-core.js moved: $QCMD5 (frozen)";; esac

# --- the server does not move this phase ---
SRV="$(git diff --name-only HEAD -- lib api data)"
case "$SRV" in "") ;; *) fail "lib/ api/ or data/ changed, which phase 3 must never do: $SRV";; esac

# --- awardTrophies stays server-side only (T2: never client-side) ---
CLIENTAWARD="$(grep -rl 'awardTrophies' public/ | wc -l | tr -d ' ')"
case "$CLIENTAWARD" in 0) ;; *) fail "awardTrophies appears under public/ -- T2 forbids client-side awarding";; esac

# --- both transcripts must diff EMPTY ---
VD="$HOME/trophies-val"; mkdir -p "$VD"
node .oplan/word-quiz/quiz-transcript.mjs > "$VD/qz.out" 2>&1 || fail "quiz-transcript.mjs exited non-zero"
QZ="$(diff "$VD/qz.out" .oplan/word-quiz/quiz-transcript-expected.txt)"
case "$QZ" in "") ;; *) fail "QZ-21 transcript moved";; esac
node .oplan/word-g1/g1-transcript.mjs > "$VD/g1.out" 2>&1 || fail "g1-transcript.mjs exited non-zero"
G1="$(diff "$VD/g1.out" .oplan/word-g1/g1-transcript-expected.txt)"
case "$G1" in "") ;; *) fail "G1 transcript moved";; esac
rm -f "$VD/qz.out" "$VD/g1.out"

# --- her profile must never appear locally ---
if [ -e .data/profile.json ]; then fail ".data/profile.json exists -- a local write leaked"; fi

# --- line endings are LAW and git normalises them away (field guide lesson 4, corrected by SK3-1) ---
ENDS="$(node -e 'const fs=require("fs");const out=[];for(const f of process.argv.slice(1)){if(!fs.existsSync(f)){out.push(f+" MISSING");continue;}const b=fs.readFileSync(f);let c=0,l=0;for(let i=0;i<b.length;i++){if(b[i]===10){if(i>0&&b[i-1]===13)c++;else l++;}}out.push(f+" CRLF="+c+" LF="+l);}console.log(out.join("; "));' public/sw.js public/styles.css public/index.html public/app.js public/views/words.js public/views/reader.js public/views/trophies.js public/quiz.js public/quiz-core.js scripts/check-contrast.mjs tests/shell.test.js tests/reader-ui.test.js tests/quiz-ui.test.js tests/words-ui.test.js tests/trophies-ui.test.js docs/visual-design.md README.md)"
echo "ENDINGS: $ENDS"
case "$ENDS" in *"public/quiz.js CRLF=346 LF=0"*)      ;; *) fail "public/quiz.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/quiz-core.js CRLF=99 LF=0"*)  ;; *) fail "public/quiz-core.js endings moved: $ENDS";; esac

# --- no raw non-ASCII in the new test file, flat tests only ---
if [ -f tests/trophies-ui.test.js ]; then
  NONASCII="$(node -e 'const b=require("fs").readFileSync("tests/trophies-ui.test.js");let n=0;for(const x of b) if(x>127) n++;console.log(n);')"
  case "$NONASCII" in 0) ;; *) fail "tests/trophies-ui.test.js has $NONASCII raw non-ASCII bytes -- Hebrew must be backslash-u escapes";; esac
  NEST="$(grep -c 'describe(\|  test(\|t\.test(' tests/trophies-ui.test.js)"
  case "$NEST" in 0) ;; *) fail "tests/trophies-ui.test.js has $NEST nested/suite constructs -- flat test() only";; esac
fi

# --- nothing deleted, ever ---
GONE="$(git diff --diff-filter=D --name-only HEAD)"
case "$GONE" in "") ;; *) fail "files were deleted: $GONE";; esac

PORC="$(git status --porcelain -uall | awk '$NF !~ /^\.oplan\//' | LC_ALL=C sort)"   # .oplan is the orchestrator record, never the executor write set
```

Per-step blocks continue from here with their own `case` assertions on `$TOTAL`, `$FAILED`,
`$PLAN`, `$GTOTAL`, `$GFAILED`, `$FLAT`, `$PASSES`, `$PUBN`, `$ENDS`, `$PORC`, then `exit $RC`.

**Note on `$PUBX`:** measured today at `2365 a4c1d7a5723900f228e82e70f0f1cd78` — 2371 files
minus the six touchable existing paths, and `public/views/trophies.js` is in the skip set so the
value does not change when it is created. It is a REAL invariant (2365 = 2371 − 6), not a
tautology: it covers all nine trophy webps, all eight other webps, every audio clip, every quiz
JSON, `api.js`, `lemma.js`, `words-index.js`, `views/home.js`, `views/placement.js`,
`views/parent.js`, `manifest.webmanifest` and every icon.

**This preamble was DRY-RUN today** against the clean tree: it exits **0** and reports
`TOTAL=328 PLAN=323 FLAT=323 PASSES=52 PUBN=2371 GTOTAL=328`, `PORC=[]`, and the full ENDINGS
line (with the two not-yet-created files reported `MISSING`, which the preamble tolerates by
design). A frozen validation can itself be the bug (lesson 9); this one has been seen to run.

---

## FROZEN CONTRACTS — quoted, in force for every step of this phase

From `.oplan/word-g1/phase-state.md:34-42`:
> "both transcripts (QZ-21 + g1) must diff EMPTY forever; expected files committed ONCE, never
> edited · QZ-22: next CACHE bump = v18 whenever public/ next moves · … contrast anchor 52 ·
> APP_CODE never in an orchestrator shell; the frozen subshell (.oplan/word-quiz/
> plan.md:1573-1586) is the only sanctioned live read · GET /api/profile creates one — never probe"

From `.oplan/word-trophies/phase-state.md:36-62`, the eight carried obligations, all discharged
by this plan: (1) **CACHE v17 → v18 is MANDATORY this phase** and covers phase 2's `public/`
addition — `tests/shell.test.js:58` pins the string and moves in the same step (step 3.3);
(2) the nine filenames are frozen and the eight stems are the `TROPHY_CATALOG` ids exactly,
camelCase `quizRight` included — the view builds `/assets/trophies/${id}.webp` (step 3.2);
(3) **trophy art is NOT precached** and must not enter `PRECACHE` (step 3.3, acceptance
criterion 15); (4) the shelf-header is square and its framing is a CSS ruling — SK3-3;
(5) the asset existence/distinctness test is phase 3's, and the ledger moves once for the whole
screen — step 3.3 test 12; (6) T10 is phase 3's — step 3.5; (7) the ledger starts at 323 flat /
328 reported and the anchor at 52, both re-measured today — SK3-5 and the per-step ledger;
(8) RECORD GAP 1 and risk 1 belong to phase 3 — SK3-2 and SK3-4.

From `design.md` T4 (`:104-113`):
> "Route `/trophies` in ROUTES; `public/views/trophies.js` (export render(container, ctx));
> 4th nav tab in index.html, DOM order AFTER [the words tab] … Screen = one card per trophy:
> artwork image, name, current tier shown as a colored ring/frame, progress toward the next tier
> as plain text … — no progress-bar component, no new chart machinery. Locked (unearned)
> trophies show the SAME artwork dimmed by CSS (filter grayscale+opacity) — no separate locked
> asset. PRECACHE += "/views/trophies.js" (appended AFTER "/views/words.js", order pinned);
> CACHE v17 → v18 (QZ-22). /placement stays tab-less; /parent stays invisible."

From `design.md` T5 (`:116-123`):
> "the active view shows ONE overlay (artwork + name + tier, one tap to dismiss) — hooked in the
> views' quiz onDone callbacks and the reader's chapter-done stage, NEVER inside renderQuizDone
> (QZ-18 frozen) and never on the no-questions path. 'Already celebrated' lives in localStorage
> (`trophyCelebrated:<id>:<tier>` = ISO) … No sound in v1 … Reduced-motion honored (the existing
> prefers-reduced-motion pattern)."

From `design.md` T7 (`:138-143`):
> "Three new :root tokens: `--color-bronze`, `--color-silver`, `--color-gold` … Each adds its
> gate pairs to scripts/check-contrast.mjs — the 52 anchor MOVES once, to a number pinned at
> plan time, and every pin of '52' moves in the same step … No raw hex anywhere."

From `design.md` T9 (`:153-159`), the non-goals this phase must not cross:
> "No sound · no push · no per-trophy share/export · no server-side celebration state · no
> progress bars/charts · no new API route · no runtime image generation · no reworking
> renderQuizDone or any frozen string · no parent-view features on this screen … · no backfill
> migration"

From the field guide, lesson 4 (as CORRECTED by SK3-1 — measure, never remember):
> "core.autocrlf=true makes DISK endings unstable … `git diff` normalises so the damage is
> INVISIBLE to any git-based gate — edit LF files byte-preservingly (python `newline=''`) and
> verify endings with an `rb` byte count, never grep/`file`."

Lesson 5:
> "every new test is a FLAT top-level `test()`; pin the exact cumulative ledger per step …
> `color-mix()` FABRICATES a contrast pass; a raw hex is invisible to the gate."

Lesson 7:
> "Before touching a view/style/data file, grep `tests/` for exact-shape assertions (the `CACHE`
> string, the `PRECACHE` array, class names, Hebrew strings) — append beside a frozen thing,
> never replace it. Any precached-file change ships a `CACHE` bump the same phase (QZ-22)."

Lesson 8:
> "never retype Hebrew and never copy it from terminal output — EXTRACT it from its source file
> by script. ANY backslash through ANY transport is at risk … an agent packet is JSON — `\uXXXX`
> in it DECODES to the raw glyph in transit … double the backslashes or ship evidence as byte
> counts."

Lesson 11:
> "VISUAL GATES ARE SELF-SERVED (owner directive): sandbox browser only, NEVER production; CHECK
> PORT 3000 FOR A STALE SERVER FIRST … hard-reload past the stale localhost SW; restore the
> sandbox profile byte-from-backup and stop the server before recording the step."

**Executor stop-rule (lesson 9):** never silently "fix" a frozen command, a pinned number, a hex
or a string. If a gate contradicts reality, STOP, report, and wait for a ruling.

**Editing rule (lesson 4 + SK3-1, mandatory):** `public/sw.js`, `public/styles.css`,
`public/index.html`, `public/views/words.js`, `public/views/reader.js` are **CRLF** — every
inserted line ends `\r\n`. `public/app.js`, `scripts/check-contrast.mjs`, everything under
`tests/`, `docs/visual-design.md`, `README.md` and the new `public/views/trophies.js` are
**LF** — every inserted line ends `\n`. Never inspect or reason about disk bytes through a
git-mediated copy (`git archive`, `git stash`, a clone, a worktree): they re-apply
`core.autocrlf=true` and flip every ending. Verify with §VAL-P3's byte counter only.

**Commits are the ORCHESTRATOR's, at acceptance.** No step's COMMANDS contain `git add` or
`git commit`. Workers never run git writes.

---

# STEP 3.1 — the three tier tokens, the six gate pairs, and the 52 → 58 anchor move (T7)

**GOAL:** `public/styles.css` gains exactly three `:root` tokens; `scripts/check-contrast.mjs`
gains exactly six pairs; **all five pins of the number 52 move in this one step**; a new
`tests/trophies-ui.test.js` holds the two tests that make the tokens and the new anchor real.
No view, no route, no nav tab, no CACHE bump.

**TIER:** WORKER. **DEPENDS ON:** nothing (phase base = the phase-3 `$BASE` the orchestrator
records at go-ahead).

**FILES (exhaustive), with measured endings:**
- `public/styles.css` — MODIFY (**CRLF**, 501/0 today). One insert, **7 lines** (1 blank + a 3-line comment + the 3 tokens), 0 deletions.
- `scripts/check-contrast.mjs` — MODIFY (**LF**, 0/184). One insert, 6 lines, 0 deletions.
- `tests/quiz-ui.test.js` — MODIFY (**LF**, 0/584). One line replaced. 1 deletion.
- `tests/reader-ui.test.js` — MODIFY (**LF**, 0/224). One line replaced. 1 deletion.
- `tests/words-ui.test.js` — MODIFY (**LF**, 0/272). One line replaced. 1 deletion.
- `README.md` — MODIFY (**LF**, 0/108). One line replaced. 1 deletion.
- `tests/trophies-ui.test.js` — CREATE (**LF**). 2 flat tests.

**Edit 1 — `public/styles.css`, after line 23.** Anchor, quoted exactly (`:23-24`):
```css
  --transition-fast: 150ms ease;
}
```
becomes
```css
  --transition-fast: 150ms ease;

  /* T7. Trophy tier rings. Non-text 3:1 against both --color-card and
     --color-surface-2 (scripts/check-contrast.mjs). Never consumed through
     color-mix(): color-mix fabricates a contrast pass. */
  --color-bronze: #a4622a;
  --color-silver: #6f6a63;
  --color-gold: #9a7200;
}
```
(Position frozen: LAST in `:root`, after `--transition-fast`, so nothing existing shifts. This is
line 23 of 501 CRLF lines — nowhere near the entry-code marker at `:408` that
`tests/entry-code.test.js:30-43` guards, and after the `body` rule's `background-image` at `:39`
is irrelevant because we add none.)

**Edit 2 — `scripts/check-contrast.mjs`, between lines 60 and 61.** Anchor, quoted exactly
(`:60-61`):
```js
  { fg: "--color-border", bg: "--color-bg-glow-amber", min: 3, label: "control border on page, WCAG 1.4.11 (amber glow)" },
];
```
becomes that first line, then the **six frozen pairs quoted verbatim in SK3-5**, then `];`.

**Edit 3 — `tests/quiz-ui.test.js:501`.** Replace, quoted exactly:
```js
  assert.strictEqual(passLines.length, 52, `expected exactly 52 PASS lines, got ${passLines.length}`);
```
with
```js
  assert.strictEqual(passLines.length, 58, `expected exactly 58 PASS lines, got ${passLines.length}`);
```

**Edit 4 — `tests/reader-ui.test.js:105`.** Replace, quoted exactly:
```js
  assert.strictEqual(passLines.length, 52, 'contrast gate should print exactly 52 PASS lines');
```
with
```js
  assert.strictEqual(passLines.length, 58, 'contrast gate should print exactly 58 PASS lines');
```

**Edit 5 — `tests/words-ui.test.js:161`.** Replace, quoted exactly:
```js
  assert.strictEqual(passLines.length, 52, `expected exactly 52 PASS lines, got ${passLines.length}`);
```
with
```js
  assert.strictEqual(passLines.length, 58, `expected exactly 58 PASS lines, got ${passLines.length}`);
```
(Edits 3 and 5 are byte-identical lines in two different files. Replace each in its own file; do
not use a repo-wide substitution — the decoy table in SK3-5 lists what a repo-wide substitution
would destroy.)

**Edit 6 — `README.md:45`.** Replace, quoted exactly:
```
- **Accessibility is enforced, not assumed.** `scripts/check-contrast.mjs` mechanically checks 52
```
with
```
- **Accessibility is enforced, not assumed.** `scripts/check-contrast.mjs` mechanically checks 58
```
(`README.md:46`, `  text/background pairs against WCAG AA and fails the build if any pair drops
below threshold.`, is NOT touched.)

**Edit 7 — CREATE `tests/trophies-ui.test.js`** (LF) with a header comment naming the phase, the
step and `design.md` T7, and exactly these **2** flat tests, names FROZEN:

1. `'styles.css defines the three tier tokens with their frozen hex values inside :root'` —
   read `public/styles.css`; assert it contains `--color-bronze: #a4622a;`,
   `--color-silver: #6f6a63;`, `--color-gold: #9a7200;`; extract the `:root { … }` block with
   `/:root\s*\{([\s\S]*?)\}/` (the same regex `scripts/check-contrast.mjs:64` uses) and assert
   all three appear INSIDE it; then assert that each of the three hex strings `#a4622a`,
   `#6f6a63`, `#9a7200` appears **exactly once in the whole file** (the "no raw hex outside
   `:root`" half of T7, as a countable assertion rather than a hope).
2. `'the contrast gate covers the six tier-ring pairs at 3:1 and prints exactly 58 PASS lines'` —
   `spawnSync(process.execPath, ['scripts/check-contrast.mjs'], { cwd: root })`; assert
   `status === 0`; assert stdout includes `ALL PASS`; then, **written in exactly the house form
   so step 3.1's `NEWPINS` grep can count it** —
   `const passLines = stdout.split('\n').filter((l) => l.startsWith('PASS'));` followed by
   `assert.strictEqual(passLines.length, 58, ...);` — and assert stdout
   contains each of the six frozen label strings (`'bronze trophy ring on card (WCAG 1.4.11)'`,
   `'bronze trophy ring on raised surface (WCAG 1.4.11)'`, and the silver/gold equivalents) —
   so a pair that is deleted or renamed fails loudly instead of being absorbed by the count.

**COMMANDS:**
```bash
cd C:/Users/dkreinov/claude/english-app
node --check scripts/check-contrast.mjs
node scripts/check-contrast.mjs | grep -c '^PASS'   # must print 58
npm test
APP_CODE=dummy npm test
# COMMIT (orchestrator, at acceptance): "step 3.1: three tier tokens + six gate pairs (T7) --
# contrast anchor 52 -> 58, all five pins moved; ledger 325 flat / 330 reported"
```

**MANDATED FAIL-FIRST (run BEFORE the commit; restore after each; record each observed failure
line verbatim — a mutation that does not fail is a STOP):**
- **M3.1a** — change `--color-gold: #9a7200;` to `--color-gold: #d4af37;` (a "prettier" gold,
  ratio ≈ 1.9 on the raised surface). `node scripts/check-contrast.mjs` must exit **1** and print
  a `FAIL` line for `gold trophy ring on raised surface`; test 2 and
  `tests/background.test.js:33-36` ("check-contrast exits 0") must both fail. Restore; both pass.
  *(This is the cry-wolf control for the whole T7 gate: it proves the six pairs can fail.)*
- **M3.1b** — delete the two `--color-silver` pairs from `PAIRS`. Test 2 must fail on the count
  (56, not 58) **and** on the missing label. Restore.
- **M3.1c** — move `--color-bronze: #a4622a;` out of `:root` to the end of the file (inside a new
  `.x { }` rule). Test 1 must fail (not inside `:root`), and `check-contrast.mjs` must exit 1
  with `ERROR: token --color-bronze is missing from :root` (its `requireToken`,
  `scripts/check-contrast.mjs:96-102`). Restore.
- **M3.1d** — revert `tests/reader-ui.test.js:105` to `52`. That test must fail. Restore.
  *(Proves the anchor pins are really wired to the gate, not decorative.)*

**FROZEN VALIDATION:** §VAL-P3 verbatim, then, in the SAME file:
```bash
case "$TOTAL"   in 330) ;; *) fail "expected 330 reported tests, got '$TOTAL'";; esac
case "$PLAN"    in 325) ;; *) fail "expected top-level plan 1..325, got '1..$PLAN'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL"  in 330) ;; *) fail "APP_CODE=dummy: expected 330, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"    in 325) ;; *) fail "expected 325 flat tests, got '$FLAT'";; esac
case "$PASSES"  in 58)  ;; *) fail "contrast anchor must be 58 after this step, got '$PASSES'";; esac
case "$PUBN"    in 2371) ;; *) fail "public/ file count must still be 2371 this step, got '$PUBN'";; esac
case "$ENDS" in *"public/styles.css CRLF=508 LF=0"*) ;; *) fail "styles.css must stay CRLF-only and gain exactly 7 lines: $ENDS";; esac
case "$ENDS" in *"scripts/check-contrast.mjs CRLF=0 LF=190"*) ;; *) fail "check-contrast.mjs must stay LF-only and gain exactly 6 lines: $ENDS";; esac
case "$ENDS" in *"tests/trophies-ui.test.js CRLF=0 "*) ;; *) fail "tests/trophies-ui.test.js must be LF-only: $ENDS";; esac
case "$ENDS" in *"tests/quiz-ui.test.js CRLF=0 LF=584"*) ;; *) fail "tests/quiz-ui.test.js line count/endings moved: $ENDS";; esac
case "$ENDS" in *"tests/reader-ui.test.js CRLF=0 LF=224"*) ;; *) fail "tests/reader-ui.test.js line count/endings moved: $ENDS";; esac
case "$ENDS" in *"tests/words-ui.test.js CRLF=0 LF=272"*) ;; *) fail "tests/words-ui.test.js line count/endings moved: $ENDS";; esac
case "$ENDS" in *"README.md CRLF=0 LF=108"*) ;; *) fail "README.md line count/endings moved: $ENDS";; esac
case "$ENDS" in *"public/sw.js CRLF=50 LF=0"*) ;; *) fail "public/sw.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/index.html CRLF=81 LF=0"*) ;; *) fail "public/index.html must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/app.js CRLF=0 LF=65"*) ;; *) fail "public/app.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/views/words.js CRLF=281 LF=0"*) ;; *) fail "words.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/views/reader.js CRLF=749 LF=0"*) ;; *) fail "reader.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"docs/visual-design.md CRLF=0 LF=403"*) ;; *) fail "docs/visual-design.md must be untouched this step: $ENDS";; esac
DELS="$(git diff --numstat HEAD -- tests/quiz-ui.test.js tests/reader-ui.test.js tests/words-ui.test.js README.md | awk '{s+=$2} END{print s+0}')"
case "$DELS" in 4) ;; *) fail "this step's deletion budget is exactly 4 (one line in each of four files), got '$DELS'";; esac
ZERODEL="$(git diff --numstat HEAD -- public/styles.css scripts/check-contrast.mjs | awk '{s+=$2} END{print s+0}')"
case "$ZERODEL" in 0) ;; *) fail "styles.css + check-contrast.mjs must be insert-only, got $ZERODEL deletions";; esac
STALE="$(grep -h -c 'passLines.length, 52' tests/*.js | awk '{s+=$1} END{print s+0}')"
case "$STALE" in 0) ;; *) fail "$STALE stale '52' anchor pins survive in tests/";; esac
NEWPINS="$(grep -h -c 'passLines.length, 58' tests/*.js | awk '{s+=$1} END{print s+0}')"
case "$NEWPINS" in 4) ;; *) fail "expected 4 '58' anchor pins in tests/ (quiz-ui, reader-ui, words-ui, trophies-ui), got '$NEWPINS'";; esac
EXPECT=' M README.md
 M public/styles.css
 M scripts/check-contrast.mjs
 M tests/quiz-ui.test.js
 M tests/reader-ui.test.js
 M tests/words-ui.test.js
?? tests/trophies-ui.test.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```
(Run the block BEFORE the orchestrator's commit; `$PORC` is the pre-commit expectation. The two
line-count pins `styles.css CRLF=508` and `check-contrast.mjs LF=190` are **computable** —
501 + 7 and 184 + 6, counted off the quoted insert blocks line by line — unlike the phase-1 pins
that had to be amended because they assumed bare one-line inserts where the frozen edit carried
a comment. **Every line-count pin in this plan was derived by counting the lines of the block
quoted immediately above it; if an executor's byte counter disagrees, that is a STOP.**)

**NON-GOALS:** no `public/views/trophies.js`, no route, no nav tab, no `sw.js`, no `CACHE` bump,
no touch of `docs/visual-design.md` (step 3.5 owns the doc), no Hebrew anywhere, no new CSS rule
of any kind — only the three tokens, and no `color-mix()` consuming them.

---

# STEP 3.2 — `public/views/trophies.js`: the screen module, not yet reachable (T4)

**GOAL:** the whole screen exists as one importable, DOM-free-at-import module with its own
`VIEW_STYLE`, its own catalogue mirror, its metrics, its tier/progress logic and its card
markup — and seven flat tests that pin all of it, including the anti-drift agreement gate. **No
route, no tab, no `sw.js`.** (Phase 1's precedent: the function lands one step before its call
sites, so a mutation in the logic and a mutation in the wiring are two different failures.)

**TIER:** WORKER. **DEPENDS ON:** 3.1 (the three tokens must exist, because `VIEW_STYLE`
references them by name).

**FILES (exhaustive), with measured endings:**
- `public/views/trophies.js` — CREATE (**LF**, matching `public/app.js` 0/65 and
  `public/views/home.js` 0/93, the two LF views; the CRLF views are the older ones).
- `tests/trophies-ui.test.js` — MODIFY (**LF**). +7 flat tests. 0 deletions.

**THE EXTRACTION SCRIPT COMES FIRST — the Hebrew never passes through a tool-call string.**
Written to `$HOME/trophies-art/build-trophy-names.js` (**outside the repo**, field-guide lesson 4)
and run with `node`. It, in order:
1. reads `.oplan/word-trophies/design.md` as UTF-8 and splits on `String.fromCharCode(10)`;
2. for each of lines **89-96** (1-based; the T3 table body), splits on `|`, trims, takes
   column 1 as the id and column 2 as the name;
3. asserts the eight ids are exactly `chapters, days, streak, known, quizRight, quizzer,
   curious, proven` in that order — and, independently, that they equal
   `TROPHY_CATALOG.map(t => t.id)` imported from `lib/profile.js`;
4. asserts each name's **decimal codepoint sum** equals the SK3-8 table
   (`12052, 8998, 10571, 15046, 16536, 16545, 15042, 13526`) and each length equals
   (`8, 6, 8, 11, 12, 12, 11, 10`) — **a mismatch of one is a STOP, never an adjustment**;
5. reads `.oplan/word-trophies/design.md` line **189**, takes everything after the literal
   ASCII marker `(b) tab label = ` to end of line as the tab label, asserts length **11** and
   decimal codepoint sum **15014**;
6. reads `public/quiz.js`, matches `/\$\{right\}\s(\S+)\s\$\{total\}/` (the `renderQuizDone`
   score line at `quiz.js:205`), takes capture 1 as `<MITOCH>`, asserts length **4** and decimal
   codepoint sum **6007**;
7. writes `public/views/trophies.js` with those **ten** strings inlined as raw UTF-8 (the eight
   names + the tab label, used here as the screen title + the progress word), LF endings, using
   `fs.writeFileSync(path, buf)` on a `Buffer` it built itself — never a heredoc, never a shell
   echo;
8. re-reads the written file and prints, for each of the **ten**, its length and decimal
   codepoint sum from the WRITTEN BYTES. The step report must carry those ten sums, and they
   must equal the SK3-8 table exactly.

**THE MODULE'S FROZEN SHAPE.** Exported names are a contract the tests and steps 3.3/3.4 use:

```js
export const TROPHY_VIEW = [ /* 8 entries, T3 order */ ];   // { id, name, bronze, silver, gold, metric }
export const TROPHY_TIERS_VIEW = ["bronze", "silver", "gold"];
export function tierOf(entry)                 // -> "gold" | "silver" | "bronze" | null
export function nextThreshold(trophy, tier)   // -> number | null   (null iff tier === "gold")
export function progressLine(trophy, profile, tier)  // -> string | ""  (SK3-4)
export function cardHtml(trophy, profile, trophies)  // -> one card's HTML
export function screenHtml(profile)           // -> the whole screen's HTML
export function uncelebrated(profile, read)   // -> [{ id, tier }, ...] in catalogue order
export function maybeCelebrateTrophy(profile) // -> the shown { id, tier } or null   (step 3.4)
export function render(container, ctx)        // -> the T4 entry point
```

Hard rules, frozen:
- **Nothing at module top level touches `document`, `window`, `localStorage` or `navigator`**
  (SK3-6: the module must import in node).
- `TROPHY_VIEW`'s `metric` functions are defensive in the same way `lib/profile.js`'s are: a
  missing `words`, a non-object `story`, a non-numeric counter must yield `0`, never a throw. A
  profile fetch failure must never leave the screen blank — `render` catches and shows the
  existing `.card-subtitle` error line pattern (`public/views/words.js:260-265`), reusing that
  view's already-shipped Hebrew via the same extraction discipline **or** rendering the screen
  with an empty profile (frozen choice: **render the screen from an empty profile**, so every
  trophy simply shows locked at `0` — zero new strings, and a network blip never blanks the page).
- **No progress-bar element and no chart machinery** (T9): the progress line is a `<p>` with
  text. The test asserts the rendered HTML contains no `<progress`, no `<svg` inside a card, no
  `width:` percentage style and no element whose class contains `bar`.
- `alt=""` on every trophy `<img>` — decorative artwork beside its own visible name, exactly the
  existing convention (`public/views/home.js:54`, `public/views/words.js:115`).

**THE FROZEN `VIEW_STYLE` CONTRACT** (exact class names; the CSS body is the executor's, subject
to these rules):
- classes: `.trophies-grid`, `.trophy-card`, `.trophy-art`, `.trophy-name`, `.trophy-progress`,
  and the three tier modifiers `.trophy-card--bronze`, `.trophy-card--silver`,
  `.trophy-card--gold`, plus `.trophy-card--locked`.
- `.trophy-art { width: 96px; height: 96px; aspect-ratio: 1 / 1; object-fit: cover;
  border-radius: 50%; border: 3px solid var(--color-border); }` — **the box is SQUARE and the
  source webps are all 640×640 square, so `object-fit: cover` crops NOTHING.** This is the
  answer to the phase-2 close's warning that `quizRight` is the tightest-cropped of the nine
  (`journal.md:639-645`): the card applies no crop at all, to any of them.
- ring colour per tier: `.trophy-card--bronze .trophy-art { border-color: var(--color-bronze); }`
  and the silver/gold equivalents. **The three tokens are consumed ONLY as `var(--color-…)`,
  never through `color-mix()`** (lesson 5).
- locked: `.trophy-card--locked .trophy-art { filter: grayscale(1); opacity: 0.45; }` — the SAME
  `src`, dimmed (T4: "no separate locked asset"). Its ring stays `var(--color-border)`, a pair
  already gated at 3:1 on card (`scripts/check-contrast.mjs:35`), so this costs zero new pairs.
- everything else uses already-gated tokens: `var(--color-card)`, `var(--color-ink)`,
  `var(--color-muted)`, `var(--radius)`, `var(--shadow-soft)`.
- **no `#`, no `color-mix(`, no `background-image`** anywhere in `VIEW_STYLE`.

**SCREEN ORDER, frozen** (`screenHtml`): the `<style>` tag, then
`<img class="hero-banner" src="/assets/trophies/shelf-header.webp" alt="" />` (SK3-3), then
`<header class="app-header"><h1 class="app-title">TAB_LABEL</h1></header>`, then
`<div class="trophies-grid">` with **eight** `.trophy-card` elements in `TROPHY_VIEW` order.

**The 7 new flat tests — names FROZEN. Ledger after this step: 332 flat / 337 reported.**

3. `'the view catalogue mirrors lib/profile.js TROPHY_CATALOG exactly: ids, order and all 24 thresholds'` —
   the single `deepStrictEqual` of SK3-6, plus `strictEqual(TROPHY_VIEW.length, 8)`, ids unique,
   every `metric` a function, and `bronze < silver < gold` for all 8.
4. `'every view metric agrees with the engine metric over eight shared fixtures'` — the
   anti-drift gate. The eight fixtures, frozen: (a) `{}`; (b) `defaultProfile(NOW)`; (c) a
   profile with 5 `known` words; (d) one with 12 `known`, 3 `learning`, 2 `candidate`;
   (e) one with 4 chapters on one day + words carrying `lastSeen`/`lastQuizAt` on three further
   days (exercises `days` and `streak` together); (f) one crossing a year boundary
   (`2025-12-31, 2026-01-01, 2026-01-31, 2026-02-01`); (g) one with malformed timestamps
   (`'not-a-date'`, `'January 1, 2026'`, `'2026-02-30T00:00:00.000Z'`, `12345`, `null`);
   (h) one where every metric is at or above its gold threshold. For every fixture × every id:
   `strictEqual(view.metric(p), engine.metric(p))`. **Derive nothing by hand here — the
   assertion is agreement, and the hand-derived numbers already live in
   `tests/trophies.test.js` (25 tests, phase 1) for the engine side.**
5. `'tierOf reports the highest earned tier and null when nothing is earned'` — `{}` → `null`;
   `{bronze}` → `'bronze'`; `{bronze,silver}` → `'silver'`; `{bronze,silver,gold}` → `'gold'`;
   **and the never-regress case `{gold}` alone → `'gold'`** (a fabricated higher tier with no
   lower ones, which phase 1 test A3 proves the engine can produce).
6. `'the progress line reads from the live metric, is empty at gold, and starts at the bronze threshold when locked'` —
   SK3-4's three cases against a fixture; the `<MITOCH>` token asserted as `\u` escapes only;
   **negative control:** for a gold-earned trophy `progressLine(...) === ''`; and, for the
   never-regress rule, the same trophy rendered with a LOWER metric than before still shows the
   gold ring (`tierOf` unchanged) while its line stays empty — no "loss" is representable.
7. `'screenHtml emits the shelf-header banner, the title and exactly eight cards in catalogue order, each pointing at its own webp'` —
   count `class="trophy-card"` = 8; the eight `src="/assets/trophies/<id>.webp"` appear in
   `TROPHY_VIEW` order (`indexOf` strictly increasing), camelCase `quizRight.webp` included;
   `src="/assets/trophies/shelf-header.webp"` appears exactly once and BEFORE the first card;
   the title text is the extracted tab label (`\u` escapes).
8. `'a locked trophy is the same artwork dimmed by CSS, never a second asset'` — render a profile
   with `known` at bronze and everything else unearned; assert the locked cards carry
   `trophy-card--locked` and the earned one does not; assert **every** card's `src` is
   `/assets/trophies/<id>.webp` (no `-locked`, no `-grey`, no second path anywhere in the HTML);
   assert `VIEW_STYLE` contains `grayscale(` and `opacity:` under `.trophy-card--locked`.
9. `'the trophies VIEW_STYLE is token-only and the screen has no progress bar or chart'` — extract
   `VIEW_STYLE` with `/const VIEW_STYLE = `([\s\S]*?)`;/` (the exact regex
   `tests/quiz-ui.test.js:490` and `tests/words-ui.test.js:147` use); assert no `#`, no
   `color-mix(`, no `background-image`; assert it references `var(--color-bronze)`,
   `var(--color-silver)`, `var(--color-gold)`; and assert the rendered screen HTML contains no
   `<progress`, no `<canvas`, no `class="` value containing `bar`, and no inline `width:` with a
   `%` (T9's "no progress bars/charts").

**COMMANDS:**
```bash
cd C:/Users/dkreinov/claude/english-app
node "$HOME/trophies-art/build-trophy-names.js"     # writes public/views/trophies.js, prints 11 codepoint sums
node --check public/views/trophies.js
npm test
APP_CODE=dummy npm test
# COMMIT (orchestrator, at acceptance): "step 3.2: the trophies screen module (T4) --
# TROPHY_VIEW mirror + metrics agreement gate + card/ring/locked markup; ledger 332 flat / 337 reported"
```

**MANDATED FAIL-FIRST:**
- **M3.2a** — change `TROPHY_VIEW`'s `days` bronze from `3` to `4`. Test 3 must fail. Restore.
- **M3.2b** — in `TROPHY_VIEW`'s `days` metric, drop `lastSeen` from the union (keep only
  `lastQuizAt`). **Test 4 must fail on fixture (e)** — this is the drift gate proving it can see
  a divergence between the browser copy and the server engine. Restore.
- **M3.2c** — make `progressLine` return `` `${gold} <MITOCH> ${gold}` `` at gold instead of `''`.
  Test 6 must fail. Restore. *(Also proves SK3-4's fallback is a one-expression change.)*
- **M3.2d** — change the locked card's `src` to `/assets/trophies/${id}-locked.webp`. Test 8 must
  fail. Restore. *(The design's "no separate locked asset" made mechanical.)*
- **M3.2e** — put a raw `#a4622a` into `VIEW_STYLE`. Test 9 must fail. Restore.

**FROZEN VALIDATION:** §VAL-P3 verbatim, then:
```bash
case "$TOTAL"   in 337) ;; *) fail "expected 337 reported tests, got '$TOTAL'";; esac
case "$PLAN"    in 332) ;; *) fail "expected top-level plan 1..332, got '1..$PLAN'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL"  in 337) ;; *) fail "APP_CODE=dummy: expected 337, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"    in 332) ;; *) fail "expected 332 flat tests, got '$FLAT'";; esac
case "$PASSES"  in 58)  ;; *) fail "contrast anchor must still be 58, got '$PASSES'";; esac
case "$PUBN"    in 2372) ;; *) fail "public/ must now hold 2372 files (2371 + trophies.js), got '$PUBN'";; esac
case "$ENDS" in *"public/views/trophies.js CRLF=0 "*) ;; *) fail "public/views/trophies.js must be LF-only: $ENDS";; esac
case "$ENDS" in *"public/sw.js CRLF=50 LF=0"*) ;; *) fail "public/sw.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/index.html CRLF=81 LF=0"*) ;; *) fail "public/index.html must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/app.js CRLF=0 LF=65"*) ;; *) fail "public/app.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/views/words.js CRLF=281 LF=0"*) ;; *) fail "words.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/views/reader.js CRLF=749 LF=0"*) ;; *) fail "reader.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/styles.css CRLF=508 LF=0"*) ;; *) fail "styles.css must be untouched this step: $ENDS";; esac
DELS="$(git diff --numstat HEAD -- tests/trophies-ui.test.js | awk '{s+=$2} END{print s+0}')"
case "$DELS" in 0) ;; *) fail "this step is insert-only in tests/trophies-ui.test.js, got $DELS deletions";; esac
UNREACH="$(grep -c 'trophies.js' public/app.js public/sw.js | awk -F: '{s+=$2} END{print s+0}')"
case "$UNREACH" in 0) ;; *) fail "the view must NOT be wired yet (step 3.3 owns that): $UNREACH references";; esac
EXPECT=' M tests/trophies-ui.test.js
?? public/views/trophies.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```

**NON-GOALS:** no `public/app.js`, no `public/index.html`, no `public/sw.js`, no `CACHE` bump, no
celebration code of any kind (step 3.4 owns T5 — `uncelebrated` and `maybeCelebrateTrophy` are
DECLARED in the shape above so 3.3 and 3.4 can name them, but their BODIES land in 3.4), no touch of `public/views/words.js` or `reader.js`, no `lib/`, no
`api/`, no `docs/`, no `awardTrophies` under `public/`, no new asset, no `PRECACHE` entry for any
webp.

---

# STEP 3.3 — the wiring: route, fourth tab, `PRECACHE`, and `CACHE v17 → v18` (T4 + obligation 1)

**GOAL:** the screen becomes reachable. `/trophies` enters `ROUTES`; a fourth nav tab enters
`index.html` after the words tab; `"/views/trophies.js"` enters `PRECACHE` immediately after
`"/views/words.js"`; `CACHE` becomes `magic-vet-v18`; `tests/shell.test.js`'s two pins move in
the same step (lesson 7). Plus the SK2-7 asset test the whole run has been deferring.

**TIER:** WORKER. **DEPENDS ON:** 3.2 (`public/views/trophies.js` must exist and export
`render`, or `app.js`'s static import breaks the `node --check` sweep and the browser).

**FILES (exhaustive), with measured endings:**
- `public/app.js` — MODIFY (**LF**, 0/65). Two inserts, 0 deletions.
- `public/index.html` — MODIFY (**CRLF**, 81/0). One insert, 0 deletions.
- `public/sw.js` — MODIFY (**CRLF**, 50/0 — **SK3-1: the field guide says LF and is WRONG**).
  One replaced line + one inserted line. 1 deletion.
- `tests/shell.test.js` — MODIFY (**LF**, 0/94). One replaced line + one inserted line.
  1 deletion.
- `tests/trophies-ui.test.js` — MODIFY (**LF**). +3 flat tests. 0 deletions.

**Edit 1 — `public/app.js`, after line 3.** Anchor, quoted exactly (`:1-4`):
```js
import { render as renderHome } from "./views/home.js";
import { render as renderPlacement } from "./views/placement.js";
import { render as renderReader } from "./views/reader.js";
import { render as renderWords } from "./views/words.js";
```
becomes the same four lines with one inserted between the third and fourth:
```js
import { render as renderTrophies } from "./views/trophies.js";
```
(Alphabetical, matching the existing order. `tests/parent-ui.test.js:80` forbids
`from "./views/parent.js"` in `app.js` — `trophies.js` is a different string and is unaffected.)

**Edit 2 — `public/app.js`, inside `ROUTES`.** Anchor, quoted exactly (`:6-11`):
```js
const ROUTES = {
  "/home": renderHome,
  "/placement": renderPlacement,
  "/reader": renderReader,
  "/words": renderWords,
};
```
becomes the same block with `  "/trophies": renderTrophies,` inserted between `"/reader"` and
`"/words"` (alphabetical again; nothing pins `ROUTES`' order — grepped). `OWNER_ROUTE` at `:13`
and `DEFAULT_ROUTE` at `:15` are untouched, so `/parent` stays out of `ROUTES` and invisible, and
`/placement` — which is in `ROUTES` but has no tab — stays tab-less.

**Edit 3 — `public/index.html`, between lines 76 and 77.** Anchor, quoted exactly (`:70-77`):
```html
      <a class="nav-tab" href="#/words" data-route="/words">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="4.5" y="4" width="15" height="16" rx="2" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.6" />
          <path d="M8 8.5h8M8 12h8M8 15.5h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <span>[the words label]</span>
      </a>
    </nav>
```
becomes the same, with this block inserted after the words tab's `</a>` and before `</nav>` —
**every inserted line CRLF-terminated**:
```html

      <a class="nav-tab" href="#/trophies" data-route="/trophies">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M8 5.5H6.2A2.2 2.2 0 0 0 6.2 9.9H7M16 5.5h1.8A2.2 2.2 0 0 1 17.8 9.9H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          <path d="M12 13v3.5M8.5 19.5h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <span>TAB_LABEL</span>
      </a>
```
`TAB_LABEL` is **not typed**: it is written by the same extraction script pattern as step 3.2
(read `design.md:189` after the marker `(b) tab label = `, assert length 11 and decimal
codepoint sum **15014**, write the bytes, re-read and re-sum). The icon matches the three
existing tabs measured at `index.html:26-76`: `viewBox="0 0 24 24"`, `fill="none"`,
`aria-hidden="true"`, `stroke="currentColor"`, `stroke-width="1.6"`, `fill="currentColor"` with
`fill-opacity="0.15"` on the body shape — a trophy cup with two handles, a stem and a base. It
inherits size (24×24) and colour from `.nav-tab svg` (`public/styles.css:351-355`) and
`.nav-tab.active` (`:357-360`), so it costs **zero** new CSS and zero new contrast pairs
(`--color-muted`/`--color-nav` and `--color-primary`/`--color-nav` are already gated at
`scripts/check-contrast.mjs:14` and `:17`).

**Edit 4 — `public/sw.js:1`, quoted exactly:**
```js
const CACHE = "magic-vet-v17";
```
becomes
```js
const CACHE = "magic-vet-v18";
```

**Edit 5 — `public/sw.js`, between lines 14 and 15.** Anchor, quoted exactly (`:13-16`):
```js
  "/views/reader.js",
  "/views/words.js",
  "/manifest.webmanifest",
  "/icons/icon.svg"
```
becomes
```js
  "/views/reader.js",
  "/views/words.js",
  "/views/trophies.js",
  "/manifest.webmanifest",
  "/icons/icon.svg"
```
**No trophy webp is added** — design §2(iv)/T6: artwork is runtime-fetched and never cached
(carried obligation 3). **Both `sw.js` edits are CRLF.**

**Edit 6 — `tests/shell.test.js:58`, quoted exactly:**
```js
  assert.ok(sw.includes('magic-vet-v17'));
```
becomes
```js
  assert.ok(sw.includes('magic-vet-v18'));
  assert.ok(!sw.includes('magic-vet-v17'), 'the old cache name must be gone, not merely joined');
```
(An added negative control — the QZ-22 failure mode is a stale shell, and `includes` alone would
pass if both names were present. This adds a line, not a test: it sits inside the existing
`test('sw.js has the expected cache name…')` at `:56`, so the ledger does not move for it.)

**Edit 7 — `tests/shell.test.js`, inside the `deepStrictEqual` at `:64-79`.** Anchor, quoted
exactly (`:75-77`):
```js
    '/views/words.js',
    '/manifest.webmanifest',
    '/icons/icon.svg',
```
becomes
```js
    '/views/words.js',
    '/views/trophies.js',
    '/manifest.webmanifest',
    '/icons/icon.svg',
```
The existence loop at `:81-85` then also proves `public/views/trophies.js` is on disk.

**The 3 new flat tests — names FROZEN. Ledger after this step: 335 flat / 340 reported.**

10. `'app.js routes /trophies to the trophies view, keeps /placement tab-less and keeps /parent out of ROUTES'` —
    read `public/app.js`; assert it contains
    `import { render as renderTrophies } from "./views/trophies.js";` and
    `"/trophies": renderTrophies,`; assert it still contains `const OWNER_ROUTE = "/parent";` and
    `import("./views/parent.js")` and does NOT contain `"/parent":`; assert `"/placement":`
    is present in `ROUTES` while `data-route="/placement"` is absent from `index.html`
    (the tab-less route, made mechanical).
11. `'index.html carries exactly four nav tabs and the trophies tab is last, after the words tab'` —
    read `public/index.html`; assert `class="nav-tab"` occurs exactly **4** times (3 measured
    today + 1); assert `indexOf('data-route="/trophies"') > indexOf('data-route="/words"')`
    (T4's DOM order, as an ordering assertion not a hope); assert the trophies `<a>` block
    contains `href="#/trophies"`, `viewBox="0 0 24 24"`, `stroke-width="1.6"` and
    `fill-opacity="0.15"`; assert its `<span>` text equals the extracted label (`\u` escapes);
    **negative controls:** `#/parent` still absent and `data-route="/parent"` still absent
    (the same two assertions `tests/parent-access.test.js:37-38` makes, restated here so a
    fourth tab can never smuggle the parent door in).
12. `'every trophy id has its own webp on disk, all nine are distinct, and none of them is precached'` —
    the SK2-7 asset test, finally landing in the phase that references the files. For each id in
    `TROPHY_CATALOG` (imported from `../lib/profile.js`) assert
    `public/assets/trophies/<id>.webp` exists (camelCase `quizRight.webp` included); assert
    `public/assets/trophies/shelf-header.webp` exists; assert the directory holds exactly **9**
    files; assert all nine md5s are **distinct** from each other **and** from the eight existing
    `public/assets/*.webp`; and assert `public/sw.js`'s `PRECACHE` array contains **no** entry
    matching `/assets/trophies/` (carried obligation 3, T6). *(Sizes are not asserted — that
    would re-pin bytes phase 2 already gated and re-verified at its close.)*

    **P3-AMENDMENT #1 (orchestrator, post-review — MANDATORY, this is the whole point of the
    test).** `existsSync` is NOT case-sensitive on this machine and therefore cannot police the
    frozen camelCase. Measured 2026-07-30 in this repo:
    `fs.existsSync("public/assets/trophies/quizright.webp")` returns **`true`** while the real
    file is `quizRight.webp`. So the per-id existence loop above would pass a mis-cased file —
    and Vercel serves from a **case-SENSITIVE Linux** filesystem, so `/assets/trophies/quizRight.webp`
    would 404 on her phone in phase 4 while every local test stayed green. That is precisely the
    class of bug this test exists to prevent, and as written it cannot see it.
    **Therefore the test MUST additionally assert, case-exactly:**
    ```js
    const got = readdirSync("public/assets/trophies").sort();
    const want = ["chapters","curious","days","known","proven","quizRight","quizzer","shelf-header","streak"]
      .map((n) => n + ".webp").sort();
    assert.deepStrictEqual(got, want);
    ```
    `readdirSync` returns the true on-disk spelling and is case-exact on every platform (verified:
    the listing contains `quizRight.webp` and does **not** contain `quizright.webp`). This
    subsumes the "exactly 9 files" assertion. The per-id `existsSync` loop may stay as
    documentation of intent, but it is NOT the gate — the `deepStrictEqual` is.
    **Fail-first M3.3e (added):** rename one derivative to all-lowercase, confirm the
    `deepStrictEqual` fails **and** that the old `existsSync` loop still passes (proving the
    amendment is load-bearing), then restore and re-verify the nine md5s.

**COMMANDS:**
```bash
cd C:/Users/dkreinov/claude/english-app
node --check public/app.js
node --check public/views/trophies.js
npm test
APP_CODE=dummy npm test
# COMMIT (orchestrator, at acceptance): "step 3.3: wire /trophies -- route, 4th nav tab,
# PRECACHE + CACHE magic-vet-v18, asset test (SK2-7); ledger 335 flat / 340 reported"
```

**MANDATED FAIL-FIRST:**
- **M3.3a** — revert `public/sw.js:1` to `magic-vet-v17`. `tests/shell.test.js`'s cache test must
  fail on BOTH new assertions. Restore.
- **M3.3b** — move `"/views/trophies.js"` in `PRECACHE` to before `"/views/words.js"`. The
  `deepStrictEqual` at `tests/shell.test.js:64-79` must fail on order. Restore. *(T4 pins the
  position, not merely the membership.)*
- **M3.3c** — move the new `<a class="nav-tab" href="#/trophies" …>` block ABOVE the words tab.
  Test 11 must fail on the ordering assertion. Restore.
- **M3.3d** — rename `public/assets/trophies/quizRight.webp` to `quizright.webp`. Test 12 must
  fail. Restore the name exactly. *(The camelCase trap named in carried obligation 2; on a
  case-insensitive Windows filesystem this rename may be a no-op — if the test still passes,
  instead temporarily move the file aside to `$HOME/trophies-val/` and confirm the failure, then
  restore. **This is the one mutation whose mechanism must be reported explicitly.**)*
- **M3.3e** — add `"/assets/trophies/chapters.webp"` to `PRECACHE`. Both the `deepStrictEqual`
  and test 12's no-artwork-in-PRECACHE assertion must fail. Restore.

**FROZEN VALIDATION:** §VAL-P3 verbatim, then:
```bash
case "$TOTAL"   in 340) ;; *) fail "expected 340 reported tests, got '$TOTAL'";; esac
case "$PLAN"    in 335) ;; *) fail "expected top-level plan 1..335, got '1..$PLAN'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL"  in 340) ;; *) fail "APP_CODE=dummy: expected 340, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"    in 335) ;; *) fail "expected 335 flat tests, got '$FLAT'";; esac
case "$PASSES"  in 58)  ;; *) fail "contrast anchor must still be 58, got '$PASSES'";; esac
case "$PUBN"    in 2372) ;; *) fail "public/ must hold 2372 files, got '$PUBN'";; esac
case "$ENDS" in *"public/sw.js CRLF=51 LF=0"*) ;; *) fail "sw.js must stay CRLF-ONLY and gain exactly one line (SK3-1: the field guide says LF and is WRONG): $ENDS";; esac
case "$ENDS" in *"public/index.html CRLF=90 LF=0"*) ;; *) fail "index.html must stay CRLF-only and gain exactly 9 lines: $ENDS";; esac
case "$ENDS" in *"public/app.js CRLF=0 LF=67"*) ;; *) fail "app.js must stay LF-only and gain exactly 2 lines: $ENDS";; esac
case "$ENDS" in *"tests/shell.test.js CRLF=0 LF=96"*) ;; *) fail "shell.test.js must stay LF-only and gain exactly 2 lines: $ENDS";; esac
case "$ENDS" in *"public/views/trophies.js CRLF=0 "*) ;; *) fail "trophies.js must stay LF-only: $ENDS";; esac
case "$ENDS" in *"public/views/words.js CRLF=281 LF=0"*) ;; *) fail "words.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/views/reader.js CRLF=749 LF=0"*) ;; *) fail "reader.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/styles.css CRLF=508 LF=0"*) ;; *) fail "styles.css must be untouched this step: $ENDS";; esac
SW17="$(grep -c 'magic-vet-v17' public/sw.js tests/shell.test.js | awk -F: '{s+=$2} END{print s+0}')"
case "$SW17" in 1) ;; *) fail "expected exactly 1 remaining 'magic-vet-v17' (the negative-control assertion in shell.test.js), got '$SW17'";; esac
ARTPRE="$(grep -c 'assets/trophies' public/sw.js | tr -d ' ')"
case "$ARTPRE" in 0) ;; *) fail "trophy artwork must never enter sw.js (carried obligation 3), found $ARTPRE";; esac
DELS="$(git diff --numstat HEAD -- public/sw.js tests/shell.test.js | awk '{s+=$2} END{print s+0}')"
case "$DELS" in 2) ;; *) fail "this step's deletion budget is exactly 2 (the CACHE line in each file), got '$DELS'";; esac
ZERODEL="$(git diff --numstat HEAD -- public/app.js public/index.html tests/trophies-ui.test.js | awk '{s+=$2} END{print s+0}')"
case "$ZERODEL" in 0) ;; *) fail "app.js, index.html and trophies-ui.test.js must be insert-only, got $ZERODEL deletions";; esac
TABS="$(grep -c 'class=\"nav-tab\"' public/index.html | tr -d ' ')"
case "$TABS" in 4) ;; *) fail "index.html must carry exactly 4 nav tabs, got '$TABS'";; esac
EXPECT=' M public/app.js
 M public/index.html
 M public/sw.js
 M tests/shell.test.js
 M tests/trophies-ui.test.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```
(The three `$ENDS` line-count pins are computable: `sw.js` 50 + 1 (one line replaced, one added);
`index.html` 81 + 9 (one blank + eight markup lines); `app.js` 65 + 2; `shell.test.js` 94 + 2.
**If an executor's byte counter disagrees with any of these, that is a STOP, not an adjustment** —
it means the insert did not have the shape this plan froze.)

**NON-GOALS:** no `styles.css`, no `views/words.js`, no `views/reader.js`, no celebration code,
no `lib/`, no `api/`, no `docs/`, no `README.md`, no new asset, no npm script, no
`.gitattributes`, no second bump (`magic-vet-v18` is the only value this run ever writes), no
webp in `PRECACHE`, no `/parent` tab, no `/placement` tab.

---

# STEP 3.4 — the celebration (T5), hooked at exactly three moments

**GOAL:** `public/views/trophies.js` gains `uncelebrated` and `maybeCelebrateTrophy`; the two
views call it at the three moments design T5 names and nowhere else; `public/quiz.js` and
`public/quiz-core.js` are not touched by a single byte.

**TIER:** WORKER. **DEPENDS ON:** 3.3 (the screen must be reachable and its module wired, so a
celebration can be seen in the step-3.6 gate).

**FILES (exhaustive), with measured endings:**
- `public/views/trophies.js` — MODIFY (**LF**). Append-only: the two functions + the overlay
  markup + the overlay CSS inside the existing `VIEW_STYLE`. 0 deletions.
- `public/views/words.js` — MODIFY (**CRLF**, 281/0). Two edits: one import line inserted, one
  `onDone` line replaced. **1 deletion.**
- `public/views/reader.js` — MODIFY (**CRLF**, 749/0). Three edits: one import line inserted, one
  helper inserted, one `onDone` line replaced, one call inserted in `runGenerate`.
  **1 deletion.**
- `tests/trophies-ui.test.js` — MODIFY (**LF**). +5 flat tests. 0 deletions.

**Edit 1 — `public/views/trophies.js`, append.** The two functions, whose CONTRACT is frozen:

```js
// T5. Returns every (id, tier) present in the profile that this phone has not
// recorded in localStorage, in TROPHY_VIEW order then bronze/silver/gold order.
// `read` is injected so the test never needs a DOM.
export function uncelebrated(profile, read)

// T5 + SK3-10 as amended by P3-AMENDMENT #2 (owner ruling). Shows exactly ONE
// overlay -- the FIRST entry uncelebrated() returns -- and marks ONLY THAT ONE
// celebrated. The backlog drains one per earning moment; it is never discarded.
// Returns the shown { id, tier } or null. Every localStorage access is wrapped in try/catch (the
// public/api.js:3-9 precedent); a storage throw means "not celebrated, and could
// not record it" and must never break the screen or the quiz.
export function maybeCelebrateTrophy(profile)
```
* the storage key is **exactly** `` `trophyCelebrated:${id}:${tier}` `` and the value is
  `new Date().toISOString()` (design T5, quoted verbatim in FROZEN CONTRACTS);
* the overlay is built with `document.createElement`, given class `trophy-celebrate`, and
  appended with `document.body.appendChild(overlay)` — the `public/api.js:44` precedent — so it
  survives the active view re-rendering its own `container.innerHTML`;
* it contains the trophy's artwork `<img class="trophy-celebrate-art trophy-art" src="/assets/trophies/<id>.webp" alt="" />`
  carrying the tier ring class, and the trophy's **name** (T5: "artwork + name + tier"; the tier
  IS the ring, SK3-8 — no tier word is authored);
* **one tap anywhere on the overlay dismisses it** (`overlay.addEventListener("click", () =>
  overlay.remove())`), matching `public/views/reader.js:713-719`'s overlay-dismiss precedent;
* **no sound** (T9), **no `<audio>`, no `new Audio(`** anywhere in the celebration path;
* if `document` is undefined (i.e. under node), `maybeCelebrateTrophy` still performs the
  bookkeeping through the injected reader/writer and returns the selection **without** touching
  the DOM — that is how tests 13-15 run headlessly.

**Edit 2 — `public/views/trophies.js`, inside the existing `VIEW_STYLE`.** Appended rules:
`.trophy-celebrate { position: fixed; inset: 0; z-index: 90; display: flex; align-items: center;
justify-content: center; padding: 24px 16px; }` and `.trophy-celebrate-card { … }`. **z-index 90
is deliberate: below the entry-code gate's `z-index: 100` (`public/styles.css:413`), above the
bottom nav's `z-index: 10` (`:331`)** — a celebration must never cover the login gate.
Reduced motion, the `public/views/reader.js:110` precedent:
```css
  @media (prefers-reduced-motion: reduce) {
    .trophy-celebrate-card { animation: none; transition: none; }
  }
```
Still no `#`, no `color-mix(`, no `background-image` (test 9 from step 3.2 re-runs over the
grown `VIEW_STYLE` and covers this for free).

**Edit 3 — `public/views/words.js`, import.** Insert after `:5`, quoted exactly (`:1-5`):
```js
import { getJson, postJson } from "../api.js";
import { resolveLemma } from "../lemma.js";
import { getAllowedSet } from "../words-index.js";
import { startQuiz } from "../quiz.js";
import { pickQuizWords, knownSetFromProfile, pickCandidateWords } from "../quiz-core.js";
```
add, CRLF-terminated:
```js
import { maybeCelebrateTrophy } from "./trophies.js";
```

**Edit 4 — `public/views/words.js:249`, quoted exactly** (in context `:243-252`):
```js
      quizBtn.addEventListener("click", () => {
        startQuiz(container, {
          lemmas,
          knownSet: knownSetFromProfile(profile),
          candidateSet,
          count: 4,
          onDone: () => boot(),
        });
      });
```
becomes
```js
      quizBtn.addEventListener("click", () => {
        startQuiz(container, {
          lemmas,
          knownSet: knownSetFromProfile(profile),
          candidateSet,
          count: 4,
          // T5. boot() already re-reads /api/profile, so the post-award profile is
          // in hand -- no extra request. total > 0 skips the no-questions path
          // (quiz.js:247-250 fires onDone with NO done screen), and the
          // celebration NEVER goes inside renderQuizDone (QZ-18 frozen).
          onDone: async ({ total }) => {
            await boot();
            if (total > 0) maybeCelebrateTrophy(profile);
          },
        });
      });
```
**Exactly one line is deleted** (`          onDone: () => boot(),`).

**Edit 5 — `public/views/reader.js`, import.** Insert after `:5` (the last `../quiz-core.js`
import), CRLF-terminated:
```js
import { maybeCelebrateTrophy } from "./trophies.js";
```

**Edit 6 — `public/views/reader.js`, a helper inserted immediately after `runGenerate` (after
`:388`), CRLF-terminated:**
```js
  // T5 + SK3-2. api/chapter.js:66 returns { chapter } and NO profile, so the
  // phone asks once. Read into a LOCAL: reassigning the module-scope `profile`
  // here would silently change what latestChapter(), decideStage() and the
  // already-computed lemmas/knownSet see. A profile provably exists by now
  // (the server just saved one), so this GET creates nothing.
  async function celebrateFromServer() {
    let fresh;
    try {
      fresh = await getJson("/api/profile");
    } catch (err) {
      return;
    }
    maybeCelebrateTrophy(fresh);
  }
```

**Edit 7 — `public/views/reader.js:739`, quoted exactly** (in context `:734-744`):
```js
        startQuiz(slot, {
          lemmas,
          knownSet,
          candidateSet,
          count: 4,
          onDone: () => {
            qs.done = true;
            draw();
          },
        });
```
becomes the same with the callback line replaced:
```js
          onDone: async ({ total }) => {
            qs.done = true;
            draw();
            if (total > 0) await celebrateFromServer();
          },
```
**Exactly one line is deleted** (`          onDone: () => {`). **`qs` keeps its exact
`{ started, done }` shape — `tests/reader-ui.test.js:189-202` deepStrictEquals it at `:192-196`
and no "celebrated" flag may be added there** (measured; that is why the celebration's memory
lives in `localStorage`, not in `quizState`).

**Edit 8 — `public/views/reader.js`, inside `runGenerate`.** Anchor, quoted exactly (`:378-382`):
```js
      const { chapter } = await postJson("/api/chapter", { action: "generate" });
      profile.story.chapters.push(chapter);
      generating = false;
      stage = "chapter";
      draw();
```
becomes the same five lines with one appended after `draw();`:
```js
      await celebrateFromServer();
```
(T5's "the reader's chapter-done stage". No `total` guard: a generated chapter is not a quiz.)

**The 5 new flat tests — names FROZEN. Ledger after this step: 340 flat / 345 reported.**

13. `'uncelebrated lists every unrecorded earned tier in catalogue then bronze-silver-gold order'` —
    injected `read`; a profile with `{ known: {bronze, silver}, chapters: {bronze} }` and an
    empty store → `[{id:'chapters',tier:'bronze'},{id:'known',tier:'bronze'},{id:'known',tier:'silver'}]`
    (`chapters` precedes `known` in `TROPHY_VIEW`); an unknown trophy id in the profile is
    IGNORED (forward compatibility, T1) and must not appear.
14. `'maybeCelebrateTrophy shows exactly one overlay per pass and drains the backlog one at a time'` —
    SK3-10 as amended by P3-AMENDMENT #2. Four uncelebrated tiers in (the REAL day-one set:
    `days`, `streak`, `known`, `curious`, all bronze) → the return value is the FIRST in
    `TROPHY_VIEW` × `TROPHY_TIERS` order and the injected writer received **exactly ONE** key,
    named `trophyCelebrated:<id>:<tier>` with a parseable ISO value. Feeding that key back into
    the reader and calling again returns the **SECOND**, writing exactly one more — and so on
    through all four; the fifth call returns `null` and writes nothing. This is the drain, and it
    is the whole point of the amendment. **Negative controls:** a profile with `trophies: {}`
    returns `null` and writes nothing; and the writer must NEVER receive a key for a tier that
    was not the one shown (assert the written key equals the returned selection, every call).
15. `'a localStorage failure never breaks the celebration path'` — a reader that throws and a
    writer that throws; `maybeCelebrateTrophy` must return without throwing, and with a throwing
    reader it must treat the tier as uncelebrated (fail towards showing, never towards crashing).
16. `'the celebration is hooked at exactly the three designed moments, guarded on total > 0, and never inside renderQuizDone'` —
    a source-needle test over `public/views/words.js`, `public/views/reader.js`,
    `public/quiz.js`, `public/quiz-core.js` and every other `.js` under `public/` (reuse
    `tests/shell.test.js:33-45`'s `listJsFiles`): `maybeCelebrateTrophy(` appears **exactly
    once** in `words.js`, **exactly once** in `reader.js` (inside `celebrateFromServer`),
    **zero** times in `quiz.js`, **zero** in `quiz-core.js`, **zero** in `views/home.js`,
    `views/placement.js`, `views/parent.js`, `api.js`; `celebrateFromServer()` is called
    **exactly twice** in `reader.js`; both `onDone` callbacks contain `total > 0`;
    `reader.js` contains `{ started: false, done: false }` unchanged and no `celebrated`
    property on `quizState`; and `quiz.js` still contains its two frozen `renderQuizDone` text
    nodes and no celebration identifier.
17. `'the celebration honours reduced motion, adds no sound, and sits below the entry-code gate'` —
    `VIEW_STYLE` contains `@media (prefers-reduced-motion: reduce)` and a
    `.trophy-celebrate-card` rule inside it; `z-index: 90` appears in the `.trophy-celebrate`
    rule and `100` does not; the trophies module contains no `new Audio(`, no `<audio`, no
    `.play(`; and the overlay markup contains the trophy's artwork `src` plus its name and no
    tier WORD (assert the module's Hebrew inventory is exactly the ten strings of SK3-8, by
    counting distinct Hebrew runs — `\u` escapes only in this test file).

**COMMANDS:**
```bash
cd C:/Users/dkreinov/claude/english-app
node --check public/views/trophies.js
node --check public/views/words.js
node --check public/views/reader.js
npm test
APP_CODE=dummy npm test
# COMMIT (orchestrator, at acceptance): "step 3.4: trophy celebration (T5) -- one overlay,
# localStorage memory, three designed hooks, quiz.js untouched; ledger 340 flat / 345 reported"
```

**MANDATED FAIL-FIRST:**
- **M3.4a** — drop the `total > 0` guard in `public/views/words.js`. Test 16 must fail.
  Restore. *(The no-questions path, `quiz.js:247-250`, made mechanical.)*
- **M3.4b** — make `maybeCelebrateTrophy` mark only the tier it showed. Test 14 must fail on the
  six-keys assertion. Restore. *(SK3-10's parade guard.)*
- **M3.4c** — remove the `try/catch` around the localStorage read. Test 15 must fail (it throws).
  Restore.
- **M3.4d** — add `maybeCelebrateTrophy(...)` inside `renderQuizDone` in `public/quiz.js`.
  Test 16 must fail **and** §VAL-P3's `public/quiz.js` md5 assertion must fail. Restore, then
  re-verify the md5 is `69b6d71117cf776715374abc6f0abb02` **before** continuing.
- **M3.4e** — in `reader.js`, change `celebrateFromServer` to assign `profile = await
  getJson(...)` instead of a local. Test 16's "exactly twice" still passes, so this mutation is
  checked by a DIFFERENT assertion: test 16 additionally asserts `reader.js` contains
  `celebrateFromServer` with the literal `let fresh;` and does **not** contain
  `profile = await getJson("/api/profile")` anywhere outside `boot()`. That assertion must fail.
  Restore. *(SK3-2's "never reassign the module-scope profile", made mechanical.)*

**FROZEN VALIDATION:** §VAL-P3 verbatim, then:
```bash
case "$TOTAL"   in 345) ;; *) fail "expected 345 reported tests, got '$TOTAL'";; esac
case "$PLAN"    in 340) ;; *) fail "expected top-level plan 1..340, got '1..$PLAN'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL"  in 345) ;; *) fail "APP_CODE=dummy: expected 345, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"    in 340) ;; *) fail "expected 340 flat tests, got '$FLAT'";; esac
case "$PASSES"  in 58)  ;; *) fail "contrast anchor must still be 58, got '$PASSES'";; esac
case "$PUBN"    in 2372) ;; *) fail "public/ must hold 2372 files, got '$PUBN'";; esac
case "$ENDS" in *"public/views/words.js CRLF=0"*) fail "words.js LOST its CRLF endings -- lesson 4 damage, invisible to git diff: $ENDS";; esac
case "$ENDS" in *"public/views/words.js CRLF="*" LF=0"*) ;; *) fail "words.js must stay CRLF-ONLY: $ENDS";; esac
case "$ENDS" in *"public/views/reader.js CRLF="*" LF=0"*) ;; *) fail "reader.js must stay CRLF-ONLY: $ENDS";; esac
case "$ENDS" in *"public/views/trophies.js CRLF=0 "*) ;; *) fail "trophies.js must stay LF-only: $ENDS";; esac
case "$ENDS" in *"public/sw.js CRLF=51 LF=0"*) ;; *) fail "sw.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/index.html CRLF=90 LF=0"*) ;; *) fail "index.html must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/app.js CRLF=0 LF=67"*) ;; *) fail "app.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/styles.css CRLF=508 LF=0"*) ;; *) fail "styles.css must be untouched this step: $ENDS";; esac
DELS="$(git diff --numstat HEAD -- public/views/words.js public/views/reader.js | awk '{s+=$2} END{print s+0}')"
case "$DELS" in 2) ;; *) fail "this step's deletion budget is exactly 2 (one onDone line in each view), got '$DELS'";; esac
ZERODEL="$(git diff --numstat HEAD -- public/views/trophies.js tests/trophies-ui.test.js | awk '{s+=$2} END{print s+0}')"
case "$ZERODEL" in 0) ;; *) fail "trophies.js and trophies-ui.test.js must be insert-only, got $ZERODEL deletions";; esac
NOSOUND="$(grep -c 'new Audio(' public/views/trophies.js | tr -d ' ')"
case "$NOSOUND" in 0) ;; *) fail "T9: no sound in v1, found $NOSOUND Audio constructions";; esac
EXPECT=' M public/views/reader.js
 M public/views/trophies.js
 M public/views/words.js
 M tests/trophies-ui.test.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```
(`words.js` and `reader.js` line counts are deliberately NOT pinned here — the inserts carry
multi-line comments whose exact length is the executor's. What IS pinned is the thing that
matters and that git cannot see: **`LF=0`, i.e. the files are still CRLF-only.** The frozen
quiz-file md5s in §VAL-P3 are the other half of that guarantee.)

**NON-GOALS:** no touch of `public/quiz.js` or `public/quiz-core.js` (frozen, md5-gated every
step), no `renderQuizDone` change, no fourth hook (SK3-11 — the `mark-known` response is
deliberately not used), no sound, no push, no server-side celebration state, no `lib/`, no
`api/`, no new API route, no `styles.css`, no `sw.js`, no `index.html`, no `app.js`, no
`docs/`, no `quizState` shape change.

---

# STEP 3.5 — T10: the dated, additive palette truth-fix in `docs/visual-design.md`

**GOAL:** the document that governs this app's art stops recording a palette the app has not
used since 2026-07-24, and stops implying the contrast gate is 52 pairs — **without deleting or
rewriting one existing byte** (SK3-9).

**TIER:** WORKER. **DEPENDS ON:** 3.1 (the anchor must already be 58 for the second correction
to be true).

**FILES (exhaustive):** `docs/visual-design.md` — MODIFY (**LF**, 0/403 today). Two additive
inserts. **0 deletions.**

Owner approval is already granted: `design.md:203` signs T10 "as written", and `design.md:161-165`
is the instruction. Design §2(ix) (`design.md:45-48`) is the record of the discrepancy:
> "docs/visual-design.md §3 (FROZEN 2026-07-24) still records the warm-DARK palette (#241305 bg
> era); styles.css and tests/background.test.js moved to Sunrise Parchment. The doc's §2 style
> direction and §6 style suffix remain valid; §3 is stale."

**Edit 1 — insert immediately AFTER `docs/visual-design.md:36`**, the §3 heading, quoted exactly:
```
## 3. Color palette (tokens to artwork) — AMENDED 2026-07-24
```
Insert a dated correction block in the `docs/growth.md:113` style — additive, ASCII except where
it must quote a token name, no existing line touched. It must state, at minimum:
* that **`public/styles.css` is the source of truth** for every token value, and this section is
  a historical record of the sampling method, not a live specification;
* that the live palette since the visual-polish run is **Sunrise Parchment**, a LIGHT warm
  ground, not the warm-dark ground the table below records;
* the live values **read from `public/styles.css:1-24` at correction time**, at minimum
  `--color-bg: #fff4e2`, `--color-card: #fffaf0`, `--color-surface-2: #fdeed6`,
  `--color-ink: #3a2412`, `--color-primary: #7b3fb5`, `--color-teal: #086055`,
  `--color-accent: #8a5600`, `--color-border: #96682f`, `--color-nav: #fff8ec`,
  `--color-muted: #7a5a3c`, `--color-danger: #b3341c`, `--color-glow: #ffd98a`,
  `--color-bg-top: #ffe9c9`, `--color-bg-glow-violet: #f3e4fb`,
  `--color-bg-glow-teal: #dff4ee`, `--color-bg-glow-amber: #ffe4b5`, `--radius: 22px`;
* the **three new tier tokens** `--color-bronze: #a4622a`, `--color-silver: #6f6a63`,
  `--color-gold: #9a7200` and what they are for (non-text trophy rings, WCAG 1.4.11 3:1);
* that `tests/background.test.js:12-18` byte-pins the four background paint tokens, so the doc
  can go stale again but the CSS cannot drift silently;
* the date **2026-07-30** and the run name **word-trophies phase 3, T10**.

**The values must be READ FROM `public/styles.css` BY THE EDIT, not copied from this plan.**
The seventeen hexes above are what this planner measured today; the executor re-reads them and
STOPS if any differs (lesson 2: never verify against your own re-implementation, and never
transcribe a value you can extract).

**Edit 2 — insert immediately AFTER `docs/visual-design.md:136`**, i.e. after the sentence that
ends `and must exit 0.` and before the blank line preceding `## 4. Typography` at `:138`. The
existing line `:135` — `enforces this mechanically over 52 pairs, reads its token values live
from public/styles.css,` — **is NOT edited** (SK3-9). Append one dated correction line stating
that as of 2026-07-30 (word-trophies phase 3, T7) the gate covers **58** pairs: the original 52
plus six non-text 3:1 pairs for `--color-bronze`, `--color-silver` and `--color-gold` against
`--color-card` and `--color-surface-2`, with the measured ratios
**4.63 / 4.22 / 5.15 / 4.69 / 4.22 / 3.84**.

**The four things this step must not touch, each with its citation:**
* `### FROZEN STYLE SUFFIX` at `docs/visual-design.md:216` and its five blockquote lines — the
  388-byte / md5 `51b97a774dc52aa272850bb686c22188` contract (`phase-state.md:66-68`).
* The nine trophy prompt bodies at `:279`+ and the nine inventory rows at `:197`+ — phase 2's
  step 2.5 output, gated by that step's exact-match test.
* Any existing line of §3's tables (`:48-66`, `:73-77`) or of `### Superseded` (`:108`+).
* The chat URL at `:266`.

**The 1 new flat test — name FROZEN. Ledger after this step: 341 flat / 346 reported.**

18. `'docs/visual-design.md carries the dated palette correction, cites styles.css as the source of truth, and records the 58-pair gate'` —
    read `docs/visual-design.md` AND `public/styles.css`; parse the `:root` block with the
    `/:root\s*\{([\s\S]*?)\}/` regex; assert that for **every** token in `:root` whose value is a
    6-digit hex, **that exact hex string appears somewhere in `docs/visual-design.md`** (this is
    the correction being TRUE, not merely present — and it will fail the day someone changes a
    token without recording it); assert the doc contains `2026-07-30`, the string
    `public/styles.css` within 40 lines after the `## 3.` heading, and the substring `58`
    adjacent to `pairs`; assert the FROZEN STYLE SUFFIX heading `### FROZEN STYLE SUFFIX` is
    still present; and assert the doc still contains all nine `assets/delight/trophies/<id>.png`
    inventory paths (phase 2's output survived).

**COMMANDS:** none — direct file edits, then `npm test` and `APP_CODE=dummy npm test`.
(COMMIT at orchestrator acceptance: `step 3.5: T10 -- dated additive palette + gate-size
correction in docs/visual-design.md, zero deletions; ledger 341 flat / 346 reported`)

**MANDATED FAIL-FIRST:**
- **M3.5a** — change `--color-card` in `public/styles.css` to `#fffaf1` (one digit). Test 18 must
  fail (the hex is no longer recorded in the doc). Restore, and re-verify `styles.css` is
  `CRLF=508 LF=0` and the contrast gate is still 58. *(Proves the correction is a live
  cross-check, not a comment.)*
- **M3.5b** — delete the `2026-07-30` date from the inserted block. Test 18 must fail. Restore.
- **M3.5c** — delete one of the nine `assets/delight/trophies/*.png` inventory rows. Test 18 must
  fail. Restore. *(Proves the additive edit did not disturb phase 2's record.)*

**FROZEN VALIDATION:** §VAL-P3 verbatim, then:
```bash
case "$TOTAL"   in 346) ;; *) fail "expected 346 reported tests, got '$TOTAL'";; esac
case "$PLAN"    in 341) ;; *) fail "expected top-level plan 1..341, got '1..$PLAN'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL"  in 346) ;; *) fail "APP_CODE=dummy: expected 346, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"    in 341) ;; *) fail "expected 341 flat tests, got '$FLAT'";; esac
case "$PASSES"  in 58)  ;; *) fail "contrast anchor must still be 58, got '$PASSES'";; esac
case "$PUBN"    in 2372) ;; *) fail "public/ must hold 2372 files, got '$PUBN'";; esac
DOCDEL="$(git diff --numstat HEAD -- docs/visual-design.md | awk '{s+=$2} END{print s+0}')"
case "$DOCDEL" in 0) ;; *) fail "docs/visual-design.md deleted $DOCDEL lines; T10 is ADDITIVE (SK3-9)";; esac
case "$ENDS" in *"docs/visual-design.md CRLF=0 "*) ;; *) fail "docs/visual-design.md gained CRLF: $ENDS";; esac
SUF="$(node -e 'const fs=require("fs"),crypto=require("crypto");const NL=String.fromCharCode(10);const L=fs.readFileSync("docs/visual-design.md","utf8").split(NL);const i=L.indexOf("### FROZEN STYLE SUFFIX");if(i<0){console.log("MISSING");process.exit(0);}const acc=[];for(let j=i+1;j<L.length;j++){const t=L[j];if(t.indexOf("> ")===0)acc.push(t.slice(2));else if(acc.length)break;}const b=Buffer.from(acc.join(" "),"utf8");console.log(b.length+" "+crypto.createHash("md5").update(b).digest("hex"));')"
case "$SUF" in "388 51b97a774dc52aa272850bb686c22188") ;; *) fail "the FROZEN STYLE SUFFIX moved: $SUF";; esac
EXPECT=' M docs/visual-design.md
 M tests/trophies-ui.test.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```
(The `$SUF` check is the same extraction phase 2 froze — it re-derives the suffix by HEADING, not
by line number, because `design.md:132`'s `:190-195` pin is already stale and `:216` is where it
lives today.)

**NON-GOALS:** no `README.md` (step 3.1 owned it), no `docs/growth.md`, no `.oplan/` write, no
code, no test outside `tests/trophies-ui.test.js`, no deletion or rewrite of any existing doc
line, no touch of §6's suffix, prompts or inventory, no re-run of any asset script.

---

# STEP 3.6 — the self-served sandbox visual gate

**GOAL:** somebody actually LOOKS at the screen and the celebration in a browser before the
phase closes. No file in the repository changes.

**TIER:** ORCHESTRATOR. **DEPENDS ON:** 3.1-3.5 all accepted and committed.

**FILES:** none in the repository. Screenshots to `$HOME/trophies-art/preview/phase3/`
(outside the repo, field-guide lesson 4).

**Field-guide lesson 11 is quoted and binding:**
> "VISUAL GATES ARE SELF-SERVED (owner directive): sandbox browser only, NEVER production; CHECK
> PORT 3000 FOR A STALE SERVER FIRST (one squatted with the wrong DATA_DIR and answered a probe);
> hard-reload past the stale localhost SW; restore the sandbox profile byte-from-backup and stop
> the server before recording the step."

**PROCEDURE, frozen:**
1. **Check port 3000 for a stale server FIRST** and kill it if present. Lesson 3's re-bite
   happened exactly here: a stale server with the wrong `DATA_DIR` answered a probe.
2. Create a sandbox profile in a temp `DATA_DIR` **outside the repo** —
   `$HOME/trophies-val/sandbox/` — seeded so the screen shows all four states at once:
   at least one **gold** trophy, one **silver**, one **bronze**, and several **locked**.
   `.data/profile.json` must not exist in the repo before, during or after (§VAL-P3 checks it).
3. `DATA_DIR=$HOME/trophies-val/sandbox APP_CODE= npm run dev`, then drive
   `http://localhost:3000/#/trophies` in the sandbox browser. **Hard-reload past the stale
   localhost service worker** — the `CACHE` bump to `magic-vet-v18` makes this doubly necessary.
4. **Record, with a screenshot each:** (a) the four-tab nav with the trophies tab last and its
   icon matching the other three at rest and in `.active`; (b) the shelf-header banner as
   `.hero-banner` crops it — **this is SK3-3's gate: if the 3:2 crop cuts the shelf or the
   dragon badly, apply SK3-3's one-word fallback (`spot-image`) and re-shoot**; (c) all eight
   cards, with the bronze/silver/gold rings visibly different from each other and from the
   locked `--color-border` ring; (d) a locked card, confirming the dim reads as "not yet",
   not as "broken image" — **`quizRight` specifically, the tightest-cropped of the nine per
   `journal.md:639-645`**, to confirm the square-in-square box crops nothing; (e) the
   celebration overlay after finishing a quiz, and that ONE tap dismisses it; (f) the same
   screen at a 320px-wide viewport (the smallest phone the app targets).
5. **Prove the celebration's memory:** finish a quiz, see one overlay, reload, finish another —
   the same tier must NOT celebrate twice. Then clear site data and confirm it replays once
   (design T5 accepts exactly this).
6. **Restore the sandbox profile byte-from-backup and STOP the server** before recording the
   step. Then re-run §VAL-P3 and confirm it still exits 0 and `.data/profile.json` is absent.

**NON-GOALS:** never production, never her live profile, never `vercel`, no deploy, no D25
capture (phase 4 owns both), no code change — if the gate finds a defect, it is a new step with
its own frozen validation, not an in-place fix inside a gate.

---

# STEP 3.7 — phase close

**GOAL:** re-run every acceptance criterion on the committed tree, show the owner the screen and
its Hebrew, and write the record phase 4 will start from.

**TIER:** ORCHESTRATOR-authoring. **DEPENDS ON:** 3.1-3.6 all accepted.

**FILES (exhaustive):** `.oplan/word-trophies/journal.md` — APPEND (append-only).
`.oplan/word-trophies/phase-state.md` — REWRITE (orchestrator record, never an executor write
set).

**COMMANDS:** §VAL-P3 verbatim plus the step-3.5 assertion set (it IS the phase acceptance run),
plus the close block below; then the records commit
`oplan: word-trophies PHASE 3 CLOSED — the screen live at ledger 341 flat / 346 reported,
contrast 58, CACHE magic-vet-v18, public/ re-pinned 2372`.

```bash
# TAIL of the close script, which BEGINS with §VAL-P3 verbatim in the SAME file
BASE=PHASE3_BASE_HASH   # substituted by the orchestrator from the go-ahead record before running
PUBFULL="$(node -e 'const fs=require("fs"),path=require("path"),crypto=require("crypto");const out=[];(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);const s=fs.statSync(f);if(s.isDirectory())walk(f);else out.push(f.split(path.sep).join("/")+" "+crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex"));}})("public");console.log(out.length+" "+crypto.createHash("md5").update(out.join(String.fromCharCode(10))).digest("hex"));')"
echo "NEW PUBLIC PIN: $PUBFULL"
case "$PUBFULL" in "2372 "*) ;; *) fail "public/ file count is not 2371+1: $PUBFULL";; esac
GONE="$(git diff --diff-filter=D --name-only "$BASE")"
case "$GONE" in "") ;; *) fail "files were deleted: $GONE";; esac
# numstat is added<TAB>deleted<TAB>path, so the .oplan filter is on $3 here, not $NF
PHASEDEL="$(git diff --numstat "$BASE" | awk '$3 !~ /^\.oplan\// {s+=$2} END{print s+0}')"
case "$PHASEDEL" in 8) ;; *) fail "phase deletion budget is exactly 8 outside .oplan, got '$PHASEDEL'";; esac
FILES="$(git diff --name-only "$BASE" | awk '$NF !~ /^\.oplan\//' | wc -l | tr -d ' ')"
case "$FILES" in 15) ;; *) fail "phase write set must be exactly 15 files outside .oplan, got '$FILES'";; esac
SRVDIFF="$(git diff --name-only "$BASE" -- lib api data)"
case "$SRVDIFF" in "") ;; *) fail "lib/ api/ or data/ changed across the phase: $SRVDIFF";; esac
case "$PORC" in "") ;; *) fail "tree not clean at the close:
$PORC";; esac
exit $RC
```

**THE OWNER GATE AT THIS STEP** (design §5: "owner approves strings"). Because SK3-8 means **no
Hebrew string was authored**, this is a confirmation, not an authoring act. The orchestrator
shows the owner: the step-3.6 screenshots, and a list of the ten Hebrew strings on the screen
with the FILE each was extracted from (`design.md:89-96` for the eight names, `design.md:189`
for the tab label and title, `public/quiz.js:205` for the progress word). The owner confirms or
names a change; a change is a new step, not an in-gate edit.

**The record must state, for phase 4 to consume:**
* final ledger **341 flat / 346 reported**; contrast anchor **58** (was 52; all five pins moved
  in step 3.1, listed);
* **`CACHE` is now `magic-vet-v18`** — QZ-22 discharged for BOTH phase 2's `public/` addition
  and phase 3's own (SK2-3's carried obligation, closed);
* the **new full `public/` pin `2372 <md5>`** replaces `2371 644f333395566079ef6d0441438c7a4a`;
  the phase-1 exclusion pin `2362 74e736d7d83b22a24945eae87cb9fe33` remains valid forever as
  "public/ outside the trophies directory"; this phase's own working pin
  `2365 a4c1d7a5723900f228e82e70f0f1cd78` (public/ outside the seven touchable paths) is
  recorded as the value that held all phase;
* `public/quiz.js` `69b6d71117cf776715374abc6f0abb02` and `public/quiz-core.js`
  `9a2131be8b9d1b77c219f1e8c3482a71` are byte-unchanged — QZ-18 intact;
* **`lib/`, `api/` and `data/` were never touched**, so the phase-1 engine and its 25 tests are
  exactly as accepted;
* SK3-1..SK3-11 as amendments to the signed design, with SK3-1 (the field guide's wrong
  line-endings claim) flagged for promotion into lesson 4;
* the three tier hexes and their six measured ratios, so phase 4's deploy proof and any future
  palette work start from numbers;
* **NO D25 capture exists and none was made** — phase 4 makes one BEFORE any deploy (T8);
* what phase 4 must watch at read-back (T8): a trophy tier may APPEAR only with accompanying
  activity evidence; a tier that DISAPPEARS is an immediate read-back failure → rollback;
* the expectation, still unverified, that on her profile `known` bronze (and, with 12 known,
  `known` silver) land on the first real POST and `proven` stays locked (T3's honesty note,
  `journal.md:293-296`) — and that SK3-10 means she sees exactly **ONE** overlay for that
  backfill, not eight.

**NON-GOALS:** no deploy, no capture, no `public/` change, no code change, no test change, no
`vercel` invocation of any kind, no touch of her live profile.

---

## RISKS

1. **The two copies of the metrics drift** (SK3-6). The browser copy and `lib/profile.js` must
   agree forever, but nothing forces a future editor to touch both. *Noticed by:* step 3.2 test 4,
   which imports BOTH and compares every id over eight shared fixtures — and by M3.2b, which
   proves that test can see a one-field divergence. *Residual:* the fixtures are finite; a
   divergence only on inputs none of the eight exercises would pass. Recorded, not engineered
   around; a future run that changes a metric must change both and will be told so by the test.
2. **`days` and `streak` are not monotonic, so the progress NUMBER can fall** (phase-1 RISKS 1,
   `plan.md:748`): `lastSeen` is overwritten by `applyWordTap`/`markWordKnown`. A child could see
   `12 … 15` today and `9 … 15` next week. *Mitigation, frozen in SK3-4:* the line is a plain
   present-tense statement, never a comparison, and no previous value is stored anywhere to
   compare against; the RING never regresses because the engine's tier keys never regress.
   *This is a real experience risk that no test can settle* — it goes to the owner at the
   step-3.7 gate with a screenshot, as a thing she may see.
3. **CRLF damage the field guide would have caused** (SK3-1). Five of the files this phase edits
   are CRLF on disk, including `public/sw.js`, which the guide says is LF. A normalisation is
   invisible to `git diff` and would turn phase 4's md5 deploy proof into a whole-file hunt.
   *Noticed by:* every step's `$ENDS` block, which pins `LF=0` on all five and exact counts where
   they are computable.
4. **The frozen validation is itself a bug.** Phase 2 shipped a collapsed-backslash `awk` line
   that was a bash syntax error; phase 1 shipped two impossible mutation specs. *Mitigation:*
   §VAL-P3 was **dry-run today** and exits 0 with every variable populated; the `.oplan` awk
   filter is quoted from the working `§VAL-P2:919` form, never from `plan.md:989`; and every
   mutation below names the exact assertion it must break, including M3.3d, whose mechanism may
   be defeated by a case-insensitive filesystem and therefore carries its own fallback.
5. **A first-load celebration parade.** The free backfill (T9) awards several tiers at once.
   *Mitigation:* SK3-10 — one overlay, all earned tiers marked in the same pass. *Residual:* she
   sees only the FIRST of her day-one trophies celebrated. That is a deliberate trade and the
   owner should be told at the close.
6. **The shelf-header crop.** The asset is square and `.hero-banner` is 3:2, so ~17% is cut top
   and bottom. *Noticed by:* the step-3.6 visual gate, with the SK3-3 one-word fallback ready.
   A regeneration is not an option (`phase-state.md:47-49`).
7. **`quizRight` is the tightest-cropped of the nine** (`journal.md:639-645`). *Mitigated
   structurally:* the card's art box is SQUARE and the source is square, so `object-fit: cover`
   crops nothing at all. Still shot explicitly at the 3.6 gate, because "crops nothing" is a
   claim about CSS and the gate is about eyes.
8. **`GET /api/profile` creates a profile** (lesson 3). The reader's new single GET runs only
   after a save. *Residual:* if a future refactor moves that call earlier, it could create a
   profile on a device that has none. Recorded; the guard is the comment frozen into
   `celebrateFromServer` and test 16's "exactly twice" assertion.
9. **Test-count drift.** 18 new tests across five steps; any merged or extra `test()` breaks the
   pinned ledger and the executor may be tempted to adjust the number. The stop-rule applies:
   pinned numbers are frozen; a mismatch is escalated. Arithmetic, checked: 2+7+3+5+1 = 18;
   323+18 = 341 flat; 341+5 subtests = 346 reported; the per-step pins are 325/330, 332/337,
   335/340, 340/345, 341/346.
10. **The `magic-vet-v18` bump is spent.** After this phase, QZ-22's next bump is **v19**, and
    the next phase that moves a precached file owes it. Recorded at the close so phase 4 does
    not bump again "to be safe" — phase 4 deploys v18 and nothing else.

## BLOCKERS

**None.** Every decision an executor could need is frozen above: the three hexes with measured
ratios and the six pair literals; all five pins of 52 and all eight decoys; the exact insert
anchors with surrounding lines quoted for every one of the thirteen edited files; the new
module's exported shape, class names, screen order and hard rules; the celebration's storage key,
selection rule, hook sites, guard and z-index; the progress line's three cases; the shelf-header's
class and its fallback; every Hebrew string's SOURCE and decimal codepoint sum; the per-step
ledger, per-step deletion budget, per-step write set and per-step endings; and a fail-first
mutation for every behaviour, each naming the assertion it must break.

The five places the record was silent — the shelf-header's placement, the celebration's data
source, the maxed and locked progress text, where the anchor lands, and whether the metrics may
be duplicated — are decided in SK3-3, SK3-2, SK3-4, SK3-5 and SK3-6 with citations, consequences
and fallbacks, not guessed.

**One thing needs an owner word before step 3.1 is dispatched, and it is not a blocker for
planning:** the go-ahead itself (`phase-state.md:72`, "phase-3 go-ahead — owner").

## RECORD GAPS

1. **The field guide's lesson 4 is factually wrong about `public/sw.js`** and silent about
   `styles.css` and `index.html`. Measured today (SK3-1). Worked around by measuring every file
   in every step. **Recommend amending lesson 4 at the phase-3 close** to "measure, never
   remember", with the SK3-1 table.
2. **`phase-state.md:9` says the field guide is 66 lines; `wc -l` says 73.** A record nit with no
   consequence, flagged so the next close does not inherit a stale number.
3. **Design T4 never places the shelf-header** and phase 2 handed the ruling forward. Decided in
   SK3-3 (the existing `.hero-banner` class) with a one-word fallback and a visual gate. **The
   design is now fully specified on this point; no gap remains after step 3.6.**
4. **Design T5's "or chapter generation response returns a profile" is false** —
   `api/chapter.js:66` returns `{ chapter }` only, measured. Decided in SK3-2 (the phone asks
   once, the server does not change). Recorded as an amendment, not silently fixed.
5. **Design T4 does not say what the progress line reads at gold, or when nothing is earned.**
   Decided in SK3-4, with the fallback written out.
6. **Design §5 says phase 3 ends with "owner approves strings", but the design authorises no new
   string and none is authored** (SK3-8). The gate is redefined in step 3.7 as a confirmation
   over the ten extracted strings and their sources. If the owner wants a Hebrew tier word after
   all, that is a new step with a new string, a new extraction source and a new gate — not an
   in-place edit.
7. **T6 cites `docs/visual-design.md:190-195` for the FROZEN STYLE SUFFIX; it is at `:216` today**
   (phase-2 RECORD GAP 2, still true, and now further drifted because phase 2's own doc edits
   grew the file to 403 lines). Every use in this plan extracts by the `### FROZEN STYLE SUFFIX`
   heading and gates on the 388-byte md5, so line drift cannot deliver the wrong text.
8. **No D25 capture exists and none is made this phase.** T8's read-back rules are therefore
   still untested against real data. Phase 4 owns both, and the close says so.
9. **`.oplan/word-trophies/STATUS.md` and `briefing.md` were not consulted** (the same gap phase 2
   recorded as its RECORD GAP 8). `phase-state.md`, `plan.md`, `journal.md`, `design.md`, the
   field guide and `.oplan/word-g1/phase-state.md` carried every fact this plan needed. If either
   holds an owner instruction about phase 3, it has not been folded in. **The orchestrator should
   read both before dispatching step 3.1.**
10. **What this planner could NOT measure.** (a) How the nine images actually LOOK at 96px in a
    card, and whether the three ring colours read as bronze/silver/gold to a child — that is
    step 3.6 and the owner. (b) Whether the 3:2 crop of the square shelf-header is acceptable —
    same. (c) Her live profile: no capture exists, so T3's "12 known" is still an expectation,
    not a measurement (`journal.md:293-296`). (d) The exact post-edit line counts of
    `public/views/words.js` and `public/views/reader.js`, because their inserts carry comments
    whose length is the executor's — pinned as `LF=0` (CRLF-only) instead, which is the property
    that actually matters. (e) Whether the celebration overlay's dismiss-on-tap conflicts with
    the reader's own `.reader-overlay` handler when both are on screen — the overlays are in
    different DOM parents (`document.body` vs the view container) and the trophy overlay is
    `z-index: 90` while the reader's popup lives inside `#app`, but this is reasoned, not
    measured, and step 3.6 must look at it explicitly.

---

## PLAIN PLAN

*(One line per step, for the owner, no jargon — each says WHY.)*

- **Step 3.1** — Add three new colours to the app's colour list — a bronze, a silver and a gold —
  and add them to the automatic colour-checker that makes sure nothing on screen is too faint to
  see, then update every place in the project that says "the checker looks at 52 colour pairs" to
  say 58. *Why: the trophy rings are the only thing that tells her which level she reached, so
  those three colours have to be provably visible against the card behind them — and the number
  52 is written down in five different files, so all five have to move together or the tests
  start arguing with each other.*
- **Step 3.2** — Build the trophies screen itself as a self-contained piece: the shelf picture at
  the top, then one card for each of the eight trophies, each with its own picture, its Hebrew
  name, a coloured ring showing the level she has reached, and a plain line of text like
  "12 out of 15". Trophies she has not earned yet show the very same picture, greyed out.
  *Why: this is the whole point of the run — a place she can go and see what she has done. Grey
  rather than hidden, because a locked trophy she can see is a thing to aim at; a hidden one is
  nothing at all.*
- **Step 3.3** — Plug the screen in: a fourth button in the bottom bar, after "My words", with a
  little trophy cup drawn in exactly the same style as the other three; teach the app that the
  address "#/trophies" means this screen; tell the offline cache about the new file and bump its
  version number; and add the first test that would notice if one of the nine trophy pictures
  ever went missing. *Why: until this step the screen exists but nobody can reach it — and the
  cache version has to change or phones that already have the app would keep serving the old one
  forever.*
- **Step 3.4** — Make a trophy announce itself the moment it is earned: one picture-and-name
  panel over whatever she is doing, one tap to make it go away, and the phone remembers it has
  already shown that one so it never repeats. It appears after a word-practice round and after a
  new chapter is written, and never in the middle of the practice-finished screen, which is
  frozen. *Why: a shelf you have to go and check is not a reward; being told, once, at the moment
  it happens, is. And if she has earned several at once — which will happen the very first time,
  because the app counts everything she has already done — she sees ONE, not a parade.*
- **Step 3.5** — Correct the app's design document, which still describes the dark colour scheme
  the app stopped using in July, by ADDING a dated note that says what the colours really are
  today and that the stylesheet is the authority — without deleting a single line of what is
  already written. *Why: the next person to add a picture or a colour reads that document, and
  right now it would send them the wrong way. Adding rather than rewriting keeps the history
  honest.*
- **Step 3.6** — Actually open the app in a test browser and LOOK: all four tabs, the shelf
  picture, all eight cards, a locked one, the celebration appearing and being dismissed, and the
  whole thing on the narrowest phone screen — with a fake practice profile, never yours, never
  the real one. *Why: no automatic check can tell whether a gold ring looks like gold, or whether
  the shelf picture is cut off in an ugly way. Somebody has to look.*
- **Step 3.7** — Re-run every check on the finished result, show you the screen and the exact list
  of Hebrew words that appear on it together with the file each one was copied out of, and write
  down everything the deploy step will need. *Why: nothing Hebrew on this screen was typed by
  hand — every word was lifted out of a document you already signed — and you should be able to
  see that, word by word, before it ships.*

**DONE WHEN:** the trophies screen is reachable from a fourth tab, shows all eight trophies with
the right level ring and an honest progress line, greys out the ones not yet earned, and pops up
exactly one congratulation at the moment a new one is won and never twice for the same one; the
whole test suite passes at **341 tests** (346 counting sub-tests) both with and without the app
code set; the colour checker passes **58** pairs instead of 52; the offline cache has moved to
`magic-vet-v18`; both frozen transcripts still print exactly their committed text; the practice
engine, the server and the frozen quiz files have not moved by a single byte; exactly **15**
files changed, with exactly **8** deleted lines in the whole phase and none of them in the design
document; nothing was deployed, no capture was taken, and your real profile was never touched.

