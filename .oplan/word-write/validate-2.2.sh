#!/usr/bin/env bash
# FROZEN VALIDATION for step 2.2 -- buildQuestion in public/quiz-core.js.
# Run from the repo root. Exit 0 = PASS. Lives in a FILE, never inline in a packet.
set -o pipefail
RC=0
fail() { echo "FAIL: $*"; RC=1; }
SP="C:/Users/dkreinov/AppData/Local/Temp/claude/C--Users-dkreinov-claude-english-app/ba12582d-006c-467c-8065-72fd3b3e9187/scratchpad"
CHK=".oplan/word-write/subsequence-check.mjs"
BASE="108512f"   # the step 2.1 commit

# 1. the step's own tests
node --test tests/quiz-build.test.js 2>&1 | grep -E '^# (tests|pass|fail)' || fail "quiz-build tests did not run"
NF=$(node --test tests/quiz-build.test.js 2>&1 | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
[ "$NF" = "0" ] || fail "tests/quiz-build.test.js reported [$NF] failures"

# 2. the sweep must report what it ACTUALLY observed (field guide 18 / intervention I-2)
OUT=$(node --test tests/quiz-build.test.js 2>&1)
N=$(echo "$OUT" | sed -n 's/.*OBSERVED_ROTATIONS=\([0-9]*\).*/\1/p' | head -1)
[ -n "$N" ] || fail "the rotation sweep never printed OBSERVED_ROTATIONS"
[ -n "$N" ] && { [ "$N" -ge 100 ] || fail "rotation sweep observed only $N, expected >=100"; }

# 3. line endings: quiz-core.js is CRLF. Gate is CR == LF, NEVER a fixed count.
CR=$(tr -dc '\r' < public/quiz-core.js | wc -c)
LF=$(tr -dc '\n' < public/quiz-core.js | wc -c)
[ "$CR" = "$LF" ] || fail "quiz-core.js MIXED endings, CR=$CR LF=$LF"
[ "$CR" -ge 227 ] || fail "quiz-core.js shrank, CR=$CR (<227)"

# 4. all 14 pre-existing exports still exist, plus the new one
node --input-type=module -e '
import * as m from "./public/quiz-core.js";
const want=["newSessionId","knownSetFromProfile","selectOptions","selectHeOptions","isUsableItem",
 "pickItem","pickQuizWords","pickCandidateWords","normalizeTyped","isNearMiss","gradeTyped",
 "sampleRanked","QUESTION_KINDS","chooseKind","buildQuestion"];
const missing=want.filter(w=>m[w]===undefined);
if(missing.length){console.error("MISSING EXPORTS: "+missing.join(","));process.exit(1)}
console.log("exports OK: "+want.length);
' || fail "an export is missing from quiz-core.js"

# 5. BOUNDARY -- no pre-existing LINE of quiz-core.js changed or removed.
#    numstat CANNOT see this (field guide 32); the subsequence check can.
git show "$BASE":public/quiz-core.js > "$SP/v22-old-core.js" || fail "could not read the base blob"
node "$CHK" "$SP/v22-old-core.js" public/quiz-core.js --old-is-blob || \
  fail "a pre-existing line of quiz-core.js was modified or removed"

# 6. quiz.js must NOT be touched by this step
md5sum public/quiz.js | grep -q '^69b6d71117cf776715374abc6f0abb02' || fail "public/quiz.js was modified"

# 7. sw.js and the views must NOT be touched by this step
git diff --quiet HEAD -- public/sw.js || fail "step 2.2 must not touch public/sw.js"
git diff --quiet HEAD -- public/views/ || fail "step 2.2 must not touch any view"

# 8. exactly two paths changed under public/ tests/ scripts/
CHANGED=$(git status --porcelain -- public/ tests/ scripts/ | awk '{print $2}' | LC_ALL=C sort | tr '\n' ' ')
EXPECTED="public/quiz-core.js tests/quiz-build.test.js "
[ "$CHANGED" = "$EXPECTED" ] || fail "changed paths are [$CHANGED], expected [$EXPECTED]"

# 9. WHOLE SUITE -- bare `node --test` (GC-1: the directory form dies on Node v22)
SUITE=$(node --test 2>&1 | grep -E '^# (tests|pass|fail)')
echo "$SUITE"
SFAIL=$(echo "$SUITE" | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
SPASS=$(echo "$SUITE" | sed -n 's/^# pass \([0-9]*\)/\1/p' | head -1)
[ "$SFAIL" = "0" ] || fail "whole suite reported $SFAIL failures"
[ -n "$SPASS" ] && [ "$SPASS" -gt 500 ] || fail "suite pass count [$SPASS] did not grow beyond 500"

if [ "$RC" = "0" ]; then echo "STEP-2.2-OK"; else echo "STEP-2.2-FAILED"; fi
exit $RC
