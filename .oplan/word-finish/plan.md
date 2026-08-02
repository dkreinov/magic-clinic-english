# Plan — word-finish

# PLAN — word-finish PHASE 1 "the two defects and the sandbox" (draft)

Planned 2026-08-01 by a fresh planner (Opus), **read-only of the repository and of production**.
This planner changed nothing in the repository, ran no `vercel` command, made no request to
production, never opened `.env`, and never requested `/api/profile` in any form. No money was
spent. The only files this planner wrote are this document.

Repo `C:/Users/dkreinov/claude/english-app`, clean. Workspace `.oplan/word-finish/`.

> **⚠ THE BASE MOVED WHILE THIS PLAN WAS BEING WRITTEN — `0c0f32a` → `e44cffa`.**
> The briefing names `0c0f32a`, and that was HEAD when this planner started. Three commits landed
> during the planning pass: `caf4b29` (learner requests R4–R7 recorded), `e980052` (design
> AMENDMENT #1 — the owner's R7 rule), `e44cffa` (**R4 discovery: "C and R4 are ONE defect"**).
> **Measured, not assumed:** `git diff --name-only 0c0f32a e44cffa | grep -v '^\.oplan/' | wc -l`
> = **0**. Every one of the three commits touches only `.oplan/`. **No source file, no test file
> and no asset moved**, so every ledger, md5, digest and ending measured in this plan is valid at
> `e44cffa` — and `§VAL-F1` was re-extracted and re-run at `e44cffa` after the move, producing
> byte-identical output and exit 0.
> **But the design and the phase-1 scope question DID move — see FINDING 4, which answers a
> decision the orchestrator explicitly deferred to this draft.**
> **PHASE BASE FOR THIS PLAN: `e44cffa`.**
Owner's standing instruction: **"always think easy and robust."** Where the two pull apart this
plan says so out loud instead of silently picking one.

**THE ONE SENTENCE:** this phase fixes the two pure-code defects the learner and the owner
actually reported — the story that reloads when she comes back from her dictionary (C), and the
trophy card that says "target reached" while greyed out (D) — and takes her vocabulary out of the
development sandbox (E); no API, no money, no deploy, and no `CACHE` bump.

**NO RAW HEBREW GLYPH APPEARS ANYWHERE IN THIS PLAN.** Every Hebrew string is written as `\u`
escapes. No new Hebrew string is authored by this phase, in any file.

---

## WHAT THIS PLANNER MEASURED TODAY, AND HOW

Nothing below is quoted from the record, from the design or from the briefing without being
re-measured. Every command was run today against the clean tree at `0c0f32a`.

| measured | command / method | result |
|---|---|---|
| HEAD, tree | `git rev-parse HEAD`, `git status --porcelain -uall` | **`0c0f32a`**; the only entry is `?? .oplan/word-finish/` |
| suite, plain | `npm test` | `1..355`, `# tests 360`, `# pass 360`, `# fail 0`, exit 0 |
| flat ledger | `grep -h -c '^test(' tests/*.js \| awk '{s+=$1} END{print s+0}'` | **355** (360 − 355 = **5** subtests, all in `tests/dev-server.test.js`, whose flat count is 1) |
| contrast gate | `node scripts/check-contrast.mjs` | prints `ALL PASS`; `grep -c '^PASS'` = **58** |
| quiz bank gate | `node scripts/check-quiz-bank.mjs` | `QUIZ BANK OK: 62 files, 84 items` (+ `MULTI-SENSE: 19 files with >=2 items`) |
| npm scripts | `node -e '…require("./package.json").scripts'` | `{"test":"node --test","dev":"node scripts/dev-server.js"}` — **there is no `contrast` script and no `dev` alias for anything else** |
| `public/` file count + digest | the frozen walker (below, §VAL-F1) | **`2372 cf9dadcece84bd8245e1cd99f378ea51`** |
| line endings, bytes, md5, raw non-ASCII | a byte-scanning `node -e` over 20 files **and independently** `tr -dc '\r' < f \| wc -c` vs `tr -dc '\n' < f \| wc -c` | the table in **SK-F1-1**; the two methods agree on every file |
| defect D, reproduced | the **shipped** `public/views/trophies.js` driven in node over a synthetic profile | **reproduced**: `known` renders `trophy-card--locked` while its line reads `12 \u05de\u05ea\u05d5\u05da 5` |
| the D fix, proven | the proposed rule swept over all 8 trophies × metric 0…gold+3 × 7 stored shapes | **4228 combinations, 0 invariant violations, 0 never-regress violations** |
| the sandbox profile | `node` read of `C:/Users/dkreinov/english-app-sandbox/profile.json` | 4783 bytes, md5 `e56c169fddf0ab2275fda3f98f5e3182`, **12** word keys, 1 chapter, no `trophies` key, `learner.heroineName`/`petName` set, `placement.completed` |
| **other copies of her data on this machine** | a walk of 12 out-of-repo directories, comparing word-key SETS, printing **counts only, never a word** | **FOUR more copies. The design's "E is the last copy" is FALSE — see FINDING 1** |
| the D27 receipt | `.oplan/word-polish/backup-receipt.txt` read in full; `ls` of `english-app-backups/` | all **10** listed captures are gone; `english-app-backups/` is **empty**. That part of the record is correct |
| the house plan shape | `.oplan/word-polish/plan.md` — phase 1 (`:1-1587`) and phase 3 (`:1588-3818`), including `§VAL-P1` (`:507-637`) and `§VAL-P3` (`:2319-2547`) | read |
| the field guide | `.oplan/word-finish/field-guide/index.md`, `wc -l` = **148** | read in full; 15 and 16 twice |
| the record that landed mid-plan | `.oplan/word-finish/design.md` §7 (AMENDMENT #1), `journal.md:35-70` (the R4 discovery), `phase-state.md`, `briefing.md` | read in full — see **FINDING 4** |

**Two independent methods were used for line endings, per field-guide lesson 16.** `grep` was
never used to measure an ending anywhere in this work.

---

## THE BRIEFING'S NUMBERS, RE-MEASURED

The briefing (`C:/Users/dkreinov/trophies-art/BRIEFING-FINISH-P1.md`) was treated as a set of
hypotheses. **Every measurable claim in it reproduced exactly.** For the record:

| briefing claim | verdict |
|---|---|
| clean at `0c0f32a` | **TRUE** (the session's opening `git status` snapshot showed `ae349c6`; that snapshot was stale, `git rev-parse HEAD` says `0c0f32a`) |
| `npm test` → 360 reported / 355 flat / 0 fail | **TRUE**, exactly |
| `check-contrast.mjs` → 58 PASS, `ALL PASS` | **TRUE** |
| `check-quiz-bank.mjs` → `QUIZ BANK OK: 62 files, 84 items` | **TRUE** |
| there is no `npm run contrast`; `package.json` has only `test` and `dev` | **TRUE** |
| `public/views/trophies.js:100-114` computes the number live while the ring comes from stored `profile.trophies` | **TRUE as to substance**, imprecise as to line numbers: `:99-115` is the `TROPHY_VIEW` literal that *defines* the metrics; the **seam is `cardHtml` at `:163-177`**, which reads `tierOf(trophies[id])` (stored) at `:164-165` and `progressLine(...)` (live) at `:167`. An executor sent to `:100-114` would edit the wrong place. Corrected in **SK-F1-3** |
| the sandbox holds her real vocabulary, 12 words | **TRUE** — 12 keys, and 11 of them also appear in a production read-back still on this machine |
| **"E is the last copy of her data on this machine"** (design `:20`) | **FALSE. FOUR more copies exist — FINDING 1** |
| LIVE: `magic-vet-v20` at `dpl_6pFjJ8LrcyaFodRELCa46BzATUXy` | **NOT MEASURED** — this planner may not touch production. `public/sw.js:1` in the worktree reads `magic-vet-v20`, which is consistent. Treated as a hypothesis phase 4 must confirm |

One correction the briefing asks for is also worth stating in the other direction: the briefing says
"copy `§VAL-P3` as the template". `.oplan/word-polish/plan.md` contains **both** a `§VAL-P1` (its
phase 1, `:507`) and a `§VAL-P3` (its phase 3, `:2319`). `§VAL-P3` is the later and better one — it
carries the `console.log(String(n))` fix and the two-state seam machine — and it is the one copied
here. (A `grep` for `VAL-P3` over that file reports "Binary file matches" and hides the phase-3
hits; `grep -a` is needed. Noted so the next reader does not conclude the section is missing.)

---

## FINDING 1 — HER VOCABULARY IS IN **FIVE** PLACES, NOT ONE, AND TWO OF THEM HOLD MORE OF IT

The design (`.oplan/word-finish/design.md:20`) states: *"E is the last copy of her data on this
machine."* Measured today, that is false. A walk of every out-of-repo working directory, comparing
**word-key sets** and printing only counts, found five files carrying her vocabulary:

| # | path | bytes | md5 | word keys | chapters | relationship |
|---|---|---|---|---|---|---|
| 1 | `C:/Users/dkreinov/english-app-sandbox/profile.json` | 4783 | `e56c169fddf0ab2275fda3f98f5e3182` | **12** | 1 | the file **E** names |
| 2 | `C:/Users/dkreinov/g1-scratch/sandbox-profile.bak` | 4783 | `e56c169fddf0ab2275fda3f98f5e3182` | **12** | 1 | **byte-identical to #1** |
| 3 | `C:/Users/dkreinov/g1-scratch/sandbox-profile-p2.bak` | 4783 | `e56c169fddf0ab2275fda3f98f5e3182` | **12** | 1 | **byte-identical to #1** |
| 4 | `C:/Users/dkreinov/g1-deploy/live-readback.json` | 8115 | `be1933e1aa5a6a93ff01617705c17d0b` | **20** | 2 | a **production read-back** (`{ok,data}` envelope). 11 of #1's 12 keys, **plus 9 more** |
| 5 | `C:/Users/dkreinov/g1-deploy2/live-readback.json` | 8115 | `be1933e1aa5a6a93ff01617705c17d0b` | **20** | 2 | **byte-identical to #4** |

**#4 and #5 are strictly worse than the file the design targets**: they were read from the live
service, they hold 20 of her words and two of her chapters, and neither appears in the D27 receipt
(`.oplan/word-polish/backup-receipt.txt` lists ten deletions; these five are none of them). Doing
only what E asks would leave **four** copies of her vocabulary on this machine and would let the
record say the job was done.

**Not hers, checked and cleared:** `C:/Users/dkreinov/trophies-val/sandbox/profile.json` and
`profile.backup.json` (5963 bytes, 15 word keys, **0 overlap** with hers, 0 chapters, 5 trophy
entries) are a synthetic test sandbox from the word-trophies run. `trophies-deploy/selftest/*.json`
and `polish-deploy/selftest/*.json` are the comparator's own `cat`/`dog` fixtures (2 words, 0
overlap). None of these is touched by this phase.

**How this was measured without printing one of her words:** the script read the sandbox file,
built the set of its 12 keys in memory, walked the candidate directories, and for each file printed
only `path | bytes | wordKeyCount | overlapCount`. No word of hers appears in this plan, in the
transcript of that command, or in any artifact this phase produces. That is the D27 receipt
discipline (*"paths, sizes, sha256 — never contents"*) applied at planning time.

**What this does to E:** deleting files that hold a child's only remaining data is an **owner
ruling**, never a planner's or an executor's — that is the standing D27 precedent, asked fresh each
time and never assumed. So E splits:

* **E-a (executable now, no ruling needed):** replace `english-app-sandbox/profile.json` with a
  synthetic fixture. This is a *replacement of a working file*, which the design authorises, and it
  is reversible for as long as #2 and #3 exist — so it destroys nothing unique.
* **E-b (BLOCKER B-F1-1, owner ruling required):** copies #2–#5. The step presents the receipt
  above and asks. The default, if no ruling arrives, is **keep and report** — never silent deletion.

---

## FINDING 2 — DEFECT D IS REAL, AND IT WAS REPRODUCED FROM THE SHIPPED MODULE

Not argued from source: the shipped `public/views/trophies.js` was imported into node and
`cardHtml` was called on a profile with 12 known words and `trophies: {}`.

```
TODAY, contradictory cards (12 known words, empty trophies): 1
   known  ->  card contains "trophy-card--locked"
              progress line reads "12 \u05de\u05ea\u05d5\u05da 5"   (metric 12, target 5)
```

That is field-guide 15(b) verbatim, and it is the same shape as the "12 out of 5 while greyed out"
the guide records from word-trophies. The mechanism, quoted from the file:

* `public/views/trophies.js:164` — `const earned = isPlainObject(trophies) ? trophies[trophy.id] : undefined;` — **STORED**
* `:165` — `const tier = tierOf(earned);` — **STORED**
* `:166` — `const layer = tier === null ? "trophy-card--locked" : ...` — the ring, from STORED
* `:167` — `const line = progressLine(trophy, profile, tier);` and `:158` —
  `return \`${trophy.metric(profile)} ${MITOCH} ${next}\`;` — the number is **LIVE**

Two sources, one card. The ring says "not yet", the number says "done". **The briefing's pointer to
`:100-114` names where the metrics are DEFINED, not where they disagree.**

**Why it self-clears and why it comes back:** `awardTrophies` (`lib/profile.js:698`) runs
server-side on the next profile write, stamps the missing tier, and the ring catches up. So the
window is "metric has passed the threshold, but she has not written since". Every new trophy, and
every threshold tuned downward, re-opens it.

---

## FINDING 3 — DEFECT C IS REAL, AND — THIS IS THE IMPORTANT PART — IT IS **EXECUTABLE IN NODE**

The reader has no DOM test today; every reader test is either a pure-function test or a
source-needle test, and field-guide 15 is explicit that source needles **fail open**. So before
planning C this planner checked whether the defect could be *run* rather than *read*.

**It can.** `tests/quiz-ui.test.js:67` already carries this repo's fake-container idiom:

```js
function fakeContainer() {
  return { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
}
```

`public/api.js` reaches the network only through the global `fetch`, and `storedCode()` is already
wrapped in a `try/catch` that returns `""` when `localStorage` is absent — so it works under node
untouched. `public/views/reader.js`'s `render()` therefore runs to completion in node against a
stubbed `fetch` and a container whose `innerHTML` is an accessor that **records every paint**.

Driven today against the **shipped, unmodified** `reader.js`:

```
FIRST ENTRY  paints=2
  [0]  storyDiv=false   <- the loading screen
  [1]  storyDiv=true    <- the chapter, after the /api/profile round-trip
RE-ENTRY     paints=2
  [0]  storyDiv=false   <- the loading screen AGAIN
  [1]  storyDiv=true    <- the chapter again, after ANOTHER round-trip
```

(`storyDiv` = the paint contains `class="reader-text"`.) That second block is defect C, measured:
**coming back from the dictionary blanks the chapter and makes her wait for the network before it
returns.** And `renderRoute` (`public/app.js:37-52`) does `app.innerHTML = ""` before calling the
view, so the document height collapses to nothing and the browser drops her to the top — which is
the "and I lost my place" half the design names.

**This changes the shape of the plan.** C's acceptance is not a source needle. It is:

> on a re-entry with an unchanged profile, `container.innerHTML` is assigned **exactly once**, and
> that one assignment already contains the story.

That single sentence kills both halves of the defect (no blank, no wait) and is executed, not read.
It is the strongest gate in this phase, and it exists only because the harness was looked for
before the plan was written.

---

## FINDING 4 — R4: THE ORCHESTRATOR DEFERRED A DECISION TO THIS DRAFT. HERE IS THE ANSWER.

`.oplan/word-finish/journal.md:53-59`, committed mid-plan, says:

> "**ORCHESTRATOR CORRECTION, logged because I told the owner the opposite.** I assessed R4 as NOT
> mergeable with phase 1's item C. That was wrong. C (the story reloads) and R4 (the answers come
> back blank) are TWO SYMPTOMS OF ONE MISSING MECHANISM: leaving the view destroys all state and
> nothing restores it. Phase 1's planner is designing that restore right now, so R4 belongs in
> phase 1, not in a phase of its own. **Decision deferred until the planner's draft lands: either
> amend phase 1 or add 1b, whichever its mechanism actually accommodates.**"

**THE ANSWER: this plan's mechanism accommodates HALF of R4 for free, and must not be stretched to
cover the other half. Recommendation — take the free half in phase 1, and give the rest its own
step, `1b`, on its own plan.**

R4 is two different losses that happen to look alike on screen:

| R4 half | what it is | does SK-F1-4 cover it? |
|---|---|---|
| **(i) within one page load** — she taps `המילים שלי`, then `הסיפור`, and her answered questions are blank again | `checkState` is a `const {}` inside `render()` (`:546`), and the router builds a new closure on every hashchange | **YES, COMPLETELY, AND AT NO EXTRA COST.** `checkState` is in the kept set (SK-F1-4(b)) precisely because C's first paint must be the screen she left. `doneAll` stays true, the quiz slot and the continue button stay put, and — a bonus the journal did not ask for — a re-answer no longer POSTs a duplicate `log-check` |
| **(ii) across a page load / app restart** — `story.checkLog` is written durably and **never read back** (`docs/growth.md:87-88` already said so) | the profile carries her answers and `boot()` ignores the field | **NO, AND DELIBERATELY NOT.** See below |

**Why (ii) must not be quietly folded in.** The journal itself names two traps, and neither is a
detail:

1. *"checkLog records only her FIRST attempt (`reader.js:712`). A naive restore strands a
   wrong-then-right question as permanently incomplete AND unreachable."* A question she got wrong
   first and right second is logged **wrong**. Restoring from that log would re-render it as
   answered-wrong forever, with its correct option already disabled — **worse than the blank slate
   she has today**, because today she can simply answer again.
2. *"checkLog can already contain duplicates from prior re-entries."* So the restore is not a
   lookup; it is a reduction over a log with unknown multiplicity, and the correct reduction rule
   is a **product decision** ("does her best attempt count, or her first?"), not a planner's.

There is a third reason the journal does not state: **(ii) reads a field of her live profile and
turns it into what the screen believes.** Every other item in this phase is display-only or
outside the repository. A wrong reduction rule would show her a chapter she cannot finish, and it
would do so from durable data rather than from memory that a reload clears. That is a different
risk class and it deserves its own fail-first evidence, its own fixtures, and its own owner ruling.

**What this plan therefore commits to, in words that can be checked:**

* Phase 1 **fixes R4(i)** and says so in the PLAIN PLAN, so the owner is not told "R4 is done".
* Phase 1 **does not touch `story.checkLog`**, does not read it, and adds no reduction rule.
  `§VAL-F1` proves the negative: `grep -c checkLog public/views/reader.js` must stay **0** — it is
  **0** today, measured.
* **CARRIED OBLIGATION F1-2** is written into `phase-state.md` at the close: *R4(ii) — reading
  `story.checkLog` back so her answers survive a page reload — is NOT delivered by phase 1. It
  needs a ruling on first-attempt-vs-best-attempt and a de-duplication rule, and it writes screen
  state from durable data. It is step 1b or a phase of its own.*
* Also recorded, unscheduled, from the same journal entry: the log POST *"swallows all failures
  silently (`reader.js:722-724`) and sets `st.logged = true` BEFORE the await — so a failed save is
  never retried and never surfaced."* **Phase 1 does not fix this either**, and must not claim to.
  Note the interaction, since nobody has: keeping `checkState` alive across a re-entry means a
  silently-failed save is now **less** visible than before, because the answer stays on screen for
  the whole sitting while the server has no record of it. That is not a regression this phase
  creates — the save already failed silently — but it is a consequence worth having in writing.

**AMENDMENT #1 (`design.md` §7, the owner's R7 rule) does not touch phase 1.** It is explicit that
the honest "sound not yet available" line grows **phase 2**, and that R4/R5/R6 are *"not folded into
phases 1-4"*. Read and confirmed; nothing in this plan implements or blocks it. The one thing worth
flagging forward: R7 needs a **new Hebrew string**, which is an owner gate, and this phase's
`§VAL-F1` pins the non-ASCII byte counts of both edited test files at 355 and 0, so no Hebrew can
drift in here by accident.

---

## GOAL, AND EXACTLY WHAT MOVES

**GOAL:** `public/views/trophies.js` gains one exported pure function, `displayTier`, and `cardHtml`
draws the ring **and** the progress line from that one value, so "greyed" and "target reached" stop
being simultaneously representable (**D**); `public/views/reader.js` gains a module-scope
per-sitting cache, two exported pure helpers and a scroll capture/restore, so returning from the
dictionary repaints the chapter she left, in her place, without waiting for the network, while
still re-fetching the profile every time (**C**); and
`C:/Users/dkreinov/english-app-sandbox/profile.json` is replaced by a synthetic fixture so her
vocabulary leaves the development sandbox (**E**). Plus the tests those need.

**WHAT DOES NOT MOVE, ALL PHASE:**

* **No `CACHE` bump.** `public/sw.js` is md5-frozen at `78fc3b0ac1d10de8a5baccb753eca33c`
  (`CACHE = "magic-vet-v20"` at `:1`). The single `v20` → `v21` bump is phase 4's, spent once.
  **Carried obligation, below.**
* `public/quiz.js` (`69b6d71117cf776715374abc6f0abb02`) and `public/quiz-core.js`
  (`9a2131be8b9d1b77c219f1e8c3482a71`) are QZ-18 frozen and do not move by one byte.
* `public/styles.css` does not move. **D adds no CSS**: the ring classes
  `trophy-card--locked|bronze|silver|gold` already exist and D only changes which one is chosen.
  So the contrast anchor stays **58** and no new colour token or contrast pair is added.
* `lib/`, `api/`, `data/`, `scripts/` are byte-untouched. **In particular `lib/profile.js`'s
  `awardTrophies` is not touched**: D is a display fix, not an awarding change, and awarding stays
  server-side only.
* `public/audio/words/index.json` does not move — phase 2 owns the clips.
* No file is created or deleted anywhere in the repository. `public/` stays at **2372** files.
* No deploy, no `vercel`, no `.env`, no request to production, no `GET /api/profile`, no money.

> **CARRIED OBLIGATION F1-1 — BOTH FILES THIS PHASE EDITS UNDER `public/` ARE PRECACHED.**
> `public/sw.js:2-18` lists `/views/reader.js` and `/views/trophies.js` in `PRECACHE` (verified by
> reading the file today). QZ-22 says a precached-file change ships a `CACHE` bump the same phase;
> this phase deliberately does not, on the briefing's explicit ruling, and it is safe **only
> because phase 1 does not deploy** — nothing reaches a phone, so no phone can serve a stale
> mixture. **Phase 4 MUST bump `CACHE` from `magic-vet-v20` to `magic-vet-v21` in `public/sw.js:1`
> and move the pin in `tests/shell.test.js` in the SAME step**, with the seam assertion of
> `.oplan/word-polish/plan.md` `§VAL-P3` (`:2392-2409`) so a half-applied bump fails loudly.
> Phase 1 must not close without this written into `.oplan/word-finish/phase-state.md`.
> **E adds nothing to this obligation: it touches no file inside the repository at all.**

---

## ACCEPTANCE CRITERIA (mechanical — all re-run at the phase close, step 1.6)

1. `npm test` exits 0 and prints `# tests 368`, `# fail 0`, and a top-level plan of `1..363`.
2. `APP_CODE=dummy npm test` exits 0 and prints the identical `# tests 368` / `# fail 0`.
3. Flat ledger: `grep -h -c '^test(' tests/*.js | awk '{s+=$1} END{print s+0}'` = **363**
   (355 measured today + 8 new: 3 in step 1.2, 3 in step 1.3, 2 in step 1.4).
   363 flat + **5** subtests in `tests/dev-server.test.js` = 368 reported. The 5 is measured
   (360 − 355 = 5), not assumed.
4. `node scripts/check-contrast.mjs` exits 0, prints `ALL PASS`, and `grep -c '^PASS'` over its
   output = **58** — the anchor does **not** move this phase. No colour token, no contrast pair,
   and `public/styles.css` is byte-frozen at `b6aa9c229ca269f39f468c60f50c45b4`.
5. `node scripts/check-quiz-bank.mjs` still prints `QUIZ BANK OK: 62 files, 84 items`.
6. `public/` file count is still exactly **2372**, and the digest of `public/` **outside** the two
   touchable paths is unchanged from the value §VAL-F1 pins. No path under `public/` is created or
   deleted.
7. Both transcripts diff EMPTY: `node .oplan/word-quiz/quiz-transcript.mjs` vs
   `.oplan/word-quiz/quiz-transcript-expected.txt`, and `node .oplan/word-g1/g1-transcript.mjs` vs
   `.oplan/word-g1/g1-transcript-expected.txt`.
8. `.data/profile.json` is absent, and no `profile-*.json` exists anywhere inside the repository.
9. Write set vs the phase base is exactly these **4** paths and nothing else:
   ```
    M public/views/reader.js
    M public/views/trophies.js
    M tests/reader-ui.test.js
    M tests/trophies-ui.test.js
   ```
   (0 created + 4 modified. `.oplan/` is the orchestrator record and is filtered out of every
   executor write set. **E appears in no write set at all — it is outside the repository.**)
10. **Zero files deleted**, and the total deleted-line budget across the whole phase is exactly
    **30**: `public/views/trophies.js` **1** (the `cardHtml` tier line) and `public/views/reader.js`
    **29** (8 declaration lines rebound to the kept sitting, 1 `draw()` header, and the 20-line
    `boot()` body replaced wholesale). **Arithmetic check: 1 + 29 = 30, and the per-step budgets
    are 0 (1.1) + 1 (1.2) + 29 (1.3) + 0 (1.4) + 0 (1.5) + 0 (1.6) = 30.** Both test files and
    step 1.4 are insert-only, with a deletion budget of **0**. **Every one of these 30 was counted
    on a simulated post-edit tree, not estimated** — see step 1.3.
11. Line endings unchanged in KIND for every touched file, byte-counted two ways (a `node` byte
    scan **and** `tr -dc '\r' < f | wc -c`), never `grep`, never `file`, never `git diff`. The
    kinds and the exact end-state counts are the SK-F1-1 table.
12. `tests/reader-ui.test.js` still carries exactly **355** raw non-ASCII bytes and
    `tests/trophies-ui.test.js` still carries **0**. No new Hebrew string enters the repository.
    Zero `describe(` blocks in either file — flat top-level `test()` only.
13. `public/quiz.js`, `public/quiz-core.js`, `public/sw.js`, `public/styles.css` and
    `public/audio/words/index.json` are all still at the md5s §VAL-F1 pins.
14. `git diff --name-only <BASE> -- lib api data scripts` is empty, and `awardTrophies(` still
    appears **zero** times anywhere under `public/`.
15. **E:** `C:/Users/dkreinov/english-app-sandbox/profile.json` has md5
    **`91eff5da59674d7463f462fad659534e`** (4385 bytes, LF-only, pure ASCII), parses,
    passes the shipped `validateProfile`, and its word-key set is exactly
    `candle,feather,garden,mirror,river,window`. **This is an absolute path outside the
    repository; see SK-F1-5 for exactly what that does and does not prove.**
16. **The composites have been looked at by a human** (step 1.5) and recorded: the trophy shelf
    under the fixed `displayTier`, and the reader returning from the dictionary on a real screen
    with a real scrollbar. No assertion in this plan claims to cover either.

---

## DEPENDS ON (every row verified on disk today, tree clean at `0c0f32a`)

| thing | file:line | verified |
|---|---|---|
| the design, all five items, the phasing and the non-goals | `.oplan/word-finish/design.md:1-133` | read in full |
| field guide, all 16 lessons | `.oplan/word-finish/field-guide/index.md` (`wc -l` = **149**) | read in full; 15 and 16 twice |
| the house plan SHAPE this plan matches | `.oplan/word-polish/plan.md:1588-1856` (phase-3 header / AC / depends), `:2319-2547` (`§VAL-P3`), `:2648-2843` (a full step), `:3612-3818` (stopping conditions, risks, blockers, record gaps, plain plan) | read |
| **the D seam**: ring from stored, number from live | `public/views/trophies.js:163-177`, `progressLine` at `:155-159`, `nextThreshold` at `:140-145`, `tierOf` at `:130-137` | read **and executed** |
| the view catalogue mirrors the engine, thresholds included | `public/views/trophies.js:98-115` vs `lib/profile.js:667-685`; pinned by `tests/trophies-ui.test.js:94` (deepStrictEqual) and `:112` (metric agreement over 8 fixtures) | read |
| the awarding engine only ever ADDS a tier and never lowers one | `lib/profile.js:698-720` | read |
| the ring classes already exist, so D needs no CSS | `public/views/trophies.js:166` emits `trophy-card--locked` / `--bronze` / `--silver` / `--gold`; `tests/trophies-ui.test.js:286` pins locked-vs-earned | read |
| the celebration reads STORED trophies only, and must keep doing so | `public/views/trophies.js:235-249` (`collectUncelebrated`), `:327-335` | read |
| the existing progress-line test, which D must not break | `tests/trophies-ui.test.js:223-256` | read; **D leaves `progressLine`, `tierOf` and `nextThreshold` byte-unchanged, so it passes untouched** |
| the existing locked-artwork test, which D could have broken | `tests/trophies-ui.test.js:286-300` — `t32KnownWords(5)` sets only `status`, so `taps`/`nominations`/timestamps are absent and only `known` reaches a threshold | **executed**: still passes under the fix |
| **the C entry path**: router clears `#app` then calls the view | `public/app.js:37-52`, listener at `:54-55` | read |
| `render()`'s per-mount closure state | `public/views/reader.js:370-390` (`profile`, `lemmas`, `knownSet`, `candidateSet`, `quizLemmasByChapter`, `askedThisSitting`), `:546-547` (`checkState`, `quizState`) | read |
| `boot()` and the round-trip that costs her the wait | `public/views/reader.js:391-410`, the fetch at `:395` | read **and executed** |
| the frozen merge line the tests pin **as a substring, not a line** | `public/views/reader.js:401-404`; `tests/reader-ui.test.js:204-236` uses `src.includes(needle)` | read — indentation is therefore not load-bearing, but this plan preserves it anyway |
| `chapterQuizState` is `deepStrictEqual`-pinned as exactly `{ started, done }` | `tests/reader-ui.test.js:189-201`; the literal is `public/views/reader.js:308` | read — **C adds no third key** |
| the one-array seam word-polish built (memo feeds both `lemmaCount` and `startQuiz`) | `public/views/reader.js:433-443`, `:617`, `:832` | read — **C does not clear the memo**; SK-F1-4(e) |
| the fake-container idiom this plan reuses | `tests/quiz-ui.test.js:66-68` | read **and executed against `reader.js`** |
| `api.js` reaches the network only through global `fetch`; `localStorage` already guarded | `public/api.js:3-9`, `:88-96` | read |
| `getAllowedSet` caches the manifest in a module-level `Set` for the life of the page | `public/words-index.js:12-25` | read |
| the page scrolls on `window` — there is no inner scroll container | `public/styles.css:37-56` (`body`), `:73-79` (`#app`), `:325-335` (`.bottom-nav` is `position: fixed`); the only `overflow: hidden` (`:290`) belongs to `.illustration` | read |
| `.chapter-banner` declares `aspect-ratio: 3 / 2`, so page height is stable before the image loads | `public/styles.css:379-390` | read — this is what makes a scroll restore land in the right place |
| the `PRECACHE` list containing both edited views | `public/sw.js:2-18` | read |
| the D27 receipt and the empty backups folder | `.oplan/word-polish/backup-receipt.txt`; `ls english-app-backups/` | read; folder is empty |
| the comparator's fixture builder, whose pattern E reuses | `C:/Users/dkreinov/polish-deploy/make-fixtures.js` | read |
| `defaultProfile` / `validateProfile`, which E builds from and checks against | `lib/profile.js:34-52`, `:53` | read **and executed** |

**Baseline measured, not trusted:** tree clean at `0c0f32a`; `npm test` → 360 reported / 355 flat /
0 fail / plan `1..355`; contrast 58 + `ALL PASS`; quiz bank 62/84; `public/` 2372 files, digest
`cf9dadcece84bd8245e1cd99f378ea51`.

**Nothing in phase 1 is already done**, measured today:
`grep -c displayTier public/views/trophies.js` = **0**;
`grep -c scroll public/views/reader.js` = **0**;
`grep -c 'let sitting' public/views/reader.js` = **0**;
`grep -c profileSignature public/views/reader.js` = **0**;
`english-app-sandbox/profile.json` still has md5 `e56c169fddf0ab2275fda3f98f5e3182`.
*(Note for an executor: plain `grep -c sitting public/views/reader.js` returns **3**, not 0 — the
word "sitting" already appears in three English comments, and `askedThisSitting` is capital-S.
That is why the absence check above is anchored on `let sitting`.)*

---

## SKELETON DECISIONS — every choice the briefing names, decided HERE

### SK-F1-1 — LINE ENDINGS, MEASURED TODAY, TWO WAYS, NEVER WITH `grep`

Field-guide lesson 16: `grep` cannot measure a line ending in this environment, in either
direction. Every value below was produced **twice** — by a `node` byte scan and independently by
`tr -dc '\r' < f | wc -c` vs `tr -dc '\n' < f | wc -c` — and the two methods agreed on every file.

| file | CRLF | bare LF | bytes | md5 | role this phase |
|---|---|---|---|---|---|
| `public/views/reader.js` | **857** | 0 | 28055 | `3b1ec3f25b442bb5a97fb511f4201a11` | **CRLF — MODIFIED (steps 1.3, 1.4)** |
| `public/views/trophies.js` | 0 | **368** | 16333 | `1c601eb05071edf7413d0d738067d1ea` | **LF — MODIFIED (step 1.2)** |
| `tests/reader-ui.test.js` | 0 | **511** | 21458 | `21f3ac826715b014962d824a8f85c948` | **LF — APPENDED (steps 1.3, 1.4)** |
| `tests/trophies-ui.test.js` | 0 | **1067** | 55229 | `d0ca049b9dfab39d0f61c787f5be313b` | **LF — APPENDED (step 1.2)** |
| `public/styles.css` | 729 | 0 | 17846 | `b6aa9c229ca269f39f468c60f50c45b4` | CRLF — must not move |
| `public/sw.js` | 51 | 0 | 1136 | `78fc3b0ac1d10de8a5baccb753eca33c` | CRLF — must not move (**no `CACHE` bump**) |
| `public/quiz.js` | 346 | 0 | 9136 | `69b6d71117cf776715374abc6f0abb02` | CRLF — QZ-18 frozen |
| `public/quiz-core.js` | 99 | 0 | 4197 | `9a2131be8b9d1b77c219f1e8c3482a71` | CRLF — frozen |
| `public/index.html` | 90 | 0 | 3737 | `9976fb94ccda6eb5aa86d90335103337` | CRLF — must not move |
| `public/app.js` | 0 | **67** | 1894 | `bfa3a8837a2fcdcd1c85502e5f1a86fb` | LF — **must not move: C is done inside the view, not the router** |
| `public/views/words.js` | 289 | 0 | 9072 | `a9966ea69c3ac12cbc6c7be876631e71` | CRLF — must not move |
| `public/words-index.js` | 0 | **25** | 886 | `19efa381a0dc68a957db8fcb2b9e6c96` | LF — must not move |
| `public/lemma.js` | 0 | **64** | 2496 | `cf2855f8470edfd7cfc0b47f99a15a09` | LF — must not move |
| `public/api.js` | 0 | **119** | 3125 | `4736d80e95644e47186bf7a306b35113` | LF — must not move |
| `tests/shell.test.js` | 0 | **96** | 3604 | `1e012cf1a349cdc67ebcbd6025be1180` | LF — must not move |
| `tests/quiz-ui.test.js` | 0 | **584** | 19068 | `be6b3fdb693c9fe92379946bed3da5f0` | LF — must not move |
| `tests/words-ui.test.js` | 0 | **272** | 11583 | `85891ee88471b2d2cd09e3c472663d6f` | LF — must not move |

**Three record notes.** `.oplan/word-polish/plan.md:1683` pins `public/views/reader.js` at **845**
CRLF / 27597 bytes and its `§VAL-P3` pins `tests/reader-ui.test.js` at **492** LF; today they are
**857** and **511**. Both are stale, not wrong — the long-press fix (`427c054`) landed after that
plan was written. `public/sw.js` is `78fc3b…` today, not the `d76f78…`/`6d8367…` of the polish run,
because `CACHE` is now `magic-vet-v20`. All three are logged in RECORD GAPS so that nobody
"corrects" this plan back to the older numbers — that is the exact failure mode field-guide
lesson 15's candidate (a) describes: *a correction can be the error.*

**FROZEN RULING.** Of the four files this phase edits, **one is CRLF** (`public/views/reader.js`)
and **three are LF**. `public/views/reader.js` must be edited **byte-preservingly** (python
`io.open(..., newline='')`, or an equivalent that writes bytes), never with `sed`/`awk`/a
line-oriented tool, and every step's validation byte-counts it. `core.autocrlf=true` and there is
no `.gitattributes` (both measured today), so `git diff` will normalise the damage away and show
you nothing.

### SK-F1-2 — D: THE SINGLE SOURCE OF TRUTH IS **ONE TIER PER CARD**, AND IT IS `displayTier`

**The decision.** `cardHtml` stops calling `tierOf(earned)` and calls a new exported pure function
`displayTier(trophy, profile, entry)`. Both the ring class **and** the progress line are then
derived from that one value. That is the whole fix: the card has one tier, so it cannot hold two
opinions.

`displayTier` returns the **higher** of

* **the stored tier** — `tierOf(entry)`, from `profile.trophies`, which the server stamps and never
  lowers; and
* **the live tier** — the highest threshold the current metric has passed.

**Why this and not the alternatives.** Four were considered:

| option | verdict |
|---|---|
| clamp the displayed number to the target (`Math.min(metric, next)`) | **rejected — this is patching the symptom**, which the design forbids by name. The two sources survive; only this one visible consequence is hidden |
| derive the ring from the LIVE metric alone | **rejected — it breaks never-regress.** `days` and `streak` are not monotonic, so a gold ring she had earned could be taken away. Taking a trophy back is the one thing `awardTrophies` is written never to do (`lib/profile.js:698-720`) |
| derive the number from the STORED tier alone (show nothing until stamped) | **rejected** — the card goes blank for a child who has just done the work, and there are still two sources, merely quieter |
| let the client award, so there is only one source | **rejected — the design's non-goal and standing policy**: awarding is server-side only, and `§VAL-F1` asserts `awardTrophies` appears zero times under `public/` |

**Why the invariant holds, stated as a property and then proved.** Because `displayTier` absorbs
every threshold the metric has passed, `nextThreshold(trophy, displayTier(...))` is always strictly
above the metric:

> **THE D INVARIANT — for every trophy `t`, every profile `p` and every stored entry `e`:**
> `nextThreshold(t, displayTier(t, p, e)) === null` **or**
> `t.metric(p) < nextThreshold(t, displayTier(t, p, e))`.

A card therefore can never display a target it has already reached. **Proved by sweep today**, on
the shipped module with the frozen function body pasted in: all 8 trophies × every metric from 0 to
`gold + 3` × 11 stored shapes (including `undefined`, `null`, `{}`, a lone `{gold}`, a string and a
number) = **6644 combinations; 0 invariant violations, 0 never-regress violations, and 0 cases
where the displayed tier fell below the live tier.**

**The one honest consequence, named rather than hidden.** The ring can now appear **slightly before
the server stamps it** — in the window between "the metric passed the threshold" and "she next
writes". Two things follow, both deliberate:

1. **The celebration keeps reading STORED trophies only** (`collectUncelebrated`, `:235-249`, is
   untouched), so the overlay still fires exactly when the server awards, never earlier. Driving
   the celebration from the live metric is **rejected**: a celebration is a promise, the server
   might not stamp what the client guessed, and a celebration that could be retracted is worse than
   one that arrives a moment late.
2. The shelf ring and the celebration therefore have different sources. That pair is answered
   explicitly in **THE THREE QUESTIONS (ii)** below: they cannot *contradict*, because the only
   reachable ordering is "ring first, celebration second", and neither ever asserts the other is
   wrong. The failure being closed — a greyed card announcing success — is unreachable in both.

**Scope.** `tierOf`, `nextThreshold` and `progressLine` are **byte-unchanged**, so
`tests/trophies-ui.test.js:211` and `:223` — which pin them in detail, including the never-regress
"lone gold" case — keep passing untouched. The deletion budget for the whole of D is **one line**.

### SK-F1-3 — THE BRIEFING'S LINE NUMBERS FOR D ARE OFF, AND AN EXECUTOR WOULD EDIT THE WRONG PLACE

The briefing says *"`public/views/trophies.js:100-114` computes the number LIVE from the profile
while the ring comes from STORED `profile.trophies`."* The substance is right; the address is not.
`:99-115` is the `TROPHY_VIEW` array literal, which **defines** the eight metrics and is pinned
byte-for-byte against `lib/profile.js:667-685` by a `deepStrictEqual` at
`tests/trophies-ui.test.js:94`. **Editing there would break that pin and would fix nothing.**

The seam is `cardHtml`, quoted verbatim from `public/views/trophies.js:163-167` (2-space indent):

```js
export function cardHtml(trophy, profile, trophies) {
  const earned = isPlainObject(trophies) ? trophies[trophy.id] : undefined;
  const tier = tierOf(earned);
  const layer = tier === null ? "trophy-card--locked" : `trophy-card--${tier}`;
  const line = progressLine(trophy, profile, tier);
```

`:165` is stored; `:167` reaches through `progressLine` (`:158`) to `trophy.metric(profile)`, which
is live. **Exactly one line is replaced, and it is `:165`.**

### SK-F1-4 — C: WHAT IS KEPT, WHAT IS REBUILT, THE SIGNAL, AND WHAT SHE SEES WHEN IT IS WRONG

The briefing requires five rulings. All are made here.

**(a) THE INVALIDATION SIGNAL IS `JSON.stringify(profile)` — THE WHOLE PROFILE, NOT A FIELD LIST.**

This is the decision where *easy* and *robust* happen to agree, which is worth saying out loud
because they usually do not.

The tempting alternative is to enumerate the fields the rendered chapter depends on — chapter
count, the last chapter's `text`/`title`/`questions`/`glossary`, `placement.completed`,
`learner.heroineName`, `learner.petName` — and compare those. **Rejected.** That list is
hand-maintained; the day someone renders a new field the list silently stops covering it and the
signal **under-invalidates**, which is the one direction that shows a child a stale story. It is
also the field guide's core failure shape: the check and the code written from the same mental
model at the same moment, so both encode the same omission and agree perfectly.

Serialising the whole profile **cannot** under-invalidate, by construction: `render()`'s output is a
function of `profile` and the kept closure state alone, so if the serialisation is identical the
HTML that would be produced is identical. There is no field for it to miss, because it reads all of
them. It is also one line instead of seven.

Its only failure direction is **over**-invalidation — two objects with equal content but different
key insertion order compare unequal. The cost of over-invalidating is one local redraw with no
network in it, which is strictly better than today. **The signal errs safe.**

`profileSignature` returns `null` if `JSON.stringify` throws (a cycle), and `null` is treated as
"changed". Failing towards a redraw is the safe direction.

**(b) WHAT IS KEPT ACROSS A RE-ENTRY** — one module-scope object, `sitting`, holding:

| kept | why it must be kept |
|---|---|
| `profile` | it is what the first paint is built from; keeping it is what removes the wait |
| `signature` | the serialisation of that profile, so the background fetch has something to compare against |
| `lemmas`, `knownSet`, `candidateSet` | derived from `profile` by `pickCandidateWords`/`pickQuizWords`, which **shuffle** (`quiz-core.js:26-29`). Recomputing would silently reorder her quiz. Keeping is cheaper *and* more faithful |
| `checkState` | her answers to the chapter's comprehension questions. **Not optional:** without it the first paint shows answered questions blank, `doneAll` flips false, and the quiz slot and continue button vanish — the repaint would not be the screen she left. Keeping it also stops a re-answer POSTing a duplicate `log-check`, a small pre-existing defect this happens to close |
| `quizState` | so a finished quiz stays finished (`done`) |
| `quizLemmasByChapter`, `askedThisSitting` | word-polish's D2 fix. `askedThisSitting` **is** "not the same four twice in a sitting", and a re-entry is not a new sitting |

**(c) WHAT IS REBUILT ON EVERY ENTRY**, without exception: the DOM (`container.innerHTML`, always
rebuilt from the kept data — cheap, local, and *not* what she waits for); `stage`, recomputed by the
existing `decideStage()` so no stale stage can be stored; `activePopup`, reset to `null` (she
navigated away — a word popup must not re-open by itself); `generating` and `genError`, reset to
false. `allowedWords` needs nothing: `getAllowedSet()` already caches the manifest in a module
`Set` (`words-index.js:12-25`).

**(d) THE ONE THING THAT MUST BE RESET INSIDE THE KEPT STATE, OR SHE IS STUCK.**
This is the trap in C, and a naive "keep everything" is a **dead end for the child**: `bindEvents`
(`:825-853`) calls `startQuiz` only when `chapterQuizState(quizState, n).started` is false. If
`quizState` survives with `started: true`, the re-entry renders `<div class="reader-quiz-slot">`
and then **never fills it** — an empty gap, no quiz, no "continue the story" button, and a green
test suite.

> **FROZEN RULING: on every re-entry, every chapter's `started` flag is set back to `false` while
> `done` is left alone.** The quiz restarts from question one, which is exactly what happens today,
> so this is not a regression — it is the price of keeping the rest. It is done by an exported pure
> function, `restartQuizzes(quizState)`, so a test can **execute** it rather than read for it.

**(e) THE MEMO IS NOT CLEARED, EVEN WHEN THE SIGNAL FIRES.** `quizLemmasByChapter` exists to make
`afterChapterStage`'s `lemmaCount` and `startQuiz`'s `lemmas` **the same array object**
(word-polish SK1-3(d)) — that is how they are prevented from disagreeing about how many questions
there are. Clearing it mid-sitting would hand a new array to a chapter whose quiz already received
the old one, re-opening exactly the seam word-polish closed. Words she saves while away are picked
up on the next page load. *Easy and robust agree again: doing less is also safer.*

**(f) THE FIRST PAINT AFTER RETURNING IS A FRESH DOM BUILT FROM THE CACHED PROFILE** — not a
stashed DOM node, and not a network-fresh profile. Stashing the DOM would require the router to
stop doing `app.innerHTML = ""` (`app.js:40`), i.e. changing a file all five routes depend on in
order to fix one. Rebuilding from the cached profile yields byte-for-byte the HTML she left — same
data, same kept state, same pure render — at zero network cost. **`public/app.js` is not touched by
this phase**, which is why it is on the must-not-move list in SK-F1-1.

**(g) THE PROFILE IS STILL RE-FETCHED, EVERY SINGLE TIME.** The design is explicit that the app
stays honest about state, and this plan does not cache the *fetch* — it caches the *paint*. The
round-trip still happens on every entry; it simply happens **behind** a screen she can already
read, instead of in front of a blank one.

**(h) WHAT SHE SEES WHEN THE SIGNAL IS WRONG — the question the briefing insists on.**

| case | what happens | what she sees |
|---|---|---|
| signal says "changed" when nothing meaningful did (**over-invalidation**) | the fresh profile is adopted and the view redraws once, locally | a repaint of the same screen, scroll re-applied, no network wait. **Strictly better than today** |
| signal says "unchanged" when something changed (**under-invalidation**) | — | **unreachable.** Equality of the full serialisation means the render input is identical. There is no subset of fields for it to miss. This is the whole reason the signal is total rather than a field list |
| the background fetch **fails** on a re-entry | the cached view is kept; `stage` is *not* set to `error` | she goes on reading the chapter she was already reading, and is not told. **A deliberate trade** — the alternative is replacing a story she is mid-way through with an error card because the network blinked. The staleness bound is one page-load, and nothing new can appear without an action of hers that itself needs the network |
| the background fetch fails on a **first** entry | unchanged from today: `stage = "error"` | the existing error card. C changes nothing here |
| the profile changed **on another device** while she was in the dictionary | the fetch lands, the signal fires, the view redraws | the correct current story one repaint later, under a second, with no blank screen in between |

**The dangerous direction is closed by construction, not by care:** the fetch always runs, and the
comparison covers the entire serialised profile.

**(i) SCROLL: CAPTURED CONTINUOUSLY, RESTORED AFTER THE FIRST PAINT.**
There is no unmount hook — `renderRoute` (`app.js:37-52`) tells a view nothing when it replaces it.
Two mechanisms were considered:

| option | verdict |
|---|---|
| a module-top `hashchange` listener in `reader.js` | it would fire **before** the router's, because `app.js:3` imports `reader.js` so `reader.js`'s module body runs first — provable from ESM evaluation order, and it captures the exact value at the exact instant. **Rejected anyway:** it makes the fix depend on an import-order argument that a later dynamic `import()` or a reordered import would break **silently**, restoring her to 0 with nothing failing. A fail-open dependency on evaluation order is not robust |
| **a passive `scroll` listener recording `window.scrollY` only while `location.hash === "#/reader"`** | **ACCEPTED.** No ordering dependency at all. The hash guard is the same source of truth the router itself uses (`app.js:20`), so scrolling the dictionary can never overwrite the reader's saved position — and by the time the router runs, the hash has already changed, so the collapse-to-zero scroll event that `app.innerHTML = ""` provokes is ignored |

Registered **once**, at module scope, behind `typeof window !== "undefined"` — the precedent is
`public/views/trophies.js:310` and `:319`, and that guard is what keeps `reader.js` importable in
node, which `tests/reader-ui.test.js` depends on in five separate tests.

Restoration is `window.scrollTo(0, y)` immediately after the first paint. It lands correctly
because `.chapter-banner` declares `aspect-ratio: 3 / 2` (`styles.css:384`), so the page height is
final before any image decodes. **Residual, stated honestly:** if the web font is still loading the
text can reflow a few pixels and she lands *near* her place rather than exactly on it. That is a
human-visible property and **no assertion in this plan claims it** — it belongs to step 1.5.

**(j) ONE GENUINELY NEW MOVING PART, DECLARED: THE MOUNT TOKEN.**
Everything above reuses something already proven in this repo. This does not, so it is called out
by name, as the briefing requires.

`renderRoute` hands **the same `#app` element** to every view (`app.js:39-51`); it only empties it.
So an in-flight async callback belonging to a view she has already left can still assign to
`container.innerHTML` and paint over whatever is now on screen. That is true today — leave the
reader mid-generation and `runGenerate`'s `draw()` clobbers the dictionary — but keeping state
across mounts widens the window and makes the consequences more confusing. The fix is a
module-level counter incremented on each `render()`; `draw()` returns early when this mount is no
longer the current one.

*Easy vs robust, stated:* the easy thing is to ignore it, since it is pre-existing. The robust
thing is four lines that make "only the mounted view may paint" **true** rather than merely usual.
**This plan takes the robust option** and pins it with a test, because C's whole premise is that
what is on screen is what the current mount put there.

### SK-F1-5 — E: WHAT THE FIXTURE IS, WHO MAKES IT, AND EXACTLY WHAT THE PROOF IS WORTH

**(a) The fixture, decided and already built in memory today.** It is generated from the **shipped**
`defaultProfile()` — never from a hand-copied literal — which is exactly the pattern
`C:/Users/dkreinov/polish-deploy/make-fixtures.js:1-8` uses and gives the reason for: *"so a schema
change can never leave the fixtures silently invalid."* On top of that: two English learner names,
`placement.completed = true`, six synthetic words, one hand-written chapter, `trophies: {}`.

Measured on the bytes this planner produced **in memory** (nothing was written):

```
bytes     = 4385
CR bytes  = 0          (LF-only)
LF bytes  = 175
non-ASCII = 0          (pure ASCII: no Hebrew authored, retyped or transported)
md5       = 91eff5da59674d7463f462fad659534e
sha256    = fa2ddcd02796c660750bcb191b7b7f4dfdc2e8f40a0cd2f47dee1eb8c995a25a
word keys = candle, feather, garden, mirror, river, window
validateProfile(fixture)                    -> OK   (the shipped one, executed)
overlap with her 12 sandbox word keys       -> 0
her keys appearing as ANY JSON string in it -> 0
```

All six words exist in `public/audio/words/index.json` (checked today), so the speaker button is
live for every one of them at the visual gate; none of the six is one of hers.

**(b) It is also the reproduction fixture for D — one artifact, two jobs.** Its counters are chosen
so that on the **unfixed** code exactly **two** cards contradict themselves and no others. Measured
today against the shipped `trophies.js`:

```
cards that reproduce defect D on this fixture TODAY: 2
   known    metric=5  bronze=5   ->  locked ring, line reads "5 <the progress word> 5"
   proven   metric=1  bronze=1   ->  locked ring, line reads "1 <the progress word> 1"
```

and the other six are legitimately below their bronze thresholds (`chapters` 1/5, `days` 1/3,
`streak` 1/2, `quizRight` 5/10, `quizzer` 10/20, `curious` 12/25). So step 1.5's human sees the
defect **and** its absence on the same screen, against an exact expected count: **2 before, 0
after.**

**(c) The chapter is long enough to scroll**, which is what makes the same fixture usable for C's
human gate: ~215 words of plain ASCII prose, two comprehension questions, and a five-entry glossary
whose words are a subset of the six word keys.

**(d) A deliberate, visible compromise: the glossary's Hebrew is an ASCII placeholder.** Entries are
`{ word, he }` and `he` is `"he-garden"`, `"he-river"`, and so on. Three reasons, in order of
weight: (1) **no Hebrew may be retyped**, and there is no per-word Hebrew anywhere in the repository
to extract from — `data/band1.json` and `data/band2.json` carry English `meaning` fields only,
checked today; (2) a **non-empty** `he` is what stops `findInGlossary` returning `null` and
`reader.js:761` firing `POST /api/translate`, which would be a network call **and a paid API call**
in a phase that must spend nothing; (3) it is unmistakably a fixture. **The visible consequence,
stated so step 1.5's human is not surprised: the word popup will show `he-garden` where Hebrew
belongs.** Correct for a sandbox, wrong for anything else.

**(e) Who generates it.** A script written to
`C:/Users/dkreinov/finish-fixture/make-sandbox-profile.js` — **outside the repository**, where this
project's out-of-repo artifact builders already live (`polish-deploy/make-fixtures.js`,
`trophies-art/build-trophy-names.js`). `scripts/` stays byte-frozen. The generator's full text is
quoted in step 1.1, so **this plan is its version control**, and the md5 above is what proves the
executor ran it rather than improvised.

**(f) EXACTLY WHAT THE PROOF IS WORTH — the briefing's question, answered without hedging.**

The file is at an **absolute path outside the repository**. Therefore:

* `git status`, `git diff`, the write-set assertions, the `public/` digest and the file-count gate
  are **all blind to it**. It appears in no write set and no commit. If someone restores her data
  there tomorrow, **no repository gate anywhere will notice** — not now, not ever.
* A gate *can* still check it, because a shell running in the repo can `md5sum` an absolute path.
  This plan adds exactly that to `§VAL-F1`. **But that assertion is machine-local**: true only on
  this laptop, it does not travel with the repository, and it protects nothing on any other
  machine. Claiming otherwise would be "existence is not effect" in a new costume.
* **The durable proof is byte-identity, not a word search.** A gate that grepped the sandbox for her
  twelve words would have to *contain* her twelve words — creating a thirteenth copy of the thing
  being removed, inside the repository. Instead the gate asserts md5 ==
  `91eff5da59674d7463f462fad659534e`. If it matches, the file **is** the fixture, so her words are
  definitionally absent. Stronger, and it leaks nothing.
* Because the dev server writes to this file during any visual gate, the md5 pin is a **two-state**
  assertion, exactly like word-polish's `CACHE`-bump seam: `SBSTATE` is `HER` (the pre-phase md5)
  or `FIXTURE` (the pinned md5), and anything else fails loudly. Step 1.1's tail pins `FIXTURE` and
  every step after it does the same. **A pristine copy is kept at
  `C:/Users/dkreinov/finish-fixture/sandbox-profile.json` and the sandbox is restored from it after
  the visual gate** — the lesson-11 recipe, unchanged.

**(g) The single-run receipt.** Her word keys can only be compared against the file *before* it is
overwritten, so the generator does it in one process: read the old file, build the key set in
memory, write the new file, re-read it, and print **only counts and digests** — never a word. That
is the D27 receipt discipline (*"paths, sizes, sha256 — never contents"*) applied to the thing it
was invented for.

### SK-F1-6 — NO `CACHE` BUMP, AND WHAT THAT COSTS

Both files this phase changes under `public/` are in `PRECACHE` (`public/sw.js:2-18`, read today:
`/views/reader.js` at `:13`, `/views/trophies.js` at `:15`). QZ-22 requires a bump in the same
phase; the briefing overrides it and defers the single `v20` → `v21` to phase 4. **That is safe
only because phase 1 does not deploy** — nothing reaches a phone, so no phone can serve a stale
mixture. `§VAL-F1` pins `public/sw.js` at `78fc3b0ac1d10de8a5baccb753eca33c` for the whole phase,
so an executor who "helpfully" bumps it fails loudly. The obligation is **carried, not
discharged** — CARRIED OBLIGATION F1-1 above.

---

## §VAL-F1 — THE FROZEN VALIDATION PREAMBLE

**Deliver this to any executor as a FILE, never inline in a JSON packet** — backslashes have
collapsed in transit twice in this project's history. **Every step's validation is ONE script =
§VAL-F1 verbatim + that step's tail, in the SAME file.** A child `bash` cannot supply `fail`,
`$RC`, `$PORC`, `$TOTAL` or `$SBSTATE` to a tail, so a tail invoked as a separate process exits 0
unconditionally — the silent-pass class.

**THE `.oplan` FILTER IS `awk '$NF !~ /^\.oplan\//'`.** Count the backslash bytes in your copy:
there are exactly **two**, one before the `.` and one before the `/`. A collapsed copy is a bash
**syntax error**, which makes the whole gate exit 0 and pass everything.
`.oplan/word-trophies/plan.md:989` carries such a collapsed copy. Never copy that line.

It hard-codes every number this phase does not move (contrast anchor, quiz bank, `public/` count
and digest, the frozen md5s, the must-not-move endings). The three that DO move — the reported
total, the plan number and the flat ledger — stay in variables and are asserted in each step's
tail. The sandbox profile, which legitimately has two values during this phase, is modelled as an
explicit **two-state machine**, the same shape word-polish used for the `CACHE` bump.

**`console.log(String(n))`, never `console.log(n)`.** This planner **reproduced the colour bug live
today**: a `node -e` that printed a count through `util.inspect` emitted
`` `[33m12[39m` `` in this very shell. A gate that pins a count and forgets `String()` fails on a
perfectly correct tree, for a reason that depends on the executor's terminal. Every count below is
stringified.

```bash
#!/usr/bin/env bash
set -o pipefail
cd C:/Users/dkreinov/claude/english-app || { echo "FAIL: cannot cd to the repo"; exit 1; }
RC=0
fail() { echo "FAIL: $*"; RC=1; }

# --- APP_CODE must NOT exist in this shell (lesson 3: a leak silently 401s the whole suite) ---
if [ -n "${APP_CODE:-}" ]; then fail "APP_CODE is set in this shell -- it may only ever live inside the frozen capture subshell"; fi

# --- this run writes to finish-*, NEVER into a previous run's directory ---
WD="$HOME/finish-val"; mkdir -p "$WD"
case "$WD" in *trophies-deploy*|*polish-deploy*|*trophies-val*|*polish-val*) fail "the work dir resolves into a PREVIOUS run's directory: $WD";; esac

# --- suite (plain). TOTAL/PLAN/FAILED move per step: asserted in each tail ---
OUT="$(npm test 2>&1)"; STAT=$?
case "$STAT" in 0) ;; *) fail "npm test exited $STAT";; esac
TOTAL="$(printf '%s\n' "$OUT" | sed -n 's/^# tests \([0-9][0-9]*\).*$/\1/p')"
FAILED="$(printf '%s\n' "$OUT" | sed -n 's/^# fail \([0-9][0-9]*\).*$/\1/p')"
PLAN="$(printf '%s\n' "$OUT" | sed -n 's/^1\.\.\([0-9][0-9]*\).*$/\1/p')"

# --- suite (gated) ---
GOUT="$(APP_CODE=dummy npm test 2>&1)"; GSTAT=$?
case "$GSTAT" in 0) ;; *) fail "APP_CODE=dummy npm test exited $GSTAT";; esac
GTOTAL="$(printf '%s\n' "$GOUT" | sed -n 's/^# tests \([0-9][0-9]*\).*$/\1/p')"
GFAILED="$(printf '%s\n' "$GOUT" | sed -n 's/^# fail \([0-9][0-9]*\).*$/\1/p')"

# --- flat ledger ---
FLAT="$(grep -h -c '^test(' tests/*.js | awk '{s+=$1} END{print s+0}')"

# --- contrast: there is NO 'npm run contrast'; the gate is the script itself. The anchor does not move ---
CON="$(node scripts/check-contrast.mjs 2>&1)"; CSTAT=$?
case "$CSTAT" in 0) ;; *) fail "check-contrast exited $CSTAT";; esac
PASSES="$(printf '%s\n' "$CON" | grep -c '^PASS')"
case "$PASSES" in 58) ;; *) fail "contrast anchor must stay 58 all phase, got '$PASSES'";; esac
case "$CON" in *"ALL PASS"*) ;; *) fail "check-contrast did not print ALL PASS";; esac

# --- the quiz bank does not move: phase 3 owns the items ---
QB="$(node scripts/check-quiz-bank.mjs 2>&1)"; QBSTAT=$?
case "$QBSTAT" in 0) ;; *) fail "check-quiz-bank exited $QBSTAT";; esac
case "$QB" in *"QUIZ BANK OK: 62 files, 84 items"*) ;; *) fail "the quiz bank moved: $QB";; esac

# --- public/ file count: NOTHING is created or deleted under public/ this phase ---
PUBN="$(node -e 'const fs=require("fs"),path=require("path");let n=0;(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);if(fs.statSync(f).isDirectory())walk(f);else n++;}})("public");console.log(String(n));')"
case "$PUBN" in 2372) ;; *) fail "public/ file count must stay 2372 all phase, got '$PUBN'";; esac

# --- public/ OUTSIDE the two paths this phase may touch is byte-frozen (no backslashes: lesson 8) ---
PUBX="$(node -e 'const fs=require("fs"),path=require("path"),crypto=require("crypto");const SKIP=new Set(["public/views/reader.js","public/views/trophies.js"]);const out=[];(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);const p=f.split(path.sep).join("/");if(fs.statSync(f).isDirectory())walk(f);else if(!SKIP.has(p))out.push(p+" "+crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex"));}})("public");console.log(String(out.length)+" "+crypto.createHash("md5").update(out.join(String.fromCharCode(10))).digest("hex"));')"
case "$PUBX" in "2370 261589c089e0b2c924038ec8a22d879e") ;; *) fail "public/ moved outside the two touchable paths: expected '2370 261589c089e0b2c924038ec8a22d879e', got '$PUBX'";; esac

# --- QZ-18 frozen ---
QMD5="$(md5sum public/quiz.js | cut -d' ' -f1)"
case "$QMD5" in 69b6d71117cf776715374abc6f0abb02) ;; *) fail "public/quiz.js moved: $QMD5 (QZ-18 frozen)";; esac
QCMD5="$(md5sum public/quiz-core.js | cut -d' ' -f1)"
case "$QCMD5" in 9a2131be8b9d1b77c219f1e8c3482a71) ;; *) fail "public/quiz-core.js moved: $QCMD5 (QZ-18 frozen)";; esac

# --- the service worker does NOT move: the CACHE bump is spent once, in phase 4 ---
SWMD5="$(md5sum public/sw.js | cut -d' ' -f1)"
case "$SWMD5" in 78fc3b0ac1d10de8a5baccb753eca33c) ;; *) fail "public/sw.js moved: $SWMD5 -- there is NO CACHE bump in this phase";; esac

# --- D adds no CSS, so the stylesheet and therefore the contrast anchor cannot move ---
CSSMD5="$(md5sum public/styles.css | cut -d' ' -f1)"
case "$CSSMD5" in b6aa9c229ca269f39f468c60f50c45b4) ;; *) fail "public/styles.css moved: $CSSMD5 -- this phase adds no CSS";; esac

# --- C is done inside the view, never in the router ---
APPMD5="$(md5sum public/app.js | cut -d' ' -f1)"
case "$APPMD5" in bfa3a8837a2fcdcd1c85502e5f1a86fb) ;; *) fail "public/app.js moved: $APPMD5 -- C must not touch the router";; esac

# --- the audio manifest is the speaker button's source of truth; phase 2 owns the clips ---
MANMD5="$(md5sum public/audio/words/index.json | cut -d' ' -f1)"
case "$MANMD5" in 8735a3c499508b04415046e2be4ad159) ;; *) fail "the audio manifest moved: $MANMD5 -- phase 2 owns the clips, not phase 1";; esac

# --- the untouched neighbours of the two edited views ---
IDXMD5="$(md5sum public/index.html | cut -d' ' -f1)"
case "$IDXMD5" in 9976fb94ccda6eb5aa86d90335103337) ;; *) fail "public/index.html moved: $IDXMD5";; esac
WVMD5="$(md5sum public/views/words.js | cut -d' ' -f1)"
case "$WVMD5" in a9966ea69c3ac12cbc6c7be876631e71) ;; *) fail "public/views/words.js moved: $WVMD5";; esac
WIMD5="$(md5sum public/words-index.js | cut -d' ' -f1)"
case "$WIMD5" in 19efa381a0dc68a957db8fcb2b9e6c96) ;; *) fail "public/words-index.js moved: $WIMD5";; esac
LEMMD5="$(md5sum public/lemma.js | cut -d' ' -f1)"
case "$LEMMD5" in cf2855f8470edfd7cfc0b47f99a15a09) ;; *) fail "public/lemma.js moved: $LEMMD5";; esac
APIMD5="$(md5sum public/api.js | cut -d' ' -f1)"
case "$APIMD5" in 4736d80e95644e47186bf7a306b35113) ;; *) fail "public/api.js moved: $APIMD5";; esac

# --- E: the dev sandbox is a TWO-STATE thing and must never be anything else ---
# --- HER  = the pre-phase file, which holds a child's real vocabulary
# --- FIXT = the synthetic fixture step 1.1 writes (md5 computed by the planner in memory)
SBF="C:/Users/dkreinov/english-app-sandbox/profile.json"
if [ ! -e "$SBF" ]; then SBSTATE=MISSING; fail "the dev sandbox profile is missing entirely: $SBF"; else
  SBMD5="$(md5sum "$SBF" | cut -d' ' -f1)"
  case "$SBMD5" in
    e56c169fddf0ab2275fda3f98f5e3182) SBSTATE=HER ;;
    91eff5da59674d7463f462fad659534e) SBSTATE=FIXTURE ;;
    *) SBSTATE=UNKNOWN; fail "the dev sandbox profile is in neither known state: $SBMD5 -- it may have been written by a dev server and not restored";;
  esac
fi

# --- the server does not move this phase ---
SRV="$(git diff --name-only HEAD -- lib api data scripts)"
case "$SRV" in "") ;; *) fail "lib/ api/ data/ or scripts/ changed, which phase 1 must never do: $SRV";; esac

# --- awarding stays server-side only: D is a DISPLAY fix ---
CLIENTAWARD="$(grep -rl 'awardTrophies' public/ | wc -l | tr -d ' ')"
case "$CLIENTAWARD" in 0) ;; *) fail "awardTrophies appears under public/ -- awarding is server-side only";; esac

# --- both transcripts must diff EMPTY ---
node .oplan/word-quiz/quiz-transcript.mjs > "$WD/qz.out" 2>&1 || fail "quiz-transcript.mjs exited non-zero"
QZ="$(diff "$WD/qz.out" .oplan/word-quiz/quiz-transcript-expected.txt)"
case "$QZ" in "") ;; *) fail "QZ-21 transcript moved";; esac
node .oplan/word-g1/g1-transcript.mjs > "$WD/g1.out" 2>&1 || fail "g1-transcript.mjs exited non-zero"
G1="$(diff "$WD/g1.out" .oplan/word-g1/g1-transcript-expected.txt)"
case "$G1" in "") ;; *) fail "G1 transcript moved";; esac
rm -f "$WD/qz.out" "$WD/g1.out"

# --- NOT ONE BYTE OF HER PROFILE MAY EXIST INSIDE THE REPOSITORY ---
if [ -e .data/profile.json ]; then fail ".data/profile.json exists -- a local write leaked"; fi
STRAY="$(find . -path ./node_modules -prune -o -name 'profile-*.json' -print | head -5)"
case "$STRAY" in "") ;; *) fail "a capture file is inside the repo: $STRAY";; esac

# --- line endings are LAW and git normalises them away (field guide lessons 4 and 16) ---
ENDS="$(node -e 'const fs=require("fs");const out=[];for(const f of process.argv.slice(1)){if(!fs.existsSync(f)){out.push(f+" MISSING");continue;}const b=fs.readFileSync(f);let c=0,l=0;for(let i=0;i<b.length;i++){if(b[i]===10){if(i>0&&b[i-1]===13)c++;else l++;}}out.push(f+" CRLF="+String(c)+" LF="+String(l));}console.log(out.join("; "));' public/views/reader.js public/views/trophies.js public/app.js public/styles.css public/sw.js public/index.html public/quiz.js public/quiz-core.js public/views/words.js public/words-index.js public/lemma.js public/api.js tests/reader-ui.test.js tests/trophies-ui.test.js tests/shell.test.js tests/quiz-ui.test.js tests/words-ui.test.js)"
echo "ENDINGS: $ENDS"
case "$ENDS" in *"public/app.js CRLF=0 LF=67"*)               ;; *) fail "public/app.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/styles.css CRLF=729 LF=0"*)          ;; *) fail "public/styles.css endings moved: $ENDS";; esac
case "$ENDS" in *"public/sw.js CRLF=51 LF=0"*)                ;; *) fail "public/sw.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/index.html CRLF=90 LF=0"*)           ;; *) fail "public/index.html endings moved: $ENDS";; esac
case "$ENDS" in *"public/quiz.js CRLF=346 LF=0"*)             ;; *) fail "public/quiz.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/quiz-core.js CRLF=99 LF=0"*)         ;; *) fail "public/quiz-core.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/views/words.js CRLF=289 LF=0"*)      ;; *) fail "public/views/words.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/words-index.js CRLF=0 LF=25"*)       ;; *) fail "public/words-index.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/lemma.js CRLF=0 LF=64"*)             ;; *) fail "public/lemma.js endings moved: $ENDS";; esac
case "$ENDS" in *"public/api.js CRLF=0 LF=119"*)              ;; *) fail "public/api.js endings moved: $ENDS";; esac
case "$ENDS" in *"tests/shell.test.js CRLF=0 LF=96"*)         ;; *) fail "tests/shell.test.js endings moved: $ENDS";; esac
case "$ENDS" in *"tests/quiz-ui.test.js CRLF=0 LF=584"*)      ;; *) fail "tests/quiz-ui.test.js endings moved: $ENDS";; esac
case "$ENDS" in *"tests/words-ui.test.js CRLF=0 LF=272"*)     ;; *) fail "tests/words-ui.test.js endings moved: $ENDS";; esac
# reader.js is the ONE CRLF file this phase edits, so its CR count is cross-checked a SECOND way
# with the only form field-guide lesson 16 trusts. The two numbers must agree.
RDCR="$(tr -dc '\r' < public/views/reader.js | wc -c | tr -d ' ')"
RDLF="$(tr -dc '\n' < public/views/reader.js | wc -c | tr -d ' ')"
case "$RDCR" in "$RDLF") ;; *) fail "public/views/reader.js is MIXED, which is a defect: CR=$RDCR LF=$RDLF";; esac

# --- no NEW Hebrew may enter the repository: the two edited test files are byte-pinned ---
NAR="$(node -e 'const b=require("fs").readFileSync("tests/reader-ui.test.js");let n=0;for(const x of b) if(x>127) n++;console.log(String(n));')"
case "$NAR" in 355) ;; *) fail "tests/reader-ui.test.js raw non-ASCII moved from 355 to $NAR -- no new Hebrew is allowed this phase";; esac
NAT="$(node -e 'const b=require("fs").readFileSync("tests/trophies-ui.test.js");let n=0;for(const x of b) if(x>127) n++;console.log(String(n));')"
case "$NAT" in 0) ;; *) fail "tests/trophies-ui.test.js has $NAT raw non-ASCII bytes -- Hebrew must be backslash-u escapes";; esac
NEST="$(grep -h -c 'describe(' tests/reader-ui.test.js tests/trophies-ui.test.js | awk '{s+=$1} END{print s+0}')"
case "$NEST" in 0) ;; *) fail "$NEST describe() blocks appeared -- flat top-level test() only";; esac

# --- nothing deleted, ever ---
GONE="$(git diff --diff-filter=D --name-only HEAD)"
case "$GONE" in "") ;; *) fail "files were deleted in the worktree: $GONE";; esac

# --- computed here, ASSERTED in each step's tail (a step that is mid-edit is legitimately dirty) ---
PORC="$(git status --porcelain -uall | awk '$NF !~ /^\.oplan\//' | LC_ALL=C sort)"   # .oplan is the orchestrator record, never the executor write set

echo "VAL-F1: TOTAL=$TOTAL PLAN=$PLAN FAILED=$FAILED GTOTAL=$GTOTAL GFAILED=$GFAILED FLAT=$FLAT PASSES=$PASSES PUBN=$PUBN PUBX='$PUBX' SB=$SBSTATE"
```

Per-step tails continue from here with their own `case` assertions on `$TOTAL`, `$PLAN`, `$FAILED`,
`$GTOTAL`, `$GFAILED`, `$FLAT`, `$ENDS`, `$SBSTATE`, `$PORC`, and end with `exit $RC`.

**Note on `$PUBX`:** measured today at `2370 261589c089e0b2c924038ec8a22d879e` — 2372 files minus
the two touchable paths. It is a REAL invariant (2370 = 2372 − 2), not a tautology: it covers all
2254 audio clips and the manifest, all 62 quiz-bank items, the nine trophy webps, `sw.js`,
`index.html`, `app.js`, `api.js`, `lemma.js`, `words-index.js`, `quiz.js`, `quiz-core.js`, every
other view, `styles.css`, `manifest.webmanifest` and every icon.

### THIS PREAMBLE WAS EXTRACTED BACK OUT OF THIS FILE AND RUN TODAY — 156 lines, exit 0

Not described and not hand-simulated. The block above was pulled out of **this document** by

```bash
awk '/^## .VAL-F1/{s=1} s&&/^```bash$/{c=1;next} c&&/^```$/{exit} c{print}' FINISH-P1-DRAFT.md
```

and executed from that extraction against the clean tree at `0c0f32a`. That closes the failure mode
where a plan's copy of a frozen script differs from the copy that actually worked. Its complete
stdout on a clean pass — two lines and nothing else:

```
ENDINGS: public/views/reader.js CRLF=857 LF=0; public/views/trophies.js CRLF=0 LF=368; public/app.js CRLF=0 LF=67; public/styles.css CRLF=729 LF=0; public/sw.js CRLF=51 LF=0; public/index.html CRLF=90 LF=0; public/quiz.js CRLF=346 LF=0; public/quiz-core.js CRLF=99 LF=0; public/views/words.js CRLF=289 LF=0; public/words-index.js CRLF=0 LF=25; public/lemma.js CRLF=0 LF=64; public/api.js CRLF=0 LF=119; tests/reader-ui.test.js CRLF=0 LF=511; tests/trophies-ui.test.js CRLF=0 LF=1067; tests/shell.test.js CRLF=0 LF=96; tests/quiz-ui.test.js CRLF=0 LF=584; tests/words-ui.test.js CRLF=0 LF=272
VAL-F1: TOTAL=360 PLAN=355 FAILED=0 GTOTAL=360 GFAILED=0 FLAT=355 PASSES=58 PUBN=2372 PUBX='2370 261589c089e0b2c924038ec8a22d879e' SB=HER
```

The backslash count in the extracted `.oplan` filter was measured on the extraction itself:
`grep 'NF !~' … | tr -dc '\\' | wc -c` = **2**. It survived the round trip.

**`SB=HER` is the correct reading BEFORE step 1.1** — the sandbox still holds her vocabulary at
planning time. From step 1.1 onward every tail must read `SB=FIXTURE`.

### IT WAS ALSO SEEN TO FAIL — AND DOING SO FOUND A REAL DEFECT IN IT

A copy with five expectations mutated (`$PUBX`, `$SWMD5`, **both** sandbox md5 literals, and
`public/app.js`'s endings) printed exactly the right four `FAIL:` lines — four, not five, because
breaking both sandbox literals collapses into the single `neither known state` failure, which is
correct behaviour:

```
FAIL: public/ moved outside the two touchable paths: expected '2370 deadbeef…', got '2370 261589c0…'
FAIL: public/sw.js moved: 78fc3b0ac1d10de8a5baccb753eca33c -- there is NO CACHE bump in this phase
FAIL: the dev sandbox profile is in neither known state: e56c169f… -- it may have been written by a dev server and not restored
FAIL: public/app.js endings moved: …
VAL-F1: … SB=UNKNOWN
```

> **⚠ AND IT EXITED **0** WHILE PRINTING ALL FOUR.**
>
> This is field-guide lesson 9 landing on this very plan, caught only because the script was
> executed instead of read. **The preamble deliberately has no `exit $RC` — the tail supplies it —
> so §VAL-F1 run on its own is a REPORT, not a GATE, and its exit status is meaningless.** An
> executor who runs §VAL-F1 alone "just to check the tree" will be told everything is fine no matter
> how broken the tree is.
>
> **THE RULE, therefore, and it is not optional:** every step's script is `§VAL-F1` verbatim **plus
> that step's tail in the same file**, and every tail ends with `exit $RC`. Verified today:
> with `exit $RC` appended, the clean copy exits **0** and the mutated copy exits **1**.
> A step that reports "VAL-F1 passed" without a tail has proved nothing.

---

## FROZEN CONTRACTS — quoted, in force for every step of this phase

From `.oplan/word-finish/design.md:120-123` (non-goals):
> "No change to `public/quiz.js` or `public/quiz-core.js` (QZ-18 frozen). No run-time generation of
> anything. No new voice or TTS engine. No re-recording of existing clips. **No change to the
> awarding engine, the celebration, or the placement flow.** No new Hebrew string without the
> owner's sign-off. No deploy until every gate and both owner gates … have passed."

From `.oplan/word-finish/design.md:93-95` (C):
> "keep the app honest about state — do **not** simply cache the profile. Re-fetch, but do not throw
> the rendered chapter away when nothing that affects it has changed. The planner decides the exact
> invalidation signal and **must state what happens when the signal is wrong** (stale story on
> screen is a worse failure than a slow one). Restore her scroll position too."

From `.oplan/word-finish/design.md:103-105` (D):
> "one source of truth per card. The card's displayed state must be derived so that 'greyed' and
> 'target reached' are **not simultaneously representable** — not patched so that the current case
> happens to look right. A test must pin that the impossible combination cannot render."

From the briefing:
> "**NO `CACHE` bump in this phase.** The single `v20` → `v21` bump belongs to phase 4, spent once."

**The strings a step may need and must never retype — quoted from their source files:**

* `public/views/trophies.js:165`, verbatim, **2 leading spaces** — the ONE line D replaces:
  `  const tier = tierOf(earned);`
* `public/views/trophies.js:145`, verbatim, no leading space — the anchor D inserts after:
  `}`  *(the closing brace of `nextThreshold`. **Identify it by the two lines immediately above it,
  never by the brace alone** — verified today:
  `:143` = `  if (tier === "bronze") return trophy.silver;` and
  `:144` = `  return trophy.bronze;`)*
* `public/views/reader.js:8`, verbatim, no leading space — the anchor C's module block inserts after:
  `const CHAPTER_BANNERS = { 0: "chapter-night", 1: "chapter-clinic", 2: "chapter-forest" };`
* `public/views/reader.js:403`, verbatim, **6 leading spaces**, and it **must survive this phase
  byte-identical** because `tests/reader-ui.test.js:210` pins it as a substring:
  `      lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));`
* `public/views/reader.js:308`, verbatim — `chapterQuizState`'s literal, `deepStrictEqual`-pinned at
  `tests/reader-ui.test.js:189`, so **no third key may be added to it**:
  `  if (!quizState[n]) quizState[n] = { started: false, done: false };`

**Tooling warning, re-measured today:** Git Bash's `sed` reads a CRLF file in text mode, so
`sed -n '403p' public/views/reader.js | cat -A` prints `$`, not `^M$`. **Do not use `sed`, `awk` or
any line-oriented tool to EDIT `public/views/reader.js`.** Use a byte-preserving writer (python
`io.open(..., newline='')`) and verify with the byte counter in §VAL-F1. The anchors above were read
with `fs.readFileSync` and an explicit `\r\n` split, which is why they are trustworthy.

---

# STEP 1.1 — E: her vocabulary leaves the sandbox, and the four other copies are put to the owner

**GOAL:** `C:/Users/dkreinov/english-app-sandbox/profile.json` is replaced by the synthetic fixture
frozen in SK-F1-5; a pristine copy and a contents-free receipt are written outside the repository;
and the four **other** copies of her data found today are presented to the owner with a receipt and
a question. **Not one byte inside the repository changes.**

**WHY THIS IS FIRST:** every later step in this phase may start a dev server against that sandbox.
Doing E first means no dev server in this run ever touches a file containing a child's real
vocabulary. It is also the only step with no repository dependency, so it cannot be blocked.

**TIER:** WORKER. **DEPENDS ON:** nothing.

**FILES:**
* `C:/Users/dkreinov/english-app-sandbox/profile.json` — **REPLACED** (outside the repo)
* `C:/Users/dkreinov/finish-fixture/make-sandbox-profile.js` — CREATED (outside the repo)
* `C:/Users/dkreinov/finish-fixture/sandbox-profile.json` — CREATED, the pristine copy (outside the repo)
* `C:/Users/dkreinov/finish-fixture/receipt.txt` — CREATED (outside the repo)
* **repository write set: EMPTY.**

**THE GENERATOR, verbatim.** Write it to `C:/Users/dkreinov/finish-fixture/make-sandbox-profile.js`
and run it with `node`. It reads the old file first, keeps her keys only in memory, and prints
counts and digests but never a word.

```js
// word-finish step 1.1. Builds the synthetic dev-sandbox profile from the SHIPPED
// defaultProfile(), never from a hand-copied literal -- so a schema change can never
// leave the fixture silently invalid (the polish-deploy/make-fixtures.js precedent).
//
// D27 RECEIPT DISCIPLINE: this script may print paths, byte counts, digests and COUNTS.
// It must never print a word from the file it is replacing.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { pathToFileURL } = require("url");

const REPO = "C:/Users/dkreinov/claude/english-app";
const SANDBOX = "C:/Users/dkreinov/english-app-sandbox/profile.json";
const OUTDIR = "C:/Users/dkreinov/finish-fixture";
const PRISTINE = path.join(OUTDIR, "sandbox-profile.json");
const RECEIPT = path.join(OUTDIR, "receipt.txt");

const T0 = "2026-07-01T00:00:00.000Z";

const TEXT = "Ellie walked into the garden before the sun came up. The grass was cold and wet, and a small white feather lay on the path. She picked it up and held it to the light. Sparkle came running after her, jumping over the little stones by the gate. Together they followed the path down to the river. The water moved slowly and made a soft sound. On the far bank there was an old window leaning against a tree, with no wall around it at all. Ellie looked through the window and saw the same garden, but everything in it was silver. Sparkle barked once. Ellie turned around and saw a candle burning on a flat stone, though there was no wind and no one there. Next to the candle someone had left a small round mirror, face down. She turned the mirror over very carefully. In it she did not see her own face. She saw the garden at night, full of small blue lights, and a door she had never noticed before standing open behind the tree. Ellie put the feather in her pocket. She looked at Sparkle, and Sparkle looked back at her. Then they walked together toward the door, and the candle went out behind them without a sound.";

import(pathToFileURL(REPO + "/lib/profile.js").href).then((m) => {
  // 1. READ THE OLD FILE FIRST. Her keys exist only in this variable, in this process.
  const oldBuf = fs.readFileSync(SANDBOX);
  const oldKeys = Object.keys(JSON.parse(oldBuf.toString("utf8")).words || {});
  const oldSha = crypto.createHash("sha256").update(oldBuf).digest("hex");
  const oldMd5 = crypto.createHash("md5").update(oldBuf).digest("hex");

  // 2. BUILD THE FIXTURE from the shipped defaultProfile().
  const word = (over) => Object.assign({
    status: "known", source: "tap", he: null, taps: 2,
    firstSeen: T0, lastSeen: T0, quizRight: 1, quizWrong: 1, nominations: 0,
  }, over || {});

  const p = m.defaultProfile(T0);
  p.learner.heroineName = "Ellie";
  p.learner.petName = "Sparkle";
  p.placement.completed = true;
  p.placement.completedAt = T0;
  p.placement.task1 = { score: 4, band: 1 };
  p.placement.task2 = { score: 4, band: 1 };
  p.words = {
    river: word({ nominations: 1 }),
    garden: word(),
    window: word(),
    candle: word(),
    feather: word(),
    mirror: word({ status: "learning" }),
  };
  p.story.chapters = [{
    n: 1,
    generatedAt: T0,
    title: "The Silver Garden",
    text: TEXT,
    questions: [
      { id: "c1q1", prompt: "What did Ellie find on the path?", options: ["a feather", "a coin", "a key"], correctIndex: 0 },
      { id: "c1q2", prompt: "What was on the flat stone?", options: ["a candle", "a lamp", "a book"], correctIndex: 0 },
    ],
    glossary: [
      { word: "garden", he: "he-garden" },
      { word: "feather", he: "he-feather" },
      { word: "river", he: "he-river" },
      { word: "candle", he: "he-candle" },
      { word: "mirror", he: "he-mirror" },
    ],
  }];
  p.story.summarySoFar = "Ellie and Sparkle found a silver garden.";
  p.story.cliffhanger = "A door stood open behind the tree.";
  p.meta.updatedAt = T0;

  // 3. WRITE. Explicit utf8 bytes, LF only -- JSON.stringify emits no CR.
  const out = JSON.stringify(p, null, 1);
  const buf = Buffer.from(out, "utf8");
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(PRISTINE, buf);
  fs.writeFileSync(SANDBOX, buf);

  // 4. RE-READ BOTH AND PROVE. Nothing is asserted about bytes that were not read back.
  const back = fs.readFileSync(SANDBOX);
  const backPr = fs.readFileSync(PRISTINE);
  const md5 = crypto.createHash("md5").update(back).digest("hex");
  const sha = crypto.createHash("sha256").update(back).digest("hex");
  let cr = 0, lf = 0, na = 0;
  for (let i = 0; i < back.length; i++) {
    if (back[i] === 13) cr++;
    if (back[i] === 10) lf++;
    if (back[i] > 127) na++;
  }
  const backJson = JSON.parse(back.toString("utf8"));
  let valid = "OK";
  try { m.validateProfile(backJson); } catch (e) { valid = "THREW: " + e.message; }

  const newKeys = Object.keys(backJson.words);
  let overlap = 0;
  for (const k of newKeys) if (oldKeys.indexOf(k) >= 0) overlap++;
  let residue = 0;
  const backText = back.toString("utf8");
  for (const k of oldKeys) if (backText.indexOf("\"" + k + "\"") >= 0) residue++;

  const lines = [
    "word-finish step 1.1 -- dev sandbox de-identification receipt",
    "generated " + new Date().toISOString(),
    "",
    "REPLACED  " + SANDBOX,
    "  before  bytes=" + String(oldBuf.length) + " md5=" + oldMd5 + " sha256=" + oldSha + " wordKeys=" + String(oldKeys.length),
    "  after   bytes=" + String(back.length) + " md5=" + md5 + " sha256=" + sha + " wordKeys=" + String(newKeys.length),
    "  after   CR=" + String(cr) + " LF=" + String(lf) + " nonASCII=" + String(na),
    "  after   wordKeys=" + newKeys.slice().sort().join(",") + "   (synthetic, invented by the plan)",
    "  validateProfile(after) -> " + valid,
    "  overlap(before.wordKeys, after.wordKeys) = " + String(overlap) + "   MUST BE 0",
    "  before-keys still present as a JSON string in after = " + String(residue) + "   MUST BE 0",
    "  pristine copy " + PRISTINE + " identical to sandbox = " + String(Buffer.compare(back, backPr) === 0),
    "",
    "NO WORD FROM THE REPLACED FILE APPEARS IN THIS RECEIPT, BY CONSTRUCTION.",
  ];
  fs.writeFileSync(RECEIPT, lines.join("\n") + "\n");
  console.log(lines.join("\n"));

  if (md5 !== "91eff5da59674d7463f462fad659534e") { console.log("STOP: md5 is not the value the plan froze"); process.exit(1); }
  if (cr !== 0 || na !== 0 || overlap !== 0 || residue !== 0 || valid !== "OK") { console.log("STOP: a receipt assertion failed"); process.exit(1); }
  console.log("STEP-1.1-FIXTURE-OK");
});
```

**THIS GENERATOR WAS EXTRACTED BACK OUT OF THIS DOCUMENT AND RUN TODAY**, with `SANDBOX` and
`OUTDIR` redirected to a temporary directory holding a **copy** of the sandbox file, so the real one
was never written. It produced, from the text above and nothing else:

```
  before  bytes=4783 md5=e56c169fddf0ab2275fda3f98f5e3182 sha256=c0fc3f72… wordKeys=12
  after   bytes=4385 md5=91eff5da59674d7463f462fad659534e sha256=fa2ddcd0… wordKeys=6
  after   CR=0 LF=175 nonASCII=0
  after   wordKeys=candle,feather,garden,mirror,river,window   (synthetic, invented by the plan)
  validateProfile(after) -> OK
  overlap(before.wordKeys, after.wordKeys) = 0   MUST BE 0
  before-keys still present as a JSON string in after = 0   MUST BE 0
  pristine copy … identical to sandbox = true
STEP-1.1-FIXTURE-OK
```

and the real sandbox file was re-checked afterwards and is still `e56c169f…`, untouched. **So the
md5 this plan freezes is not an aspiration: it is what the quoted text actually emits.**

**COMMANDS:**
```bash
cd C:/Users/dkreinov/claude/english-app
node C:/Users/dkreinov/finish-fixture/make-sandbox-profile.js
md5sum C:/Users/dkreinov/english-app-sandbox/profile.json   # must be 91eff5da59674d7463f462fad659534e
# COMMIT (orchestrator, at acceptance -- .oplan record only, no source change):
#   "step 1.1: E -- the dev sandbox holds a synthetic fixture, not her vocabulary; four other
#    copies found and put to the owner; ledger 355 flat / 360 reported (unchanged)"
```

**MANDATED FAIL-FIRST (run BEFORE the step is accepted; restore after; record each observed line
verbatim — a mutation that does not fail is a STOP):**

* **M1.1a — the two-state sandbox clause must be able to fire.** After the generator has run, append
  one byte to `C:/Users/dkreinov/english-app-sandbox/profile.json`. §VAL-F1 must print
  **`FAIL: the dev sandbox profile is in neither known state: <md5> -- it may have been written by a
  dev server and not restored`** and, with the tail's `exit $RC`, exit **1**. Restore by copying
  `finish-fixture/sandbox-profile.json` over it; re-run; `SB=FIXTURE`, exit 0.
  *(This is the cry-wolf control for the whole of E: it proves the only mechanical protection this
  out-of-repo file has can actually raise an alarm.)*
* **M1.1b — the generator's own residue check must be able to fire.** Run the generator a second
  time against a scratch copy in which one of the synthetic word keys has been renamed to a string
  the "before" file also contains. `residue` must print non-zero and the script must
  `STOP: a receipt assertion failed` with exit 1. *(Proves the "her words are gone" claim is a
  measurement, not a formatting exercise.)*

**FROZEN VALIDATION:** §VAL-F1 verbatim, then, in the SAME file:
```bash
case "$SBSTATE" in FIXTURE) ;; *) fail "the dev sandbox must hold the synthetic fixture after step 1.1, got SB=$SBSTATE";; esac
case "$TOTAL"   in 360) ;; *) fail "step 1.1 adds no test: expected 360 reported, got '$TOTAL'";; esac
case "$PLAN"    in 355) ;; *) fail "expected top-level plan 1..355, got '1..$PLAN'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL"  in 360) ;; *) fail "APP_CODE=dummy: expected 360, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"    in 355) ;; *) fail "step 1.1 adds no test: expected 355 flat, got '$FLAT'";; esac
case "$ENDS" in *"public/views/reader.js CRLF=857 LF=0"*)     ;; *) fail "reader.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"public/views/trophies.js CRLF=0 LF=368"*)   ;; *) fail "trophies.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"tests/reader-ui.test.js CRLF=0 LF=511"*)    ;; *) fail "reader-ui.test.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"tests/trophies-ui.test.js CRLF=0 LF=1067"*) ;; *) fail "trophies-ui.test.js must be untouched this step: $ENDS";; esac
# the fixture, asserted from the repo shell by ABSOLUTE PATH -- see SK-F1-5(f) for what this is worth
SBSIZE="$(node -e 'console.log(String(require("fs").statSync("C:/Users/dkreinov/english-app-sandbox/profile.json").size));')"
case "$SBSIZE" in 4385) ;; *) fail "the fixture must be 4385 bytes, got '$SBSIZE'";; esac
SBKEYS="$(node -e 'const p=JSON.parse(require("fs").readFileSync("C:/Users/dkreinov/english-app-sandbox/profile.json","utf8"));console.log(Object.keys(p.words).sort().join(","));')"
case "$SBKEYS" in "candle,feather,garden,mirror,river,window") ;; *) fail "the sandbox word keys are not the synthetic set: '$SBKEYS'";; esac
PRIST="$(md5sum C:/Users/dkreinov/finish-fixture/sandbox-profile.json | cut -d' ' -f1)"
case "$PRIST" in 91eff5da59674d7463f462fad659534e) ;; *) fail "the pristine copy is wrong or missing: $PRIST";; esac
if [ ! -e C:/Users/dkreinov/finish-fixture/receipt.txt ]; then fail "the receipt was not written"; fi
# THE REPOSITORY MUST NOT HAVE MOVED AT ALL
case "$PORC" in "") ;; *) fail "step 1.1 must change nothing inside the repository. got:
$PORC";; esac
exit $RC
```

**NON-GOALS:** no repository change of any kind; **no deletion of any of the four other copies** —
that is BLOCKER B-F1-1 and the owner's call alone; no dev server started; no `git commit` of
anything outside `.oplan/`; no printing of any word from the replaced file, in the receipt, the
transcript or the packet.

---

# STEP 1.2 — D: one tier per card, so "greyed" and "target reached" cannot both be true

**GOAL:** `public/views/trophies.js` gains one exported pure function, `displayTier`, and
`cardHtml`'s single stored-tier line is replaced so that the ring **and** the progress line come
from that one value. `tests/trophies-ui.test.js` gains three flat tests, one of which is an
exhaustive sweep asserting the contradiction is unrepresentable rather than merely absent today.
`tierOf`, `nextThreshold`, `progressLine`, the celebration path and `TROPHY_VIEW` are all
byte-unchanged. **No CSS**, no new colour, no contrast pair, no `CACHE` bump.

**TIER:** WORKER. **DEPENDS ON:** step 1.1 (only so that `SB=FIXTURE` holds; no code dependency).

**FILES (exhaustive), with measured endings:**
* `public/views/trophies.js` — MODIFY (**LF**, 0/368 today). One insert + one line replaced.
  **1 deletion.**
* `tests/trophies-ui.test.js` — MODIFY (**LF**, 0/1067). Append only, **0 deletions**. 3 flat tests.

**EDIT 1 — `public/views/trophies.js`, insert immediately AFTER line 145** (the closing brace of
`nextThreshold`; identify it by `:143`/`:144` as quoted in FROZEN CONTRACTS). The inserted block is
one blank line followed by the comment and the function:

```js

// D (word-finish). THE ONE TIER A CARD IS DRAWN FROM.
//
// Until this function existed, cardHtml read the ring from STORED profile.trophies
// and the number from the LIVE metric, so the two could disagree -- and did.
// Measured on the shipped module before the fix: a profile with twelve known words
// and an empty trophies map rendered the 'known' card with trophy-card--locked
// while its progress line read "12 <the progress word> 5". That is the seam
// between two correct parts (field guide 15b), and it is the defect the owner
// reported.
//
// The fix is NOT to clamp the number. It is to give the card ONE tier and derive
// both the ring and the line from it, so the contradiction is not representable.
//
// displayTier is the HIGHER of:
//   * the tier the server has already stamped -- never-regress, because a stored
//     tier is never lowered even when the metric falls (days and streak are not
//     monotonic), and
//   * the tier the live metric currently justifies.
//
// Because it absorbs every threshold the metric has passed, the invariant
//     metric < nextThreshold(trophy, displayTier(trophy, profile, entry))
// holds for every trophy, every metric and every stored shape, so a card can
// never show a target it has already reached. That is asserted by sweep, not by
// argument: tests/trophies-ui.test.js drives all eight trophies over every metric
// from 0 to gold+3 against eleven stored shapes.
//
// AWARDING IS NOT TOUCHED. This is a display decision only; lib/profile.js
// awardTrophies remains the only thing that ever writes a tier, and the
// celebration still reads STORED trophies alone, so nothing is ever celebrated
// that the server has not stamped.
export function displayTier(trophy, profile, entry) {
  const stored = tierOf(entry);
  const metric = trophy.metric(profile);
  let live = null;
  for (const tier of TROPHY_TIERS_VIEW) {
    if (metric >= trophy[tier]) live = tier;
  }
  if (stored === null) return live;
  if (live === null) return stored;
  return TROPHY_TIERS_VIEW.indexOf(live) > TROPHY_TIERS_VIEW.indexOf(stored) ? live : stored;
}
```

**EDIT 2 — `public/views/trophies.js:165`.** Replace, verbatim (2 leading spaces):
```js
  const tier = tierOf(earned);
```
with
```js
  const tier = displayTier(trophy, profile, earned);
```
Nothing else in `cardHtml` changes. `:166` and `:167` already read `tier`, which is the entire
point: **one value, two uses — not two values.**

**EDIT 3 — APPEND to `tests/trophies-ui.test.js`** exactly these **3** flat tests, names FROZEN, no
`describe(`, no raw non-ASCII byte (the file must stay at 0):

1. `'no trophy card can ever show a metric that has reached its displayed target'` — the sweep, and
   the test that makes the contradiction **unrepresentable rather than absent**. Import
   `TROPHY_VIEW`, `displayTier`, `nextThreshold`, `tierOf`. For each of the eight trophies, for
   every metric value from `0` to `trophy.gold + 3`, synthesise a profile that produces exactly that
   metric, and for each of the eleven stored shapes `undefined`, `null`, `{}`, `{bronze}`,
   `{bronze,silver}`, `{bronze,silver,gold}`, `{gold}`, `{silver}`, `{silver,gold}`,
   `'notanobject'`, `42`, assert **all three** properties:
   (a) `next === null || metric < next` — the D invariant;
   (b) the displayed tier is never **below** `tierOf(stored)` — never-regress;
   (c) the displayed tier is never **below** the tier the live metric justifies — the defect itself.
   Assert the number of combinations checked is **exactly 6644**, so a synthesiser that silently
   stops producing cases cannot make this test vacuous.
2. `'cardHtml draws the ring and the progress line from the same single tier'` — the seam assertion.
   Build the profile that reproduces the defect (five known words, `trophies: {}`), call
   `cardHtml` for every trophy, and for each card assert: if it contains `trophy-card--locked`
   then its `trophy-progress` line, parsed back into `metric` and `target`, has
   `metric < target`; and if it contains `trophy-card--bronze|silver|gold` the same holds or the
   line is absent (gold). Then assert directly that `cardHtml` produces **no** card that is both
   locked and at-or-past its target — the one-line form of the whole defect.
3. `'the fix is display-only: awarding, the celebration and the catalogue are untouched'` —
   read `public/views/trophies.js` as text and assert it still contains
   `export function tierOf(entry) {`, `export function nextThreshold(trophy, tier) {` and
   `export function progressLine(trophy, profile, tier) {`; that `collectUncelebrated` still reads
   `profile.trophies` and contains **no** `displayTier`; that the file contains **no**
   `awardTrophies`; and that `uncelebrated(profileWithMetricPastBronzeButNoStoredTier)` returns
   `[]` — i.e. **passing a threshold does not, by itself, celebrate anything.**

**COMMANDS:**
```bash
cd C:/Users/dkreinov/claude/english-app
node --check public/views/trophies.js
node scripts/check-contrast.mjs | grep -c '^PASS'   # must still print 58
npm test
APP_CODE=dummy npm test
# COMMIT (orchestrator, at acceptance): "step 1.2: D -- one tier per card; a greyed trophy can no
#  longer say target reached; 6644-combination sweep; ledger 358 flat / 363 reported"
```

**MANDATED FAIL-FIRST (run BEFORE the commit; restore after each; record each observed failure line
verbatim — a mutation that does not fail is a STOP):**

* **M1.2a — THE SEEN-TO-FAIL THAT MATTERS MOST: write test 1 and test 2 FIRST, against the
  UNFIXED `cardHtml`.** Both must fail, and test 2's message must name `known` as a card that is
  locked while at its target. Only then apply Edits 1 and 2. *(This is the difference between a
  test that pins a fix and a test that was written to agree with it — field guide 15's root cause.
  The defect was already reproduced by this planner, so an executor who cannot make these two tests
  fail on the unfixed code has written the wrong test, and that is a STOP.)*
* **M1.2b** — change `displayTier`'s last line to `return stored;` (ignore the live tier). Test 1
  must fail on property (c) and test 2 must fail. Restore. *(Proves the live half is load-bearing.)*
* **M1.2c** — change `displayTier`'s last line to `return live;` (ignore the stored tier). Test 1
  must fail on property (b), **never-regress**. Restore. *(Proves the stored half is load-bearing,
  and that the fix cannot take a trophy away.)*
* **M1.2d** — revert Edit 2 only, leaving `displayTier` defined but unused. Test 2 must fail while
  test 1 still passes. Restore. *(Field guide 15a, exactly: a correct function that nothing calls
  is the "existence is not effect" failure, and this mutation proves the test observes the CARD and
  not merely the function.)*
* **M1.2e** — delete one trophy from the sweep's iteration. Test 1 must fail on the
  **6644** combination count. Restore. *(Proves the sweep cannot go vacuous.)*

**FROZEN VALIDATION:** §VAL-F1 verbatim, then, in the SAME file:
```bash
case "$SBSTATE" in FIXTURE) ;; *) fail "the dev sandbox must still hold the fixture, got SB=$SBSTATE";; esac
case "$TOTAL"   in 363) ;; *) fail "expected 363 reported tests, got '$TOTAL'";; esac
case "$PLAN"    in 358) ;; *) fail "expected top-level plan 1..358, got '1..$PLAN'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL"  in 363) ;; *) fail "APP_CODE=dummy: expected 363, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"    in 358) ;; *) fail "expected 358 flat tests, got '$FLAT'";; esac
case "$ENDS" in *"public/views/trophies.js CRLF=0 LF=410"*) ;; *) fail "trophies.js must stay LF-only and gain exactly 42 lines: $ENDS";; esac
case "$ENDS" in *"tests/trophies-ui.test.js CRLF=0 "*)      ;; *) fail "trophies-ui.test.js must stay LF-only: $ENDS";; esac
case "$ENDS" in *"public/views/reader.js CRLF=857 LF=0"*)   ;; *) fail "reader.js must be untouched this step: $ENDS";; esac
case "$ENDS" in *"tests/reader-ui.test.js CRLF=0 LF=511"*)  ;; *) fail "reader-ui.test.js must be untouched this step: $ENDS";; esac
DELS="$(git diff --numstat HEAD -- public/views/trophies.js | awk '{s+=$2} END{print s+0}')"
case "$DELS" in 1) ;; *) fail "this step's deletion budget is exactly 1 (the cardHtml tier line), got '$DELS'";; esac
ZERODEL="$(git diff --numstat HEAD -- tests/trophies-ui.test.js | awk '{s+=$2} END{print s+0}')"
case "$ZERODEL" in 0) ;; *) fail "trophies-ui.test.js must be append-only, got $ZERODEL deletions";; esac
# the ONE definition, and the ONE call site
DEFN="$(grep -c 'export function displayTier' public/views/trophies.js)"
case "$DEFN" in 1) ;; *) fail "expected exactly one displayTier definition, got '$DEFN'";; esac
CALLS="$(grep -c 'displayTier(trophy, profile, earned)' public/views/trophies.js)"
case "$CALLS" in 1) ;; *) fail "expected exactly one displayTier call site, got '$CALLS'";; esac
OLDCALL="$(grep -c 'const tier = tierOf(earned);' public/views/trophies.js)"
case "$OLDCALL" in 0) ;; *) fail "the old stored-only tier line is still in cardHtml";; esac
# the untouched neighbours, quoted not named
for NEEDLE in 'export function tierOf(entry) {' 'export function nextThreshold(trophy, tier) {' 'export function progressLine(trophy, profile, tier) {'; do
  N="$(grep -c "$NEEDLE" public/views/trophies.js)"
  case "$N" in 1) ;; *) fail "the frozen function '$NEEDLE' moved (count $N)";; esac
done
# the celebration must NOT have learned about displayTier
CELEB="$(sed -n '/function collectUncelebrated/,/^}/p' public/views/trophies.js | grep -c displayTier)"
case "$CELEB" in 0) ;; *) fail "collectUncelebrated now mentions displayTier -- the celebration must stay stored-only";; esac
EXPECT=' M public/views/trophies.js
 M tests/trophies-ui.test.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```
*(`$PORC` is the pre-commit expectation. The `LF=410` pin was **measured, not computed**: the block
above was extracted back out of this document by `awk`, counted at **42** lines, inserted after
line 145 of a copy of `trophies.js`, the `cardHtml` line replaced, and the result byte-counted —
`CRLF=0 LF=410, 18469 bytes`, `node --check` OK. 368 + 42 = 410 is the arithmetic check, not the
source. **The planner's first hand-count of this block was 38 and was wrong; that is exactly why it
was simulated. If an executor's byte counter disagrees, that is a STOP, not a fix.**)*

**NON-GOALS:** no CSS, no colour token, no contrast pair; no change to `TROPHY_VIEW`, `tierOf`,
`nextThreshold`, `progressLine`, `collectUncelebrated`, `uncelebrated`, `maybeCelebrateTrophy` or
`render`; no change to `lib/profile.js`; no touch of `public/views/reader.js` or any test file other
than `tests/trophies-ui.test.js`; **no claim that the shelf looks right** — that is step 1.5's, and
only a human's.

---

# STEP 1.3 — C: coming back from the dictionary repaints the chapter she left, with no wait

**GOAL:** `public/views/reader.js` gains a module-scope per-sitting cache plus two exported pure
helpers (`profileSignature`, `restartQuizzes`) and a mount token, so a re-entry paints the story
**once**, immediately, from kept state — while still re-fetching `/api/profile` every time.
`tests/reader-ui.test.js` gains three flat tests, one of which **executes `render()` in node** and
counts paints. **No scroll work in this step** (that is 1.4), no router change, no `checkLog`.

**TIER:** WORKER — but a careful one. This is the largest diff in the phase.
**DEPENDS ON:** steps 1.1 and 1.2 (committed, so their files are clean).

**FILES (exhaustive), with measured endings:**
* `public/views/reader.js` — MODIFY (**CRLF**, 857/0 today, 28055 bytes). **29 deletions.**
  End state, measured on a simulated post-edit tree: **CRLF=910, LF=0, 30573 bytes.**
  **MUST be edited byte-preservingly** (python `io.open(..., newline='')`). `sed`/`awk` will
  silently destroy the CRLFs and `git diff` will not show it.
* `tests/reader-ui.test.js` — MODIFY (**LF**, 0/511). Append only, **0 deletions**. 3 flat tests.

**THIS ENTIRE EDIT WAS SIMULATED AND EXECUTED BY THE PLANNER**, on a copy outside the repository,
before being written down. The numbers below are measurements of that simulation, not estimates:

```
SIMULATED post-C reader.js: CRLF=910 LF=910 bytes=30573   (was CRLF=857 bytes=28055)
lines replaced (deletion budget) = 29
node --check: OK

FIRST ENTRY      paints=2  story-in-paint0=false  fetches=1     <- unchanged from today
RE-ENTRY same    paints=1  story-in-paint0=TRUE   fetches=1     <- THE FIX
RE-ENTRY changed paints=2  story-in-paint0=TRUE   fetches=1     <- no blank screen, new chapter lands
RE-ENTRY offline paints=2  story-in-paint0=TRUE   errorCardShown=false
profileSignature stable=true  detects-a-change=true
restartQuizzes -> {"1":{"started":false,"done":true},"2":{"started":false,"done":false}}
```

**Read that table as the specification.** `RE-ENTRY same paints=1` is the whole of defect C:
one paint, containing the story, with the profile still fetched.

**EDIT 1 — module scope, insert immediately AFTER `public/views/reader.js:8`** (the
`CHAPTER_BANNERS` line quoted in FROZEN CONTRACTS). A blank line, then:

```js
// C (word-finish). ONE SITTING'S READER STATE. The router (public/app.js:37-52)
// does app.innerHTML = "" and calls the view again on every hashchange, so leaving
// for the dictionary and coming back built a brand-new closure, refetched the
// profile, and painted a loading screen while she waited. Measured before the fix:
// on a re-entry the FIRST paint contained no story at all.
//
// The profile is STILL refetched on every entry -- this caches the PAINT, not the
// FETCH. The refetch simply happens behind a screen she can already read.
let sitting = null;

// Only the mounted view may paint. renderRoute hands the SAME #app element to every
// view, so an in-flight callback from a view she has already left can otherwise
// overwrite whatever is on screen now.
let mountSeq = 0;

// The invalidation signal is the WHOLE serialised profile, never a list of fields.
// A hand-maintained field list silently stops covering a field the day someone
// renders a new one, and THAT failure direction shows a child a stale story.
// Comparing everything cannot under-invalidate; at worst it over-invalidates, which
// costs one local redraw and no network. A throw returns null, treated as changed.
export function profileSignature(profile) {
  try {
    return JSON.stringify(profile);
  } catch (err) {
    return null;
  }
}

// On a re-entry the quiz must be able to run again. bindEvents only calls startQuiz
// when `started` is false, so a kept quizState with started:true would render an
// empty quiz slot and never fill it -- no quiz, no continue button, green suite.
export function restartQuizzes(quizState) {
  if (!quizState || typeof quizState !== "object") return quizState;
  for (const key of Object.keys(quizState)) {
    const entry = quizState[key];
    if (entry && typeof entry === "object") entry.started = false;
  }
  return quizState;
}
```

**EDIT 2 — eight one-for-one line replacements** (8 deletions), each quoted exactly:

| replace (verbatim, with its indent) | with |
|---|---|
| `  let profile = null;` | `  const kept = sitting;` + `  const myMount = ++mountSeq;` + `  let profile = kept ? kept.profile : null;` |
| `  let lemmas = [];` | `  let lemmas = kept ? kept.lemmas : [];` |
| `  let knownSet = new Set();` | `  let knownSet = kept ? kept.knownSet : new Set();` |
| `  let candidateSet = new Set();` | `  let candidateSet = kept ? kept.candidateSet : new Set();` |
| `  const quizLemmasByChapter = {};` | `  const quizLemmasByChapter = kept ? kept.quizLemmasByChapter : {};` |
| `  const askedThisSitting = new Set();` | `  const askedThisSitting = kept ? kept.askedThisSitting : new Set();` |
| `  const checkState = {};` | `  const checkState = kept ? kept.checkState : {};` |
| `  const quizState = {};` | `  const quizState = kept ? kept.quizState : {};` |
| `  function draw() {` | `  function draw() {` + `    if (myMount !== mountSeq) return;` |

*(that last row is the ninth replacement — 9 anchors, 9 deletions.)*

**EDIT 3 — replace the whole of `boot()`** (from `  async function boot() {` to its closing `  }`,
**20 lines**, all deleted) with:

```js
  async function boot() {
    const resuming = kept !== null && kept.profile !== null;
    if (resuming) restartQuizzes(quizState);
    if (resuming) decideStage();
    draw();
    let signature = resuming ? kept.signature : null;
    try {
      allowedWords = await getAllowedSet();
      const fresh = await getJson("/api/profile");
      if (myMount !== mountSeq) return;
      const sig = profileSignature(fresh);
      const changed = !resuming || sig === null || signature === null || sig !== signature;
      signature = sig;
      if (!changed) { remember(signature); return; }
      profile = fresh;
      const candidateLemmas = pickCandidateWords(profile, 1);
      candidateSet = new Set(candidateLemmas);
      lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));
      knownSet = knownSetFromProfile(profile);
      decideStage();
    } catch (err) {
      if (!resuming) stage = "error";
    }
    draw();
    remember(signature);
  }

  function remember(signature) {
    sitting = { profile, signature, lemmas, knownSet, candidateSet, quizLemmasByChapter, askedThisSitting, checkState, quizState };
  }
```

**Note the frozen line survives byte-identical, with its six leading spaces:**
`      lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));` — `tests/reader-ui.test.js:210`
pins it as a substring and it is still there, at the same indent, inside the same `try`.

**EDIT 4 — APPEND to `tests/reader-ui.test.js`** exactly these **3** flat tests, names FROZEN, no
`describe(`, and **no new raw non-ASCII byte** (the file must stay at exactly 355):

1. `'coming back to the reader paints the story once, from kept state, and still refetches the profile'` —
   **the gate that executes the shipped code.** Reuse the fake-container idiom from
   `tests/quiz-ui.test.js:66-68`, upgraded so `innerHTML` is an accessor that pushes every
   assignment onto a `paints` array; stub `globalThis.fetch` to serve the manifest and a fixed
   profile, counting `/api/profile` calls; restore both in a `finally`. Then assert, in one test,
   all four rows of the table above:
   first entry `paints.length === 2` and `paints[0]` does **not** contain `class="reader-text"`;
   re-entry with an unchanged profile `paints.length === 1` **and** `paints[0]` **does** contain
   `class="reader-text"` **and** exactly one further `/api/profile` call was made;
   re-entry after mutating the profile `paints.length === 2`, `paints[0]` contains the story, and
   the final paint contains the new chapter.
2. `'the invalidation signal is total, and a failed refetch never blanks a story she is reading'` —
   `profileSignature` returns equal strings for two structurally identical profiles and different
   strings when **any** nested field changes (assert over a list of at least six mutations at
   different depths, including one inside `story.chapters[0].glossary`); it returns `null` for a
   cyclic object rather than throwing. Then drive `render()` a second time with a `fetch` that
   rejects and assert the story is still in `paints[0]` and the error card
   (`\u05de\u05e9\u05d4\u05d5 \u05d4\u05e9\u05ea\u05d1\u05e9`) is **not** rendered.
3. `'a re-entry restarts the quiz and keeps what she already did, and C does not touch checkLog'` —
   `restartQuizzes` sets every `started` to false and leaves every `done` alone, and tolerates
   `null`/a non-object/an entry that is not an object. Then, on the source: assert
   `reader.js` contains `restartQuizzes(quizState)` **inside `boot()`** (slice from
   `async function boot()` to its close), that `checkState` and `quizState` are both bound from
   `kept`, and — the R4(ii) negative — that the file contains **`checkLog` zero times**.

**COMMANDS:**
```bash
cd C:/Users/dkreinov/claude/english-app
node --check public/views/reader.js
npm test
APP_CODE=dummy npm test
# COMMIT: "step 1.3: C -- returning from the dictionary repaints the chapter she left in one paint,
#  with the profile still refetched; R4(i) fixed as a consequence; ledger 361 flat / 366 reported"
```

**MANDATED FAIL-FIRST (record each observed failure line verbatim; a mutation that does not fail is
a STOP):**

* **M1.3a — WRITE TEST 1 FIRST, AGAINST THE UNMODIFIED `reader.js`.** It must fail on
  **`re-entry painted 2 times, expected 1`** and on `paints[0]` not containing the story. *(The
  planner already observed exactly this on the shipped file — `RE-ENTRY paints=2,
  story-in-paint0=false`. An executor who cannot reproduce that failure has written the wrong test,
  and that is a STOP, not a nudge.)*
* **M1.3b** — make `profileSignature` return a constant (`return "x";`). Test 1's third row must
  fail: a changed profile no longer redraws. Restore. *(Proves the signal is load-bearing and that
  the plan's "cannot under-invalidate" claim is actually tested in the dangerous direction.)*
* **M1.3c** — delete `if (resuming) restartQuizzes(quizState);`. A re-entry after a started quiz
  must leave the slot empty; test 3 must fail. Restore. *(This is the stuck-child trap of
  SK-F1-4(d), watched failing.)*
* **M1.3d** — delete `if (myMount !== mountSeq) return;` from `draw()`. Add to test 1 a case that
  renders twice without awaiting the first, and assert the stale mount cannot paint; it must fail.
  Restore. *(The one new moving part, seen to fail — otherwise it is a decoration.)*
* **M1.3e** — remove `remember(signature)` from the early-return branch. The **second** re-entry
  must lose its cache and paint twice; test 1 must fail. Restore.

**FROZEN VALIDATION:** §VAL-F1 verbatim, then, in the SAME file:
```bash
case "$SBSTATE" in FIXTURE) ;; *) fail "the dev sandbox must still hold the fixture, got SB=$SBSTATE";; esac
case "$TOTAL"   in 366) ;; *) fail "expected 366 reported tests, got '$TOTAL'";; esac
case "$PLAN"    in 361) ;; *) fail "expected top-level plan 1..361, got '1..$PLAN'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL"  in 366) ;; *) fail "APP_CODE=dummy: expected 366, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"    in 361) ;; *) fail "expected 361 flat tests, got '$FLAT'";; esac
case "$ENDS" in *"public/views/reader.js CRLF=910 LF=0"*) ;; *) fail "reader.js must stay CRLF-only and reach exactly 910 lines: $ENDS";; esac
case "$ENDS" in *"tests/reader-ui.test.js CRLF=0 "*)      ;; *) fail "reader-ui.test.js must stay LF-only: $ENDS";; esac
case "$ENDS" in *"public/views/trophies.js CRLF=0 LF=410"*) ;; *) fail "trophies.js must not move in this step: $ENDS";; esac
RDBYTES="$(node -e 'console.log(String(require("fs").statSync("public/views/reader.js").size));')"
case "$RDBYTES" in 30573) ;; *) fail "reader.js must be 30573 bytes after step 1.3, got '$RDBYTES'";; esac
DELS="$(git diff --numstat HEAD -- public/views/reader.js | awk '{s+=$2} END{print s+0}')"
case "$DELS" in 29) ;; *) fail "this step's deletion budget is exactly 29, got '$DELS'";; esac
ZERODEL="$(git diff --numstat HEAD -- tests/reader-ui.test.js | awk '{s+=$2} END{print s+0}')"
case "$ZERODEL" in 0) ;; *) fail "reader-ui.test.js must be append-only, got $ZERODEL deletions";; esac
# the frozen merge line must have survived byte-identical, six leading spaces and all
MERGE="$(grep -c '      lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));' public/views/reader.js)"
case "$MERGE" in 1) ;; *) fail "the frozen merge line at reader.js:403 did not survive: count $MERGE";; esac
# R4(ii) is NOT in this phase, and this is the proof
CL="$(grep -c checkLog public/views/reader.js)"
case "$CL" in 0) ;; *) fail "reader.js now mentions checkLog -- R4(ii) is carried obligation F1-2, not phase 1 work";; esac
# the router is untouched (already md5-pinned in VAL-F1, re-stated because C is where it would be tempting)
APPD="$(git diff --numstat HEAD -- public/app.js | wc -l | tr -d ' ')"
case "$APPD" in 0) ;; *) fail "public/app.js changed -- C is done inside the view";; esac
# exactly one sitting cache, one mount counter, one signature function
for PAIR in 'let sitting = null;' 'let mountSeq = 0;' 'export function profileSignature(profile) {' 'export function restartQuizzes(quizState) {'; do
  N="$(grep -c "$PAIR" public/views/reader.js)"
  case "$N" in 1) ;; *) fail "expected exactly one '$PAIR', got $N";; esac
done
EXPECT=' M public/views/reader.js
 M tests/reader-ui.test.js'
case "$PORC" in "$EXPECT") ;; *) fail "write set wrong. got:
$PORC";; esac
exit $RC
```
*(The `CRLF=910` and `30573` pins were **measured on a simulated post-edit tree**, not computed from
a line count. **If an executor's byte counter disagrees, that is a STOP, not a fix** — it means the
edit that was applied is not the edit that was specified.)*

**NON-GOALS:** no scroll capture or restore (step 1.4); no change to `public/app.js`; no read of
`story.checkLog`; no change to `quizLemmasByChapter`'s clearing behaviour (it is deliberately never
cleared — SK-F1-4(e)); no change to `celebrateFromServer`'s local-only read; no touch of
`public/views/trophies.js` or any test file other than `tests/reader-ui.test.js`; **no claim that
returning "feels" fast** — that is step 1.5's, and only a human's.

---

# STEP 1.4 — C: and she comes back to the same place on the page

**GOAL:** `public/views/reader.js` records her scroll position while the reader is the mounted
route and restores it right after the first paint of a re-entry. **Insert-only: 0 deletions.**
`tests/reader-ui.test.js` gains 2 flat tests.

**TIER:** WORKER. **DEPENDS ON:** step 1.3.

**FILES:** `public/views/reader.js` — MODIFY (**CRLF**, 910/0 after 1.3), insert-only.
`tests/reader-ui.test.js` — MODIFY (**LF**), append-only, 2 flat tests.

**EDIT 1 — append to the module-scope block from step 1.3**, immediately after `restartQuizzes`:

```js

// C (word-finish), the other half of "it takes time": she also loses her place.
// app.innerHTML = "" collapses the document height to nothing, so the browser
// drops her to the top before the new view has any content.
//
// There is no unmount hook, so the position is recorded CONTINUOUSLY rather than
// at the moment of leaving. The hash guard is the same source of truth the router
// itself uses (app.js:20), so scrolling the dictionary can never overwrite the
// reader's saved position -- and by the time the router runs, the hash has already
// changed, so the collapse-to-zero scroll event is ignored.
//
// A hashchange listener would fire earlier and be exact, but only because
// reader.js's module body runs before app.js's. Depending on ESM evaluation order
// would fail SILENTLY -- restoring her to 0 with nothing to show for it -- the day
// someone reorders an import. This does not depend on it.
let readerScrollY = 0;

export function shouldRecordScroll(hash) {
  return hash === "#/reader";
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener(
    "scroll",
    () => {
      if (shouldRecordScroll(window.location.hash)) readerScrollY = window.scrollY;
    },
    { passive: true }
  );
}
```

**EDIT 2 — two inserts inside `boot()`**, each on the line after an existing `draw();`:
* after the **first** `draw();` (the one before `let signature = …`): `    if (resuming) restoreScroll();`
* after the **second** `draw();` (the one before `remember(signature);`): `    if (resuming) restoreScroll();`

**EDIT 3 — insert `restoreScroll` beside `remember`** inside `render()`:

```js
  function restoreScroll() {
    if (typeof window === "undefined" || typeof window.scrollTo !== "function") return;
    window.scrollTo(0, readerScrollY);
  }
```

**EDIT 4 — APPEND 2 flat tests to `tests/reader-ui.test.js`:**

1. `'the reader records its scroll position only while the reader route is mounted'` — execute
   `shouldRecordScroll` over `'#/reader'` (true) and `'#/words'`, `'#/home'`, `'#/trophies'`,
   `'#/placement'`, `'#/parent'`, `''`, `'#/reader?x'` (all false). Then, on the source, assert the
   listener is registered exactly once, is `passive`, and is guarded by
   `typeof window !== "undefined"` — and that `reader.js` still imports cleanly in node **with no
   `window` defined**, which is the guard's whole job.
2. `'restoring the scroll is attempted on a re-entry and never on a first entry'` — drive
   `render()` with the step-1.3 harness plus a `globalThis.window` stub that records
   `scrollTo` calls and reports a `location.hash` of `'#/reader'`; assert `scrollTo` is called
   **zero** times on a first entry and **at least once** on a re-entry, with `0` as its first
   argument. Restore `globalThis.window` in a `finally`.

> **WHAT THESE TWO TESTS DO *NOT* PROVE, stated plainly (field-guide lesson 15).** They prove the
> *decision* to restore and the *guard* on recording. They cannot prove she lands on the right
> pixel, because node has no layout: there is no document height, no font metrics and no reflow.
> **Whether the restore actually puts her back where she was is a HUMAN gate, and it is step 1.5.**
> No assertion in this plan claims otherwise.

**MANDATED FAIL-FIRST:**
* **M1.4a** — change the guard to `hash === "#/words"`. Test 1 must fail on `'#/reader'`. Restore.
* **M1.4b** — delete both `restoreScroll()` calls. Test 2 must fail with `scrollTo` never called on
  a re-entry. Restore. *(Existence is not effect: proves the function is wired, not merely defined.)*
* **M1.4c** — remove the `typeof window !== "undefined"` guard and run `npm test`. The **whole of
  `tests/reader-ui.test.js` must fail to import**. Restore. *(Proves the guard is what keeps the
  module node-importable, rather than a superstition.)*

**FROZEN VALIDATION:** §VAL-F1 verbatim, then, in the SAME file: the ledger pins
(`TOTAL`/`GTOTAL` **368**, `PLAN`/`FLAT` **363**, `FAILED`/`GFAILED` 0), `SBSTATE` FIXTURE,
`trophies.js CRLF=0 LF=410`, a **0** deletion budget on both files
(`git diff --numstat HEAD -- public/views/reader.js tests/reader-ui.test.js | awk '{s+=$2} END{print s+0}'`
must be `0`), `grep -c 'let readerScrollY = 0;'` = 1, `grep -c 'restoreScroll()'` = **3** (one
definition + two call sites), `grep -c checkLog public/views/reader.js` = 0, the write set literal,
and `exit $RC`. **The `reader.js` CRLF pin for this step is `910 + <the number of lines in the two
blocks quoted above> + 2`; the executor derives it by counting those blocks and, if the byte counter
disagrees, STOPS.**

**NON-GOALS:** no `scroll-behavior` CSS; no `history.scrollRestoration`; no change to `app.js`; no
per-chapter scroll memory (one position, the reader's, is what the defect asks for).

---

# STEP 1.5 — THE HUMAN GATE: the two composites nobody else can gate

**GOAL:** a human looks at the two screens this phase changes, in the sandbox browser, and says yes
or names what is wrong. **This step asserts nothing and is a blocking gate.**

**TIER:** SELF-SERVED BY THE AGENT (owner directive: *audit UI in the sandbox browser myself; do not
ask Dennis to look*). **DEPENDS ON:** 1.1, 1.2, 1.3, 1.4.

**WHY IT EXISTS.** Field-guide lesson 15 records three green-suite disasters, all three found by a
person looking and none by 349 tests. This phase creates exactly **two** places where an approved
thing meets another approved thing and nobody has signed the combination:

| composite | what could be wrong that no assertion here can see |
|---|---|
| **the trophy shelf under `displayTier`** — approved artwork, approved ring CSS, newly-chosen ring | a card that is now *ringed* may look wrong next to one that is not; the progress line may read oddly at a threshold; a bronze ring on a card the server has not yet stamped may simply look like a bug to a human even though it is correct |
| **the reader returning from the dictionary** — kept DOM, restored scroll, real fonts, real images | whether she actually lands where she was; whether the repaint flickers; whether the quiz slot refills; whether anything at all looks *stale* |

**THE RECIPE (field-guide lesson 11, unchanged):**
1. **Check port 3000 for a stale server FIRST** — one has previously squatted with the wrong
   `DATA_DIR` and answered a probe.
2. `DATA_DIR=C:/Users/dkreinov/english-app-sandbox npm run dev`. **Never production.**
3. Hard-reload past any stale localhost service worker.
4. **The expected before/after is exact, because the fixture was designed for it:** on `/trophies`
   the fixture reproduces defect D on **exactly two** cards (`known` 5/5 and `proven` 1/1) and on
   no others. After this phase, **zero** cards may show a locked ring at or past their target, and
   `known` and `proven` must wear a **bronze** ring. Six cards stay locked with a legitimate
   below-target line.
5. On `/reader`: scroll into the chapter, tap the dictionary tab, tap back. **Watch for: no blank
   screen, no spinner, the same scroll position, answered questions still answered.**
6. **Restore the sandbox from `C:/Users/dkreinov/finish-fixture/sandbox-profile.json` and STOP the
   server before recording the step** — the dev server writes to that file, and §VAL-F1's
   `SBSTATE` will read `UNKNOWN` and fail the next step if it is not restored.

**WHAT THE HUMAN MUST BE TOLD BEFORE LOOKING**, so a fixture artefact is not reported as a defect:
the word popup shows `he-garden` and similar **ASCII placeholders** where Hebrew belongs
(SK-F1-5(d)), the chapter is invented, and the learner is called Ellie.

**STOP CONDITIONS:** any card locked at or past its target → the D fix did not take, STOP. Any blank
screen or spinner on re-entry → the C fix did not take, STOP. Scroll lands at the top → step 1.4 did
not take, STOP. An empty quiz slot → SK-F1-4(d)'s trap is live, **STOP, serious**.

**NON-GOALS:** no production, ever; no `GET /api/profile`; no code change "while we are here" — a
defect found here becomes a new gated step, never an in-place edit.

---

# STEP 1.6 — PHASE CLOSE

**GOAL:** every acceptance criterion re-run on the final tree, the record written, and the two
carried obligations and one blocker put where the next phase cannot miss them.

**TIER:** ORCHESTRATOR. **DEPENDS ON:** all of 1.1–1.5.

**COMMANDS:** §VAL-F1 verbatim plus a tail asserting the **final** ledger (`TOTAL`/`GTOTAL` **368**,
`PLAN`/`FLAT` **363**, 0 failures), `SBSTATE=FIXTURE`, the final endings
(`reader.js CRLF=910+`, `trophies.js CRLF=0 LF=410`, both test files LF), the full 4-path write set
against base `e44cffa`, `git diff --diff-filter=D --name-only e44cffa HEAD` empty, and `exit $RC`.

**THE RECORD MUST STATE, for whatever comes next:**
* **CARRIED OBLIGATION F1-1 —** phase 4 bumps `CACHE` `magic-vet-v20` → `magic-vet-v21` in
  `public/sw.js:1` **and** moves the pin in `tests/shell.test.js` **in the same step**, with a seam
  assertion so a half-applied bump fails loudly. Two precached files moved in this phase and are
  unbumped.
* **CARRIED OBLIGATION F1-2 —** **R4(ii) is NOT done.** Her answers still do not survive a page
  reload, because nothing reads `story.checkLog` back. It needs an owner ruling on
  first-attempt-vs-best-attempt and a de-duplication rule. Phase 1 fixed only R4(i), the
  tab-switch case.
* **BLOCKER B-F1-1 —** the four other copies of her vocabulary (FINDING 1), with the receipt, and
  the owner's answer or the fact that he has not given one.
* The unscheduled latent defect from `journal.md:65-68`: the `log-check` POST swallows failures and
  sets `st.logged = true` **before** the await, so a failed save is never retried or surfaced —
  **and note that keeping `checkState` alive for a whole sitting makes that failure less visible,
  not more.**
* That `E` removed her data from the sandbox but that **no repository gate can ever see that file**,
  and the `SBSTATE` clause is machine-local (SK-F1-5(f)).
* Candidates for the field guide, from this phase:
  (a) *"A FROZEN PREAMBLE WITHOUT `exit $RC` IS A REPORT, NOT A GATE. Run on its own it exits 0 while
  printing FAIL lines. Every step's tail must supply the exit, and a step that says 'the preamble
  passed' with no tail has proved nothing."* — observed on this run's own `§VAL-F1`.
  (b) *"LOOK FOR THE HARNESS BEFORE WRITING THE PLAN. `reader.js` had no behavioural test for two
  runs; the fake-container idiom needed to execute it had existed in `quiz-ui.test.js:67` the whole
  time. The reason the reader was only ever source-needle tested was that nobody checked."*
  (c) *"SIMULATE THE EDIT BEFORE SPECIFYING ITS NUMBERS. Both line-count pins in this plan were
  measured on a simulated post-edit tree; the first hand-count was wrong by four lines."*
  (d) *"THE BASE CAN MOVE WHILE YOU PLAN. Re-read `git log` before you finish, and diff the base you
  were given against HEAD — this plan's did, and one of the new commits deferred a scope decision to
  the draft being written."*

**NON-GOALS:** no deploy, no `CACHE` bump, no capture of her profile, no code change.

---

## THE THREE QUESTIONS, ANSWERED IN PLACE

### (i) Runtime reachability — for each artifact, where does it exist and can everything reach it?

| artifact | exists at runtime as | who needs it | reachable at the moment needed? |
|---|---|---|---|
| `displayTier` | a named export of `public/views/trophies.js`, a native ESM module with no bundler | `cardHtml` in the same module; `tests/trophies-ui.test.js` by direct import | **YES** — module-scope pure function, no DOM, no fetch. The module already imports cleanly in node (17 tests do it today) |
| the ring class it selects | `trophy-card--locked|bronze|silver|gold` in `public/styles.css`, which `public/index.html:20` links **globally** | the `<div>` `cardHtml` writes into `container.innerHTML` | **YES**, and this is field-guide lesson 14 re-checked in the safe direction: `trophies.js` emits **no** `<style>` tag at all, and **D adds no CSS** — all four classes already exist and are already exercised by `tests/trophies-ui.test.js:286` |
| `sitting` (the kept reader state) | a module-scope `let` in `public/views/reader.js`, alive for the life of the **page**, not the view | `render()` on its next mount | **YES — and its lifetime is exactly right.** It survives a hashchange (the router only re-invokes the view) and dies on a real page load, which is precisely the scope "one sitting" needs. A reload is a legitimate reset |
| `mountSeq` / `myMount` | the same module scope, one counter | `draw()` and `boot()`'s post-await resume | **YES** — `myMount` is captured before the first `await`, so no interleaving can lose it |
| `readerScrollY` | the same module scope | the `scroll` listener (writer) and `restoreScroll()` (reader) | **YES**, and the listener is registered at module evaluation — i.e. **before** the router ever runs, since `app.js:3` imports `reader.js`. Note the plan does **not** depend on that ordering for correctness (SK-F1-4(i)); it only means no scroll event is ever missed |
| the `scroll` listener under node | **it does not exist** | nothing | **CORRECT** — `typeof window !== "undefined"` skips registration entirely, which is what keeps `reader.js` importable by the test suite. M1.4c watches that fail |
| the synthetic sandbox fixture | a file at an absolute path **outside the repository** | the dev server at step 1.5, via `DATA_DIR` | **YES on this machine and nowhere else.** It is in no commit, no write set and no digest. Fully stated in SK-F1-5(f) |
| the audio manifest | `/audio/words/index.json`, fetched by `words-index.js:17`, cached in a module `Set` | `resolveLemma` at `reader.js:750` | **YES, and C does not disturb it** — `boot()` still `await`s `getAllowedSet()` before the paint that binds word taps, on both the first-entry and the changed-profile path. On the **unchanged** re-entry path the first paint happens *before* that await, but the manifest `Set` is already populated from the first entry, and `resolveLemma` is only reached from a tap handler bound by `draw()`, which has the same `allowedWords` the kept sitting was built with. **No window exists in which a tap can outrun the manifest** |

### (ii) Contradictory sources — every value shown to the child, and its source

**This is the specification for D, not a review formality.**

| shown to her | source, after this phase | can a second source disagree? |
|---|---|---|
| **a trophy card's ring** | `displayTier(trophy, profile, earned)` | **No — and this is the fix.** Before: the ring came from `tierOf(stored)` and the number from `metric(profile)`, two sources, and they disagreed (reproduced: `known` locked while reading `12 … 5`). After: `cardHtml` computes **one** `tier` and both the ring and the line are derived from it. One value, two uses — not two values |
| **a trophy card's progress line** | `progressLine(trophy, profile, tier)` with **that same** `tier` | **No.** And the stronger claim is proved by sweep: `metric < nextThreshold(displayTier(...))` over 6644 combinations, so the pair cannot even *appear* contradictory |
| **the celebration overlay** | `collectUncelebrated` reading **stored** `profile.trophies` — deliberately unchanged | **Different source from the ring, and named rather than hidden.** They cannot contradict: the only reachable ordering is *ring first (the metric passed), celebration second (the server stamped)*, and neither ever states the other is wrong. Driving the celebration from the live metric was **rejected** — it would promise a trophy the server might not stamp. The failure being closed, a greyed card announcing success, is unreachable in both |
| **the story on the reader screen** | the kept `profile`, replaced by the fetched profile whenever `profileSignature` differs | **No.** There is one profile object in the view at any moment. The kept copy is not a second source; it is the *previous value* of the same one, and it is compared against the fresh one on **every** entry over its entire serialisation |
| **"question N of 4"** and whether the quiz runs | `session.questions.length`, and `afterChapterStage`'s `lemmaCount` from `quizLemmasFor(chapter)` | **No** — and C **preserves** this. The memo is deliberately never cleared (SK-F1-4(e)), so `lemmaCount` and the array `startQuiz` received stay the **same array object**, which is the seam word-polish built |
| **her answered comprehension questions** | `checkState`, kept in the sitting | **No within a page load.** Across a page load `story.checkLog` on the server disagrees with a blank screen — **that is R4(ii), and this phase does not claim to fix it** (FINDING 4, CARRIED OBLIGATION F1-2). Stated rather than papered over |
| the speaker button's presence and the clip it plays | `activePopup.canSay` and `activePopup.lemma`, both from the one `lemma` at `reader.js:750` | **No** — one variable, two uses; unchanged by this phase |

### (iii) Ungated composites — approved thing meets approved thing

Exactly **two**, both named in step 1.5, both going to a human's eyes and to **no assertion**:
the trophy shelf under the new ring selection, and the reader returning from the dictionary with a
restored scroll on a real screen with real fonts. A third is worth naming as *not* a composite: the
E fixture meets the sandbox dev server, and that pair **is** mechanically gated, by `SBSTATE`.

---

## RISKS

1. **C shows her a stale story.** The design calls this out and it is the worst outcome here.
   *Mitigation:* the signal is the entire serialised profile, so under-invalidation is unreachable
   (SK-F1-4(a),(h)); the profile is re-fetched on **every** entry; and the paint-count gate is
   executed, not read. *Residual, stated:* if the background fetch **fails** on a re-entry she keeps
   reading the cached chapter with no indication. Bounded by one page load, and deliberate.
2. **The kept quiz state strands her.** A kept `quizState` with `started: true` renders an empty
   quiz slot and removes the continue button. *Mitigation:* `restartQuizzes`, an exported pure
   function, plus M1.3c which watches the trap fail. *Residual:* the quiz restarts from question
   one, which is today's behaviour.
3. **The D fix takes a trophy away.** Never-regress is the one law the awarding engine is written
   around. *Mitigation:* `displayTier` takes the **higher** of stored and live, and the sweep
   asserts 0 regressions over 6644 combinations, with M1.2c watching the `return live;` mutation
   fail. *Residual:* none identified.
4. **The D fix rings a card before the server stamps it, and a human reads that as a bug.**
   *Mitigation:* it is correct by the numbers, the celebration is unaffected, and step 1.5's human
   is told the expected before/after counts (2 → 0) explicitly. *Residual:* a taste judgement that
   only the owner can settle; if he dislikes it, the alternative is showing no number at all until
   stamped, which is a new gated step.
5. **`reader.js`'s CRLFs are silently normalised.** It is the one CRLF file this phase edits, in a
   repo with `core.autocrlf=true` and no `.gitattributes`, and `git diff` cannot see the damage.
   *Mitigation:* byte-preserving editing is mandated, the end state is pinned at **CRLF=910 / 30573
   bytes** from a simulation, and §VAL-F1 cross-checks reader.js's CR count a second way with `tr`.
   *Residual:* an executor who edits with `sed`. Covered by the stop-rule and by the byte pin.
6. **The E fixture is silently replaced by real data again.** No repository gate can see the file.
   *Mitigation:* the two-state `SBSTATE` clause and the pristine copy. *Residual, stated plainly:*
   this protection is machine-local and does not travel with the repository.
7. **The mount token changes behaviour somewhere unforeseen.** It is the one genuinely new moving
   part. *Mitigation:* it only ever **suppresses** a paint from a mount that is no longer current,
   and M1.3d watches it fail. *Residual:* if `render()` were ever called twice deliberately for the
   same mount, the second would be silenced — nothing in the codebase does that today, checked.
8. **The base moves again during execution.** It moved three times during planning.
   *Mitigation:* every step's `$PORC` and write-set literal is against base `e44cffa`; a step that
   sees a different write set stops. *Residual:* if the orchestrator commits more `.oplan/` records
   the write-set literals are unaffected, because `.oplan` is filtered.

## BLOCKERS — owner rulings needed

* **B-F1-1 — FOUR OTHER COPIES OF HER VOCABULARY EXIST, AND ONLY THE OWNER MAY DELETE THEM.**
  FINDING 1. `g1-scratch/sandbox-profile.bak` and `sandbox-profile-p2.bak` are **byte-identical** to
  the sandbox file; `g1-deploy/live-readback.json` and `g1-deploy2/live-readback.json` are
  **byte-identical to each other** and hold **more** of her data than the file E targets — 20 words
  and 2 chapters, read from the live service. None appears in the D27 receipt. **The design's claim
  that E is the last copy is false, and the record must be corrected.** The question, asked in the
  D27 form: *"Four more copies of her profile are on this machine, two of them richer than the
  sandbox one. Deleted now, as the backups were, or kept? A receipt (paths, sizes, sha256 — never
  contents) is already written either way."* **Default if unanswered: keep and report.** Step 1.1
  proceeds regardless, because replacing the sandbox file is a replacement, not a deletion.
* **B-F1-2 — R4: amend phase 1, or add step 1b?** The orchestrator deferred this to this draft
  (`journal.md:57-59`). **This plan's recommendation is: neither amend nor defer silently — take
  R4(i) as a free consequence of C (it already is), and give R4(ii) its own step on its own plan,
  because it needs a first-attempt-vs-best-attempt ruling and a de-duplication rule that are product
  decisions, not planner decisions.** FINDING 4. **The owner or orchestrator must confirm**, because
  the alternative reading — "R4 belongs in phase 1" — would make this phase write screen state from
  her durable data, which no other item here does.
* **B-F1-3 — no live measurement was permitted to this planner.** `magic-vet-v20` at
  `dpl_6pFjJ8LrcyaFodRELCa46BzATUXy` is quoted from the record as a hypothesis, never confirmed.
  Phase 4 must confirm it before it deploys, and should expect to be stopped if it has moved.

## RECORD GAPS

1. **`.oplan/word-finish/design.md:20` states "E is the last copy of her data on this machine."
   It is false** — four more exist (FINDING 1). This should be corrected in the design before
   another agent reads it and reasons from it.
2. **`.oplan/word-finish/design.md:98` cites `public/views/trophies.js:100-114` as the place the
   two sources meet.** The substance is right; the address points at the catalogue literal, not at
   `cardHtml:163-167`. An executor sent there would break a `deepStrictEqual` pin and fix nothing
   (SK-F1-3). The same wording is in the briefing.
3. **Stale endings and md5s in the previous run's plan.** `.oplan/word-polish/plan.md:1683` records
   `reader.js` at CRLF=845 / 27597 bytes and `tests/reader-ui.test.js` at LF=492; today they are
   **857 / 28055** and **511**, because `427c054` landed after that plan was written. `public/sw.js`
   is `78fc3b0a…`, not the `d76f78…`/`6d8367…` recorded there. **These are stale, not wrong** — but
   the field guide's own candidate lesson is that *a correction can be the error*, so they are
   listed here rather than "fixed" anywhere.
4. **`.oplan/word-finish/phase-state.md:5` records `BASE (phase 1): 0c0f32a`.** HEAD is `e44cffa`
   and this plan is based on it. `phase-state.md` should be updated. Measured: no non-`.oplan` file
   differs between the two, so nothing else in the plan is affected.
5. **`.oplan/word-finish/phase-state.md:4` says the field guide is 148 lines; `wc -l` agrees at
   **148**.** This plan's own first draft said 149 (a line-count-vs-newline-count slip) and is
   corrected. Noted so the number does not oscillate again.
6. **No plan file exists yet at `.oplan/word-finish/plan.md`** — `phase-state.md:2` already says so.
   This draft is its content.
7. **The D27 receipt is complete and correct** for the ten files it lists; it simply does not
   mention the five that were never captures. That is a gap in coverage, not an error in the
   receipt.

## WHAT THIS PLANNER COULD NOT MEASURE, STATED PLAINLY

1. **Anything about production.** No `curl`, no `vercel`, no `.env`, no `/api/profile`. Every live
   value in this plan is quoted from the record as a hypothesis or written as a thing a later phase
   must measure.
2. **Her real profile.** It was never read. Every profile in this plan is synthetic or a
   fixture. The only thing derived from her data was a **set of 12 word keys**, held in memory to
   compute overlap counts, never printed.
3. **Whether the scroll restore lands on the right pixel.** node has no layout. Step 1.4's tests
   prove the decision and the guard; only step 1.5's human can see the result (SK-F1-4(i)).
4. **Whether the trophy shelf looks right with the new rings.** Only a human. Step 1.5.
5. **The exact `CRLF` count for `reader.js` after step 1.4.** Steps 1.2 and 1.3's pins were measured
   on simulated post-edit trees; 1.4's is given as an arithmetic rule the executor derives by
   counting the quoted blocks, because simulating a second edit on top of an un-applied first would
   have compounded assumption on assumption.
6. **Whether her live `story.checkLog` holds duplicates**, and the generation wall-clock. Both are
   named as unmeasurable-statically in `journal.md:69-70`, both belong to R4(ii), and neither is
   needed by anything in this phase.

---

## PLAIN PLAN — for the owner, in plain words

This phase fixes the two things that are plainly broken and takes her words out of a test folder.
Nothing is sent to her phone; that is a later phase. Six steps.

**1.1 — Put a made-up child's profile in the test folder, instead of hers.**
*Why:* the development sandbox on this laptop has been holding her real word list. It is not
needed there and it should not be there. A pretend profile — a made-up girl called Ellie, six
invented words, one invented chapter — does the job just as well, and the invented chapter is
deliberately built so that the trophy bug in step 1.2 shows up on screen and can be watched
disappearing.
**DONE WHEN:** the test folder holds the made-up profile and nothing of hers, and a receipt
records the sizes and fingerprints of what was replaced — never the contents.

**⚠ AND ONE THING I FOUND WHILE DOING IT, WHICH NEEDS YOUR ANSWER.** The plan I was given said
that test folder held the last copy of her words on this machine. **It does not.** There are four
more, in old working folders from earlier runs — and two of them hold *more* of her data than the
one I was pointed at: twenty words and two chapters, read straight from the live app. None of them
was in the list of backups you had deleted. **Deleting a child's data is your call and never mine**,
so they are listed with their sizes and fingerprints and left alone until you say. If you say
nothing, they stay and the record says so.

**1.2 — A trophy can no longer say "you got there" while still looking greyed out.**
*Why:* this is the bug you reported. A card worked out its number one way and its ring another way,
so the two could disagree — I reproduced it: a card reading "12 out of 5" while greyed. Rather than
hide the number, the card now works out **one** answer and uses it for both the ring and the
number, so the contradiction cannot be written down at all, let alone shown. I checked every trophy
at every possible score against every possible saved state — 6,644 combinations — and the
contradiction is now impossible rather than merely absent today. Nothing about *earning* trophies
changes: the app still never awards one itself, and the celebration still only fires when the
server says so.
**DONE WHEN:** no trophy card can show a target it has already reached, a test proves it by trying
every combination, and that test was watched failing on the old code first.

**1.3 — Coming back from her dictionary no longer throws the story away.**
*Why:* she told us this one. Tapping over to her words and back meant a blank screen, a wait for the
network, and the story rebuilt from nothing. Now the app keeps the page it drew and puts it straight
back — while still checking with the server every single time, so she can never be left looking at
something out of date. If the check finds anything at all has changed, the page is redrawn. If the
network is down, she simply carries on reading rather than being shown an error.
I tested this by actually running the app's reader in a test harness: today, coming back paints
twice and the first paint has no story in it. After the fix it paints **once**, and that one paint
already has her story — and the app still asks the server, exactly as before.
**DONE WHEN:** returning paints once, that paint already has the story, the server is still asked,
and the test that proves it was watched failing on the old code first.

**A related thing this fixes for free, and one it does not.** Her comprehension answers used to
come back blank whenever she changed tabs, because they only lived on the screen. They now survive
for as long as she keeps the app open. **But they still will not survive closing and reopening the
app** — the app writes them down and then never reads them back. That is a separate job, it needs
you to decide something first (if she got a question wrong and then right, which one counts?), and
this phase deliberately does not guess.

**1.4 — And she comes back to the same place on the page.**
*Why:* "it takes time" almost always also means "and I lost my place". The app now quietly
remembers how far down she had scrolled and puts her back there.
**DONE WHEN:** the position is remembered only while she is on the story tab, restored only when
she comes back, and — because no automatic test can see a real page — a person has looked.

**1.5 — I look at both screens myself, in the sandbox.**
*Why:* the last run's worst escapes all passed every automatic check and were only caught by
somebody looking. There are exactly two places here where two separately-approved things meet and
nobody has signed off the combination: the trophy shelf with its new rings, and the story screen
coming back with the scroll restored. The made-up profile from step 1.1 is built so I know exactly
what I should see: **two** wrong trophy cards before the fix, **none** after.
**DONE WHEN:** I have looked at both, on a real screen, and either say yes or name what is wrong.

**1.6 — Write it all down, including what is still not done.**
*Why:* the next phase starts from this record, and the honest half matters more than the finished
half.
**DONE WHEN:** every check has been re-run on the final state, and the record carries the three
open items: the phone-cache rename that phase 4 still owes, the answers-after-restart job that is
not done, and your decision about the four other copies of her words.

### THE THREE THINGS THIS DOES NOT DO — please read these

**1. Nothing reaches her phone in this phase.** All of it sits on this laptop until the shipping
phase. That is deliberate: the fix to make phones pick up new files is spent exactly once, at the
end, so it cannot be spent twice or half-spent.

**2. She still cannot hear about seventeen words**, and this phase does not change that. Recording
them is phase 2, and you have already approved that spend.

**3. Her answers still will not survive closing the app.** See step 1.3 above. They survive tab
changes now, which is what she actually complained about, but the deeper fix needs a decision from
you and is its own piece of work.

---

*End of plan. Six steps: 1.1 sandbox · 1.2 the trophy card · 1.3 the returning story ·
1.4 the scroll · 1.5 a human looks · 1.6 close. Ledger 355 → 363 flat, 360 → 368 reported.
No deploy, no API, no money, no `CACHE` bump.*

---

# P1-AMENDMENT #1 (orchestrator, 2026-08-02) — step 1.1 covers BOTH sandbox fixtures

**Raised by the plan reviewer as its only HIGH finding, and it is an ORCHESTRATOR error.**
`journal.md` states "Step 1.1 now covers BOTH sandbox files". That was **false of the plan document
actually delivered**: step 1.1's `FILES:` list (`plan.md:1078-1083`) names only
`english-app-sandbox/profile.json`; FINDING 1 (`:112-116`) explicitly classifies
`trophies-val/sandbox/profile.json` as out of scope; and Acceptance Criterion 15 (`:366-370`) pins
one md5. I asserted a scope change in the record without making it in the plan.

**RULING: step 1.1 replaces BOTH files with synthetic data.**

The planner excluded the second file because it measured **0 overlap** with her vocabulary. That
reasoning is not wrong, but it is **not sufficient, and the plan must not rest on it**: the only
surviving reference is the 12-word sandbox copy, and her live profile holds ~40 words. Zero overlap
against 12 of 40 proves nothing about the other 28. Re-measured today: the fixture holds 15 word
keys, overlap 0 against the 12 — the same number the planner got, and it carries the same weakness.

**Why replace rather than investigate:** proving the fixture is not hers would mean reconstructing
her full vocabulary from the live service — a fresh authenticated read, for a question whose answer
changes nothing. Replacing both is a few seconds and makes the question moot. Easy and robust: when
a cheap action removes an ambiguity entirely, take it instead of measuring the ambiguity.

**Concretely, step 1.1 as amended:**
- FILES: `C:/Users/dkreinov/english-app-sandbox/profile.json` **and**
  `C:/Users/dkreinov/trophies-val/sandbox/profile.json`. Both outside the repo; the repo write set
  stays EMPTY, exactly as planned.
- The step's frozen generator is run **twice**, once per path, producing the same synthetic profile.
- Acceptance Criterion 15 extends: **both** files must equal the frozen synthetic md5, and a
  machine-wide sweep must report **zero** files anywhere under `C:/Users/dkreinov` (excluding
  `node_modules`, `.git`, `AppData`) that parse as a profile with `learner` defined and **more than
  2 word keys**. The 2-word comparator fixtures (`cat`, `dog`) are synthetic and are the only
  legitimate survivors.
- That sweep is the real gate: it is the only check that would have caught the five copies the first
  deletion missed, and it is now written down so it cannot be forgotten again.
