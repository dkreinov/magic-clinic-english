CURRENT: PHASES 1-4 CLOSED, plus a FOLLOW-ON shipped the same evening (trophy tiers).
  LIVE: dpl_BvYkmV8kygG1X69JcFdBJaahf5jw / english-gbvv15qta-dkreinovs-projects.vercel.app,
  aliased to english-app-three-tan.vercel.app, **magic-vet-v22**, READY.
  Previous: dpl_6piLnUX5zj8zEVzUucLeHqt5aRqG (v21, the phase 1-3 payload) ->
  before that dpl_6pFjJ8LrcyaFodRELCa46BzATUXy (v20).

FOLLOW-ON, 2026-08-02 evening -- TROPHY TIERS MADE VISIBLE (the learner's own report).
  HER WORDS: "the trophies are all colored now, so she doesn't feel like she's achieving
  something ... maybe we should have additional trophies or ... additional ranking, like the
  bronze, silver, gold".
  THE DIAGNOSIS, measured, not guessed: bronze/silver/gold ALREADY EXISTED (8 trophies x 3
  tiers, thresholds owner-signed and catalogue-pinned). The only visual difference between
  bronze and gold on the shelf was a 3px ring COLOUR on a 96px circle, while locked -> bronze
  flipped the whole card from greyscale/45% to full colour. So crossing the FIRST threshold
  looked like finishing. She had earned three levels the screen never showed her.
  THE FIX: three pips per card, filled to the tier, plus ring WEIGHT climbing 3px/5px/7px.
  NO WORDS, so NO NEW HEBREW -- the pips are aria-hidden because the progress line already
  states the same fact in text. The pips take the SAME tier the ring is drawn from, so they
  cannot disagree (the "12 out of 5" seam, closed by construction).
  GATED: 2 new flat tests, both SEEN TO FAIL first; the seam asserted over all 8 trophies x 5
  metric points; the new CSS selectors added to the globally-linked-sheet pin and that pin
  seen to fire when one rule was deleted. Ledger 397/392 -> 399/394. Contrast 58.
  VISUAL GATE self-served at 414x1500 on PORT 3200 -- a FRESH origin, because 3000, 127.0.0.1
  and 3100 all carry service workers from earlier phases (F2-3, field guide 27).
  *** AND THE SANDBOX WAS NEVER TOUCHED: DATA_DIR pointed at a throwaway directory, so the
  restore-the-fixture dance of phases 1 and 2 was designed out rather than performed. md5
  confirmed still 91eff5da59674d7463f462fad659534e. ***
  Predecessor (rollback target): dpl_6pFjJ8LrcyaFodRELCa46BzATUXy, magic-vet-v20 -- CONFIRMED live
  by `vercel inspect` at the phase-4 pre-flight, which discharges phase 2's recorded hypothesis.
PLAN (phase 3): .oplan/word-finish/plan-phase3.md · BRIEF: brief-phase3.md
PLAN (phase 2): .oplan/word-finish/plan-phase2.md · BRIEF: brief-phase2.md
PLAN (phase 1): .oplan/word-finish/plan.md
DESIGN: .oplan/word-finish/design.md · JOURNAL: journal.md · FIELD GUIDE: field-guide/index.md
BASE (phase 1): e44cffa · BASE (phase 2): 81fb743 · BASE (phase 3): <the 2.7 close commit>
ACCEPTED (phase 2): 2.1 3a2b2b3 · 2.2 f6eb81b · 2.3 a6fbd61 · 2.4 e352cfb ·
  2.5 visual gate self-served, PASSED (no repo bytes) · 2.6 45ac2de · 2.7 this commit

STATE OF THE TREE: 405 reported / 400 flat / 0 fail · contrast 58 PASS · quiz bank 78 files/103 items
  · manifest 2266 == clips on disk 2266 (0 dead entries, 0 orphans)  [F2-1 added ellie+sparkle]
  · public/audio/words/index.json md5 8b211ed1524bb272f2474692fba0b7f0, 20037 bytes, LF
  · public/sw.js CACHE magic-vet-v22 (F1-1 spent at v21; v22 is the follow-on's own bump,
    required because public/styles.css and public/views/trophies.js are both PRECACHED) · public/quiz/light.json md5
    f00b091b7f4208ec8783f06a0f6ff320
  · VERIFIED LIVE, md5 worktree==live: sw.js, styles.css, views/{reader,words,trophies}.js,
    quiz/light.json, audio/words/index.json (the manifest-URL probe, kept per design section 9)

PHASE 2 WRITE SET against 81fb743, .oplan excluded: 22 paths, 0 deletions.
  data/story-words.json · public/audio/words/index.json · the ten new .aac ·
  public/styles.css · public/views/reader.js · public/views/words.js ·
  scripts/build-word-audio.js · scripts/check-word-audio.mjs ·
  tests/{lemma,reader-popup,reader-ui,word-audio,words-ui}.test.js

FROZEN CONTRACTS IN FORCE:
  FC-1  public/quiz.js md5 69b6d71117cf776715374abc6f0abb02 and public/quiz-core.js md5
        9a2131be8b9d1b77c219f1e8c3482a71 (QZ-18 — NEVER touched, not even whitespace).
  FC-2  the audio VOICE, MODEL and INSTRUCTIONS in scripts/build-word-audio.js
        (gpt-4o-mini-tts / nova / the existing instructions string). 2264 clips now came from
        those. The ONLY edit to synthesizeWord this phase was the word `export`.
  FC-3  the .oplan awk filter is  awk '$NF !~ /^\.oplan\//'  — TWO backslash bytes.
  FC-4  *** SUPERSEDED AND RE-STATED 2026-08-02 evening. *** The ONE-BUMP rule was about F1-1's
        DEFERRED debt across phases 1-3, and that debt is paid (v20 -> v21, commit cb799b6).
        THE STANDING RULE FROM HERE IS THE ORDINARY ONE (field guide 7 / QZ-22): ANY change to a
        PRECACHED file ships a CACHE bump IN THE SAME COMMIT, with the pin in tests/shell.test.js
        moved in that same commit and the half-applied bump SEEN TO FAIL first.
        NOW: CACHE magic-vet-v22, public/sw.js md5 eb979b08e104049ffe919263200af9e2.
        The precached list is in public/sw.js PRECACHE. Nothing under public/audio/ or
        public/quiz/ is precached, so clips and quiz items never owe a bump (verified, not assumed).
  FC-5  the no-recording marker (design §8, owner-frozen): `btn-say na` + the English caption
        `coming soon`. The CSS lives in design.md's two ```css blocks, is EXTRACTED BY SCRIPT and
        never retyped, md5 6e43cb5e463520f5d277d7d02c5ff26c, and a test asserts it is present in
        public/styles.css byte-for-byte. A tidy-up of the owner's rules fails the suite.
  FC-6  BASE LEMMAS ONLY in data/story-words.json (design §12). Gated by an executed sweep in
        tests/word-audio.test.js AND by a surface guard in tests/reader-ui.test.js. THE SWEEP SIZE
        IS DERIVED FROM THE MANIFEST AND MOVES WITH IT -- do not pin a form count; pin the
        PROPERTY (0 inflected entries, 0 key splits) and let the sweep report what it observed.
  FC-7  no new Hebrew string anywhere. Counts are RAW NON-ASCII BYTES, not characters and not
        grep hits -- reader.js 754 BYTES, words.js 465 BYTES, styles.css 0. (A grep returns 376
        for reader.js because it counts matching LINES; the unit was missing and it misled.)
        Measure with: node -e 'const b=require("fs").readFileSync(f);let n=0;for(const x of b)if(x>127)n++'
        Hebrew is MOVED by byte-slicing, never retyped (field guide 8).
  ENDINGS RE-MEASURED THIS PHASE, by counting bytes only (field guide 16), NEVER with grep:
        public/styles.css CRLF=758 · public/views/reader.js CRLF=959 · public/views/words.js
        CRLF=300 · public/sw.js CRLF=51 · public/index.html CRLF=90 · quiz.js CRLF=346 ·
        quiz-core.js CRLF=99 · all of scripts/ tests/ lib/ and the manifest are LF.

OPEN QUESTIONS: none.

STANDING RULINGS (recorded the day they were made -- field guide 24):
  R-CAPTURE  2026-08-02, OWNER. The frozen live profile capture
        (.oplan/word-quiz/plan.md:1573-1586, the subshell that sources .env INSIDE the parens so
        APP_CODE dies with it) is PRE-AUTHORISED and STANDING. His words: "dont ask me next time
        just capture". DO NOT ask again -- capture when a phase needs her word list.
        UNCHANGED BY THIS: it is the ORCHESTRATOR's to run, never a worker's and never a
        planner's; field guide 3 still forbids every OTHER form of live read; and every capture
        carries a receipt (path, bytes, sha256, counts -- NEVER contents) and a proved DELETION
        at the phase close, because D27 is standing policy and F1-4 must be clean at phase 4.
  R-F3-1  2026-08-02, ORCHESTRATOR. NO PAID API FOR public/quiz/. Items are authored by oplan
        WORKER AGENTS, zero money. design.md:107 named scripts/build-item-bank.js, which builds the
        PLACEMENT bank and has never written a byte into public/quiz/. The real precedent is the
        owner-level D7 (.oplan/word-quiz/design.md:36): "no paid API, no runtime LLM, no second
        key", restated at word-quiz/plan.md:255-258 and word-g1/plan.md:2949.
        *** FIELD GUIDE 24, SECOND TIME THIS RUN, AND MINE: my phase-3 brief asserted "PAID API
        (gpt-4.1-mini)" from memory against a standing ruling. A brief must QUOTE a ruling or ASK
        for it, never recall it. ***
  R-F3-2  2026-08-02, ORCHESTRATOR. The other 83 shipped items are NOT re-swept in phase 3 ->
        carried obligation F3-2, phase 5. They were cleared by a two-pass sweep now MEASURED to
        have missed a named CERTAIN leak (light.json[1]/computer, still shipped, byte-unchanged
        since 24c67dc). Knowingly accepted, and stated on the owner's review page, not hidden.
  R-F3-3  2026-08-02, ORCHESTRATOR. light.json's replacement wording (television->iron,
        computer->clock) is PROVISIONAL, pinned from a simulated tree; light.json goes through the
        3.5 adversarial passes and the 3.6 owner gate like any other item. Pins are re-derived on a
        simulated tree if one word changes -- never hand-edited.
  R-F3-4  2026-08-02, ORCHESTRATOR. WORDS.txt is CAPPED AT 25 BY CONSTRUCTION, so plan 3.0's hard
        N<=25 gate can never stall. Frozen ordering: most-recent-chapter glossary first, then taps
        desc, then lastSeen desc, then LC_ALL=C asc. The remainder is DEFERRED AND REPORTED
        (WORDS-DEFERRED.txt + the owner's page + F3-2), never silently truncated (field guide 18).
  R-F3-5  2026-08-02, ORCHESTRATOR, DURING EXECUTION OF 3.1. HER WORD LIST DOES NOT ENTER THE
        REPOSITORY. plan-phase3 step 3.1 specified topup-3-run1.txt / topup-3-run2.txt under
        .oplan/word-finish/ -- which would write NEED <word> lines, i.e. her vocabulary, into the
        repo. That is the very practice the plan's own section 2.2 flags as a surviving leak
        (.oplan/word-quiz/topup-1-words.txt) and record gap 9 (design.md:17). AMENDED: the two
        run outputs and WORDS.txt live OUTSIDE the repo (/c/Users/dkreinov/f3-stage/), the .oplan
        record carries COUNTS ONLY (backup-receipt.txt), and every step tail parses the outside
        copies. A plan may not re-commit a leak it just identified.
  R-F6-1  2026-08-02, ORCHESTRATOR. THE BASE FOR THE READ-BACK WORK IS **52257c9**, tree clean,
        ledger 399 reported / 394 flat, manifest 2266, CACHE magic-vet-v22.
        *** AND THE BLOCKER WAS MY FAULT, RECORDED AS A PROCESS RULE. *** I told a planner the
        tree was clean at a base and then committed twice underneath it while it worked (e49a0a3,
        52257c9). It saw a red suite and reasonably suspected a flake. NEW RULE: WHILE A PLANNER
        IS RUNNING, THE ORCHESTRATOR DOES NOT COMMIT TO THAT PLANNER'S SUBJECT AREA -- or tells it
        the base moved, in writing, the moment it does. A plan is written against a photograph;
        moving the subject mid-exposure is not the planner's error.
  R-F6-2  2026-08-02, ORCHESTRATOR. SPENT VISUAL-GATE ORIGINS, kept here because every remedy
        that names an origin expires the moment it is used (field guide 27):
        SPENT -- localhost:3000, 127.0.0.1:3000, localhost:3100, localhost:3200.
        NEXT FREE -- 3300. Any visual gate takes the next unused port and ADDS IT TO THIS LINE
        in the same step. A service worker is registered per ORIGIN, and this run has now burned
        four of them.
  R-F6-3  2026-08-02, ORCHESTRATOR. F1-3 IS FIXED IN THE SAME PHASE, AS ITS OWN STEP, AND THE
        FAILURE IS NEVER SHOWN TO THE CHILD.
        The planner is right that it becomes the ONLY remaining loss path once the read-back
        lands, and right that it belongs in the same deploy.
        THE SHAPE, ruled so no step re-opens it: (a) `st.logged` is set to true ONLY AFTER the
        await RESOLVES SUCCESSFULLY -- today it is set before, so a failed save is never retried;
        (b) a failure leaves the question UNLOGGED so the next action retries it, which is
        self-healing and invisible; (c) NOTHING is rendered to her about it. She is eleven and
        learning to read English; an error message about a network write is noise she cannot act
        on, and design decision D14 already says the correction loop must never wait on a human.
        A console warning is the whole of the surfacing.
  B-F3-1  2026-08-02, ORCHESTRATOR, under R-CAPTURE. Phase 3 derives its target word set from a
        live capture, not from a repo-derivable substitute. The alternative was measured once
        already and failed: word-quiz's 50-word pilot bank overlapped her 12 known words in
        ZERO places (.oplan/word-quiz/journal.md, step 6.3), i.e. it would have shipped inert.

CARRIED OBLIGATIONS:
  F1-1  *** DISCHARGED 2026-08-02, commit cb799b6. *** CACHE magic-vet-v20 -> v21 in public/sw.js:1
        AND the pin moved in tests/shell.test.js IN THE SAME COMMIT. The half-applied bump was SEEN
        TO FAIL first (`not ok 4`). The pin was strengthened into a real seam: the version is named
        ONCE and read back out of sw.js, so the two can never drift silently. Verified live: the
        served sw.js md5 equals the worktree's. ORIGINAL TEXT, for the record:
        *** ENLARGED, AND PHASE 2 SAW WHAT IT COSTS ***  Phase 1 left 2 precached files changed
        and unbumped; phase 2 adds public/styles.css, public/views/reader.js and
        public/views/words.js. FOUR distinct precached files are now changed and unbumped.
        See F2-3: this is no longer theoretical.
  F1-2  *** CLOSED 2026-08-02 evening, commit a2bcf09, LIVE at dpl_59SVYjFaALJsAgM3VcLMbBCY9y77. ***
        Her answers now survive a full page RELOAD. reader.js gained restoredCheckState() and
        mergeRestoredChecks(); the read-back runs in boot() after the fresh profile lands and
        before decideStage(), so the FIRST paint already shows what she finished.
        THREE LOAD-BEARING DECISIONS, each measured before it was written:
        (1) correctness is RECOMPUTED against the question on screen, never read from the log
            entry's own `correct` flag -- that flag comes from a correctIndex the BROWSER supplied
            and is never re-checked, so trusting it is the "two sources for one card" seam again;
        (2) the option at correctIndex can NEVER be restored as tried-wrong -- swept over all 128
            combinations, 0 violations -- so she can never be stranded on a question;
        (3) `logged` is FALSE unless already correct. checkLog holds only her FIRST attempt, so a
            wrong-then-right question leaves only the WRONG entry. Marking it logged would stop
            her retry ever being posted and the question would come back unfinished after EVERY
            reload, forever -- the fix re-creating the defect. False makes the log self-healing.
        5 new flat tests, and TWO MUTATIONS PROVED THEY FIRE: forcing logged=true broke the
        wrong-then-right test; trusting entry.correct broke the 128-combination seam sweep.
        The frozen pin "reader.js must not mention checkLog -- R4(ii) is a later obligation" named
        a SCHEDULE, not a property. RE-EXPRESSED (field guide 22), after being seen to fail, into
        the real invariant: reader.js may READ the durable log and POST to it, but must NEVER
        mutate it in place.
  F1-3  *** CLOSED 2026-08-02 evening, same commit, under ruling R-F6-3. ***
        `st.logged = true` moved to AFTER the await resolves. A failed save now leaves the
        question unlogged so her next answer retries it, and the owner's de-duplication ruling
        makes the second entry harmless. NOTHING is shown to her: she is eleven, an error about a
        network write is noise she cannot act on, and D14 says the correction loop must never wait
        on a human. A console warning is the whole of the surfacing.
        *** ITS CHECK IS A GUARD, NOT A GATE, AND IS LABELLED SO IN THE TEST. *** The defect is an
        ORDERING inside an async click handler; the check reads the ORDER IN THE SOURCE and
        therefore fails OPEN. No harness here can stub the imported postJson inside that handler.
        The mutation control was still run: restoring the old ordering fires it.
  F1-4  *** DISCHARGED 2026-08-02. *** The machine-wide sweep ran at the close: OBSERVED 301233
        files, 21 profile-shaped, NONE hers. The tool is now IN THE REPO at
        .oplan/word-finish/identity-sweep.mjs (it prints paths and counts, never a word), with
        .oplan/word-finish/synthetic-check.mjs beside it. *** THE CRITERION WAS WRONG AND IS FIXED:
        phase 1 used "md5 == the frozen synthetic OR <=2 words", which raises a FALSE ALARM on
        finish-art/served-profile.json -- a dev-server rewrite with identical WORD KEYS and
        different bytes. The criterion is now word-key IDENTITY. Identity is the property; md5 was
        a proxy for it. All 5 six-word files pass; 16 are 2-word comparator fixtures. ***
  F2-1  *** CLOSED 2026-08-02 evening, commit e49a0a3, LIVE at dpl_9rA4Y7XoBN2F4H9XyRTLPWTtcmix. ***
        `ellie` and `sparkle` now have clips. Her heroine and her pet stop saying `coming soon`.
        MEASURED SAFE BEFORE SPENDING ANYTHING, through the shipped code: 18122 surface forms
        swept -> 10 gains, 0 regressions, 0 KEY SPLITS; migrateWordKeys leaves her keys and taps
        byte-identical before and after; and `sparkling` (already a band word with a clip) still
        resolves to ITSELF, because resolveLemma tries an exact match before de-inflecting.
        Neither name is a band word, so nothing was shadowed. FC-2 honoured -- same model, voice
        and instructions as the other 2264. FC-6 honoured -- both are base forms, and the executed
        sweep in tests/word-audio.test.js passed unchanged.
        Manifest 2264 -> 2266; clips 2264 -> 2266. NO CACHE BUMP was owed: nothing under
        public/audio/ is precached (verified, not assumed).
        Pins moved, each after being SEEN TO FAIL: word-audio.test.js words/clips/extras,
        reader-ui.test.js five manifest counts.
        *** THE RESIDUAL, STATED: I cannot hear whether either clip pronounces its name. The
        owner waived the listening gate knowingly (design section 11). Blast radius is one word;
        the repair is to delete one file and re-run. ***
  F2-2  lib/quiz-item.js resolves tokens through resolveLemma against a set its CALLERS supply
        (scripts/build-item-bank.js, scripts/quiz-topup.mjs). After phase 2 the bands and the
        manifest are NO LONGER THE SAME LIST (2254 vs 2264). PHASE 3 MUST STATE WHICH ONE IT MEANS.
  F2-3  *** NEW, AND IT WILL BITE PHASE 4'S VERIFICATION *** A SERVICE WORKER IS REGISTERED ON
        127.0.0.1:3000 from phase 1's visual gate, and it serves the precached magic-vet-v20 copies
        of /styles.css, /views/reader.js and /views/words.js. Because F1-1 defers the CACHE bump,
        it has NO REASON TO REFETCH. Phase 2's visual gate looked at YESTERDAY'S CODE and saw the
        marker missing, on a tree where 375 tests passed. Field guide 23 said "switch to
        127.0.0.1"; that advice is now SPENT, because using it registered a worker there.
        THE WORKING REMEDY, used this phase: run the dev server on a DIFFERENT PORT
        (PORT=3100 is supported), which is a different origin and therefore has no worker.
        Phase 4 must either bump CACHE first or use a fresh port for every visual check.

CARRIED INTO A FUTURE RUN (nothing blocks today's deploy):
  F3-1  CLOSED SAME DAY. "Phase 3 ships nothing; the items reach her only at phase 4" -- phase 4 ran
        the same day and they are live. Recorded because "the work was done and she never saw it" is
        this project's documented failure mode and a phase boundary is where it hides.
  F3-2  THE OTHER 83 SHIPPED ITEMS ARE NOT RE-SWEPT (ruling R-F3-2). They were cleared on
        2026-07-27 by a two-pass sweep now MEASURED to have missed a named CERTAIN leak
        (light.json[1]/computer, which shipped byte-unchanged from 24c67dc until today). Phase 5
        should re-sweep them with the poison-controlled instrument built this phase. The frozen
        control lives at C:/Users/dkreinov/f3-poison (3 synthetic items, no data of hers) and the
        same bytes are inline in tests/item-batch.test.js, so the suite does not depend on it.
        THE OWNER WAS TOLD, in plain words, on the review page. He approved anyway.
  F3-3  THE SUITE HAS A MACHINE-LOCAL DEPENDENCY. tests/item-batch.test.js reads
        C:/Users/dkreinov/f3-poison and, when it is absent, prints a `note:` and SKIPS that half --
        a fail-open. The substance is safe (the poison text and its md5s are embedded in the test
        file, so the real assertions run anywhere), but the skip should become a hard failure or
        the path should move into the repo.

BLOCKED: no.

PHASE 3 MUST START FROM:
  · design.md §3 B (the quiz-item risk: isUsableItem validates SHAPE only and cannot tell that a
    distractor is ALSO a correct answer — a shape check is not a correctness check).
  · F2-2 above: decide bands vs manifest for lib/quiz-item.js's allowed set, and say so.
  · the quiz bank is 62 files / 84 items and only ONE of her ~40 words has an item.
  · PAID API (gpt-4.1-mini). The owner must approve the batch and see samples before any item
    reaches her — that gate is NOT waived; §11 waived only the AUDIO listening gate.
  · no change to public/quiz.js or public/quiz-core.js (QZ-18 / FC-1).
