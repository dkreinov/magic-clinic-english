#!/bin/sh
# FROZEN validation — step 1.1 (PACKET 1: withOpenGate in 6 test files)
set -u
out=$(npm test 2>&1)
case "$out" in *'# pass 282'*) ;; *) echo "FAIL: plain run not 282 pass"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: plain run has failures"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
out2=$(APP_CODE=dummy npm test 2>&1)
case "$out2" in *'# pass 282'*) ;; *) echo "FAIL: APP_CODE=dummy run not 282 pass"; printf '%s\n' "$out2" | tail -20; exit 1 ;; esac
case "$out2" in *'# fail 0'*)   ;; *) echo "FAIL: APP_CODE=dummy run has failures"; printf '%s\n' "$out2" | tail -20; exit 1 ;; esac
changed=$(git status --porcelain -- . ':(exclude).oplan' | awk '{print $NF}' | LC_ALL=C sort | tr '\n' ' ')
exp='tests/api-chapter.test.js tests/api-placement.test.js tests/api-profile-post.test.js tests/api-profile-quiz.test.js tests/api-translate.test.js tests/api.test.js tests/words-ui.test.js '
[ "$changed" = "$exp" ] || { echo "FAIL: unexpected changed files: [$changed]"; exit 1; }
echo CHORE-1-OK
