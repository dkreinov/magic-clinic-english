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
