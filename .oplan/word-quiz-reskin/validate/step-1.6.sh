#!/bin/sh
# FROZEN validation — step 1.6 (deploy) — read-only, idempotent, re-runnable
set -u
U=https://english-app-three-tan.vercel.app
D="$HOME/wqr-deploy"; mkdir -p "$D"
curl -s --ssl-no-revoke -o "$D/index.html" "$U/"
curl -s --ssl-no-revoke -o "$D/styles.css" "$U/styles.css"
curl -s --ssl-no-revoke -o "$D/sw.js"      "$U/sw.js"
curl -s --ssl-no-revoke -o "$D/health.json" "$U/api/health"
code=$(curl -s --ssl-no-revoke -o /dev/null -w '%{http_code}' "$U/api/chapter")
for f in index.html styles.css sw.js; do
  a=$(md5sum < "$D/$f" | cut -d' ' -f1); b=$(md5sum < "public/$f" | cut -d' ' -f1)
  [ "$a" = "$b" ] || { echo "FAIL: live /$f md5 $a != worktree $b"; exit 1; }
done
grep -qF 'magic-vet-v14' "$D/sw.js" || { echo "FAIL: live sw.js is not v14"; exit 1; }
[ "$(cat "$D/health.json")" = '{"ok":true,"data":{"status":"up","version":1}}' ] || { echo "FAIL: /api/health payload: $(cat "$D/health.json")"; exit 1; }
[ "$code" = "401" ] || { echo "FAIL: /api/chapter returned $code, expected 401"; exit 1; }
[ -s "$D/outgoing.txt" ] || { echo "FAIL: no recorded outgoing deployment"; exit 1; }
echo DEPLOY-OK
