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

## 2026-08-01 — phase 1 planned; THREE orchestrator errors caught by the planner

PLANNER (opus, fresh) wrote FINISH-P1-DRAFT.md, 2159 lines, 6 steps. It verified by EXECUTION:
reproduced defect D on the shipped module (`known` locked while reading `12 מתוך 5`), swept the fix
over 6644 combinations with 0 violations; reproduced defect C in a harness (today: 2 paints, first
without the story; after: 1 paint WITH the story and still exactly 1 profile fetch); extracted E's
generator from the plan and ran it to the frozen md5; measured endings two ways on 20 files.

ORCHESTRATOR ERRORS IT CAUGHT — all three were mine:
1. **"E is the last copy of her data" was FALSE.** It found four more; my follow-up machine-wide
   sweep found a fifth. Two of them (g1-deploy*/live-readback.json) held 20 words and 2 chapters
   read from the LIVE service. All five now deleted, receipts appended. THE LESSON: a deletion
   scoped to the directories I remembered is not a deletion. Only a sweep that asks every file
   "are you a profile?" is trustworthy — that is what found them.
2. **The D line numbers in design.md and the briefing were WRONG.** trophies.js:100-114 is the
   catalogue literal, pinned by a deepStrictEqual; the real seam is cardHtml:163-167. An executor
   sent to my address would have broken a pin and fixed nothing. design.md corrected in place.
3. **E is TWO files, not one** — trophies-val/sandbox/profile.json (15 words) was missed entirely.
   *** CORRECTION 2026-08-02: the sentence that stood here, "Step 1.1's scope grows to cover both",
   was FALSE OF THE PLAN. I asserted the scope change in this journal but never made it in plan.md,
   where step 1.1 named one file and FINDING 1 explicitly excluded the other. The plan reviewer
   caught it as its only HIGH finding. Actually fixed by P1-AMENDMENT #1 at the end of plan.md.
   THE LESSON: writing that something is fixed is not fixing it; the journal must be written FROM
   the plan, never the other way round. ***

PLANNER FOUND A DEFECT IN ITS OWN GATE BY RUNNING IT: §VAL-F1 printed 4 FAIL: lines and EXITED 0,
because the preamble carries no `exit $RC` — run alone it is a REPORT, not a gate. Verified correct
with the tail appended (clean->0, mutated->1). This is the same family as field-guide 16 and is a
field-guide candidate: A PREAMBLE IS NOT A GATE; ONLY PREAMBLE+TAIL IS.

BLOCKERS ANSWERED BY THE ORCHESTRATOR:
- B-F1-1 (the other copies): DELETE, done — 5 deleted; the 2 remaining are dev fixtures and are
  step 1.1's job. Step 1.1 now covers BOTH sandbox files.
- B-F1-2 (R4): CONFIRMED, the planner is right and it corrects my correction. Its mechanism fixes
  R4(i) (state lost on a tab switch) for free. R4(ii) (reading checkLog back) must NOT be folded in:
  it needs an owner-level ruling on first-attempt vs best-attempt and a de-dup rule, and it writes
  SCREEN state from DURABLE data, which is a different risk class. Separate step 1b, after 1.6.
- B-F1-3 (no live measurement): correct and accepted. magic-vet-v20 stays a hypothesis that phase 4
  confirms with `vercel inspect`, exactly as word-polish phase 3 did.

RECORD GAPS PATCHED: design.md's "last copy" claim and its D line numbers (both above).
STILL STALE, patched next: word-polish/plan.md quotes reader.js 845 (now 857), reader-ui.test.js
492 (now 511) and an old sw.js md5; word-finish/phase-state.md still says BASE 0c0f32a.

## 2026-08-02 — STEP 1.1 ACCEPTED (E: her vocabulary leaves both sandboxes)

  tier: ORCHESTRATOR (the generator was frozen in the plan and extracted, not authored here)
  did: ran the plan's frozen generator on english-app-sandbox/profile.json (12 words -> the 6-word
       synthetic candle/feather/garden/mirror/river/window, md5 91eff5da59674d7463f462fad659534e,
       validateProfile OK, overlap 0, before-keys absent from the after-JSON as a string);
       then copied its own pristine output onto trophies-val/sandbox/profile.json (15 words),
       byte-identical, so the frozen artifact was NOT modified to serve a second path.
  repo write set: EMPTY (0 files outside .oplan), as specified.
  surprises: MY SWEEP GATE WAS WRONG ON ITS FIRST RUN. P1-AMENDMENT #1 specified "no profile with
       more than 2 word keys anywhere" -- but the plan's own synthetic fixture has SIX words, so
       the gate flagged its own output. A FALSE FAILURE, not a false pass, so it failed safe; but
       it was still a defective gate, and I wrote it. Corrected to pin IDENTITY, not size: a file
       passes iff its md5 equals the frozen synthetic md5 OR it has <=2 words (comparator fixture).
       Re-run: 19 files accounted for -- 3 frozen synthetic, 16 comparator. NONE IS HERS.
  deviations: none beyond the gate correction above.
  validation_first_try: no (the gate, not the work)
  retries: 0 on the work itself

  THE PATTERN IN TODAY'S FOUR ORCHESTRATOR ERRORS, promoted to a field-guide candidate:
  collapsed grep / wrong trophy line numbers / "covers both" narrated but not made / this sweep
  criterion. Every one is the same move: I ASSERTED WHAT THE ANSWER SHOULD LOOK LIKE instead of
  deriving it from what the step actually produces, and then read my own assertion back as evidence.
  The counter-habit is mechanical: after writing any gate, ask "what does the CORRECT tree look
  like to this check?" and confirm the check passes on it -- not only that it fails on a broken one.
