# PLANNING BRIEF — word-finish PHASE 3 "quiz items"

Written by the orchestrator 2026-08-02, for a FRESH PLANNER who has read none of this run.

---

## 0. THE RULE THAT GOVERNS THIS BRIEF

**THIS BRIEF DELIBERATELY ASSERTS NO MEASURED FACT ABOUT THE REPOSITORY.**

That is not modesty, it is the lesson phase 2 paid for. The phase-2 brief carried a remembered
count — "the honest number is 16" — that a one-day-old, owner-approved ruling had already set to
**ten**, and executing the sixteen would have silently split the child's saved vocabulary on the
server. Only the planner re-deriving the number from scratch caught it. See field guide 24.

So: **every number, every file path, every line number, every claim about how the code behaves is
YOURS TO MEASURE.** Where this brief mentions a quantity at all it is marked `‹DERIVE›` and you
must treat the mention as a *question*, never as an input. If this brief and a measurement
disagree, **the measurement wins, and you must say in the plan that the brief was wrong.**

The two exceptions, which ARE authoritative because they are contracts and rulings rather than
observations, are quoted verbatim in §3 and §4 below. Quoted, not named — a packet that names a
frozen contract without quoting it is a hole (field guide 9).

---

## 1. WHAT YOU ARE

A fresh planner. **Opus. READ-ONLY of the repository and of production.**

* You change **nothing** in `C:/Users/dkreinov/claude/english-app`. No `git` command that writes.
  No `vercel` command. No request to production of any kind. You never open `.env`.
* **You spend no money.** No OpenAI call, no TTS call, not one. Phase 3 buys items; the *plan* for
  phase 3 buys nothing. If you need to know what the model would produce, say so as an unknown.
* **YOU NEVER REQUEST `/api/profile` IN ANY FORM.** Field guide 3: `GET /api/profile` **CREATES**
  one. This is a live service used by a real child. Not with curl, not with a browser, not with a
  dev server pointed at the live store, not "just to check". See §5 Q1 — this constraint is the
  single hardest thing about planning this phase, and pretending it away is the failure mode.
* Scratch and draft live **OUTSIDE the repository**, at `C:/Users/dkreinov/wf-p3-plan/`.
  Never write scratch into the repo (field guide 4).
* **Write the draft INCREMENTALLY to `C:/Users/dkreinov/wf-p3-plan/PLAN-P3.md`** as you go —
  append sections as they are finished, so that if you die the work survives.
* **NEVER PASTE THE PLAN, OR ANY LARGE PART OF IT, INTO YOUR REPLY.** Your reply is a short
  pointer: the path, the section list, the blockers, and the things you found that this brief got
  wrong. The plan is read from the file.

**Verify by EXECUTION, not by reading.** Field guide 15: source-needle checks fail OPEN. Where you
claim the code does something, drive the *shipped* code and paste its real output into the plan.
Where you claim an edit produces a given file, **simulate the edit on a byte-exact mirror outside
the repo** and measure the result there (field guide 21) — never hand-count.

---

## 2. WHERE THE RUN IS, AND WHAT TO READ

Repo `C:/Users/dkreinov/claude/english-app`, branch `master`, tree clean, HEAD `536e520`
(**verify all three**). Workspace `.oplan/word-finish/`.

Read, in full, before planning:

1. `.oplan/word-finish/phase-state.md` — the contract of record. FC-1..FC-7, F1-1..F1-4, F2-1..F2-3.
2. `.oplan/word-finish/design.md` — all of it. Especially **§2** (build-time, not run-time),
   **§3 B** (this phase), **§5** (non-goals), **§6** (risks), **§11** (what was and was NOT waived),
   **§12 / FC-6**.
3. `.oplan/word-finish/journal.md` — the whole 2026-08-02 record.
4. `.oplan/word-finish/field-guide/index.md` — 27 lessons. Lessons 15, 17, 18, 21, 22, 24, 25, 26,
   27 are the ones this phase is most likely to re-pay for. Note lesson 23's remedy is **SPENT**.
5. `.oplan/word-finish/STATUS.md` — the plain-words photograph of now.
6. `.oplan/word-finish/plan-phase2.md` — **for the HOUSE STYLE of a plan**, and because its
   FINDING 1/2 are the direct ancestors of this phase's F2-2.
7. `.oplan/word-quiz/` — **the run that BUILT the item contract QZ-1 and the bank you are growing.**
   This is the most under-read document set available to you and it is where the real traps are
   written down. Read its plan, journal and phase-state. `.oplan/word-g1/` built the top-up script
   and is the other one.

---

## 3. FROZEN CONTRACTS — QUOTED FROM `phase-state.md`, IN FORCE, NOT NEGOTIABLE

> **FC-1**  `public/quiz.js` md5 `69b6d71117cf776715374abc6f0abb02` and `public/quiz-core.js` md5
> `9a2131be8b9d1b77c219f1e8c3482a71` (QZ-18 — NEVER touched, not even whitespace).
>
> **FC-2**  the audio VOICE, MODEL and INSTRUCTIONS in `scripts/build-word-audio.js`
> (`gpt-4o-mini-tts` / `nova` / the existing instructions string). 2264 clips now came from
> those. The ONLY edit to `synthesizeWord` this phase was the word `export`.
>
> **FC-3**  the `.oplan` awk filter is  `awk '$NF !~ /^\.oplan\//'`  — TWO backslash bytes.
>
> **FC-4**  CACHE `magic-vet-v20` -> `v21` happens EXACTLY ONCE, in phase 4 (F1-1). `public/sw.js`
> md5 `78fc3b0ac1d10de8a5baccb753eca33c`.
>
> **FC-5**  the no-recording marker (design §8, owner-frozen): `btn-say na` + the English caption
> `coming soon`. The CSS lives in design.md's two ```css blocks, is EXTRACTED BY SCRIPT and
> never retyped, md5 `6e43cb5e463520f5d277d7d02c5ff26c`, and a test asserts it is present in
> `public/styles.css` byte-for-byte. A tidy-up of the owner's rules fails the suite.
>
> **FC-6**  BASE LEMMAS ONLY in `data/story-words.json` (design §12). Gated by an executed
> 20286-form sweep in `tests/word-audio.test.js` AND by a surface guard in `tests/reader-ui.test.js`.
>
> **FC-7**  no new Hebrew string anywhere. `reader.js` non-ASCII 754, `words.js` 465, `styles.css` 0.
> Hebrew is MOVED by byte-slicing, never retyped (field guide 8).

**Re-measure every digest and count in the block above yourself.** They are contracts, so they are
authoritative as *intent*; the specific hex is still a measurement and measurements have been wrong
in this project before (field guide 21(c): a line count was wrong while the md5 was right).

**Additional non-goals, quoted from design §5:** *"No change to `public/quiz.js` or
`public/quiz-core.js` (QZ-18 frozen). No run-time generation of anything. … No new Hebrew string
without the owner's sign-off. No deploy until every gate and both owner gates (audio sample, item
samples) have passed."*

**No `CACHE` bump in this phase.** F1-1 is spent exactly once, in phase 4. If your plan discovers a
reason phase 3 *needs* a bump, that is a BLOCKER for the orchestrator, not a decision for the plan.

---

## 4. CARRIED OBLIGATIONS — QUOTED, AND WHICH ONES PHASE 3 OWNS

> **F1-1**  phase 4 bumps CACHE … **DO NOT DISCHARGE IT.** Phase 3 owns nothing here.
>
> **F1-2**  R4(ii) NOT DONE — nothing reads `story.checkLog` back … OWNER HAS RULED (design §10) …
> Still needs a step. **NOT phase 3's, unless you argue it is and the orchestrator agrees.**
>
> **F1-3**  latent: the log-check POST swallows failures and sets `st.logged=true` BEFORE the await.
> **Not phase 3's.**
>
> **F1-4**  the sandbox de-identification is machine-local; re-run the machine-wide identity sweep
> at phase 4. **Not phase 3's — but see §5 Q1: if phase 3 creates any file containing her data,
> phase 3 owns a receipt and a deletion, and F1-4 grows.**
>
> **F2-1**  `Ellie` and `Sparkle` … say `coming soon` … needs her live profile, so phase 4 or later.
>
> **F2-2**  `lib/quiz-item.js` resolves tokens through `resolveLemma` against a set its CALLERS
> supply (`scripts/build-item-bank.js`, `scripts/quiz-topup.mjs`). After phase 2 the bands and the
> manifest are NO LONGER THE SAME LIST (2254 vs 2264). **PHASE 3 MUST STATE WHICH ONE IT MEANS.**
>
> **F2-3**  A SERVICE WORKER IS REGISTERED ON `127.0.0.1:3000` … THE WORKING REMEDY … run the dev
> server on a DIFFERENT PORT (`PORT=3100` is supported), which is a different origin.

**F2-2 IS YOURS AND IT MUST BE RULED IN THE PLAN.** And note carefully: **the two caller names in
F2-2 are the orchestrator's recollection, not a measurement.** Do not trust them. Grep the artifact
(`lib/quiz-item.js`) for its real importers, and grep every *other* path by which an `allowed` set
reaches the item contract or the top-up script. Field guide 25: **ask the question of the ARTIFACT,
not of the accessor** — that lesson exists because design §9 asked the right question of the wrong
function and got a true, useless answer. If F2-2 names the wrong callers, say so plainly.

---

## 5. THE QUESTIONS THIS PLAN MUST ANSWER. Answer every one, in the plan, with evidence.

### Q1 — **WHICH WORDS?** This is the question the whole phase stands on.

Design §3 B and `STATUS.md` say the point of phase 3 is *quiz items for the words SHE ACTUALLY HAS*.
Her words live in `profile.words`, on the live service, behind `APP_CODE`.

**And you may not go and look.** Field guide 3. Furthermore D27 deleted every captured copy of her
profile from this machine, deliberately, and design §1 records that as a *good* thing.

So the plan must answer, from evidence:

* Where, if anywhere, does a list of her words exist **on this machine today**? (Search the record.
  Do not search her data — search for whether such a file exists at all, and report the answer as a
  yes/no plus paths, never as contents.)
* If it does not exist: **what is the honest target set?** Name the candidates you considered, and
  the cost of each. Some shapes that exist: the story-glossary words the repo does know about; the
  words the chapter-first selector can actually reach; a band-derived set; the union of what a
  future top-up would ask for. **Derive what each set would actually contain and how many items
  that is** — a set whose size you have not measured is not a proposal.
* **What does the chapter-first quiz actually select from?** Drive the shipped selector. Name the
  exact function, the exact inputs, and show its real output on a fixture you build. The claim
  *"the chapter-first quiz has almost nothing of hers to ask"* is the premise of the phase — verify
  it or refute it, by execution.
* If the honest answer is **"this phase cannot know her words without a live capture"**, then say
  so and **raise it as a BLOCKER** (§8). Do not quietly substitute a set you can reach for the set
  the design asked for — that is the shape of "the work was done and changed nothing she would see"
  (`.oplan/word-polish/journal.md` FINDING 2, which is exactly this failure, already made once in
  this project). If a capture is the answer, then the plan must also specify: the **only** sanctioned
  live read is the frozen subshell ritual at `.oplan/word-quiz/plan.md:1573-1586` (read it; verify
  those line numbers), it is the **orchestrator's** to run and never a worker's, and every byte it
  produces needs a receipt and a deletion inside this phase, because D27 and F1-4 are the standing
  policy on her data existing on this machine at all.

### Q2 — **F2-2: bands or manifest?** Rule and justify.

State which set `allowed` means for every rule in `lib/quiz-item.js` that consumes it, derive the
real callers, and state the consequence of the phase-2 divergence. Concretely: does the existing
bank still pass the gate under the post-phase-2 set? (Run it.) Does the divergence make any word
newly eligible or newly ineligible? Does anything about the ten new base lemmas interact with the
item contract? **Show the numbers.**

### Q3 — **THE CORRECTNESS PASS.** This is the reason the phase needs care.

Quoted from design §3 B:

> *"`isUsableItem` cannot tell whether a distractor is *also a correct answer*. If a generated item
> offers `glow` as a wrong option for `shine`, she is marked wrong for a right answer. **A shape
> check is not a correctness check.** So this item needs its own validation pass, and that pass is
> part of the work, not an afterthought."*

The plan must specify that pass concretely:

* What exactly is the failure being detected? Give real examples drawn from the **existing bank**
  (it has items today — hunt it for near-misses and report what you find; if the shipped bank
  already contains such a defect, that is a finding and it changes the phase).
* What detects it — and be honest about which parts are mechanical, which are model judgement, and
  which are human. A model checking its own output is not an independent check; say how you break
  that circularity.
* **What is the negative control?** Field guide 2: a positive assertion needs a control that proves
  it can fire. Build deliberately-poisoned items and show the pass catching them, with counts.
* **Instrument it** (field guide 18): it must print how many items it actually observed. If
  "observed" is 0, or equals "skipped", it is decoration.
* What happens when it fires — reject the item, regenerate, or stop the batch?

### Q4 — **THE GENERATOR, AND WHERE ITS OUTPUT LANDS.**

* House style is `gpt-4.1-mini` via the OpenAI chat API (design §3 B; `scripts/build-item-bank.js`
  is named as the precedent — **read it and check whether it is actually the precedent for THIS
  bank or for a different one**; the phase-state's recollection may be wrong here too).
* New script, or extend an existing one? Decide and justify. There is an existing gate
  (`scripts/check-quiz-bank.mjs`) and an existing top-up lister (`scripts/quiz-topup.mjs`) — read
  both; the plan should reuse rather than re-implement, and a gate that re-derives a rule is a
  second drifting copy of the contract (that script says so itself).
* **The output must NOT land in `public/quiz/` before the owner approves it.** Design §3 B and §5.
  Specify the staging path (outside `public/`, and say whether outside the repo entirely), and the
  mechanical step that promotes staged items into the bank *after* approval.
* Cost control: how many API calls, roughly what spend, what a half-finished batch leaves behind,
  and whether a re-run is idempotent. Phase 2's equivalent section is a good model.
* Determinism: `temperature`, seeds, and whether two runs produce the same bank. Say what you
  choose and why.

### Q5 — **THE OWNER GATE, WHICH IS NOT WAIVED.**

Design §11 waived the **audio listening** gate only, and its reason was explicit: *the agent cannot
hear.* **The owner can read.** Design §3 B: *"the owner must approve the batch and see samples
before any item reaches her."* Design §5: no deploy until *both* owner gates have passed.

The plan must specify:

* Exactly **what he is shown** — how many items, chosen how. Note `scripts/check-quiz-bank.mjs`
  already has a deterministic `--sample N` mode built for precisely this, and `.oplan/word-quiz/`
  records a real defect where a sampler silently showed 40 of 50 requested items. **Read that
  history and do not repeat it.** If you use the sampler, prove on real data that it shows what it
  says it shows.
* **In what form.** The owner reads Hebrew and English; he is not reading JSON blobs in a terminal
  if a better form exists. He has a standing preference for being shown visual choices as a
  self-contained HTML page opened in his browser.
* What "approved" means **mechanically** — what artifact records the approval, and what gate reads
  it, so that an unapproved batch structurally cannot reach `public/quiz/`.
* Where in the step order the gate sits, and what is already committed when he sees it.

### Q6 — **THE SHAPE OF EACH STEP.** House style, non-negotiable.

* Steps are numbered `3.1`, `3.2`, … Each has: GOAL, TIER (WORKER / ORCHESTRATOR — anything holding
  a key or spending money is ORCHESTRATOR), DEPENDS ON, an **exhaustive REPO WRITE SET** (every path,
  with line/byte/md5 pins measured on a *simulated* post-edit tree), the frozen artifact it applies,
  its **fail-first** demonstration, and its validation tail.
* **A `§VAL-F3` FROZEN VALIDATION PREAMBLE**, in the plan, that you have **extracted back out of
  your own document by script and RUN** against the clean tree — pasting its real stdout. And then
  **seen to FAIL** on a mutated copy.
* **A preamble is not a gate** (field guide 17). Every step's validation is **ONE FILE** =
  §VAL-F3 verbatim + that step's tail, **ending `exit $RC`**. A tail in a separate process cannot
  see `$RC`, `$PORC`, `$TOTAL` and exits 0 unconditionally — the silent-pass class.
* **MANDATED FAIL-FIRST PER STEP.** Every new check is seen to fail, for the right reason, before
  it is trusted. State the mutation and the expected failure text.
* Pin the cumulative test ledger per step (reported total AND flat `^test(` count) — a file that
  fails to parse silently removes all of its tests from the total (field guide 19).
* **GATE OR GUARD**: classify every check in the phase. A guard that cannot be made to fail must be
  labelled a guard, not counted as a gate (field guide 15).

### Q7 — **WHAT MOVES WHEN THE BANK GROWS.** Derive every anchor this phase disturbs.

Adding files under `public/quiz/` moves things. Find *all* of them and pin the new values.
At minimum, investigate and report: the `public/` file count; the quiz-bank gate's own output line;
every test that pins a bank count or a file list; whether `public/quiz/*.json` is precached by
`public/sw.js` and what that means for F1-1 and for phase 4; whether anything in `tests/` asserts
the bank's exact contents. **Grep `tests/` for exact-shape assertions before touching anything**
(field guide 7). Do not assume this list is complete — it is the orchestrator's guess, and §0 applies.

### Q8 — **ITEM SHAPE DECISIONS.**

Read the QZ-1 contract in `lib/quiz-item.js` and decide, with reasons: how many items per file;
whether multi-sense files are produced; how many distractors and why that number; how distractors
are chosen so rule 8 can pass; whether the gloss is generated or derived. **Do not restate the
contract from this brief or from design §3 B — design §3 B's one-line summary of the item format
is a summary, and at least one detail of it is worth checking against the code.** The code is the
contract.

### Q9 — **THE TRAPS PHASE 2 PAID FOR.** Show, per step, that each is handled.

* A test verified **in isolation** is not verified **in its file** — module caches are process-wide
  and `node --test` isolates per FILE (lesson 27). If a new test stubs a module another test in the
  same file already stubbed, it needs its **own file, with a header saying why**.
* **Any gate edit must be VERIFIED TO HAVE LANDED.** A silent no-op replacement let a clause the
  orchestrator believed he had added simply not exist, and the gate passed anyway. Count the
  clauses after writing them.
* **Instrument every sweep once**: print how many items it observed (lesson 18).
* **Never build a pattern out of the content you are searching for** (lesson 18's first half).
* If a **frozen pin and a mandated edit collide**, ask which one names a PROPERTY — re-express,
  never delete, and **see it fail** (lesson 22).
* Line endings: measure by **counting bytes** (`tr -dc '\r'` vs `'\n'`), **never with grep**
  (lesson 16). Both ways, on every file the phase touches.
* Hebrew is **moved by byte-slicing, never retyped**; scripts are written to FILES, never through
  shell quoting (lessons 8, 19).
* Any visual check runs on a **fresh PORT**, never `localhost:3000` or `127.0.0.1:3000` (F2-3).

### Q10 — **WHAT COULD MAKE THIS PHASE FINISH GREEN AND CHANGE NOTHING SHE WOULD SEE?**

Answer it explicitly, in the plan, in its own section. This project has already shipped that exact
outcome once (`.oplan/word-polish/journal.md` FINDING 2). Name the mechanism by which phase 3's
work actually reaches her screen, trace it end to end, and name the check that would catch it if it
does not. Field guide 15: *for each artifact the plan creates, trace its RUNTIME path — where does
it exist, who needs it, can they reach it AT THE MOMENT they need it?*

---

## 6. WHAT PHASE 3 DELIVERS (design §3 B, quoted)

> **B — quiz items for the words she actually has.** Format is fixed and simple
> (`public/quiz/<lemma>.json`, an array of ``{lemma, sense, sentence-with-`___`, answer,
> distractors[≥5]}``); `isUsableItem` in the frozen `public/quiz-core.js` validates the **shape**.
> 62 files / 84 items exist today.
>
> **The risk no existing check covers … `isUsableItem` cannot tell whether a distractor is *also a
> correct answer*.** … **A shape check is not a correctness check.** So this item needs its own
> validation pass, and that pass is part of the work, not an afterthought.
>
> Generation follows the existing house style (`scripts/build-item-bank.js` uses `gpt-4.1-mini` via
> the OpenAI chat API). **PAID API — the owner must approve the batch and see samples before any
> item reaches her.** No change to `public/quiz.js` or `public/quiz-core.js`.

*(The "62 files / 84 items" and "distractors[≥5]" in that quote are the design's own numbers, from
2026-08-01. §0 applies to them too: measure, and report any disagreement as a finding.)*

---

## 7. WHAT COMES AFTER, so you do not plan into phase 4's territory

Phase 4 ships: **one** deploy, `magic-vet-v20` → `v21` (the bump spent exactly once), the
machine-wide identity sweep (F1-4), the manifest-URL probe, and a fresh profile capture as the
safety net. **Phase 3 deploys nothing and bumps nothing.**

---

## 8. BLOCKERS, RECORD GAPS, AND WHAT YOU COULD NOT MEASURE

The plan ends with three sections, as phase 2's did:

* **BLOCKERS** — decisions that are the orchestrator's or the owner's, not yours. Number them
  `B-F3-n`. **Raise one rather than guess.** Phase 2's planner raised a blocker rather than execute
  a set it believed was wrong, and it was right to. If Q1 has no honest answer without a live
  capture, that is `B-F3-1` and the plan stops there for a ruling — while still specifying
  everything that does not depend on the answer.
* **RECORD GAPS** — anything in `design.md`, `phase-state.md`, this brief, or the field guide that
  you found to be **wrong or stale**. Name the file and line. This section is not a courtesy; it is
  how this run stays honest, and every phase so far has filled it.
* **WHAT I COULD NOT MEASURE** — stated plainly, with what it would take.

---

## 9. THE ONE STANDING RULE

The owner's: **"always think easy and robust."** It outranks cleverness, and it has already
overruled one of his own proposals in this run (design §2). If the robust answer is smaller than
the impressive one, plan the smaller one and say why.
