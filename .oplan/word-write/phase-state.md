CURRENT: PHASE 1 CLOSED 2026-08-03. All 5 steps accepted, all 7 acceptance criteria run at the
  gate (criterion 6 RE-EXPRESSED -- see below). Next: phase 2 "the screen", to be planned by a
  fresh planner from these files, then reviewed by me.
  SHE SEES NOTHING YET. Phase 1 shipped no reachable behaviour and nothing is deployed.
PLAN: .oplan/word-write/plan.md
DESIGN: .oplan/word-write/design.md · JOURNAL: journal.md · BRIEFING: briefing.md
FIELD GUIDE: .oplan/word-write/field-guide/index.md (carried forward from word-finish)
BASE: baea2b8, tree clean
BASELINE: 433 reported / 428 flat / 0 fail · contrast gate PASS
  public/quiz-core.js  md5 9a2131be8b9d1b77c219f1e8c3482a71  CR=99 LF=99 (CRLF, 99 lines)
  public/quiz.js       md5 69b6d71117cf776715374abc6f0abb02  CR=346 LF=346 (CRLF)
  public/sw.js CACHE magic-vet-v24 · pin at tests/shell.test.js:64

ACCEPTED (phase 1):
  1.1  2c7eb0e  grading a typed answer (normalizeTyped / isNearMiss / gradeTyped)
  1.2  40bc95d  sampleRanked -- R3(a), the "same exact questions" root cause
  1.2b 40bc95d  same commit: OBSERVED_SEEDS made honest AND given a 35-65% uniformity band
  1.3  2232a78  selectHeOptions -- the same-Hebrew exclusion, WK-2
  1.4  0373eaa  QUESTION_KINDS + chooseKind -- the rotation, WK-1

STATE OF THE TREE AT THE PHASE-1 CLOSE:
  suite 494 reported / 494 pass / 0 fail   (433 baseline + 27 + 8 + 11 + 15)
  public/quiz-core.js  CR=227 == LF=227, uniform CRLF, 228 lines, 14 exports
  public/quiz.js       md5 69b6d71117cf776715374abc6f0abb02 -- UNTOUCHED, as phase 1 required
  public/sw.js         CACHE still magic-vet-v24 -- the bump is OWED (W1-1)
  nothing deployed; live is still the previous run's magic-vet-v24

  *** CRITERION 6 WAS RE-EXPRESSED AT THE GATE, AND THE REASON MATTERS FOR PHASE 2. ***
  It was written as "shows only APPENDED lines ... byte-compare the first 99 lines". That FAILED
  while the property held: step 1.3 INSERTED selectHeOptions at line 33 rather than appending.
  The property I actually care about -- no pre-existing line changed or removed -- was then
  measured properly and PASSES: 0 of 100 original lines missing or modified (subsequence check),
  and all 7 pre-existing exports IDENTICAL as whole function bodies.
  THE BLIND SPOT TO CARRY INTO PHASE 2: `git diff --numstat` reported "40 added, 0 deleted" and
  I accepted it. GIT REPORTS A MID-FILE INSERTION AND AN END APPEND IDENTICALLY. Zero deletions
  proves nothing was REMOVED; it says NOTHING about where additions landed. Phase 2 edits
  public/quiz.js, which is 346 lines of working UI -- there, WHERE an edit lands is the whole
  question, so numstat is not an acceptable boundary check.

NEW EXPORTS AVAILABLE TO PHASE 2 (all pure, all rand-threaded, all tested):
  normalizeTyped(s)
  isNearMiss(typed, answer)                      -> bool (Damerau distance exactly 1)
  gradeTyped(typed, answer, {isRetry})           -> 'correct' | 'near-miss' | 'wrong'
  sampleRanked(ranked, count, rand)              -> reordered copy, same membership
  selectHeOptions(answerLemma, words, rand, cnt) -> array of cnt lemmas incl. answer, or null
  QUESTION_KINDS                                 -> ['cloze-pick','he-pick','he-type','listen-type']
  chooseKind(position, avail)                    -> kind string or null; avail is
                                                    {clozePick, hePick, heType, listenType}

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

BLOCKED: no. Owner gave the go-ahead for all phases ("go do all") = CONTINUOUS MODE, so there is
  no pause at the phase boundary. Phase 2 is planned by a fresh planner, reviewed by me, then
  executed in this session.

TWO INTERVENTIONS IN PHASE 1, BOTH MINE, BOTH IN MY OWN FROZEN VALIDATIONS:
  I-1  `node --test tests/` can NEVER pass on Node v22 (MODULE_NOT_FOUND -- directory-argument
       discovery dropped after v20; contract GC-1 already knew, package.json already used the
       bare form). Amended in all four steps. The step-1.1 executor STOPPED and asked instead of
       substituting a command silently.
  I-2  OBSERVED_SEEDS was a HARDCODED 500 while the loop broke early after EIGHT seeds -- my
       anti-decoration gate was itself decoration. Fixed AND strengthened into a 35-65%
       uniformity band; measured 250/500 = exactly 50.0%.
  THE PATTERN: three defective frozen gates in one phase (these two plus the CR==99 pin), none
  catchable by the plan reviewer, because it is READ-ONLY and cannot execute a command. For
  phase 2 I dry-run every frozen command against the real tree BEFORE dispatch.

================================================================================
PHASE 2 RULINGS -- every blocker the fresh planner raised, answered in writing
before any step of phase 2 is dispatched. 2026-08-03.
================================================================================

  R-W-7  B-1, COMMIT STRUCTURE. ORCHESTRATOR. Steps 2.1-2.6 COMMIT INDIVIDUALLY, and the CACHE
        bump is DEFERRED TO STEP 2.6, the last step of the phase.
        The planner proposed holding 2.2-2.6 as one uncommitted block to satisfy QZ-22's "same
        commit" literally. I rule against it: crash-only recoverability beats the letter here.
        Five validated-but-uncommitted steps is exactly the state this machinery exists to avoid.
        THE PROPERTY QZ-22 PROTECTS is that a DEPLOYED tree never carries changed precached bytes
        under an unchanged CACHE name. Nothing in phase 2 deploys. W1-1 already deferred one bump
        on precisely this reasoning, knowingly and on the record, and phase 1 shipped nothing.
        THE REAL GATE MOVES TO PHASE 3's PRE-FLIGHT, and is now mandatory there: assert that
        public/sw.js's CACHE differs from the LIVE deployment's CACHE, and that every precached
        file whose bytes differ from live is covered by that bump. A deferred bump that is never
        checked at the boundary is how F2-3 happened.

  R-W-8  B-2, LINE ENDINGS OF THE NEW GENERATED FILE. ORCHESTRATOR. public/quiz-strings.js is
        **LF**, and the extractor writes a bare newline explicitly rather than relying on the
        platform. It is a GENERATED ARTIFACT, and every generated/scripted file in this repo is
        LF. The CRLF files under public/ are hand-edited legacy. Pinning LF at birth also keeps
        phase 3's md5 worktree-vs-live comparison stable, which is the thing that would otherwise
        bite. Its gate is CR == 0 (NOT CR == LF), and that is stated in the step.

  R-W-9  B-3, IS quiz-strings.js PRECACHED? YES -- AND AN EXISTING TEST ALREADY ENFORCES IT.
        tests/music.test.js:163 is a SEAM test: "every module a PRECACHED file imports is itself
        PRECACHED". It was written after the R8 defect where music.js was imported by two
        precached files without being precached itself, which killed the whole reader OFFLINE --
        414 passing tests did not see it. quiz.js is precached and will import quiz-strings.js,
        so the moment step 2.3 lands, that test FAILS unless PRECACHE is updated.
        CONSEQUENCE FOR THE PLAN, and it is a real ordering defect the planner's own analysis
        surfaced without seeing: a step must leave the suite GREEN, so the PRECACHE entry for
        /quiz-strings.js MOVES EARLIER, into step 2.3, together with its expected-array update in
        tests/shell.test.js. Only the CACHE VERSION BUMP stays in 2.6.

  R-W-10 B-4, NO HINT BUTTON on he-pick, he-type or listen-type. ORCHESTRATOR. Confirmed as the
        planner proposed. The hint reveals item.sense, which is ENGLISH and often does not exist
        at all (17 of her 46 words have no bank item). On a Hebrew-prompted question the Hebrew
        word IS the gloss, so a hint would be absent, redundant, or in the wrong language.
        cloze-pick keeps its hint button exactly as today.

  R-W-11 B-5, NO SPEAKER on he-type. ORCHESTRATOR. Confirmed. he-type is a WRITING test prompted
        by Hebrew; giving it audio makes it listen-type, and R5 item 4 is the whole reason the
        kinds are separated. Recorded as a DELIBERATE omission, not an oversight: a future run
        may add a speaker AFTER the answer resolves (she has written it, now hear it), which is
        pedagogically attractive and is NOT in this run's scope.

  R-W-12 B-6, THE FREE RETRY APPLIES TO BOTH TYPED KINDS. ORCHESTRATOR. Confirmed: he-type AND
        listen-type. R-W-1 names the behaviour, not a kind, and a phone slip is a phone slip
        whichever prompt produced it.

  R-W-13 B-7, AN EMPTY SUBMISSION IS IGNORED. ORCHESTRATOR -- AND THE PLANNER WAS RIGHT TO CALL
        THIS THE MOST DANGEROUS UNANSWERED QUESTION IN THE PHASE.
        A check on an empty or whitespace-only box is a NO-OP: nothing is graded, nothing is
        posted, no retry is consumed, no strike is recorded, and the card does not change.
        WHY, and it is not politeness: gradeTyped on an empty string returns 'wrong' by design
        (step 1.1 asserts empty is never a near-miss), so following the record literally would
        score a MIS-TAP as a wrong answer. A wrong answer adds a strike; and per R3, strikes sort
        FIRST and unconditionally in pickQuizWords, so one accidental tap on an empty box would
        pin a word she actually knows to the front of every future quiz until she got it right
        again. The cost of the literal reading is the exact defect this run exists to fix,
        inflicted by accident. An empty box is not an answer. It is the absence of one.

--------------------------------------------------------------------------------
RECORD GAPS THE PLANNER NAMED -- all seven patched, with measured values
--------------------------------------------------------------------------------

  G-1  THE VIEW TEST FILES (the record named only a cumulative ledger, never the files):
       tests/reader-ui.test.js (33) · tests/reader-popup.test.js (1) · tests/words-ui.test.js (15)
       · tests/quiz-ui.test.js (9) · tests/quiz-core.test.js (8) · tests/quiz-experience.test.js (6)
  G-2  PER-FILE BASELINE COUNTS at the 494 ledger, for the files phase 2 touches or must not break:
       quiz-ui 9 · quiz-core 8 · quiz-experience 6 · reader-ui 33 · reader-popup 1 · words-ui 15 ·
       shell 5 · music 18 · typed-answer 27 · quiz-sampling 8 · he-options 11 · question-kind 15
       (full per-file table measured 2026-08-03; 56 test files, 494 tests.)
  G-3  public/quiz.js NON-ASCII BYTE COUNT = **293**, at baea2b8 AND in the worktree now.
       (blob 8790 bytes CR=0 · worktree 9136 bytes CR=346 -- the count is ending-independent, so
       the "no new Hebrew was typed" gate is sound in either form.)
  G-4  THE CONTRAST ANCHOR IN FIELD GUIDE 5 IS STALE AND IS CORRECTED THERE.
       The code pins **58** PASS lines (tests/quiz-ui.test.js:501). The guide said 52. This is
       the same class of error that made the guide wrong about sw.js being LF.
  G-5  reader.js:699, THE WK-3 PRECEDENT, NOW QUOTED IN FULL:
         <input class="reader-onboard-input" id="heroineName" type="text" dir="ltr"
                autocomplete="off" autocorrect="off" spellcheck="false" />
       It sets FIVE attributes. WK-3 requires NINE. The precedent OMITS lang, inputmode,
       autocapitalize and name. WK-3's claim is confirmed by measurement, not memory.
  G-6  THE VISUAL-GATE FIXTURE. There is no sandbox profile path on the record because phase 1
       never ran a visual gate. RULED NOW: the gate runs against a THROWAWAY DATA_DIR created
       fresh (mktemp -d, outside the repo), exactly as the word-finish follow-on did -- "the
       restore-the-fixture dance was DESIGNED OUT rather than performed". Nothing of hers is
       touched, so there is nothing to restore and no md5 to re-verify.
  G-7  he-pick OPTION COUNT = **6**, not selectHeOptions's default of 4. ORCHESTRATOR ruling.
       cloze-pick shows six (answer + 5 distractors) and ships that way today; two tapping cards
       that look structurally different for no reason is a worse screen. She has 45 surviving
       candidates against the 5 now needed, so buildability is unaffected (measured).
       CONSEQUENCE: step 2.2 calls selectHeOptions(lemma, words, rand, 6) and MUST TEST at
       count=6 -- step 1.3 asserted "length is exactly count" only at the default 4.

--------------------------------------------------------------------------------
MY REVIEW OF THE FRESH PLANNER'S PLAN -- what I changed, and what I kept
--------------------------------------------------------------------------------
KEPT, because they are better than what I would have written:
  · The six-step decomposition, and specifically splitting quiz.js along the pure/stateful line,
    because those two halves need DIFFERENT harnesses (2.3 needs none, 2.4 needs fakeContainer).
  · The non-ASCII byte-count equality on quiz.js as the MECHANICAL form of "no new Hebrew was
    typed by anyone". I had stated that rule in prose with no way to enforce it.
  · scripts/subsequence-check.mjs, and its allowlist re-expression for step 2.4 -- which correctly
    anticipates that 2.4 MUST edit pre-existing lines and that my phase-1 boundary check would
    therefore have failed it. That is field guide 22 applied before the collision, not after.
  · Making the design file itself the ORACLE in the Hebrew test (re-parse the block at test time
    and Buffer.compare), so there is no re-typed literal anywhere that can drift.
  · Asserting the frozen cloze-pick card by STRING EQUALITY against the baea2b8 render, rather
    than by "contains".
CHANGED:
  · R-W-7 (commit structure) -- individual commits, not one held block.
  · R-W-9 -- the PRECACHE entry moves into 2.3, because music.test.js's existing seam test would
    otherwise make 2.3 leave the suite RED.
  · G-7 -- he-pick shows 6 options, not 4.
  · Scratch files move OUT of the repo (field guide 4 forbids scratch in the repo; the plan used
    ./.old-quiz.tmp). Absolute scratch paths are frozen into each packet.

  R-W-14 2026-08-03, ORCHESTRATOR, DURING EXECUTION OF 2.5. A FROZEN PIN AND A MANDATED EDIT
        COLLIDED, AND THE PIN MOVED.
        tests/words-ui.test.js pinned the literal source needle
          lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));
        which step 2.5 must necessarily wrap in sampleRanked(...). The executor STOPPED and asked
        rather than editing a frozen test on its own authority -- correct, and the second time in
        this run the stop-rule has paid for itself.
        THE TEST'S OWN NAME SAYS WHAT IT PROTECTS: "words.js reserves one candidate slot: the
        frozen merge, candidateSet, and the pre-existing quiz wiring". The property is (a) the
        candidate slot is reserved and merged IN FRONT of the ranked pool, and (b) the old
        unmerged pick is gone. Wrapping the pool preserves BOTH. The needle described a SPELLING.
        So the pin MOVES, re-expressed, and is SEEN TO FAIL (field guide 22, and the exact
        precedent of word-finish F1-2, where a pin on `profile = await getJson(...)` moved for
        the same reason).
        RE-EXPRESSED INTO THE REAL INVARIANT: the concat must WRAP the sampled pool, never the
        reverse -- sampling the whole list would shuffle the reserved candidate slot away from the
        head, which is the actual defect the old needle only gestured at. Proved by a control:
        sampling the merged list instead must fail the new assertion.
        *** I REJECTED THE EXECUTOR'S ALTERNATIVE *** of preserving the old literal by assigning
        to a temp and reordering separately. That shapes production code to keep a test's spelling
        intact. Never do that: it buys a green needle with a worse program.
        tests/words-ui.test.js is added to step 2.5's write set and to validate-2.5.sh's expected
        changed-paths list.
