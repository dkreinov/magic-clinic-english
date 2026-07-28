# Briefing — word-g1 (the story of the run, for the human)

## The plan, in plain words (2026-07-28, before anything ran)

WHAT WE ARE BUILDING: Today the app only knows what she TELLS it ("I know this word") and what
the quiz checks. It cannot notice on its own that she is learning. G1 fixes that: a word she
tapped once, and then read again in two later chapters without tapping it, gets marked
"almost knows it". The app's guess is humble on purpose — it never changes her stories; only
passing a quiz question (next phase) or her own "I know this" button turns it into "knows it".

HOW MANY PHASES: 3, each ending in something she can see, deployed (the owner's rule).

PHASE 1 — the engine and the badge  [planned in full, approved by a fresh reviewer]
  What we do:  build the noticing rule, show a third badge כמעט יודעת, keep her claim button,
               back up her data, ship it, and prove nothing was lost.
  Why:         this is the producer every later feature (daily review, the magic clinic) feeds on.
  Done when:   the app is live at v16, all 291 tests pass, and her word collection reads back
               from production with zero losses and every change explained.
  Steps:
    1.1  Put the document she signed into docs/growth.md, with an honest SIGNED line on top —
         because the file of record still says "awaiting signature".
    1.2  Teach the profile that a word can be "almost known", and that when two spellings merge,
         the more-trusted verdict wins — a merge must never quietly discard her progress.
    1.3  Write the noticing rule itself — met again in 2 later chapters, at most 2 automatic
         nominations per word ever, so no word can ping-pong.
    1.4  Run the rule each time a new chapter is made — the one moment her profile is already
         open and about to be saved.
    1.5  Show it to her: the third badge, and the "I know this" button stays — her word always
         outranks the app's guess.
    1.6  Bump the cache version so her phone actually gets the new screen.
    1.7  Look at the badge ourselves in the practice sandbox — no test can judge Hebrew layout.
    1.8  Copy her live word collection to a safe folder BEFORE shipping — first release that
         writes new fields into it, and there is no undo. (We ask the owner here whether the
         backup is deleted at close, like last time.)
    1.9  Ship, and prove the exact bytes we wrote are what the server serves.
    1.10 Read her collection back: zero words lost, every status change explainable — or we
         roll back and stop.
PHASE 2 — candidates get quizzed  [rough sketch]
  What / why / done when: the quiz asks about at most one "almost known" word per sitting; one
  wrong answer sends it back to learning with a kinder message; done when a candidate can
  actually become "known" end to end, deployed.
PHASE 3 — quiz items for candidates  [rough sketch]
  What / why / done when: the weekly item top-up also covers nominated words (else G1 deadlocks
  — a candidate with no quiz item can never pass); done when every claimed OR nominated word
  has an item, deployed.

WHAT WE ARE NOT DOING: nothing the app guesses ever changes her stories; no quiz changes in
phase 1; no off-list word audio; no spaced repetition yet; no runtime AI calls, ever.

BIGGEST RISK: her real profile may have NO word that qualifies yet — the engine would ship
working but invisible. We measure it at step 1.10 (candidates=N) and say so plainly rather
than assume. Second risk: anything lost from her collection — that is why 1.8 backs up first
and 1.10 refuses to pass without a mechanical explanation for every change.
