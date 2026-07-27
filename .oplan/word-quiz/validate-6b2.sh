#!/usr/bin/env bash
# Frozen validation for step 6b.2 (plan.md, PHASE 6 / 6b). Do not edit.
set -o pipefail
cd "$(dirname "$0")/../.."
node --check public/quiz.js || { echo "FAIL: node --check"; exit 1; }
out=$(npm test 2>&1) || true
case "$out" in *'# pass 282'*) ;; *) echo "FAIL: not 282"; echo "$out" | tail -8; exit 1;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: failures"; echo "$out" | tail -8; exit 1;; esac
n=$(node scripts/check-contrast.mjs | grep -c '^PASS')
[ "$n" = 52 ] || { echo "FAIL: contrast $n"; exit 1; }
changed=$(git status --porcelain -- . ':(exclude).oplan' | awk '{print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/quiz.js tests/quiz-ui.test.js " ] || { echo "FAIL: [$changed]"; exit 1; }
echo STEP-6B2-OK
