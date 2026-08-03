# journal — word-write (R5: quizzes where she WRITES the word)

Append-only. Counts only, never her words (.oplan is PUBLISHED).

## 2026-08-03 — run opened

BASE baea2b8, tree clean. Baseline suite 433 reported / 428 flat / 0 fail.

MEASUREMENT (two live captures under R-CAPTURE, both deleted with counts-only receipts):
  46 word keys = 16 known + 12 candidate + 18 learning
  46/46 carry a Hebrew translation; 46/46 of those values are DISTINCT
  46/46 have a reachable audio clip (direct or via resolveLemma)
  29/46 have a written quiz item (known 16/16, candidate 9/12, learning 4/18)
  known lemma length min 3 / max 6 / avg 4.4, all pure [a-z]
  skills.writing = state "unknown", score null -- R5 is the one skill never measured

TWO MEASUREMENT BUGS OF MINE, both producing a confident wrong number, both caught by checking
the artifact's actual shape instead of my assumption about it:
  1. /api/profile returns {ok,data}. I read profile.words at the TOP level and reported
     "0 known words" from a 30763-byte file. A zero that large should have stopped me instantly.
  2. public/audio/words/index.json is an ARRAY. Object.keys() gave me indices, so I reported
     "0 of her known words have audio" when the true answer is 16/16.
  Field guide 2 in its plainest form. Recorded because both were MINE, not a worker's.

A THIRD DEFECT, in my own frozen validation, caught before dispatch:
  I wrote the line-ending gate as `CR == 99`, taken from the record. Measured: quiz-core.js has
  CR=99 AND LF=99 -- it is 99 lines. Every step in phase 1 APPENDS lines, so the gate would have
  failed all four steps. The property is CR == LF ("no LF-only line entered a CRLF file"), not a
  fixed count. Field guide 9: a frozen validation can itself be the bug.

DESIGN written (design.md), five owner/orchestrator rulings recorded (R-W-1..R-W-6), six frozen
contracts (WK-1..WK-6). Five new Hebrew strings authored ONCE into design section 6's fenced
block, md5 ad6885fa6c4cc47751051b8f3fb9c9ea / 225 bytes, verified by codepoint dump
(Hebrew U+0590-U+05FF, space, ! and ? only -- nothing else survived or entered in transport).

PLAN REVIEW (fresh CHECKER, read-only) -- VERDICT fix-first, 3 findings, ALL FIXED:
  1. [acceptance] step 1.1 was the ONLY step of four with no enumerated assertion list and no
     negative control -- and its untested branches were exactly the ones WK-4's retry rests on.
     FIXED: 10 enumerated assertions and THREE fail-first controls added, including a sweep
     asserting isRetry:true can never return 'near-miss'.
  2. [boundary] step 1.3's "sweep >=200 seeds and report what you observed" was PROSE ONLY; the
     frozen validation never parsed for it, so a worker could skip the print and nothing would
     catch "0 observed" (field guide 18). FIXED: the validation now parses OBSERVED_DRAWS=<n>
     out of the test output and fails if it is absent or < 200. Mechanically required, not asked.
  3. [missing] I had measured that all 46 words HAVE a Hebrew value, never that those values are
     DISTINCT -- and WK-2's entire design rests on distinctness. FIXED BY MEASUREMENT, not by
     argument: second capture taken, 46/46 distinct, 0 collisions, 45 surviving candidates per
     word against the 3 required, he-pick unbuildable for 0/46 words. WK-2 is free insurance
     against a collision her vocabulary will eventually contain, not a live constraint.
  The reviewer also confirmed, against the real tree: base commit, quiz.js md5, the line-ending
  logic, and that W1-1 (the deferred CACHE bump) is safe because nothing deploys between phases.

STATUS: phase 1 planned in full, phases 2-3 skeletons. Awaiting the owner's go-ahead.

## PHASE 1 — execution

STEP 1.1 grade a typed answer
  tier: WORKER (Sonnet)
  did: normalizeTyped / isNearMiss / gradeTyped appended to public/quiz-core.js; new
       tests/typed-answer.test.js, 27 flat tests.
  surprises: the frozen validation's last line could never pass on this machine (see I-1).
  deviations: three fail-first controls, each seen to fail and named -- removing the
       transposition branch broke the lgiht/light test; ignoring isRetry broke the 4-case retry
       sweep; accepting distance 2 broke the distance-2 test.
  validation_first_try: no (my command was broken, not the work)
  retries: 0 · escalations: 0 · interventions: 1 (I-1, bad-spec, MINE)
  append-only PROVED byte-for-byte: baseline 4197 bytes identical, 1484 appended, 46 CR = 46 LF.
  ledger 433 -> 460 · quiz.js md5 unchanged 69b6d711...
  audit: MATCH, high confidence. The auditor verified the transposition branch by READING the
       algorithm and independently computed that plain-Levenshtein('lgiht','light') is 2, so the
       test is a genuine non-circular check. One narrowing noted: the "empty is never a
       near-miss for ANY answer" claim is exercised against a single answer value; the code's
       `a === ''` short-circuit makes it general, so accepted with the narrowing recorded.
  commit: 2c7eb0e

INTERVENTION I-1 (bad-spec, MINE). `node --test tests/` fails MODULE_NOT_FOUND on Node v22 --
  directory-argument discovery was dropped after v20. It could never have passed, on any tree,
  for ANY of the four steps. Contract GC-1 of the first-build run already recorded this and
  package.json's own script is the bare form. Amended in all four steps and in acceptance
  criterion 1. Verified on a TRULY pristine tree (my first check was contaminated: `git stash`
  does not stash UNTRACKED files, so the new test file stayed behind and failed against the
  reverted implementation, giving a misleading 434/433/fail-1).
  *** THIS IS THE THIRD DEFECT IN MY OWN FROZEN VALIDATIONS THIS RUN *** -- the CR==99 pin that
  would have failed every appending step, the shell-quoting replacement that silently matched
  nothing, and this. And the plan reviewer COULD NOT have caught this one: it is read-only and
  cannot execute, so an unrunnable command is invisible to it. A plan review that cannot run a
  command cannot validate a command.

STEP 1.2 reorder the ranked pool (R3a)
  tier: WORKER (Sonnet)
  did: sampleRanked appended to public/quiz-core.js; new tests/quiz-sampling.test.js, 8 flat
       tests with a seeded LCG (no Math.random in assertions).
  surprises: none
  deviations: fail-first control seen to fail -- replacing the body with `return ranked` broke
       "rank #1 appears among first 4 sometimes and not always".
  validation_first_try: yes · retries: 0 · escalations: 0
  git numstat 16 added / 0 deleted · ledger 460 -> 468 · quiz.js md5 unchanged
  audit: MATCH, high confidence. Confirmed the two properties that matter: output length always
       equals input length (`count` is unused in the body -- it REORDERS, never TRUNCATES), and
       membership is proved by SORTED COMPARISON, not by length alone (a shuffle that duplicated
       one entry and dropped another would survive a length check).
  *** AND THE AUDITOR FOUND A REAL DEFECT IN MY OWN CONTROL. *** OBSERVED_SEEDS printed a
       HARDCODED 500 while the loop broke early. Measured honest count: EIGHT. My gate --
       written precisely so that "a sweep which inspected nothing cannot pass silently" -- was
       passing on a number 62x larger than the work actually done. Field guide 18, in the
       instrument rather than the subject. See I-2.

INTERVENTION I-2 (bad-spec, MINE, found by the step-1.2 auditor). OBSERVED_SEEDS was a HARDCODED
  500 while the sweep broke early after EIGHT seeds. The gate existed precisely so that "a sweep
  which inspected nothing cannot pass silently", and it was passing on a number 62x the work done.
  RULED: remove the early exit, count every seed for real, AND add a distribution assertion --
  rank #1 must land in the first four between 35% and 65% of the time. "Sometimes and not always"
  only proves non-determinism; the rate band proves the draw is actually UNIFORM, which is the
  property she cares about, because a draw biased back toward rank #1 silently restores the very
  complaint the step fixes. Measured after the fix: 250/500 = exactly 50.0%.
  Both directions proved: gutting the sweep to 5 seeds prints 5 and trips the gate; forcing rank
  #1 to the front fails the band at 99.8%.

STEP 1.3 he-pick options without the sameness trap
  tier: WORKER (Sonnet) · validation_first_try: yes · retries: 0 · escalations: 0
  did: selectHeOptions appended to quiz-core.js; new tests/he-options.test.js, 11 flat tests.
  surprises: FIELD GUIDE 8 FIRED FOR REAL. The \u escapes I sent were DECODED into raw Hebrew
       glyphs by the JSON packet in transit. The worker detected it by dumping code points and
       rewrote the file through a quoted heredoc. I had sent only code point NUMBERS in decimal,
       never a glyph -- and the escapes still decoded. Verified independently afterwards: 0 raw
       Hebrew glyphs, 0 non-ASCII bytes, 9 escapes decoding to exactly the 9 specified points.
  deviations: fail-first seen to fail -- removing the one exclusion line produced 156 violations
       in the 200-draw sweep.
  ledger 468 -> 479 · git 40 added / 0 deleted · quiz.js md5 unchanged
  audit: MATCH, high confidence, no findings. Specifically confirmed: the sweep counter is REAL
       and the seed genuinely varies per iteration (checked because of I-2), and the
       "too few candidates" test fails for the RIGHT reason (the exclusion), not by accidentally
       hitting the missing-he branch -- a test that passes for the wrong reason is a defect.
  commit: 2232a78

STEP 1.4 which kind to ask
  tier: WORKER (Sonnet) · validation_first_try: yes · retries: 0 · escalations: 0
  did: QUESTION_KINDS + chooseKind appended; new tests/question-kind.test.js, 15 flat tests.
  surprises: A NEW VARIANT OF LESSON 19 -- the worker's shell printf consumed the % in `n % 4`
       as a format specifier and SILENTLY TRUNCATED the production file mid-append. Caught by
       re-counting bytes, not by reading the file. Repaired and independently verified: prefix
       byte-identical, all 14 exports present, braces balanced, both % operators intact.
  deviations: fail-first seen to fail -- a non-wrapping walk returns null instead of 'cloze-pick'
       on the position-3 wraparound test.
  ledger 479 -> 494 · git 26 added / 0 deleted · quiz.js md5 unchanged
  audit: MATCH, high confidence. Rotation asserted as a SET with a duplicate check (not four
       equalities); wraparound is genuine modulo; -1 handled explicitly because -1 % 4 is -1 in
       JavaScript and would index out of bounds. One unrequested defensive `avail &&` guard,
       harmless, accepted and recorded. No trace of the truncation survived.
  commit: 0373eaa

PHASE 1 CLOSED
  steps: 5 (1.1, 1.2, 1.2b, 1.3, 1.4), first-try passes: 4/5
    (1.1's "no" was MY broken validation command, not the work)
  escalations: 0
  interventions: 2 (I-1 bad-spec MINE, I-2 bad-spec MINE)
  executor stop-with-question events: 2, BOTH CORRECT -- the escalation rule earned its place
    twice in one phase. Neither worker silently substituted a command or picked a threshold.
  cost: unavailable (the harness reports subagent tokens, not dollars, per call:
    executors 57906 + 25418 + 13444 + 30675 + 39444 + 34304 = 201191 subagent tokens;
    checkers 66217 + 18222 + 16748 + 22315 + 19863 = 143365; total 344556 subagent tokens.
    Dollar figures NOT computed -- I will not invent a number the harness did not report.)
  orchestrator_context: unavailable (not queried)
  field_guide: 282 lines (inherited 243 + 4 new lessons). Far over the 40-line budget, as it has
    been since word-trophies; these are commands and mechanisms that do not compress. Justified
    here per the soft-cap rule.

  ACCEPTANCE CRITERIA, all seven run at the gate:
    1 PASS  suite 494 reported / 494 pass / 0 fail  (433 baseline + 27 + 8 + 11 + 15 = 494)
    2 PASS  public/quiz-core.js CR=227 == LF=227, >= 99. Uniform CRLF, no mixed endings.
    3 PASS  exactly 5 paths changed under public/ and tests/: quiz-core.js + the four new tests.
            No view touched. public/quiz.js NOT touched.
    4 PASS  public/quiz.js md5 still 69b6d71117cf776715374abc6f0abb02 (FC-1's freeze lifted but
            deliberately unspent in phase 1).
    5 PASS  every step recorded a fail-first observation: 1.1 three controls, 1.2 one, 1.2b two,
            1.3 one, 1.4 one. Eight controls, every one seen to fail.
    6 RE-EXPRESSED, THEN PASS -- see the plan. The original wording FAILED while the property
            held: step 1.3 INSERTED at line 33 instead of appending at the end. Re-measured as
            the property: 0 of 100 original lines missing or modified, all 7 pre-existing exports
            IDENTICAL as whole function bodies, 128 lines inserted.
            *** THE BLIND SPOT, AND IT IS THE PHASE'S BEST LESSON: `git diff --numstat` reported
            "40 added, 0 deleted" for that step and I accepted it. git reports a MID-FILE
            INSERTION and an END APPEND IDENTICALLY. Zero deletions proves nothing was REMOVED
            and says NOTHING about where additions landed. ***
    7 PASS  none of the four new test files imports a view or opens a network connection.

================================================================================
PHASE 2 VISUAL GATE -- self-served by the orchestrator, 2026-08-03
================================================================================
  ORIGINS: ports 3500 AND 3600 both spent. R-F6-2's spent list is now
    localhost:3000, 127.0.0.1:3000, 3100, 3200, 3300, 3400, 3500, 3600.
    NEXT FREE: 3700.
    WHY TWO: I ran the gate on 3500, found a defect, fixed it -- and 3500 then served the
    PRE-FIX code, because visiting it had REGISTERED A SERVICE WORKER there. Field guide 27
    exactly: "any remedy that names a specific origin expires the moment you use it." Moved to
    3600 to see the fix. A visual gate that finds a defect ALWAYS costs two origins, not one.
  FIXTURE: a throwaway DATA_DIR outside the repo, holding a SYNTHETIC profile -- learner "Nova",
    pet "Pip", and 10 words chosen ONLY because they carry both a quiz item and an audio clip
    (ability, about, abroad, add, afraid, back, bear, behind, beyond, body -- all BANK words).
    Hebrew values are invented nonsense written as escapes. NOTHING OF HERS WAS TOUCHED, so the
    restore-the-fixture dance was designed out rather than performed (the word-finish precedent).
  VIEWPORT: 390 x 844, iPhone-class portrait.

  WHAT WAS SEEN, all four kinds in ONE sitting of four, each exactly once:
    Q1 cloze-pick  -- today's card, unchanged: sentence, hint button, six options with speakers.
    Q2 he-pick     -- Hebrew prompt right-aligned and legible, six English options reading LTR,
                      NO sentence, NO hint button. No overlap, no horizontal scroll at 390px.
    Q3 he-type     -- Hebrew prompt, an EMPTY input whose text enters LEFT-TO-RIGHT and
                      left-aligned on an RTL page (the composite that could have silently gone
                      wrong), the check button large and tappable. NO speaker (R-W-11).
    Q4 listen-type -- prompt, speaker button, input, check. NO ENGLISH TEXT ANYWHERE, so she
                      must actually listen. Exactly the design.
    THE RETRY, driven for real: typed "behnid" for behind -> "almost! look again", her text
    STILL IN THE BOX, no next button, and the correct word NOWHERE on screen. Corrected it ->
    scored right.
    R3(a) VISIBLE: a second sitting opened with a DIFFERENT first question than the first
    sitting. sampleRanked working where she can see it.

  *** THE GATE EARNED ITS KEEP: IT FOUND A DEFECT 550 GREEN TESTS COULD NOT SEE. ***
    After she corrected the typo, the card showed BOTH lines at once:
        "almost! look again"   and   "well done!"
    She would be told she nearly got it AND that she got it, in the same breath. Every part was
    individually correct; the whole was incoherent. Field guide 15(c), and the reason the owner
    directive says a human must LOOK.
    CAUSE: the near-miss line was gated on `retry` alone, and `retryUsed` stays true after the
    answer resolves. FIXED in step 2.7 (`retry && !resolved`), with a test WRITTEN FIRST and
    SEEN TO FAIL against the unfixed code ("1 !== 0"), so it cannot come back.
    RE-CHECKED ON THE FRESH ORIGIN: the "almost" line is gone, only the praise remains.
