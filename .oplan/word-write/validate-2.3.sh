#!/usr/bin/env bash
# FROZEN VALIDATION for step 2.3 -- renderQuizCard learns four kinds.
# Run from the repo root. Exit 0 = PASS.
set -o pipefail
RC=0
fail() { echo "FAIL: $*"; RC=1; }

# 1. the step's own tests
node --test tests/quiz-kinds.test.js 2>&1 | grep -E '^# (tests|pass|fail)' || fail "quiz-kinds tests did not run"
NF=$(node --test tests/quiz-kinds.test.js 2>&1 | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
[ "$NF" = "0" ] || fail "tests/quiz-kinds.test.js reported [$NF] failures"

# 2. THE FROZEN CARD. Today's tapped question must be byte-identical across FIVE states.
#    This replaces a line-level boundary check for this step: 2.3 legitimately restructures
#    renderQuizCard, so "no pre-existing line changed" is the WRONG pin (field guide 22).
#    The PROPERTY is "what the child sees for a cloze-pick card does not change", and this
#    asserts exactly that, at the byte, against a fixture frozen BEFORE the step ran.
node .oplan/word-write/check-frozen-card.mjs || fail "the frozen cloze-pick card CHANGED"

# 3. the existing quiz UI suite must pass AND be byte-unmodified
git diff --quiet HEAD -- tests/quiz-ui.test.js || fail "tests/quiz-ui.test.js was modified -- it is the independent check"
node --test tests/quiz-ui.test.js 2>&1 | grep -E '^# (tests|pass|fail)' || fail "quiz-ui tests did not run"
UF=$(node --test tests/quiz-ui.test.js 2>&1 | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
[ "$UF" = "0" ] || fail "tests/quiz-ui.test.js reported [$UF] failures"

# 4. NO NEW HEBREW WAS TYPED. quiz.js's non-ASCII byte count must be EXACTLY its baseline of 293.
#    All new Hebrew must arrive via QUIZ_STRINGS, which is pure ASCII escapes in another file.
NB=$(node -p "let n=0;for(const x of require('fs').readFileSync('public/quiz.js'))if(x>=128)n++;n")
[ "$NB" = "293" ] || fail "quiz.js non-ASCII bytes are $NB, baseline is 293 -- Hebrew was typed by hand"

# 5. line endings: quiz.js is CRLF. Gate is CR == LF, never a fixed count.
CR=$(tr -dc '\r' < public/quiz.js | wc -c)
LF=$(tr -dc '\n' < public/quiz.js | wc -c)
[ "$CR" = "$LF" ] || fail "quiz.js MIXED endings, CR=$CR LF=$LF"
[ "$CR" -ge 346 ] || fail "quiz.js shrank, CR=$CR (<346)"

# 6. R-W-9: the PRECACHE entry for quiz-strings.js lands in THIS step, because
#    tests/music.test.js's seam test fires the moment quiz.js imports it.
grep -q '"/quiz-strings.js"' public/sw.js || fail "/quiz-strings.js is not in sw.js PRECACHE (R-W-9)"
node --test tests/music.test.js 2>&1 | grep -E '^# fail' | grep -q '^# fail 0' || fail "tests/music.test.js (the precache seam) is RED"
node --test tests/shell.test.js 2>&1 | grep -E '^# fail' | grep -q '^# fail 0' || fail "tests/shell.test.js is RED (PRECACHE array pin)"

# 7. the CACHE VERSION is NOT bumped in this step -- that is 2.6 (ruling R-W-7)
grep -q 'magic-vet-v24' public/sw.js || fail "sw.js CACHE should still be magic-vet-v24 in step 2.3"

# 8. VIEW_STYLE hygiene: no raw hex, no color-mix (both FABRICATE a contrast pass)
node .oplan/word-write/check-view-style.mjs || fail "VIEW_STYLE contains a raw hex colour or color-mix()"

# 9. boundary: exactly these paths changed under public/ tests/ scripts/
CHANGED=$(git status --porcelain -- public/ tests/ scripts/ | awk '{print $2}' | LC_ALL=C sort | tr '\n' ' ')
EXPECTED="public/quiz.js public/sw.js tests/quiz-kinds.test.js tests/shell.test.js "
[ "$CHANGED" = "$EXPECTED" ] || fail "changed paths are [$CHANGED], expected [$EXPECTED]"

# 10. WHOLE SUITE -- bare `node --test` (GC-1)
SUITE=$(node --test 2>&1 | grep -E '^# (tests|pass|fail)')
echo "$SUITE"
SFAIL=$(echo "$SUITE" | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
SPASS=$(echo "$SUITE" | sed -n 's/^# pass \([0-9]*\)/\1/p' | head -1)
[ "$SFAIL" = "0" ] || fail "whole suite reported $SFAIL failures"
[ -n "$SPASS" ] && [ "$SPASS" -gt 513 ] || fail "suite pass count [$SPASS] did not grow beyond 513"

if [ "$RC" = "0" ]; then echo "STEP-2.3-OK"; else echo "STEP-2.3-FAILED"; fi
exit $RC
