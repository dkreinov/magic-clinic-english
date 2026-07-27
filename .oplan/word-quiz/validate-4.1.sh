#!/usr/bin/env bash
# Frozen validation for step 4.1 (plan.md, PHASE 4). Do not edit.
set -o pipefail
cd "$(dirname "$0")/../.."
node --check public/quiz-core.js || { echo "FAIL: node --check"; exit 1; }
out=$(npm test 2>&1) || true
case "$out" in *'# pass 264'*) ;; *) echo "FAIL: not 264"; echo "$out" | tail -8; exit 1;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: failures"; echo "$out" | tail -8; exit 1;; esac
changed=$(git status --porcelain -- . ':(exclude).oplan' | awk '{print $NF}' | sort | tr '\n' ' ')
[ "$changed" = "public/quiz-core.js tests/quiz-core.test.js " ] || { echo "FAIL: [$changed]"; exit 1; }
echo STEP-4.1-OK
