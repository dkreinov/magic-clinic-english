# Journal — word-finish

## 2026-08-01 — run opened

Owner: "lets drill to solve all issues" + "delete all backups". Standing rule: "always think easy
and robust". Five items carried in: A audio coverage + the manifest-rewrite bound, B quiz items for
her own words, C the story reloading (learner R2, a defect), D the self-contradicting trophy card,
E her real vocabulary sitting in the dev sandbox (found today).

- **D27 CLOSED.** All 10 profile backups deleted at the owner's instruction: 4 in
  english-app-backups, 3 in polish-deploy, 3 in trophies-deploy. Receipt (path, bytes, sha256 —
  never contents) appended to .oplan/word-polish/backup-receipt.txt, commit 0c0f32a. Verified the
  comparator's selftest fixtures are SYNTHETIC (words: cat, dog) and therefore not her data.
  The ONLY remaining copy of her vocabulary on this machine is
  /c/Users/dkreinov/english-app-sandbox/profile.json — that is item E, and it was NOT deleted with
  the backups because it is a dev fixture, not a backup; deleting it silently would have broken the
  sandbox without saying so.
- **KEY DESIGN DECISION (design §2): build-time, not run-time.** The owner proposed generating
  audio and quiz items at run time. Measured why that is the expensive answer here: the quiz bank
  and the clips are static files baked into the deploy, Vercel's runtime filesystem is read-only,
  and the only writable store is Vercel Blob. Run-time would need a blob namespace, a new API
  route, a fallback inside the QZ-18-FROZEN public/quiz.js, spinner-time error handling, and a
  per-word cost. Build-time needs none of those. Accepted cost, stated to the owner: words she
  saves after a top-up wait for the next top-up, which is one command he can run.
- **A's real bound, measured:** build-word-audio.js:102 derives the word list from band1+band2 via
  buildAllowedSet (:40-46) and writeManifest (:95) OVERWRITES public/audio/words/index.json with
  exactly that list. So a story word outside the bands can never be in the manifest and any
  hand-added entry is destroyed next run. Design decides the manifest becomes a statement about
  what is ON DISK. RISK FLAGGED TO THE PLANNER: getAllowedSet() has TWO consumers,
  reader.js:394 and words.js:265, and only one of them is about audio.
- **B's real risk, measured:** isUsableItem validates SHAPE only. It cannot tell that a distractor
  is also a correct answer. A shape check is not a correctness check; the correctness pass is part
  of the work.
