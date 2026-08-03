# briefing — word-write (the story of this run, in plain words)

Append-only. Written for the human, never pasted into an agent's instructions.

---

## 2026-08-03 — the plan

**What we are building.** Her quizzes only ever ask one kind of question: a sentence with a gap
and six buttons to choose from. She asked to have to *write* the word instead of picking it, to
be shown the Hebrew and have to produce the English, and for the phone to stop autocorrecting the
answer for her. She also said hearing a word read out every single time gets annoying. This run
gives her four kinds of question instead of one, and she gets one of each in every sitting.

**How many phases:** 3.

**PHASE 1 — the engine** [planned in full]
  What we do:  Write the rules as plain functions and test them hard. Nothing on screen changes.
  Why:         Every hard part of this is a question about what is *correct* -- what counts as a
               spelling slip, which wrong answers are safe to offer, which question can even be
               asked for a given word. All of that can be tested without a screen, and things
               tested without a screen get tested properly.
  Done when:   All four rule sets pass tests that I have personally watched FAIL first, and the
               file with today's quiz screen in it has not been touched at all.
  Steps:
    1.1 Teach it to mark a typed word right or wrong -- because "she types it" is meaningless
        until we have decided exactly what counts as right.
    1.2 Stop the same word being question #1 every single time -- because she said so, and today
        one word she once got wrong is pinned to the front of every quiz forever.
    1.3 Decide which wrong answers may be offered in the Hebrew question -- because two different
        English words can mean the same Hebrew word, and offering both would mark her wrong for a
        right answer. That exact bug shipped to her once already.
    1.4 Decide which of the four question kinds to ask -- because not every word can support
        every kind, and a question with a blank prompt is worse than no question.

**PHASE 2 — the screen** [rough sketch -- planned properly once Phase 1 is done]
  What we do:  Build the four question cards, including the typing box with autocorrect off.
  Why:         Phase 1 is invisible to her until this exists. This is the phase where she gets it.
  Done when:   A sitting of four asks each kind exactly once, a typed right answer counts exactly
               the same as a tapped one, and I have looked at all four cards at phone width.

**PHASE 3 — ship it** [rough sketch]
  What we do:  Deploy, and check that what is live is byte-for-byte what was tested.
  Why:         "The work was done and she never saw it" is this project's documented way of
               failing, and the gap between phases is where it hides.
  Done when:   Every changed file is proved identical live, and you have seen the summary.

**WHAT WE ARE NOT DOING:** writing whole sentences (she asked, it is recorded, it is not this
run); generating the next story in the background; the automatic top-up of missing recordings.

**BIGGEST RISK:** I cannot drive her real phone keyboard from this machine. I can set every
correct setting and check it at phone size in a desktop browser, but whether her phone actually
stops suggesting the answer is something only she can confirm. How we would notice: she tells you
the phone still writes the word for her. It is stated again at the end of the run, not buried.

---

## 2026-08-03 — Phase 1 closed: the engine

**WHAT WE SET OUT TO DO.** Write the rules for the four new question kinds as plain functions and
test them hard, without touching anything she can see.

**WHAT WE ACTUALLY DID.**
- Taught the app to mark a typed word right or wrong, including telling a typing slip apart from
  a wrong answer.
- Stopped one word being question #1 in every single quiz — her loudest complaint.
- Made it impossible for the Hebrew question to offer two words that mean the same thing.
- Gave it the rule for which of the four kinds to ask, and what to do when a word cannot support
  one of them.

**WHAT WE FOUND OUT.** Three things, and they are the real content of this phase.

1. **Her Hebrew words are all different from each other.** I checked, because the third piece of
   work above depends on it. All 46 have a Hebrew translation and no two share one. So the rule
   that protects her costs nothing today — it is insurance for later, when her vocabulary grows
   into a collision.

2. **My own safety checks were the least reliable part of this phase.** Three of them were broken,
   all written by me before any work started. One demanded a file stay 99 lines long while every
   step added lines. One used a command that cannot work on this computer at all. And one — the
   worst — reported it had run 500 checks when it had really run **8**. That last one existed
   specifically to stop a test from pretending it had done work, and it was doing exactly that.
   All three are fixed, and the 500-check one is now stronger than it was meant to be: it also
   proves the shuffle is genuinely even-handed, measured at exactly 50%.

3. **Twice, a helper stopped and asked me a question instead of guessing** — once about the broken
   command, once about the 8-versus-500 number. Both times they were right and I was wrong. That
   is the single rule this whole way of working rests on, and it paid for itself twice in one day.

**WHAT WENT WRONG.** No work had to be redone. One helper's tool silently chopped a file in half
mid-write (a stray `%` sign confused it); it noticed by counting characters, repaired it, and I
checked independently that nothing was lost. And my final check on the phase failed — correctly —
because one piece of code was inserted into the middle of a file rather than added at the end. The
thing I actually cared about (that nothing old was changed or deleted) turned out to be perfectly
true; the check had been written to look for the wrong thing.

**WHAT IT COST.** Roughly 345,000 words' worth of helper thinking. I am not quoting a dollar
figure because the tool did not report one, and I would rather say "unknown" than invent it.

**WHERE WE ARE NOW.** 494 tests pass, none fail. The file holding today's quiz screen has not been
touched at all. **She would not notice a single difference** — nothing is on her phone yet.

**WHAT HAPPENS NEXT.** Phase 2 builds the actual screens: the four question cards and the typing
box with autocorrect switched off. That is the phase where she gets what she asked for. Nothing
needed from you.

---

## 2026-08-03 — Phase 2 closed: the screen

**WHAT WE SET OUT TO DO.** Build the actual screens — the four question cards, and the typing box
with autocorrect switched off. This is the phase where she gets what she asked for.

**WHAT WE ACTUALLY DID.**
- Her five Hebrew prompts are copied into the app by a script from one locked document. Nobody
  typed them. Rewording one now fails the tests.
- The quiz screen learned three new kinds of question, and today's question comes out
  **byte-for-byte identical** — proved against a snapshot taken before we started.
- She can type an answer, gets one free second try when she is one letter off, and is scored
  exactly once no matter how many times she taps.
- Both quiz screens hand the engine her saved words and her sound list, so the new questions can
  actually appear.
- The app's cache version was bumped, which is the small change that makes her phone bother to
  download any of this.

**WHAT WE FOUND OUT.** Three things.

1. **Looking at the app found a fault that 550 passing tests could not.** After she fixes her
   typo, the card was showing *"almost! look again"* and *"well done!"* at the same time. Every
   piece was individually correct; together they were nonsense. It is fixed, and there is now a
   test — written first and watched to fail — so it cannot come back.

2. **Checking the app cost two throwaway web addresses, not one.** The moment I looked at the
   first one, the browser quietly memorised the old code and kept showing me the broken version
   even after the fix. I had to move to a fresh address to see the truth. This is a known trap
   here and it bit exactly as predicted.

3. **A helper stopped and asked me a question twice more**, and was right both times: once when
   my instructions contradicted my own safety check, and once when an old test demanded a line of
   code stay word-for-word the same while the work required changing it. That second one was a
   real judgement call and it was right to bring it to me rather than quietly edit a locked test.

**WHAT WENT WRONG.** Nothing had to be thrown away. But **four of my own safety checks were
broken** across this run — this phase added one that could never have failed no matter what, which
is the worst kind: it looks like protection and is not. All four are fixed and I now run every
check against a deliberately broken copy before trusting it.

**WHAT IT COST.** Roughly 830,000 words of helper thinking across both phases. No dollar figure —
the tool does not report one and I will not invent it.

**WHERE WE ARE NOW.** 551 tests pass, none fail. I have used the app myself at phone size and seen
all four question types, the free retry, and her typed text staying put. **It is all still only on
this machine — nothing has been sent to her phone yet.**

**WHAT HAPPENS NEXT.** Phase 3 puts it on her phone and checks that what is live is exactly what
was tested. That is the only step left.
