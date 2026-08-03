CURRENT: phase 1 "the engine", next step 1.1 — NOT YET DISPATCHED (awaiting owner go-ahead)
PLAN: .oplan/word-write/plan.md
DESIGN: .oplan/word-write/design.md · JOURNAL: journal.md · BRIEFING: briefing.md
FIELD GUIDE: .oplan/word-write/field-guide/index.md (carried forward from word-finish)
BASE: baea2b8, tree clean
BASELINE: 433 reported / 428 flat / 0 fail · contrast gate PASS
  public/quiz-core.js  md5 9a2131be8b9d1b77c219f1e8c3482a71  CR=99 LF=99 (CRLF, 99 lines)
  public/quiz.js       md5 69b6d71117cf776715374abc6f0abb02  CR=346 LF=346 (CRLF)
  public/sw.js CACHE magic-vet-v24 · pin at tests/shell.test.js:64

ACCEPTED: none yet.

FROZEN CONTRACTS IN FORCE:
  WK-1  Kind rotation is a PREFERENCE, not a rule. From the sitting position, walk
        ['cloze-pick','he-pick','he-type','listen-type'] forward with wraparound and take the
        FIRST kind buildable for that word. None buildable -> the question is SKIPPED, exactly
        as an unloadable item is skipped today. A kind is never faked; a prompt is never blank.
  WK-2  he-pick options are drawn from HER OWN other words' English keys, excluding any whose
        stored `he` equals the answer's `he` after trim(). Fewer than 3 survivors -> he-pick is
        NOT buildable and WK-1's walk moves on. Equality is exact string equality on the trimmed
        values -- no normalisation beyond trim(), because Hebrew has no case and anything
        cleverer is an invented rule nobody signed off.
        MEASURED 2026-08-03: her 46 he values are ALL DISTINCT; 45 candidates survive per word
        against the 3 required; he-pick is unbuildable for 0/46 words. WK-2 is free insurance.
  WK-3  The typed input's frozen attribute set:
        type="text" dir="ltr" lang="en" inputmode="text"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
        name="q-<per-question random token>"
        The random name is LOAD-BEARING: mobile Safari and Chrome ignore autocomplete="off" on a
        field name they recognise and re-offer the previous value. A name they have never seen
        has nothing to offer. The existing precedent at reader.js:699 OMITS autocapitalize.
  WK-4  A near-miss retry is ONE question. EXACTLY ONE quiz-answer is posted per question, after
        the answer resolves. Nothing is posted on the near-miss itself.
  WK-5  The ranked list is REORDERED, never TRUNCATED. First `count` entries are drawn uniformly
        from the top min(8, length); the remainder follows in ranked order. Truncation would hand
        her a short sitting whenever an item failed to load, because startQuiz walks and skips.
  WK-6  FC-7 ("no new Hebrew anywhere") is SUPERSEDED for this run. The five new strings live
        ONCE in design.md's ```hebrew-strings block, md5 ad6885fa6c4cc47751051b8f3fb9c9ea,
        225 bytes, and are EXTRACTED BY SCRIPT into the code, never retyped (the FC-5 precedent).
        Verified by codepoint dump: Hebrew U+0590-U+05FF, space, ! and ? only.
  LINE ENDINGS  public/quiz-core.js and public/quiz.js are BOTH CRLF. The check is CR == LF
        (and CR >= the baseline), NEVER a fixed CR count -- the file has 99 lines and CR=99, so
        every append raises both. Measure by counting bytes, never with grep (field guide 16).

STANDING RULINGS (recorded the day they were made -- field guide 24):
  R-W-1  2026-08-03, OWNER. A one-letter near-miss gets ONE FREE RETRY, her typed text kept in
        the box. Counted correct only if the retry is correct. Near-miss is DAMERAU-Levenshtein
        distance 1 -- insertion, deletion, substitution OR adjacent transposition. Transposition
        is named explicitly because `lgiht` for `light` is plain-Levenshtein distance TWO, so a
        plain-Levenshtein implementation would fail on the most common slip a child makes, and
        on the very example the owner was shown when he made this decision.
  R-W-2  2026-08-03, OWNER. The four kinds run in a FIXED ROTATION by position in the sitting.
        This answers R5 item 4 ("listening all the time gets annoying") BY CONSTRUCTION -- audio
        is one question in four, always -- rather than on average.
  R-W-3  2026-08-03, OWNER. R3(a) IS IN SCOPE. The sampling fix ships in this run because
        quiz-core.js must be opened anyway; deferring means unfreezing the same file twice.
  R-W-4  2026-08-03, ORCHESTRATOR. FC-1's BYTE FREEZE ON quiz.js / quiz-core.js IS LIFTED and
        re-expressed as a property pin. Authority checked, not recalled: QZ-18 is a plan-level
        contract of the word-quiz run (.oplan/word-quiz/plan.md:923), NOT an owner decision. The
        md5 pinned a SPELLING; field guide 22 says such a pin moves. REJECTED ALTERNATIVE: a
        second engine beside the frozen one gives two answer paths, two scoring paths and two
        places to post quiz-answer -- field guide 15(b)'s "parts correct, whole incoherent" seam,
        deliberately built. One engine, one scoring path.
  R-W-5  2026-08-03, ORCHESTRATOR. Typing appears in BOTH quiz surfaces (chapter end and the
        words screen). She asked for "quizzes", not for one screen, and both call one engine.
  R-W-6  2026-08-03, ORCHESTRATOR. NO PAID API, NO RUNTIME LLM (owner decision D7 honoured).
        Every Hebrew word comes from entry.he, already stored. Grading is local string
        comparison. This run spends nothing.
  R-F6-2 INHERITED AND EXTENDED. SPENT visual-gate origins: localhost:3000, 127.0.0.1:3000,
        3100, 3200, 3300, 3400. NEXT FREE: 3500 (phase 2). The step that uses it ADDS IT HERE in
        the same step. A service worker is registered per ORIGIN.
  R-CAPTURE INHERITED (owner, 2026-08-02, standing). The frozen subshell capture is
        pre-authorised. Used TWICE this run; both files deleted and verified absent; both
        receipts are counts-only (.oplan/word-write/capture-receipt.txt).

CARRIED OBLIGATIONS:
  W1-1  public/quiz-core.js is PRECACHED (sw.js:16). Phase 1 changes it and does NOT bump CACHE,
        because phase 1 ships no behaviour she can reach. PHASE 2 OWES THE BUMP FOR PHASE 1'S
        BYTES AS WELL AS ITS OWN (magic-vet-v24 -> v25). If this run were abandoned after phase
        1, the bump would still be owed -- recorded so that is a decision, not an accident.
  W1-2  Design section 4.1's RESIDUAL: her actual phone keyboard cannot be driven from here. The
        WK-3 attribute set is correct and complete and the visual gate confirms it at a phone
        width in a desktop browser, but "her keyboard really does stop suggesting" is verifiable
        only by her. MUST appear on the owner's page at phase 3 in plain words, not buried.

INHERITED, STILL OPEN (from word-finish -- not this run's work, recorded so nothing is lost):
  F3-2  The 83 pre-phase-3 quiz items still owe a BLIND second reading. The 2026-08-03 sweep used
        ONE non-blind reviewer against poison it had already read, so it tested the criterion,
        not the reviewer's vigilance. Its two structural findings SHAPE THIS RUN:
        (i)  she answers WITHOUT the sense (quiz.js:186 hides it behind the hint button), so the
             prompt alone must disambiguate -- which is exactly why WK-2 exists.
        (ii) distractors are biased toward words she already knows (quiz-core.js:24), so an
             ambiguous distractor is MOST likely to be shown when it is already her word.
  F3-3  tests/item-batch.test.js reads C:/Users/dkreinov/f3-poison and SKIPS half of itself when
        absent -- a fail-open. Not this run's work.
  R7 remainder: audio top-up is still a MANUAL script run. "coming soon" stays true only as long
        as someone remembers to run it.

OPEN QUESTIONS: none.

BLOCKED: no -- awaiting the owner's go-ahead on the plan briefing before step 1.1 is dispatched.
