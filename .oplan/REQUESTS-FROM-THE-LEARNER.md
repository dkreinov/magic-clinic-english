# Requests from the learner (the child who uses the app)

Her own words, relayed by the owner. Captured verbatim in meaning, dated, NOT yet designed and
NOT yet scheduled. Each becomes a design decision in some future run — the point of this file is
that nothing she asked for gets lost between runs.

These are FEATURE REQUESTS, not defects, unless marked otherwise.

---

## R1 — tapping a word in the story should READ IT ALOUD, not only offer "add to my words"
**Raised:** 2026-07-30 (during the word-trophies run, phase 3).
**Her point:** when she taps a word while reading a chapter, the only thing she is offered is
adding it to her word list. She wants to HEAR the word.

**Why it matters:** she is learning to read English, and pronunciation is the part a written
glossary cannot give her. She is asking for the one thing the medium is worst at.

**What already exists (verified 2026-07-30, so nobody re-discovers it):** the app ALREADY has
word audio. `public/views/reader.js:721` and `public/views/words.js:218` both construct
`new Audio("/audio/words/<lemma>.aac")`. So there is a pronunciation mechanism and an audio
asset path already shipping — this is very likely a matter of surfacing it in the reader's
word-tap affordance, plus making sure the audio file exists for the tapped lemma (and deciding
what happens when it does not).

**Open questions for whoever designs it:** does the tap read it immediately, or add a speaker
button next to "add to my words"? What happens for a word with no recorded audio — silent,
hidden button, or a fallback? Does it count as a "tap" for the בלשית מילים trophy (it already
does — `curious` counts `taps`)?

---

## R2 — coming back from the dictionary should not reload the story
**Raised:** 2026-07-30, same conversation.
**Her point:** she adds a word, goes to look at her word list, comes back to the story — and the
story reloads and she has to wait. She says there is no reason to reload it if the story has not
changed.

**She is right, and this is arguably a DEFECT, not a feature request.** A re-render that costs a
visible wait, for content that did not change, is a bug in the experience even if every function
returns correctly.

**Where to look:** the router is a static `ROUTES` map in `public/app.js` and each view's
`render(container, ctx)` rebuilds `container.innerHTML` from scratch; the reader's `boot()`
re-fetches the profile on every entry. So leaving `/reader` and returning re-runs the whole
view including its network round-trip. The fix is likely some form of "if the chapter list and
the profile revision have not changed, restore the previous DOM/scroll position instead of
rebuilding" — but note the app deliberately re-reads the profile to stay honest about state, so
this needs care, not just a cache.

**Open questions:** what is the correct invalidation signal (chapter count? a profile revision?
a timestamp)? Should scroll position be restored too — she did not say so, but "it takes time"
usually also means "and I lost my place". Worth asking her.

---

## How to use this file

- Do NOT fold these into a run that is already in flight. The word-trophies run was mid-phase-3
  when both were raised, and they were recorded rather than absorbed.
- When one is picked up, it gets a design decision with the owner's sign-off like any other, and
  this entry gets a line saying which run took it and where the design lives.
- If she raises something and it is a defect (like R2 probably is), say so plainly rather than
  filing it as a nice-to-have.

---

## R3 — "at the end of each chapter I get the same exact questions" — CONFIRMED DEFECT
**Raised:** 2026-07-31, via the owner. **Status:** diagnosed, not fixed.

**She is right, and it is not the comprehension questions.** Measured against her real profile:
her four chapters each carry their OWN three questions (four distinct sets, verified by
fingerprint). Those are fine. The repetition is in the **word quiz that runs after them**.

**Root cause, measured with the shipped code against her real data:**

1. `public/views/reader.js:344` builds the chapter-end quiz from
   `candidateLemmas.concat(pickQuizWords(profile, 20))` — i.e. **her whole vocabulary**, exactly
   the same pool the words screen uses. **The end-of-chapter quiz has nothing to do with the
   chapter she just read.**
2. `pickQuizWords` (`public/quiz-core.js:50`) is **fully deterministic**: sort by strikes desc,
   then needsReview, then never-quizzed-first, then oldest `lastQuizAt`, then alphabetical.
3. `startQuiz` (`public/quiz.js:232`) then walks that list **in order and takes the first four
   that load**. `rand` is used only to shuffle the multiple-choice OPTIONS and to pick among
   alternate bank items — **never to choose WHICH words are asked**.
4. Her word `dad` has `strikes: 1` (she answered it wrong once). Strikes sort FIRST and
   unconditionally, and `applyQuizAnswer` only clears a strike on a CORRECT answer
   (`lib/profile.js`). So **`dad` is question #1 in every single quiz until she gets it right** --
   and if she gets it wrong again the strike rises and it stays pinned.

Her live pool at the time of the report: 12 known words, 7 of which had NEVER been quizzed. The
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
unchanged profile (verified by calling it twice).

**So the mechanism is: one word is literally identical every time, and the other three rotate only
as fast as she finishes quizzes.** To a child that is "the same exact questions".

**Two separable problems, and they want different fixes:**
- *(a) selection is first-N of a fixed order, never sampled.* Small, safe fix: keep the priority
  ranking as a WEIGHTING but choose from a wider slice — e.g. take the top ~8 and sample 4 — so a
  struggling word stays likely without being guaranteed every single sitting. Note `quiz.js` and
  `quiz-core.js` are QZ-18-frozen and md5-pinned by the phase-3/4 gates, so this needs process,
  not a quick edit.
- *(b) the chapter-end quiz is not about the chapter.* Bigger, and a design question for the
  owner: should finishing a story quiz the words from THAT story (the chapter carries a
  `glossary`), or stay a global review? Today it is global, and nothing in the record says that
  was deliberate.

**Not a regression from the trophies run** — this behaviour predates it entirely; nothing in
phases 1-4 touched quiz selection. Recorded here rather than hot-fixed.

---

## R4 — let her SUBMIT her answers without generating a new story — LIKELY DEFECT (data loss)
**Raised:** 2026-08-01, via the owner. **Status:** recorded, NOT yet verified in code.

**Her words, relayed:** at the end of a story she answers the questions, but if she does not
generate a new story the answers are not saved — and she is asked the same questions again.
Generating a new story takes time, so she often does not want to do it.

**Two separate things, and they must not be confused:**
- **(a) the save.** If answering and leaving really loses her answers, that is a DEFECT, not a
  feature request — she did work and the app threw it away. **Must be verified against the code
  before it is designed**; `reader.js` already posts `action: "log-check"` on a first answer, so
  either the claim is about something else (the *done* state? the celebration? the trophy count?)
  or there is a path where the post does not happen. Find out which before promising anything.
- **(b) the coupling.** "Submit my answers" and "make me a new story" are currently the same
  button. They should be two things. She should be able to finish, submit, and stop.

**Her own design idea, which is a good one:** if she has submitted, generate the next story **in
the background** — while the app is closed or she is in another window — so she never waits for it.

**Open questions:** what does she see when the background generation has not finished yet? What if
it fails? Does a background job survive the app being closed on a phone (a service worker can, a
page cannot — this is the hard part and it must not be hand-waved)?

---

## R5 — quizzes where she WRITES the word, not only recognises it
**Raised:** 2026-08-01, via the owner. **Status:** recorded, needs design.

**What she asked for, concretely:**
1. **Typing questions.** She wants to have to write the word, not only pick it.
2. **Turn off the keyboard's autocomplete/autocorrect** for those fields — "like a password" — or
   the phone writes the answer for her and she learns nothing. (This is `autocomplete`,
   `autocorrect`, `autocapitalize`, `spellcheck` on the input.)
3. **Hebrew → English direction.** Show the Hebrew, she picks the English one **or hears it**, and
   then she has to write it. Her stated reason: this teaches the word AND reading comprehension.
4. **Listening to words all the time gets annoying** — so audio should be one option among
   several, not the only way a question is asked.
5. **Later: writing sentences.** Recorded, not scheduled.

---

## R6 — take the best ideas from Duolingo and similar apps, cheapest first
**Raised:** 2026-08-01, by the owner. **Status:** recorded; a discovery pass is the right first step.

Explicitly: **start from the lowest-hanging fruit.** Do not rebuild Duolingo. Find the small number
of mechanics that carry most of the teaching value and fit what this app already has.

---

## R7 — do NOT try to cover every word; degrade honestly and fill in later
**Raised:** 2026-08-01, by the owner. **Status:** recorded — **this AMENDS the word-finish design.**

The rule he wants:
- **Translation:** if she adds a word we do not have, translate it **in real time**. He is right
  that this is the easy case — `/api/translate` already exists and the reader already calls it.
- **Audio:** do not silently hide it. Show a short honest line — *"coming soon"* / *"not yet
  available"* — so she knows the word exists and the sound does not, yet.
- **Then fill it in asynchronously**, out of her way.

**This changes what word-finish just shipped.** `canSay` currently makes the speaker button
**absent** when there is no clip. He is asking for **visible but honest** instead of invisible.
That is a better answer than either the dead button or the missing one, and it is a small change.
