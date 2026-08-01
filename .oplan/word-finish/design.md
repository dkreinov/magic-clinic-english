# Design — word-finish

STATUS: decided by the orchestrator 2026-08-01, from the owner's instruction *"lets drill to solve
all issues"* plus his standing rule *"always think easy and robust"*. This is the WHAT. The planner
turns it into steps. Everything here was measured today unless marked otherwise.

## 1. What is left, and where it came from

Five items. Four are on record; the fifth was found today while deleting the backups.

| id | what | source | kind |
|---|---|---|---|
| **A** | ~17 story words have no recording, and the build script cannot ever make them | word-polish phase 2, STOPPED at `ae349c6` | architecture + coverage |
| **B** | only **1** of her ~40 words has a quiz item, so the chapter-first quiz has nothing of hers to ask | measured during word-polish | coverage |
| **C** | returning from the dictionary reloads the story and she waits | the learner, R2, 2026-07-30 — **a defect, not a request** | defect |
| **D** | a trophy card can read "target reached" while greyed out | owner, word-trophies; recurs whenever the catalogue grows | defect |
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]

D27 is **answered and done**: all 10 profile backups were deleted 2026-08-01, receipt in
`.oplan/word-polish/backup-receipt.txt`. E is the last copy of her data on this machine.

## 2. The decision that shapes the whole run: build-time, not run-time

The owner proposed generating missing audio and quiz items **at run time** and freezing them. It is
feasible — but it is not the easy-and-robust answer, and his standing rule outranks his first idea.

**Why run-time is expensive here, measured:** `public/quiz/<lemma>.json` and `public/audio/words/*.aac`
are static files baked into the deploy. On Vercel the runtime filesystem is **read-only**; the only
writable store is Vercel Blob (`lib/store.js` uses `put()` for the profile). So run-time generation
needs *all* of: a new blob namespace, a fallback path inside `public/quiz.js` — which is **QZ-18
frozen** — a new API route, error handling for a child sitting in front of a spinner, and a cost per
word on every first encounter. That is five new moving parts and a change to a frozen file.

**The build-time route instead:** generate the clips and the items on this machine, commit them,
deploy once. Zero new runtime parts, zero runtime cost, nothing added to a frozen file, and the
result is inspectable before it ever reaches her.

**The honest cost of choosing build-time:** words she saves *after* a top-up are not covered until
the next one. We accept that and pay for it with **one documented command** the owner can run when
he wants (the repo already has `scripts/quiz-topup.mjs`, which lists exactly what is missing and
writes nothing). Run-time generation stays available as a later run if the manual top-up ever
becomes a nuisance — nothing here forecloses it.

## 3. The decisions

### A — audio: fix the architecture first, then the coverage
Measured: `scripts/build-word-audio.js:102` calls `deriveWordList()`, which is
`buildAllowedSet(A2 profile, band1, band2)` filtered and sorted (`:40-46`) — **2254 words, derived
purely from the curriculum bands**. `writeManifest()` (`:95`) then **overwrites**
`public/audio/words/index.json` with exactly that list. So a story word outside the bands can never
be in the manifest, and any hand-added entry is destroyed on the next run. That is why phase 2
stopped, and it was the right call.

**Decision — the manifest becomes a statement about what is ON DISK, not about the curriculum.**
Deriving it from the `.aac` files that actually exist makes drift *impossible* rather than merely
unlikely, which is the robust half; it is also less code, which is the easy half. The band
derivation stays as the source of *what to generate*, extended by an explicit extras list for the
words her stories actually use.

**The planner must verify before committing to this** (it is the one real risk): `getAllowedSet()`
is consumed by `public/views/reader.js:394` **and** `public/views/words.js:265`. If either uses the
manifest as a *vocabulary* gate rather than an *audio-existence* gate, redefining it changes
behaviour somewhere nobody is looking. **Check both call sites and say so explicitly.**

**Generation** uses `scripts/build-word-audio.js` **unchanged in model, voice and instructions**
(`gpt-4o-mini-tts`, `nova`) — 2254 existing clips came from that voice and a different engine would
put a stranger's voice in the middle of her story. `deep breath` is excluded: it contains a space
and cannot be a lemma file. **PAID API — already authorised by the owner on 2026-08-01
("Both — honest button + generate the 21 clips"), cost a fraction of a cent. He must hear a sample
before the batch is accepted.**

### B — quiz items for the words she actually has
Format is fixed and simple (`public/quiz/<lemma>.json`, an array of
`{lemma, sense, sentence-with-`___`, answer, distractors[≥5]}`); `isUsableItem` in the frozen
`public/quiz-core.js` validates the **shape**. 62 files / 84 items exist today.

**The risk no existing check covers, and the reason this needs care:** `isUsableItem` cannot tell
whether a distractor is *also a correct answer*. If a generated item offers `glow` as a wrong option
for `shine`, she is marked wrong for a right answer. **A shape check is not a correctness check.**
So this item needs its own validation pass, and that pass is part of the work, not an afterthought.

Generation follows the existing house style (`scripts/build-item-bank.js` uses `gpt-4.1-mini` via
the OpenAI chat API). **PAID API — the owner must approve the batch and see samples before any item
reaches her.** No change to `public/quiz.js` or `public/quiz-core.js`.

### C — coming back from the dictionary must not reload the story
`public/views/reader.js:370` `render()` rebuilds `container.innerHTML` from scratch and `boot()`
(`:391`) re-fetches `/api/profile` (`:395`) on every entry, so leaving `/reader` and returning costs
a full network round-trip and a rebuild. She is right that this is a defect.

**Decision:** keep the app honest about state — do **not** simply cache the profile. Re-fetch, but
do not throw the rendered chapter away when nothing that affects it has changed. The planner
decides the exact invalidation signal and **must state what happens when the signal is wrong**
(stale story on screen is a worse failure than a slow one). Restore her scroll position too: "it
takes time" almost always also means "and I lost my place".

### D — the trophy card cannot contradict itself
Measured: `public/views/trophies.js:100-114` computes each card's number **live** from the profile
(`metric: (p) => …`), while the ring/earned state is read from **stored** `profile.trophies`. Two
sources for one card, so they can disagree — and they did, showing "target reached" on a greyed
card. It self-clears when she next acts, and returns whenever a new trophy is added.

**Decision:** one source of truth per card. The card's displayed state must be derived so that
"greyed" and "target reached" are **not simultaneously representable** — not patched so that the
current case happens to look right. A test must pin that the impossible combination cannot render.

### E — her vocabulary must not live in the sandbox
Replace `english-app-sandbox/profile.json` with a synthetic fixture (the comparator's own
`make-fixtures.js` already builds synthetic profiles — `cat`, `dog`). Her real words leave the
sandbox. Small, but it is the standing rule of this project and it is currently violated.

## 4. Phases

1. **The two pure-code defects (C and D) plus E.** No API, no money, fully testable offline.
2. **Audio (A).** Architecture first, then generate, then the owner listens.
3. **Quiz items (B).** Generator, then generate, then the correctness pass, then the owner reads samples.
4. **Ship.** One deploy, `magic-vet-v20` → **`v21`**, the proven ritual.

## 5. Non-goals
No change to `public/quiz.js` or `public/quiz-core.js` (QZ-18 frozen). No run-time generation of
anything. No new voice or TTS engine. No re-recording of existing clips. No change to the awarding
engine, the celebration, or the placement flow. No new Hebrew string without the owner's sign-off.
No deploy until every gate and both owner gates (audio sample, item samples) have passed.

## 6. Risks
- **A's manifest redefinition is the one that can break something silently** — two call sites
  consume it and only one is about audio.
- **B can mark her wrong for a right answer** if a distractor is secretly valid. Shape checks
  cannot see this.
- **C can show her a stale story**, which is worse than the slow reload it replaces.
- **The backups are gone** (D27). The safety net regenerates: phase 4 takes a fresh capture before
  the deploy, exactly as the last two deploys did. Until then there is no copy of her profile.

---

## 7. AMENDMENT #1 — the owner's R7 rule, 2026-08-01 (after phases were drafted)

> "we should not support all possible words. if she add a word to her dictionary and we dont have
> it yet, we will write translation, this is easy in real time. but writing sound coming soon (or
> some other short line) like not yet available. and in asynchronic way we will add it."

This is a **better answer than the one this project shipped today**, and it supersedes it.

**What changes.** `word-polish` made the speaker button **absent** when no clip exists — honest,
but silent: she cannot tell the difference between "this word has no sound" and "this app has no
sound". R7 asks for **visible and honest**: the word is there, the sound is *not yet*.

- **Audio missing → a short line, not an absence.** Needs a Hebrew string. **OWNER GATE: he must
  supply or approve the wording — no new Hebrew is ever invented in this project.**
- **Translation missing → translate in real time.** He is right that this is the easy case.
  `/api/translate` already exists and `reader.js` already calls it when the glossary has no Hebrew.
  **The planner must verify whether this already fully works** before anything is built for it —
  it may already be done, and the cheapest feature is the one already shipped.
- **Then fill the audio in asynchronously** — which is exactly the build-time top-up of §2, so
  R7 and §2 agree rather than conflict. R7 supplies the missing half: what she sees *meanwhile*.

**Consequence for the run:** phase 2 grows this UI change. It does NOT become a run-time feature —
"asynchronous" here means "the owner runs the top-up later", not "the app generates while she waits".

**Also recorded, not scheduled here:** R4 (submit answers without generating a new story; likely a
data-loss defect; background generation) and R5/R6 (typing quizzes with the keyboard's autocomplete
off, Hebrew→English direction, and a ranked shortlist of Duolingo-style mechanics). Both are under
discovery now. Neither is folded into phases 1-4 — see the merge assessment in `journal.md`.
