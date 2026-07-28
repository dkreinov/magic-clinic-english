#!/bin/sh
# FROZEN validation — step 1.2 (PACKET 2: rename renderChapter's stage shadow)
set -u
out=$(npm test 2>&1)
case "$out" in *'# pass 282'*) ;; *) echo "FAIL: not 282 pass"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: has failures"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
leftover=$(awk '/^  function renderChapter\(\) \{/,/^  function draw\(\) \{/' public/views/reader.js | grep -n '\bstage\b')
if [ -n "$leftover" ]; then echo "FAIL: bare 'stage' still inside renderChapter():"; echo "$leftover"; exit 1; fi
changed=$(git status --porcelain -- . ':(exclude).oplan' | awk '{print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/views/reader.js " ] || { echo "FAIL: unexpected changed files: [$changed]"; exit 1; }
echo CHORE-2-OK
