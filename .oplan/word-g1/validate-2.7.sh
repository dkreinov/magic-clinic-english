set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
first=$(head -1 public/sw.js)
[ "$first" = 'const CACHE = "magic-vet-v17";' ] || { echo "FAIL: sw.js line 1 = [$first]"; exit 1; }
stale=$(grep -rln 'magic-vet-v16' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.oplan . | tr '\n' ' ')
[ -z "$stale" ] || { echo "FAIL: magic-vet-v16 survives in: $stale"; exit 1; }
n=$(grep -cF "assert.ok(sw.includes('magic-vet-v17'));" tests/shell.test.js) || n=0
[ "$n" = "1" ] || { echo "FAIL: shell.test.js does not pin v17"; exit 1; }
node -e '
const s = require("fs").readFileSync("public/sw.js", "utf8");
const m = s.match(/PRECACHE\s*=\s*(\[[\s\S]*?\])/);
if (!m) { console.log("FAIL: no PRECACHE array"); process.exit(1); }
const a = JSON.parse(m[1]);
const want = ["/","/styles.css","/app.js","/api.js","/lemma.js","/words-index.js","/quiz-core.js","/quiz.js","/views/home.js","/views/placement.js","/views/reader.js","/views/words.js","/manifest.webmanifest","/icons/icon.svg"];
if (JSON.stringify(a) !== JSON.stringify(want)) { console.log("FAIL: PRECACHE changed"); process.exit(1); }
console.log("PRECACHE-FROZEN-OK");
' || exit 1
lf=$(file public/sw.js); case "$lf" in *CRLF*) echo "FAIL: sw.js gained CRLF line endings"; exit 1;; esac
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 298"*) ;; *) echo "FAIL: ledger not 298"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/sw.js tests/shell.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-2.7-OK
