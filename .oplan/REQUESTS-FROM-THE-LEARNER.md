# Requests from the learner (the child who uses the app)

Her own words, relayed by the owner. Captured verbatim in meaning, dated, NOT yet designed and
NOT yet scheduled. Each becomes a design decision in some future run — the point of this file is
that nothing she asked for gets lost between runs.

These are FEATURE REQUESTS, not defects, unless marked otherwise.

---

## R1 — tapping a word in the story should READ IT ALOUD, not only offer "add to my words"
**Raised:** 2026-07-30 (during the word-trophies run, phase 3).
**Status: SHIPPED and LIVE** (verified against the code 2026-08-03, not recalled).
Taken by the **word-finish** run, phase 2. `saySlot()` (`public/views/reader.js:423`) puts a speaker
button in the word popup, and the words screen has the same. Both open questions below were
answered in the shipping design: the tap shows a **button**, not auto-play; and a word with no clip
shows the button **crossed out with `coming soon`** rather than hidden (that is FC-5, owner-frozen —
see also R7, which is the rule this came from).

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
**Status: SHIPPED and LIVE** (verified against the code 2026-08-03, not recalled).
Taken by the **word-finish** run, phase 1, step 1.4 — commit `870e9c7`.
Both open questions below were answered: the invalidation signal is a **profile signature**
(`profileSignature(fresh)`; unchanged signature → early return, no rebuild), and **scroll position
IS restored** (`restoreScroll()`, on re-entry only, one passive listener). She was right that
"it takes time" also meant "and I lost my place".

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
- **A STATUS LINE IN THIS FILE IS ONLY EVER WRITTEN FROM MEASUREMENT, NEVER FROM MEMORY.** This
  file is an INPUT to future planning, so a stale status propagates into a brief and from there
  into built code — which is this project's named failure mode (field guide 24). On 2026-08-03 a
  tidy-up found R1, R2 and R7 still marked unbuilt when they had shipped days earlier, and R3
  summarised as "fixed" when only half of it was. Each status above now names the file and line,
  or the commit, that was actually read.

---

## R3 — "at the end of each chapter I get the same exact questions" — CONFIRMED DEFECT
**Raised:** 2026-07-31, via the owner.
**Status (re-measured 2026-08-03, and the earlier one-word summary "fixed" was TOO STRONG):
(b) FIXED AND LIVE · (a) FIXED IN EFFECT, ROOT CAUSE UNTOUCHED.**

- **(b) the chapter-end quiz is now about the chapter.** `chapterQuizLemmas()`
  (`public/views/reader.js:494`) puts the chapter's **own glossary words first**, shuffled with
  `rand`, and only then the global pool — with words already asked this sitting pushed to the
  **back**. Wired in at `quizLemmasFor(chapter)` (`reader.js:627`). A separate word-finish change
  gave her own words quiz items at all; before it, every chapter fell through to the same four
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
- **(a) selection is still first-N of a fixed order underneath.** `public/quiz.js` and
  `public/quiz-core.js` are **still byte-frozen at the exact md5s this entry named**
  (`69b6d711…` / `9a2131be…`, re-checked today), so `pickQuizWords` is unchanged and still fully
  deterministic. The strike-first pinning described below is therefore **still real** — it is just
  no longer reachable *first* on a chapter whose glossary words she already knows. On a chapter
  where it has nothing to put first, the old behaviour returns.
- **Still open, and this is the honest remainder:** sample from a wider slice inside
  `pickQuizWords` itself. That needs process, not a quick edit — the two files are QZ-18 frozen
  and md5-pinned by the phase gates.

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
**Raised:** 2026-08-01, by the owner.
**Status (verified against the code 2026-08-03): TWO OF THREE SHIPPED.**
- **Translation in real time — SHIPPED.** `reader.js:973` posts to `/api/translate` for a word we
  do not hold.
- **Honest audio degradation — SHIPPED**, and it became owner-frozen contract **FC-5**: the speaker
  button is *visible but crossed out* with an English `coming soon` caption. This is exactly the
  amendment demanded below, and it replaced the `canSay`-makes-it-absent behaviour.
- **Filling it in asynchronously — NOT SHIPPED.** Top-up is still a **manual** run of
  `scripts/build-word-audio.js` / `scripts/quiz-topup.mjs` by a human at a terminal. Nothing fills
  a gap on its own, so "coming soon" stays true only as long as someone remembers to run it.
  **This is the live remainder of R7.**

The rule he wants:
- **Translation:** if she adds a word we do not have, translate it **in real time**. He is right
  that this is the easy case — `/api/translate` already exists and the reader already calls it.
- **Audio:** do not silently hide it. Show a short honest line — *"coming soon"* / *"not yet
  available"* — so she knows the word exists and the sound does not, yet.
- **Then fill it in asynchronously**, out of her way.

**This changes what word-finish just shipped.** `canSay` currently makes the speaker button
**absent** when there is no clip. He is asking for **visible but honest** instead of invisible.
That is a better answer than either the dead button or the missing one, and it is a small change.

---

## R8 — background music behind the story
**Raised:** 2026-08-02 evening, by the owner.
**Status: SHIPPED AND LIVE 2026-08-03** — commit `3b6bf24`, `magic-vet-v24`,
`dpl_AMd2BqqD3UeYVrBrbqfnXCg31LWd`. Every changed file verified md5-identical live vs the
tested tree. The record below is kept as written because it is the reasoning, not the status.

**What she gets:** a 3:04 instrumental bed, **default OFF**, with a control in the app shell
reachable from *every* screen, that **ducks to near-silence under every spoken word**.

**DELIVERY, owner-chosen:** stream the first time, then keep it. `prime()` adopts a copy already
on her phone and never downloads; `fill()` runs only after she switches music on. `sw.js` spares
`MUSIC_CACHE` in the activate sweep so the track outlives version bumps. Precaching was rejected:
4 MB on *every* deploy for a feature that is default OFF.

**THE DEFECT THIS NEARLY SHIPPED, kept as the lesson:** `music.js` was imported by `reader.js`
and `words.js` — both precached — while not being precached itself. **Offline, that import fails
and the whole reader dies**: a music file taking down the story, the one thing this module's
property 1 forbids. **414 passing tests did not see it.** There is now a seam test for the general
property — every module a precached file imports must itself be precached.

**AND THE MUTATION HARNESS LIED ONCE.** A control reported "0 failures", which reads exactly like
a test that cannot fail. It was a no-op: the file is CRLF and the patch used `\n`. **Every mutation
must now assert that it actually applied.** Sibling to field guide 16 (grep cannot measure line
endings).

**ORIGINAL RECORD, from when this was half-built:**

**His words:** "see if we can add some music. you can generate it in gemini or suno".

**The objection he was told and overruled, recorded so it is not re-litigated:** she learns by
tapping words to hear them, and every existing sound in this app is speech. Music under that
competes with the one thing she is trying to hear. **He chose music behind the story knowing this**,
so the engineering answer is ducking rather than refusal.

**What is BUILT (commit `c716b3a`, 9 tests, 3 mutation controls):** `public/music.js` — default
**OFF**, her choice persists in `localStorage`, and the bed **ducks 14% → 2% under every word clip**,
reference-counted so two overlapping taps cannot un-duck early. Every failure path is a silent
no-op: a missing or broken track can never break the story.

**What is NOT built, and it is most of what she would notice:**
1. **No track file.** `public/audio/music/story-loop.mp3` does not exist.
2. **`music.js` is imported by NOTHING.** No view calls `start()`, and nothing calls `setMuted()`.
3. **No mute control on screen** — the module exports one, the UI has no button.
4. Not precached, not deployed. **She currently sees and hears no difference at all.**

**The blocker, and how it was solved:** the first attempt drove the *Playwright* browser, which is
a blank profile signed out of Suno, Google and ChatGPT. Credentials were not touched. On
2026-08-03 the **claude-in-chrome extension** was used instead — it attaches to the real signed-in
Chrome — and Suno generation ran with no login and no credential handling. **That is the route to
use for any future web-service generation** (see also the ChatGPT-images precedent).

**Standing constraint on the track itself:** INSTRUMENTAL ONLY. A vocal track would put English
lyrics under a child reading English, which works directly against the app's purpose.

---

## PRIVACY INCIDENT — 2026-08-03, the push that nearly published her vocabulary

**Found when the owner said "lets push."** The GitHub repo `dkreinov/magic-clinic-english` is
**PUBLIC** (unauthenticated API returns 200), and 332 unpushed commits contained her word list.
Pushing would have published an eleven-year-old's vocabulary and her per-word quiz scores.

**What was actually leaked, measured rather than assumed:**
- `.oplan/word-quiz/topup-1-words.txt` — the file **is** her 12-word list. Named as a surviving
  leak by this project's own ruling **R-F3-5** and never acted on.
- `.oplan/word-g1/plan.md`, `.oplan/word-quiz/journal.md`, `.oplan/word-polish/plan.md` — lines
  naming her words as hers.
- `.oplan/word-quiz/night/parent-view-DESIGN.md` — **her per-word scores** (hardest/easiest, 0/3,
  2/2). Worse than the words alone.

**THE TRAP THAT MAKES THE OBVIOUS FIX WRONG.** All 12 of her words are ordinary English that also
exist as *shipped content* — every one has an audio clip and a quiz item. A word-level
`--replace-text` purge would have corrupted the app's own data everywhere and still not fixed the
real problem. **The leak is not the words; it is documents asserting these are HERS.** The purge
was therefore scoped to 35 exact offending LINES plus one whole file.

**A DISCRIMINATOR'S BLIND SPOT, recorded because it nearly hid the worst file.** "Does a line hold
3+ of her words?" reports `topup-1-words.txt` as CLEAN — it is one word per line, so no line ever
clusters. A bare list defeats a cluster test. Both shapes must be checked.

**What was NOT leaked:** the already-public `.oplan` files (`placement-fix-and-art/plan.md`,
`first-build/journal.md`) matched many of her words but only SCATTERED, never clustered — ordinary
bank discussion. Nothing of hers was public before this, and `.env` was never committed.

**The fix:** `git filter-repo` over `origin/master..HEAD` only. Because every leak was unpushed,
already-public history was untouched and the push stayed a **clean fast-forward — no force-push**.
Verified after rewriting: 0 clustered lines, 0 list-shaped files, and the leak file 404s on
`raw.githubusercontent.com`. Every staged copy of her vocabulary was deleted with a receipt.

**THE STANDING RULE THIS EARNS: `.oplan` IS PUBLISHED. Treat every word written there as public.**
D27 covered profile *files* and never covered the *record* — that gap has now produced two
incidents (design.md on 2026-08-02, this one). Counts only, always.

**THE CONTROL THAT NOW ENFORCES THIS (added 2026-08-03, same day).** `scripts/hooks/pre-push`
calls `scripts/check-record-privacy.mjs` over the exact range being published
(`<remote>..<local>`), because the incident lived in COMMITTED BLOBS while the working tree was
already clean — a checker reading files on disk would have waved it through. Installed with
`git config core.hooksPath scripts/hooks`, so it is version-controlled rather than living in
`.git/hooks` where it would quietly disappear.

**WHAT IT CANNOT DO, so nobody trusts it too far:** it does NOT know her words. It cannot — D27
requires the captured profile to be DELETED, and the only local profile is the SYNTHETIC 6-word
fixture (md5 `91eff5da…`). Matching against that fixture was tried and produced pure false
positives, flagging generated story prose, because her words are common English that also ship as
clips and quiz items. So it matches the SHAPE OF A DISCLOSURE: a sentence claiming words are hers
*and listing them*, a bare word list added to the record, a per-word score table. **A tripwire,
not a proof.** `LEARNER_PROFILE=<real capture>` adds an exact-word pass when one is available.

**GATED LIKE THE REST:** 5 poison controls modelled on the real leaked lines (invented words —
this file is published), 4 false-positive controls including **the whole real record**, and an
install check. The first version was rewritten after it flagged a legitimate 37-word exclusions
list and seven planning docs: *a hook that cries wolf gets switched off, and then it protects
nothing.* Proved by EXECUTION, not by reading: a planted list was committed and a real
`git push` was **refused**, exit 1.
