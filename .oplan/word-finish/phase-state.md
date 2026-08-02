CURRENT: phase 3 "quiz items" — PLANNED AND ACCEPTED (plan-phase3.md, 2465 lines incl.
  P3-AMENDMENT #1, the orchestrator review). Executing from step 3.1.
PLAN (phase 3): .oplan/word-finish/plan-phase3.md · BRIEF: brief-phase3.md
PLAN (phase 2): .oplan/word-finish/plan-phase2.md · BRIEF: brief-phase2.md
PLAN (phase 1): .oplan/word-finish/plan.md
DESIGN: .oplan/word-finish/design.md · JOURNAL: journal.md · FIELD GUIDE: field-guide/index.md
BASE (phase 1): e44cffa · BASE (phase 2): 81fb743 · BASE (phase 3): <the 2.7 close commit>
ACCEPTED (phase 2): 2.1 3a2b2b3 · 2.2 f6eb81b · 2.3 a6fbd61 · 2.4 e352cfb ·
  2.5 visual gate self-served, PASSED (no repo bytes) · 2.6 45ac2de · 2.7 this commit

STATE OF THE TREE: 380 reported / 375 flat / 0 fail · contrast 58 PASS · quiz bank 62 files/84 items
  · manifest 2264 == clips on disk 2264 (0 dead entries, 0 orphans) · public/ 2382 files
  · public/audio/words/index.json md5 6a885982b75e82ef1f00dc6768796ecf, 20019 bytes, LF
  · LIVE magic-vet-v20 at dpl_6pFjJ8LrcyaFodRELCa46BzATUXy (a hypothesis phase 4 confirms)

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
  FC-4  CACHE magic-vet-v20 -> v21 happens EXACTLY ONCE, in phase 4 (F1-1). public/sw.js md5
        78fc3b0ac1d10de8a5baccb753eca33c.
  FC-5  the no-recording marker (design §8, owner-frozen): `btn-say na` + the English caption
        `coming soon`. The CSS lives in design.md's two ```css blocks, is EXTRACTED BY SCRIPT and
        never retyped, md5 6e43cb5e463520f5d277d7d02c5ff26c, and a test asserts it is present in
        public/styles.css byte-for-byte. A tidy-up of the owner's rules fails the suite.
  FC-6  BASE LEMMAS ONLY in data/story-words.json (design §12). Gated by an executed 20286-form
        sweep in tests/word-audio.test.js AND by a surface guard in tests/reader-ui.test.js.
  FC-7  no new Hebrew string anywhere. reader.js non-ASCII 754, words.js 465, styles.css 0.
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
  B-F3-1  2026-08-02, ORCHESTRATOR, under R-CAPTURE. Phase 3 derives its target word set from a
        live capture, not from a repo-derivable substitute. The alternative was measured once
        already and failed: word-quiz's 50-word pilot bank overlapped her 12 known words in
        ZERO places (.oplan/word-quiz/journal.md, step 6.3), i.e. it would have shipped inert.

CARRIED OBLIGATIONS:
  F1-1  phase 4 bumps CACHE magic-vet-v20 -> v21 in public/sw.js:1 AND moves the pin in
        tests/shell.test.js IN THE SAME STEP, with a seam assertion.
        *** ENLARGED, AND PHASE 2 SAW WHAT IT COSTS ***  Phase 1 left 2 precached files changed
        and unbumped; phase 2 adds public/styles.css, public/views/reader.js and
        public/views/words.js. FOUR distinct precached files are now changed and unbumped.
        See F2-3: this is no longer theoretical.
  F1-2  R4(ii) NOT DONE — nothing reads story.checkLog back, so her answers still do not survive a
        page reload. OWNER HAS RULED (design §10): wrong-then-right counts as FINISHED; a question
        is done if ANY logged attempt is correct; de-dup by questionId. Still needs a step.
  F1-3  latent: the log-check POST swallows failures and sets st.logged=true BEFORE the await.
  F1-4  the sandbox de-identification is machine-local; re-run the machine-wide identity sweep at
        phase 4 (a file outside the repo can never be gated by a repo check).
  F2-1  `Ellie` and `Sparkle` — her heroine's and pet's names — say `coming soon` and no
        band-derived top-up can ever fix them, because the audio manifest is derived from a profile
        with learner: {}. CONFIRMED IN A BROWSER this phase. Two clips at the next top-up close it;
        needs her live profile, so phase 4 or later. A real, small dishonesty, accepted knowingly.
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

BLOCKED: no.

PHASE 3 MUST START FROM:
  · design.md §3 B (the quiz-item risk: isUsableItem validates SHAPE only and cannot tell that a
    distractor is ALSO a correct answer — a shape check is not a correctness check).
  · F2-2 above: decide bands vs manifest for lib/quiz-item.js's allowed set, and say so.
  · the quiz bank is 62 files / 84 items and only ONE of her ~40 words has an item.
  · PAID API (gpt-4.1-mini). The owner must approve the batch and see samples before any item
    reaches her — that gate is NOT waived; §11 waived only the AUDIO listening gate.
  · no change to public/quiz.js or public/quiz-core.js (QZ-18 / FC-1).
