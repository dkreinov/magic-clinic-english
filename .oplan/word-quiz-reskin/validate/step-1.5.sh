#!/bin/sh
# FROZEN validation — step 1.5 (CACHE bump v13 -> v14)
set -u
head -1 public/sw.js | grep -qF 'const CACHE = "magic-vet-v14";' || { echo "FAIL: sw.js line 1 is not v14"; exit 1; }
hits=$(grep -rn 'magic-vet-v13' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.oplan . || true)
[ -z "$hits" ] || { echo "FAIL: magic-vet-v13 still present:"; echo "$hits"; exit 1; }
grep -qF "assert.ok(sw.includes('magic-vet-v14'));" tests/shell.test.js || { echo "FAIL: shell.test.js does not pin v14"; exit 1; }
out=$(npm test 2>&1)
case "$out" in *'# pass 282'*) ;; *) echo "FAIL: not 282 pass"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: has failures"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
changed=$(git status --porcelain -- . ':(exclude).oplan' | awk '{print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/sw.js tests/shell.test.js " ] || { echo "FAIL: unexpected changed files: [$changed]"; exit 1; }
echo RESKIN-CACHE-OK
