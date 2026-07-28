#!/bin/sh
# FROZEN validation — step 1.8 (SW auto-reload + warm nav shadow + CACHE v15)
set -u
grep -qF 'navigator.serviceWorker.addEventListener("controllerchange"' public/app.js || { echo "FAIL: no controllerchange listener in app.js"; exit 1; }
grep -qF 'let refreshing = false;' public/app.js || { echo "FAIL: no refreshing guard"; exit 1; }
grep -qF 'window.location.reload();' public/app.js || { echo "FAIL: no reload call"; exit 1; }
grep -qF 'box-shadow: 0 -1px 0 rgba(150, 104, 47, 0.12), 0 -2px 14px rgba(120, 78, 30, 0.18);' public/styles.css || { echo "FAIL: nav shadow not warm-toned"; exit 1; }
case "$(cat public/styles.css)" in *'rgba(0, 0, 0, 0.5)'*) echo "FAIL: black nav shadow still present"; exit 1 ;; esac
head -1 public/sw.js | grep -qF 'const CACHE = "magic-vet-v15";' || { echo "FAIL: sw.js line 1 is not v15"; exit 1; }
hits=$(grep -rn 'magic-vet-v14' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.oplan . || true)
[ -z "$hits" ] || { echo "FAIL: magic-vet-v14 still present:"; echo "$hits"; exit 1; }
grep -qF "assert.ok(sw.includes('magic-vet-v15'));" tests/shell.test.js || { echo "FAIL: shell.test.js does not pin v15"; exit 1; }
out=$(npm test 2>&1)
case "$out" in *'# pass 282'*) ;; *) echo "FAIL: not 282 pass"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: has failures"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
changed=$(git status --porcelain -- . ':(exclude).oplan' | awk '{print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/app.js public/styles.css public/sw.js tests/shell.test.js " ] || { echo "FAIL: unexpected changed files: [$changed]"; exit 1; }
echo AUTOREFRESH-OK
