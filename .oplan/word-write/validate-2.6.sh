#!/usr/bin/env bash
# FROZEN VALIDATION for step 2.6 -- the CACHE bump v24 -> v25.
# Without this, her phone keeps serving the OLD precached quiz.js and none of phase 2 reaches her.
set -o pipefail
RC=0
fail() { echo "FAIL: $*"; RC=1; }

# 1. the bump is applied, and the old name is GONE (not merely joined)
grep -q 'const CACHE = "magic-vet-v25";' public/sw.js || fail "sw.js is not bumped to magic-vet-v25"
[ "$(grep -c 'magic-vet-v24' public/sw.js)" = "0" ] || fail "magic-vet-v24 is still present in sw.js"

# 2. the pin moved IN THE SAME COMMIT
grep -q "EXPECTED_CACHE = 'magic-vet-v25'" tests/shell.test.js || fail "the pin in tests/shell.test.js did not move to v25"
# 2b. THE STALE-NAME GUARD MUST NAME THE VERSION JUST SUPERSEDED.
#     MY OWN EARLIER CHECK HERE WAS WRONG and produced a can-never-fail gate: it forbade any
#     mention of v24 in the TEST file, but the test must NAME v24 in order to assert its ABSENCE
#     from sw.js. The executor obeyed the gate and guarded v23 instead -- a string that was never
#     in sw.js, so the assertion could never fail. Forbidding v24 belongs to sw.js, not the test.
grep -q "includes('magic-vet-v24')" tests/shell.test.js || \
  fail "the stale-name guard must name magic-vet-v24 (the version just superseded), not an older one"

# 3. the music cache name must NOT be swept (it outlives version bumps by design)
grep -q 'MUSIC_CACHE' public/sw.js || fail "MUSIC_CACHE disappeared from sw.js"

# 4. quiz-strings.js is still precached (added in 2.3) and the seam test is green
grep -q '"/quiz-strings.js"' public/sw.js || fail "/quiz-strings.js fell out of PRECACHE"
MF=$(node --test tests/music.test.js 2>&1 | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
[ "$MF" = "0" ] || fail "tests/music.test.js (the precache seam) reported [$MF] failures"

# 5. shell tests green
SF=$(node --test tests/shell.test.js 2>&1 | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
[ "$SF" = "0" ] || fail "tests/shell.test.js reported [$SF] failures"

# 6. nothing else drifted: the frozen card, the Hebrew byte counts, the endings
node .oplan/word-write/check-frozen-card.mjs || fail "the frozen cloze-pick card CHANGED"
NB=$(node -p "let n=0;for(const x of require('fs').readFileSync('public/quiz.js'))if(x>=128)n++;n")
[ "$NB" = "293" ] || fail "quiz.js non-ASCII bytes are $NB, baseline 293"
for f in public/quiz.js public/quiz-core.js public/sw.js public/views/reader.js public/views/words.js; do
  CR=$(tr -dc '\r' < "$f" | wc -c); LF=$(tr -dc '\n' < "$f" | wc -c)
  [ "$CR" = "$LF" ] || fail "$f MIXED endings, CR=$CR LF=$LF"
done
CRS=$(tr -dc '\r' < public/quiz-strings.js | wc -c)
[ "$CRS" = "0" ] || fail "quiz-strings.js must stay LF (R-W-8), found $CRS CR bytes"

# 7. boundary: exactly two paths changed
CHANGED=$(git status --porcelain -- public/ tests/ scripts/ | awk '{print $2}' | LC_ALL=C sort | tr '\n' ' ')
EXPECTED="public/sw.js tests/shell.test.js "
[ "$CHANGED" = "$EXPECTED" ] || fail "changed paths are [$CHANGED], expected [$EXPECTED]"

# 8. WHOLE SUITE -- the ledger must not move (this step adds no tests)
SUITE=$(node --test 2>&1 | grep -E '^# (tests|pass|fail)')
echo "$SUITE"
SFAIL=$(echo "$SUITE" | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
SPASS=$(echo "$SUITE" | sed -n 's/^# pass \([0-9]*\)/\1/p' | head -1)
[ "$SFAIL" = "0" ] || fail "whole suite reported $SFAIL failures"
[ "$SPASS" = "550" ] || fail "suite pass count is [$SPASS], expected exactly 550 (this step adds no tests)"

if [ "$RC" = "0" ]; then echo "STEP-2.6-OK"; else echo "STEP-2.6-FAILED"; fi
exit $RC
