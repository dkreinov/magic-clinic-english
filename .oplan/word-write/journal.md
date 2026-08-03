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
