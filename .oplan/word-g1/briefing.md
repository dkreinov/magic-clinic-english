# Briefing — word-g1 (the story of the run, for the human)

## The plan, in plain words (2026-07-28, before anything ran)

WHAT WE ARE BUILDING: Today the app only knows what she TELLS it ("I know this word") and what
the quiz checks. It cannot notice on its own that she is learning. G1 fixes that: a word she
tapped once, and then read again in two later chapters without tapping it, gets marked
"almost knows it". The app's guess is humble on purpose — it never changes her stories; only
passing a quiz question (next phase) or her own "I know this" button turns it into "knows it".

HOW MANY PHASES: 3, each ending in something she can see, deployed (the owner's rule).

PHASE 1 — the engine and the badge  [planned in full, approved by a fresh reviewer]
  What we do:  build the noticing rule, show a third badge כמעט יודעת, keep her claim button,
               back up her data, ship it, and prove nothing was lost.
  Why:         this is the producer every later feature (daily review, the magic clinic) feeds on.
  Done when:   the app is live at v16, all 291 tests pass, and her word collection reads back
               from production with zero losses and every change explained.
  Steps:
    1.1  Put the document she signed into docs/growth.md, with an honest SIGNED line on top —
         because the file of record still says "awaiting signature".
    1.2  Teach the profile that a word can be "almost known", and that when two spellings merge,
         the more-trusted verdict wins — a merge must never quietly discard her progress.
    1.3  Write the noticing rule itself — met again in 2 later chapters, at most 2 automatic
         nominations per word ever, so no word can ping-pong.
    1.4  Run the rule each time a new chapter is made — the one moment her profile is already
         open and about to be saved.
    1.5  Show it to her: the third badge, and the "I know this" button stays — her word always
         outranks the app's guess.
    1.6  Bump the cache version so her phone actually gets the new screen.
    1.7  Look at the badge ourselves in the practice sandbox — no test can judge Hebrew layout.
    1.8  Copy her live word collection to a safe folder BEFORE shipping — first release that
         writes new fields into it, and there is no undo. (We ask the owner here whether the
         backup is deleted at close, like last time.)
    1.9  Ship, and prove the exact bytes we wrote are what the server serves.
    1.10 Read her collection back: zero words lost, every status change explainable — or we
         roll back and stop.
PHASE 2 — candidates get quizzed  [rough sketch]
  What / why / done when: the quiz asks about at most one "almost known" word per sitting; one
  wrong answer sends it back to learning with a kinder message; done when a candidate can
  actually become "known" end to end, deployed.
PHASE 3 — quiz items for candidates  [rough sketch]
  What / why / done when: the weekly item top-up also covers nominated words (else G1 deadlocks
  — a candidate with no quiz item can never pass); done when every claimed OR nominated word
  has an item, deployed.

WHAT WE ARE NOT DOING: nothing the app guesses ever changes her stories; no quiz changes in
phase 1; no off-list word audio; no spaced repetition yet; no runtime AI calls, ever.

BIGGEST RISK: her real profile may have NO word that qualifies yet — the engine would ship
working but invisible. We measure it at step 1.10 (candidates=N) and say so plainly rather
than assume. Second risk: anything lost from her collection — that is why 1.8 backs up first
and 1.10 refuses to pass without a mechanical explanation for every change.

## Phase 1 — plain report (2026-07-28, at the close)

WHAT WE SET OUT TO DO: build the app's first ability to notice she is learning a word, show it
to her honestly, and ship it without risking a single word of her collection.

WHAT WE ACTUALLY DID:
- Made the growth document she signed the official document of record.
- Taught her profile a third word-state, "almost knows it", and made duplicate-word merges keep
  the higher-trust verdict instead of always favouring "knows it".
- Built the noticing rule: looked up once, then met in 2 later chapters untapped → "almost
  knows it"; at most 2 automatic nominations per word, ever.
- Wired the rule to run each time a new story chapter is made.
- Gave her the new badge (כמעט יודעת) and kept the "I know this" button on those words.
- Bumped the cache version, looked at the badge myself in the practice sandbox (5 checks, all
  good), backed up her live collection, shipped, and read her collection back: 20 words, zero
  lost, zero unexplained changes.

WHAT WE FOUND OUT:
- The signed document's own last line said "the file still awaits signature" — copying it
  verbatim would have stamped a false sentence into the record. The helper doing the copy
  stopped and asked instead of guessing; two earlier review layers had missed it.
- One helper accidentally wiped its own work mid-step and retyped it; the independent checker
  caught a one-character difference from the locked text in the retyped version. Fixed,
  re-proven, re-checked.
- Terminal shells silently mangle escape codes (twice today, two different ways) — future
  helpers are now told to write scripts to files instead. Recorded as lessons 13-14.
- She has 0 "almost known" words so far — correct and expected; the engine first runs at her
  next chapter.

WHAT WENT WRONG: nothing reached production wrong. Two mid-run catches (above), both by the
machinery working as designed; the browser needed its stuck profile cleared before the sandbox
look.

WHAT IT COST: about 800,000 helper-tokens across 14 helper/checker calls (planning included);
dollar total not reported by this session's tooling. Wall-clock: one afternoon session.

WHERE WE ARE NOW: live at v16, everything proven, backup kept.

WHAT HAPPENS NEXT: phase 2 — the quiz starts asking about "almost known" words (one per
sitting, one wrong answer sends it back to learning, with a kinder message). We need from you:
(1) the backup question above, (2) optionally: the badge colour is purple by my choice, not
yours — say if you want it different.

=== PHASE 2 — PLAN IN PLAIN WORDS (2026-07-28, reviewed: ship, 0 findings) ===
WHAT WE ARE BUILDING: the quiz learns to ask about "almost known" words. Today the app can
guess she almost knows a word (phase 1), but the guess just sits there — nothing can ever
confirm or take it back. After this phase, one practice question decides it: right = the word
is truly known; wrong = back to learning, said kindly, and the app cannot re-guess the same
word straight away.

PHASE 2 — the quiz decides   [planned in full]
  What we do:  give one quiz slot per sitting to an "almost known" word and act on the answer
  Why:         a guess nothing can confirm is a promise the app never keeps
  Done when:   live at v17, all 298 tests green, both screen-transcripts match exactly, her
               data read back intact
  Steps:
    2.1  I write down by hand, before any code exists, exactly what the new screen must say —
         because a check written after the fact only proves the code agrees with itself.
    2.2  Teach the rule she signed: one wrong answer takes an "almost known" word back and
         restarts its clock; one right answer makes it known — the restart stops ping-pong.
    2.3  Add the picker that gives at most ONE "almost known" word a turn per practice round —
         so a burst of guesses cannot crowd out the words actually causing trouble.
    2.4  Change the wording: a word she never claimed gets the kinder "not yet" line —
         because "goes back to learning" describes a promotion she never saw herself get.
    2.5  Wire the reserved slot into both places a practice round can start.
    2.6  One fresh helper plays the whole thing through like a child would and tries to break it.
    2.7  Bump the cache version to v17 so her phone actually gets the new screens.
    2.8  I open the sandbox app, answer a question wrong on purpose, and look with my own eyes.
    2.9  Back up her live word collection (no backup exists right now — deleted at your word).
    2.10 Ship, and prove the exact bytes we wrote are what the server serves.
    2.11 Read her collection back and prove nothing was lost and every change is explainable.
PHASE 3 — weekly quiz items cover candidates   [rough sketch — planned once phase 2 is done]
  What/Why/Done: an "almost known" word with no quiz question can never pass; the weekly
  item top-up starts covering them too — that closes the loop this phase still leaves open.

WHAT WE ARE NOT DOING: no new quiz questions are generated (phase 3); the strike rules for
words SHE claimed do not change by one character; no colours or styles change; the app still
never lets its own guess alter her stories.
BIGGEST RISK: she may still have 0 "almost known" words (the engine first runs at her next
chapter) — so this phase may ship a working path that quietly waits. We will know: the final
read-back prints the exact count.
=== END ===

--- HANDOFF PROMPT (superseded — phase 2 was executed 2026-07-28; kept for the record) ---
Continue run from: .oplan/word-g1/phase-state.md
Read first: phase-state.md, then plan.md (PHASE 2 SKELETON at the end), then journal.md
  (PHASE 1 section), then field-guide/index.md (14 lessons), then design.md §8 B2/B3/B6(iii)
Resume at: Phase 2 — plan it first (fresh planner, files only), review that plan, THEN execute
Execution mode: autonomous
--- END (superseded) ---

=== PHASE 2 — PLAIN REPORT (2026-07-28) ===
WHAT WE SET OUT TO DO: let one quiz question settle each "almost known" word — right makes it
known, wrong takes it back kindly — without touching any rule for words she claimed herself.
WHAT WE ACTUALLY DID:
- Wrote down by hand, before any code, exactly what the new quiz screen must say — and first
  proved that check FAILS against the old code, so it really tests something.
- Taught the answer rule (one wrong = back to learning + clock restart; one right = known).
- Added the picker that gives at most one "almost known" word a turn per round, reusing the
  existing ranking untouched.
- Put the kinder "not yet" line on screen for words she never claimed; the old line stays,
  byte-for-byte, for words she did claim.
- Wired the reserved first slot into both places a practice round starts.
- Had a fresh helper play the whole thing through like a child and try to break it.
- Bumped the cache to v17; I played a full round in the sandbox myself and answered wrong on
  purpose — the kind message, the first-slot rule, and the after-quiz badge all looked right.
- Backed up her live collection, shipped, proved the exact bytes are live, and read her data
  back: 20 words, nothing lost, nothing changed.
WHAT WE FOUND OUT:
- One of the agreed checks had a bug of its own — it built a fake profile no correct code
  could ever satisfy. The helper doing the work refused to guess, stopped, and asked; I fixed
  the check, not the code. Third time this run a pre-agreed text was wrong and a different
  layer of the machinery caught it.
- A leftover practice server from an old session was squatting on the port with the wrong
  data folder — killed it before it could confuse the sandbox check; added "check the port
  first" to the lesson book.
- One helper caught ITSELF about to paste Hebrew the forbidden way and corrected course.
- She still has 0 "almost known" words — correct: the nominating engine first runs at her
  next story chapter. The quiz slot quietly waits.
WHAT WENT WRONG: nothing reached production wrong; the two catches above cost one round trip
each. One check flagged a cosmetic indent that turned out to be quoted that way in the frozen
plan itself — recorded, left as-is.
WHAT IT COST: about 1,060,000 helper-tokens across 15 helper/checker calls (planning
included); dollar total not reported by this session's tooling. Wall-clock: one session.
WHERE WE ARE NOW: live at v17, everything proven, her data intact, backup KEPT.
WHAT HAPPENS NEXT: phase 3 — the weekly quiz-question top-ups start covering "almost known"
words (today a nominated word with no question can never be confirmed). We need from you:
delete or keep the new backup file? (Kept until you answer.)
=== END PLAIN REPORT ===

--- HANDOFF PROMPT (paste into a fresh session for PHASE 3) ---
Continue run from: .oplan/word-g1/phase-state.md
Read first: phase-state.md, then plan.md (PHASE 3 SKELETON, mid-file, before "PHASE 2 IN
  FULL"), then journal.md (PHASE 2 section), then field-guide/index.md (12 lessons),
  then design.md §8 B7 + §5.5
Resume at: Phase 3 — plan it first (fresh planner, files only), review that plan, THEN execute
Execution mode: autonomous
Model: Opus (PLANNER tier) or better
Context: fresh session recommended — phase 2 filled the orchestrator's context
Before executing:
1. Read the files above fully. 2. git status clean; ledger 298/0; contrast 52; live v17
   (dpl_88eKj1qha7SWcsuHwsNCmh7NHfvw).
3. Re-acknowledge the frozen contracts in phase-state.md.
4. D27 rider answer (delete/keep the phase-2 backup profile-20260728-175238.json) may be in
   the chat above the paste — record it in the journal before anything else; KEEP is the
   default until answered.
--- END HANDOFF PROMPT ---

=== PHASE 3 — PLAN IN PLAIN WORDS (2026-07-28) ===
WHAT WE ARE BUILDING: the weekly batch of new practice questions currently only covers words
she claimed herself. A word the app nominated ("almost known") gets no question, so it can
never be confirmed — the exact deadlock the signed design calls B7. This phase changes the
rule to "her words PLUS the app's nominations", makes that rule a small tested tool instead of
a sentence in an old document, and — only if her real data demands it — writes the missing
questions, has them attacked by two blind checkers, and ships them at v18 after your approval.

LIKELY TWIST, said up front: there is probably nothing to generate today. All 12 words she
knows already have questions, and the app has nominated 0 words so far. If so, the phase
closes early with the tool, the proof, and the skip-list — that is a GOOD outcome, not a
failure, and you can overturn it in one line if you want the phase held open instead.

  3.1 Build the tool that derives the weekly list under the NEW rule, with five tests —
      because a rule that only exists as prose does not run next Tuesday.
  3.2 Fix the one line in the growth document that still teaches the old rule.
  3.3 Copy her live word collection to a safe folder — no copy exists anywhere right now,
      and this same copy is the only honest source of the list.
  3.4 Run the tool on that copy and write down the answer: how many words need questions,
      and every skipped word with its reason. 0 → close here. Over 25 → stop and show you
      the cost first.
  3.5-3.8 (only if needed) Write the questions; two separate helpers, blind to each other,
      try to break every one; every flag is decided in writing; fixes re-checked.
  3.9 (only if needed) You see every new question exactly as she will — hint hidden behind
      the button, answer unmarked — and nothing ships until you say yes.
  3.10-3.12 (only if needed) Cache bump to v18, ship with byte-proof, read her collection
      back and prove nothing was lost.

WHAT WE ARE NOT DOING: words with no audio clip ("off-list") stay skipped — loudly, on a
written list — until their own small step; no visual changes; no new styling; nothing touches
the four fragile CRLF files.
BIGGEST RISK: a new question that marks her wrong for being right — no machine can catch it,
which is why two blind passes AND your eyes stand in front of the deploy.
=== END ===
