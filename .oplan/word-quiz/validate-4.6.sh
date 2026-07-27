#!/usr/bin/env bash
# Frozen validation for step 4.6 (plan.md, PHASE 4). Do not edit.
set -o pipefail
cd "$(dirname "$0")/../.."
git diff --quiet public/ lib/ api/ || { echo "FAIL: implementation not restored"; exit 1; }
out=$(npm test 2>&1) || true
case "$out" in *'# pass 282'*) ;; *) echo "FAIL: not 282"; echo "$out" | tail -8; exit 1;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: failures"; echo "$out" | tail -8; exit 1;; esac
ep=$(node --test tests/quiz-experience.test.js 2>&1) || true
case "$ep" in *'# pass 5'*) ;; *) echo "FAIL: not 5 episodes"; echo "$ep" | tail -8; exit 1;; esac
changed=$(git status --porcelain -- . ':(exclude).oplan' | awk '{print $NF}' | sort | tr '\n' ' ')
[ "$changed" = "tests/quiz-experience.test.js " ] || { echo "FAIL: [$changed]"; exit 1; }
[ ! -e .data/profile.json ] || { echo "FAIL: real data dir written"; exit 1; }
echo STEP-4.6-OK
