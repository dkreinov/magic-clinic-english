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

## OWNER GATE — PASSED (2026-07-25)

Shown: the shipped fix, the 12-concept image scope, and the two decisions.

DECISION A — image method: **reuse the ChatGPT dedicated-chat pipeline** (docs/visual-design.md
§7), not the OpenAI API. Strongest style continuity with the existing 8 assets; browser-driven,
one image at a time, subject to the 89-duplicate incident guarded by field-guide lessons 12–13.

DECISION B — the unfair "pet" item: **swap the horse distractor for camp.** t1-01 options
`["🐕","🎬","🐎","👩"]` → `["🐕","🎬","🏕️","👩"]`. Correct answer 🐕 and correctIndex 0 unchanged;
🏕️ already passes the pictographic test as t1-03's emoji; 4 options stay distinct. One data edit.

ORCHESTRATOR NOTE (risk, surfaced not hidden): the browser tooling has been unreliable this
session — screenshots erroring, a tab dying, JS eval timing out. The ChatGPT pipeline is entirely
browser-driven. The content fix (Decision B) is browser-free and ships first. The image phase
will be attempted; if the browser proves too flaky to drive ChatGPT safely, the run STOPS and
reports rather than looping or risking a duplicate-download mess.

## PHASE 2 CLOSED — content fix shipped to repo (not yet deployed; batched with Phase 4)

STEP 2.1 swap horse distractor for camp in t1-01
  tier: WORKER (Sonnet) · did: data/placement-items.json t1-01 options[2] 🐎 -> 🏕️, byte-copied
    from t1-03 to preserve the variation selector; correctIndex/emoji/everything else unchanged.
  surprises: none · deviations: none · validation_first_try: yes · retries: 0 · escalations: 0
  tokens: worker=25885, checker=23902 · interventions: 0 · audit: match / high (auditor confirmed
    options[2] is U+1F3D5 U+FE0F, the camp emoji, correctly)
  commit: 33db1a6 · accepted: 2026-07-25
  NOTE: not deployed on its own — a data-only change ships with the Phase 4 image wiring so there
  is one deploy, not two. Until then production still shows the horse distractor; the fix is in
  the repo and the sandbox.

## PHASE 3 — BLOCKED, run paused for the owner

Phase 3 (generate 12 option icons) is fully SPECIFIED — 12 frozen icon prompts, a shared ICON
SUFFIX, storage/optimize/validation pipeline, all in plan.md — but NOT executed, because the
method the owner approved cannot currently be driven:

- The dedicated ChatGPT chat (visual-design.md §7 URL) returns "This content is unavailable or
  could not be found", then on retry stalls forever on a spinner with 0 conversation turns.
- A NEW chat and the rest of ChatGPT load fine; the account is logged in (Plus). So ChatGPT is
  up — the specific months-old, image-dense chat is the problem.
- The browser tooling has been intermittently flaky this whole session (screenshots erroring, a
  tab dying, JS eval timing out earlier), which compounds the risk of a 12-image manual run.

Per oplan's terminal-state rule, a stopped run beats a loop nobody is watching. Everything
deterministic is frozen so the phase resumes cleanly once the method question is answered:
prompts, pipeline, validation, and the fact that the local style anchor
(assets/design-tests/dragon-clinic-test.png) and all 8 masters still exist for a new-chat
fallback.

DESIGN DECISION logged in the plan: the option art is ICON TILES (single centered subject, simple
background) not full scenes, because they render at ~76px; a busy fantasy scene is unreadable at
that size. This is a deliberate departure from the §6 FROZEN STYLE SUFFIX, governed by tile-size
readability, keeping the rendering style.

RUN STATUS: Phase 1 (bug) shipped and live-verified. Phase 2 (fairness) in repo, ships with
Phase 4. Phases 3–5 pending OPEN QUESTION 3.

## OWNER DIRECTION (2026-07-25): RICH scenes, and dedicated chat CONFIRMED gone

Owner: "I want rich since this is for my kid." The icon-tile decision is overridden: Phase 3
prompts are now rich scenes in the full §6 FROZEN STYLE SUFFIX world, each naming its subject as
the central hero so it still reads at tile size. Phase 4 correspondingly enlarges the option tiles
(~150px near-square, image fills the tile) so rich art is legible — additive styling, gate
unaffected.

Dedicated ChatGPT chat re-tested a third time: navigating to the /c/6a632008... URL now REDIRECTS
to chatgpt.com/ root (0 turns, 0 images, composer only). A redirect away from the conversation is
definitive — that chat is inaccessible to this account (deleted, or its share/ownership lapsed).
It is not retryable. The approved method is therefore dead, and the remaining fork (new ChatGPT
chat with the local anchor re-uploaded, vs the scripted OpenAI API) is back to the owner as the
one blocking decision. All rich prompts and the pipeline are frozen and ready.

## API DIAGNOSIS (2026-07-25) — and a CORRECTION to my earlier read

I first said the OpenAI 500s were "a server-side outage on their end, not our key". That was
too confident and is PARTLY WRONG. Evidence, gathered after the owner pushed back:

- `/v1/models`, `/v1/chat/completions` and `/v1/images/generations` ALL return HTTP 500 with this
  account's key — via node `fetch` AND via `curl --ssl-no-revoke` (so it is not the corporate TLS
  proxy, and not a node-specific problem).
- The error bodies carry genuine OpenAI request IDs (e.g. `req_3bd245e1f18743d5be12387eb6ef61ce`),
  so we ARE reaching OpenAI; a proxy is not synthesising these.
- DECISIVE CONTROL: a deliberately INVALID key returns a clean **401** with a correct
  "Incorrect API key provided" message. Their auth layer is healthy and discriminating.
- status.openai.com reports "Partial System Degradation" (indicator: minor).

Conclusion: this is NOT a blanket outage. Garbage keys get correct 401s while THIS key 500s on
every endpoint — which points at something specific to this key / project / account (billing,
quota, project config, or a degraded backend for this org), possibly compounded by the reported
partial degradation. I cannot see the account from here, so the next move is the owner's:
check platform.openai.com billing + the project that issued this `sk-proj-...` key.

## PROCESS NOTE (owner asked: "are we running oplan or freestyle?") — honest answer

oplan, for everything that is committed. Phases 1 and 2 each went through the full discipline:
plan -> fresh plan reviewer -> executor packet -> orchestrator re-runs the frozen validation ->
fresh auditor -> commit -> journal + phase-state. Commits 51854ec, 306f11f, 33db1a6 are the
record, and the two escalations/corrections are logged.

But the last stretch DRIFTED. Probing the API is legitimate orchestrator work (like the 1.2 and
2.4 harnesses). Writing `generate-placement-art.mjs` — real deliverable code that spends the
owner's money — into the scratchpad with no frozen validation command and no auditor was NOT
oplan; that should be a proper Phase 3 step. The owner interrupted at exactly the right moment.

CORRECTION TO THE RUN: Phase 3 has NOT been dispatched. When the API question is resolved, the
generator ships as a real oplan step: a committed script under `scripts/`, a frozen validation
(12 masters exist, square, content-distinct by md5), an executor packet, and a fresh-eyes audit.
No image generation happens outside that.

## 2026-07-25 — CORRECTION #2 (the decisive evidence) + WEB-PATH FEASIBILITY TEST

### I was wrong to point at the owner's account. It IS an OpenAI outage.

Last entry I said the 500s pointed at "something specific to this key / project / account
(billing, quota, project config)" and that the owner should check platform.openai.com billing.
**That advice was wrong. Retract it.** The owner then hit an auth failure on OpenAI's own login
page, whose payload decodes to:

    {"kind": "AuthApiFailure", "errorCode": "primaryapi_server_error", ...}

and `status.openai.com/api/v2/summary.json` reports an ACTIVE INCIDENT ("Elevated error rates",
investigating) with ~22 components in `degraded_performance`, explicitly including **Login**,
**Images**, **Sites**, **Responses**, **Conversations**, **Files** and **Embeddings**.

Why my invalid-key control test misled me: an INVALID key is rejected at the edge (fast 401, no
backend lookup), while a VALID key requires the primary API to resolve the account — and the
primary API is exactly what is erroring. So "garbage key -> clean 401" and "real key -> 500" are
fully consistent with their outage, and are NOT evidence of an account problem. The control test
was sound; my inference from it was not. Lesson for the field guide: an auth-layer control test
only distinguishes edge-rejection from backend-resolution — it cannot, on its own, tell you whose
fault a 500 is.

### WEB-PATH FEASIBILITY TEST (owner-directed: "use the web option")

Owner approved falling back to the browser/ChatGPT route. Tested it properly rather than assuming:
- chatgpt.com loads, account logged in (Plus), composer functional.
- Opened a NEW chat, typed the frozen `pet` rich prompt, verified the composer content before
  sending (delight-pass lesson: stray em-dash injection), sent it.
  Chat: https://chatgpt.com/c/WEB:9a715deb-bfbd-4588-92f4-dc13acd7af2c
- RESULT: after ~4 minutes the response is still generating, zero images rendered, and the
  sidebar again shows "Unable to load projects". Consistent with Images + Sites degraded.

CONCLUSION: BOTH paths to image generation (API and web) are blocked by the same OpenAI incident.
This is not a method problem — it is an availability problem, and no choice of method fixes it.
The correct action is to WAIT for the incident to clear, not to keep retrying or to switch tools.

### RUN STATE — STOPPED HERE BY OWNER INSTRUCTION ("once all checks are done stop")

Nothing was generated, nothing was spent, nothing was deployed. No repo file changed in this
stretch — the only artifacts are this journal entry and the scratchpad probes. The single
untracked side effect is one throwaway ChatGPT chat containing one prompt.

READY TO RESUME THE MOMENT status.openai.com IS GREEN:
  - 12 rich scene prompts: frozen in plan.md (Phase 3).
  - Tile-enlargement decision for rich art: frozen in plan.md (Phase 4).
  - Pipeline + md5-distinctness validation: specified.
  - Phase 3 will be dispatched as a PROPER oplan step (committed script under scripts/, frozen
    validation, executor packet, fresh-eyes audit) — per the process correction logged above.
    No generation happens outside that.

## 2026-07-25 — OWNER HYPOTHESIS CONFIRMED: a chat created AFTER the mitigation works

Owner's hypothesis: "maybe old generation chats are having the spinning problem, try new chat."
Refinement made before testing: the earlier failed attempt WAS also a new chat, but it was created
DURING the outage — so the testable claim is that a chat created AFTER OpenAI applied their
mitigation behaves differently. Tested exactly that, like-for-like (same `pet` rich prompt, same
composer-verification step).

RESULT: **SUCCESS.** Fresh tab -> new chat -> same prompt -> image returned in under 60 seconds.
  chat: https://chatgpt.com/c/6a6491a2-cf44-83eb-96bb-023d4345d4d9 ("Puppy in Magical Clinic")
  generation completed (stillGenerating:false), 3 img nodes, Download control present.
Meanwhile the OLD chat (WEB:9a715deb..., created mid-outage) is STILL spinning ~30 min later.
So stuck conversations do not recover; new ones work. The owner was right.

QUALITY / STYLE CHECK (orchestrator, by eye): the result is a golden puppy on a teal cushion in
a warm wood-and-lantern magical clinic with potion bottles, violet + teal + amber accents. It
matches the app's existing world closely, and the subject is unmistakably the hero of the frame —
which is the property that has to survive at tile size. Rich scene as the owner directed, not a
flat icon.

CORROBORATING RECOVERY SIGNALS at the same time: /v1/models and /v1/chat/completions both return
200 (were 500 on every call), gpt-image-1 and gpt-image-1-mini both listed as available on this
key, the ChatGPT sidebar now loads Pinned/Projects instead of "Unable to load projects", and the
status incident has moved to "monitoring — mitigation applied". The Images component is still
flagged degraded, so throughput may still be uneven.

STOPPED HERE per the owner's standing instruction ("work from oplan, once all checks are done
stop"). This was a feasibility CHECK, not Phase 3. Nothing was downloaded, no repo file changed,
no asset committed. Phase 3 remains undispatched and will run as a proper oplan step:
a committed generation/optimize script, a frozen validation (12 masters, square, content-distinct
by md5), an executor packet, and a fresh-eyes audit.

DECISION NOW OPEN FOR THE OWNER: both routes are viable again (API recovered; ChatGPT web proven
working with a strong style match). Which to use for the remaining 11 — and note the proven
sample already exists and can be kept as the `pet` master rather than regenerated.

## PLAN REVIEW — phases 3–5 (fresh eyes, before any executor dispatch)

VERDICT: fix-first. Six findings, ALL accepted and fixed:

1. `[boundary] Phase 3` — "prompts frozen earlier in this plan" was a STALE CROSS-REFERENCE: my
   own python rewrite of the Phase 3 section had DELETED the 12 frozen rich prompts from plan.md.
   They survived only in my context — precisely the crash-only failure oplan exists to prevent.
   **Fixed:** prompts restored to plan.md as a table, with the style sentence and the progress
   marker. Had the session died there, the run's core content would have been unrecoverable.
2. `[undecided] 4.2` — no markup/CSS specified for the `picture-to-word` `.placement-emoji-big`
   image swap. **Fixed:** exact `optArt(item.emoji)` substitution plus a frozen
   `.placement-emoji-big .opt-art` rule (200x200).
3. `[undecided] 4.2` — "min-height ~150px" was approximate. **Fixed:** exact values frozen
   (`min-height: 150px`, `padding: 6px`), no tilde anywhere.
4. `[missing] 4.1/4.2/4.3` — no frozen validation commands and no Phase 4 acceptance criteria;
   validation was prose ("greps prove the map exists"), leaving each cheap worker to invent its
   own pass/fail. **Fixed:** three frozen validation blocks (STEP-4.1/4.2/4.3-OK) and five
   mechanical acceptance criteria.
5. `[acceptance] Phase 4` — static greps can pass while the feature is broken at runtime.
   **Fixed:** added step 4.4, an orchestrator runtime proof driving the real module headlessly
   (same technique as step 1.2) and asserting from the LIVE DOM that the imgs render with alt
   text and that a click still advances the item.
6. `[boundary] 4.1` — `public/assets/placement/` does not exist. **Fixed:** `mkdir recursive`
   now stated explicitly rather than implied by "mirrors optimize-assets.js".

VALUABLE NEGATIVE RESULTS — the reviewer verified by inspection, so these are settled facts:
  · `clientView` really does strip `lemma`/`he`; the browser sees only emoji strings, so the
    emoji->image map MUST live in the view. Plan claim confirmed.
  · The 12-emoji map covers every emoji used as an option or prompt in the bank, byte-for-byte
    including the ZWJ in desk and the variation selector in camp. No emoji is missed.
  · Rendering an `<img>` inside `.placement-option-btn` CANNOT break click handling: the handler
    reads `data-choice` off the closure variable `btn`, not `event.target`. This was my main
    worry about the whole approach and it is now cleared.
  · No test asserts emoji-as-text, so the swap is not a test break.

Mitigation adopted from finding 1: the OPT_ART map in step 4.2 is specified with `\u{...}`
escapes rather than literal emoji, so no multi-byte character has to survive hand-editing by a
worker on this Windows/Git-Bash machine.

## PHASE 3 CLOSED — 12 rich masters generated (free web route)

Route: ChatGPT web, per the owner's standing policy (free web for anything not generated at app
runtime). Zero API spend. All 12 generated in ONE chat for style continuity:
`https://chatgpt.com/c/6a6491a2-cf44-83eb-96bb-023d4345d4d9`.

Masters in `assets/placement/` — all 1254x1254 PNG, matching the existing square masters exactly:
  pet 88032bb2 · mom 71551b3d · camp 759fd0c0 · fan 4997b5c1 · dad 6d48aeaa · desk 79fcf891 ·
  singer f56db309 · horse a3fa0361 · zoo 885635d1 · movie 8756de92 · monkey 85b25029 ·
  steak 66638c3c
PHASE3-OK: 12 present, all square, all >= 512px, all content-distinct by md5.

CAPTURE METHOD (new, supersedes the delight-pass download-button dance): in-page
`fetch(img.src,{credentials:'include'})` -> blob -> object URL -> ONE synthetic
`<a download="placement-<lemma>.png">` clicked exactly once; then a Bash helper asserts exactly
ONE such file exists, moves it to the master name, and verifies square/size/md5. The explicit
filename eliminates the "newest file in ~/Downloads" heuristic that made the 89-duplicate
incident possible. Across 12 captures the count assertion never once found more than one file.
(First attempt POSTed bytes to a localhost sink instead — blocked by chatgpt.com's CSP. Recorded
so nobody retries it.)

THE THREE BROKEN CONCEPTS ARE FIXED — the whole point of the exercise:
  fan  was 🌀 a spiral        -> a brass electric fan, blades blurred, papers fluttering
  desk was 🧑‍💻 person+laptop  -> a wooden desk with lamp, open book and quill, NO person
  zoo  was 🦁 a lone lion     -> an entrance archway with giraffe, lion AND elephant together
Prompt refinements made on the spot and worth recording: `desk` needed "and no person present"
(otherwise it drifts back to a person at a desk), and `zoo` needed "SEVERAL different animals ...
so it clearly reads as a zoo rather than one single animal".

Style continuity verified by building a 12-tile contact sheet from the actual saved PNGs (not
browser screenshots) and viewing it: one world, consistent warm golden lighting and
teal/violet/amber palette, each subject unmistakably the hero of its frame.
