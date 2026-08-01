CURRENT: phase 3 "ship" — 3.1 through 3.6 ACCEPTED AND SHIPPED. Next step 3.7 (the owner's eyes on
  a real device). The run is PAUSED there by design; 3.8 needs her to use the app first.
PLAN: .oplan/word-polish/plan.md (phase 3 appended in full; phase 1 closed, phase 2 STOPPED)
DESIGN: .oplan/word-polish/design.md · JOURNAL: journal.md · FIELD GUIDE: field-guide/index.md
  (148 lines — lesson 16 added 2026-08-01: grep cannot measure line endings, count bytes)
BASE (phase 3): ae349c6
ACCEPTED: 3.1 afb0131 · 3.2 29d5ea8 · 3.3 3264e59 · 3.4 (deploy, no repo write) · 3.5 (no repo
  write) · 3.6 c856317
STATE OF THE TREE: 358 reported / 353 flat / 0 fail · contrast 58 PASS · quiz bank 62 files/84 items
  · public/ 2372 · LIVE magic-vet-v19 at dpl_6NgAGpyk18SqYrQv7fbTwpZZiX3J
FROZEN CONTRACTS IN FORCE: public/quiz.js md5 69b6d71117cf776715374abc6f0abb02 and
  public/quiz-core.js md5 9a2131be8b9d1b77c219f1e8c3482a71 (QZ-18 — NEVER touched) · .hero-banner,
  .chapter-banner, .celebrate-image unchanged · no new Hebrew string · ENDINGS ON DISK, measured by
  CR-byte count: sw.js CRLF(51), styles.css CRLF(729), reader.js CRLF(845), trophies.js LF(368),
  tests/shell.test.js LF(96) · the .oplan awk filter is awk '$NF !~ /^\.oplan\//' · CACHE v18->v19
  happens EXACTLY ONCE, in step 3.1.
OPEN QUESTIONS: D27 (delete or keep the profile captures on this machine) — asked at 3.9.
BLOCKED: no.

ROLLBACK: (code only) — the deployment live before phase 3, exactly as `vercel inspect` reported it:
  id  = dpl_AVmWnh3XxBZPhLJKnjTUZT9r5EXB
  url = https://english-1jnh1sn5e-dkreinovs-projects.vercel.app
  command:
    "$(npm prefix -g)/vercel" rollback https://english-1jnh1sn5e-dkreinovs-projects.vercel.app --yes
  vercel rollback restores CODE ONLY. There is no restore path for her profile (D27).
  Measured at pre-flight: live /sw.js first line `const CACHE = "magic-vet-v18";`,
  Etag "d76f781dc49c5f629aba0f2dfe3304b6" (== the pre-bump worktree md5 of public/sw.js),
  Cache-Control "public, max-age=0, must-revalidate", Age 161184. All 16 probed paths 200,
  /api/chapter 401 (auth required, correct), /api/health ok.

PHASE 3 EVIDENCE (all gates exit 0):
  3.1 bump — half-applied state seen to fail (not ok 254 + the literal HALF-APPLIED BUMP line);
      sw.js md5 6d836788d379e7872ce730cfec5db51a, shell.test.js md5 ca6c242a97ba1904994d491b5a04aaf8
      — both exactly the values the planner pinned BEFORE execution; double-apply refused.
  3.2 outgoing dpl_AVmWnh3XxBZPhLJKnjTUZT9r5EXB confirmed live; rollback recorded.
  3.3 capture profile-20260801-171305.json, HTTP 200, NEW-PATH-OK, 40 words / 15 known / 6 chapters.
  3.4 ONE deploy: dpl_6NgAGpyk18SqYrQv7fbTwpZZiX3J READY, aliased. CAPTURE->DEPLOY GAP 101s.
  3.5 4/4 MD5 OK live-vs-worktree · v19 count 1, v18 count 0 · 15/15 PRECACHE 200 ·
      audio manifest 200 md5 OK + 3/3 clips md5 OK (NEVER probed by any previous deploy) ·
      9/9 trophy webps md5 OK · health ok · /api/chapter 401 · negative control notafile=404.
  3.6 comparator self-test 8/8 (5 required FAILURES observed); read-back R1 clean —
      C2 and R1 are BYTE-IDENTICAL, sha256 400d67d2d96802dc4d84370cfd0be53b79d354ba9352944abcbb8ea28b3670d2.
  Authenticated GETs used: 2 of the 3 the plan budgeted (3.3 capture, 3.6 R1). 3.8 uses the third.
  MEASURED FOR THE FIRST TIME: live /sw.js is `Cache-Control: public, max-age=0, must-revalidate`,
  and its Etag equals the file's md5 — so the new worker is revalidated on every visit.

--- POST-3.7 ADDENDUM (2026-08-01, owner reported "working" on his phone) ---
3.7 PASSED by the owner's eyes: the shelf reads as a shelf, the speaker button behaves.
NEW DEFECT he found in the same sitting: a LONG press on a story word raised the browser's own
"Copy" callout instead of opening her word popup. Fixed and shipped in the same session:
  · public/views/reader.js — .reader-text gains -webkit-touch-callout/-webkit-user-select/
    user-select: none, and the .reader-text container refuses `contextmenu`, so the release still
    reaches the existing click handler. Same pattern already used at public/views/home.js:47.
  · 2 tests added to tests/reader-ui.test.js, BOTH SEEN TO FAIL FIRST (not ok 251, not ok 252).
  · ACCEPTED SIDE EFFECT (owner's call): story text can no longer be selected/copied at all.
  · CACHE magic-vet-v19 -> v20; half-applied state seen to fail (not ok 256).
  · Commits 427c054 (fix) and ead427e (bump).
SECOND DEPLOY: dpl_6pFjJ8LrcyaFodRELCa46BzATUXy READY, aliased. Capture age at deploy 12s.
  2/2 MD5 OK live==worktree · v20 count 1, v19 count 0 · 15/15 PRECACHE · manifest + 3/3 clips ·
  9/9 webps · notafile=404. Live reader.js carries 1 touch-callout rule and 1 contextmenu handler.
READ-BACK R2 clean. HER PROFILE IS BYTE-IDENTICAL ACROSS BOTH DEPLOYS — all four receipt lines
  share sha256 400d67d2d96802dc4d84370cfd0be53b79d354ba9352944abcbb8ea28b3670d2.
AWARDING-CORRECT: production stamps exactly the six tiers the engine justifies, none invented.
STATE OF THE TREE: 360 reported / 355 flat / 0 fail · contrast 58 · LIVE magic-vet-v20.
STILL OPEN: 3.8's original intent (a read-back AFTER she next reads a chapter) — R2 was taken
  before she used the app, so the quiz fix is still unverified in a real sitting. D27 unanswered.
