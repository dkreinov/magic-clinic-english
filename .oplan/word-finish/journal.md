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

## 2026-08-01 — R4 discovery: she is right, and C and R4 are ONE defect

DISCOVERY AGENT (opus, read-only) verdict: PARTLY TRUE, and the true part is a real defect.
Report: C:/Users/dkreinov/trophies-art/DISCOVERY-R4.md

- Her answers ARE persisted. reader.js:715 -> api/profile.js:104 -> lib/profile.js:422 writes
  story.checkLog durably on every FIRST answer. Generation plays no part in the save.
- NOTHING EVER READS IT BACK. reader.js:546 `const checkState = {};` is declared inside render()
  and seeded from hardcoded literals at :549-555. docs/growth.md:87-88 already documented this:
  "Nothing in the codebase still reads story.checkLog back out." boot() (:397) fetches the whole
  profile and ignores the field.
- app.js:40 `app.innerHTML = ""` + re-render on every hashchange, with a permanent 4-tab nav
  (index.html:25-90). One tab tap = new empty checkState. allQuestionsCorrect (:557) is derived
  purely from it, so doneAll goes false and the chapter looks untouched. quizState (:547) resets too.
- There is NO submit/finish control. The only end-of-chapter button is reader.js:623
  `המשך הסיפור`, wired to runGenerate() (:690-695). renderGenerating() (:523-533) replaces the
  whole view with a spinner, so her work vanishes from screen during generation.

**ORCHESTRATOR CORRECTION, logged because I told the owner the opposite.** I assessed R4 as NOT
mergeable with phase 1's item C. That was wrong. C (the story reloads) and R4 (the answers come
back blank) are TWO SYMPTOMS OF ONE MISSING MECHANISM: leaving the view destroys all state and
nothing restores it. Phase 1's planner is designing that restore right now, so R4 belongs in
phase 1, not in a phase of its own. Decision deferred until the planner's draft lands: either
amend phase 1 or add 1b, whichever its mechanism actually accommodates.

TWO TRAPS ANY FIX MUST HANDLE (from the discovery, not invented):
- checkLog records only her FIRST attempt (reader.js:712). A naive restore strands a
  wrong-then-right question as permanently incomplete AND unreachable.
- checkLog can already contain duplicates from prior re-entries.

SECOND LATENT DEFECT FOUND, not part of R4: the log POST swallows all failures silently
(reader.js:722-724) and sets st.logged = true BEFORE the await -- so a failed save is never
retried and never surfaced. Recorded; not scheduled.

NEEDS A REAL SESSION, could not be verified statically: generation wall-clock (no maxDuration in
vercel.json), and whether her live checkLog holds duplicates.
