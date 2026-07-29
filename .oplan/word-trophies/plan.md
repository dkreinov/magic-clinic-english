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
