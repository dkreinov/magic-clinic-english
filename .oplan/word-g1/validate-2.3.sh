set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
node --check public/quiz-core.js || { echo "FAIL: node --check"; exit 1; }
need() { n=$(grep -cF "$2" "$1") || n=0; [ "$n" -ge 1 ] || { echo "FAIL: missing in $1: $2"; exit 1; }; }
need public/quiz-core.js "export function pickCandidateWords(profile, limit = 1) {"
n=$(grep -cF "export function pickQuizWords(profile, limit = 20) {" public/quiz-core.js) || n=0
[ "$n" = "1" ] || { echo "FAIL: the frozen pickQuizWords signature moved"; exit 1; }
n=$(grep -cF "status === 'known'" public/quiz-core.js) || n=0
[ "$n" = "2" ] || { echo "FAIL: expected exactly 2 'known' comparisons, got $n"; exit 1; }
# AMENDED at plan time (orchestrator, amendment #1): the planner wrote 3, but the shadow
# ASSIGNS status: 'known' ({ ...entry, status: 'known' }) and never COMPARES it, so the
# frozen-contract code leaves the comparison count at 2 (knownSetFromProfile, pickQuizWords).
# The guard's job is unchanged: prove no existing 'known' test moved and none was added.
crlf=$(file public/quiz-core.js); case "$crlf" in *CRLF*) ;; *) echo "FAIL: quiz-core.js line endings were normalised"; exit 1;; esac
node -e '
import("./public/quiz-core.js").then((m) => {
  const fail = (w) => { console.log("FAIL: " + w); process.exit(1); };
  const e = (over) => ({ status: "candidate", source: "tap", he: null, taps: 1,
    firstSeen: "2026-01-01T00:00:00.000Z", lastSeen: "2026-01-01T00:00:00.000Z", ...over });
  const profile = { words: {
    aaa: e({ strikes: 2, lastSeen: "2026-01-01T00:00:00.000Z" }),
    bbb: e({ needsReview: true, lastSeen: "2026-01-02T00:00:00.000Z" }),
    ccc: e({ lastSeen: "2026-01-03T00:00:00.000Z" }),
    ddd: e({ lastSeen: "2026-01-05T00:00:00.000Z" }),
    kkk: e({ status: "known", lastSeen: "2026-01-09T00:00:00.000Z" }),
    lll: e({ status: "learning", lastSeen: "2026-01-08T00:00:00.000Z" }),
    zzz: null
  } };
  const before = JSON.stringify(profile);
  const one = m.pickCandidateWords(profile);
  if (JSON.stringify(one) !== JSON.stringify(["aaa"])) fail("default limit is not 1 / wrong head: " + JSON.stringify(one));
  const all = m.pickCandidateWords(profile, 10);
  if (JSON.stringify(all) !== JSON.stringify(["aaa", "bbb", "ddd", "ccc"])) fail("comparator order wrong: " + JSON.stringify(all));
  const known = m.pickQuizWords(profile, 20);
  if (JSON.stringify(known) !== JSON.stringify(["kkk"])) fail("pickQuizWords no longer returns known-only: " + JSON.stringify(known));
  if (JSON.stringify(profile) !== before) fail("pickCandidateWords mutated the profile");
  if (JSON.stringify(m.pickCandidateWords({}, 5)) !== "[]") fail("empty profile must give []");
  if (JSON.stringify(m.pickCandidateWords(null, 5)) !== "[]") fail("null profile must give []");
  console.log("CANDIDATE-PICK-PROBE-OK");
}).catch((err) => { console.log("FAIL: " + err.message); process.exit(1); });
' || exit 1
flat=$(grep -c '^test(' tests/quiz-core.test.js) || flat=0
[ "$flat" = "8" ] || { echo "FAIL: quiz-core.test.js should hold 8 flat tests (7 + 1), got $flat"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 294"*) ;; *) echo "FAIL: ledger not 294"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 294"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 294"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/quiz-core.js tests/quiz-core.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-2.3-OK
