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
