#!/usr/bin/env bash
# FROZEN VALIDATION for step 2.4 -- the session: typed answers, one free retry, ONE post.
set -o pipefail
RC=0
fail() { echo "FAIL: $*"; RC=1; }

# 1. the step's own tests
node --test tests/quiz-typed-session.test.js 2>&1 | grep -E '^# (tests|pass|fail)' || fail "typed-session tests did not run"
NF=$(node --test tests/quiz-typed-session.test.js 2>&1 | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
[ "$NF" = "0" ] || fail "tests/quiz-typed-session.test.js reported [$NF] failures"

# 2. WK-4 STRUCTURALLY: there is exactly ONE place in the file that posts an answer.
#    This is the guarantee that a near-miss retry cannot post twice, enforced at the file level
#    rather than trusted from the control flow.
P=$(grep -c 'await post(' public/quiz.js)
[ "$P" = "1" ] || fail "expected exactly 1 'await post(' in quiz.js, found $P"

# 3. today's tapped card is STILL byte-identical (five states)
node .oplan/word-write/check-frozen-card.mjs || fail "the frozen cloze-pick card CHANGED"

# 4. the independent existing suite: passing AND byte-unmodified
git diff --quiet HEAD -- tests/quiz-ui.test.js || fail "tests/quiz-ui.test.js was modified -- it is the independent check"
UF=$(node --test tests/quiz-ui.test.js 2>&1 | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
[ "$UF" = "0" ] || fail "tests/quiz-ui.test.js reported [$UF] failures"
KF=$(node --test tests/quiz-kinds.test.js 2>&1 | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
[ "$KF" = "0" ] || fail "tests/quiz-kinds.test.js reported [$KF] failures"

# 5. no new Hebrew typed: non-ASCII byte count still exactly 293
NB=$(node -p "let n=0;for(const x of require('fs').readFileSync('public/quiz.js'))if(x>=128)n++;n")
[ "$NB" = "293" ] || fail "quiz.js non-ASCII bytes are $NB, baseline 293 -- Hebrew was typed by hand"

# 6. line endings
CR=$(tr -dc '\r' < public/quiz.js | wc -c)
LF=$(tr -dc '\n' < public/quiz.js | wc -c)
[ "$CR" = "$LF" ] || fail "quiz.js MIXED endings, CR=$CR LF=$LF"

# 7. VIEW_STYLE hygiene unchanged
node .oplan/word-write/check-view-style.mjs || fail "VIEW_STYLE hygiene broke"

# 8. CACHE still v24 (the bump is 2.6)
grep -q 'magic-vet-v24' public/sw.js || fail "sw.js CACHE should still be magic-vet-v24 in step 2.4"

# 9. boundary: exactly two paths changed
CHANGED=$(git status --porcelain -- public/ tests/ scripts/ | awk '{print $2}' | LC_ALL=C sort | tr '\n' ' ')
EXPECTED="public/quiz.js tests/quiz-typed-session.test.js "
[ "$CHANGED" = "$EXPECTED" ] || fail "changed paths are [$CHANGED], expected [$EXPECTED]"

# 10. WHOLE SUITE
SUITE=$(node --test 2>&1 | grep -E '^# (tests|pass|fail)')
echo "$SUITE"
SFAIL=$(echo "$SUITE" | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
SPASS=$(echo "$SUITE" | sed -n 's/^# pass \([0-9]*\)/\1/p' | head -1)
[ "$SFAIL" = "0" ] || fail "whole suite reported $SFAIL failures"
[ -n "$SPASS" ] && [ "$SPASS" -gt 531 ] || fail "suite pass count [$SPASS] did not grow beyond 531"

if [ "$RC" = "0" ]; then echo "STEP-2.4-OK"; else echo "STEP-2.4-FAILED"; fi
exit $RC
