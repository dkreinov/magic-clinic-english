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

D27 is answered: the owner said delete. **CORRECTED 2026-08-01 — the first deletion was INCOMPLETE
and the orchestrator's claim that E was "the last copy" was FALSE.** The first sweep looked only in
`english-app-backups`, `polish-deploy` and `trophies-deploy` and deleted 10 files. A fresh planner
found four more; a machine-wide sweep then found a fifth. All five are now deleted too:
`g1-scratch/sandbox-profile.bak`, `g1-scratch/sandbox-profile-p2.bak`,
`g1-deploy/live-readback.json`, `g1-deploy2/live-readback.json`,
`trophies-val/sandbox/profile.backup.json` — the two `live-readback.json` files held **20 words and
2 chapters read from the live service**, more of her data than anything in the original receipt.
Receipts for all 15 are in `.oplan/word-polish/backup-receipt.txt`.

**E IS TWO FILES, NOT ONE** (this is a scope change to step 1.1): `english-app-sandbox/profile.json`
(12 words) and `trophies-val/sandbox/profile.json` (15 words). Both are dev fixtures rather than
backups, so both are replaced with synthetic data rather than deleted. After 1.1 there is no copy
of her data on this machine.

**LESSON, recorded because it is the shape of the mistake:** a deletion scoped to the directories I
happened to remember is not a deletion. The only trustworthy form is a sweep that asks every file
"are you a profile?" — which is what found the last five.

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
Measured — **CORRECTED 2026-08-01, the original line numbers in this design were WRONG.**
`trophies.js:100-114` is the catalogue literal, which is pinned by a `deepStrictEqual` test; an
executor sent there would break a pin and fix nothing. **The real seam is `cardHtml:163-167`**,
where the card's number is computed **live** from the profile while the ring/earned state is read
from **stored** `profile.trophies`. Two
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

---

## 8. AMENDMENT #2 — the "no recording yet" marker, FROZEN by the owner 2026-08-02

The owner chose **option A** from a live visual comparison, and ruled: **the label is English —
"coming soon" — with no Hebrew translation.** (His words: *"just say comming soon no need to
translate to hebrew"*, and for the icon *"the sign not exist you know the circle with line
crossing"*.)

**FROZEN, quoted not named. Nothing here may be re-invented by an executor:**

- The button still renders when a word resolves to a lemma but has **no clip**. It is
  **not pressable** and carries the class `btn-say na` in addition to `btn-say`.
- The glyph stays the existing speaker `&#128266;` (🔊). The "does not exist" mark is drawn as a
  **diagonal line across the circle** by CSS, not by swapping in a different emoji — so it inherits
  the button's real size and border and cannot drift from `.btn-say`.
- The caption is the ASCII string **`coming soon`**, lower-case, English, directly under the button.
- Exact rules, as shown to and approved by the owner:

```css
.btn-say.na {
  opacity: 0.55;
  cursor: default;
  position: relative;
}
.btn-say.na::after {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: linear-gradient(to bottom right,
    transparent calc(50% - 1.5px),
    var(--color-muted) calc(50% - 1.5px),
    var(--color-muted) calc(50% + 1.5px),
    transparent calc(50% + 1.5px));
}
```
```css
.btn-say-soon { font-size: 0.8rem; color: var(--color-muted); margin-top: 7px; letter-spacing: 0.02em; }
```

**Why A and not the bare 🚫 he first described:** shown all three side by side, the prohibition sign
reads to a child as *"you are not allowed"*, and a muted speaker reads as *"you switched it off"*.
The crossed-out speaker reads as *"sound, not yet"* — which is the true statement. The owner agreed.

**Consequences the planner must carry:**
- `canSay` currently gates the button's EXISTENCE. It must now gate its **state** instead: the
  button renders either way; only `na` differs. The honesty property word-polish proved must
  survive — a pressable button still implies a clip exists.
- The Hebrew and the save line must not move. Verified in the mock: nothing else on the popup shifts.
- `.btn-say.na` is non-interactive, so it is **not** subject to the 3:1 contrast gate for controls;
  the `coming soon` caption IS text and must pass `scripts/check-contrast.mjs` against
  `--color-card`. **The planner must add that pair to the contrast script, or state why not.**
- This lands in **phase 2**, with the audio work, because it is the same surface.

---

## 9. RISK A RESOLVED (orchestrator, 2026-08-02) — the manifest has no second meaning

§3 A flagged the one real risk in phase 2: `getAllowedSet()` has TWO consumers and redefining the
manifest to mean "what is on disk" would be dangerous if either treated it as a *vocabulary* gate.
**Measured today. It does not. Both consumers use it for audio existence only:**

- `public/views/words.js:159` — `const sayLemma = allowedWords ? resolveLemma(lemma, allowedWords) : lemma;`
  The variable is literally named `sayLemma`, and it feeds the play button. When `allowedWords` is
  null it falls back to the raw lemma, so a missing manifest degrades the BUTTON, never the list.
- `public/views/reader.js:803` — `const lemma = resolveLemma(dataWord, allowedWords);` which feeds
  `canSay`. Nothing else in either file reads `allowedWords`.
- `public/words-index.js` already documents the intended failure mode in its own header: on any
  error it returns an EMPTY set, "the views simply do not render a play button. A dictionary that
  loads without audio beats one that does not load."

**Therefore the phase-2 decision stands and is safe:** the manifest becomes a statement about which
`.aac` files exist. Nothing gates her vocabulary on it, so no word can disappear from her list, her
story or her quiz because of a manifest change. The only thing a manifest change can alter is
whether a speaker button is live — which, after design §8, is exactly the state `btn-say na` exists
to express.

**One consequence for phase 2's planner, so it is not rediscovered:** because `getAllowedSet()`
swallows every failure into an empty Set, a manifest that 404s is INDISTINGUISHABLE at runtime from
a manifest that legitimately lists nothing. Phase 4's proof already probes the manifest URL directly
(word-polish step 3.5 added it, and it was the first deploy in this project's history to do so).
That probe must stay.
