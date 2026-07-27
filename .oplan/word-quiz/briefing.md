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

## Phase 4 — plain report at the close (2026-07-27)

=== PHASE 4 — PLAIN REPORT ===
WHAT WE SET OUT TO DO: build the quiz screens — the part Mika actually sees — so the correction
loop phase 3 built finally reaches her.
WHAT WE ACTUALLY DID:
  · 4.1 the brain: which words are due (words mid-slip first), which six choices to show.
  · 4.2 the question card: meaning on top, sentence with a gap, six words each with a little
    speaker, praise when right, the true word when wrong, and a kind line when a word is taken
    back. Each sitting gets a genuinely fresh identity, so three slips in one bad afternoon can
    never cost her a word.
  · 4.3 a "בואי נתרגל מילים" button in המילים שלי, which hides itself when there is nothing to ask.
  · 4.4 four questions after every chapter, automatically, before the story continues; nothing to
    ask means she goes straight on. Every chapter gets its own fresh quiz.
  · 4.5 the app's version stamp bumped and the two new files added to the offline list.
  · 4.6 a separate helper who never saw the code tried to break all of it.
WHAT WE FOUND OUT:
  · The checking machinery caught three real problems the builders' own green tests missed: an
    invisible blank line on the words page; a "quiz finished" switch that would have silenced
    every quiz after chapter 1 (caught before any code was written); and a test that stayed green
    while the "word taken back" message showed on EVERY wrong answer — it now proves the message
    stays silent until the real third strike.
  · Eight deliberate sabotage runs each tripped the right test. The independent breaker could not
    make the real code misbehave at all.
  · The three screens she will see match, byte for byte, a prediction I wrote by hand before the
    screen code existed — twice: once when the screen was built, once at the gate.
  · One machine quirk: the file-list check failed while both lists were IDENTICAL, because "sort"
    orders punctuation differently in different languages. The check now pins one ordering.
WHAT WENT WRONG: nothing that reached the finished work; every catch above was fixed and
re-checked before acceptance.
WHAT IT COST: no money (no paid services). Agent work this phase: about 1.17 million tokens
across one planner, one plan reviewer, six builders and six checkers.
WHERE WE ARE NOW: 282 tests, zero failures; ten of eleven closing checks green.
WHAT HAPPENS NEXT: the eleventh check is YOU — read the three screens in the chat and say yes or
say what to change. Also yours: whether to deploy the quiz now (phase 6) or build automatic
promotion first (phase 5); nothing technical forces the order.
=== END PLAIN REPORT ===

2026-07-27, later: **you approved the screens** ("yes approve, go ahead") and kept the planned
order. Phase 4 is closed — all eleven checks. Next: a fresh planner drafts phase 5 (automatic
promotion) from the written record; you'll see its plan in plain words before anything runs.

2026-07-27, later still: **phase 5 stopped before it started, for a good reason.** The fresh
planner discovered the automatic-promotion design document was never signed by you, your own
brief says to rewrite it before signing, and the algorithm it describes was never built. You
chose to deploy first (D26); automatic promotion waits for a properly signed design.

## Phase 6 briefing — the deploy (2026-07-27)

=== PLAN IN PLAIN WORDS ===
WHAT WE ARE DOING: getting the quiz onto Mika's phone, safely. Copy her profile out to a dated
backup file first (twice — once to learn her words, once seconds before shipping), write quiz
questions for every word she has claimed that lacks one, ship it all in ONE deploy, prove
nothing of hers was lost, and then YOU look at it on a real phone — the first time any screen of
this project is seen in a browser.
THE STEPS: freeze what is live and how to undo it → back up her profile → work out which words
need questions → loosen one test that pins the bank at exactly 50 files (it would go red) and
add five honest dated lines to the growth document → write the questions in small checked
batches → two independent helpers try to break them → YOU read every new question → fresh
backup, then deploy → machine-check what shipped → read her real profile back and prove nothing
was lost → YOUR phone check → close, and (your request) delete the backup files.
WHAT WE ARE NOT DOING: no automatic promotion (deferred), no new features, no restore mechanism
(you accepted capture-only), no touching her data beyond the two sanctioned reads.
BIGGEST RISK: a new question where a wrong option also fits — no machine can see it; two
independent readers plus you are the whole defence, and that is said honestly rather than
promised away.
NEEDS YOU AT: reading the new questions (gate A), the go-moment before the deploy, and the
phone check (gate B).
=== END ===
