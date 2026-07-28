set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
flat=$(grep -c '^test(' tests/quiz-experience.test.js) || flat=0
[ "$flat" = "6" ] || { echo "FAIL: quiz-experience.test.js should hold 6 flat tests (5 + 1), got $flat"; exit 1; }
sub=$(grep -c 't\.test(' tests/quiz-experience.test.js) || sub=0
[ "$sub" = "0" ] || { echo "FAIL: subtests are forbidden (the ledger)"; exit 1; }
ep=$(node --test tests/quiz-experience.test.js 2>&1) || { echo "FAIL: episode file red"; printf "%s\n" "$ep" | tail -30; exit 1; }
case "$ep" in *"# pass 6"*) ;; *) echo "FAIL: episode file not 6 passing"; printf "%s\n" "$ep" | tail -15; exit 1;; esac
case "$ep" in *"# fail 0"*) ;; *) echo "FAIL: episode file has failures"; exit 1;; esac
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 298"*) ;; *) echo "FAIL: ledger not 298"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 298"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 298"; exit 1;; esac
[ ! -f .data/profile.json ] || { echo "FAIL: .data/profile.json exists - a test wrote outside its temp DATA_DIR"; exit 1; }
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "tests/quiz-experience.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-2.6-OK
