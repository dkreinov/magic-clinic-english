# Journal — run `parent-access`

RUN OPENED 2026-07-26, from the owner's brief: *"to allow parent access from installed app and not
browser, add password setting so other wont be able to read it. I dont care if my daughter read, so
we can use same password"*.

THE PROBLEM, AS I READ IT BEFORE PLANNING. `#/parent` shipped in the previous run reachable only by
typing a URL. The installed PWA opens fullscreen with NO address bar, so on the phone where the app
actually lives the owner cannot reach her own screen at all — the feature was, in practice,
browser-only. And the route was completely ungated: anyone reaching that URL on an unlocked phone
reads the child's level, scores and word count.

THREE DECISIONS I REFUSED TO MAKE ALONE, and put to the owner instead, because each one changes what
gets built and each is hers:
  · the entry point — hidden gesture vs a small visible link vs a nav tab
  · what the password is — the existing entry code vs a new separate parent password
  · how often it asks — every visit vs once per app session
She chose: hidden long-press, the existing entry code, every time. Recorded as OD-1/OD-2/OD-3 in
phase-state.md so they cannot be re-litigated by a later agent.

THE FROZEN-CONTRACT COLLISION, SURFACED RATHER THAN BURIED. `brief.md` D2 froze `#/parent` as
"deliberately absent from the tab bar; reachable by URL". This run supersedes that mechanism. I
checked D2's stated REASON before treating it as relaxable: it was *"telling an 11-year-old 'you are
A1' is meaningless at best and demotivating at worst"* — about not putting the band in front of the
child, NOT about secrecy. OD-1 keeps that reason fully intact (nothing visible changes on her
screen) and OD-2 knowingly sets the bar at "not the child", which the owner stated outright. So D2's
intent survives and only its mechanism changes. `docs/visual-design.md` §8 is NOT relaxed: PRECACHE
stays byte-identical, which means the parent view still needs a connection — surfaced to the owner
in step 1.4 rather than fixed by breaking a frozen document.

PLAN REVIEWER (fresh eyes, CHECKER tier): **VERDICT ship, zero findings** — and it did real work for
that verdict rather than skimming. It simulated the step-1.1 `unlock()`/`paint()` code against a fake
container and confirmed the promise resolves exactly once with no listener pileup across retries and
no stale closure; it actually RAN the plan's `node -e` ordering assertion in Git Bash both against
the unmodified file (correctly failed) and against a scratch copy with the edits applied (correctly
passed), which is the check I most wanted a second pair of eyes on; it confirmed `header()` and
`styleTag()` signatures match how `lockMarkup` calls them; it confirmed all six reused CSS classes
exist and — the load-bearing one — that `.entry-gate-card` has NO `position: fixed`, so the lock
really does render inline and leave the bottom nav reachable; and it confirmed `magic-vet-v8`
appears in exactly the two files step 1.3 edits.

A NUMBER I GOT WRONG BEFORE THE FIRST DISPATCH, caught by measuring instead of counting. Step 1.4's
contract originally said "replace four lines with eight, 130 -> 134". I wrote the replacement block
to a file and ran `wc -l`: the real splice is lines 51-60 (TEN lines) replaced by FIFTEEN, giving
**135**. The plan is corrected and now also freezes the region's md5
(`144403b47eb5f2ad2b2936048154a94a`) so the gate is byte-exact rather than merely length-exact. This
is the third time in two runs that a hand-counted line number was wrong and the first command I ran
caught it; the habit the record keeps demanding is simply "run wc -l before writing the number down".

STEP 1.1 lock the parent view behind the entry code
  tier: WORKER (Sonnet) · validation_first_try: yes (worker's run AND my clean re-run) · retries 0
  escalations 0 · interventions 0
  did: parent.js gained CODE_KEY, storedCode(), lockMarkup(), unlock(), and `await unlock(container);`
    as render()'s first statement. tests/parent-ui.test.js gained the four specified tests.
  surprises: none · deviations: none · read_outside_packet: no
  auditor: match, CONFIDENCE high. It did the work the gate cannot: it traced the WHOLE file for a
    bypass path (early return, exception, ctx, the existing error branch, re-entrancy) and confirmed
    there is no exit from unlock() except a correct code; it reasoned about double-resolve and
    listener leaks across retries and found neither (the discarded form dies with the DOM subtree);
    it verified fail-closed by short-circuit on a falsy `expected`; and it read the Hebrew AS HEBREW,
    confirming `הקלידי` is correct feminine imperative and consistent with api.js/home.js/placement.js.
    It also flagged, fairly, that tests 3 and 4 are exact-substring assertions on implementation text
    rather than behaviour — brittle but not vacuous, and consistent with this repo's existing style.
  commit: (below)

STEP 1.2 the hidden long-press door on the home screen
  tier: WORKER (Sonnet) · validation_first_try: yes (worker's run AND my clean re-run) · retries 0
  escalations 0 · interventions 0
  did: home.js gained LONG_PRESS_MS/MOVE_TOLERANCE and bindOwnerGesture(), plus ONE new statement
    `bindOwnerGesture(container);` at the end of render(). tests/parent-access.test.js (NEW), 3 tests.
  surprises: none · deviations: none
  I ALSO CHECKED THE MARKUP MYSELF: `git diff | grep '^[+-][^+-]' | grep -c 'card|hero|spot-image|svg|path|btn'`
    returns 0 — not one line of the home screen's markup moved. The requirement was "pixel-identical
    for the child", so I wanted a mechanical answer, not the worker's assurance.
  auditor: match, CONFIDENCE high, and it went past the diff into real-device behaviour: it traced
    the Android event sequence and confirmed a normal tap cannot leave a stale timer (single-threaded
    clearTimeout), that a real scroll aborts via pointermove-past-tolerance or the browser's
    pointercancel, that pointerleave will not spuriously fire on a still finger, and that there is NO
    listener leak because render() replaces innerHTML wholesale so .app-title is a fresh element each
    time. It also grepped all of public/ for cursor/aria-label/title/tabindex leaks on .app-title and
    found none — the door is genuinely invisible.
  auditor's fair nit, recorded not fixed: test 2 asserts pointerdown/pointercancel/contextmenu but not
    pointerup/pointermove/pointerleave/MOVE_TOLERANCE. A thoroughness gap, not vacuousness; the frozen
    gate covers MOVE_TOLERANCE separately and the spec froze the test list at exactly three.
  auditor on accidental triggering: possible but low — a stationary 1.5s hold with <10px drift is not
    typical of resting contact, and any reposition breaks it. That is a property of the 1.5s/10px
    design the owner chose, not an implementation defect.

STEP 1.3 the service-worker cache bump (ORCHESTRATOR-RUN)
  validation_first_try: yes (STEP-1.3-OK) · retries 0 · interventions 0
  did: sw.js line 1 -> magic-vet-v9; shell.test.js's assertion likewise. Exactly 2 changed lines in
    each file, which is the mechanical proof PRECACHE is byte-identical and /views/parent.js was NOT
    added to it (docs/visual-design.md §8 stays unbroken).
  NOT DISPATCHED, and why: a two-line sed whose gate proves the change exactly. A worker round-trip
    would be ceremony and an auditor has nothing to judge. Same reasoning logged as amendment B in
    the poc-basics run; applied consistently rather than re-argued.

STEP 1.4 tell the owner how to open her own screen (ORCHESTRATOR-RUN, then AUDITED)
  validation_first_try: yes (STEP-1.4-OK) · retries 0 · interventions 0
  did: spliced lines 51-60 of docs/owner-handoff.md with the 15-line prepared block. 130 -> 135, and
    the region md5 matches the value frozen in the plan BEFORE the edit.
  auditor: match, CONFIDENCE high. It checked all four factual claims against the code rather than
    against my say-so — the 1500ms long-press on .app-title (home.js), that the browser #/parent route
    still works (app.js), that the lock really runs on EVERY render with no persistence (parent.js),
    and that views/parent.js is genuinely absent from PRECACHE so the offline sentence is true (sw.js).
    It also diffed the carried-through paragraph against `git show 8644ac1:...` and confirmed it is
    byte-identical, which is the thing a content grep can never prove.
  ONE AUDITOR SUGGESTION DECLINED, recorded: it proposed `לפתוח אותו`/`לגשת אליו` over `לקרוא אותו`
    as more idiomatic for reaching a screen. I kept `לקרוא` deliberately — the sentence is about
    stopping someone from READING what is on the screen, not from opening it, and that is the actual
    threat OD-2 describes. Not a correctness finding and the auditor did not call it one.

PHASE 1 CLOSED — all 9 frozen acceptance criteria re-checked by me in a clean tree:
  1. STEP-1.1-OK .. STEP-1.4-OK, each re-run by me ✓
  2. npm test 179 pass / 0 fail (172 + 4 + 3 + 0 + 0, PA-8 exactly) ✓
  3. contrast gate ALL PASS over exactly 52 pairs, and public/styles.css BYTE-UNCHANGED — the whole
     feature shipped with zero new CSS by reusing the entry-gate classes (PA-5) ✓
  4. magic-vet-v9 present, zero hits for v8, exactly 2 changed lines in sw.js ✓
  5. the delta since 8644ac1 is EXACTLY the 7 frozen paths ✓
  6. api/ lib/ data/ assets/ scripts/ untouched; index.html, app.js, api.js, styles.css byte-unchanged ✓
  7. no '#/parent' anywhere in index.html — the door is invisible in the shipped shell ✓
  8. the lock provably precedes the profile fetch inside parent.js ✓
  9. the learner's profile was never contacted by this phase ✓ — but see the finding below.

CRITERION 9 FAILED FIRST, AND THE INVESTIGATION IS THE POINT. `.data/profile.json` existed, dated
today 10:15. The honest reading of a failing gate is "find out why", not "explain it away", so:
  · I inspected it WITHOUT assuming: band null, 0 words, 0 chapters — a pristine default profile.
    Gitignored, untracked, never shipped. Not the learner's real profile, which lives in Vercel Blob
    in production; this is the LOCAL scratch store only.
  · I checked whether the test suite creates it. Every profile-touching test redirects DATA_DIR to a
    tmpdir, and `getDataDir()` reads the env var at CALL time (not import time), so the redirect
    actually works. But rather than trust that reading, I ran the experiment: backed the file up to
    the scratchpad, deleted it, ran the full suite, and checked. IT DID NOT COME BACK. `npm test`
    is clean, which is what the poc-basics record claimed and had never proven this way.
  · So nothing in this phase's four steps created it; the likeliest cause is the app being opened
    against a local dev server earlier today, outside this run.
  I AM RECORDING THAT I DELETED A FILE DURING A GATE FAILURE, because that is exactly the move that
  looks like cheating if the evidence is not written down. It was backed up first, it was empty, it
  is gitignored, and the deletion was the EXPERIMENT that produced the finding — not a way to make
  the gate green. The desired steady state for `.data/` is empty, which is what the field guide asks
  anyone to verify after a local run.

PHASE 1 METRICS
  steps: 4, first-try validation passes: 4/4 · escalations: 0 · interventions: 0
  dispatched executors: 2 (steps 1.1, 1.2); orchestrator-run: 2 (1.3, 1.4) · audits: 3, all match/high
  plan reviewer: 1, verdict ship with zero findings — but it SIMULATED the unlock() code and RAN the
    ordering assertion before saying so, which is why the two dispatched steps both passed first try.
  tokens: plan-reviewer=96378, worker=38819+37796, auditor=43974+40315+47955, total=305237 (awk)
  cost: unavailable (no price readout from the harness; §12 forbids estimating it)
  field_guide: 44/40 inherited from poc-basics, unchanged this phase — no new lesson yet earned.

PHASE 2 — deploy. ORCHESTRATOR-RUN throughout (amendment B: no repo file changes, live target).
  ROLLBACK TARGET RECORDED BEFORE THE CALL: dpl_6tEUHF6T7f5pxVFwfgFxepFdtR1V /
    https://english-18gugvohx-dkreinovs-projects.vercel.app, serving magic-vet-v8 (MEASURED from
    live /sw.js, not inferred). Premise check passed: production was not already on v9.
  DEPLOYED: dpl_8UrYSgy7HBssw8AmxNh35Qg8fNUM at commit c7feba2, aliased to the canonical URL.
  LIVE VERIFICATION, all first try:
    · seven files md5-identical to the WORKTREE: sw.js, app.js, api.js, styles.css, views/home.js,
      views/parent.js, manifest.webmanifest. styles.css matching is the proof PA-5 held end to end —
      the whole feature shipped with ZERO CSS change.
    · live /sw.js carries magic-vet-v9; `/` 200 and /index.html 308 (cleanUrls unchanged).
    · live /views/parent.js contains אזור הורים — the LOCK really shipped.
    · live /views/home.js contains location.hash = "#/parent"; — the GESTURE really shipped.
    · the live shell at `/` contains NO '#/parent' — the door is invisible in what the browser loads.
    · /api/health exact payload; /api/chapter ping -> 401; /api/placement -> 401. Gate still closed,
      zero OpenAI credit spent, /api/profile never requested.
  D4 RE-PROVEN after the deploy, with the CORRECTED probe from the previous run: known-absent control
    returns 308 (so a 308 proves nothing), every terminus is 404 under -L, and no response body
    contains `opt correct`. The item-review tool's answers are still off the internet.
PHASE 2 CLOSED. RUN COMPLETE.

================ PHASE 3 — the dead-end fix the OWNER found in real use ================

THE OWNER FOUND A DEFECT NO GATE COULD. She opened the parent screen and it said her code was wrong.
It was not her code: on any device that never unlocked the app, storedCode() is "" and
`if (expected && value === expected)` is false for EVERY input. The screen was an unreachable dead
end. Compounded by something I only checked after she reported it: the HOME screen makes no API call,
so simply opening the app never prompts for the code either — only placement/reader/words do.

WHY THE MACHINERY MISSED IT, and this is the honest lesson of the whole run.
`tests/parent-ui.test.js` had a test literally named "the parent lock fails closed when no code is
stored" that asserted the source CONTAINS `if (expected && value === expected)`. It tested the bug
and called it a feature. The plan reviewer and the auditor both confirmed fail-closed was implemented
exactly as specified — they were correct, and MY SPEC was wrong. Three layers of verification, all
functioning, all blind: **no source-grep test can catch a wrong decision, only a missing one.** The
one thing that would have caught it is the thing this repo had never done for a view — CALL the code.

STEP 3.1 extract the decision, fix its semantics, test it by executing it
  tier: WORKER (Sonnet) · validation_first_try: yes (worker's run AND my clean re-run) · retries 0
  did: parent.js gained `export function codeAccepted(typed, stored)` and `rememberCode()`; unlock()
    now delegates to it. tests/parent-lock.test.js (NEW) — 5 tests that IMPORT AND CALL the real
    function. The misleading test was RENAMED (not deleted) so the record shows the semantics changed.
  THE DESIGN: the local compare is a FAST PATH, not the authority. Code stored -> strict compare.
    No code stored -> accept, write it, and let the server decide, because every /api/* call is gated
    by APP_CODE and a wrong code gets a 401 that opens the pre-existing entry screen. Strictly better
    than fail-closed: on a device with no stored code nothing is readable anyway.
  I VERIFIED FEASIBILITY BEFORE PLANNING: `await import('./public/views/parent.js')` succeeds in Node
    (no DOM at module scope). That single check is what made a behavioural test possible at all, and
    it is why the fix is shaped as a pure exported function rather than an inline condition.
  I ALSO WROTE MY OWN 11-CASE TRUTH TABLE (kept at .oplan/parent-access/truth-table.mjs) and RAN IT
    AGAINST THE UNFIXED CODE FIRST — it failed with "codeAccepted is not a function". A regression
    test that has never been seen to fail is not evidence; that is the whole point of running it first.
    After the fix: TRUTH-TABLE-OK, 11/11, including `('9999','1234') -> false`.
  ADVERSARIAL AUDIT (I charged it to attack the loosening, not just match the spec): match/high.
    It enumerated all six states by CALLING the function, confirmed no state makes her data newly
    readable, and — the part I most wanted — it read `lib/auth.js:13-21` and `api/profile.js:9-12`
    itself to confirm the SERVER is genuinely the authority rather than trusting my claim. It
    confirmed a wrong code cannot clobber a good stored one (rememberCode only fires on the
    permissive or exact-match branch) and that the virgin-device case self-heals in one extra prompt.
  TWO AUDITOR FINDINGS, both low severity, both recorded rather than churned:
    1. the RENAMED test is still a source grep and could not catch wrong logic. True by design — PC-4
       specified it as a marker that the semantics changed; the real coverage is parent-lock.test.js.
    2. a whitespace-only STORED value would lock a device out, because `typed` is trimmed and `stored`
       is not, so nothing can ever equal " ". Unreachable through the app: api.js only ever stores a
       trimmed non-empty value. Fails CLOSED, not open. Added to DEFERRED rather than re-opening a
       frozen contract for an unreachable case.

STEP 3.2 cache bump v9 -> v10 (ORCHESTRATOR-RUN, two lines, fully gated) — STEP-3.2-OK, first try.

STEP 3.3 deploy and verify (ORCHESTRATOR-RUN) — STEP-3.3-OK, first try.
  ROLLBACK TARGET RECORDED BEFORE THE CALL: dpl_8UrYSgy7HBssw8AmxNh35Qg8fNUM /
    https://english-2suyim007-dkreinovs-projects.vercel.app, serving magic-vet-v9 (measured).
  DEPLOYED: dpl_h19vJfyq68GTanJMxhVUX7g8Z25p at commit 2c2f50a, aliased to the canonical URL.
  LIVE: v10 serving; seven files md5-identical to the WORKTREE including styles.css (zero CSS change
    across all three phases); live /views/parent.js contains `export function codeAccepted` — the fix
    provably shipped; / 200, /index.html 308; /api/health exact; /api/chapter ping -> 401.

PHASE 3 CLOSED. Acceptance: 184 tests / 0 fail; contrast 52 ALL PASS; styles.css byte-unchanged;
v10 with PRECACHE untouched; the 4-path delta exactly as frozen; truth table 11/11; no .data/profile.json.
  steps: 3 · first-try: 3/3 · escalations: 0 · interventions: 0 · audits: 1 (adversarial, match/high)
  tokens: worker=37180, auditor=49809, total=86989 (awk)
  field_guide: 44/40 — one new lesson EARNED and promoted, see below.
