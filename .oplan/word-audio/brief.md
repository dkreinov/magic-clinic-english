# Brief — word learning, audio, and confidence (raw feedback, unprocessed)

Captured 2026-07-26, verbatim in substance from the owner, relaying Mika's feedback which he agrees
with. Written down immediately because it arrived in conversation and would otherwise be lost.
NOT YET A PLAN. Nothing here is decided.

## The five asks

**W1 — say the word out loud when she taps it.** Today tapping a word in the story adds it to her
dictionary and shows the Hebrew. But **she cannot read the English word she just collected.** So the
word needs to be spoken, the way the placement exam speaks its six words.

**W2 — use a good voice, not a robot.** Owner asked what we currently use and pointed at
`C:\Users\dkreinov\claude\GCXTiler` (the 3Blue1Brown-style movie pipeline) as a project where a TTS
was already chosen, to reuse that choice.

**W3 — let her listen to the whole story.** If audio exists for words, a play button for the chapter
is the obvious next step. Owner's stated order: she reads it first, then she can have it read to her.

**W4 — an example sentence for each new word**, so a word is never learned bare.

**W5 — she must be able to say "I know this word", and then be TESTED on it.** The words view already
distinguishes words she knows from words she is learning. She needs a way to promote a word herself.
And once she claims a word, a re-exam — "interesting, similar to Duolingo or better, with images,
sounds or whatever" — should check whether she really learned it, so she *feels* confident about what
she knows.

## What I found before proposing anything (facts, not decisions)

- **This project ALREADY has a good TTS pipeline.** `scripts/build-tts.js` calls OpenAI
  `gpt-4o-mini-tts`, voice `nova`, with the instruction "Speak slowly and clearly, like a warm,
  friendly teacher pronouncing one English word for a young learner." It generated the six existing
  `public/audio/word-*.mp3` clips. That is not a robot voice — it is the answer to W2, and it is
  already in this repo, consistent with what she hears in the exam.
- **GCXTiler uses Chatterbox TTS (Resemble AI)** — `reports/anim/audio/gen_narration_chatterbox.py`.
  Free and high quality, but it needs a GPU box (epgg112 / Zorro), a ~6 GB torch+CUDA install, and
  runs ~30 s per narration line. Good for a handful of long movie lines; a poor fit for thousands of
  single words, and it cannot run on the phone or in Vercel.
- **W5 IS HALF-BUILT ALREADY.** `api/profile.js:51` implements a `mark-known` action and **nothing in
  `public/` ever calls it** — the dead code found while writing `docs/growth.md`. The "I know this
  word" button is wiring an endpoint that already exists, not new backend work.
- **W4 may need no LLM at all.** She taps the word *inside a chapter*, so the sentence she tapped it
  in is a free, perfectly contextual example. Better than a generic dictionary sentence, and it costs
  nothing to capture.
- **W1 collides with a real constraint.** The A2 allowed set is 2254 matchable words. Pre-generating
  audio for all of them is a one-time batch, but it is thousands of files in `public/`, and
  `docs/visual-design.md` §8 freezes `PRECACHE`, so they would be fetched on demand (fine) but never
  available offline.

## Why this reshapes `docs/growth.md` instead of starting fresh

`docs/growth.md` is written and carries `STATUS: AWAITING-OWNER-SIGN-OFF` — it is NOT signed, so it
is still open. This feedback belongs in it, and it exposes a hole I missed:

- **growth.md says nothing about audio at all.** Yet W1 is not a feature request, it is a defect in
  the core loop: the app invites her to collect English words she has no way to pronounce. That is
  more fundamental than anything G1/G2/G3 propose.
- **growth.md's G1 proposed AUTOMATIC promotion** (meet a word twice more without tapping it ->
  `known`). W5 asks for MANUAL promotion plus a test. These are complements, not rivals: her claim is
  a strong signal, the quiz verifies it, and G1 catches the words she never claims.
- **growth.md §7 already ordered spaced-repetition review as item 2.** W5 is that item, arriving from
  the actual users, which is the best possible confirmation of the ordering.

So: do not sign growth.md as it stands. Amend it with W1-W5 first.
