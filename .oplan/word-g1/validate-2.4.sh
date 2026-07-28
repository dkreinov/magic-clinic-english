set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
node --check public/quiz.js || { echo "FAIL: node --check"; exit 1; }
crlf=$(file public/quiz.js); case "$crlf" in *CRLF*) ;; *) echo "FAIL: quiz.js line endings were normalised"; exit 1;; esac
node -e '
const SOFT = "\u05E2\u05D5\u05D3 \u05DC\u05D0 \u2014 \u05E0\u05DE\u05E9\u05D9\u05DA \u05DC\u05DC\u05DE\u05D5\u05D3 \u05D0\u05EA \u05D4\u05DE\u05D9\u05DC\u05D4 \u05D4\u05D6\u05D0\u05EA";
const HARD = "\u05D4\u05DE\u05D9\u05DC\u05D4 \u05D4\u05D6\u05D0\u05EA \u05D7\u05D5\u05D6\u05E8\u05EA \u05DC\u05DC\u05DE\u05D9\u05D3\u05D4, \u05E0\u05DC\u05DE\u05D3 \u05D0\u05D5\u05EA\u05D4 \u05E9\u05D5\u05D1 \u05D9\u05D7\u05D3";
const src = require("fs").readFileSync("public/quiz.js", "utf8");
const fail = (w) => { console.log("FAIL: " + w); process.exit(1); };
if (src.split(SOFT).length - 1 !== 1) fail("the soft line must appear exactly once in quiz.js");
if (src.split(HARD).length - 1 !== 1) fail("the hard line must still appear exactly once in quiz.js");
import("./public/quiz.js").then((m) => {
  const item = { sense: "s", sentence: "a ___ b", answer: "x", distractors: ["p","q","r","s","t","u","v","w"] };
  const base = { lemma: "x", item, options: ["x","p","q","r","s","t"], index: 0, total: 4,
                 chosen: "p", correct: false, demoted: true, hintShown: false, wasCandidate: false };
  const cand = m.renderQuizCard({ ...base, wasCandidate: true });
  const claim = m.renderQuizCard(base);
  const none = m.renderQuizCard({ ...base, demoted: false, wasCandidate: true });
  if (cand.indexOf(SOFT) < 0) fail("candidate demotion did not render the soft line");
  if (cand.indexOf(HARD) >= 0) fail("candidate demotion still renders the claimed-word line");
  if (claim.indexOf(HARD) < 0) fail("claimed-word demotion lost its line");
  if (claim.indexOf(SOFT) >= 0) fail("claimed-word demotion renders the soft line");
  if (none.indexOf(SOFT) >= 0 || none.indexOf(HARD) >= 0) fail("a NON-demoting answer renders a demotion line (cry-wolf)");
  for (const [name, html] of [["candidate", cand], ["claimed", claim]]) {
    if (html.split("<p class=\"quiz-demoted\">").length - 1 !== 1) fail("the " + name + " card has != 1 quiz-demoted node - the frozen node order moved");
  }
  return m;
}).then(async (m) => {
  const item = { sense: "s", sentence: "a ___ b", answer: "x", distractors: ["p","q","r","s","t","u","v","w"] };
  const mkC = () => ({ innerHTML: "", querySelector: () => null, querySelectorAll: () => [] });
  const load = async () => item;
  const post = async () => ({ words: { x: { status: "learning" } } });
  let c = mkC();
  let s = await m.startQuiz(c, { lemmas: ["x"], knownSet: new Set(), candidateSet: new Set(["x"]), count: 1, load, post });
  await s.answer("p");
  if (c.innerHTML.indexOf(SOFT) < 0 || c.innerHTML.indexOf(HARD) >= 0) fail("startQuiz did not thread candidateSet into the card");
  c = mkC();
  s = await m.startQuiz(c, { lemmas: ["x"], knownSet: new Set(), count: 1, load, post });
  await s.answer("p");
  if (c.innerHTML.indexOf(HARD) < 0 || c.innerHTML.indexOf(SOFT) >= 0) fail("with no candidateSet the claimed-word line must render (default must be an EMPTY set)");
  console.log("SOFT-LINE-PROBE-OK");
}).catch((err) => { console.log("FAIL: " + err.message); process.exit(1); });
' || exit 1
a=$(node .oplan/word-g1/g1-transcript.mjs) || { echo "FAIL: g1 transcript did not run"; exit 1; }
printf "%s\n" "$a" > "$HOME/g1-scratch/g1-actual.txt"
diff "$HOME/g1-scratch/g1-actual.txt" .oplan/word-g1/g1-transcript-expected.txt || { echo "FAIL: g1 transcript diff is NOT empty"; exit 1; }
b=$(node .oplan/word-quiz/quiz-transcript.mjs) || { echo "FAIL: qz21 transcript did not run"; exit 1; }
printf "%s\n" "$b" > "$HOME/g1-scratch/qz21-actual.txt"
diff "$HOME/g1-scratch/qz21-actual.txt" .oplan/word-quiz/quiz-transcript-expected.txt || { echo "FAIL: the QZ-21 transcript regressed - a claimed-word screen changed"; exit 1; }
cg=$(node scripts/check-contrast.mjs) || { echo "FAIL: contrast gate exit"; exit 1; }
p=$(printf "%s\n" "$cg" | grep -c '^PASS') || p=0
[ "$p" = "52" ] || { echo "FAIL: contrast anchor $p, expected 52"; exit 1; }
flat=$(grep -c '^test(' tests/quiz-ui.test.js) || flat=0
[ "$flat" = "9" ] || { echo "FAIL: quiz-ui.test.js should hold 9 flat tests (8 + 1), got $flat"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 295"*) ;; *) echo "FAIL: ledger not 295"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 295"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 295"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "public/quiz.js tests/quiz-ui.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-2.4-OK
