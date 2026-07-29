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
