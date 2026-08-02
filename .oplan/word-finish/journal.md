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

## 2026-08-02 — PHASE 1 CLOSED. Gate PHASE-1-CLOSE-OK, exit 0.

STEPS 1.1-1.6 all accepted. Ledger 369 reported / 364 flat / 0 fail; contrast 58; quiz bank 62/84.
Write set for the whole phase, against base e44cffa, is exactly four files:
  public/views/reader.js  public/views/trophies.js  tests/reader-ui.test.js  tests/trophies-ui.test.js
Zero repository deletions. QZ-18 md5s unmoved. CACHE deliberately still v20.

1.5 VISUAL GATE, self-served (owner directive), findings:
  - trophies: ZERO cards locked at or past target. `known` and `proven` -- the exact two the fixture
    was built to reproduce the defect on -- now render earned/full-colour at 5/15 and 1/5. Six cards
    stay legitimately locked below target. Shelf banner reads as a shelf (the word-polish fix holds).
  - reader: left to the word list and came back -> NO loading screen, NO spinner, story present on
    the first paint, and the two screenshots before/after are PIXEL-IDENTICAL, so scroll landed
    exactly where she left it. The answered question was still answered.
  - NEAR-MISS WORTH RECORDING: the first read of the trophy screen showed the DEFECT (5 מתוך 5).
    curl proved the server was serving the FIXED module. A stale localhost service worker was
    serving yesterday's code. Switching to 127.0.0.1:3000 showed the truth. I had skipped the
    plan's own step 3 ("hard-reload past any stale localhost service worker") and nearly reported a
    false regression. -> field guide 23.
  - The dev server DID write to the sandbox (md5 changed); restored from the pristine copy and
    SB=FIXTURE confirmed before closing. The plan's warning was real, not theoretical.

CARRIED OBLIGATIONS INTO LATER PHASES:
  F1-1  phase 4 bumps CACHE magic-vet-v20 -> v21 in public/sw.js:1 AND moves the pin in
        tests/shell.test.js IN THE SAME STEP, with a seam assertion so a half-applied bump fails
        loudly. Two precached files moved in this phase and are unbumped.
  F1-2  R4(ii) IS NOT DONE. Her answers still do not survive a page RELOAD, because nothing reads
        story.checkLog back. Phase 1 fixed only R4(i), the tab-switch case. Needs an owner ruling on
        first-attempt vs best-attempt plus a de-duplication rule. OWNER RULING STILL OUTSTANDING;
        the orchestrator's standing recommendation is "wrong-then-right counts as finished".
  F1-3  UNSCHEDULED LATENT DEFECT: the log-check POST swallows failures and sets st.logged = true
        BEFORE the await, so a failed save is never retried or surfaced. NOTE THE INTERACTION --
        keeping checkState alive for a whole sitting (step 1.3) makes that failure LESS visible,
        not more.
  F1-4  E removed her data from both sandboxes, but NO REPOSITORY GATE CAN EVER SEE THOSE FILES.
        The SBSTATE clause is machine-local. The machine-wide identity sweep (P1-AMENDMENT #1) is
        the only real check and must be re-run at phase 4.
  B-F1-1 CLOSED: the other copies were found and deleted (15 files in two passes). Receipts in
        .oplan/word-polish/backup-receipt.txt.

## 2026-08-02 — PHASE 2 CLOSED. Gate PHASE-2-CLOSE-OK, exit 0.

380 reported / 375 flat / 0 fail; contrast 58; quiz bank 62/84; manifest 2264 == disk 2264.
Write set against 81fb743, .oplan excluded: **22 paths, 0 deletions**. QZ-18 md5s unmoved.
CACHE deliberately still v20.

**PLANNING.** A fresh planner (opus, read-only, spent nothing) wrote plan-phase2.md, 2999 lines,
7 steps, verifying by EXECUTION throughout: it parsed all 2254 shipped clips as ADTS, ran the
shipped resolveLemma over 20270 surface forms, executed migrateWordKeys on three fixtures,
simulated every source edit on a byte-exact mirror outside the repo, and extracted and RAN its own
VAL-F2 preamble — reproducing field guide 17 live (five FAIL: lines, exit 0).

**IT CAUGHT THREE ORCHESTRATOR ERRORS. The first is the one that mattered.**

1. **THE GENERATION SET IS TEN, NOT SIXTEEN — and it had already been ruled, one day earlier.**
   RULING B2 (.oplan/word-polish/journal.md:41, 2026-08-01, owner-approved the same day as B3) says
   base lemmas only, and names the ten. design.md section 3 A, phase-state.md AND my phase-2 brief
   had all lost it; my brief confidently told the planner "the honest number is 16". Four of those
   sixteen ALREADY SPEAK today by de-inflection; generating them puts the inflected form in the
   manifest, stops the fold, and splits a word she already holds — measured on the shipped
   migrateWordKeys: keys ["soft","sudden","wing"] become ["soft","softly","sudden","wing"] and
   soft.taps drops 6 to 5, durably, on the server, invisibly. I verified the ruling's existence and
   its reasoning myself before accepting. Now frozen as FC-6 and written into design.md section 12.
2. **design section 9 "RISK A RESOLVED" asked the right question of the wrong function.** Both
   getAllowedSet() consumers ARE audio-only — reproduced. But api/profile.js:6 imports the manifest
   JSON DIRECTLY as the word-key normalisation table for her durable dictionary. The conclusion
   survives ONLY because of FC-6. **Grep the ARTIFACT, not the accessor.**
3. **No ffprobe or ffmpeg on this machine.** Durations are counted by walking ADTS frames in pure
   node — validated against all 2254 shipped clips, 0 parse errors. And design section 11(3)'s
   "plausible duration FOR THE WORD'S LENGTH" is NOT implementable: length barely predicts duration
   (a 3-letter clip reaches 3.115s; "telecommunications" is 2.133s). The gate is the global measured
   envelope and says so. A gate that fires on correct input is worse than no gate.

**AND I FOUND FOUR THINGS THE PLAN GOT WRONG, all by running it rather than reading it.**

  a. **tests/lemma.test.js also imported deriveWordList** and pinned "manifest must equal
     deriveWordList()". The plan's step-2.1 write set named only word-audio.test.js. Node failed
     loudly, as the planner had verified it would. Field guide 22: the pin names a real property in
     a spelling that named the WRONG PRODUCER. Re-expressed to clipsOnDisk(), never deleted.
  b. **THE PLAN'S STRONGEST GATE COULD NOT PASS WHERE THE PLAN PUT IT.** The executed popup test
     was appended to tests/reader-ui.test.js. public/words-index.js caches the manifest in a
     module-level variable FOR THE PROCESS, and t13StubFetch (:560) stubs it as [] in tests that run
     earlier in the same file — and an empty Set is truthy, so the cache never refills. The popup
     test's own stub was ignored; every word resolved to null. The planner had verified it IN
     ISOLATION and shipped it into a different context — field guide 15's shape, one layer up: the
     assertion was sound, its NEIGHBOURS were not. node --test isolates per FILE, so it moved to
     tests/reader-popup.test.js, which explains why in its own header. Only then did it become a
     real gate, seen to fail on the shipped tree for the right reason.
  c. **styles.css is CRLF=758, not the plan's 748** (729 + 19 for the frozen block, forgetting the
     10-line wrapper). The md5 — the authoritative pin — matched exactly, so the FILE was right and
     the COUNT was wrong. Field guide 21: a digest is the thing; a line count is a proxy.
  d. **Field guide 22(a), for the FOURTH time in this project.** My wrapper comment said
     "AMENDMENT #2", and tests/entry-code.test.js:35 forbids the hash character anywhere after the
     entry-gate marker — the guard against raw hex colours, invisible to the contrast gate. Neither
     the plan nor I saw it; THE SUITE did. The guard names a real, cheap property, so the prose moved.

**A PROCESS FAILURE OF MY OWN, recorded because it is the silent kind.** My first attempt to add a
clause to gate 2.3 silently did nothing — the replacement string never matched, so a clause I
believed I had added was never there, and the gate passed anyway. I rebuilt the tail from a heredoc
and COUNTED the clauses before running. **An edit that is not verified to have landed is not an
edit**, and a gate you believe in is not a gate you have.

**THE MONEY.** 11 API calls. The drift control ran FIRST, through the SHIPPED synthesizeWord(), to a
path outside the repo, reading the shipped clip back afterwards to prove it untouched:
ratios duration 0.818 / bytes 0.855 / voiced 0.844, band 0.5..2, same 24000Hz mono AAC-LC.
NOT DETECTABLY DRIFTED. A second free signal: the ten new clips' median duration is 1.408s against a
2254-clip population median of 1.365s. The manifest came out at md5 6a885982b75e82ef1f00dc6768796ecf
— **the value the plan predicted before a single clip existed**, because it is derived from the disk.

**2.5 VISUAL GATE, self-served, and it earned its place.**
  - The reader popup for an unspeakable word shows the dimmed speaker with a clean diagonal across
    the circle and the caption `coming soon` under it. It reads as *"sound, not yet"* — not "you are
    not allowed" (no red, no prohibition sign) and not "you switched it off" (the glyph is not a
    muted variant). The icon alone could read as muted; the words alone could read as a feature
    announcement; TOGETHER they say the true thing. That pairing is why the owner chose option A.
  - Design section 8's layout requirement VERIFIED by measuring both popups at 414x896 on one
    origin: the Hebrew line sits at y~799 and the save button at y~851 in BOTH. The sheet is
    bottom-anchored, so the caption grows it upward and nothing below the marker moves.
  - The words list shows one marked row among six live ones; the caption sits under its button
    (.say-soon-wrap is the only thing making that true — no test can see it). The row is taller than
    a plain neighbour, but it also carries a 3-line context sentence, and nothing clips or overlaps.
  - **THE NEAR-MISS, and it is F2-3.** The first reading showed NO MARKER AT ALL on a tree where 375
    tests passed. A service worker registered on 127.0.0.1:3000 by PHASE 1'S OWN VISUAL GATE was
    serving the precached magic-vet-v20 reader.js — and because F1-1 defers the CACHE bump, it had
    no reason to refetch. curl proved the server was sending the new file while the browser ran the
    old one. **Field guide 23's remedy ("switch to 127.0.0.1") is SPENT: using it registered a
    worker there.** The working remedy is a DIFFERENT PORT — a different origin has no worker.
    PORT=3100 is supported by scripts/dev-server.js.
  - The dev server wrote to the sandbox (md5 changed, as the plan warned); restored from the
    pristine copy and SB=FIXTURE confirmed before recording.

**INSTRUMENTATION CAUGHT ME TWICE, which is the point of it.** My positive control asserted it
checked 15 forms; it checks 14. And a `grep -c` for written clips in the plan expects 10 but returns
11, because the summary line "wrote 10, skipped 2254" matches the same pattern — a flaw in the
check, not the batch.

**WHAT NOBODY CHECKED, stated plainly:** whether any of the ten clips PRONOUNCES ITS WORD. The agent
cannot hear and the owner waived the listening gate knowingly (design section 11). Blast radius is
one word; the repair is to delete one file and re-run. That is the trade he made.

STEP SUMMARIES (house shape):

  2.1  tier: WORKER-equivalent (frozen apply script, run by the orchestrator)
       did: split deriveWordList into wordsToGenerate/clipsOnDisk/bandWords/readStoryWords,
            deleted writeManifest(words) for writeManifestFromDisk(), moved the manifest write
            into a finally, exported synthesizeWord, created data/story-words.json empty.
       repo write set: 4 files (the plan said 3 — see (a) above).
       surprises: tests/lemma.test.js; field guide 22(a) on my own comment.
       validation_first_try: no (the plan's write set, not the work). retries: 0.
  2.2  tier: WORKER. did: scripts/check-word-audio.mjs + 4 tests. Every clause seen to fire on
       8 fabricated broken fixtures, reproducing the planner's transcript byte-for-byte.
       repo write set: 2 files. validation_first_try: yes. retries: 0.
  2.3  tier: WORKER. did: the frozen section-8 CSS extracted from design.md by script into
       public/styles.css, saySlot() in words.js, the :181 pin re-expressed, +3 tests.
       repo write set: 3 files. surprises: (c) and (d) above.
       validation_first_try: no. retries: 1.
  2.4  tier: WORKER. did: saySlot() in reader.js, two collisions ruled, +2 tests, the executed
       popup harness moved to its own file. repo write set: 3 files. surprises: (b) above.
       validation_first_try: no. retries: 1.
  2.5  tier: ORCHESTRATOR. did: the self-served visual gate. repo write set: EMPTY.
       surprises: F2-3, the service worker. validation_first_try: yes (after the origin change).
  2.6  tier: ORCHESTRATOR (it holds a key and spends money). did: the drift control, the ten
       clips, the manifest at 2264, the count pins, the re-expressed control list.
       repo write set: 14 files. surprises: my own 15-vs-14 hand-count.
       validation_first_try: no. retries: 1.
  2.7  tier: ORCHESTRATOR. did: this close.

FIELD-GUIDE CANDIDATES EARNED THIS PHASE (lessons 24-27, added to the guide):
  24  A LATER RUN'S BRIEF CAN LOSE AN EARLIER RUN'S RULING.
  25  ASK THE QUESTION OF THE ARTIFACT, NOT OF THE ACCESSOR.
  26  ABSENCE FROM A LIST IS NOT ABSENCE OF THE BEHAVIOUR.
  27  A TEST VERIFIED IN ISOLATION IS NOT VERIFIED IN ITS FILE (module caches are process-wide),
      and its companion: THE SERVICE WORKER NOW LIVES ON 127.0.0.1 TOO — use a fresh PORT.
