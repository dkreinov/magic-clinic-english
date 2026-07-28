set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
for f in public/views/words.js public/views/reader.js; do
  node --check "$f" || { echo "FAIL: node --check $f"; exit 1; }
  crlf=$(file "$f"); case "$crlf" in *CRLF*) ;; *) echo "FAIL: $f line endings were normalised"; exit 1;; esac
  n=$(grep -cF 'import { pickQuizWords, knownSetFromProfile, pickCandidateWords } from "../quiz-core.js";' "$f") || n=0
  [ "$n" = "1" ] || { echo "FAIL: $f import line"; exit 1; }
  n=$(grep -cF 'const candidateLemmas = pickCandidateWords(profile, 1);' "$f") || n=0
  [ "$n" = "1" ] || { echo "FAIL: $f missing the frozen candidate pick"; exit 1; }
  n=$(grep -cF 'candidateSet = new Set(candidateLemmas);' "$f") || n=0
  [ "$n" = "1" ] || { echo "FAIL: $f missing the frozen candidateSet assignment"; exit 1; }
  n=$(grep -cF 'lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));' "$f") || n=0
  [ "$n" = "1" ] || { echo "FAIL: $f missing the frozen merge"; exit 1; }
  n=$(grep -cF 'lemmas = pickQuizWords(profile, 20);' "$f") || n=0
  [ "$n" = "0" ] || { echo "FAIL: $f still has the OLD unmerged pick"; exit 1; }
  n=$(grep -c 'candidateSet' "$f") || n=0
  [ "$n" = "3" ] || { echo "FAIL: $f mentions candidateSet $n times, expected exactly 3 (declaration, assignment, pass-through)"; exit 1; }
  n=$(grep -cF 'candidateSet,' "$f") || n=0
  [ "$n" = "1" ] || { echo "FAIL: $f does not pass candidateSet into startQuiz"; exit 1; }
done
fw=$(grep -c '^test(' tests/words-ui.test.js) || fw=0
[ "$fw" = "12" ] || { echo "FAIL: words-ui.test.js should hold 12 flat tests (11 + 1), got $fw"; exit 1; }
fr=$(grep -c '^test(' tests/reader-ui.test.js) || fr=0
[ "$fr" = "12" ] || { echo "FAIL: reader-ui.test.js should hold 12 flat tests (11 + 1), got $fr"; exit 1; }
cg=$(node scripts/check-contrast.mjs) || { echo "FAIL: contrast gate exit"; exit 1; }
p=$(printf "%s\n" "$cg" | grep -c '^PASS') || p=0
[ "$p" = "52" ] || { echo "FAIL: contrast anchor $p, expected 52"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 297"*) ;; *) echo "FAIL: ledger not 297"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 297"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 297"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/views/reader.js public/views/words.js tests/reader-ui.test.js tests/words-ui.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-2.5-OK
