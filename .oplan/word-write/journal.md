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
