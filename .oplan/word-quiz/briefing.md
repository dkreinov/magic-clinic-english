# Briefing — word-quiz (W5b) · the run's story, in plain words

(This file was created at the phase-3 → phase-4 boundary; the run predates the briefing file.
The story of phases 1-3, told plainly, lives in the journal and the STATUS history: phase 1 built
the question format and a 50-word pilot you approved — after one false closure an audit caught;
phase 2 was cancelled as a phase and became a weekly top-up; phase 3 built the strikes-and-demotion
bookkeeping and you approved its printed transcript.)

## Phase 4 briefing — written before the first dispatch (2026-07-27)

=== PLAN IN PLAIN WORDS ===
WHAT WE ARE BUILDING: the quiz screens Mika actually sees. Until now the app can *record* that she
got a word wrong, but nothing ever asks her anything. Phase 4 asks: the word's meaning, a sentence
with a gap, six words to choose from, a little speaker on each — after every chapter, and from a
practice button in המילים שלי. When a word slips away from her, a kind line tells her so.
HOW MANY PHASES LEFT: this one, then 5 (automatic promotion) and 6 (deploy).

PHASE 4 — the quiz screens   [planned in full, review verdict: ship]
  What we do:  six steps, each built by a helper and checked twice.
  Why:         phase 3 built the bookkeeping; without screens the correction loop never fires.
  Done when:   282 tests pass, an independent helper fails to break it, and you approve the
               actual screens.
  Steps:
    4.1 The brain: which words are due for asking, and which six options to show — because
        nothing decides that today. Words mid-demotion come first, so a third strike can arrive.
    4.2 The question card itself: meaning ABOVE the sentence (your D22 decision), six options,
        speaker buttons, and the "word taken back" message — because the whole loop is invisible
        without it. Each sitting gets a genuinely fresh id, which is the one thing phase 3 could
        not test for itself.
    4.3 A practice button in המילים שלי — because she should be able to test herself when she
        wants; it hides itself when there is nothing to ask.
    4.4 Four words after each chapter, automatically, before the story continues — because that is
        the predictable rhythm you chose in D10. If there is nothing to ask she goes straight on.
    4.5 Bump the app version and add the two new files to the offline list — because a returning
        phone would otherwise keep the old app, or open to a blank page with no internet.
    4.6 A separate helper who never saw the code tries to break all of it, proving every test can
        actually fail — because the last three shipped bugs all passed the author's own tests.
WHAT WE ARE NOT DOING: no new profile fields, no promotion, no deploy, no new colors or styles,
no quiz on words she is still learning, no images.
BIGGEST RISK: a sitting that is not really a new sitting — then no word can ever collect three
strikes and the loop dies silently with every light green. Three separate tests guard exactly this.
SECOND RISK, worth knowing: the bank has questions for only the 50 pilot words — until the first
weekly top-up runs (now a phase-6 requirement), the quiz may have nothing to ask about the words
she actually claimed. Correct behaviour, but it would look like a dead feature.
=== END ===

What the plan review caught before any code: the after-chapter quiz would have run once and then
silently never again for later chapters — the "done" switch was never reset. Fixed in the plan,
with a test pinning it. Cost of catching it here: one message. Cost of catching it after building:
a re-opened step.
