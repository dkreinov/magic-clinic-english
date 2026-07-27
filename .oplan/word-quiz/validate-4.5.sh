#!/usr/bin/env bash
# Frozen validation for step 4.5 (plan.md, PHASE 4). Do not edit.
set -o pipefail
cd "$(dirname "$0")/../.."
node --check public/sw.js || { echo "FAIL: node --check"; exit 1; }
grep -qF 'magic-vet-v13' public/sw.js || { echo "FAIL: no v13"; exit 1; }
if grep -qF 'magic-vet-v12' public/sw.js; then echo "FAIL: v12 still present"; exit 1; fi
grep -qF '"/quiz-core.js"' public/sw.js || { echo "FAIL: quiz-core not precached"; exit 1; }
grep -qF '"/quiz.js"' public/sw.js || { echo "FAIL: quiz not precached"; exit 1; }
out=$(npm test 2>&1) || true
case "$out" in *'# pass 277'*) ;; *) echo "FAIL: not 277"; echo "$out" | tail -8; exit 1;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: failures"; echo "$out" | tail -8; exit 1;; esac
changed=$(git status --porcelain -- . ':(exclude).oplan' | awk '{print $NF}' | sort | tr '\n' ' ')
[ "$changed" = "public/sw.js tests/shell.test.js " ] || { echo "FAIL: [$changed]"; exit 1; }
echo STEP-4.5-OK
