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
DELS="$(git diff --numstat HEAD -- lib/profile.js tests/profile.test.js | awk '{s+=$2} END{print s+0}')"
case "$DELS" in 0) ;; *) fail "lib/profile.js + tests/profile.test.js deleted $DELS lines; budget is 0";; esac
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
git add lib/profile.js tests/profile.test.js tests/trophies.test.js
git commit -m "step 1.1: trophies schema (T1) — defaultProfile trophies:{}, validateProfile optional block, TROPHY_TIERS; ledger 301 flat / 306 reported"
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

**COMMANDS:** `node --check lib/profile.js`; `npm test`; `APP_CODE=dummy npm test`;
`git commit -m "step 1.2: trophy catalogue (T3) — 8 signed ids/thresholds + metric derivations; ledger 311 flat / 316 reported"`

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

**COMMANDS:** `node --check lib/profile.js`; `npm test`; `APP_CODE=dummy npm test`;
`git commit -m "step 1.3: awardTrophies (T2) — pure, idempotent, never-regress; ledger 318 flat / 323 reported"`

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
3. `'GET /api/profile never awards, even on a profile that has already earned trophies'` — write, by hand, a profile whose `words` keys are **already `LC_ALL=C` sorted on-manifest lemmas** `cat, dog, fair, light, method` (all `status: 'known'`) and whose `trophies` is `{ known: { bronze: NOW } }`. **Frozen note the executor must honour: `migrateWordKeys` re-sorts `profile.words` on every GET, so an unsorted seed rewrites the file and destroys the byte check.** GET → 200; assert file bytes unchanged; assert `deepStrictEqual(parsed.data.trophies, { known: { bronze: NOW } })` — no `silver`, no new trophy, even though 5 known would earn bronze. Prototype-confirmed (`bytes unchanged: true`).
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

**COMMANDS:** `node --check api/profile.js`; `node --check api/chapter.js`; `npm test`; `APP_CODE=dummy npm test`;
`git commit -m "step 1.4: wire awardTrophies at the two save moments (T2, SK-1); ledger 323 flat / 328 reported"`

**MANDATED FAIL-FIRST:**
- **M1.4a** — move `awardTrophies(p);` in `api/chapter.js` from after the push to immediately after `promoteToCandidate(p);` (T2's literal wording). Test 4 must fail. **Measured in the prototype: post-push → `trophy keys: ["chapters"]`; pre-push → `trophy keys: []`.** Restore.
- **M1.4b** — add `awardTrophies(p);` into the GET branch of `api/profile.js` (before `sendJson` at `:33`). Test 3 must fail on the byte comparison, and `tests/api-profile-quiz.test.js › an old-shape profile survives a real GET with its bytes unchanged` must fail too. Restore.
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
