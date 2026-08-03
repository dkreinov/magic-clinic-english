#!/usr/bin/env bash
# FROZEN VALIDATION for step 2.5 -- both call sites pass her words; sampleRanked applied once.
set -o pipefail
RC=0
fail() { echo "FAIL: $*"; RC=1; }

# 1. the step's own tests
node --test tests/quiz-callsites.test.js 2>&1 | grep -E '^# (tests|pass|fail)' || fail "callsite tests did not run"
NF=$(node --test tests/quiz-callsites.test.js 2>&1 | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
[ "$NF" = "0" ] || fail "tests/quiz-callsites.test.js reported [$NF] failures"

# 2. the uniformity sweep must report what it ACTUALLY ran
OUT=$(node --test tests/quiz-callsites.test.js 2>&1)
N=$(echo "$OUT" | sed -n 's/.*OBSERVED_RUNS=\([0-9]*\).*/\1/p' | head -1)
[ -n "$N" ] || fail "the sampling sweep never printed OBSERVED_RUNS"
[ -n "$N" ] && { [ "$N" -ge 200 ] || fail "sampling sweep observed only $N runs, expected >=200"; }

# 3. sampleRanked is applied in EXACTLY ONE view, and it is words.js (ruling: decision 6)
[ "$(grep -c 'sampleRanked' public/views/words.js)" = "2" ] || \
  fail "words.js must import AND call sampleRanked exactly once each (grep count must be 2)"
[ "$(grep -c 'sampleRanked' public/views/reader.js)" = "0" ] || \
  fail "reader.js must NOT use sampleRanked -- chapterQuizLemmas already orders that list deliberately"

# 4. both call sites pass her words AND the audio manifest
grep -q 'audioSet' public/views/reader.js || fail "reader.js does not pass audioSet"
grep -q 'audioSet' public/views/words.js  || fail "words.js does not pass audioSet"

# 5. line endings on both views (CR == LF, never a fixed count)
for f in public/views/reader.js public/views/words.js; do
  CR=$(tr -dc '\r' < "$f" | wc -c); LF=$(tr -dc '\n' < "$f" | wc -c)
  [ "$CR" = "$LF" ] || fail "$f MIXED endings, CR=$CR LF=$LF"
done

# 6. no new Hebrew typed into either view -- byte counts pinned at their current values
RNB=$(node -p "let n=0;for(const x of require('fs').readFileSync('public/views/reader.js'))if(x>=128)n++;n")
WNB=$(node -p "let n=0;for(const x of require('fs').readFileSync('public/views/words.js'))if(x>=128)n++;n")
[ "$RNB" = "754" ] || fail "reader.js non-ASCII bytes are $RNB, baseline 754 -- Hebrew was typed"
[ "$WNB" = "465" ] || fail "words.js non-ASCII bytes are $WNB, baseline 465 -- Hebrew was typed"

# 7. quiz.js and quiz-core.js untouched by this step
git diff --quiet HEAD -- public/quiz.js public/quiz-core.js public/quiz-strings.js || \
  fail "step 2.5 must not touch quiz.js / quiz-core.js / quiz-strings.js"
node .oplan/word-write/check-frozen-card.mjs || fail "the frozen cloze-pick card CHANGED"

# 8. CACHE still v24 (the bump is 2.6)
grep -q 'magic-vet-v24' public/sw.js || fail "sw.js CACHE should still be magic-vet-v24 in step 2.5"

# 9. the existing view suites must still pass
for t in tests/reader-ui.test.js tests/words-ui.test.js tests/reader-popup.test.js tests/quiz-ui.test.js; do
  F=$(node --test "$t" 2>&1 | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
  [ "$F" = "0" ] || fail "$t reported [$F] failures"
done

# 10. boundary: exactly three paths changed
CHANGED=$(git status --porcelain -- public/ tests/ scripts/ | awk '{print $2}' | LC_ALL=C sort | tr '\n' ' ')
EXPECTED="public/views/reader.js public/views/words.js tests/quiz-callsites.test.js tests/words-ui.test.js "
[ "$CHANGED" = "$EXPECTED" ] || fail "changed paths are [$CHANGED], expected [$EXPECTED]"

# 11. WHOLE SUITE
SUITE=$(node --test 2>&1 | grep -E '^# (tests|pass|fail)')
echo "$SUITE"
SFAIL=$(echo "$SUITE" | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
SPASS=$(echo "$SUITE" | sed -n 's/^# pass \([0-9]*\)/\1/p' | head -1)
[ "$SFAIL" = "0" ] || fail "whole suite reported $SFAIL failures"
[ -n "$SPASS" ] && [ "$SPASS" -gt 545 ] || fail "suite pass count [$SPASS] did not grow beyond 545"

if [ "$RC" = "0" ]; then echo "STEP-2.5-OK"; else echo "STEP-2.5-FAILED"; fi
exit $RC
