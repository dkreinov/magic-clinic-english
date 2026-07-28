# Growth Design: how the app grows with her — AMENDED

STATUS: SIGNED 2026-07-28 by the owner (section 12). Copied verbatim from the signed source .oplan/word-quiz/night/growth-amended-DRAFT.md (from its line 9 on) by the word-g1 run.

## What changed from the unsigned version and why (read this first)

1. W1-W5 from `.oplan/word-learning-brief.md` shipped after the old version was written; that version describes a world without them.
2. W1 (tap to hear) is LIVE: 2254 word clips, a speaker button in the reading popup and on every card in המילים שלי.
3. W2 (a good voice) was answered by reusing this repo's own TTS — OpenAI `gpt-4o-mini-tts`, voice `nova`. Measured cost $0.80.
4. W4 (an example sentence) shipped for free: the sentence she tapped the word inside is stored as that word's example. No LLM.
5. W5a (the claim button) shipped: the `mark-known` endpoint the old §2 called dead code now has a caller.
6. W5b (the quiz) shipped AND DEPLOYED on 2026-07-27: cloze items, six options, a hidden hint, strikes, and real demotion.
7. W3 (read the whole story aloud) is the one ask still unbuilt. It is placed in the order in section 9.
8. Therefore the old §4 sentence "Promotion is one-way; nothing in this design ever demotes a word" is FALSE in the shipped code.
9. G1 is re-derived (section 5). It no longer writes `known`. It writes `candidate` — a status the story generator ignores.
10. A candidate becomes `known` only by passing a quiz item; a candidate that fails goes back to `learning`.
11. That split is D13's asymmetric trust: her own claim is trusted immediately, the app's guess must be verified first.
12. Section 8 answers, as PROPOSALS you can accept or override one by one, the seven blockers a fresh planner raised (B1-B7).
13. Three new measured facts are folded into section 2, the sharpest being that off-list glossed words have no clip and no quiz item.
14. G2 (the band moves) is unchanged in substance, but section 6 now names two ways W1 and W5b make its inputs noisier than they were.
15. What is still unvalidated is still said plainly: `KNOWN_AFTER_QUIET_CHAPTERS = 2` and all seven G2 constants have no data behind them.

## 1. What this document is

This is a proposal, not a change. You are the person who reads it. Nothing in sections 5, 6, 7 or
8 has run yet, and nothing in them changes the live app.

The document does five things. It states, with file and line citations, what the growth engine
actually does today (section 2). It records what W1-W5 shipped, since the previous version of this
document predates them (section 3). It names what still contradicts `design.md` now that the quiz
has closed part of the gap (section 4). It freezes three rules — G1, G2, G3 — re-derived against a
world that now has demotion and a quiz (sections 5 through 7). And it proposes answers to the seven
open blockers that stand between this document and a buildable phase (section 8).

Your signature on section 12 authorizes the next run to build sections 5 and 8, in the order given
in section 9. If you do not sign, the app keeps running exactly as it runs today: her claims and the
quiz work, the placement test sets a band once, and the band never moves again.

## 2. What the code does today

Facts measured directly in this repository, each with the file and line where it was checked.
Everything in this section was re-checked against the current worktree, after the word-audio and
word-quiz runs; the line numbers in the previous version of this document were stale.

**The band**

- The vocabulary band is still written in exactly one place: `api/placement.js:54`, on
  `POST /api/placement` with `{action: "submit"}`. Nothing else in `api/` or `lib/` ever assigns
  `skills.receptiveVocab.band`. Once the placement test sets it, it never moves again.

- `buildAllowedSet` (`lib/story.js:23`) reads that band at `lib/story.js:30`. `A1` and `A2` unlock
  all of `data/band1.json`; only `A2` also unlocks `data/band2.json` (`lib/story.js:39`).

- Allowed-set sizes, re-derived by calling `buildAllowedSet` with the real band files:
  `preA1` = 296, `A1` = 1257, `A2` = 2850 entries.

- Of the 2850 entries at A2, only 2254 can ever match a word in a chapter. `tokenize`
  (`lib/vocab.js:4`) emits only `[a-z]+(?:'[a-z]+)?`, so 596 entries — phrases with spaces,
  hyphenated forms, slashed pairs, accented letters — can never match. The usable vocabulary at A2
  is 2254 words, not 2850. Stated once, here.

- The whole band still rests on 12 placement items, scored by `bandForScore`
  (`lib/placement.js:41-44`): under 0.5 → `preA1`, under 0.8 → `A1`, else `A2`. The gap between
  the A1 ceiling (1257) and the A2 ceiling (2850) is 1593 words, decided by one or two answers.

- `lib/profile.js:11` restricts a skill's `state` to `unknown` or `estimated`; `lib/profile.js:12`
  restricts `band` to `preA1`, `A1`, `A2`; `lib/profile.js:13` restricts a word's `status` to
  `known` or `learning`. `validateProfile` rejects anything outside those sets.

**Words, taps and status**

- A tapped word is still stored with `status: 'learning'` by `applyWordTap` (`lib/profile.js:213`;
  the literal is on line 222), called from `api/profile.js:63`. `knownLemmaSet`
  (`lib/vocab.js:64`) counts only `status === 'known'`. A tapped word therefore still never enters
  the allowed set on its own.

- NEW SINCE THE LAST VERSION: `mark-known` is no longer dead code. `api/profile.js:68` is now
  called by the יודעת את זה button (`public/views/words.js:156`), which renders only when
  `entry.status === "learning"` exactly. `markWordKnown` (`lib/profile.js:386`) sets `known` and
  clears the three strike fields (`lib/profile.js:411-413`).

- NEW: re-tapping a word that is already `known` sets `needsReview = true`
  (`lib/profile.js:239`) rather than doing nothing. This is D11 — a re-tap flags the word for
  priority quizzing and never strikes it.

- Micro-check answers are still logged first-attempt-only (`public/views/reader.js:608-620`) into
  `story.checkLog` via `api/profile.js:104` and `lib/profile.js:370`. **Nothing in the codebase
  still reads `story.checkLog` back out.** This is the one part of the old §3 that is entirely
  unchanged.

- Each chapter still stores its own `coverageRatio` (`lib/story.js:240`) and `generatedAt`.
  Nothing reads either back out. G1 in section 5 is the first reader of `generatedAt`.

**The quiz, which did not exist when this document was first written**

- `applyQuizAnswer` (`lib/profile.js:423`) is the strike machine. A correct answer sets
  `strikes = 0`, clears `needsReview`, drops `lastStrikeSession`, stamps `lastQuizAt` and
  increments `quizRight`. A wrong answer increments `quizWrong`, and strikes at most once per
  `sessionId` (D16). On the third strike the word's status goes `known` → `learning`
  (`lib/profile.js:461`) and `strikes` resets to 0.

- `pickQuizWords` (`public/quiz-core.js:50`) filters on `status === 'known'` EXACTLY, then orders:
  most strikes first, then `needsReview`, then never-quizzed, then longest-since-quizzed, then
  alphabetically. `knownSetFromProfile` (`public/quiz-core.js:11`) tests `status === 'known'`
  exactly too.

- Two counters per word, `quizRight` and `quizWrong` (D24), are recorded from day one and
  **nothing reads them yet**. They exist because quiz history cannot be backfilled.

- The item bank is `public/quiz/*.json`: 62 files, 84 items. It is grown on demand (D23), in
  weekly top-ups derived from the words she has claimed — not built up front.

- The item is gloss + sentence + answer + 8 distractors, presented as sentence-only with the gloss
  behind a רמז button (D28). Pressing the hint is free: no strike, no record.

**Three facts that bear directly on G1 and are new**

- (i) `public/audio/words/` holds 2254 `.aac` clips plus `index.json`, exactly the A2 usable
  allowed set. A word NOT on that manifest gets no speaker button: the reader popup guards on
  `canSay` (`public/views/reader.js:507`) and the word card resolves through the manifest
  (`public/views/words.js:150`).

- (ii) A chapter may carry up to 3 words that are off the band list entirely
  (`lib/story.js:188`, glossed). By (i), those words have no audio clip. By D23, they have no quiz
  item either. **The off-list glossed words are exactly the words G1 exists to capture, and they
  are precisely the words the app cannot currently pronounce or test.** This is not hypothetical:
  it is true today, for the 3 off-list words in every chapter she reads.

- (iii) At the 2026-07-27 deploy her live profile held 20 words, 12 of them `known`. Those 12
  overlapped the 50-word pilot quiz bank by ZERO — the reason the first top-up was made a deploy
  criterion rather than a follow-up.

## 3. What W1-W5 shipped

The brief `.oplan/word-learning-brief.md` closes with "do not sign growth.md as it stands. Amend it
with W1-W5 first." This section is that amendment's factual half.

| Ask | State | What actually landed |
|---|---|---|
| W1 — say the word out loud when she taps it | **SHIPPED** (`.oplan/word-audio/`, deployed) | 2254 pre-generated `.aac` clips, a lemma resolver (`public/lemma.js`) and a manifest, a speaker in the reading popup and on every word card. Phase 3 fixed a real defect Mika found: clips were generated per lemma while the reader played the surface form. |
| W2 — a good voice, not a robot | **SHIPPED with W1** | This repo already had the answer: `scripts/build-tts.js`, OpenAI `gpt-4o-mini-tts`, voice `nova`, the "warm, friendly teacher" instruction. GCXTiler's Chatterbox was priced and set aside — it needs a GPU box and cannot run in Vercel. Approved at ~$0.47, **actual measured cost ~$0.80**. |
| W3 — let her listen to the whole story | **NOT BUILT** | The only ask of the five still open. It needs its own design decision (pre-generated audio per chapter vs. on-device speech synthesis); neither is decided here. Placed in section 9. |
| W4 — an example sentence for each new word | **SHIPPED, free** | She taps the word inside a chapter, so the sentence she tapped it in IS the example. Stored as `entry.context`, capped at 200 characters (`lib/profile.js:230`), shown on the card (`public/views/words.js:145`). No LLM, no new capture surface. |
| W5a — "I know this word" | **SHIPPED 2026-07-26** | The button wires the `mark-known` endpoint that already existed. |
| W5b — and then be TESTED on it | **SHIPPED AND DEPLOYED 2026-07-27** | Cloze items, six options, a speaker on each option, a hidden hint, one strike per sitting, demotion at three. 62 bank files / 84 items, grown weekly. |

Two consequences of W5b that this document must absorb rather than restate:

- **Her claim is an input to content difficulty, not a trophy.** `mark-known` writes `known`,
  `knownLemmaSet` collects it, `buildAllowedSet` feeds it to the generator. A word she claims
  wrongly is then used freely in every future chapter with no glossary entry. The quiz is the
  correction term for that, and it is why demotion had to exist.

- **The quiz is inert for any word with no item.** She can claim a word on Monday that has no item
  until the next weekly top-up. The quiz skips those silently. That is deliberate (D23) — the quiz
  only ever asks about items that passed a mechanical gate and a human review.

## 4. What still contradicts `design.md`

The previous version of this document named two contradictions. One is now half-closed and one is
untouched.

(a) `design.md §3` says continuous calibration is the real engine: the placement test is the prior,
and everything after it updates the profile forever. **Still true that nothing moves the band.**
The placement test is still the entire posterior. G2 in section 6 is still unbuilt.

(b) The design said both signal channels are captured and discarded. **The tap channel is now
half-wired**: a tap still lands in `learning`, which the generator ignores, but she can now promote
a word herself, and the quiz can demote it. What the app still cannot do is notice by itself that
she has learned a word. **The comprehension channel is entirely unchanged**: every micro-check she
answers still lands in `story.checkLog`, and nothing reads it.

So the honest statement of the remaining gap is narrower than it was, and sharper:

> The app now listens to what she SAYS about her vocabulary, and checks it. It still does not watch
> what she DOES — it does not read its own chapter history, and it does not read its own
> comprehension log. G1 is the first reader of the chapter history. G2 is the first reader of the
> check log.

## 5. G1 — words she meets again become CANDIDATES, and the quiz decides

This is the rule that changed most. The old G1 promoted straight to `known`, and closed with
"Promotion is one-way; nothing in this design ever demotes a word back to `learning`." That
sentence is dead: `lib/profile.js:461` demotes.

### 5.1 The rule

`promoteToCandidate(profile)` is a pure function, called from `api/chapter.js` immediately after
`loadProfile()` and before `generateChapter` — the one place where the profile is already in memory
and about to be saved back (`api/chapter.js:34` and `:56`), so no new load or save is required.

THE RULE: a word with `status === 'learning'` is promoted to **`status: 'candidate'`** (keeping its
existing `source`) once it has appeared — matched via `baseForms`, the same matcher
`coverageAgainst` already uses — in at least `KNOWN_AFTER_QUIET_CHAPTERS = 2` chapters whose
`generatedAt` is later than that word's `lastSeen`.

A `candidate` becomes `known` by **passing one quiz item**. A candidate that fails returns to
`learning` (section 8, B2). Nothing else promotes a candidate except her own claim.

### 5.2 The three-status lifecycle

```
                    she taps it
     (not collected) ─────────────► learning ◄───────────────────────────┐
                                       │  ▲                              │
       G1: appeared in 2 chapters      │  │ candidate fails the quiz     │
       generated after its lastSeen,   │  │ (proposal B2: one wrong)     │
       and she never tapped it again   │  │                              │
                                       ▼  │                              │
                                    candidate ─────────────┐             │
                                       │                   │             │
                                       │ passes a quiz     │ she claims  │
                                       ▼                   ▼             │
     she claims it (W5a) ──────────►  known ───────────────────────────► ┘
                                                    3 strikes, on 3 separate sittings
```

Only `known` is in `knownLemmaSet`. **A candidate changes nothing about any generated chapter.**

### 5.3 Why `candidate` and not `known`

This is D12 and D13, and it is the heart of the amendment.

- D12: nothing the algorithm guessed reaches the story generator unverified.
- D13: **asymmetric trust.** Her claims enter the allowed set immediately, policed afterwards by
  strikes. The app's guesses must pass first. A child saying "I know this" is a much stronger
  signal than "she did not tap it a second time."

The asymmetry is also a cost argument. A wrong claim costs three strikes to undo, and in the
meantime her chapters get harder for a reason she cannot see. A wrong candidate costs nothing: it
sits in a status no generator reads until the quiz resolves it. That is why the same evidence
threshold (two quiet chapters) is acceptable here when it was arguably thin before.

### 5.4 Why this signal, re-argued against W1

The old argument was: re-tapping a word is evidence she does NOT know it, so tap count is the wrong
signal; the right signal is meeting the word again, later, without needing to tap it.

W1 weakens that argument and the weakening must be stated. The speaker now lives inside the tap
popup, so some taps are "I want to hear this," not "I don't know this." Two things bound the damage:

- For a word already `known`, a re-tap sets `needsReview` and never strikes (D11) — the listen case
  is already handled where it is most likely to happen.
- For a `learning` word, a listen-tap moves `lastSeen` and therefore **resets the promotion clock**.
  The cost is that promotion is slower, never that a word is promoted wrongly. The error is in the
  safe direction, and this design accepts it rather than adding a second event type.

STATED UNKNOWN: how often she taps a `learning` word purely to hear it is unmeasured. If G1 turns
out to promote almost nothing, this is the first thing to check, and the check is cheap — `taps`
and `lastSeen` are already stored.

### 5.5 What G1 actually changes, honestly

For a word already on her band list, `learning` → `candidate` → `known` changes nothing about the
allowed set: the band already allowed it. What it changes is that המילים שלי stops lying to her,
and that the parent view has something true to show.

The only case where the whole chain changes a generated chapter is an **off-list glossed word**
(section 2, fact (ii)) — and those words have no quiz item today, so a candidate off-list word can
never pass and can never become `known`.

**Therefore B7 in section 8 is not a detail. Until candidates get quiz items, G1 cannot change a
single chapter.** It is still worth building — it makes her word list honest, it feeds the parent
view, and it is the producer that spaced repetition needs — but the claim must not be oversold.

### 5.6 The constant

`KNOWN_AFTER_QUIET_CHAPTERS = 2` is unchanged and **still has no data behind it.** No word has ever
been promoted by this rule, because the rule has never run. It is engineering judgment. What HAS
changed is the cost of being wrong: under the old design a wrong promotion silently corrupted the
allowed set; under this one it costs one quiz question. That is an argument for leaving it at 2 and
watching, not an argument that 2 is correct.

## 6. G2 — the band has to be able to move

`evaluateBand(profile)` runs from the same call site as G1, at most once per chapter generation.
Its two signals are first-attempt accuracy from `story.checkLog`, and the count of distinct newly
tapped words — words whose `firstSeen` falls inside the evaluation window.

The seven constants this design freezes, unchanged from the unsigned version:

```
KNOWN_AFTER_QUIET_CHAPTERS = 2
PROMOTE_WINDOW = 6
PROMOTE_ACCURACY = 0.85
PROMOTE_MAX_NEW_TAPS = 6
DEMOTE_WINDOW = 4
DEMOTE_ACCURACY = 0.50
DEMOTE_MIN_NEW_TAPS = 32
```

PROMOTE one band step (`preA1 → A1 → A2 → A2+`) when ALL three hold: at least `PROMOTE_WINDOW`
chapters since the band was last set; first-attempt accuracy over those chapters at least
`PROMOTE_ACCURACY`; distinct new tapped words at most `PROMOTE_MAX_NEW_TAPS`.

DEMOTE one band step (never below `preA1`) when at least `DEMOTE_WINDOW` chapters have passed AND
EITHER accuracy is below `DEMOTE_ACCURACY` OR distinct new tapped words is at least
`DEMOTE_MIN_NEW_TAPS` (8 per chapter over the window).

Guard rails, all frozen: at most one step per evaluation, in either direction.
`skills.receptiveVocab.sinceChapter` is set to `story.chapters.length` on every write to the band,
including the original placement write at `api/placement.js:54`. Every move appends one entry to
`skills.receptiveVocab.history`: `{from, to, at, reason, window: {chapters, accuracy, newTaps}}`.
`state` stays `'estimated'`, because `lib/profile.js:11` allows no third value.

Two properties argued for, not merely stated:

(i) **Demotion is not optional.** The finding that started this project is that a wrong verdict
about her level is invisible and permanent. A rule that only moves up rebuilds that trap facing the
other way. (The quiz has since proved the general principle at the word level — demotion shipped
there and is working.)

(ii) **The owner always wins.** Retaking the placement test on `#/parent` overwrites the band
unconditionally, and G2's next window starts fresh from whatever you set. Nothing here overrides
that.

Every move G2 makes must be visible on `#/parent`: the current band, when it last moved, and why.

### 6.1 Two ways the shipped features make G2's inputs noisier

Re-derived against W1 and W5b, and neither was true when the constants were chosen:

- **`DEMOTE_MIN_NEW_TAPS` is now measuring two different behaviours.** W1 gave her a reason to tap
  a word she already understands — to hear it. A flood of taps may now mean "the text is a wall of
  unknown words" OR "she is enjoying the speaker." The constant is left at 32 and this is recorded
  as the most likely of the seven to need re-tuning first.

- **Quiz accuracy is deliberately NOT a G2 input.** The counters exist (D24) and the temptation is
  obvious. This design says no, for now, with a reason: the quiz asks only about words SHE claimed,
  and only about the 62 of 2254 words that currently have items. That is a doubly self-selected
  sample. Feeding it into the band would move her reading level for a reason that is not about her
  reading. Revisit when the parent view exists and a month of counters can be looked at. Open
  question (h) in section 11.

State plainly: **these seven constants still have no data behind them.** She has not read a single
chapter under this system. The first month of watching `#/parent` is what calibrates them, and they
must live in one exported constants object so all seven can be re-tuned in a single edit.

## 7. G3 — above A2, when the Band II list runs out

Facts first: `data/` holds `band1.json` (1341) and `band2.json` (2016) and nothing above them. At
`A2` the list is fully consumed. The usable ceiling is 2254 matchable words. And a 12-item
placement test cannot distinguish "exactly at the ceiling" from "far past it". So the placement
scoring function is left alone, and `A2+` is reachable ONLY through G2 promotion.

THE RULE: above `A2`, the app stops growing the LIST and grows two other things.

1. **Her personal vocabulary, through G1** — the only channel with no ceiling, because it is
   anchored to what she reads.

2. **The TEXT, not the vocabulary constraint.** `buildPrompt` (`lib/story.js:178-190`) hardcodes
   "80-140 English words," "Use simple, short sentences," and "AT MOST 3 words that are not on the
   ALLOWED WORD LIST." The `A2+` tier raises the count to 140-200, permits compound sentences, and
   allows up to 5 off-list glossed words. It NEVER lowers `minRatio` (`lib/story.js:127`, 0.95).

Touch points the next run must change, enumerated:

- `lib/profile.js:12` — `SKILL_BANDS` gains `'A2+'`.
- `lib/story.js:31` and `:39` — both `band === 'A2'` tests need an `A2+` case.
- `lib/story.js:178-190` — the difficulty ladder needs an `A2+` tier.
- `public/views/parent.js`, plus the frozen-strings test and the vocabulary-size assertion in
  `tests/parent-ui.test.js` — all need an `A2+` case or they fail the moment a profile reaches it.
- `lib/placement.js:41` — deliberately unchanged. `A2+` is not a placement outcome.
- **NEW, from section 2 fact (ii):** raising off-list words from 3 to 5 per chapter increases the
  number of words she can collect that the app cannot pronounce and cannot test. `A2+` should not
  ship before B7's answer covers off-list words, or it makes an existing hole bigger.

A fourth, larger word list is not present anywhere in this repository. Whether one is obtainable is
open question (b).

## 8. PROPOSALS — the seven blockers

**Everything in this section is a proposal, not a decision.** A fresh planner drafting phase 5 of
the word-quiz run found seven questions that must be answered before that phase can be dispatched
(`.oplan/word-quiz/journal.md`, "PHASE 5 PLANNING"). Each one below gives the options, a
recommendation, and one line of why. Section 12 lets you accept them together or override them
individually.

### B1 — `docs/growth.md` is unsigned (OWNER-ONLY; blocks everything)

- **Options.** (a) Sign the document as it stands. (b) Amend it with W1-W5 first, then sign.
  (c) Leave it unsigned and drop G1.
- **Recommendation: (b) — this draft is that amendment.** The brief already ruled (a) out in
  writing, and (c) throws away the only mechanism that grows her vocabulary past a fixed list.
- **Why.** The old §4 asserted "nothing ever demotes a word", which the shipped code contradicts;
  signing that sentence would have frozen a false statement into the design of record.

### B2 — does one wrong answer demote a candidate, or does it take three strikes?

- **Options.** (a) Same three strikes as a claimed word. (b) **One wrong answer** returns it to
  `learning`. (c) Two strikes, as a middle.
- **Recommendation: (b), one wrong answer.**
- **Why.** Three strikes exists because SHE said she knew the word and being contradicted stings
  (D2); a candidate is the app's own guess, it is not in the allowed set, and withdrawing it costs
  her nothing but a word that keeps being taught.
- **Note for the builder.** `applyQuizAnswer` demotes only inside `if (entry.status === 'known')`
  (`lib/profile.js:461`). The candidate rule is a new branch BEFORE the strike machinery, so the
  frozen `known` rows of QZ-12 are untouched. A candidate's wrong answer still increments
  `quizWrong`, so the D24 counters stay uniform across statuses.

### B3 — where do candidates sort in the quiz ordering?

- **Context.** `pickQuizWords` (`public/quiz-core.js:52`) filters `status === 'known'` exactly, so
  candidates are invisible to the quiz today. That is currently CORRECT per D12 — it just means
  phase 5 needs its own entry point.
- **Options.** (a) Merge candidates into the same pool and let the existing comparator place them
  (they have no strikes and no `lastQuizAt`, so they land in the never-quizzed tier, near the top).
  (b) Candidates always first. (c) Candidates always last. (d) A **fixed quota** — of the 4 words
  in an after-chapter check, at most one is a candidate; the rest come from the existing pool.
- **Recommendation: (d), a quota of one candidate per session, ordered inside its tier by the
  existing comparator.**
- **Why.** The after-chapter check is only 4 words (D17), and two quiet chapters can nominate
  several candidates at once; without a cap, a burst of nominations crowds out the strike-bearing
  `known` words that are actively degrading her stories, which is the quiz's original job. One slot
  per chapter still promotes roughly a word a chapter.
- **Note for the builder.** Do this as a NEW export that selects the candidate slot, not as a
  change to the frozen comparator (QZ-17). The merge happens at the call site.

### B4 — with three statuses, what wins when `migrateWordKeys` merges two entries?

- **Context.** `migrateWordKeys` folds surface forms into lemmas ("feels" into "feel"). Today
  `lib/profile.js:272` reads `if (entry.status === 'known') existing.status = 'known';` — known
  wins, everything else loses.
- **Options.** (a) **`known` > `candidate` > `learning`** — the highest trust wins. (b) `known` >
  `learning` > `candidate` — the most conservative; if either side is still learning, the merged
  word is learning. (c) Whichever side has the later `lastSeen`.
- **Recommendation: (a), `known` > `candidate` > `learning`.**
- **Why.** The two entries are records of the SAME word, and the higher status is the one backed by
  more evidence — a claim or a quiz pass. A merge should never silently discard a verdict she or
  the quiz produced. (c) is rejected outright because `lastSeen` moves on a tap, and a tap is
  exactly the event that does not mean "she stopped knowing it" — that path is `needsReview` (D11).
- **Note for the builder.** `migrateWordKeys` must stay idempotent; it runs on every profile load.
  Rank the three statuses with a small ordered array, and merge B5's nomination counter with `max`,
  the way `strikes` is merged at `lib/profile.js:294`.

### B5 — can a demoted word be re-nominated by G1?

- **The problem.** G1's clock is "appeared in ≥2 chapters generated after `lastSeen`". A word the
  quiz just demoted has an OLD `lastSeen`, so the very next chapter generation re-nominates it
  immediately — a promote/fail/promote loop that also floods the quiz.
- **Options.** (a) Never re-nominate: once demoted, only her own claim can promote it again.
  (b) Reset the clock on demotion (`lastSeen = now`), so it needs two fresh chapters.
  (c) An escalating quiet period, longer after each demotion.
  (d) **Reset the clock AND cap automatic nominations at 2 per word**; after that only her claim
  promotes it.
- **Recommendation: (d).**
- **Why.** It stops the loop with a hard bound — no word ping-pongs more than twice — without
  permanently blacklisting a word she may genuinely learn next month, and her manual claim always
  remains available (D13 runs in this direction too).
- **Note for the builder.** One new optional integer, `nominations`, absent meaning 0 — the same
  additive shape D24 used for the quiz counters, so `validateProfile` and old profiles are
  unaffected. If you want ZERO new fields, take (b) alone and accept the loop risk; it should then
  be surfaced in the parent view rather than left silent.

### B6 — what does the child actually SEE for a candidate? (arguably owner-only)

Three sub-questions, because "candidate" leaks into three places on screen.

**(i) The badge.** `statusBadge` (`public/views/words.js:117`) returns יודעת for `known` and falls
through to לומדת for everything else, so a candidate would silently read "learning".

- **Options.** Leave the fall-through (candidate invisible to her); a **third badge**; or לומדת
  plus a small marker.
- **Recommendation: a third badge, `כמעט יודעת` ("almost knows it").**
- **Why.** The badge is the only place the app tells her what it thinks of a word; a status that
  exists in the data and nowhere on screen is exactly the invisible verdict this whole document
  exists to remove — and "almost" is the honest reading of the state.

**(ii) The claim button.** It renders only for `status === "learning"` exactly
(`public/views/words.js:155`), so a candidate would lose it — a word she is suddenly not allowed to
claim.

- **Options.** Hide it (she must wait for the quiz) or **show it** (her claim short-circuits the
  quiz and makes the word `known` at once).
- **Recommendation: show it.**
- **Why.** D13 says her claim outranks the app's guess; hiding the button would turn the app's
  guess into a barrier to her own claim, which inverts the design. `markWordKnown` already handles
  the transition and clears the strike fields, so no new endpoint is needed.

**(iii) The demotion wording.** Today the quiz shows one line when a claimed word demotes
(`public/quiz.js:171`): *"המילה הזאת חוזרת ללמידה, נלמד אותה שוב יחד"*.

- **Options.** Reuse it verbatim for a candidate; a **separate, softer line**; or say nothing for a
  candidate.
- **Recommendation: a separate, softer line.** Proposed text, for you to approve or replace:
  **`עוד לא — נמשיך ללמוד את המילה הזאת`** ("not yet — we'll keep learning this word").
- **Why.** The existing line answers a question she asked by claiming the word. A candidate is a
  word she never claimed, so telling her it "goes back to learning" describes a promotion she never
  saw herself receive.
- **Note for the builder.** QZ-18 freezes `quiz.js`'s text-node order, and QZ-22 pins the service
  worker `CACHE` version and `PRECACHE` list. All three strings above are contract amendments to be
  recorded beside what they amend, not free edits.

### B7 — do the weekly top-ups generate items for candidate words?

- **The problem.** The top-up operation and phase 6's completeness criterion derive their word list
  from her `known` words. A candidate therefore never gets an item — and a candidate with no item
  can never pass a quiz and can never become `known`. As written, G1 deadlocks.
- **Options.** (a) **Top-ups cover `known` ∪ `candidate`.** (b) Top-ups stay `known`-only and G1
  only nominates words that already have an item file. (c) Generate an item at nomination time.
- **Recommendation: (a)**, keeping D23's existing tolerance — a candidate with no item yet is
  simply not asked, and waits for the next weekly top-up rather than being dropped.
- **Why.** (b) makes the item bank the gate on her vocabulary growth, which is backwards and
  contradicts D23's own principle that items exist to serve the words she is actually learning.
  (c) requires a runtime LLM call, an explicit non-goal.
- **Cost, stated honestly.** D23 measured ~9,000 tokens and ~70 seconds per word, ~250k tokens for
  a ~20-word week. If G1 nominates at a rate comparable to her claim rate, a weekly top-up roughly
  doubles — call it ~500k tokens and under an hour, once a week. **This is an estimate, not a
  measurement: G1 has never run, so its nomination rate is unknown.** The first month should be
  watched, and the quota in B3 is also the natural throttle if it runs hot.
- **The off-list rider.** By section 2 fact (ii), a candidate can be an off-list glossed word with
  no clip and no manifest entry. Covering those needs one clip (a fraction of a cent on the
  existing `scripts/build-word-audio.js`) AND an addition to `public/audio/words/index.json`, which
  is imported by `api/profile.js:6` and used by the lemma resolver. That is a real change with a
  real blast radius. **Recommendation: ship (a) for on-manifest words first, and treat off-list
  words as their own small step** — in the meantime an off-list word can still become `known` the
  moment she claims it, which is the stronger signal anyway.
- **And the criterion inverts again.** "Does every word SHE HAS CLAIMED have an item" becomes
  "does every word she has claimed OR the app has nominated have an item".

## 9. The order the parked items land

`design.md §6` lists five weekly-update items still parked, and the brief adds W3. This section
fixes the order, with one dependency reason each. Do not reorder these.

1. **G1 as amended (section 5) plus the answers to B2-B7.** It is the producer every later item
   depends on, and it is now cheap to get wrong because a candidate touches no chapter.

2. **The parent view** (`design.md §6` item 4b). **Moved ahead of G2**, which is a change from the
   unsigned version. There are now three automatic writers on her profile — quiz strikes, demotion,
   and G1's nominations — and nothing shows you any of them. D14 promised this view "soon". You
   must be able to see the engine before it is allowed to move the band.

3. **G2** (section 6). Every item below is worth less if the band is wrong, but G2 is the one
   change that alters what she reads without asking anyone, so it goes behind the view that makes
   it visible.

4. **W3, the whole-story read-aloud.** The last unbuilt ask in the brief, and the owner's original
   order put it before the quiz. It needs its own design decision — pre-generated audio per chapter
   (cost per chapter, forever) versus on-device speech synthesis (free, worse voice, inconsistent
   with the `nova` clips she already hears). It depends on nothing above it, so it can be moved up
   if you would rather she had it sooner.

5. **Daily spaced-repetition review** (`design.md §6` item 1a). Partly delivered already: a quiz
   runs after every chapter. What remains is scheduling and the daily prompt, and it consumes G1's
   candidates directly.

6. **Push notifications** (item 1b). Split from item 5 deliberately: push needs an installed PWA
   plus a permission grant, and the PWA is not installed on her phone yet.

7. **Trophies and achievements** (item 4). Cheap retention, no new API surface — and `quizRight` /
   `quizWrong` (D24) are now the first honest material a trophy could be built from.

8. **Writing exercises** (item 2). Needs a grading approach that does not exist: `skills.writing`
   and `skills.grammarInContext` are `unknown` in every profile.

9. **Record-only speech** (item 3). Gated on a storage change: `docs/owner-handoff.md §6` records
   the profile store as a public-access Vercel Blob store — fine for word lists, not for a child's
   recorded voice.

10. **Automatic pronunciation scoring** (item 5). Out of scope; `design.md` already marks it the
    highest-risk deferred item.

## 10. What must not change

- `design.md` (the frozen project design) and `docs/visual-design.md` stay FROZEN. This document
  proposes rules alongside them; it amends neither.
- `.oplan/word-quiz/design.md` D1-D28 stay FROZEN. Section 8 builds ON them (D12, D13, D18, D22,
  D23, D24, D28); it re-opens none of them.
- `minRatio` stays at 0.95 (`lib/story.js:127`), under every band including `A2+`.
- The placement test, `lib/placement.js`, and the item bank stay exactly as they are.
- The re-take flow stays client-only; `api/placement.js`'s action surface stays `submit`-only.
- The band stays off the child's screen. It is visible only on `#/parent`.
- Any change under `public/` ships with a `sw.js` `CACHE` bump in the same phase, per QZ-22.
- Her profile is LIVE in Vercel Blob behind `APP_CODE`. Never probe it; always use a temp
  `DATA_DIR` in tests. A capture must be taken before any deploy that can write new fields (D25).
- **The three frozen quiz contracts this document proposes to AMEND, named here so the amendment is
  explicit rather than smuggled in:** QZ-12 (a new candidate branch, `known` rows untouched),
  QZ-17 (a new export, the comparator untouched), QZ-18 (new text nodes for the badge and the
  candidate demotion line).

## 11. Open questions for the owner

This document deliberately does not answer these. Only you can.

(a) Do you accept the app moving the band by itself under G2, given that retaking the placement
test always overrides it?

(b) Is a word list above Band II obtainable from the Ministry of Education or another source, or is
`A2+` (text-side growth only) the permanent ceiling for list growth?

(c) Should `design.md §3` be amended to describe what the code will actually do once G1 and G2
land? It is frozen, and only you can re-open it.

(d) Do you want the seven constants in section 6 reviewed after the first month of real data, and
on what evidence?

(e) Do you accept a private Blob store as a prerequisite for item 9 in section 9 (record-only
speech)?

(f) **NEW.** B2 proposes that ONE wrong answer demotes a candidate. That is the only proposal here
that can visibly take a badge away from her without three chances. Do you accept it?

(g) **NEW.** B6's three strings are child-facing Hebrew written by an agent, not by you. Approve
them or replace them.

(h) **NEW.** Should quiz accuracy (`quizRight` / `quizWrong`) ever feed the band? Section 6.1 says
no for now, because the quiz asks only about words she claimed and only about the 62 of 2254 words
that have items. Revisit after a month of the parent view.

## 12. Sign-off

Date: 2026-07-28

**The document**

[x] Approved — build sections 5 and 8 next run, in the order in section 9.
    (Signed by the owner in chat, 2026-07-28: "Q2. accept" — after the three owner-taste items
    (B2 one-wrong demotion, B6's Hebrew strings, B6's visible claim button) were read out to
    them explicitly. Order amended by the owner the same day: see
    .oplan/word-g1/phase-state.md — gamification is the story-integrated "magic clinic",
    NOT streak-pressure mechanics.)

**The seven proposals** — tick to accept as written, or write an override on the line.

| | Proposal | Accept | Override |
|---|---|---|---|
| B1 | Amend first, then sign — this draft is the amendment | [x] | (accepted as written, 2026-07-28) |
| B2 | One wrong answer demotes a candidate | [x] | (accepted as written, 2026-07-28) |
| B3 | At most one candidate per quiz session, existing comparator inside the tier | [x] | (accepted as written, 2026-07-28) |
| B4 | Merge precedence `known` > `candidate` > `learning` | [x] | (accepted as written, 2026-07-28) |
| B5 | Reset the clock on demotion, cap automatic nominations at 2 per word | [x] | (accepted as written, 2026-07-28) |
| B6 | Third badge `כמעט יודעת`, claim button stays visible, softer demotion line | [x] | (accepted as written, 2026-07-28) |
| B7 | Top-ups cover `known` ∪ `candidate`; off-list words as their own later step | [x] | (accepted as written, 2026-07-28) |

Signed: the owner, via chat ("Q2. accept"), recorded verbatim by the orchestrator, 2026-07-28.
STATUS note: this document is now SIGNED. The word-g1 run copied it over docs/growth.md on 2026-07-28; this file IS the signed document of record.
