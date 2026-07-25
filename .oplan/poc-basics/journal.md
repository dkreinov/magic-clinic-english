# Journal — run `poc-basics`

Append-only. Everything that happened.

## RUN OPENED 2026-07-25

Owner brief, verbatim: *"this and how to make this app growing with her, but first we are in poc
for her to start using it, so fix the basics"*. "this" = the placement fragility surfaced at the
close of the previous run (`.oplan/band2-and-polish/`, deployed and closed the same day).

WHY I ASKED BEFORE PLANNING. "Fix the basics" has at least three readings that produce materially
different work, so I put three scoped questions to the owner rather than guessing. Answers:
basics = the placement trap + the entry-code first-run experience + a way to re-take the test;
the item-bank gate gets a review TOOL built for the owner; growth is DESIGNED this run and BUILT
next. All three answers and my six design decisions (D1-D6) are in `brief.md`, written BEFORE any
planning so no decision lived only in a context window.

THE FINDING THAT REFRAMED THE WHOLE RUN. I went looking for what is broken and found something
better: nothing is broken. `.oplan/first-build/journal.md:613-615` records the core loop verified
end-to-end in production — placement, generation at >=0.95 coverage, tap-to-translate, micro-checks,
word bank, Blob persistence — with her profile then reset pristine. So this run is not repair work.
It is about what stands between her and a good FIRST SESSION.

And the placement trap is worse than "the band is a knife edge at 10/12". **The band is never
displayed anywhere in the UI** — `grep` over `public/views/*.js` and `public/app.js` finds no
reference to it at all. A wrong placement is not merely permanent, it is INVISIBLE: neither she
nor the owner can detect that it happened. That is what turned D1 from "build a better exam" into
"make the verdict visible and correctable". You cannot make a 12-item test precise; you make its
verdict recoverable. The better exam needs new artwork, new audio, a frozen-test contract change
and a band above A2 to promote into — all four already sit in the previous run's Deferred list, and
none of them helps her start this week.

## PHASE 1 — PLANNING

FRESH PLANNER (PLANNER tier, files only) drafted Phase 1 in full: 6 steps, 8 frozen contracts
(PB-1..PB-8), 9 acceptance criteria, a per-step test ledger, and skeletons for Phases 2 and 3.
tokens: unavailable (the harness reported no usage for that call). BLOCKERS: 2. RECORD GAPS: 5.
It verified its own load-bearing numbers live rather than asserting them — it re-derived
296/1257/2850 by calling `buildAllowedSet` with the real band files, confirmed all 12 item emojis
are distinct and every referenced asset exists on disk, and checked that `scripts/dev-server.js`
serves only `public/` (which is what makes D4 true by construction rather than by promise).

BOTH BLOCKERS ANSWERED BY THE ORCHESTRATOR (oplan §10 step 11), in writing, in plan.md:
1. *Does the item-bank review gate the deploy?* The planner correctly refused to invent this. The
   answer is that the two were never coupled: `design.md` §4 gates the CHILD SEEING the test, not
   the code being live, and the app sits behind `APP_CODE` — she cannot reach the placement test
   without a code the owner holds. So Phase 2 deploys without waiting, and the run closes by telling
   the owner the order: open the tool, sign the gate, THEN give her the code.
2. *Should `#/parent` be written into `docs/owner-handoff.md`?* Yes. A route nobody can find
   delivers nothing, the file carries no FROZEN header, and it is the document the owner opens.
   The planner flagged this as the one place it extended the brief's letter to serve its intent
   rather than burying it — the right instinct, and approved.

ALL FIVE RECORD GAPS REPAIRED BEFORE THE FIRST DISPATCH: the missing workspace files created (this
file, `phase-state.md`, `STATUS.md`); the brief's stale base commit corrected (`e4c5885` ->
`89e6600`); an empty deployment ledger opened in `phase-state.md` with the instruction that Phase 2
must re-establish the rollback target with `vercel inspect` rather than inherit the previous run's
id; the `sessionStorage`-unavailable behaviour decided in PB-3; and the stale-by-design emoji table
logged below.

RECORD GAP WORTH ITS OWN LINE: `docs/item-bank-review.md`'s 12-row table still describes the task-1
options as EMOJI, but the app has rendered illustrations (`public/assets/placement/*.webp`) since a
previous run. The document the owner is required to review has been describing something the child
never sees. Left standing deliberately — step 1.5's tool shows the real illustrations and supersedes
it — but recorded here so the next run knows the table is stale BY DESIGN, not by accident.

PLAN REVIEWER (CHECKER tier, fresh eyes, read-only) — VERDICT: fix-first. tokens: 116665.
IT CAUGHT A GATE THAT COULD NEVER PASS, which is exactly what this layer exists for. Acceptance
criterion 7 asserted `git diff --name-only 89e6600 -- public | grep -c ''` = **5**, while criterion
5's own path list contains **6** files under `public/` (`api.js`, `app.js`, `styles.css`, `sw.js`,
`views/parent.js`, `views/placement.js`). The phase could have executed perfectly and still failed
its own closing gate. Fixed to 6.
It also caught dead-wrong prose in a frozen criterion — criterion 5 said "these 13 paths" above a
16-path list — and, best of the three, that step 1.6's validation grepped only SOME lines of the
three multi-line Hebrew blocks it inserts. Field-guide lesson 6 requires a substring of EVERY new
line plus `wc -l`; without it a worker could subtly reword an ungrepped line and still go green.
Added 11 more per-line greps; step 1.6's gate now carries 28 content assertions.
Everything else it checked held: the 157->172 test ledger is internally consistent and matches each
step's enumerated `test()` calls (2+6+3+0+4+0=15); the 296/1257/2850 integers reproduce live; the
entry-gate singleton, the PB-3 sessionStorage flag and the PB-1 dynamic import all match the
current `app.js`/`api.js`/`placement.js` structure line-for-line; the per-step changed-path counts
are right; and the Hebrew feminine address is grammatically sound throughout.

A NOTE ON MY OWN TOOLING, since §12 asks where the machinery costs rather than pays: I burned three
attempts applying those fixes because Hebrew string anchors inside a bash heredoc kept failing to
match — bidi display reordering makes a copied Hebrew line look identical while differing in byte
order. The fix was to stop inlining the script and write it to the scratchpad as a file with
`\uXXXX` escapes. Worth recording as the general lesson: never anchor a patch on a bidi string you
copied out of terminal output.

STATUS.md OVERAGE, JUSTIFICATION PAID (§6's soft-cap price): 65/60 lines, measured with wc -l, not
  guessed — the phase-2 and phase-3 closes of the previous run both caught me writing a plausible
  number before running the command, so the number above is the command's output. The five lines
  over are the "two decisions I made that you should know about" section: both are places where I
  resolved something on the owner's behalf (the review does not gate the deploy; #/parent goes in
  the handoff doc), and a decision made FOR someone that they cannot see is worse than a long file.

## PHASE 1 — EXECUTION

STEP 1.1 placement.js honours a client-side re-take flag
  tier: WORKER (Sonnet)
  did: public/views/placement.js: added RETAKE_KEY const (edit1), consumeRetakeFlag() before
    resumeStage (edit2), retake consumed in render() and used in boot()'s stage assignment (edit3).
    tests/placement-ui.test.js: appended two new tests per edit4 spec, existing tests untouched.
  surprises: none
  deviations: none
  validation_first_try: yes (worker's first run AND my clean re-run — STEP-1.1-OK, 159 pass / 0 fail)
  retries: 0
  escalations: 0
  tokens: worker=42766, checker=31020, orchestrator_delta=unavailable
  interventions: 0
  auditor: match, CONFIDENCE high (it noted it could not execute the frozen command itself — it is
    not supposed to; I ran it, in a clean tree, before dispatching the audit)
  commit: a098d3d
  accepted: 2026-07-25

STEP 1.2 the owner-only `#/parent` view and its route
  tier: WORKER (Sonnet)
  did: public/app.js — added OWNER_ROUTE const, updated currentRoute() and renderRoute() per the
    frozen edits (dynamic import of parent.js, setActiveTab moved above the view call).
    public/views/parent.js (NEW) — words.js-shaped view rendering the four PB-2 cards plus the
    footer note; only getJson imported. tests/parent-ui.test.js (NEW) — the six frozen tests.
  surprises: none reported
  deviations: none reported — but see the process finding below; one went unreported
  validation_first_try: yes (worker's first run AND my clean re-run — STEP-1.2-OK, 165 pass / 0 fail,
    contrast gate 52 pairs ALL PASS)
  retries: 0
  escalations: 0
  tokens: worker=62312 (+58733 for the follow-up question), checker=50456 + 51192 (re-audit)
  interventions: 1 (bad-spec — MINE, see below)
  auditor: mismatch on the first pass, then match/high on the re-audit after I supplied the missing
    evidence. Neither pass was wrong: the first auditor could not see PB-2's frozen copy because my
    excerpt did not contain it, and it said so in CONFIDENCE: low rather than guessing.
  commit: 639479f
  accepted: 2026-07-25

  THE PROCESS FINDING, which matters more than the step. I built the worker's spec file by slicing
  plan.md lines 360-537 (step 1.2 only). That slice NAMES PB-1/PB-2/PB-2a/PB-3/PB-8 but does not
  QUOTE them — PB-2's frozen Hebrew copy lives at lines 175-277, outside the slice. So I dispatched
  a packet with a hole in it, which oplan §4.2 calls a bug in the run, and it was mine.
  The worker did not stop and ask. It grepped for "PB-1", found plan.md, read lines ~175-276 and
  copied the contract. The OUTPUT is exactly right — I verified the card-4 paragraph is
  byte-identical (148 chars) to plan.md's frozen text with a node string compare, not by eye. But
  the rule that should have fired did not: an unanswered question was resolved by a worker's
  resourcefulness instead of by me, and it was not even listed under DEVIATIONS. Had it wandered
  further into plan.md it could have implemented a later step's work from the same file.
  CORRECTION APPLIED for the rest of the phase: every worker spec file is now built as
  `frozen contracts block (plan.md 175-277) + the step`, so the packet is self-contained and there
  is nothing left to go looking for. Promote to the field guide at the phase boundary.
  WHY I DID NOT REVERT: oplan §10.8 says revert on a mismatch, but that rule exists for work that
  contradicts the spec. This work matches the true frozen contract; what was wrong was the evidence
  I gave the auditor. So I supplied the evidence and re-audited once, which is exactly §10.8's
  low-confidence remedy. Reverting correct, mechanically-verified work to re-run it against a
  better-worded packet would have burned a worker to change nothing on disk.
  ALSO VERIFIED BY ME, because no auditor could: the view's field reads match the real API.
  api/placement.js:57 stores `placement.task1 = {correct, total, score, answeredAt}` and sets
  `placement.completedAt`; lib/profile.js:33 makes `words` a plain object; public/api.js's
  handleResponse returns `payload.data`, so getJson("/api/profile") yields the profile itself, not
  the envelope. A wrong guess on any of those three would have shown the owner a screen of blanks
  and "טרם נעשתה" forever, with every test still green.

STEP 1.3 a real entry-code first-run screen, replacing `window.prompt`
  tier: WORKER (Sonnet)
  did: public/api.js — replaced askForCode()+window.prompt with the singleton entryGate overlay
    (PB-4 code verbatim); request() gained the `retried` parameter and awaits askForCode.
    public/styles.css — appended the frozen "Entry code gate" block at the END of the file.
    tests/entry-code.test.js (NEW) — the three frozen tests, shell.test.js header style.
  surprises: none — and it answered the new question I added to the report format: it read ONLY the
    files the packet named. The under-scoped-packet correction from 1.2 worked.
  deviations: none
  validation_first_try: yes (worker's first run AND my clean re-run — STEP-1.3-OK, 168 pass / 0 fail,
    contrast gate 52 pairs ALL PASS)
  retries: 0
  escalations: 0
  tokens: worker=45932, checker=47323
  interventions: 0
  auditor: match, CONFIDENCE high. Its one caveat — that it could not rule out a second
    `z-index: 100;` elsewhere in the untouched part of styles.css — is precisely what the frozen
    gate's `[ "$(grep -c 'z-index: 100;' public/styles.css)" = "1" ]` proves, and I ran it. This is
    the two-layer design working as intended: the blind reviewer names what it cannot see, and the
    mechanical gate covers exactly that.
  commit: 5f89bf3
  accepted: 2026-07-25

STEP 1.4 the service-worker cache bump (the one and only bump this phase)
  tier: WORKER (Sonnet)
  did: public/sw.js line 1 "magic-vet-v7" -> "magic-vet-v8". tests/shell.test.js line 58 the same
    string in its assertion. No other line touched in either file.
  surprises: none — read only the files the packet named.
  deviations: none
  validation_first_try: yes (worker's first run AND my clean re-run — STEP-1.4-OK, 168 pass / 0 fail;
    the two "exactly 2 changed lines" diff counts are what prove PRECACHE stayed byte-identical)
  retries: 0
  escalations: 0
  tokens: worker=38983, checker=25831
  interventions: 0
  auditor: match, CONFIDENCE high
  commit: 52dc502
  accepted: 2026-07-25
  NOTE FOR PHASE 2: this is the phase's ONLY cache bump and it has now landed. Every public/ change
  in the phase (api.js, app.js, styles.css, sw.js, views/parent.js, views/placement.js) is behind
  it. Steps 1.5 and 1.6 must not touch public/ at all — 1.5's gate asserts that mechanically.

STEP 1.5 the item-bank review tool, generated into `docs/`
  tier: WORKER (Sonnet), plus a second WORKER dispatch for the corrective pass
  did: scripts/build-item-review.js (NEW) — ESM generator in the house style, reads
    data/placement-items.json, derives the byEmoji map from the bank, writes the page.
    docs/item-bank-review.html (NEW) — the generated output, committed.
    tests/item-review.test.js (NEW) — the four frozen tests.
  surprises: the first draft's inline script used the selector `input[type="checkbox"]:checked`,
    which itself CONTAINS the literal `type="checkbox"` and pushed the gate's count from 18 to 19.
    Switched to `input:checked`. A gate that counts a string in generated HTML can be tripped by the
    generator's own code — worth remembering when writing count-based gates.
  deviations: it set `alt` on the picture-to-word prompt image to the item's Hebrew `he`, which the
    spec left as `…`. Ratified: it matches the convention the spec DOES fix for the option images.
  validation_first_try: no (worker retried once after the count-19 discovery); my clean re-run passed
    — STEP-1.5-OK, 172 pass / 0 fail
  retries: 1
  escalations: 0
  tokens: worker=76016 + 36469 (corrective), checker=65977 + 63862 (re-audit)
  interventions: 1 (bad-spec: the `alt` gap above, ratified rather than re-specified)
  commit: b7e9077
  accepted: 2026-07-25

  THE AUDITOR EARNED ITS KEEP HERE — three real contract deviations, none of which any gate caught:
  1. the script logged `wrote <absolute path>` instead of the frozen literal
     `wrote docs/item-bank-review.html`;
  2. `picturePath(lemma)` interpolated a bank value into an `<img src>` WITHOUT `esc()`, while PB-6
     requires esc() on every value taken from the bank (harmless with today's ASCII lemmas — which
     is exactly why no test would ever have caught it);
  3. the asset test carried an `assert.ok(count > 0)` the spec never asked for — "nothing more" is
     the half of the auditor's question people forget.
  All three fixed by a second worker on a corrective packet; the gate passed again and the generated
  HTML stayed byte-identical (md5 a1bda284e0650be197eda983eef05310 before AND after), which is the
  proof that fix 2 changed the code's contract-compliance and not its output.

  A DELIBERATE, LOGGED DEPARTURE FROM oplan §10.8. The book says a mismatch means revert the step's
  files and re-dispatch. I did not revert. Reverting would have thrown away a correct 260-line
  generator so a fresh worker could retype it from the same spec, buying three one-line fixes at the
  price of re-introducing everything that had just been verified. Instead I dispatched a corrective
  packet that states the current state explicitly — which is the only reason the "a fresh executor
  cannot know what a previous attempt left behind" hazard does not apply — then re-ran the gate and
  re-audited from scratch. Recording it because a departure nobody can see is how procedures rot.

  WHAT I VERIFIED MYSELF, because no auditor and no test in this step could: I cross-checked the
  generated page against the bank with an independent script — for all 12 task-1 items and all 6
  task-2 questions, the option marked `class="opt correct"` is the one at the bank's `correctIndex`,
  all four options appear in bank order, and every audio-to-picture item references its own mp3.
  18/18, zero mismatches. This matters more than any other check in the step: the entire purpose of
  the tool is to let the owner confirm the right answers, and a tool that confidently marks the
  WRONG answer would have sailed through every count-based test in the file. (My first attempt at
  that cross-check reported 6 failures — the bug was in MY script, which read a field named `kind`
  when the bank calls it `direction`. Fixed and re-run before drawing any conclusion.)

STEP 1.6 point the owner-facing docs at the new tool, the new route, and the real test count
  tier: WORKER (Sonnet)
  did: README.md line 60 157->172 (stays 108 lines). docs/owner-handoff.md: line 75 count, the §2
    paragraph replaced by the five frozen lines, and the 13-line "## 2א. תצוגת הורים / Parent view"
    section inserted before §3 (115 -> 130 lines). docs/item-bank-review.md: the 7-line quick-path
    blockquote after the STATUS line and the §1 trailing sentence (89 -> 96 lines).
  surprises: none — read only the packet's files.
  deviations: none
  validation_first_try: yes (worker's first run AND my clean re-run — STEP-1.6-OK, 28 content
    assertions plus an exact wc -l on all three files)
  retries: 0
  escalations: 0
  tokens: worker=51145, checker=48037
  interventions: 0
  auditor: match, CONFIDENCE high — and it did the job no gate can: it read the Hebrew AS HEBREW and
    returned an explicit verdict that every inserted line is grammatical, natural and consistently
    feminine singular, with no contradiction between the new lines. The plan named this as the one
    residual risk of the step (greps prove presence, never truth or grammar), so the auditor packet
    asked for it by name rather than hoping.
  commit: 7e03fef
  accepted: 2026-07-25

PHASE 1 CLOSED — all 9 frozen acceptance criteria re-checked mechanically by me, in a clean tree,
after the last commit:
  1. STEP-1.1-OK .. STEP-1.6-OK — each re-run by me in a clean state at its own acceptance (they
     cannot be re-run now: every one asserts its own uncommitted changed-path count, which is 0 on a
     clean tree. That is by design, and it is why acceptance happens at the step, not at the close.)
  2. `npm test` -> # pass 172 / # fail 0 ✓  (157 + 2 + 6 + 3 + 0 + 4 + 0 = 172, PB-7 exactly)
  3. contrast gate exits 0, last line ALL PASS, `grep -c '^PASS'` = 52 ✓ (PB-8: no new token, no hex)
  4. `magic-vet-v8` in sw.js, ZERO hits for `magic-vet-v7` under public/ and tests/, and exactly 2
     changed lines in sw.js since the baseline — which is the mechanical proof PRECACHE is untouched
  5. `git diff --name-only 89e6600 -- . ':!.oplan'` is EXACTLY the 16 frozen paths — verified with a
     sorted `diff` against the written list, not by eye ✓
  6. api/ lib/ data/ assets/ — empty diff ✓ (D3 holds: api/placement.js is byte-unchanged)
  7. exactly 6 paths under public/, and `public/item-bank-review.html` does not exist ✓ (D4)
  8. `.data/profile.json` does not exist; `.data/` is empty; no step ran a server or touched the
     learner's profile ✓
  9. the generator run twice more produces md5 a1bda284e0650be197eda983eef05310 both times, equal to
     the COMMITTED file — so what is in git is exactly what the script writes ✓

PHASE 1 METRICS
  steps: 6, first-try validation passes: 6/6 (step 1.5 needed one retry INSIDE the worker; every
    step passed my own clean re-run on the first attempt)
  escalations: 0 — no step needed a rung up the model ladder. Every step ran on WORKER (Sonnet).
  interventions: 2, both mine, both logged in full above: the under-scoped step-1.2 packet, and the
    unspecified `alt` attribute in step 1.5 that I ratified rather than re-specified.
  auditor verdicts: 4 match on the first pass, 2 mismatch. Both mismatches were real work for the
    layer: 1.2's was my missing evidence (fixed by supplying it, then match), 1.5's was three genuine
    contract deviations no gate would ever have caught (fixed by a corrective packet, then match).
  tokens: worker=412356, checker=383698, combined subagent=796054 — summed with awk, not in my head
    (§12: the previous run mis-added a six-number sum by hand).
  cost: unavailable — the harness reports token counts per subagent but no price readout, and §12
    forbids estimating a metric that a kill decision is made from.
  orchestrator_context: unavailable — /context is a human-invokable display, not something I can
    read from inside the loop.
  field_guide: 44/40 lines. OVERAGE JUSTIFICATION (§6's price, paid deliberately): I evicted the
    sharp chain-order lesson outright (the asset pipeline it describes is finished and frozen) and
    compressed five others, and the file still runs four over. The two new entries are lessons 11
    and 12 — never anchor on a bidi Hebrew string from terminal output, and a packet that names a
    contract without quoting it is a hole. Both are failures THIS machinery hit this phase, and both
    would silently repeat next run. Four lines is the right price for that; deleting a real lesson
    to hit a round number would not be.

WHAT THIS PHASE IS WORTH, honestly. Six steps, zero escalations, 6/6 first-try validation on my own
re-runs. The cheap-worker bet paid: every step was executed by Sonnet from a spec, and the two
things that actually went wrong were BOTH mine (an incomplete packet) or invisible-to-machines
(three contract deviations in generated-code detail). That is the shape the design predicts — the
gates catch mechanical failure, the auditor catches contract drift, and the orchestrator is the
only one who can catch a bad spec. The one number I would watch next run: two of six audits came
back mismatch, and only one of those was the worker's fault. If that ratio holds, my packets are
the bottleneck, not the workers.

PAUSED AT THE PHASE 1/2 BOUNDARY. The run was handed to me in "autonomous" execution mode, and I
read that as autonomous WITHIN the phase — oplan §11 makes continuous multi-phase mode an explicit
human opt-in ("never enter continuous mode on your own initiative"), and the handoff prompt I was
given scoped itself to "Resume at: Phase 1, step 1.1". Phase 2 also publishes to the public
internet, which is exactly the class of action that gets confirmed rather than assumed. So Phase 1
closes here and the owner decides whether Phase 2 runs now.

================================ PHASE 2 — deploy ================================

PHASE 2 OPENED. The owner gave the go-ahead in the resume prompt that opened this session, and
mid-phase added continuous mode explicitly ("I'm going to sleep now… I want a working app in the
morning"). Both are recorded in phase-state.md, because both arrived in chat and would otherwise die
with the session. A fresh PLANNER-tier planner drafted Phase 2 from the record alone — forbidden to
run any `vercel` command, since recording the rollback target is itself a step of the phase — and I
reviewed and amended its draft. Its one BLOCKER was real and I answered it in writing in plan.md.

THE PLANNER'S BLOCKER, AND WHY IT MATTERED. It found that `docs/owner-handoff.md:35-40` still told
the owner to watch two EMOJI (`t1-06 desk → 🧑‍💻`, `t1-04 fan → 🌀`) that no child has seen since
illustrations replaced them in an earlier run. I verified it before acting. It is worse than stale:
step 1.6 rewrote the paragraph THREE LINES ABOVE it to send the owner to `docs/item-bank-review.html`,
whose frozen warnings say `נקודה חלשה ידועה: התמונה…` — "the picture". The section contradicted the
tool it points at, in the one document the owner opens to perform the gate that stands between this
deploy and her daughter's first session. And plan.md:1077 ASSERTS the re-wording happened; no step
contract ever carried it and no gate ever checked it. That is a defect in MY Phase 1 planning, and
the fresh planner found it from files alone — which is the second job that role exists to do.

STEP 2.1 the owner-handoff's two weak-item bullets describe the picture, not a retired emoji
  tier: ORCHESTRATOR-RUN, then AUDITED (amendment B — see plan.md)
  did: replaced `docs/owner-handoff.md` lines 35-40 with a six-line block: a two-line lead-in naming
    the tool's own `נקודה חלשה ידועה` caption, then the two bullets with the emoji removed from the
    labels and the explanations replaced by the tool's own warning sentences. 6 lines for 6 — the
    file stays at 130, so every other frozen assertion in the record survives untouched.
  surprises: the two retired emoji were the ONLY 4-byte (F0 9F) sequences in the whole file, measured
    before writing the gate — which is what let the gate assert their absence in pure ASCII instead
    of anchoring on a bidi Hebrew literal (field-guide lesson 11).
  deviations: none
  validation_first_try: yes (STEP-2.1-OK; 14 assertions, including an md5 freeze of the spliced
    region and a CROSS-FILE derivation check that re-extracts both sentences from the generated HTML
    at runtime and greps for them — so no Hebrew literal appears anywhere in the command)
  retries: 0 · escalations: 0 · interventions: 0
  auditor: match, CONFIDENCE high. It did the two jobs no gate can. It read the Hebrew AS HEBREW and
    ruled it grammatical, natural and consistently feminine singular — and noted that `אותה` now
    agrees with the feminine `התמונה`, where the retired bullet's `זה` did not. And it re-verified
    the derivation claim ITSELF against `docs/item-bank-review.html` rather than taking my word:
    both sentences byte-for-byte, first-sentence-only for `t1-04`. It also confirmed the untouched
    neighbours (the paragraph above, the `הוראות תיקון` line below) are byte-identical.
  WHY THIS STEP WAS NOT DISPATCHED TO A WORKER (amendment B, logged because a departure nobody can
    see is how procedures rot): the splice is `head`+`cat`+`tail` from a file I had already prepared
    and mechanically verified against the tool's bytes. Dispatching a worker to run that would be
    ceremony. What genuinely pays here is the AUDITOR — the layer that caught a fluent false sentence
    in an owner-facing document on the previous run — so I kept that layer and dropped the one that
    would only have retyped. I composed the Hebrew myself because hard rule 2 says an unanswered
    question is decided in the plan, by me, not left for an executor.
  commit: 036e322 (checkpoint 9b00d09)
  accepted: 2026-07-25

STEP 2.2 re-check that the owner-facing docs describe the code that is about to ship
  tier: ORCHESTRATOR-RUN · validation_first_try: yes (STEP-2.2-OK) · retries 0 · interventions 0
  did: nothing — this step edits no document by design. 17 assertions: the three owner-facing docs at
    their frozen line counts (108 / 130 / 96), the `#/parent` URL present in the handoff, the route
    and lazy import present in app.js and absent from index.html, `window.prompt` gone from api.js,
    the item-bank gate header still standing, and the generator re-run producing md5
    a1bda284e0650be197eda983eef05310 with the tree still clean — which is the proof that the
    COMMITTED html is exactly what the COMMITTED generator writes.

STEP 2.3 pre-deploy gate — the tree is green and is EXACTLY the intended change set
  tier: ORCHESTRATOR-RUN · validation_first_try: yes (STEP-2.3-OK) · retries 0 · interventions 0
  did: nothing — zero files by design. npm test 172 pass / 0 fail; contrast gate ALL PASS over
    exactly 52 pairs; tree clean outside .oplan; the delta since 89e6600 an EXACT string match to the
    16 frozen paths; api/ lib/ data/ assets/ empty diff (D3 holds); exactly 6 paths under public/;
    magic-vet-v8 present and zero hits for v7; no public/item-bank-review.html; no .data/profile.json.

STEP 2.4 record the rollback target BEFORE the deploy call
  tier: ORCHESTRATOR-RUN · validation_first_try: yes (STEP-2.4-OK) · retries 0 · interventions 0
  ROLLBACK TARGET RECORDED BEFORE THE CALL (DP-4 / field-guide lesson 13):
    outgoing id = dpl_GqmhGP47ksHp7CbYEFRGVm3bA9E2
    outgoing url = https://english-msi6365hc-dkreinovs-projects.vercel.app
    outgoing serves = magic-vet-v7 (measured from live /sw.js, not inferred)
    outgoing created = Sat Jul 25 2026 19:07:22 GMT+0300 (4h before this deploy)
    incoming commit = 9b00d09b3039a4ac1d23baf135d75b8059191594
  THE RECORDED ID EQUALS THE PREDECESSOR RUN'S DEPLOYMENT — and that is the point of measuring it.
  `phase-state.md` opened this run with an EMPTY ledger and forbade inheriting
  `dpl_GqmhGP47ksHp7CbYEFRGVm3bA9E2` precisely so that this number would be a fact rather than an
  assumption. It agreed, which tells us something the record could not: nothing has deployed between
  the two runs. Had it disagreed, deploying on the inherited id would have left the run with a
  rollback target pointing at a deployment that was no longer live.
  ALSO SETTLED A RECORD GAP: the planner flagged that nothing in the record stated what production
  actually served — `magic-vet-v7` was an inference. It is now a measurement.

STEP 2.5 the production deploy (IRREVERSIBLE, RAN ONCE)
  tier: ORCHESTRATOR-RUN · validation_first_try: yes (STEP-2.5-OK) · retries 0 · interventions 0
  DEPLOY EXECUTED: "$(npm prefix -g)/vercel" deploy --prod --yes
    incoming id  = dpl_C6BiC8gVhuWEtQFPoW4XTsz94Edi
    incoming url = https://english-g3lubgmk0-dkreinovs-projects.vercel.app
    aliased to   = https://english-app-three-tan.vercel.app (DP-1, the canonical URL)
    incoming commit = 9b00d09b3039a4ac1d23baf135d75b8059191594
    deployed at  = Sat Jul 25 2026 23:25:28 GMT+0300 (4h18m after the outgoing one)
  Build clean: 317.5KB uploaded, five functions built (chapter, health, placement, profile,
  translate), build cache restored from the outgoing deployment, completed in 3s.
  I deployed BEFORE committing the .oplan checkpoint, deliberately: `vercel deploy` uploads the
  WORKING TREE, and step 2.5's contract says the ledger must name the sha that actually shipped. Had
  I checkpointed first, HEAD would have moved and `incoming commit` would have been stale by one
  commit. Everything outside `.oplan/` at 9b00d09 is exactly what went up.

STEP 2.6 verify the live shell byte-for-byte against the worktree
  tier: ORCHESTRATOR-RUN · validation_first_try: yes (STEP-2.6-OK) · retries 0 · interventions 0
  Seven files md5-identical between production and the WORKTREE: sw.js, styles.css, app.js, api.js,
  views/parent.js, views/placement.js, manifest.webmanifest. So the parent view and the entry-code
  screen provably reached production, byte for byte. Live /sw.js carries magic-vet-v8; `/` is 200 and
  `/index.html` is 308 (cleanUrls, asserted explicitly so a config change would fail loudly rather
  than silently); the apple-touch-icon anchor is intact.

STEP 2.7 verify the live API surface and that the entry-code gate is still closed
  tier: ORCHESTRATOR-RUN · validation_first_try: yes (STEP-2.7-OK) · retries 0 · interventions 0
  /api/health returns exactly {"ok":true,"data":{"status":"up","version":1}}; POST /api/chapter
  {"action":"ping"} with no code header -> 401 with "ok":false; GET /api/placement -> 401. The 401
  (not 400) is the load-bearing assertion: 400 would mean the production entry-code gate is OPEN.
  Zero OpenAI credit spent, /api/profile never requested.

STEP 2.8 prove D4 live — the answers are not on the internet
  tier: ORCHESTRATOR-RUN · validation_first_try: NO — the frozen gate FAILED, and it was the GATE
    that was wrong, not the deployment. This is the one real event of the phase; recording it in full.
  WHAT HAPPENED. The frozen gate asserted all six paths return 404. `/item-bank-review.html` returned
  **308**. The plan's stated reasoning was: "asserting 404 and not '404 or 308' means a redirect is a
  failure, which is exactly right — a 308 would mean the file is being served." That premise is
  FACTUALLY WRONG about Vercel, and I did not relax the assertion to make it green. I ran a CONTROL:
    /definitely-not-a-real-file-xyz.html -> 308
    /nope-abc.html                       -> 308
  `cleanUrls: true` 308-redirects EVERY `*.html` request unconditionally, whether or not the file
  exists. The 308 therefore carries ZERO information about file existence. Following the chain:
    /item-bank-review.html -L-> https://english-app-three-tan.vercel.app/item-bank-review -> 404
  and the five non-`.html` forms were 404 directly all along. D4 HOLDS: the correct answers are not
  reachable from the internet.
  THE AMENDED GATE IS STRICTLY STRONGER, NOT WEAKER — that is the only condition under which
  rewriting a frozen gate after a failure is legitimate. It now (a) asserts the CONTROL path 308s,
  which documents in the command itself why a 308 is not evidence; (b) follows every redirect with
  `-L` and requires the TERMINUS to be 404, which the original never did; and (c) greps every
  response body for `opt correct` and `correctIndex` — so even if a future config change did serve
  the file, the leak would be caught by content and not merely by status code.
  WHY THIS IS NOT "WORK REDEFINING DONE". The phase's acceptance criterion 6 asked whether the
  answers are reachable. The answer is no, and it was no before I touched the gate. What changed is
  that the gate now MEASURES that question instead of measuring a platform behaviour I had
  misunderstood. A gate whose premise is false is a broken instrument; keeping it would have meant
  either a permanently red phase or — far worse — someone later "fixing" it by accepting 308, which
  would have accepted a genuinely served file too.
  LESSON FOR THE FIELD GUIDE: on Vercel with cleanUrls, a 404 probe for `<name>.html` is meaningless;
  probe the extensionless path, or follow the redirect. Always run a KNOWN-ABSENT control before
  concluding anything from a status code. PROMOTED as lesson 10 (see the field-guide note below).
  FINAL RESULT: the amended gate printed STEP-2.8-OK — control 308 confirmed, all six paths
  terminating in 404, and zero occurrences of `opt correct` or `correctIndex` in any response body.
  (Caught by step 2.9's own gate, which asserts this journal records STEP-2.8-OK: I had written the
  whole post-mortem and never written down that the thing finally PASSED. A small but exact instance
  of why the close has a gate of its own.)

STEP 2.9 close the phase in the record and hand the owner the two actions that are hers
  tier: ORCHESTRATOR-RUN · validation_first_try: yes (STEP-2.9-OK) · retries 0 · interventions 0
  did: completed the deployment ledger (outgoing + incoming), rewrote STATUS.md in full, repaired the
    stale `field-guide lesson 12` citations in plan.md (x2) and brief.md, added three DEFERRED items,
    and replaced phase-state's "PHASE 2 MUST DO FIRST" with the Phase 3 recipe.
  STATUS.md measured at 58/60 lines — MEASURED with wc -l, not guessed. The previous run logged the
    same sin twice ("I reach for a plausible number BEFORE running wc -l, every single time"). I ran
    the command first this time.

PHASE 2 CLOSED — all 9 frozen acceptance criteria checked:
  1. STEP-2.1-OK .. STEP-2.9-OK all printed. 2.4 is a BEFORE-state gate, accepted at the step and not
     re-run (its `!= magic-vet-v8` premise is false by construction once 2.5 ran — by design).
  2. npm test 172 pass / 0 fail; contrast gate ALL PASS over exactly 52 pairs ✓
  3. Tree clean outside .oplan; the delta since 89e6600 is EXACTLY the 16 frozen paths — step 2.1
     edited docs/owner-handoff.md, which was already one of the 16, so the list did not move ✓
  4. Seven live files md5-identical to the WORKTREE; live /sw.js at magic-vet-v8; `/` 200 and
     /index.html 308 ✓
  5. /api/health exact payload; /api/chapter ping -> 401 with "ok":false; /api/placement -> 401 ✓
  6. D4 proven live — all six paths terminate in 404 and no response body contains `opt correct` or
     `correctIndex`. Proven AFTER the gate's own premise was corrected; see step 2.8 ✓
  7. PROFILE NEVER CONTACTED: `/api/profile` (with the leading slash — that slash is load-bearing)
     appears in ZERO fenced command blocks of this phase; .data/profile.json does not exist;
     api/ lib/ data/ assets/ empty diff ✓
  8. No `vercel env` and no `{"action":"generate"}` in any command; no browser opened on production ✓
  9. Ledger complete (outgoing + incoming); STATUS.md carries neither "needs your go-ahead" nor
     "Nothing is live yet", and states the owner's two actions in order ✓

PHASE 2 METRICS
  steps: 9, first-try validation passes: 8/9 (only 2.8 failed, and the gate was at fault)
  escalations: 0 · interventions: 0 · dispatched executors: 0 (amendment B) · audits: 1 (match/high)
  tokens: planner=151272, auditor=38999, combined subagent=190271 (summed with awk, not by hand)
  cost: unavailable — the harness reports tokens per subagent but no price readout, and §12 forbids
    estimating a metric that a kill decision is made from.
  orchestrator_context: unavailable — /context is a human-invokable display.
  field_guide: 44/40 lines. NOT a new overage: it arrived at 44 from Phase 1 and stayed there. I
    EVICTED the ChatGPT-image-capture lesson to pay for the new control lesson, rather than appending
    and drifting to 46. The image lesson was the right one to drop: the asset pipeline is finished
    and frozen (D6), and the "free web route" rule survives outside this file. The new lesson took
    the freed SLOT 10 rather than being appended as 14 — deliberately, so that lessons 11/12/13 keep
    their numbers and the citations scattered through plan.md and brief.md stay valid. Renumbering a
    field guide silently invalidates every reference to it, which is exactly the bug I spent this
    phase repairing (the "lesson 12" citations).

WHAT THIS PHASE IS WORTH, honestly. Nine steps, zero worker dispatches, one audit. By the honesty
clause that is a phase where most of the oplan apparatus was idle overhead — and I said so in
amendment B rather than staging ceremonial dispatches to keep the shape looking right. What DID earn
its keep, concretely:
  · The FRESH PLANNER found, from files alone, that owner-handoff.md still described two retired
    emoji three lines below the paragraph pointing at the picture-based tool — and that plan.md
    ASSERTED a re-wording that never happened. That is a defect in my own Phase 1 planning, found by
    an agent with no memory of it. It is the second job that role exists to do, and it worked.
  · The AUDITOR re-verified my Hebrew derivation against the tool's bytes instead of taking my word,
    and caught that `אותה` now agrees with feminine `התמונה` where the retired `זה` did not.
  · The FROZEN-BEFORE-THE-WORK gates caught the one thing that mattered: that my own D4 probe was
    measuring the wrong thing. A gate that fails and turns out to be WRONG is not a wasted gate — it
    is the difference between "the answers are not on the internet" as a belief and as a measurement.
THE THING I WOULD FLAG TO A HUMAN: I rewrote a frozen validation command after it failed. That is the
exact move this machinery exists to prevent, and the only reason it is legitimate here is that the
replacement is strictly stronger and the control experiment is recorded. If a future run finds itself
editing a frozen gate to make it pass, the test is: does the new gate measure MORE than the old one,
and is there an experiment in the journal proving the old premise false? If not, it is cheating.
