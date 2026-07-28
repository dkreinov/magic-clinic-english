#!/bin/sh
# FROZEN validation — step 1.4 (light-mode PWA chrome)
set -u
grep -qF '<meta name="theme-color" content="#fff8ec" />' public/index.html || { echo "FAIL: index.html theme-color"; exit 1; }
grep -qF '<meta name="color-scheme" content="light" />' public/index.html || { echo "FAIL: index.html color-scheme"; exit 1; }
grep -qF '"background_color": "#fff4e2",' public/manifest.webmanifest || { echo "FAIL: manifest background_color"; exit 1; }
grep -qF '"theme_color": "#fff8ec",' public/manifest.webmanifest || { echo "FAIL: manifest theme_color"; exit 1; }
case "$(cat public/index.html)" in *'#2e1806'*) echo "FAIL: old dark hex still in index.html"; exit 1 ;; esac
case "$(cat public/manifest.webmanifest)" in *'#2e1806'*|*'#241305'*) echo "FAIL: old dark hex still in manifest"; exit 1 ;; esac
out=$(npm test 2>&1)
case "$out" in *'# pass 282'*) ;; *) echo "FAIL: not 282 pass"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
case "$out" in *'# fail 0'*)   ;; *) echo "FAIL: has failures"; printf '%s\n' "$out" | tail -20; exit 1 ;; esac
changed=$(git status --porcelain -- . ':(exclude).oplan' | awk '{print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/index.html public/manifest.webmanifest tests/shell.test.js " ] || { echo "FAIL: unexpected changed files: [$changed]"; exit 1; }
echo RESKIN-CHROME-OK
