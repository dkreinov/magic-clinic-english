# Journal — run `placement-fix-and-art`

Append-only.

## 2026-07-24 — RUN OPENED

Base commit `04267f5`. Test baseline verified: 146 pass / 0 fail.
Trigger: the owner ran the placement test in the isolated sandbox (localhost:3010) and reported
that the last question — "the one about the kids, how they treat the elephant" — could not be
pressed. Second request: the emoji answer options are often unguessable; use GPT to generate
pictures instead.

## BUG DIAGNOSIS (done before planning)

`renderTask2()` opens with `const text = currentTask2Text();` then dereferences `text.questions`.
`currentTask2Text()` was `bank.task2.find(t => !t.questions.every(q => doneIds.has(q.id)))`,
i.e. "the first text that still has an unanswered question". Once the final answer lands, EVERY
text is fully answered, `find` returns `undefined`, and the dereference throws.

Reproduced deterministically by replaying the real item bank through the real function:
```
answered t2-t1-q1 -> currentTask2Text() = t2-t1
answered t2-t1-q2 -> currentTask2Text() = t2-t1
answered t2-t1-q3 -> currentTask2Text() = t2-t2     <-- silently jumps text WITHOUT "ממשיכים"
answered t2-t2-q1 -> currentTask2Text() = t2-t2
answered t2-t2-q2 -> currentTask2Text() = t2-t2
answered t2-t2-q3 -> currentTask2Text() = undefined
   >>> renderTask2() would throw: TypeError: Cannot read properties of undefined
```
`t2-t2-q3` is "איך הילדים מתייחסים לפיל" — exactly the question the owner named.

The click handler DOES record the answer before `draw()` throws, so the state is updated but the
UI never repaints: from the outside it looks like the button cannot be pressed.

Second, related defect visible in the trace: answering the 3rd question of text 1 auto-advances
to text 2 without the learner pressing `ממשיכים`, which makes the submit handler's own
`if (!isLastText) { draw(); return; }` branch dead code.

NOT CAUSED BY THE PREVIOUS RUN. The entire `warm-dark-theme` diff to `placement.js` is eight
colour lines (`git diff 563dd41..HEAD -- public/views/placement.js`); `renderTask2` came from
`c3a2455 step 3.4: placement UI flow`. Consequence: the placement test has never been
completable, which is almost certainly why the learner's profile still reads "not started".

## EMOJI AUDIT (input to the Phase 2/3 skeletons)

6 of the 12 task1 items are `audio-to-picture`; their options draw from 11 unique emoji:
🐕 pet · 🎬 movie · 🐎 horse · 👩 mom · 🥩 steak · 🌀 fan · 🏕️ camp · 🦁 zoo · 👨 dad ·
🎤 singer · 🧑‍💻 desk.

Genuinely unguessable, confirming the owner's report: `fan`/מאוורר is a spiral 🌀; `desk`/שולחן
is a person at a laptop 🧑‍💻; `zoo`/גן חיות is a lion 🦁.

SEPARATE CONTENT DEFECT that pictures will NOT fix, found during the audit and flagged to the
owner: item `t1-01` asks for `pet` (חיית מחמד) with 🐕 as the correct answer and 🐎 horse among
the distractors. A horse is a pet. The item has two defensible answers and is unfair however it
is drawn. Fixing it means changing a distractor, which is a content change and therefore an
owner decision.

## PLAN REVIEW (fresh eyes, CHECKER tier, before any execution)

VERDICT: fix-first. Two findings, both accepted and fixed:

1. `[validation] 1.1` — `grep -c` counts matching LINES, not occurrences. The four edits produce
   exactly 4 lines containing `task2Index`, but the validation asserted 5, so a perfectly correct
   implementation would have failed, twice, and burned the whole retry budget. Corrected to 4.
   (Same class of error the previous run hit and dodged with `var(--color-danger)`; it landed
   this time. Now field-guide lesson 16.)
2. `[quote] 1.1` — every "currently reads" block in the step was quoted with 2 extra leading
   spaces versus the real file, so a literal search-and-replace would have found nothing.
   Re-quoted at true indentation (verified with `cat -A`), plus an explicit warning that
   `const text = currentTask2Text();` appears twice at two different indentations.

The reviewer separately verified the FIX ITSELF is correct: `text` is genuinely unused in the
rest of the submit handler, `currentTask2Text()` has only the two call sites both covered by the
edits, `allAnswered` still evaluates per-text, `task2Index` lives in the per-mount closure so the
resume and retry paths cannot leave it stale, and no crash route survives.

## PHASE 1 — EXECUTION

STEP 1.1 make the current task2 text explicit state
  tier: WORKER (Sonnet)
  did: added `let task2Index = 0;`; replaced currentTask2Text() body with
    `return bank.task2[task2Index] ?? null;`; added `if (!text) return renderError();` guard in
    renderTask2; in the task2-submit handler removed the now-unused `const text = ...`, changed
    isLastText to `task2Index >= bank.task2.length - 1`, and added `task2Index += 1;`.
  surprises: none · deviations: none · validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=27742, checker=27057 · interventions: 0 · audit: match / CONFIDENCE high
  commit: 51854ec · accepted: 2026-07-24

STEP 1.2 orchestrator end-to-end proof (not dispatched)
  A scratchpad-only harness (linkedom DOM + stubbed Audio/location, real `fetch` pointed at the
  ISOLATED sandbox server on :3010) imports the REAL placement.js module and plays the whole
  flow: intro -> 12 task1 items -> go-task2 -> answer text 1 -> ממשיכים -> answer text 2 ->
  ממשיכים. No repo file created, no production contact, no learner profile touched.

  CONTROL RUN (pre-fix file, extracted with `git show 04267f5:public/views/placement.js`):
    clicked: task2 answer t2-t2-q1
    clicked: task2 answer t2-t2-q2
    THREW while clicking task2 answer t2-t2-q3:
      TypeError: Cannot read properties of undefined (reading 'questions')
    THROWN: TypeError ... | REACHED_DONE: false
  The throw lands on t2-t2-q3 — precisely the elephant question the owner named.

  FIXED RUN: every click succeeds, THROWN: none, REACHED_DONE: true.

  A regression proof that does not fail before the fix is not evidence; this one does, on the
  exact question reported, and passes after. The control also exposed the secondary defect: on
  the pre-fix build the submit button reported DISABLED after text 1, because the view had
  silently swapped to text 2 while the learner was still looking at text 1's questions.

STEP 1.3 bump the service-worker cache (ADDED MID-PHASE — planning defect, mine)
  `/views/placement.js` is line 8 of the PRECACHE array. The original Phase 1 plan deferred the
  cache bump to Phase 4, which would have shipped a fix that every returning device ignored in
  favour of its cached copy — exactly the failure field-guide lesson 9 exists to prevent, from
  the previous run. Caught while preparing to deploy, not by any gate. The rule is now stated
  properly: the bump belongs in whichever phase ships a precached file, never in a later one.
  tier: WORKER (Sonnet) · did: sw.js CACHE magic-vet-v3 -> magic-vet-v4; the matching assertion
    string in tests/shell.test.js. Exactly one changed line per file.
  surprises: none · deviations: none · validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=25087, checker=23190 · interventions: 0 · audit: match / CONFIDENCE high
  commit: 306f11f · accepted: 2026-07-24

ACCEPTANCE CRITERION 7 CORRECTED MID-PHASE
  As originally written it read "the placement flow completes on the LIVE site — verified in the
  isolated sandbox", which is self-contradictory and, taken literally, would have violated this
  run's own hard constraint: driving the flow on production WRITES the learner's profile.
  Rewritten to: the flow is proved by the step 1.2 sandbox harness, and production is verified by
  asserting it serves the fixed bytes. Logged because a criterion that quietly licenses the one
  thing the owner forbade is worth more than a silent edit.

PHASE 1 CLOSED — SHIPPED
  Deployed dpl english-19wjsaomy, READY, production.
  All 7 acceptance criteria pass:
    1. 146/146 tests · 2. contrast gate ALL PASS · 3. STEP-1.1-OK
    4. exactly 3 files changed: public/views/placement.js, public/sw.js, tests/shell.test.js
    5. no Hebrew line added or removed in placement.js; VIEW_STYLE untouched
    6. harness reproduces the TypeError pre-fix and reaches `done` post-fix
    7. production serves `let task2Index = 0;`, the explicit-index return and the guard, serves
       NO `const doneIds = new Set`, and `/sw.js` serves `magic-vet-v4`; the previous run's theme
       is intact on the live CSS (`--color-bg: #241305`).
  steps: 3 (one orchestrator-run) · first-try passes: 2/2 dispatched
  escalations: 0 · interventions: 0 · audits: 2/2 match, CONFIDENCE high
  cost: reviewer=51308, worker=52829, checker=50247, phase total=154384 subagent tokens
  orchestrator_context: unavailable · field_guide: pending curation at the gate
  Learner profile: never contacted. All verification used the isolated sandbox
  (DATA_DIR=scratchpad, no BLOB_READ_WRITE_TOKEN) or plain HTTP GETs of static assets.

## TASK1 AUDIT EXTENSION (input to the owner gate)

The item directions matter more than the original plan assumed:
  audio-to-picture (t1-01..t1-06): the learner hears a word and picks among FOUR emoji.
  picture-to-word  (t1-07..t1-12): the learner is SHOWN one emoji and picks among four English
                                   words. Here the emoji is the only clue — there is no audio
                                   fallback (these six items have no `audio` field at all).
So unclear emoji hurt the second group MORE. Worst case is t1-09: the prompt is 🦁 (a lion) and
the learner must choose "zoo". t1-07 shows 🎤 (a microphone) for "singer".
Unique concepts needing artwork across BOTH groups: 12 (the 11 option emoji plus 🐒 monkey,
which appears only as a prompt).
