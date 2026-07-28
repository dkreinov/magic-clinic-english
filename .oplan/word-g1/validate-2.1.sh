set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
mkdir -p "$HOME/g1-scratch" || exit 1
[ -f .oplan/word-g1/g1-transcript.mjs ] || { echo "FAIL: no g1-transcript.mjs"; exit 1; }
[ -f .oplan/word-g1/g1-transcript-expected.txt ] || { echo "FAIL: no g1-transcript-expected.txt"; exit 1; }
node -e '
const fs = require("fs");
const SOFT = "\u05E2\u05D5\u05D3 \u05DC\u05D0 \u2014 \u05E0\u05DE\u05E9\u05D9\u05DA \u05DC\u05DC\u05DE\u05D5\u05D3 \u05D0\u05EA \u05D4\u05DE\u05D9\u05DC\u05D4 \u05D4\u05D6\u05D0\u05EA";
const HARD = "\u05D4\u05DE\u05D9\u05DC\u05D4 \u05D4\u05D6\u05D0\u05EA \u05D7\u05D5\u05D6\u05E8\u05EA \u05DC\u05DC\u05DE\u05D9\u05D3\u05D4, \u05E0\u05DC\u05DE\u05D3 \u05D0\u05D5\u05EA\u05D4 \u05E9\u05D5\u05D1 \u05D9\u05D7\u05D3";
const lines = fs.readFileSync(".oplan/word-g1/g1-transcript-expected.txt", "utf8").split("\n");
const count = (s) => lines.filter((l) => l === s).length;
if (count(SOFT) !== 1) { console.log("FAIL: expected file holds the SOFT line " + count(SOFT) + " times, want 1"); process.exit(1); }
if (count(HARD) !== 1) { console.log("FAIL: expected file holds the HARD line " + count(HARD) + " times, want 1"); process.exit(1); }
if (lines.filter((l) => l.indexOf("=== SCREEN") === 0).length !== 3) { console.log("FAIL: want exactly 3 screen separators"); process.exit(1); }
if (lines[lines.length - 1] !== "") { console.log("FAIL: expected file must end with a single trailing newline"); process.exit(1); }
console.log("EXPECTED-SHAPE-OK");
' || exit 1
out=$(node .oplan/word-g1/g1-transcript.mjs 2>&1) || { echo "FAIL: transcript script did not run"; printf "%s\n" "$out" | tail -12; exit 1; }
printf "%s\n" "$out" > "$HOME/g1-scratch/g1-preimpl.txt"
if diff "$HOME/g1-scratch/g1-preimpl.txt" .oplan/word-g1/g1-transcript-expected.txt > /dev/null 2>&1; then
  echo "FAIL: the gate is GREEN before the code exists - it cannot fail, so it proves nothing"; exit 1
fi
node -e '
const fs = require("fs");
const SOFT = "\u05E2\u05D5\u05D3 \u05DC\u05D0 \u2014 \u05E0\u05DE\u05E9\u05D9\u05DA \u05DC\u05DC\u05DE\u05D5\u05D3 \u05D0\u05EA \u05D4\u05DE\u05D9\u05DC\u05D4 \u05D4\u05D6\u05D0\u05EA";
const act = fs.readFileSync(process.env.HOME + "/g1-scratch/g1-preimpl.txt", "utf8");
if (act.indexOf(SOFT) >= 0) { console.log("FAIL: todays code already prints the soft line"); process.exit(1); }
console.log("GATE-CAN-FAIL-OK");
' || exit 1
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ -z "$changed" ] || { echo "FAIL: touched files outside .oplan: [$changed]"; exit 1; }
echo STEP-2.1-OK
