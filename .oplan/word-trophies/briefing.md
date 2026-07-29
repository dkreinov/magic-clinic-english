# Briefing — word-trophies (for the human; plain words, append-only)

=== PLAN IN PLAIN WORDS (2026-07-29) ===
WHAT WE ARE BUILDING: a trophies tab for her — 8 real achievements (reading, showing up,
words, quizzes, proving the app's guesses), each with bronze/silver/gold and its own picture
in the app's art style, celebrated the moment she earns one, never taken away.
HOW MANY PHASES: 4

PHASE 1 — the invisible engine   [planned in full, frozen, awaiting your GO]
  What we do:  teach her saved profile to hold trophies, write the 8 counting rules exactly
               as you signed them, add the award-stamper (adds, never removes or rewrites),
               wire it into the two moments the server already saves her profile.
  Why:         everything visible later stands on this; it must be boringly correct first.
  Done when:   the test suite grows 303 -> 328 and every new rule was WATCHED to fail when
               broken on purpose; nothing under public/ moves by one byte; nothing deploys.
  Steps:
    1.1 the profile learns a trophies box exists — so old and new profiles both stay legal.
    1.2 the 8 signed counting rules, each tested against hand-computed examples.
    1.3 the award-stamper: fills in newly earned tiers, provably never regresses.
    1.4 wired at the two save moments (after the new chapter is counted — a measured fix to
        the signed wording, which would have missed every chapter milestone).
    1.5 re-run everything, write the record for the next phase.
PHASE 2 — the artwork   [sketch]
  9 images via the ChatGPT web chat in the house style; you approve each one.
PHASE 3 — the screen   [sketch]
  the trophies tab, cards, dimmed locked trophies, the celebration moment, cache v18.
PHASE 4 — the ship   [sketch]
  fresh backup of her profile, deploy, byte-proof, read-back proving no trophy vanished.

WHAT WE ARE NOT DOING: no sounds, no notifications, no progress bars, nothing at runtime
that calls an AI, no parent features on her screen.
BIGGEST RISK: a counting bug that tells her she earned something she did not — that is why
every rule ships with a hand-computed example AND a watched failure, and why a wrong award
can only be corrected by your ruling, never silently.
=== END ===

## PHASE 1 — PLAIN REPORT (2026-07-29, appended at the close)

WHAT WE SET OUT TO DO: build the invisible trophy engine — profile schema, the 8 counting
rules, the awarding function, and its two wiring points — with no visible or deployed change.

WHAT WE ACTUALLY DID:
- 1.1 Taught the profile file the "trophies" box and the rules for what a legal trophy
  record looks like (old app versions never choke on new trophies).
- 1.2 Wrote the 8 signed trophies with their bronze/silver/gold numbers and the exact
  counting rule for each.
- 1.3 Wrote the one awarding function: stamps a date on newly earned tiers, never removes,
  never rewrites, never invents.
- 1.4 Called it at the two moments the server already saves her profile (and proved it
  fires nowhere else — not on reads, not on errors, not from the phone).
- 1.5 Re-ran every agreed check on the finished tree and wrote the records.

WHAT WE FOUND OUT:
- A "break it on purpose" check in the plan was IMPOSSIBLE as written — the code path it
  expected to misbehave physically cannot write the file twice. The helper stopped and
  asked instead of guessing; the plan was amended in writing (amendment #3). Third bad-spec
  catch of this project, each by a different safety layer.
- The same plan gap hid a second flaw: the planned test fixture could not have detected the
  planted bug at all. The helper's stronger fixture was adopted as the spec.
- A checker once reported Hebrew letters where the file really holds escape codes — the
  message envelope itself had decoded them in transit. A second, tool-equipped checker
  measured the real bytes and confirmed the file is correct. New trap recorded.

WHAT WENT WRONG: nothing lasting. One helper retry (a gate counts an edited line as
delete+add — fixed by adding a new line instead), one plan amendment, one false-positive
audit resolved by direct measurement. No escalations, no reverts.

WHAT IT COST: about 730k helper-tokens across 4 builders and 5 checkers (dollar figures
not exposed by the harness this session). Wall clock: one afternoon, including a mid-run
/doctor errand unrelated to this project.

WHERE WE ARE NOW: engine live in the code, invisible to her; suite 303 -> 328, all green;
production untouched at v17; no capture of her profile exists (correct until phase 4).

WHAT HAPPENS NEXT: your GO for phase 2 — the 9 trophy artworks (ChatGPT web, one chat,
frozen style suffix, your approval per image). A fresh planner will plan it from the files.
