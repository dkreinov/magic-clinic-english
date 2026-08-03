#!/usr/bin/env bash
# FROZEN VALIDATION for step 2.1 -- extract the five Hebrew strings by script.
# Run from the repo root. Exit 0 = PASS, non-zero = FAIL.
#
# This lives in a FILE, not inline in an agent packet, because shell quoting has
# eaten a pattern three times in this run (field guide 19, and its % variant 33).
set -o pipefail
RC=0
fail() { echo "FAIL: $*"; RC=1; }

DESIGN=".oplan/word-write/design.md"
GEN="public/quiz-strings.js"
EXTRACT="scripts/extract-quiz-strings.mjs"
EXPECT_MD5="ad6885fa6c4cc47751051b8f3fb9c9ea"
EXPECT_LEN="225"

[ -f "$EXTRACT" ] || fail "$EXTRACT does not exist"
[ -f "$GEN" ]     || fail "$GEN was not generated"

# 1. the extractor runs clean
if [ -f "$EXTRACT" ]; then
  node "$EXTRACT" >/dev/null || fail "extractor exited non-zero"
fi

# 2. design block digest and length are still the pinned values
BLK=$(node .oplan/word-write/check-hebrew-block.mjs 2>&1)
if [ "$BLK" != "$EXPECT_MD5 $EXPECT_LEN" ]; then
  fail "hebrew block digest/len is [$BLK], expected [$EXPECT_MD5 $EXPECT_LEN]"
fi

# 3. the generated module is PURE ASCII (all Hebrew must be \uXXXX escapes)
if [ -f "$GEN" ]; then
  NONASCII=$(node -p "let n=0;for(const x of require('fs').readFileSync('$GEN'))if(x>=128)n++;n")
  [ "$NONASCII" = "0" ] || fail "$GEN has $NONASCII non-ASCII bytes (a raw glyph was written)"

  # 4. R-W-8: the generated file is LF. Gate is CR == 0, NOT CR == LF.
  CR=$(tr -dc '\r' < "$GEN" | wc -c)
  [ "$CR" -eq 0 ] || fail "$GEN has $CR CR bytes; R-W-8 requires LF (CR == 0)"
fi

# 5. the extractor is IDEMPOTENT -- running it twice changes nothing
if [ -f "$GEN" ] && [ -f "$EXTRACT" ]; then
  A=$(md5sum "$GEN" | cut -d' ' -f1)
  node "$EXTRACT" >/dev/null || fail "second extractor run exited non-zero"
  B=$(md5sum "$GEN" | cut -d' ' -f1)
  [ "$A" = "$B" ] || fail "extractor is not idempotent ($A -> $B)"
fi

# 6. the step's own tests
node --test tests/quiz-strings.test.js 2>&1 | grep -E '^# (tests|pass|fail)' || fail "quiz-strings tests did not run"
NEWFAIL=$(node --test tests/quiz-strings.test.js 2>&1 | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
[ "$NEWFAIL" = "0" ] || fail "tests/quiz-strings.test.js reported $NEWFAIL failures"

# 7. WHOLE SUITE -- bare `node --test`, never `node --test tests/` (GC-1, Node v22)
SUITE=$(node --test 2>&1 | grep -E '^# (tests|pass|fail)')
echo "$SUITE"
SFAIL=$(echo "$SUITE" | sed -n 's/^# fail \([0-9]*\)/\1/p' | head -1)
SPASS=$(echo "$SUITE" | sed -n 's/^# pass \([0-9]*\)/\1/p' | head -1)
[ "$SFAIL" = "0" ] || fail "whole suite reported $SFAIL failures"
[ -n "$SPASS" ] && [ "$SPASS" -gt 494 ] || fail "suite pass count $SPASS did not grow beyond 494"

# 8. BOUNDARY -- only the three allowed paths may differ from HEAD
CHANGED=$(git status --porcelain -- public/ tests/ scripts/ | awk '{print $2}' | LC_ALL=C sort | tr '\n' ' ')
EXPECTED="public/quiz-strings.js scripts/extract-quiz-strings.mjs tests/quiz-strings.test.js "
[ "$CHANGED" = "$EXPECTED" ] || fail "changed paths are [$CHANGED], expected [$EXPECTED]"

# 9. nothing precached changed in this step (the PRECACHE entry belongs to step 2.3, R-W-9)
git diff --quiet HEAD -- public/sw.js || fail "step 2.1 must not touch public/sw.js"
git diff --quiet HEAD -- public/quiz.js public/quiz-core.js || fail "step 2.1 must not touch quiz.js or quiz-core.js"

if [ "$RC" = "0" ]; then echo "STEP-2.1-OK"; else echo "STEP-2.1-FAILED"; fi
exit $RC
