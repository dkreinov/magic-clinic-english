set -o pipefail
cd /c/Users/dkreinov/claude/english-app || exit 1
need() { n=$(grep -cF "$2" "$1") || n=0; [ "$n" -ge 1 ] || { echo "FAIL: missing in $1: $2"; exit 1; }; }
need lib/profile.js "  if (entry.status === 'candidate') {"
need lib/profile.js "      entry.status = 'learning';"
need lib/profile.js "      entry.lastSeen = now;"
node -e '
const s = require("fs").readFileSync("lib/profile.js", "utf8");
const a = s.indexOf("  if (entry.status === \x27candidate\x27) {");
const b = s.indexOf("\n  if (correct) {");
if (a < 0) { console.log("FAIL: no candidate branch"); process.exit(1); }
if (b < 0) { console.log("FAIL: QZ-12 row 1 (the 2-space `if (correct) {`) is gone"); process.exit(1); }
if (a > b) { console.log("FAIL: the candidate branch must come BEFORE the strike machinery"); process.exit(1); }
console.log("BRANCH-ORDER-OK");
' || exit 1
node -e '
import("./lib/profile.js").then((m) => {
  const fail = (w) => { console.log("FAIL: " + w); process.exit(1); };
  const mk = (over) => ({ words: { feel: { status: "candidate", source: "tap", he: null, taps: 1,
    firstSeen: "2026-01-01T00:00:00.000Z", lastSeen: "2026-01-01T00:00:00.000Z", nominations: 1, ...over } } });
  let p = mk({});
  m.applyQuizAnswer(p, { lemma: "feel", correct: false, sessionId: "s-1", now: "2026-06-01T00:00:00.000Z" });
  let e = p.words.feel;
  if (e.status !== "learning") fail("a wrong answer did not demote the candidate");
  if (e.lastSeen !== "2026-06-01T00:00:00.000Z") fail("B5 clock was not reset");
  if (e.lastQuizAt !== "2026-06-01T00:00:00.000Z") fail("lastQuizAt not stamped");
  if (e.quizWrong !== 1) fail("quizWrong not incremented");
  if ("strikes" in e) fail("the candidate branch touched the strike machinery");
  if ("lastStrikeSession" in e) fail("the candidate branch armed a strike session");
  if (e.nominations !== 1) fail("nominations must not move here");
  if (!m.validateProfile(p).ok) fail("profile no longer validates after a candidate demotion");
  p = mk({ strikes: 1, needsReview: true, lastStrikeSession: "old", nominations: 2 });
  m.applyQuizAnswer(p, { lemma: "feel", correct: true, sessionId: "s-2", now: "2026-06-01T00:00:00.000Z" });
  e = p.words.feel;
  if (e.status !== "known") fail("a right answer did not promote the candidate");
  if ("strikes" in e || "needsReview" in e || "lastStrikeSession" in e) fail("strike bookkeeping survived the promotion");
  if (e.lastSeen !== "2026-01-01T00:00:00.000Z") fail("a pass must not move lastSeen");
  if (e.quizRight !== 1) fail("quizRight not incremented");
  if (e.nominations !== 2) fail("nominations must not move here");
  p = { words: { feel: { status: "known", source: "tap", he: null, taps: 1,
    firstSeen: "2026-01-01T00:00:00.000Z", lastSeen: "2026-01-01T00:00:00.000Z" } } };
  m.applyQuizAnswer(p, { lemma: "feel", correct: false, sessionId: "s-3", now: "2026-06-01T00:00:00.000Z" });
  if (p.words.feel.status !== "known" || p.words.feel.strikes !== 1) fail("QZ-12 row 2 changed - a claimed word now demotes on one wrong answer");
  p = { words: { feel: { status: "learning", source: "tap", he: null, taps: 1,
    firstSeen: "2026-01-01T00:00:00.000Z", lastSeen: "2026-01-01T00:00:00.000Z" } } };
  m.applyQuizAnswer(p, { lemma: "feel", correct: true, sessionId: "s-4", now: "2026-06-01T00:00:00.000Z" });
  if (p.words.feel.status !== "learning") fail("QZ-12 row 1 changed - a learning word was promoted");
  console.log("CANDIDATE-BRANCH-PROBE-OK");
}).catch((err) => { console.log("FAIL: " + err.message); process.exit(1); });
' || exit 1
flat=$(grep -c '^test(' tests/profile-quiz-answer.test.js) || flat=0
[ "$flat" = "12" ] || { echo "FAIL: profile-quiz-answer.test.js should hold 12 flat tests (10 + 2), got $flat"; exit 1; }
sub=$(grep -c 't\.test(' tests/profile-quiz-answer.test.js) || sub=0
[ "$sub" = "0" ] || { echo "FAIL: subtests are forbidden (the ledger)"; exit 1; }
out=$(npm test 2>&1) || { echo "FAIL: suite"; printf "%s\n" "$out" | tail -25; exit 1; }
case "$out" in *"# pass 293"*) ;; *) echo "FAIL: ledger not 293"; printf "%s\n" "$out" | tail -12; exit 1;; esac
case "$out" in *"# fail 0"*) ;; *) echo "FAIL: suite has failures"; exit 1;; esac
out2=$(APP_CODE=dummy npm test 2>&1) || { echo "FAIL: gated suite"; printf "%s\n" "$out2" | tail -25; exit 1; }
case "$out2" in *"# pass 293"*) ;; *) echo "FAIL: APP_CODE=dummy ledger not 293"; exit 1;; esac
changed=$(git status --porcelain | awk '$NF !~ /^\.oplan\// {print $NF}' | LC_ALL=C sort | tr '\n' ' ')
[ "$changed" = "lib/profile.js tests/profile-quiz-answer.test.js " ] || { echo "FAIL: changed set = [$changed]"; exit 1; }
echo STEP-2.2-OK
