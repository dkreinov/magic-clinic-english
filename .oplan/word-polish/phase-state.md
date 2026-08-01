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
