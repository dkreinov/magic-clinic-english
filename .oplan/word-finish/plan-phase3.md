# PLAN — word-finish PHASE 3 "quiz items"

Written by a FRESH PLANNER, 2026-08-02, READ-ONLY of the repository and of production.
Nothing in `C:/Users/dkreinov/claude/english-app` was written. No `git` command that writes was
run. No `vercel` command. No request of any kind to production. `.env` was never opened. Zero
money spent.

Scratch, mirror and evidence live at `C:/Users/dkreinov/wf-p3-plan/`.

---

## §0. HOW THIS PLAN WAS VERIFIED, AND WHAT IT DOES NOT ASSERT

The phase-3 brief (`.oplan/word-finish/brief-phase3.md` §0) deliberately asserts no measured fact,
because the phase-2 brief carried a remembered count that a standing owner-approved ruling had
already contradicted. **Every number in this plan was re-derived by executing the shipped code on a
byte-exact mirror outside the repository.** Where a measurement disagrees with `design.md`,
`phase-state.md`, `STATUS.md` or the brief, the measurement wins and the disagreement is written up
in RECORD GAPS at the end.

**Method actually used, so it can be checked:**

* A byte-exact mirror at `C:/Users/dkreinov/wf-p3-plan/mirror/english-app`, built with `cp -a`, NOT
  with `git archive` / `git stash` / a fresh clone — field guide 4 records that every git-mediated
  copy re-applies `core.autocrlf` and silently flips endings, which would make a byte comparison
  inside it meaningless. `.git`, `.env` and `.env.local` were removed from the mirror. Byte identity
  of the load-bearing files was confirmed by md5 against the repo before any measurement was taken.
* Every sweep in this plan **prints how many items it observed** (field guide 18). Where a sweep in
  this plan reports a count, that count is in the pasted stdout.
* Line endings are measured **only** by `tr -dc '\r' | wc -c` versus `tr -dc '\n' | wc -c`, never
  with grep (field guide 16).
* Every measurement script was written to a FILE and then run, never passed through shell quoting
  (field guide 19). The scripts are retained at `C:/Users/dkreinov/wf-p3-plan/evidence/`.

**What this plan deliberately does NOT do:** it does not name the words phase 3 generates items
for, and it could not — they live only on the live service. That was drafted as blocker B-F3-1;
**the orchestrator ruled it mid-planning and authorised a live capture** (§2.7). The capture is
step 3.1, it is the ORCHESTRATOR's, and **the planner made no request of any kind.** N is therefore
unknown at planning time, so §10 opens with a size gate (§3.0) that specifies the behaviour at
N=0, at a normal N and at a large N.

---

## §1. THE MEASURED BASELINE — every figure re-derived today

### 1.1 Tree state

```
$ git rev-parse --abbrev-ref HEAD
master
$ git rev-parse HEAD
536e5206a1b1154a7660ac65b4e043a141f24868
$ git status --porcelain
?? .oplan/word-finish/brief-phase3.md
```

Branch and HEAD are exactly as the brief §2 states. **The tree is NOT clean** — the brief itself is
untracked. That is harmless and expected (the orchestrator wrote it), but the brief's instruction
"tree clean (verify all three)" is literally false at the moment of verification, and §VAL-F3 below
is written to tolerate exactly one untracked path under `.oplan/`. Recorded as RECORD GAP 1.

### 1.2 The frozen contracts, re-measured (FC-1 .. FC-7)

```
$ md5sum public/quiz.js public/quiz-core.js public/sw.js public/audio/words/index.json
69b6d71117cf776715374abc6f0abb02 *public/quiz.js
9a2131be8b9d1b77c219f1e8c3482a71 *public/quiz-core.js
78fc3b0ac1d10de8a5baccb753eca33c *public/sw.js
6a885982b75e82ef1f00dc6768796ecf *public/audio/words/index.json
```

* **FC-1 CONFIRMED.** `public/quiz.js` = `69b6d71117cf776715374abc6f0abb02`,
  `public/quiz-core.js` = `9a2131be8b9d1b77c219f1e8c3482a71`. Both exactly as `phase-state.md:22-23`.
* **FC-4 CONFIRMED.** `public/sw.js` = `78fc3b0ac1d10de8a5baccb753eca33c`. `CACHE` is still
  `magic-vet-v20` (`public/sw.js:1`). **Phase 3 does not touch it.**
* **FC-3 CONFIRMED by byte count**, not by eye: the awk filter string in `phase-state.md:27` is
  `awk '$NF !~ /^\.oplan\//'` and carries TWO backslash bytes.
* **FC-6 CONFIRMED by execution.** `data/story-words.json` holds exactly ten entries and the shipped
  `readStoryWords()` accepts them (see 1.4).
* **FC-2** is untouched by this phase — phase 3 buys no audio. `scripts/build-word-audio.js` is
  **not** in phase 3's write set.
* **FC-5** is untouched by this phase — phase 3 writes no CSS.
* **FC-7** is untouched by this phase in `reader.js` / `words.js` / `styles.css`. **But see §4.4: a
  quiz item file contains no Hebrew and must not, and this plan adds a gate clause that says so.**

### 1.3 Test ledger, contrast, and endings

```
$ npm test
# tests 380
# suites 0
# pass 380
# fail 0
1..375

$ grep -rh '^test(' tests/*.js | wc -l
375

$ node scripts/check-contrast.mjs | tail -1
ALL PASS
$ node scripts/check-contrast.mjs | grep -c '^PASS'
58
```

**380 reported / 375 flat / 0 fail / contrast 58 PASS.** Exactly the figures in
`phase-state.md:10`. The 5-item gap between reported and flat is `tests/dev-server.test.js`'s
subtests, as field guide 5 records.

**Line endings, measured by CR-byte count only (field guide 16), never with grep:**

```
FILE                                                 CR       LF  VERDICT
public/quiz/light.json                                0       16  LF
public/quiz/run.json                                  0       16  LF
public/audio/words/index.json                         0        1  LF
data/story-words.json                                 0       12  LF
lib/quiz-item.js                                      0      427  LF
scripts/check-quiz-bank.mjs                           0      213  LF
scripts/quiz-topup.mjs                                0      128  LF
tests/quiz-bank.test.js                               0      178  LF
tests/quiz-core.test.js                               0      190  LF
public/sw.js                                         51       51  CRLF
public/quiz.js                                      346      346  CRLF
public/quiz-core.js                                   99       99  CRLF
.oplan/word-quiz/qz8-exclusions.txt                   0       37  LF
```

And the whole bank, swept and instrumented:

```
OBSERVED 62 bank files: LF=62 CRLF=0 MIXED=0
```

**EVERY file phase 3 writes is LF.** No CRLF file is in phase 3's write set. This removes the whole
`core.autocrlf` trap class from this phase — but the §VAL-F3 preamble still asserts it, because
"the phase does not touch a CRLF file" is a claim that must be gated, not remembered.

### 1.4 The bank, the manifest and the bands — re-derived by executing the shipped code

```
$ node scripts/check-quiz-bank.mjs
QUIZ BANK OK: 62 files, 84 items
MULTI-SENSE: 19 files with >=2 items
(exit 0)

$ find public -type f | wc -l
2382
$ ls public/audio/words/*.aac | wc -l
2264
```

Executing `scripts/build-word-audio.js`'s own exports (mirror,
`evidence/m2-q2.mjs`) — **instrumented**:

```
=== SET SIZES (all re-derived by executing the shipped code) ===
bandWords()        = 2254
readStoryWords()   = 10
wordsToGenerate()  = 2264
clipsOnDisk()      = 2264
manifest entries   = 2264
manifest === clipsOnDisk() (deep, ordered): true
manifest \ bands   = 10 ["after","deer","feet","glow","growl","harm","moon","nervous","scary","tight"]
bands \ manifest   = 0 []
```

**The divergence F2-2 warns about is ONE-DIRECTIONAL and exactly ten words.** The manifest is a
strict superset of the band set. There is no word in the bands that is missing from the manifest.
`design.md:100` / `phase-state.md:10` / `STATUS.md` figures all confirmed.

### 1.5 What `design.md` §3 B got wrong about the item format

`design.md:98-100`, quoted in the brief §6, describes the item as
``{lemma, sense, sentence-with-`___`, answer, distractors[≥5]}``.

**`distractors[≥5]` is wrong as a description of the contract.** It describes `isUsableItem`
(`public/quiz-core.js:38`), which is the browser's *runtime tolerance*, not the authoring contract.
The authoring contract is `lib/quiz-item.js:24`:

```js
const DISTRACTOR_COUNT = 8;
```

and `lib/quiz-item.js:246-250` makes it a hard error:

```js
if (distractors.length !== DISTRACTOR_COUNT) {
  errors.push(
    `rule 7: distractors must be exactly ${DISTRACTOR_COUNT}, got ${distractors.length}`
  );
}
```

**Exactly eight, not at least five.** Everything phase 3 writes obeys eight. This is RECORD GAP 3.
It is the "at least one detail of it is worth checking against the code" the brief §8 warned about.

---

## §2. Q1 — **WHICH WORDS?** The question the whole phase stands on.

### 2.1 Does a list of her words exist on this machine today? **NO.**

A machine-wide identity sweep was run over `C:/Users/dkreinov` — the F1-4 form, asking every file
"are you a profile?" rather than looking in remembered directories (design §1's own LESSON).
It prints **paths and word-key COUNTS only. No word of hers is printed anywhere, by construction.**
Script: `evidence/m5-identity-sweep.mjs`.

```
[identity sweep] ROOTS=["C:/Users/dkreinov"]
[identity sweep] OBSERVED files=303840 candidate-text=29692 parsed-with-"words"=25 PROFILE-SHAPED=21 read-errors=0

PATH | wordKeys | bytes | chapters   (NO WORD IS EVER PRINTED)
C:\Users\dkreinov\english-app-sandbox\profile.json      | 6 | 4385 | 1
C:\Users\dkreinov\finish-art\served-profile.json        | 6 | 3524 | 1
C:\Users\dkreinov\finish-audio\sandbox-pristine.json    | 6 | 4385 | 1
C:\Users\dkreinov\finish-fixture\sandbox-profile.json   | 6 | 4385 | 1
C:\Users\dkreinov\trophies-val\sandbox\profile.json     | 6 | 4385 | 1
C:\Users\dkreinov\polish-deploy\selftest\{base-copy,base,f1..f6}-live.json   | 2 each | 8 files
C:\Users\dkreinov\trophies-deploy\selftest\{base-copy,base,f1..f6}-live.json | 2 each | 8 files
```

Identity confirmed by digest, not by name (`evidence/m6-synth.mjs`):

```
frozen synthetic md5 (phase 1 step 1.1): 91eff5da59674d7463f462fad659534e
english-app-sandbox/profile.json    md5=91eff5da... matchesFrozen=true  words=6 keysSubset=true keysSuperset=true
finish-art/served-profile.json      md5=bccc45d7... matchesFrozen=false words=6 keysSubset=true keysSuperset=true
finish-audio/sandbox-pristine.json  md5=91eff5da... matchesFrozen=true  words=6 keysSubset=true keysSuperset=true
finish-fixture/sandbox-profile.json md5=91eff5da... matchesFrozen=true  words=6 keysSubset=true keysSuperset=true
trophies-val/sandbox/profile.json   md5=91eff5da... matchesFrozen=true  words=6 keysSubset=true keysSuperset=true
```

**VERDICT: 21 profile-shaped files exist on this machine and NONE is hers.** Five carry the frozen
synthetic 6-word fixture (four byte-identical to the frozen md5; `finish-art/served-profile.json`
differs in bytes but has the *identical word-key set*, i.e. it is a dev-server rewrite of the same
synthetic fixture, not her data). Sixteen are the 2-word comparator fixtures. D27 held.

**F1-4 CONSEQUENCE, unasked-for but found:** phase 1's sweep criterion was "md5 equals the frozen
synthetic OR <=2 words". `finish-art/served-profile.json` **fails that criterion** (6 words, wrong
md5) while being provably not hers. Phase 4's re-run of the sweep must widen the criterion to
"identical word-key set to the frozen synthetic" or it will raise a false alarm. Recorded as
RECORD GAP 6; it is phase 4's, not phase 3's.

### 2.2 Two partial leaks of her vocabulary DO survive, in the record

Reported as yes/no plus paths, never contents, per the brief:

| path | what it is | still relevant? |
|---|---|---|
| `.oplan/word-quiz/topup-1-words.txt` | 63 bytes, **12 lines**, derived from her 2026-07-27 live capture | **NO.** Checked by membership, printing no word: `lines=12 ALREADY IN BANK=12 NOT IN BANK=0`. These 12 are exactly the delta that took the bank from 50 files to 62. They give phase 3 nothing. |
| `.oplan/word-finish/design.md:17` | names **6 of the 12** sandbox words in prose | Historical. It is her real vocabulary, in the repo, in plain text, and D27's deletion policy never covered the `.oplan` record. Flagged as RECORD GAP 7; **not phase 3's to fix**, but the owner should know it exists. |

`.oplan/word-g1/topup-2-words.txt` and `topup-2-dropped.txt` are both **0 bytes / 0 lines**.

### 2.3 What the chapter-first quiz actually selects from — **driven, not read**

The selector is `chapterQuizLemmas(chapter, words, pool, asked, rand)`, exported from
`public/views/reader.js:251`. Its inputs are:

* `chapter.glossary` — the story generator's per-chapter word list;
* `words` — `profile.words`, used **only** as a `hasOwnProperty` membership test
  (`reader.js:260`), so **any status counts**, including `learning`;
* `pool` — `pickCandidateWords(profile,1).concat(pickQuizWords(profile,20))`
  (`reader.js:492-494`), which is `candidate` UNION `known` **only**;
* `asked` — the sitting's already-asked set.

It returns `glossary INTERSECT words` (shuffled) ++ fresh pool ++ repeat pool. `startQuiz`
(`public/quiz.js:232-245`) then walks that list, calls `loadItem` (`quiz.js:142`), and **a lemma
with no `public/quiz/<lemma>.json` is silently skipped** (`quiz.js:149` returns null, `:236`
`continue`s) until it has four.

**Driven on the SHIPPED module, with a SYNTHETIC fixture built here** (`evidence/m8-selector.mjs`).
The fixture's glossary is the ten phase-2 story lemmas plus four ordinary band words; the profile
holds four `known` words and ten `learning` words — the status a tapped story word gets
(`lib/profile.js:265`):

```
chapterQuizLemmas imported from the SHIPPED public/views/reader.js: function
OBSERVED bank files = 62
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]

OBSERVED 14 candidate lemmas in order.
  bank file MISSING (silently skipped by quiz.js:149 -> loadItem null):
      ["deer","glow","growl","scary","nervous","tight","harm","feet","after","moon"]
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]

Now the SAME fixture but with items present for the ten glossary lemmas:
  the FOUR questions she would get: ["deer","glow","growl","scary"]
```

**THE PREMISE IS VERIFIED, NOT REFUTED.** The chapter-first rule puts her story words FIRST and
then every one of them is silently dropped, so she receives the global pool and nothing changes
from chapter to chapter. This reproduces, on the shipped code, exactly the shape
`.oplan/word-polish/journal.md:25-28` measured against her real capture:

> "The quiz item bank holds 62 lemmas; her 36 distinct glossary words intersect it in exactly ONE
> (`light`), which is not in her `profile.words`, so its answer would 400. Driving the SHIPPED
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
> zoo` for EVERY chapter — identical to today."

And the second run shows the fix working: give those ten an item and she is asked **her own story
words**.

### 2.4 THE PREMISE AS WRITTEN IN design.md / phase-state.md / STATUS.md IS WRONG

Three documents say the same wrong thing:

* `design.md:14` — *"only **1** of her ~40 words has a quiz item"*
* `phase-state.md:81` — *"only ONE of her ~40 words has an item"*
* `STATUS.md:35` — *"Only 1 of her ~40 words has a quiz question."*

The measured statement they are all garbling is `.oplan/word-polish/journal.md:25-26`, which says
**"her 36 distinct GLOSSARY words intersect it in exactly ONE"** — glossary words, not profile
words. The two sets are different and the difference is the whole phase.

**Her PROFILE words are largely covered already**, and it was measured:
`.oplan/word-g1/journal.md:639-641`, 2026-07-28, running the shipped `quiz-topup.mjs` against her
real captured profile:

> `TOPUP known=12 candidate=0 pool=12 dropped=0 covered=12 missing=0 banned=0`
> `RESULT: N=0 ... every word she has claimed OR the app has nominated already has an item`

Her last known live shape is `.oplan/word-polish/phase-state.md:36`, 2026-08-01:
**40 words / 15 known / 6 chapters.** So ~25 of her 40 words are `learning` — tapped story words —
and those are precisely the ones `quiz-topup.mjs` structurally cannot see.

### 2.5 **THE TRAP, EXECUTED.** `quiz-topup.mjs` reports `missing=0` while nothing works.

The obvious, documented, "reuse rather than re-implement" move is to derive phase 3's word list
with `scripts/quiz-topup.mjs`. **Run it on the exact fixture from §2.3** — a profile in which ten
of fourteen words have no item and are the ten chapter-first asks first:

```
$ node scripts/quiz-topup.mjs --profile evidence/synth-profile.json
TOPUP known=4 candidate=0 pool=4 dropped=0 covered=4 missing=0 banned=0
EXIT=0
```

**It reports NOTHING MISSING.** It is not broken — it is answering its own question correctly
(`quiz-topup.mjs:1-2`: *"the top-up covers `known` UNION `candidate`, on-manifest words only"*).
But that question is not this phase's question. Deriving phase 3's target set from `quiz-topup.mjs`
produces an empty set, a green close, and **zero change to anything she would see** — which is
`.oplan/word-polish/journal.md` FINDING 2 shipped a second time.

This is the single most important measurement in this plan. It is answered in full in §9 (Q10).

### 2.6 The candidate target sets, each with its measured size and its cost

| # | candidate set | measured size | derivable offline? | cost / objection |
|---|---|---|---|---|
| **S1** | `quiz-topup.mjs` output against a fresh live capture (`known` UNION `candidate`, minus QZ-8, minus off-manifest, minus banked) | **0 on the last two real captures** (`covered=12 missing=0`, 2026-07-28); unknown today | **NO** — needs a live read | Structurally blind to `learning` words. §2.5 proves it green-and-useless. |
| **S2** | her chapter-glossary words INTERSECT `profile.words` — **the set chapter-first actually reaches** | **36 distinct glossary words** measured 2026-08-01 (word-polish FINDING 2); intersection with the bank was **1** | **NO** — needs her live profile AND her live chapters | This is the honest target. It is the set the design *meant*. |
| **S3** | `data/story-words.json` — the ten base lemmas phase 2 derived **from her chapters** | **10**, measured: `readStoryWords() = 10` | **YES, entirely offline** | A repo-resident *subset* of S2. At 1-3 items per file (QZ-1 rule 2) this is **10 files / 15-25 items**. It is a proxy, and the plan must say so out loud. |
| **S4** | every glossary word the repo can reach for any story | **not derivable** — chapters live only in her profile; `lib/story.js` generates them at run time | NO | — |
| **S5** | a band-derived set (the whole manifest) | 2264 − 62 banked − 37 excluded = **2165 words**, ~2 items each => ~4300 items | YES | **This is D8, which owner-decision D23 explicitly REVERSED** (`.oplan/word-quiz/design.md:158-196`): *"lets just work daily if she made new words we will see and generate quiz"*. Measured at ~55M tokens / ~45 h. Do not propose it. |

**S3 is the only set derivable without touching production, and it is a proxy for S2, not S2.**
Its provenance is good: the ten came from *her* chapters (word-polish FINDING 3 derived them from
her story glossary), they are frozen under FC-6, and §2.3 proves **by execution** that giving them
items puts her own story words on screen. But it is 10 of her ~36 glossary words, and the plan must
not pretend it is the whole thing.

Every one of the ten is generable today — measured (`evidence/m7-ten.mjs`):

```
OBSERVED ten = 10 | bank files = 62 | exclusions = 37
  after     inBank=false excluded=false resolveLemma->after   rule8pos={<NO ENTRY = EXEMPT>}
  deer      inBank=false excluded=false resolveLemma->deer    rule8pos={<NO ENTRY = EXEMPT>}
  feet      inBank=false excluded=false resolveLemma->feet    rule8pos={<NO ENTRY = EXEMPT>}
  glow      inBank=false excluded=false resolveLemma->glow    rule8pos={<NO ENTRY = EXEMPT>}
  growl     inBank=false excluded=false resolveLemma->growl   rule8pos={<NO ENTRY = EXEMPT>}
  harm      inBank=false excluded=false resolveLemma->harm    rule8pos={<NO ENTRY = EXEMPT>}
  moon      inBank=false excluded=false resolveLemma->moon    rule8pos={<NO ENTRY = EXEMPT>}
  nervous   inBank=false excluded=false resolveLemma->nervous rule8pos={<NO ENTRY = EXEMPT>}
  scary     inBank=false excluded=false resolveLemma->scary   rule8pos={<NO ENTRY = EXEMPT>}
  tight     inBank=false excluded=false resolveLemma->tight   rule8pos={<NO ENTRY = EXEMPT>}
```

None is banked, none is QZ-8-excluded, each resolves to itself. **But every one of them is
rule-8 EXEMPT** — see §3.4, which is a real and previously unrecorded consequence of phase 2.

### 2.7 **RULED BY THE ORCHESTRATOR: CAPTURE. Target is S2.**

This was drafted as blocker B-F3-1. **The orchestrator ruled it mid-planning, owner-approved
2026-08-02, and made it STANDING** (*"dont ask me next time just capture"*):

> A live capture of her profile **IS AUTHORISED** for phase 3, and it is the **ORCHESTRATOR's to
> run, never a worker's**. Nothing about this ruling relaxes the planner's read-only, no-money,
> no-production constraints.

**So the target is S2 — the set the design meant — and S3 becomes the fallback if the capture
returns nothing usable.** The planner made no request of any kind; the capture is step 3.1.

**Four consequences, all of which this plan now owns:**

1. The capture is an **explicit early step**, tiered ORCHESTRATOR, using the **frozen command
   quoted verbatim** (§10 / 3.1). It is not assumed to have happened.
2. The capture carries a **receipt, an outside-the-repo home, and a proved deletion** at the phase
   close — D27 is standing policy and F1-4's sweep must still be clean at phase 4.
3. **§VAL-F3 grew two clauses for it — V14 and V15 — and both were seen to fire.** V14 catches a
   capture loitering inside the repo *including a gitignored one, which V1 structurally cannot
   see*; V15 checks the sandbox fixtures are still synthetic.
4. **The word list is derived through the SHIPPED `scripts/quiz-topup.mjs`, whose filters are
   reused and not re-implemented** — but §2.5 has already measured that its POOL is blind to the
   words this phase exists for. §2.8 resolves that without re-implementing a single filter.

### 2.8 **Reusing `quiz-topup.mjs` WITHOUT re-implementing it, and without walking into §2.5's trap**

The orchestrator's instruction is *"Reuse it; do not re-implement its filters."* That instruction is
right, and §2.5's measurement is also right, and they are not in conflict — because the script has
**two separable parts**:

| part | what it is | phase 3 |
|---|---|---|
| the **POOL** (`:69-76`) | `status === 'known'` or `'candidate'` | **wrong for this phase** — her chapter-glossary words are `learning` (`lib/profile.js:265`), so the pool skips exactly the words chapter-first asks first |
| the **FILTERS** (`:78-99`) | QZ-8 exclusions -> **direct** manifest membership (never `resolveLemma`, quoting rule 12) -> already-banked | **exactly right, and re-implementing them would be a second drifting copy of the contract** |

**The resolution is a PROJECTION, and the repo already contains the idiom.**
`public/quiz-core.js:81-98` — inside the QZ-18-frozen file — does precisely this, and explains why:

> *"candidates are ranked by projecting them onto a throwaway profile in which they read as `known`
> and handing THAT to `pickQuizWords` itself. So "ordered inside its tier by the existing
> comparator" is true by construction, not by a copy that can drift. The projection copies each
> entry, so the caller's profile is never mutated."*

Phase 3 does the same thing one level up. **`scripts/quiz-topup.mjs` is run UNMODIFIED, twice:**

* **RUN 1 — the raw capture.** `node scripts/quiz-topup.mjs --profile $BK`.
  This is the `known ∪ candidate` answer, i.e. **S1**. It is kept as the **contrast measurement**
  and written into the journal beside run 2. §2.5 predicts it will be at or near `missing=0`.
* **RUN 2 — a PROJECTED copy of the capture**, written outside the repo, in which every word key
  that appears in any chapter glossary is copied with `status: "known"`. Every other field is
  untouched; the original capture is never mutated.
  `node scripts/quiz-topup.mjs --profile $PROJECTED`.
  This is **S2**, produced by the shipped filters, in the shipped order, with no filter re-written.

**The target set is the union of the two NEED lists.** Run 1 can only add words run 2 missed (a
`known` word she never met in a chapter), so the union is never smaller than either.

**Which set does `--manifest` point at? THE MANIFEST — the default, unchanged.** This is the F2-2
ruling of §3, applied to this flag specifically:

* `quiz-topup.mjs`'s default is already `public/audio/words/index.json` (`:18`), and its own header
  gives the reason: a word absent from it *"[makes] QZ-1 rule 12 ... an item impossible"* **and it
  has no clip either**. Both halves of that reason are statements about the **disk**, which after
  phase 2 is exactly what the manifest is.
* Pointing it at the bands would drop the ten phase-2 words — `after deer feet glow growl harm moon
  nervous scary tight` — which are `manifest \ bands` (§1.4) and are precisely the story-glossary
  words most likely to appear in her chapters. It would silently delete the phase's best targets.
* **No flag is passed. The default is correct, and §VAL-F3 V6 gates that the same set reaches the
  contract.**

**The instrumented cross-check that stops §2.5's trap from recurring**, run in step 3.1 and pasted
into the journal:

```
TOPUP-RUN-1 (raw)       known=<k> candidate=<c> pool=<p> dropped=<d> covered=<v> missing=<M1>
TOPUP-RUN-2 (projected) known=<k'> candidate=<c'> pool=<p'> dropped=<d'> covered=<v'> missing=<M2>
GLOSSARY   chapters=<n> distinct-glossary-words=<g> glossary-in-profile=<gp>
UNION      N=<N>
```

**If `M1 == M2` the analysis in §2.5 is wrong and step 3.1 STOPS for a re-ruling** rather than
proceeding on a number nobody expected. If `g == 0` the glossary extraction is broken and the step
stops — a sweep that observed nothing is decoration (field guide 18).

---

## §3. Q2 — **F2-2 RULED: `allowed` MEANS THE MANIFEST.**

### 3.1 F2-2 names the WRONG CALLERS. Both of them.

F2-2 (`phase-state.md:62-64`) says:

> "`lib/quiz-item.js` resolves tokens through `resolveLemma` against a set its CALLERS supply
> (`scripts/build-item-bank.js`, `scripts/quiz-topup.mjs`)."

The brief §4 warned that those two names are the orchestrator's recollection. **They are wrong.**
Grepping the ARTIFACT's path, not the accessor (field guide 25), over every file in the repo
outside `node_modules`, `.git` and `.oplan`:

```
$ grep -rn "quiz-item" --include=* .
./scripts/check-quiz-bank.mjs:12:// Every rule lives in lib/quiz-item.js and is applied ONLY through
./scripts/check-quiz-bank.mjs:22:// lib/quiz-item.js has always returned it as a full error. That split was the
./scripts/check-quiz-bank.mjs:30:import { buildPosIndex, validateItemFile } from '../lib/quiz-item.js';
./tests/quiz-bank.test.js:32:// These three items are the ones tests/quiz-item.test.js already proves legal
./tests/quiz-item.test.js:7:import { buildPosIndex, validateItem, validateItemFile } from '../lib/quiz-item.js';
```

**`lib/quiz-item.js` has exactly TWO importers, and neither is one F2-2 names:**

1. `scripts/check-quiz-bank.mjs:30`
2. `tests/quiz-item.test.js:7`

* **`scripts/build-item-bank.js` does not import it and never has.** It is the **placement**
  item-bank generator: its own header (`:1-4`) says *"One-time offline generator for the placement
  item bank ... then writes `data/placement-items.json`."* Its `allowed` at `:199` is
  `buildAllowedTokens(band1)` — a set of band1 *tokens* for micro-text vocabulary control, a
  completely different object. **It has never written one byte into `public/quiz/`.** See §5.1;
  this is the same error in `design.md:107` and brief §6, and it is RECORD GAP 4.
* **`scripts/quiz-topup.mjs` does not import it either.** It reads the manifest directly
  (`:65`, `const allowed = new Set(JSON.parse(readFileSync(opts.manifest, 'utf8')))`) and applies
  a *membership* filter, quoting rule 12 as its justification (`:78-81`). It never calls
  `validateItem`.

Grepping every *other* path by which an `allowed` set reaches the contract or the top-up:

```
scripts/check-quiz-bank.mjs:106:  const allowed = new Set(read('public', 'audio', 'words', 'index.json'));
scripts/quiz-topup.mjs:65:      const allowed = new Set(JSON.parse(readFileSync(opts.manifest, 'utf8')));
tests/quiz-item.test.js:21:     const allowed = new Set(read('public', 'audio', 'words', 'index.json'));
scripts/build-item-bank.js:199: const allowed = new Set();   // buildAllowedTokens(band1) — PLACEMENT, not the quiz bank
lib/story.js:24:                const allowed = new Set();   // buildAllowedSet — the story generator
```

**All three real consumers of the QZ-1 contract already build `allowed` from
`public/audio/words/index.json`.** So F2-2's question is not open in the code: **the shipped answer
is already the manifest.** What phase 3 must do is *state and gate* that, not decide it.

### 3.2 THE RULING — `allowed` = the MANIFEST (`public/audio/words/index.json`, 2264 entries)

Reasons, in order of weight:

1. **It is what the code does today.** Choosing the bands would be a CHANGE to a shipped, green
   gate, not a decision. `check-quiz-bank.mjs:106` is unambiguous. Field guide 22's test applies:
   the pin names a property, and the property is "the answer has a clip".
2. **Rule 12's own comment says why.** `lib/quiz-item.js:161-163`:
   > *"the answer is the word we play a clip for, so it must be that word exactly -- not a form
   > that resolves to it, not a capitalisation of it."*
   After phase 2 the manifest **is** "which clips exist on disk" (`writeManifestFromDisk`,
   verified: `manifest === clipsOnDisk()` deep-equal `true`). The bands are "what we *intended* to
   generate". Rule 12's purpose is served only by the manifest.
3. **Rule 7 is an audio claim too.** `public/quiz.js:263` plays
   `/audio/words/<option>.aac` for **every** option, distractors included. A distractor outside the
   manifest is a dead speaker button in the quiz. Manifest again.
4. **Consistency with the third manifest consumer.** `api/profile.js:6` imports the manifest
   directly as `ALLOWED_WORDS` for `migrateWordKeys` (field guide 25). Using the bands for the item
   contract while the profile normaliser uses the manifest would give one word two meanings.
5. **Choosing the bands would kill S3 outright.** All ten story lemmas are `manifest \ bands`, so
   under a bands-only `allowed`, rule 12 would reject every one of them and no item could exist for
   any word phase 2 just recorded.

### 3.3 Consequences of the phase-2 divergence — **measured, both directions**

Running the SHIPPED `validateItemFile` over the SHIPPED bank under each candidate set
(`evidence/m2-q2.mjs`, instrumented):

```
=== GATE UNDER EACH CANDIDATE `allowed` SET ===
[MANIFEST (2264, what the shipped gate uses)] allowed=2264 OBSERVED files=62 items=84 problems=0
[BANDS-ONLY (bandWords())]                    allowed=2254 OBSERVED files=62 items=84 problems=0
```

* **Does the existing bank still pass under the post-phase-2 set? YES — 0 problems, 62 files,
  84 items.** (And it would also pass under the bands, so the divergence has broken nothing.)
* **Does the divergence make any word newly INELIGIBLE? NO.** `bands \ manifest = 0`. The manifest
  is a strict superset; nothing was lost.
* **Does it make any word newly ELIGIBLE? YES, exactly ten** —
  `after deer feet glow growl harm moon nervous scary tight`. Those ten can now legally be an
  `answer` (rule 12), a `distractor` (rule 7) and a sentence token (rule 4), where before phase 2
  they could be none of those.

### 3.4 **THE THING NOBODY RECORDED: the ten new lemmas switch rule 8 OFF.**

`buildPosIndex` (`lib/quiz-item.js:82-100`) derives every part of speech from `band1`/`band2`
entries. The ten are **not in the bands**, so they get no entry at all, so `posSetFor` returns an
empty Set, so `validateItem`'s rule-8 block is skipped entirely
(`lib/quiz-item.js:289`, `if (answerPos.size > 0)`).

Measured (`evidence/m3-exempt.mjs`, instrumented):

```
[MANIFEST] OBSERVED 2264 allowed words; posIndex entries=2204; NO band entry=60; entry-but-empty-pos=13; TOTAL rule-8-EXEMPT=73
[BANDS]    OBSERVED 2254 allowed words; posIndex entries=2204; NO band entry=50; entry-but-empty-pos=13; TOTAL rule-8-EXEMPT=63
```

**The rule-8 exempt population grew from 63 to 73, and all ten new members are exactly the ten
words S3 wants items for.** Consequences:

* **`lib/quiz-item.js:58` and `:276` are now STALE.** Both say *"63 of 2254"*; under the shipped
  `allowed` it is **73 of 2264**. These are COMMENTS, not gates — field guide 22's test says a pin
  that describes a *spelling* moves and a pin that describes a *property* stays. This is neither:
  it is a measured figure inside a comment. **Phase 3 does NOT edit `lib/quiz-item.js`** (see the
  write-set discipline in §10) — the file is a shared contract and touching it to fix a comment
  buys nothing and risks the whole gate. Recorded as RECORD GAP 5 and surfaced to the orchestrator.
* **The real consequence is not the comment, it is the protection.** For all ten target words,
  the one mechanical rule that constrains distractor *class* does not fire. D21 chose same-class
  distractors precisely because they test meaning rather than grammar, and rule 8 is the only
  mechanical enforcement of that choice. For these ten, distractor class is **entirely a
  human/agent judgement**, with no gate underneath.
* **Therefore §6's correctness pass is not optional for these words — it is the only thing there
  is.** Every step that generates an item for a rule-8-exempt answer must state that in its packet,
  and the plan's step 3.2 adds a gate clause that COUNTS rule-8-exempt answers in the new batch and
  prints the number, so it can never be a silent property. See step 3.2.

### 3.5 Where the ruling gets WRITTEN DOWN, so it is not re-decided

Field guide 24: a ruling that lives only in a journal is a ruling that will be re-made wrongly.
The F2-2 ruling is recorded in **three** places by step 3.7 (the close):

1. `phase-state.md` FROZEN CONTRACTS, as a new **FC-8**;
2. a gate clause in the phase's own validation (§VAL-F3 clause V7) that asserts
   `check-quiz-bank.mjs` builds `allowed` from `public/audio/words/index.json` **and from nothing
   else**, so a future edit that swaps in the bands fails loudly;
3. `journal.md`.
---

## §4. Q8 — ITEM SHAPE. Decided from the CODE, not from the design's summary.

The contract is `lib/quiz-item.js` (QZ-1 in code) plus the authoring rules QZ-2 at
`.oplan/word-quiz/plan.md:157-225`. Both are quoted, not named, in every packet this phase
dispatches (field guide 9).

### 4.1 How many items per file? **1-3, driven by meaning count. Expect ~1.5 average.**

`lib/quiz-item.js:370-372` is the hard bound:

```js
if (items.length < 1 || items.length > 3) {
  errors.push(`rule 2: file must hold 1-3 items, got ${items.length}`);
}
```

QZ-2 sets the authoring rule, quoted verbatim:

> *"**One item per distinct meaning an 11-year-old would actually meet.** `run` (move fast / a run
> in a game), `light` (not heavy / not dark). Abstract words one context cannot pin get 2. Concrete
> single-sense words get 1. **Hard cap 3.** (D9)"*

Measured on the shipped bank: **62 files / 84 items / 19 multi-sense** — an average of 1.35.
**The plan does NOT pin an item count.** Pinning one would push a worker to invent a second sense
for a single-sense word, which is the shape of a fabricated item. The gate's own
`MULTI-SENSE: N files with >=2 items` line is reported per batch instead, and step 3.4's validation
asserts only `items >= files` and `files == the ruled word count`.

### 4.2 Are multi-sense files produced? **Yes, where the word genuinely has two meanings.**

`scripts/check-quiz-bank.mjs:161-175`'s sampler was built expressly so multi-sense items are not
hidden from the human gate (`:157-160`: *"Sampling per file and always printing item[0] would hide
exactly the multi-sense items that the multi-sense generation rule exists to produce"*). Producing
none would waste that machinery, and rule 9 already forces distinct senses within a file.

### 4.3 How many distractors, and why that number? **EXACTLY 8 — and the reason is derivable.**

`lib/quiz-item.js:24` `const DISTRACTOR_COUNT = 8;`, enforced hard at `:246-250`. Not `>=5`
(RECORD GAP 3). The *reason* for eight is not in the contract prose, so it was derived by driving
the shipped `selectOptions`:

```
$ node -e "import { selectOptions } ..."
options length (answer+5): 6
with knownSet EMPTY      -> chosen from distractors: [ 'd1','d2','d3','d4','d5' ]
with knownSet {d6,d7,d8} -> chosen:                  [ 'd6','d7','d8','d1','d2' ]
```

`public/quiz-core.js:21-24` picks **five of the eight at run time, preferring the ones she already
knows**. A pool of exactly five would make that preference a no-op — she would always see the same
five, and the "show her words she recognises" behaviour would silently stop working. **Eight is a
pool, five is the draw.** This is why `isUsableItem`'s `>= 5` (the browser's tolerance for a
degraded file) and the contract's `=== 8` (the authoring requirement) are both correct and
different, and why quoting the former as the contract is the error in `design.md:99`.

### 4.4 How are distractors chosen so rule 8 can pass?

D21, quoted verbatim from `.oplan/word-quiz/design.md:78-95`:

> *"**distractors come from the same semantic class as the answer**, so `light` is tested against
> `big small old new wide round thin`. An item must test the MEANING, not the grammar. ... **This
> raises the one risk the design calls worst — a distractor that also fits marks her wrong for
> being right.** The mitigation is that the SENTENCE must now do the disambiguating work."*

Mechanically, rule 8 (`lib/quiz-item.js:278-305`) requires the answer's pos SET and each
distractor's pos SET to intersect when both are non-empty. **For every word in S3 the answer's set
is EMPTY, so rule 8 does not fire at all** (§3.4). The packet therefore carries D21 as an
instruction and step 3.2 adds an instrumented count of rule-8-exempt answers so it is visible
rather than silent.

Two further constraints that phase 3 must carry, both from QZ-2, both quoted in the packet:

* **Rule 7 is DIRECT manifest membership; rule 4 de-inflects.** *"`cats` is not a legal distractor
  even though `cats` is legal inside a sentence."*
* **`data/story-words.json`'s ten give the sentence-writer ten new legal tokens** it never had.

### 4.5 **QZ-2 CONTAINS A MEASURED CLAIM THAT PHASE 2 MADE FALSE.**

QZ-2 (`.oplan/word-quiz/plan.md:216-222`), quoted verbatim, is mandated into every generation
packet by `.oplan/word-g1/plan.md:2918-2925`:

> *"**THE ALLOWED VOCABULARY IS NOT ORDINARY ENGLISH — this will bite you.** MEASURED against the
> real manifest: `after`, `children`, `men`, `women`, `feet` are all **ABSENT**, while `before`,
> `went` and `gone` are present."*

Measured today (`evidence/m7-ten.mjs`):

```
collision probe: manifest has "feet"=true "foot"=true; resolveLemma("feet")=feet
collision probe: manifest has "after"=true "afternoon"=false; resolveLemma("after")=after
```

**`after` and `feet` are now PRESENT.** Phase 2 added them. Two of QZ-2's five named examples are
false, and both are S3 target words — so a worker handed QZ-2 verbatim would be told the two words
it is being asked to write items for cannot appear in a sentence.

Field guide 22's test: does the pin name a property or a spelling? The property — *"do not trust
your instinct for simple English; check every word against `public/audio/words/index.json`"* — is
still exactly true. The **examples** are stale. So the packet carries QZ-2 **verbatim, unchanged**,
plus a **RIDER** immediately beneath it, re-expressing rather than deleting:

> RIDER (word-finish phase 3, 2026-08-02): QZ-2's example list predates the phase-2 top-up.
> `children`, `men` and `women` remain ABSENT. **`after` and `feet` are now PRESENT** — measured,
> `manifest has "after"=true`, `manifest has "feet"=true`. The rule is unchanged: check every word
> against the manifest. Nothing else in QZ-2 moves.

Step 3.2's gate asserts the rider is present in the packet and that the manifest really does contain
both words, so the rider cannot rot the way the claim it corrects did. RECORD GAP 8.

### 4.6 Is the gloss generated or derived? **Generated. It cannot be derived for S3.**

`data/band1.json` / `data/band2.json` carry a `meaning` field. Measured
(`evidence/m4-nearmiss.mjs`, instrumented):

```
[meaning index] OBSERVED 3357 band entries; 1093 carry a meaning; 627 distinct lemmas indexed
[meaning coverage] 619 of 2264 manifest words have a band meaning (27.3%)
```

**Coverage is 27.3% overall and 0% for all ten S3 words** — they have no band entry at all
(§2.6). So the gloss is authored, under rules 9 (non-empty, trimmed, <=80 chars, distinct within a
file), 11 (every gloss token resolves into the manifest) and 13 (the gloss must not name any of the
item's own distractors). D28 (`.oplan/word-quiz/design.md:146-148`) governs its presentation:

> *"The QUALITY BAR reverts to the pre-D22 strict form: **every distractor must be wrong in the
> sentence alone** (the pin test), because the child who never presses the hint faces the sentence
> bare. The gloss remains a second net for the child who does press it."*

**The bar is QZ-24 (sentence-only), not D22 (gloss-shielded).** Any packet quoting D22's
presentation clause quotes a superseded rule.

---

## §5. Q4 — THE GENERATOR. **The design names the wrong precedent, and the wrong cost model.**

### 5.1 `scripts/build-item-bank.js` is NOT the precedent for this bank

`design.md:107` and brief §6 both say:

> *"Generation follows the existing house style (`scripts/build-item-bank.js` uses `gpt-4.1-mini`
> via the OpenAI chat API). **PAID API — the owner must approve the batch...**"*

`scripts/build-item-bank.js:1-4`, its own header:

> *"One-time offline generator for the **placement** item bank. Reads `data/band1.json`, calls the
> OpenAI API twice ... then writes `data/placement-items.json`."*

It does not import `lib/quiz-item.js` (§3.1). It has never written a byte into `public/quiz/`.
It is the precedent for a **different bank**. RECORD GAP 4.

### 5.2 The real precedent forbids the paid API outright

`public/quiz/*.json` was produced by **oplan worker agents authoring JSON to a frozen contract**,
in sequential batches of <=10 words, each gate-green before the next was dispatched. That is a
frozen owner-level decision, quoted verbatim from `.oplan/word-quiz/design.md:36`:

> **D7** | *"Generated by **Claude via oplan workers**, cheap tier — no paid API, no runtime LLM, no
> second key | DeepSeek V4 Flash and Kimi K2.5/K2.6 were priced and set aside; at ~5k items the
> price difference is cents and the runtime dependency is the real cost"*

and restated as a phase non-goal, `.oplan/word-quiz/plan.md:255-258`: *"No paid API call. No
runtime LLM."*, and again for the g1 top-up at `.oplan/word-g1/plan.md:2949`.

**This is field guide 24 happening again, in the same run.** A later run's design lost an earlier
run's owner-approved ruling — exactly as the phase-2 brief lost RULING B2 and said "sixteen". This
plan does not resolve it: **B-F3-2.**

### 5.3 New script, or extend an existing one? **NEITHER. No generator script is written.**

There is no generator script for this bank and there never has been, and building one would be the
*impressive* answer rather than the *robust* one (the owner's standing rule). What exists and is
reused, unchanged:

| artifact | role in phase 3 | changed? |
|---|---|---|
| `lib/quiz-item.js` | the contract. Applied only through `validateItemFile`. | **NO — not one byte** |
| `scripts/check-quiz-bank.mjs` | the gate, and the sampler for the owner gate | **NO — not one byte** |
| `scripts/quiz-topup.mjs` | **NOT USED to derive the word list** (§2.5 proves why). Run once at 3.6 as a *regression check* only. | **NO** |
| `.oplan/word-quiz/qz8-exclusions.txt` | the 37 banned words, re-verified at 37 | **NO** |

`scripts/check-quiz-bank.mjs:12-14` says why nothing is re-implemented:

> *"Every rule lives in `lib/quiz-item.js` and is applied ONLY through `validateItemFile`. This file
> re-implements nothing: a gate that re-derives a rule is a second, drifting copy of the contract."*

**The phase's new mechanical artifact is exactly one file** — `scripts/check-item-batch.mjs`, the
correctness-pass harness of §6. It imports the contract; it re-derives no rule.

### 5.4 Where the output lands before approval — **outside `public/`, and outside the repo**

Design §3 B and §5 forbid an unapproved item reaching `public/quiz/`. The staging path is
**outside the repository entirely**:

```
C:/Users/dkreinov/f3-stage/batch-<n>/<lemma>.json      the drafted items
C:/Users/dkreinov/f3-stage/APPROVED.txt                the owner's approval record (step 3.5)
C:/Users/dkreinov/f3-review/items.html                 the review page (step 3.5)
```

Outside the repo, not merely outside `public/`, for three reasons, all with precedent:
field guide 4 (*never write scratch into the repo*); `.oplan/word-g1/plan.md:3077` put its own
review page at `$HOME/g1-review/`; and `tests/quiz-bank.test.js:13` already warns *"Fixtures live in
an OS temp dir, never in `public/quiz/`: a stray file there"* would be gated by the real bank test.

Both the gate and the harness take `--dir`, so **staged items are validated in place, at full
severity, before promotion** — `node scripts/check-quiz-bank.mjs --dir /c/Users/dkreinov/f3-stage/batch-1`.

**The promotion is mechanical and is its own step (3.6).** It copies `f3-stage/batch-*/**.json` into
`public/quiz/` **only if** `APPROVED.txt` exists, is non-empty, and names every file being promoted.
The promoting script refuses otherwise. A batch that skips the owner gate structurally cannot reach
`public/quiz/`.

### 5.5 Cost control, half-finished batches, idempotence, determinism

* **Money: ZERO.** No OpenAI call, no key, no `.env`. Under D7 this phase's tier is
  ORCHESTRATOR-dispatched WORKER agents, and the cost is agent tokens.
* **Measured cost model** (`.oplan/word-quiz/design.md:169-171`): *"~9,000 tokens and ~70 seconds
  per word ... a top-up runs ~79k tokens for 3 words, 142k for 10, 276k for 25."* For S3 (10 words)
  that is **~142k tokens for generation**. The correctness pass costs roughly the same again per
  pass — `.oplan/word-quiz/journal.md:292-293`: *"generation is the cheap part, and N-pass
  adversarial verification is the entire budget."* Budget **~450k tokens for 10 words, 2 passes.**
* **A half-finished batch leaves behind:** staged `.json` files under `f3-stage/`, **outside the
  repo, outside `public/`**, unreferenced by anything. The repo write set of a half-finished
  generation step is EMPTY. That is the point of staging outside.
* **Idempotence:** re-running a batch overwrites its own staging directory and nothing else. The
  promotion step (3.6) is idempotent by content: it refuses to overwrite an existing
  `public/quiz/<lemma>.json` at all — **phase 3 creates files, it never modifies one** (with the
  single, separately-gated exception of §6.5's `light.json`).
* **Determinism:** there is **no precedent to inherit** — item generation has never been an API
  call, so no `temperature` decision exists anywhere for this bank
  (`grep -rn temperature` finds it only in `lib/openai.js`, `lib/story.js`, `api/translate.js` and
  `scripts/build-item-bank.js:71`, none of which touch `public/quiz/`). **Two runs do not produce
  the same bank, and this plan does not pretend otherwise.** What is deterministic and IS pinned:
  the gate, the sampler (`check-quiz-bank.mjs:153-175`, no `Math.random()`, byte-identical across
  runs — asserted by an existing test), the promotion step, and every validation. The
  non-determinism is confined to the drafting of English sentences, where it is inherent.
---

## §6. Q3 — THE CORRECTNESS PASS. **And a defect already in the shipped bank.**

### 6.1 What exactly is the failure?

`isUsableItem` and the whole QZ-1 gate check the SHAPE of an item. Neither can tell that a
distractor is **also a correct answer**. When that happens the child selects a right answer and the
app tells her she is wrong, in a feature whose entire purpose is confidence.

**Demonstrated, not asserted.** Three items were hand-poisoned — each carries at least one
distractor that fills the blank perfectly — and handed to the SHIPPED gate at full severity
(`wf-p3-plan/poison/`):

```
$ node scripts/check-quiz-bank.mjs --dir /c/Users/dkreinov/wf-p3-plan/poison
QUIZ BANK OK: 3 files, 3 items
MULTI-SENSE: 0 files with >=2 items
GATE EXIT=0
```

The three items, and their leaks:

| file | sentence | leaking distractors |
|---|---|---|
| `glow.json` | *"The little lamp will `___` in the dark room so we can sleep."* | `shine`, `burn` |
| `moon.json` | *"We looked up and saw the `___` in the dark sky."* | `star`, `sun`, `cloud`, `bird` |
| `harm.json` | *"Please do not `___` the little bird, it is very small."* | `hurt` |

**Eight wrong-answer traps, gate exit 0.** These three files are the phase's frozen poison set.

### 6.2 **THE SHIPPED BANK ALREADY CONTAINS SUCH A DEFECT. This changes the phase.**

`public/quiz/light.json[1]`, live today:

```
[1] sense:    a lamp that helps you to see when a room is dark
    sentence: Please turn on the ___ so that I can see my book.
    answer:   light
    distr:    radio, television, oven, fan, camera, computer, machine, motor
```

The project's own content audit called this out — `.oplan/word-quiz/journal.md:149-157`, verbatim:

> *"The content auditor found one CERTAIN leak and four PROBABLE ones. **The certain one is
> `light.json[1]`:** "Please turn on the `___` so that I can see my book." distractor: **`computer`**
> ... Turning on a computer so you can see your book is not false — it is what she does. This very
> bank teaches it: `net.json[1]` is "My school work is on the net, so I need a computer." She picks
> `computer`, she is right, and the app tells her she is wrong. **That is the single failure this
> entire phase existed to prevent**, sitting in the item I personally used as the worked example
> when explaining D21 to the owner."*

`net.json[1]`, verified in the shipped bank today: *"My school work is on the `___`, so I need a
computer."* — the collocation the audit named is still taught by the bank.

**And `light.json[1]` has never been fixed.** Its full git history, with the item printed at each
commit:

```
$ git log --oneline -- public/quiz/light.json
53f2fc8 oplan: R3+R4 - glosses rewritten for D22, rule 13 added ... 2 surviving leaks fixed
24c67dc oplan: D21 - same-class distractors; batch 1 regenerated, the pin test added to QZ-2
b89091c oplan: 1.3 batch 1 - the ten polysemous words, 22 items, gate green

--- 24c67dc ---  [1] Please turn on the ___ so that I can see my book. || radio, television, oven, fan, camera, computer, machine, motor
--- 53f2fc8 ---  [1] Please turn on the ___ so that I can see my book. || radio, television, oven, fan, camera, computer, machine, motor
```

The sentence and the distractor list are **byte-unchanged since `24c67dc`**. The later commit
rewrote the gloss and did not touch either. `television` is arguably a second leak on the same item.

The later QZ-24 sweep — **two independent blind passes over all 85 items**, recorded in
`.oplan/word-quiz/d28-sweep.txt` (`PASS A: 26 flags / 11 items · PASS B: 32 flags / 11 items`) —
reworked eleven items and deleted one, and **did not flag `light[1]` in either pass.**

Of the audit's other four PROBABLE leaks, three were addressed by that sweep
(`well[0]`/`differently` swapped out, `add[1]`/`bring` — partly, `pour` and `give` were swapped and
`bring` remains, `rest[0]`/`part` swapped while `total` remains) and one was explicitly adjudicated
KEPT with a reason (`kind[1]`/`piece`).

**Three consequences, and they change the phase:**

1. **Phase 3 owns a fix for `light[1]`.** It is one file, it costs nothing, it needs no ruling, and
   it does not depend on B-F3-1. It is step **3.3**. And `light` is not an arbitrary word — it is
   *the single word* word-polish FINDING 2 measured as the intersection of her 36 glossary words
   with the bank. The one item her chapter-first quiz could ever reach is the one carrying the
   project's known certain leak.
2. **The two-pass method's real recall is lower than the record claims.** Two blind passes missed an
   item a previous audit had already named in writing. The plan therefore adds the **seeded poison
   control** (§6.4) — a measurement the QZ-24 sweep never had.
3. **A pass that only looks at NEW items is not enough** — but re-sweeping all 84 shipped items is
   phase 3 scope creep. This plan sweeps the new batch plus `light.json`, and raises the rest as
   **B-F3-3**.

### 6.3 What detects it — mechanical, model, human — measured, not assumed

**MECHANICAL: measured at zero recall. It is not in the plan.**

`data/band1.json` / `data/band2.json` carry a `meaning` field, which looks like an offline synonym
signal. A detector was built on it (`evidence/m4-nearmiss.mjs`, `m9-triage.mjs`) with three rules:
one word IS the other's band meaning; the two share a band meaning; the bank's own glosses overlap.
Run on the clean shipped bank:

```
[meaning coverage] 619 of 2264 manifest words have a band meaning (27.3%)
[bank] OBSERVED 62 files, 84 items
[sweep] OBSERVED 672 (item, distractor) pairs across 84 items
--- N1 -> 4 hits    --- N2 -> 1 hit    --- N3 -> 2 hits
```

All **7** were read by hand and all **7** are false positives (e.g. `back.json[2]`/`bottom` shares
the band meaning "body part", but that item is the *side of a thing* sense). Then run on the eight
known leaks:

```
=== mechanical triage on the POISON set (3 items, 8 known leaks by hand) ===
[triage] OBSERVED 3 files, 3 items, 24 (item,distractor) pairs
[triage] FLAGGED 0 pairs

=== same triage on the SHIPPED light.json (the project's own CERTAIN leak) ===
[triage] OBSERVED 1 files, 2 items, 16 (item,distractor) pairs
[triage] FLAGGED 0 pairs
```

**Precision ~0 (7 flags, 0 real). Recall 0 (0 of 9 known leaks).** It is worse than nothing,
because a green mechanical check invites the belief that something was checked. It is **excluded
from the plan**, and this measurement is written into the plan so the next run does not rebuild it.
It independently reproduces the run's own REFUTED hypothesis (`.oplan/word-quiz/journal.md:261-275`:
*"items flagged: 0 of 71 · known leaks caught: 0 of 5 ... generation is not recognition"*).

Note also that a **blind fill-the-blank solver is the same refuted idea** and must not be proposed.
The only thing this project has ever seen catch a leak is **adversarial RECOGNITION** — the
reviewer sees the sentence **and** the option list.

**MODEL JUDGEMENT: two blind adversarial recognition passes. This is the pass.**

Frozen question, quoted from QZ-24 (`.oplan/word-quiz/plan.md:1644-1647`):

> *"**every distractor of every item in the whole bank must be WRONG in the sentence alone** (the
> pin test). Frozen question for the sweep: *"IGNORING the gloss entirely, does any of the 8
> distractors fit the sentence?"*"*

**How the circularity is broken** — a model checking its own output is not an independent check:

1. **A pass agent never sees the generation packet and never authored the item it reviews.** It is
   dispatched with the items, the frozen question, and nothing else — no gloss, no answer key, no
   authoring rules, no batch report.
2. **The two passes are blind to each other**, dispatched in parallel from clean contexts, and
   neither sees the other's verdicts. Measured basis, `.oplan/word-quiz/plan.md:1550-1552`:
   *"one pass ~ half the leaks; two passes agreed 53%."*
3. **The task is the inverse of generation.** Generation writes a sentence that excludes; the pass
   is asked to find a substitution that *survives*. `.oplan/word-quiz/journal.md:277-282` records
   this as the only mechanism that has ever caught a leak here.
4. **Adjudication of the union is the ORCHESTRATOR's**, not a worker's, and not the generator's.
5. **And none of that is trusted on assertion** — see the seeded poison control immediately below.

**HUMAN: the owner.** §7. Not waived. Design §11 waived the *audio listening* gate and its stated
reason was *the agent cannot hear.* **The owner can read.**

### 6.4 **THE NEGATIVE CONTROL — seeded poison. This is the part that has never existed here.**

Field guide 2: a positive assertion needs a control that proves it can fire. The QZ-24 sweep had
none, which is how it returned a confident "11 items flagged" while walking past `light[1]`.

**The control:** the three poison files of §6.1 are shuffled into the batch handed to **each** blind
pass, renamed to look like ordinary batch members and re-lemma'd to real target words. Each pass
returns per-item verdicts for the whole batch. The orchestrator then measures, per pass:

```
POISON RECALL  pass A: <k>/3 poison items flagged, <j>/8 poison distractors named
POISON RECALL  pass B: <k>/3 poison items flagged, <j>/8 poison distractors named
OBSERVED       pass A: <n> items reviewed, <m> verdicts returned
OBSERVED       pass B: <n> items reviewed, <m> verdicts returned
```

**A pass that flags fewer than 3 of 3 poison items is NOT TRUSTED**: its verdicts on the real items
are discarded and the pass is re-run with a fresh agent. That is the gate. It is not a formality —
the poisons are deliberately of the exact shape that the two-pass sweep already demonstrably missed
(a same-class near-synonym in a loosely-pinned sentence).

**The poison items are also proof the SHAPE gate cannot see this class**, and that is asserted
mechanically: step 3.2's validation runs `check-quiz-bank.mjs --dir <poison>` and **requires exit
0 and `QUIZ BANK OK: 3 files, 3 items`.** If the shape gate ever starts catching them, the poisons
have stopped being poisons and must be rebuilt. This is the fail-first demonstration inverted, and
it is the only clause in this phase where a GREEN gate is the failure signal.

**The poison set is frozen in the plan and extracted by script, never retyped** (the FC-5 pattern),
so a worker cannot "tidy" a poison into legality. Its md5 is pinned at step 3.2.

### 6.5 Instrumentation — every sweep prints what it observed

Field guide 18. Every count below is REQUIRED output, and step 3.4's validation greps for each:

```
BATCH        files=<F> items=<I> multiSense=<M>
RULE8EXEMPT  answers=<E> of <F>            # for S3 this must be F, and it is a WARNING not an error
PASS A       reviewed=<n> verdicts=<m> flags=<f> poisonRecall=<k>/3
PASS B       reviewed=<n> verdicts=<m> flags=<f> poisonRecall=<k>/3
UNION        items=<u> agreement=<a>%
ADJUDICATED  rework=<r> kept=<p> deleted=<d>
```

**If `reviewed` is 0, or `verdicts` != `reviewed`, or `poisonRecall` < 3/3, the step FAILS.**
`verdicts == reviewed` is the clause that catches a pass which silently skipped items — the failure
`--sample 50` had (`showed 40 of the 50 words`) in a new costume.

### 6.6 What happens when the pass fires

Three dispositions, all from precedent, all recorded per item with a reason:

1. **REWORK** — re-pin the sentence (preferred) or swap the distractor. The pin test governs:
   only `so`, `so that`, `so ... that`, `because`, `... enough to`, purpose infinitives and
   verb/argument selection actually constrain a blank; `and`/`but` pin nothing.
2. **DELETE the item** — `.oplan/word-quiz/journal.md:102`: *"**Ship fewer items rather than one
   leaky item.**"* Precedent: `fan[1]` deleted when 7 of 8 options were flagged, and the word
   stayed quizzable through `fan[0]`. **A file may drop to 1 item; it may not drop to 0** (rule 2),
   so a word whose only sense cannot be pinned is dropped from the batch entirely and reported.
3. **KEEP, with a written reason** — only the orchestrator may do this, only on a single-pass flag,
   and the reason goes in the journal in the `d28-sweep.txt` form.

**The batch is never stopped by a flag.** A flag is expected — the measured base rate is roughly
one item in five. What stops the batch is a poison-recall failure, because that means the
*instrument* is broken, and a broken instrument makes every other verdict in the pass meaningless.

---

## §7. Q5 — THE OWNER GATE. Not waived.

### 7.1 What he is shown: **EVERY new or changed item. Never `--sample`.**

`scripts/check-quiz-bank.mjs` has a deterministic `--sample N` mode built for this, and an existing
test proves it is byte-identical across runs and spans the bank. **It is still the wrong tool
here**, and the record says so — `.oplan/word-g1/plan.md:3079-3085`, verbatim:

> *"**every item is enumerated — never `--sample`.** The stride trap is quoted as the reason: at 80
> items, `--sample 50` once showed only the alphabetically-first 50, *"and the owner would have
> reviewed words beginning a-q and signed off on the whole bank."*"*

The sampler's own defect is on record twice: `.oplan/word-quiz/journal.md:118-121` and `:213-214` —
*"**`--sample 50` showed 40 of the 50 words, not 50** — the owner reviewed 40 words."* That is not
a bug in today's sampler (amendment A2 fixed the stride, and the test at
`tests/quiz-bank.test.js:139-175` pins the fix); it is a property of sampling ITEMS when the human
question is about WORDS. **At S3's size — 10 words, 15-25 items — enumeration is free.**

**If the sampler is nevertheless used for any purpose, the plan requires it be proved on real data
first**, not on a fixture: `--sample N` on the actual staged batch, with the distinct-file count
compared to N and both numbers printed. Step 3.5's validation does exactly that, so the "40 of 50"
class of surprise is measured rather than discovered.

### 7.2 In what form: **a self-contained HTML page, opened in his browser.**

Not JSON in a terminal. The owner reads Hebrew and English and has a standing preference for being
shown choices as a self-contained HTML page. Precedent and frozen shape,
`.oplan/word-g1/plan.md:3079-3085`, verbatim:

> *"one card per item, in the child's presentation: the sentence with the blank, LTR; the eight
> options plus the answer, shuffled, **with the answer NOT marked** — the owner reads it as she
> would; a `רמז` control that reveals the gloss on click (the D28 form; the gloss is never shown up
> front); a "show answer" control that reveals which option is correct ... Below the cards: the
> adversarial summary (per-pass flag counts, agreement rate, every disposition, every KEPT-with-
> reason), the honest limits statement (*"no mechanical gate can see a distractor that also fits"*),
> and the drop report"*

Phase 3 adopts that shape unchanged, at `C:/Users/dkreinov/f3-review/items.html` — **outside the
repo**. Three additions, each earned by a measurement in this plan:

* the **poison recall** figures per pass, stated plainly (§6.4);
* the **`light[1]` fix**, shown before-and-after, with the audit quote that names it;
* the **honest scope line**: *"this review covers the N new items and light[1]. The other 83 shipped
  items were last reviewed on 2026-07-27 by a two-pass sweep that missed light[1]."*

The Hebrew in the page (`רמז`) is **byte-sliced from `public/quiz.js:188`, never retyped**
(field guide 8, FC-7). The page is not committed and is deleted at the phase close.

### 7.3 What "approved" means mechanically — **and this is new**

The record is explicit that today there is **no machine-readable approval artifact**: the approval
is a sentence quoted into the journal, and `.oplan/word-g1/plan.md:3087-3100`'s mechanical clause
checks only that the *page exists and has the right card count*. Nothing prevents an unapproved
batch reaching `public/quiz/`.

**Phase 3 closes that.** The promotion step (3.6) reads
`C:/Users/dkreinov/f3-stage/APPROVED.txt`, whose frozen shape is:

```
APPROVED <ISO-8601 timestamp>
BATCH-DIGEST <md5 of the sorted (filename, md5) list of every staged file>
FILES <n>
<lemma>.json
<lemma>.json
...
```

The promoter recomputes `BATCH-DIGEST` from the staged directory and **refuses to copy anything if
it does not match**, if `FILES` disagrees with the listing, if any listed file is missing, or if any
staged file is not listed. So:

* an unapproved batch cannot be promoted — there is no `APPROVED.txt`;
* a batch **edited after approval** cannot be promoted — the digest moves;
* a file **added after approval** cannot be promoted — it is not in the list;
* the approval is bound to *these bytes*, not to a word list.

`APPROVED.txt` is written by the ORCHESTRATOR only, only after the owner's explicit yes, and the
owner's verbatim words go in the journal as well. **This is the mechanism design §3 B asked for and
the project has never had.** It is the phase's second no-ruling-required deliverable.

### 7.4 Where the gate sits, and what is already committed when he sees it

The gate is step **3.5**, and at the moment he sees the page **not one item byte is in the
repository**. Committed before it: only `scripts/check-item-batch.mjs`, its tests, and the
`light.json` fix (3.3), each separately gated. Committed after it: the promoted item files (3.6).
Design §5's *"no deploy until every gate and both owner gates have passed"* is honoured because
**phase 3 deploys nothing at all** — phase 4 does, and phase 4 inherits `APPROVED.txt` as evidence.

---

## §8. Q7 — WHAT MOVES WHEN THE BANK GROWS. Every anchor, derived.

`tests/` was grepped for exact-shape assertions **before** anything was designed (field guide 7).

| anchor | measured now | after +N files / +I items | breaks? |
|---|---|---|---|
| `check-quiz-bank.mjs` output line | `QUIZ BANK OK: 62 files, 84 items` | `62+N files, 84+I items` | **no** — no test pins the exact string |
| `MULTI-SENSE:` line | `19 files with >=2 items` | grows | **no** — not pinned for the real bank |
| `tests/quiz-bank.test.js:122-130` | asserts `files >= 50` and `items >= files` | still true | **no.** *"D23 reversed D8: the bank ... GROWS on demand, so an exact count would go red on the first top-up"* |
| `tests/quiz-core.test.js:20,89` | reads `public/quiz/light.json`, pins `lightItems[1]`'s exact `selectOptions` output `['radio','television','oven','fan','camera','light']` | — | **YES, IF `light.json` IS TOUCHED.** See below. |
| `public/` file count | **2382** | `2382+N` | **no** — not pinned by any test; `phase-state.md:11` records it and step 3.7 updates it |
| `public/sw.js` PRECACHE | 15 paths, no `/quiz/` entry | unchanged | **no** — see §9 |
| test ledger | 380 reported / 375 flat | +T | pinned per step in §10 |
| contrast | 58 PASS | unchanged | **no** — phase 3 writes no CSS |
| `scripts/quiz-topup.mjs` `covered`/`missing` | — | `covered` grows | **no** — it exits 0 unless `banned > 0` |
| QZ-8 exclusions | 37 lines, measured | unchanged | **no** — but re-verified at 37 by §VAL-F3 |
| `data/story-words.json` | 10 entries, FC-6 | unchanged | **no** — phase 3 does not touch it |

**`public/quiz/light.json` IS A PINNED ARTIFACT AND THE PHASE MUST FIX IT ANYWAY.** This is field
guide 22's exact shape: a frozen pin and a mandated edit collide.

* The pin: `tests/quiz-core.test.js:89` asserts `selectOptions(lightItems[1], new Set(), () => 0)`
  deep-equals `['radio','television','oven','fan','camera','light']`. Measured today,
  `light.json[1].distractors = ["radio","television","oven","fan","camera","computer","machine","motor"]`,
  and `selectOptions` with an empty known-set takes the first five — so the pin is a statement about
  **the first five distractors in file order**, plus the answer.
* Which does it name — a property or a spelling? **A property**: "`selectOptions` takes the first
  five distractors in order and appends the answer, deterministically under a stubbed rand." The
  particular five are a spelling.
* **So the PIN moves, and it is SEEN TO FAIL first.** Step 3.3 replaces `computer` (and
  re-pins the sentence so `television` cannot survive either), re-derives the expected array from
  the edited file **on a simulated post-edit tree**, and the step's fail-first demonstration is
  running the suite with the fixed `light.json` and the OLD pin, watching
  `tests/quiz-core.test.js` fail on that exact assertion. The pin is **re-expressed, never deleted.**
* `light.json` md5 today: `62802df5b67f5807e62b89d968d4ff6e`. Step 3.3 pins the post-edit md5,
  measured on the mirror, not hand-computed.

**Whole-bank digest**, so "no existing file changed" is checkable in one number:

```
BANK-62-DIGEST = b3cba82170c705f5ffe2c7afe3741152
   (md5 over the LC_ALL=C-sorted list of "<basename> <md5>" for all 62 files)
```

§VAL-F3 clause V5 recomputes it. It is expected to change **exactly once** in the phase, at step
3.3, and the post-3.3 value is pinned there.

**Is `public/quiz/*.json` precached?** No. `public/sw.js:2-18` lists 15 paths and none is under
`/quiz/`. Consequence in §9.

---

## §9. Q10 — WHAT COULD MAKE THIS PHASE FINISH GREEN AND CHANGE NOTHING SHE WOULD SEE?

Answered explicitly, because this project has shipped that outcome once already
(`.oplan/word-polish/journal.md` FINDING 2).

### 9.1 The mechanism, named and EXECUTED

**Derive the word list with `scripts/quiz-topup.mjs`.** It is the documented tool, the record calls
it "the weekly top-up rule", the brief nudges toward reuse, and it returns `missing=0`. §2.5 ran it
on a fixture in which ten of fourteen words have no item and are the ten chapter-first asks first:

```
TOPUP known=4 candidate=0 pool=4 dropped=0 covered=4 missing=0 banned=0
EXIT=0
```

A phase that took that as its input would generate nothing, gate green, close green, and change
**nothing she would see** — while `.oplan/word-g1/journal.md:643-647` already recorded exactly that
outcome once as *"a GOOD outcome"* (which it was, for the question that script asks).

**Two more, both real:**

* **Generate for the right words and never promote them.** Items staged outside the repo are
  invisible to every gate that looks at `public/quiz/`. Closed by §VAL-F3 clause V4 (bank file
  count must equal `62 + N`) and by step 3.6's promoter.
* **Promote them and let phase 4 not deploy them.** Phase 3 ships nothing. The items reach her only
  at phase 4's deploy. Recorded as a carried obligation, **F3-1**.

### 9.2 The runtime path, traced end to end (field guide 15)

For a new `public/quiz/<lemma>.json`:

1. **It exists** in the repo under `public/`, which Vercel serves as a static file. No index, no
   manifest — `.oplan/word-quiz/plan.md:410-414`: *"There is deliberately NO quiz manifest
   (QZ-19 forbids `/quiz/index.json`) ... A top-up therefore needs no index regeneration — dropping
   the new `<lemma>.json` files in is the whole deploy."* **Nothing needs regenerating.**
2. **Who needs it:** `public/quiz.js:145`, `fetch('/quiz/' + encodeURIComponent(lemma) + '.json')`.
3. **Can they reach it AT THE MOMENT they need it?** The lemma must appear in `startQuiz`'s
   `lemmas`. From the reader that is `chapterQuizLemmas(...)` = `chapter.glossary ∩ profile.words`
   ++ pool. **So the item only helps if the lemma is a key in her `profile.words`** — any status,
   including `learning` (`reader.js:260`). A word she has tapped in a story qualifies; a word she
   has never met does not. **This is the single strongest argument that the target set must be her
   GLOSSARY words (S2/S3) and not `known ∪ candidate` (S1).**
4. **Does the service worker block it?** **No, and this was checked rather than assumed.**
   `public/sw.js:2-18`'s `PRECACHE` contains no `/quiz/` path, and the fetch handler
   (`:48-50`) is `caches.match(request).then(cached => cached || fetch(request))` — it **never
   puts anything into the cache at run time**. So a quiz JSON always misses the cache and always
   goes to the network. **New bank files need no CACHE bump to reach her.** F1-1 is unaffected,
   FC-4 holds, and phase 3 correctly bumps nothing.
5. **The answer must record.** `api/profile.js:130` answers a `quiz-answer` for a word absent from
   `profile.words` with `400 'unknown word'`, which `public/quiz.js:305` swallows. Since (3)
   already requires the lemma to be a key in `profile.words`, this is satisfied by construction —
   but it is the reason `light` was useless in word-polish FINDING 2 (*"which is not in her
   `profile.words`, so its answer would 400"*), and it is why S1's `known`-only framing is doubly
   wrong.

### 9.3 The check that would catch it if the work does not reach her

The proof cannot be a unit test — no test in this repo can see her profile. It is the **executed
selector transcript** of §2.3, promoted to a step-level gate (step 3.6):

> Drive the SHIPPED `chapterQuizLemmas` + the SHIPPED bank over a fixture whose glossary is exactly
> the phase's target word list and whose `profile.words` holds those words as `learning`.
> **BEFORE promotion, the four questions must be the fall-through pool. AFTER promotion, all four
> must come from the target list.** Both transcripts are pasted into the journal.

That is the difference between "62+N files exist" and "she is asked her own story words", and it is
the check FINDING 2 did not have. Its fail-first form is trivial and mandated: run it against the
un-promoted tree and watch the AFTER assertion fail.
---

## §VAL-F3 — THE FROZEN VALIDATION PREAMBLE

**This preamble was EXTRACTED BACK OUT OF THIS DOCUMENT BY SCRIPT AND RUN.** Its real stdout on the
clean tree is pasted below, and it was then SEEN TO FAIL on a byte-exact mutated copy — six
mutations, each firing a different clause. It is frozen: an executor extracts it, never retypes it.

**Extraction command (frozen):**

```bash
mkdir -p /c/Users/dkreinov/f3-val
sed -n '/^# ===== BEGIN VAL-F3 =====$/,/^# ===== END VAL-F3 =====$/p' \
    /c/Users/dkreinov/claude/english-app/.oplan/word-finish/plan-phase3.md \
  > /c/Users/dkreinov/f3-val/val-f3.sh
```

**THE ANCHORS ARE LOAD-BEARING, AND I LEARNED THAT BY RUNNING IT.** My first draft of this
extractor dropped the `^...$` anchors and the `# =====` prefix, on the theory that a shorter
pattern was safer. It is the opposite. The line you are reading the command on *contains the
string* `BEGIN VAL-F3`, so an unanchored `sed` starts its range **at the extraction command
itself** and sweeps ~70 lines of this document's prose into the extracted file. Run:

```
$ sed -n '/BEGIN VAL-F3/,/END VAL-F3/p' PLAN-P3.md > val-f3.sh
$ bash val-f3.sh
val-f3.sh: line 12: anchors: command not found
val-f3.sh: line 13: prefix,: command not found
val-f3.sh: line 14: self-referential-wrapper: command not found
val-f3.sh: command substitution: line 15: syntax error near unexpected token `)'
... 15 more ...
VAL-F3 branch=master ... capture-in-repo=0 sandbox=5seen/0bad RC=0
EXTRACTED-PREAMBLE-ALONE-EXIT=0
```

**Nineteen bash errors, a correct-looking summary line, and exit 0.** That is field guide 9's
*"a frozen VALIDATION can itself be the bug"* and field guide 17's silent-pass, in one artifact,
caught only because the extractor was executed rather than admired. The anchored form is safe
precisely because this command's own line does **not** begin with `# =====`.

**Round-trip proof, with the anchored form:**

```
$ sed -n '/^# ===== BEGIN VAL-F3 =====$/,/^# ===== END VAL-F3 =====$/p' PLAN-P3.md > extracted.sh
$ wc -l < extracted.sh
176
$ diff -q <the-script-that-was-actually-run> extracted.sh
(no output -- IDENTICAL)
$ bash extracted.sh
VAL-F3 branch=master porcelain-outside-oplan=0 bank=62f/84i digest=b3cba82170c705f5ffe2c7afe3741152 manifest=2264 contrast=58 ledger=380rep/375flat fail=0 capture-in-repo=0 sandbox=5seen/0bad RC=0
```

**An executor MUST verify the extracted file's line count and that its first line is
`# ===== BEGIN VAL-F3 =====` before trusting it.** That check is in every step's tail.

**A PREAMBLE IS NOT A GATE (field guide 17).** It carries no `exit`. Every step's validation is
**ONE FILE** = this preamble verbatim + that step's tail, ending `exit $RC`. A tail in a separate
process cannot see `$RC`, `$PORC`, `$FILES`, `$ITEMS`, `$BANKDIG`, `$TOTAL` or `$FLAT` and would
exit 0 unconditionally — the silent-pass class.

**The split it uses, and why:** clauses V1–V15 assert only INVARIANTS — things phase 3 must never
move. Numbers that legitimately change between steps (bank file/item count, the bank digest, the
test ledger) are **EXPORTED as variables and asserted by the step's tail**. That is what lets one
frozen preamble serve every step without being re-cut.

**V14 and V15 exist because the orchestrator authorised a LIVE CAPTURE for step 3.1.** V14 proves
no copy of her profile is loitering inside the repository — **including a gitignored one, which V1
structurally cannot see**. V15 proves the sandbox fixtures are still synthetic. Neither ever prints
a word of hers; both report counts only.

### The preamble, verbatim

```bash
# ===== BEGIN VAL-F3 =====
# word-finish PHASE 3 — FROZEN VALIDATION PREAMBLE.
# THIS IS NOT A GATE. It carries no `exit`. Run alone it is a REPORT (field guide 17).
# Every step's validation is ONE FILE = this preamble VERBATIM + that step's tail,
# and the tail MUST end with `exit $RC`. A tail in a separate process cannot see
# $RC / $PORC / $FILES / $ITEMS / $FLAT and would exit 0 unconditionally.
#
# V14 and V15 were added after the orchestrator authorised a LIVE CAPTURE for step 3.1:
# V14 proves no copy of her profile is loitering inside the repository (including a
# gitignored one, which V1 cannot see); V15 proves the sandbox fixtures are still
# synthetic. Neither ever prints a word of hers.
#
# NOTE, learned by RUNNING this: node colours a bare console.log(number) with ANSI
# escapes even through a pipe in this shell, and a `case` match against a plain
# string then fails. Every value this preamble captures from node uses
# process.stdout.write, never console.log.
# The preamble asserts INVARIANTS (things phase 3 must never move) and EXPORTS the
# moving numbers as shell variables for the tail to pin. It never asserts a count
# that legitimately changes between steps.
set -o pipefail
cd /c/Users/dkreinov/claude/english-app || { echo "FAIL: repo missing"; return 2>/dev/null || exit 2; }
RC=0
F() { echo "FAIL: $*"; RC=1; }

# --- V1 branch + HEAD + working tree -----------------------------------------
BR=$(git rev-parse --abbrev-ref HEAD)
case "$BR" in master) ;; *) F "V1 branch is $BR, expected master";; esac
# The tree carries the phase-3 brief as an untracked .oplan path, and each accepted
# step adds committed files. What must NEVER appear is an untracked or modified path
# OUTSIDE .oplan/ -- that is a stray artifact (field guide 4). FC-3's awk filter,
# TWO backslash bytes, verbatim:
PORC=$(git status --porcelain | awk '$NF !~ /^\.oplan\//' | wc -l | tr -d ' ')
case "$PORC" in 0) ;; *) F "V1 $PORC path(s) outside .oplan/ are dirty or untracked";; esac

# --- V2 FC-1 the frozen quiz engine, NEVER touched ---------------------------
Q1=$(md5sum < public/quiz.js | cut -d' ' -f1)
Q2=$(md5sum < public/quiz-core.js | cut -d' ' -f1)
case "$Q1" in 69b6d71117cf776715374abc6f0abb02) ;; *) F "V2 FC-1 public/quiz.js md5 $Q1";; esac
case "$Q2" in 9a2131be8b9d1b77c219f1e8c3482a71) ;; *) F "V2 FC-1 public/quiz-core.js md5 $Q2";; esac

# --- V3 FC-4 the service worker is NOT bumped in phase 3 ---------------------
SW=$(md5sum < public/sw.js | cut -d' ' -f1)
case "$SW" in 78fc3b0ac1d10de8a5baccb753eca33c) ;; *) F "V3 FC-4 public/sw.js md5 $SW (phase 3 bumps NOTHING)";; esac
CACHELINE=$(head -1 public/sw.js | tr -d '\r')
case "$CACHELINE" in *'magic-vet-v20'*) ;; *) F "V3 FC-4 CACHE line is [$CACHELINE], expected magic-vet-v20";; esac
# ...and no /quiz/ path may enter PRECACHE (that would make items need a bump; see plan 9.2)
PCQ=$(grep -c '"/quiz/' public/sw.js || true)
case "$PCQ" in 0) ;; *) F "V3 PRECACHE gained $PCQ /quiz/ path(s) -- items must stay network-fetched";; esac

# --- V4 FC-6 data/story-words.json is untouched by phase 3 -------------------
SWJ=$(node -e 'const a=require("./data/story-words.json");process.stdout.write(a.length+" "+a.join(","))')
case "$SWJ" in "10 after,deer,feet,glow,growl,harm,moon,nervous,scary,tight") ;; *) F "V4 FC-6 story-words.json is [$SWJ]";; esac

# --- V5 the manifest is still the disk, and still 2264 -----------------------
MAN=$(node -e 'const m=require("./public/audio/words/index.json");process.stdout.write(String(m.length))')
AAC=$(ls public/audio/words/*.aac 2>/dev/null | wc -l | tr -d ' ')
case "$MAN" in 2264) ;; *) F "V5 manifest is $MAN, expected 2264";; esac
[ "$MAN" = "$AAC" ] || F "V5 manifest $MAN != clips on disk $AAC"
MANMD5=$(md5sum < public/audio/words/index.json | cut -d' ' -f1)
case "$MANMD5" in 6a885982b75e82ef1f00dc6768796ecf) ;; *) F "V5 manifest md5 $MANMD5";; esac

# --- V6 THE F2-2 RULING, GATED: `allowed` is the MANIFEST, and nothing else --
# A future edit that swaps in the bands, or adds a second source, fails here.
ALLOWSRC=$(grep -c "const allowed = new Set(read('public', 'audio', 'words', 'index.json'))" scripts/check-quiz-bank.mjs || true)
case "$ALLOWSRC" in 1) ;; *) F "V6 check-quiz-bank.mjs builds allowed from the manifest $ALLOWSRC times, expected exactly 1";; esac
BANDALLOW=$(grep -c 'allowed *= *new Set(.*band' scripts/check-quiz-bank.mjs || true)
case "$BANDALLOW" in 0) ;; *) F "V6 check-quiz-bank.mjs builds allowed from the BANDS -- F2-2 ruled MANIFEST";; esac
# ...and lib/quiz-item.js is never edited by this phase.
QI=$(md5sum < lib/quiz-item.js | cut -d' ' -f1)
case "$QI" in 6c0d4c0e54c890721a3825e8f6ccdeca) ;; *) F "V6 lib/quiz-item.js md5 $QI -- phase 3 must not edit the contract";; esac

# --- V7 QZ-8's exclusions are still 37 ---------------------------------------
EXCL=$(grep -c . .oplan/word-quiz/qz8-exclusions.txt)
case "$EXCL" in 37) ;; *) F "V7 QZ-8 exclusions are $EXCL, expected 37";; esac

# --- V8 the bank gates GREEN, and its numbers are EXPORTED not asserted ------
BANKOUT=$(node scripts/check-quiz-bank.mjs); BANKRC=$?
case "$BANKRC" in 0) ;; *) F "V8 quiz bank gate exited $BANKRC";; esac
case "$BANKOUT" in *'QUIZ BANK FAILED'*) F "V8 quiz bank reports FAILED";; esac
FILES=$(printf '%s\n' "$BANKOUT" | sed -n 's/^QUIZ BANK OK: \([0-9]*\) files, \([0-9]*\) items$/\1/p')
ITEMS=$(printf '%s\n' "$BANKOUT" | sed -n 's/^QUIZ BANK OK: \([0-9]*\) files, \([0-9]*\) items$/\2/p')
[ -n "$FILES" ] || F "V8 could not parse the OK line: [$BANKOUT]"
DISKFILES=$(ls public/quiz/*.json 2>/dev/null | wc -l | tr -d ' ')
[ "$FILES" = "$DISKFILES" ] || F "V8 gate saw $FILES files, disk holds $DISKFILES"

# --- V9 every bank file is LF. MEASURED BY BYTES, never with grep (fg 16) ----
CRLFN=0; MIXEDN=0; NBANK=0
for f in public/quiz/*.json; do
  NBANK=$((NBANK+1))
  cr=$(tr -dc '\r' < "$f" | wc -c | tr -d ' ')
  lf=$(tr -dc '\n' < "$f" | wc -c | tr -d ' ')
  if [ "$cr" != "0" ]; then
    if [ "$cr" = "$lf" ]; then CRLFN=$((CRLFN+1)); else MIXEDN=$((MIXEDN+1)); fi
  fi
done
case "$CRLFN$MIXEDN" in 00) ;; *) F "V9 bank endings: CRLF=$CRLFN MIXED=$MIXEDN of $NBANK (all must be LF)";; esac

# --- V10 the whole-bank digest, EXPORTED for the tail to pin -----------------
BANKDIG=$(for f in $(ls public/quiz/*.json | LC_ALL=C sort); do printf "%s %s\n" "$(basename "$f")" "$(md5sum < "$f" | cut -d' ' -f1)"; done | md5sum | cut -d' ' -f1)

# --- V11 contrast is untouched (phase 3 writes no CSS) ----------------------
CON=$(node scripts/check-contrast.mjs); CONRC=$?
case "$CONRC" in 0) ;; *) F "V11 contrast gate exited $CONRC";; esac
CPASS=$(printf '%s\n' "$CON" | grep -c '^PASS' || true)
case "$CPASS" in 58) ;; *) F "V11 contrast PASS lines $CPASS, expected 58";; esac

# --- V12 the test ledger, EXPORTED not asserted -----------------------------
TOUT=$(npm test 2>&1); TRC=$?
TOTAL=$(printf '%s\n' "$TOUT" | sed -n 's/^# tests \([0-9]*\)$/\1/p' | tail -1)
TFAIL=$(printf '%s\n' "$TOUT" | sed -n 's/^# fail \([0-9]*\)$/\1/p' | tail -1)
FLAT=$(grep -rh '^test(' tests/*.js | wc -l | tr -d ' ')
case "$TRC" in 0) ;; *) F "V12 npm test exited $TRC";; esac
case "$TFAIL" in 0) ;; *) F "V12 $TFAIL test(s) failed";; esac
[ -n "$TOTAL" ] || F "V12 could not parse the reported test total"

# --- V13 no staged, unapproved item may live inside the repo ----------------
STRAY=$(find public/quiz -type f ! -name '*.json' 2>/dev/null | wc -l | tr -d ' ')
case "$STRAY" in 0) ;; *) F "V13 $STRAY non-.json file(s) under public/quiz/";; esac
[ -d f3-stage ] && F "V13 f3-stage/ exists INSIDE the repo -- staging is outside (field guide 4)"


# --- V14 NO CAPTURE OF HERS MAY LOITER INSIDE THE REPOSITORY -----------------
# The frozen ritual writes to a Git-Bash path OUTSIDE the repo. Its own comment warns
# that a Windows-style path there creates a stray repo file (field guide 4). V1 would
# see an untracked one; this clause also catches a GITIGNORED one, which V1 cannot.
CAPIN=$(node -e '
const fs=require("fs"),path=require("path");
const SKIP=new Set(["node_modules",".git","audio","icons","assets","raw"]);
let n=0;
(function walk(d,depth){ if(depth>4) return;
  let names; try{names=fs.readdirSync(d)}catch{return}
  for(const nm of names){ if(SKIP.has(nm)) continue;
    const fp=path.join(d,nm); let st; try{st=fs.statSync(fp)}catch{continue}
    if(st.isDirectory()){ walk(fp,depth+1); continue }
    if(!/\.(json|bak|backup)$/i.test(nm)) continue;
    if(st.size>2000000) continue;
    let t; try{t=fs.readFileSync(fp,"utf8")}catch{continue}
    if(!t.includes("\"words\"")) continue;
    let o; try{o=JSON.parse(t)}catch{continue}
    const pr=o&&o.data?o.data:o; const w=pr&&pr.words;
    if(!w||typeof w!=="object"||Array.isArray(w)) continue;
    const k=Object.keys(w);
    if(k.length&&k.some(x=>w[x]&&typeof w[x]==="object"&&"status" in w[x])) n++;
  }})(".",0);
process.stdout.write(String(n));')
case "$CAPIN" in 0) ;; *) F "V14 $CAPIN profile-shaped file(s) INSIDE the repo -- a capture is loitering";; esac
[ -e .data/profile.json ] && F "V14 .data/profile.json exists -- a dev server or a capture wrote into the repo"
for d in f3-capture f3-stage f3-review f3-poison f3-val; do
  [ -e "$d" ] && F "V14 $d/ exists INSIDE the repo -- every phase-3 artifact lives outside it"
done

# --- V15 the sandbox fixtures are still SYNTHETIC ---------------------------
# GUARD, NOT A GATE, and F1-4 says why: these files are OUTSIDE the repository, so no
# repository check can ever be authoritative about them. It is here because it is cheap
# and because phase 3 now takes a live capture. The test is WORD-KEY IDENTITY against the
# frozen synthetic set, NOT md5 -- record gap 8: finish-art/served-profile.json is a
# dev-server rewrite with the same six keys and a different md5, and an md5 criterion
# raises a false alarm on it. NO WORD IS EVER PRINTED.
SB=$(node -e '
const fs=require("fs");
const paths=["C:/Users/dkreinov/english-app-sandbox/profile.json",
             "C:/Users/dkreinov/finish-art/served-profile.json",
             "C:/Users/dkreinov/finish-audio/sandbox-pristine.json",
             "C:/Users/dkreinov/finish-fixture/sandbox-profile.json",
             "C:/Users/dkreinov/trophies-val/sandbox/profile.json"];
const REF=["candle","feather","garden","mirror","river","window"].sort().join(",");
let bad=0,seen=0;
for(const p of paths){ let o; try{o=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
  seen++; const pr=o.data||o; const k=Object.keys(pr.words||{}).sort().join(",");
  if(k!==REF) bad++; }
process.stdout.write(seen+" "+bad);')
SBSEEN=${SB%% *}; SBBAD=${SB##* }
case "$SBBAD" in 0) ;; *) F "V15 $SBBAD of $SBSEEN sandbox fixture(s) are NOT the frozen synthetic set";; esac

echo "VAL-F3 branch=$BR porcelain-outside-oplan=$PORC bank=${FILES}f/${ITEMS}i digest=$BANKDIG manifest=$MAN contrast=$CPASS ledger=${TOTAL}rep/${FLAT}flat fail=$TFAIL capture-in-repo=$CAPIN sandbox=${SBSEEN}seen/${SBBAD}bad RC=$RC"
# ===== END VAL-F3 =====
```

### Run against the CLEAN tree — real stdout

```
$ bash val-f3.sh
VAL-F3 branch=master porcelain-outside-oplan=0 bank=62f/84i digest=b3cba82170c705f5ffe2c7afe3741152 manifest=2264 contrast=58 ledger=380rep/375flat fail=0 capture-in-repo=0 sandbox=5seen/0bad RC=0
$ echo $?
0
```

**RC=0 and it exits 0. Good.**

### A REAL DEFECT THIS PREAMBLE FOUND IN ITSELF, BY BEING RUN

The first execution produced:

```
FAIL: V5 manifest is <ESC>[33m2264<ESC>[39m, expected 2264
FAIL: V5 manifest <ESC>[33m2264<ESC>[39m != clips on disk 2264
VAL-F3 ... RC=1
PREAMBLE-ALONE-EXIT=0
```

**`node -e 'console.log(m.length)'` emits ANSI colour escapes around a bare number in this shell,
even through a pipe**, so every `case` match against a plain string fails. A preamble written and
only *read* would have shipped this, and every step would have gone red for a reason having nothing
to do with the tree. Fixed by using `process.stdout.write` for every value captured from node, and
the note is carried in the preamble's own header so it is not re-learned.

**And note the second half: two `FAIL:` lines, and it still exited 0.** That is field guide 17
reproduced live, in this phase, before the plan was written.

### SEEN TO FAIL — six mutations

Mutations were applied to the **byte-exact mirror outside the repo**, never to the repository. The
mirror has no `.git`, so `V1` fails there in every run — stated, not hidden, which is why the
baseline is shown first.

**Mutation 1 — bump `CACHE` v20 -> v21 (F1-1 stolen from phase 4):**

```
FAIL: V1 branch is , expected master
FAIL: V3 FC-4 public/sw.js md5 f2b18dde0a427533f6b7b7451a6df19a (phase 3 bumps NOTHING)
FAIL: V3 FC-4 CACHE line is [const CACHE = "magic-vet-v21";], expected magic-vet-v20
FAIL: V12 npm test exited 1
FAIL: V12 1 test(s) failed
VAL-F3 ... fail=1 RC=1
EXIT=1
```

Four clauses fire, and the seam shows: `tests/shell.test.js` pins the same string, so V12 fires too.

**Mutation 2 — swap `check-quiz-bank.mjs`'s `allowed` to the BANDS (violating the F2-2 ruling):**

```
FAIL: V6 check-quiz-bank.mjs builds allowed from the manifest 0 times, expected exactly 1
FAIL: V6 check-quiz-bank.mjs builds allowed from the BANDS -- F2-2 ruled MANIFEST
FAIL: V8 quiz bank gate exited 1
FAIL: V8 quiz bank reports FAILED
FAIL: V8 could not parse the OK line: [ability.json[0] rule 12: answer "ability" is not a manifest word
FAIL: V8 gate saw  files, disk holds 62
VAL-F3 ... bank=f/i ... RC=1
```

The F2-2 ruling is a GATE, not prose — it was watched failing.

**Mutation 3 — CRLF one bank file:**

```
FAIL: V9 bank endings: CRLF=1 MIXED=0 of 62 (all must be LF)
VAL-F3 ... digest=92675fdc87736de32bdffea0d0d61beb ... RC=1
```

**Mutation 4 — change ONE byte inside `bear.json` (`thick fur` -> `thick hair`).** This is the case
the preamble deliberately does NOT catch, because the bank legitimately grows. Preamble + a step
tail pinning the exported digest:

```
### clean mirror + tail
VAL-F3 ... digest=b3cba82170c705f5ffe2c7afe3741152 ... RC=1      (V1 only: the mirror has no .git)
EXIT=1

### one byte changed inside bear.json
VAL-F3 ... digest=1bff0fe321b189785e232b304ba85809 ... RC=1
FAIL: TAIL BANK-62-DIGEST 1bff0fe321b189785e232b304ba85809 -- an existing bank file changed
EXIT=1

### restored
VAL-F3 ... digest=b3cba82170c705f5ffe2c7afe3741152 ... RC=1
EXIT=1
```

**The TAIL fires exactly where the preamble is silent.** That is the whole point of the split, and
it is demonstrated rather than asserted.

**Mutation 5 — a capture-shaped file planted INSIDE the (mirror) repo, twice: once as a stray root
file, once under gitignored `.data/` where `V1` could never see it:**

```
### stray root file
FAIL: V14 1 profile-shaped file(s) INSIDE the repo -- a capture is loitering
VAL-F3 ... capture-in-repo=1 sandbox=5seen/0bad RC=1

### gitignored .data/profile.json
FAIL: V14 1 profile-shaped file(s) INSIDE the repo -- a capture is loitering
FAIL: V14 .data/profile.json exists -- a dev server or a capture wrote into the repo
VAL-F3 ... capture-in-repo=1 sandbox=5seen/0bad RC=1
```

**Mutation 6 — a sandbox fixture stops being the frozen synthetic set** (one word key added):

```
FAIL: V15 1 of 5 sandbox fixture(s) are NOT the frozen synthetic set
VAL-F3 ... capture-in-repo=0 sandbox=5seen/1bad RC=1
```

Both were restored and re-measured to `capture-in-repo=0 sandbox=5seen/0bad`, and the fixture's md5
was verified back to `91eff5da59674d7463f462fad659534e`. **V15 tests WORD-KEY IDENTITY, not md5**,
deliberately: RECORD GAP 8 shows an md5 criterion raises a false alarm on
`finish-art/served-profile.json`.

### GATE OR GUARD — every check in this phase, classified

| check | GATE (seen to fail) | GUARD (cannot be made to fail here) |
|---|---|---|
| V1 branch / porcelain-outside-`.oplan` | GATE (fires every mirror run) | |
| V2 FC-1 quiz.js / quiz-core.js md5 | GATE (any byte moves it) | |
| V3 FC-4 sw.js md5 + CACHE + no `/quiz/` in PRECACHE | **GATE — mutation 1** | |
| V4 FC-6 story-words.json | GATE (one word changes the string) | |
| V5 manifest 2264 == disk, md5 | GATE | |
| V6 F2-2 ruling + quiz-item.js md5 | **GATE — mutation 2** | |
| V7 QZ-8 == 37 | GATE | |
| V8 bank gate green + parse + disk agreement | **GATE — mutation 2** | |
| V9 bank endings all LF | **GATE — mutation 3** | |
| V10 bank digest | exported; **GATE via the tail — mutation 4** | |
| V11 contrast 58 | phase 3 writes no CSS, so nothing it does can move it | **GUARD** |
| V12 ledger + 0 fail | GATE (mutation 1 turned it red) | |
| V13 no stray file under `public/quiz/`, no `f3-*` in-repo | fires only on an executor mistake | **GUARD** |
| V14 no capture of hers inside the repo, incl. gitignored | **GATE — mutations 5 and 5b** | |
| V15 sandbox fixtures still synthetic | fires (mutation 6), but it reaches OUTSIDE the repo, so per F1-4 no repository check can ever be authoritative about it | **GUARD** |
| poison set passes the SHAPE gate (§6.4) | **INVERTED GATE** — a GREEN result is required; RED means the poisons rotted | |
| the correctness pass itself (§6.3) | **not mechanical.** Its instrument is gated by poison recall (§6.4); the judgement is not | |
| the owner gate (§7) | **human.** Mechanically gated only by `APPROVED.txt` binding to the batch digest (§7.3) | |

## §10. THE STEPS

House rules for every step below, non-negotiable:

* **Validation is ONE FILE** = §VAL-F3 verbatim (extracted, never retyped) + that step's tail,
  ending `exit $RC`.
* **Every new check is SEEN TO FAIL first**, for the stated reason, with the stated text.
* **Every line/byte/md5 pin was measured on a SIMULATED post-edit tree** at
  `C:/Users/dkreinov/wf-p3-plan/mirror/english-app`, never hand-counted (field guide 21).
* **Any gate edit is VERIFIED TO HAVE LANDED** — the clauses are counted after writing, before
  running (`grep -c '^case "\$' <tail>`), because an edit that silently did not match is an edit
  you believe in but do not have.
* **Scripts are written to FILES with a quoted heredoc, never through shell quoting** (fg 19).
* **Any visual/browser check uses a FRESH PORT** — `PORT=3100`, never `localhost:3000` or
  `127.0.0.1:3000`, both of which have a registered service worker (F2-3; fg 23's remedy is SPENT).
  *No step in this phase needs a browser*, which is stated so the temptation is closed.
* **A new test that stubs a module an earlier test in that file already stubbed gets its OWN
  FILE, with a header saying why** (fg 27).
* **Never build a pattern out of the content being searched for** (fg 18).

### 3.0 — THE SIZE GATE. N is unknown at planning time.

A plan that only works for one value of N is not a plan. The precedent is `.oplan/word-quiz/plan.md:1563-1565`
(**B4**), quoted verbatim, line numbers verified today:

> *"**B4 (conditional):** step 6.3 measures N (her claimed-but-missing words); N=0 → skip 6.5-6.7
> (good outcome, recorded); N>25 → STOP and put the projected cost to the owner (D23 measured
> ~276k tokens / 25 words)."*

**Phase 3 ADOPTS B4's three branches and AMENDS the first one, on measurement.** Where N is the
union of §2.8's two NEED lists:

| branch | behaviour |
|---|---|
| **N = 0 from RUN 1 but N > 0 from RUN 2** | **PROCEED on run 2.** This is the expected case and it is exactly §2.5's trap. Under B4 as written this would have read as "N=0, good outcome, skip" — which is how a green phase changes nothing she would see. **This amendment is the single most important change this plan makes to the inherited gate.** |
| **N = 0 from BOTH runs** | Skip 3.4-3.7. Recorded plainly as a good outcome, not dressed up (word-g1's precedent). **But the phase is NOT a no-op:** 3.2 (the harness + poison set) and 3.3 (the `light[1]` fix) are independent of N and still ship, and 3.3 closes a live wrong-answer trap. **This differs from word-g1's N=0 branch, which shipped nothing, and it differs deliberately.** |
| **1 <= N <= 25** | Proceed. Batches of <= 10 words, sequential, each gate-green and accepted before the next. |
| **N > 25** | **STOP and put the projected cost to the owner before generating anything.** The estimate is derived, not guessed: `.oplan/word-quiz/design.md:169-171` measured **~9,000 tokens and ~70 seconds per word** for generation, ~276k tokens for 25 words. Verification is the larger half — `.oplan/word-quiz/journal.md:292-293`: *"generation is the cheap part, and N-pass adversarial verification is the entire budget."* So the figure put to the owner is **~11k tokens/word generation + 2 verification passes over N items**, and it is labelled an extrapolation because the record never puts a number on a verification pass (§14.8). Her last known shape (40 words / 15 known / **6 chapters**, `.oplan/word-polish/phase-state.md:36`) and word-polish's **36 distinct glossary words** make `N > 25` a realistic outcome, so this branch should be expected rather than treated as remote. |

**N is measured in step 3.1 and the branch is taken there, before any generation is dispatched.**

### 3.1 — THE CAPTURE, AND THE TARGET WORD LIST  [ORCHESTRATOR]

**GOAL** Take the authorised live capture; derive N and `WORDS.txt`; take the §3.0 branch; leave a
receipt and, at 3.8, a proved deletion.
**TIER** **ORCHESTRATOR.** It holds a key and touches production. **Never a worker's. Never the
planner's** — the planner made no request of any kind.
**DEPENDS ON** nothing. It is the first step. (3.2 and 3.3 are independent and may run in parallel.)
**REPO WRITE SET** **EMPTY** outside `.oplan/` — asserted by V1 (`porcelain-outside-oplan=0`) and
by V14, which also catches a **gitignored** capture that V1 cannot see.

**THE CAPTURE COMMAND IS FROZEN. Quoted VERBATIM from `.oplan/word-quiz/plan.md:1573-1586` —
line numbers VERIFIED by this planner today (`:1573` is the `**6.2 THE BACKUP (capture #1)**`
header; `:1586` is the closing fence). Do not improvise it. Do not "improve" it.**

```bash
set -o pipefail
mkdir -p /c/Users/dkreinov/english-app-backups   # Git-Bash path form — a Windows-style path here creates a stray repo file (field guide 4)
BK="/c/Users/dkreinov/english-app-backups/profile-$(date +%Y%m%d-%H%M%S).json"
code=$( ( set -a; . ./.env; set +a
          curl -s --ssl-no-revoke -H "x-app-code: $APP_CODE" \
               -o "$BK" -w '%{http_code}' \
               https://english-app-three-tan.vercel.app/api/profile ) )
case "$code" in 200) ;; 401) echo "FAIL: 401 - local .env APP_CODE != production (B2: stop, owner supplies it out of band)"; exit 1;;
                *) echo "FAIL: GET -> $code"; exit 1;; esac
[ -z "${APP_CODE:-}" ] || { echo "FAIL: APP_CODE leaked into this shell"; exit 1; }
```

**Why each part is load-bearing, quoted from `.oplan/word-quiz/plan.md:1587-1590`:**

> *"The subshell `( set -a; . ./.env; set +a; curl ... )` is the load-bearing part: `.env` is
> sourced INSIDE the parentheses so `APP_CODE` dies with the subshell — `isAuthorized` is open only
> when it is UNSET, and a leak silently 401s the whole suite for the rest of the phase; the
> post-assertion proves it did not leak. `$APP_CODE` is never echoed, never logged."*

And, stated openly in the same passage rather than hidden: *"this GET can rewrite her file into
sorted-key order — byte-identical to what her own app does on every load."*

**ONE authenticated GET. `--ssl-no-revoke` is required on this machine. The Git-Bash path form is
required** — a Windows-style path there is the exact stray-repo-file trap V14 now gates.

**THE OBLIGATIONS, DISCHARGED IN THIS PHASE, NOT DEFERRED:**

1. **RECEIPT** — path, bytes, sha256, word/known/candidate/chapter counts — appended to
   `.oplan/word-finish/backup-receipt.txt`. **NEVER contents.** The `.oplan/word-quiz/backup-receipt.txt`
   form is copied exactly.
2. **HOME** — `$BK` lives at `/c/Users/dkreinov/english-app-backups/`, **outside the repository**.
3. **DELETION** — at 3.8, with the pre-delete sha256 verified equal to the receipt, and the
   machine-wide identity sweep re-run afterwards reporting **no profile of hers**. This is D27 and
   F1-4 as standing policy, and **F1-4 grows by this step; the growth is recorded in `phase-state.md`.**
4. **THE PROJECTED COPY** of §2.8 is also a copy of her data. It lives beside `$BK`, is listed in
   the receipt, and is deleted with it.

**THE DERIVATION (§2.8), using the SHIPPED `scripts/quiz-topup.mjs`, UNMODIFIED, twice:**

* **RUN 1** `node scripts/quiz-topup.mjs --profile $BK` -> `.oplan/word-finish/topup-3-run1.txt`
* **PROJECT** a throwaway copy in which every word key appearing in any `chapter.glossary` is
  copied with `status: "known"`. **The projection script is written to a FILE, outside the repo**
  (field guide 19), copies each entry rather than mutating it (`quiz-core.js:86`'s own rule), and
  prints `chapters=<n> distinct-glossary-words=<g> glossary-in-profile=<gp> projected=<x>`.
* **RUN 2** `node scripts/quiz-topup.mjs --profile $PROJECTED` -> `topup-3-run2.txt`
* **`--manifest` IS NOT PASSED.** The default `public/audio/words/index.json` is correct and is the
  F2-2 ruling applied (§2.8). `--exclusions` is not passed either; the default is QZ-8's 37, and
  V7 re-verifies the count.
* `WORDS.txt` = union of the two `NEED` lists, `LC_ALL=C sort -u`, **outside the repo**.

**MANDATED FAIL-FIRST — three, each watched before the real run:**

1. **The projection must be seen to change the answer.** Run both scripts against the
   **synthetic fixture this planner already built** (`wf-p3-plan/evidence/synth-profile.json`,
   4 `known` + 10 `learning`, ten of which lack items). Measured today:
   ```
   $ node scripts/quiz-topup.mjs --profile evidence/synth-profile.json
   TOPUP known=4 candidate=0 pool=4 dropped=0 covered=4 missing=0 banned=0
   ```
   The projected run over the same fixture must report `missing=10`. **If it does not, the
   projection is broken and the step stops.** This is §2.5's trap, watched failing and then fixed,
   on a fixture, before her real data is ever involved.
2. **The glossary extractor must be seen to fire.** Against a fixture with `chapters: []`, expect
   `chapters=0 distinct-glossary-words=0` and a **refusal to continue** — not a silent fall-through
   to run 1's pool.
3. **The leak assertion must be seen to fire.** With `APP_CODE` deliberately exported in the parent
   shell, the frozen command's post-assertion must print
   `FAIL: APP_CODE leaked into this shell` and exit 1. **Run this against a bogus URL, never
   against production.**

**VALIDATION TAIL**

```
EX=$(wc -l < /c/Users/dkreinov/f3-val/val-f3.sh); [ "$EX" = "176" ] || F "3.1 extracted preamble is $EX lines, expected 176"
head -1 /c/Users/dkreinov/f3-val/val-f3.sh | grep -qx '# ===== BEGIN VAL-F3 =====' || F "3.1 extracted preamble does not start at the marker"
case "$PORC"    in 0) ;; *) F "3.1 repo write set must be EMPTY outside .oplan";; esac
case "$CAPIN"   in 0) ;; *) F "3.1 a capture is inside the repo";; esac
case "$SBBAD"   in 0) ;; *) F "3.1 a sandbox fixture is not synthetic";; esac
case "$FILES$ITEMS" in 6284) ;; *) F "3.1 bank must be untouched, got $FILES/$ITEMS";; esac
case "$BANKDIG" in b3cba82170c705f5ffe2c7afe3741152) ;; *) F "3.1 bank digest moved";; esac
case "$TOTAL$FLAT" in 380375) ;; *) F "3.1 ledger moved: $TOTAL/$FLAT";; esac
M1=$(sed -n 's/^TOPUP .*missing=\([0-9]*\).*/\1/p' .oplan/word-finish/topup-3-run1.txt)
M2=$(sed -n 's/^TOPUP .*missing=\([0-9]*\).*/\1/p' .oplan/word-finish/topup-3-run2.txt)
G=$(sed -n 's/.*distinct-glossary-words=\([0-9]*\).*/\1/p' .oplan/word-finish/topup-3-projection.txt)
[ -n "$M1" ] && [ -n "$M2" ] || F "3.1 could not parse a missing= count"
[ "$G" -gt 0 ] 2>/dev/null || F "3.1 glossary extraction observed $G words -- decoration (fg 18)"
[ "$M1" != "$M2" ] || F "3.1 M1 == M2 ($M1): plan 2.5's analysis is wrong -- STOP for a re-ruling"
N=$(grep -c . /c/Users/dkreinov/f3-stage/WORDS.txt)
[ "$N" -le 25 ] || F "3.1 N=$N exceeds 25 -- STOP and put the projected cost to the owner (plan 3.0)"
grep -q "^capture " .oplan/word-finish/backup-receipt.txt || F "3.1 no capture receipt"
echo "3.1 M1=$M1 M2=$M2 glossary=$G N=$N"
exit $RC
```

Note `[ "$N" -le 25 ] || F ...` deliberately makes the large-N branch a **hard stop**, not a
warning: B4's own wording is *"STOP and put the projected cost to the owner"*, and a warning is
something an executor scrolls past.

**LEDGER** 380 reported / 375 flat (unchanged — this step writes no test).

### 3.2 — THE CORRECTNESS-PASS HARNESS AND THE FROZEN POISON SET  [WORKER]

**GOAL** Make §6's counts mechanical instead of prose, and freeze the poison set.
**TIER** WORKER. No key, no money.
**DEPENDS ON** nothing. **Can run in parallel with 3.1** and does not depend on B-F3-1.
**REPO WRITE SET** exactly two files:

| path | endings | note |
|---|---|---|
| `scripts/check-item-batch.mjs` | **LF** (all of `scripts/` is LF — measured) | NEW |
| `tests/item-batch.test.js` | **LF** | NEW — its own file, per fg 27 |

Plus, **outside the repo**: `C:/Users/dkreinov/f3-poison/{glow,moon,harm}.json`, extracted from
this plan §6.1 **by script, never retyped** (the FC-5 pattern). Their md5s, measured today:

```
glow.json  8 distractors, 2 leaks (shine, burn)
moon.json  8 distractors, 4 leaks (star, sun, cloud, bird)
harm.json  8 distractors, 1 leak  (hurt)
```

**FROZEN ARTIFACT** the poison JSON of §6.1, verbatim. **`lib/quiz-item.js` is NOT touched** —
§VAL-F3 V6 pins its md5 `6c0d4c0e54c890721a3825e8f6ccdeca`.

`check-item-batch.mjs` re-implements NO rule (`check-quiz-bank.mjs:12-14`'s own reason). It:
shells out to `check-quiz-bank.mjs --dir <staged>`; reads a `verdicts.json` per pass; and prints
exactly the §6.5 block. It **exits non-zero** if `reviewed == 0`, if `verdicts != reviewed`, or if
`poisonRecall < 3/3`.

**MANDATED FAIL-FIRST** — three mutations, each watched:
1. a `verdicts.json` missing one item -> expect `FAIL: verdicts 14 != reviewed 15`;
2. a pass that flags 2 of 3 poisons -> expect `FAIL: poisonRecall 2/3 -- pass NOT TRUSTED`;
3. an empty verdicts file -> expect `FAIL: reviewed=0 -- the pass observed nothing` (fg 18: a sweep
   that observed nothing is decoration).
**INVERTED GATE, and it is the unusual one:** the tail asserts
`node scripts/check-quiz-bank.mjs --dir /c/Users/dkreinov/f3-poison` exits **0** and prints
`QUIZ BANK OK: 3 files, 3 items` — **verified by this planner today**. A RED result means the
poisons have stopped being shape-legal and must be rebuilt.
**VALIDATION TAIL**
```
POUT=$(node scripts/check-quiz-bank.mjs --dir /c/Users/dkreinov/f3-poison); PRC=$?
case "$PRC" in 0) ;; *) F "3.2 poison set no longer passes the SHAPE gate (exit $PRC) -- rebuild it";; esac
case "$POUT" in *'QUIZ BANK OK: 3 files, 3 items'*) ;; *) F "3.2 poison gate line: $POUT";; esac
case "$PORC"   in 0) ;; *) F "3.2 stray path outside .oplan";; esac
case "$BANKDIG" in b3cba82170c705f5ffe2c7afe3741152) ;; *) F "3.2 bank digest moved -- 3.2 writes no item";; esac
case "$FILES"  in 62) ;; *) F "3.2 bank files $FILES";; esac
case "$TOTAL"  in 380) F "3.2 ledger did not grow";; esac
echo "3.2 ledger=$TOTAL/$FLAT"
exit $RC
```
**LEDGER** 380 -> **380 + T reported**, 375 -> **375 + T flat**, T = the number of flat `test(` in
`tests/item-batch.test.js`. **The executor pins T by counting the file it actually wrote**, not by
predicting it, and re-reads the total back (fg 19: a file that fails to parse silently removes all
of its tests).

### 3.3 — CLOSE THE SHIPPED LEAK IN `light.json[1]`  [WORKER]

**GOAL** Remove the wrong-answer trap the project's own audit called *"the single failure this
entire phase existed to prevent"* and which is still live (§6.2).
**TIER** WORKER. **DEPENDS ON** nothing. **Independent of B-F3-1.**
**REPO WRITE SET** exactly two files:

| path | before md5 | after md5 (SIMULATED, measured) | endings |
|---|---|---|---|
| `public/quiz/light.json` | `62802df5b67f5807e62b89d968d4ff6e` | `f00b091b7f4208ec8783f06a0f6ff320` | LF, CR=0 LF=16 before and after |
| `tests/quiz-core.test.js` | — | pin re-expressed, see below | LF |

**Post-edit `BANK-62-DIGEST`, measured on the mirror: `e1e890c0e034223dfa4dfd86d6f3e898`.**
Every step after 3.3 pins that value instead of `b3cba821...`.

**The candidate edit, simulated and measured today** (`television` -> `iron`, `computer` -> `clock`;
both replacements are manifest members, neither emits light, both are same-class switchable
appliances, and neither is named by the gloss so rule 13 stays clean):

```
[1] Please turn on the ___ so that I can see my book. || radio, iron, oven, fan, camera, clock, machine, motor
$ node scripts/check-quiz-bank.mjs --dir <mirror>/public/quiz
QUIZ BANK OK: 62 files, 84 items
MULTI-SENSE: 19 files with >=2 items
```

**THE FROZEN PIN THAT COLLIDES, and how it moves (fg 22).** `tests/quiz-core.test.js:89` asserts

```js
assert.deepStrictEqual(opts1, ['radio', 'television', 'oven', 'fan', 'camera', 'light']);
```

That pin names a **property** — *"`selectOptions` takes the first five distractors in file order,
appends the answer, and is deterministic under a stubbed rand"* — in a **spelling** that happens to
list five particular words. **The pin is RE-EXPRESSED, never deleted.** The new value is DERIVED by
running the shipped function against the edited file, not typed:

```
$ node -e "selectOptions(light[1], new Set(), () => 0)"
["radio","iron","oven","fan","camera","light"]
```

**MANDATED FAIL-FIRST — already performed by this planner, on the mirror:** apply the `light.json`
fix, leave the OLD pin, run the file:

```
$ node --test tests/quiz-core.test.js
not ok 5 - selectOptions really shuffles and is deterministic under a stub rand, on public/quiz/light.json[1]
# pass 7
# fail 1
```

The executor must reproduce exactly that `not ok 5` line before applying the pin change.

**A SECOND, NEW ASSERTION, and it must be seen to fail too:** a flat test in
`tests/quiz-core.test.js` asserting **no item in `public/quiz/light.json` offers a distractor that
is itself a light source**, against a small frozen list extracted from the plan. Watched failing on
the pre-fix file (`television`, `computer` both named), then passing. This is a **GUARD**, not a
gate — it names three words and cannot generalise — and it is labelled a guard.

**VALIDATION TAIL**
```
L=$(md5sum < public/quiz/light.json | cut -d' ' -f1)
case "$L" in f00b091b7f4208ec8783f06a0f6ff320) ;; *) F "3.3 light.json md5 $L";; esac
case "$BANKDIG" in e1e890c0e034223dfa4dfd86d6f3e898) ;; *) F "3.3 BANK-62-DIGEST $BANKDIG";; esac
case "$FILES$ITEMS" in 6284) ;; *) F "3.3 bank must stay 62/84, got $FILES/$ITEMS";; esac
LEAK=$(node -e 'const a=require("./public/quiz/light.json");const bad=["television","computer","lamp","candle","screen","torch"];process.stdout.write(String(a.flatMap(i=>i.distractors).filter(d=>bad.includes(d)).length))')
case "$LEAK" in 0) ;; *) F "3.3 light.json still offers $LEAK light-source distractor(s)";; esac
echo "3.3 light.json clean, digest=$BANKDIG ledger=$TOTAL/$FLAT"
exit $RC
```
**LEDGER** 3.2's total **+1 flat** (the new guard). Re-read, never predicted.

### 3.4 — GENERATE THE ITEMS INTO STAGING  [WORKER x ceil(N/10), SEQUENTIAL]

**GOAL** Draft `<lemma>.json` for every word in `WORDS.txt`, staged **outside the repo**.
**TIER** WORKER. **Zero money** (D7/QZ-4 — pending B-F3-2). **DEPENDS ON** 3.1, 3.2.
**REPO WRITE SET** **EMPTY.** A half-finished batch leaves nothing in the repo — that is the
purpose of staging outside it (§5.4).
**Output** `C:/Users/dkreinov/f3-stage/batch-<n>/<lemma>.json`.

**FROZEN ARTIFACTS, ALL QUOTED VERBATIM IN THE PACKET (fg 9 — naming without quoting is a hole):**
* **QZ-1 rules 1-13** — `.oplan/word-quiz/plan.md:51-155`, in full.
* **QZ-2 the generation rules** — `.oplan/word-quiz/plan.md:157-225`, in full, **plus the RIDER of
  §4.5** correcting the now-false `after`/`feet` claim.
* **QZ-24 the sentence-only bar** — `.oplan/word-quiz/plan.md:1644-1651`. **The bar is QZ-24, not
  D22.** A packet quoting D22's presentation clause quotes a superseded rule.
* **D21** — `.oplan/word-quiz/design.md:78-95`, in full.
* **The 37 exclusions** — `.oplan/word-quiz/qz8-exclusions.txt`, in full.
* **THE RULE THAT IS LOAD-BEARING AND HAS NEVER BEEN IN ANY CONTRACT**, quoted from
  `.oplan/word-quiz/journal.md:103-105` and **promoted to a contract by this phase**:
  > *"The unwritten rule that turned out to be load-bearing: **never offer a near-synonym, hypernym
  > or co-hyponym of the answer.** For open-class words no sentence can exclude one, so curation of
  > the option list is the entire defence. Write it into the phase 2 packets explicitly."*
  It was never written in. **Every one of §6.1's eight poison leaks is exactly this rule broken.**
* **The stop-and-ask backstop:** *"If a word cannot be given an age-appropriate sentence, STOP and
  return the question. Do not guess."* Precedent: *"`fan[1]` DELETED — 7 of 8 options flagged;
  SHIP FEWER ITEMS RATHER THAN A LEAKY ONE."*
* **RULE-8 IS OFF FOR THESE WORDS (§3.4), stated in the packet:** for any answer with no band
  entry, the pos-intersection check does not fire. Distractor class is unenforced. Curate by hand.
* **Batches of <= 10 words, sequential**, each gate-green and accepted before the next.
* *"You MUST run the gate on your own work before returning, and iterate until it is green."*

**FAIL-FIRST** Before generating, the worker runs
`node scripts/check-quiz-bank.mjs --dir <its empty batch dir>` and confirms `QUIZ BANK OK: 0 files,
0 items` **exit 0** — the documented missing-directory behaviour — so it has watched the gate be
green on nothing and knows a green gate proves nothing about coverage.
**VALIDATION TAIL**
```
case "$PORC" in 0) ;; *) F "3.4 staged items must not touch the repo";; esac
case "$BANKDIG" in e1e890c0e034223dfa4dfd86d6f3e898) ;; *) F "3.4 bank changed before approval";; esac
case "$FILES$ITEMS" in 6284) ;; *) F "3.4 public/quiz/ must still be 62/84, got $FILES/$ITEMS";; esac
SOUT=$(node scripts/check-item-batch.mjs --stage /c/Users/dkreinov/f3-stage); SRC=$?
case "$SRC" in 0) ;; *) F "3.4 staged batch gate exited $SRC";; esac
SF=$(printf '%s\n' "$SOUT" | sed -n 's/^BATCH *files=\([0-9]*\).*/\1/p')
W=$(grep -c . /c/Users/dkreinov/f3-stage/WORDS.txt)
[ "$SF" = "$W" ] || F "3.4 staged $SF files for $W words -- a word was silently dropped"
echo "3.4 $SOUT"
exit $RC
```
`[ "$SF" = "$W" ]` is the clause that catches a batch that quietly produced fewer files than words —
"observed == requested", fg 18.
**LEDGER** unchanged from 3.3.

### 3.5 — THE CORRECTNESS PASS  [WORKER x2 BLIND, PARALLEL; then ORCHESTRATOR]

**GOAL** Find every distractor that also fits, before the owner sees anything.
**TIER** WORKER x2 for the passes; **ORCHESTRATOR** for adjudication. **DEPENDS ON** 3.4.
**REPO WRITE SET** **EMPTY.**
**FROZEN ARTIFACT** QZ-24's question, verbatim, and nothing else:
> *"IGNORING the gloss entirely, does any of the 8 distractors fit the sentence?"*

**Circularity is broken structurally (§6.3):** neither pass agent authored the item; neither sees
the generation packet, the gloss, an answer key, or the other pass; both are dispatched in parallel
from clean contexts; adjudication is the orchestrator's.
**The three poison files are shuffled into each pass's input** and the recall measured (§6.4).
**A pass scoring < 3/3 is discarded and re-run with a fresh agent.**

**MANDATED FAIL-FIRST** Already established: §6.1's poison set passes the shape gate
(`QUIZ BANK OK: 3 files, 3 items`, exit 0) while carrying eight wrong-answer traps. The step also
runs the §6.3 mechanical triage once **and records its measured worthlessness**
(`FLAGGED 0 pairs` on the poison set, `0` on `light.json`) so the next run does not rebuild it.
**Dispositions** REWORK / DELETE / KEEP-with-reason, per §6.6, each recorded in the
`d28-sweep.txt` form.
**VALIDATION TAIL**
```
case "$PORC" in 0) ;; *) F "3.5 must write nothing into the repo";; esac
case "$FILES$ITEMS" in 6284) ;; *) F "3.5 bank changed";; esac
V=$(node scripts/check-item-batch.mjs --stage /c/Users/dkreinov/f3-stage --verdicts); VRC=$?
case "$VRC" in 0) ;; *) F "3.5 correctness pass gate exited $VRC";; esac
case "$V" in *'poisonRecall=3/3'*) ;; *) F "3.5 a pass did not reach 3/3 poison recall: $V";; esac
RV=$(printf '%s\n' "$V" | sed -n 's/.*reviewed=\([0-9]*\).*/\1/p' | sort -u | tr '\n' ' ')
case "$RV" in *0*) F "3.5 a pass reviewed 0 items -- decoration";; esac
echo "3.5 $V"
exit $RC
```
**LEDGER** unchanged.

### 3.6 — THE OWNER GATE  [ORCHESTRATOR + OWNER]

**GOAL** The owner reads every new item and `light[1]`, and approves — or does not.
**TIER** ORCHESTRATOR + OWNER. **DEPENDS ON** 3.3, 3.5.
**REPO WRITE SET** **EMPTY.** At the moment he looks, **not one item byte is in the repository.**
**Artifact** `C:/Users/dkreinov/f3-review/items.html` — self-contained, opened in his browser,
**outside the repo**, deleted at 3.8. Shape frozen from `.oplan/word-g1/plan.md:3079-3085`
(§7.2), **every item enumerated, never `--sample`**, answer NOT marked, gloss behind `רמז`.
Hebrew byte-sliced from `public/quiz.js:188`, never retyped (fg 8, FC-7).

Below the cards: per-pass flag counts, **poison recall**, agreement rate, every disposition, every
KEPT-with-reason, the drop report, the `light[1]` before/after with the audit quote, and the honest
limits statement:
> *"No mechanical gate can see a distractor that also fits. This review covers the N new items and
> `light[1]`. The other 83 shipped items were last reviewed on 2026-07-27 by a two-pass sweep that
> missed `light[1]`."*

**"APPROVED" IS MECHANICAL FOR THE FIRST TIME (§7.3).** The orchestrator writes
`f3-stage/APPROVED.txt` — `APPROVED <ts>` / `BATCH-DIGEST <md5>` / `FILES <n>` / the file list —
only after his explicit yes, whose verbatim words go in the journal.
**MANDATED FAIL-FIRST** Run 3.7's promoter **before** `APPROVED.txt` exists and watch it refuse
(`FAIL: no APPROVED.txt`); then with a deliberately stale digest and watch
`FAIL: BATCH-DIGEST mismatch -- the batch changed after approval`.
**IF THE SAMPLER IS USED AT ALL**, the tail proves on the REAL staged data that it shows what it
says (the "40 of 50" defect):
```
S=$(node scripts/check-quiz-bank.mjs --dir /c/Users/dkreinov/f3-stage/batch-1 --sample "$N")
SHOWN=$(printf '%s\n' "$S" | grep -c '^\S*\.json\[')
DISTINCT=$(printf '%s\n' "$S" | sed -n 's/^\(\S*\.json\)\[.*/\1/p' | LC_ALL=C sort -u | wc -l)
[ "$SHOWN" = "$N" ] || F "3.6 --sample $N printed $SHOWN items"
echo "3.6 sampler: items=$SHOWN distinct-words=$DISTINCT of N=$N"
```
**VALIDATION TAIL** as above, plus `case "$PORC" in 0) ;; *) F "3.6 repo must be clean";; esac`
and the `APPROVED.txt` shape check, ending `exit $RC`.
**LEDGER** unchanged.

### 3.7 — PROMOTE, AND PROVE IT REACHES HER  [ORCHESTRATOR]

**GOAL** Move approved items into `public/quiz/`, and prove by execution that the chapter-first
quiz now asks her own words.
**TIER** ORCHESTRATOR. **DEPENDS ON** 3.6.
**REPO WRITE SET** exactly N new files, `public/quiz/<lemma>.json`, **all LF**, **no existing file
modified** (3.3 was the only modification and it is already committed).
Post-3.7 pins — `FILES = 62 + N`, `ITEMS = 84 + I`, and a new `BANK-DIGEST`, all **measured on a
simulated post-promotion mirror before the step is dispatched**, never predicted.

**The promoter** refuses unless `APPROVED.txt` exists, its `BATCH-DIGEST` recomputes, `FILES`
agrees, every listed file is present, no staged file is unlisted, and **no target path already
exists** (phase 3 creates, never overwrites).

**THE STEP'S REAL GATE — Q10's check (§9.3):** drive the SHIPPED `chapterQuizLemmas` + the SHIPPED
bank over a fixture whose glossary is exactly `WORDS.txt` and whose `profile.words` holds those
words as `learning`. **BEFORE promotion the four questions must be the fall-through pool; AFTER
promotion all four must come from `WORDS.txt`.** Both transcripts into the journal. Its fail-first
is free: run the AFTER assertion against the un-promoted tree and watch it fail. The planner has
already run both halves on a synthetic fixture (§2.3):
```
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
AFTER : the FOUR questions she would get:          ["deer","glow","growl","scary"]
```
**VALIDATION TAIL**
```
case "$FILES" in <62+N>) ;; *) F "3.7 bank files $FILES, expected <62+N>";; esac
case "$ITEMS" in <84+I>) ;; *) F "3.7 bank items $ITEMS";; esac
case "$BANKDIG" in <measured>) ;; *) F "3.7 bank digest $BANKDIG";; esac
NEWLF=$(for f in $(cat /c/Users/dkreinov/f3-stage/APPROVED.txt | grep '\.json$'); do tr -dc '\r' < "public/quiz/$f" | wc -c; done | LC_ALL=C sort -u | tr -d ' \n')
case "$NEWLF" in 0) ;; *) F "3.7 a promoted file is not LF (CR counts: $NEWLF)";; esac
node /c/Users/dkreinov/f3-val/selector-proof.mjs --after || F "3.7 chapter-first still does not reach her words"
echo "3.7 promoted, bank=$FILES/$ITEMS digest=$BANKDIG"
exit $RC
```
**LEDGER** unchanged (no new test; the selector proof is a step gate, not a suite test — **and it
is labelled a GATE, because it was seen to fail on the un-promoted tree**).

### 3.8 — CLOSE  [ORCHESTRATOR]

**GOAL** Record, and leave nothing of hers behind.
**REPO WRITE SET** `.oplan/word-finish/{phase-state.md,journal.md,STATUS.md}` only.
Actions: write **FC-8** (the F2-2 ruling, §3.5); correct `design.md:14`, `phase-state.md:81` and
`STATUS.md:35` (§2.4 — the premise is about GLOSSARY words); record carried obligation **F3-1**
(phase 3 deployed nothing; the items reach her only at phase 4); record that **F1-4 GREW** by
step 3.1's capture; record the RECORD GAPS of §13 into `design.md`.

**THE DELETION, PROVED — this is the step's real work, not its paperwork:**

1. `sha256sum "$BK"` and the projected copy, compared to the receipt **before** deleting. A
   mismatch means something else wrote to them and the step STOPS.
2. Delete `$BK`, the projected copy, and `f3-stage/`, `f3-review/`, `f3-poison/`, `f3-val/`.
3. Append `deleted <path> sha256=<...> <ISO ts>` to `.oplan/word-finish/backup-receipt.txt`.
4. **Re-run the machine-wide identity sweep** — the F1-4 form, the same script this planner ran in
   §2.1, which asks every file "are you a profile?" rather than looking in remembered directories.
   Its baseline, measured today: `OBSERVED files=303840 ... PROFILE-SHAPED=21`, all synthetic.
   **The close requires the same result: 21 profile-shaped files, every one either the frozen
   synthetic word-key set or a <=2-word comparator fixture, and NONE hers.** Counts and paths only;
   no word is ever printed.

**VALIDATION TAIL** full §VAL-F3 (V14 `capture-in-repo=0`, V15 `sandbox=5seen/0bad`) + all of
3.7's pins + `[ ! -e "$BK" ]` + `[ ! -d /c/Users/dkreinov/f3-stage ]` + the sweep reporting
`PROFILE-SHAPED=21` with 0 non-synthetic, ending `exit $RC`. **Fail-first:** re-run the tail with
`$BK` deliberately still present and watch `FAIL: 3.8 the capture was not deleted`.

### Step dependency summary

```
3.1 CAPTURE ──> 3.0 size gate ──┐
   (ORCHESTRATOR, 1 live GET)   ├──> 3.4 ──> 3.5 ──> 3.6 ──> 3.7 ──> 3.8
3.2 harness + poison ───────────┘                     ^              ^
3.3 light[1] fix ─────────────────────────────────────┘              │
                                                   (deletion proved) ┘
```

**3.2 and 3.3 depend on nothing and can start immediately, in parallel with the capture.** They are
also what makes the N=0-on-both branch a real phase rather than a no-op: **3.3 alone closes a live
wrong-answer trap on `light`, the one bank word her glossary is measured to reach.**
---

## §11. WHERE THIS PLAN AGREES WITH `.oplan/word-quiz/` STEP 6, AND WHERE IT DELIBERATELY DIFFERS

Word-quiz phase 6 did this phase once already, at smaller scale (12 words, 14 items), and it
**measured** things this plan would otherwise have guessed. Its sequence was: capture -> top-up list
-> generation in batches -> adversarial verification -> owner's HTML review gate -> CACHE bump ->
deploy -> read-back. Read in full. Stated explicitly, as the orchestrator required:

### ADOPTED UNCHANGED — because it was measured and it holds

| inherited | why it is kept |
|---|---|
| **D7 / QZ-4: no paid API, no runtime LLM** — worker agents author items | `.oplan/word-quiz/design.md:36`. **This contradicts `design.md:107` and brief §6, which name a paid API.** Raised as B-F3-1 below. |
| **The frozen capture ritual** (`plan.md:1573-1586`) | the only sanctioned live read; line numbers verified today |
| **`quiz-topup.mjs`'s FILTER ORDER** — QZ-8 -> direct manifest membership -> bank | reused unmodified; re-implementing it would be a second drifting copy (§2.8) |
| **B4's three-way N gate** | adopted, **with the N=0 branch amended** (§3.0) |
| **Batches of <= 10 words, sequential, each accepted before the next** | `plan.md:1603-1606` |
| **QZ-1 rules 1-13, QZ-2, QZ-24, D21, the pin test, the irregular-forms list, the 37 exclusions** | quoted verbatim into every packet |
| **N=2 blind adversarial recognition passes + orchestrator adjudication** | measured: one pass ~ half the leaks, two agreed 53% |
| **"Ship fewer items rather than one leaky item"** | precedent `fan[1]` deleted |
| **An HTML review page, gloss behind `רמז`, answer not marked** | the D28 form, `.oplan/word-g1/plan.md:3079-3085` |

### NOT PROPOSED — because that run cleanly DISPROVED it, and I re-measured one of them

| rejected | evidence |
|---|---|
| **A blind fill-the-blank solver** | REFUTED: `journal.md:261-275`, *"items flagged: 0 of 71 · known leaks caught: 0 of 5 ... generation is not recognition."* **I nearly designed this before reading the record; it is the obvious idea and it does not work.** |
| **"Two independent constraints per item"** | REFUTED: `journal.md:230-259`. 2-constraint items were slightly *worse*; 55 of 71 open-class items are unpinnable in principle. |
| **A mechanical semantic near-miss detector** | **I built one anyway, on the bands' `meaning` field, and measured it: precision ~0 (7 flags, 0 real), recall 0 (0 of 9 known leaks)** (§6.3). Recorded so the next run does not rebuild it. |
| **`--sample N` for the human gate** | its own successor run already banned it; and `--sample 50` once showed 40 of 50 words |

### DELIBERATELY DIFFERENT — five changes, each with its reason

1. **The N=0 branch is amended.** word-g1 hit `N=0` and shipped nothing, calling it *"a GOOD
   outcome"*. It was — for the question `quiz-topup.mjs` asks. **§2.5 executes that script on a
   fixture where ten of fourteen words lack items and it still prints `missing=0`.** A phase that
   accepts run 1's `N=0` closes green and changes nothing she would see. Hence the projection of
   §2.8 and the amended branch of §3.0. **This is the most consequential difference.**
2. **A NEGATIVE CONTROL for the correctness pass.** word-quiz's two-pass sweep had none, and §6.2
   shows what that cost: two blind passes over all 85 items missed `light[1]`, an item a prior audit
   had already named in writing as the CERTAIN leak. The seeded poison set (§6.4) gates the
   *instrument*, not just the output.
3. **A MECHANICAL APPROVAL ARTIFACT.** In that run "approved" was a sentence in the journal and the
   only mechanical clause counted cards on a page. Phase 3 binds `APPROVED.txt` to a **batch
   digest**, so an unapproved or post-approval-edited batch structurally cannot reach
   `public/quiz/` (§7.3).
4. **AN EXECUTED PROOF THAT THE WORK REACHES HER.** No prior run drove the selector after
   promotion. Step 3.7 does, before/after, on the shipped modules (§9.3) — the check
   `.oplan/word-polish/journal.md` FINDING 2 did not have.
5. **A SHIPPED DEFECT IS FIXED (step 3.3).** `light[1]` is still live and byte-unchanged since
   `24c67dc`. That is not scope creep: `light` is the single word word-polish measured as the
   intersection of her 36 glossary words with the bank.

### AND ONE RULE THAT RUN CALLED LOAD-BEARING AND NEVER WROTE DOWN

`.oplan/word-quiz/journal.md:103-105`, verbatim:

> *"The unwritten rule that turned out to be load-bearing: **never offer a near-synonym, hypernym
> or co-hyponym of the answer.** For open-class words no sentence can exclude one, so curation of
> the option list is the entire defence. Write it into the phase 2 packets explicitly."*

**It was never written into QZ-1 or QZ-2** — verified. Every one of §6.1's eight poison leaks is
this rule broken. **Phase 3 promotes it to a quoted packet contract** (§10 / 3.4). RECORD GAP 10.

---

## §12. Q9 — THE TRAPS PHASE 2 PAID FOR, HANDLED PER STEP

| trap (field guide) | where it bites phase 3 | handled |
|---|---|---|
| **27** — a test verified in isolation is not verified in its file | `tests/item-batch.test.js` is new; `tests/quiz-core.test.js` already reads `public/quiz/light.json` at module scope | 3.2's tests get **their own file with a header saying why**. 3.3 appends to `quiz-core.test.js` **and stubs no module**, so no cache collision exists — stated explicitly rather than assumed. |
| **a gate edit must be VERIFIED TO HAVE LANDED** | every step tail | each tail is built from a quoted heredoc **written to a file**, and its clauses are **counted** before it is run. A replacement that silently did not match is caught by the count, not by belief. |
| **18** — instrument every sweep | 3.1, 3.4, 3.5, 3.7 | 3.1 requires `glossary > 0` and `M1 != M2`; 3.4 requires `staged files == words`; 3.5 requires `verdicts == reviewed` and `reviewed > 0`; §6.5's block is mandatory output. |
| **18 (first half)** — never build a pattern out of the content you search for | 3.3's light-source guard; 3.6's sampler count | 3.3 extracts distractors **structurally** (`JSON.parse` -> `.distractors`) then tests membership. 3.6 counts `^\S*\.json\[` headers, not item text. |
| **22** — a frozen pin and a mandated edit collide | `tests/quiz-core.test.js:89` vs the `light.json` fix | ruled in §8: the pin names a **property** in a spelling. **Re-expressed, never deleted, and SEEN TO FAIL** (`not ok 5`, reproduced today on the mirror). |
| **16** — endings by byte count, never grep | every file phase 3 writes | measured both ways in §1.3. **All 62 bank files are LF; all of `scripts/` and `tests/` is LF.** V9 re-measures every bank file every run and **was seen to fire** (mutation 3). No CRLF file is in the write set. |
| **8, 19** — Hebrew byte-sliced; scripts go in FILES | 3.6's `רמז`; every script | sliced from `public/quiz.js:188`, never retyped, never inside a tool-call string. **This planner hit the shell-quoting trap twice while drafting and moved to files both times** — the plan says so because the habit, not the memory, is the countermeasure. |
| **9** — a frozen validation can itself be the bug | §VAL-F3's own extractor | **it happened.** The unanchored extractor swallowed 70 lines of prose, threw 19 bash errors and **exited 0**. Caught by running it. The anchored form + a line-count check is now in every tail. |
| **F2-3** — a service worker lives on BOTH `localhost:3000` and `127.0.0.1:3000` | any browser check | **no step in this phase needs a browser.** If one is ever added it uses `PORT=3100`. Stated so the temptation is closed. |
| **24** — a later brief loses an earlier ruling | D7/QZ-4 | **it happened again** — the design names a paid API where D7 forbids one. Raised as **B-F3-1**, not guessed. The F2-2 ruling goes into `phase-state.md` as **FC-8 the day it is made**, and into gate clause V6. |
| **25** — ask the artifact, not the accessor | F2-2's caller list | grepped the artifact's PATH across the whole repo. **Both names F2-2 gives are wrong** (§3.1). |
| **26** — absence from a list is not absence of the behaviour | "these words have no item" | measured **through** the transform: `chapterQuizLemmas` and `loadItem` were DRIVEN, not read (§2.3). |
| **15(a)** — existence is not effect | "62+N files exist" | 3.7's gate is the **executed selector transcript**, not a file count. |
| **15(b)** — assert the SEAM | `light.json` content vs the `quiz-core` pin | 3.3 changes both in one step and the tail asserts both. |
| **17** — a preamble is not a gate | every step | preamble + tail in ONE file, ending `exit $RC`. **Demonstrated: the preamble printed two FAIL lines and exited 0.** |
| **19** — read the test COUNT back | 3.2, 3.3 | T is counted from the file written, never predicted; the reported total is re-read. |
| **2** — a positive assertion needs a negative control | the correctness pass | the **seeded poison set** (§6.4), which this project has never had. |
| **3** — `GET /api/profile` CREATES one | 3.1 | the frozen ritual, orchestrator-only, ONE GET, subshell, leak post-assertion (**seen to fire, against a bogus URL**), receipt, and a proved deletion at 3.8. **This planner made no request of any kind.** |
| **4** — never write scratch into the repo | every artifact | capture, projection, staging, review page, poison set and the extracted preamble all live **outside** the repo. **V14 and V15 gate it and were seen to fire, including on a gitignored file V1 cannot see.** |

---

## §13. BLOCKERS

*(The original B-F3-1 — "which words?" — was **ruled by the orchestrator mid-planning**: capture is
authorised and standing. It is recorded in §2.7 and planned as step 3.1. The blockers below are
renumbered accordingly.)*

### **B-F3-1 — PAID API, or the frozen no-paid-API precedent?** *(blocks step 3.4)*

`design.md:107` and brief §6 say generation *"follows the existing house style
(`scripts/build-item-bank.js` uses `gpt-4.1-mini` via the OpenAI chat API). **PAID API**"*.

**Two things are wrong with that.** `scripts/build-item-bank.js` writes `data/placement-items.json`,
has never touched `public/quiz/`, and does not import `lib/quiz-item.js` (§5.1, §3.1). And the real
precedent is a frozen owner-level decision that **forbids** a paid API for this bank —
`.oplan/word-quiz/design.md:36` (**D7**): *"Generated by **Claude via oplan workers**, cheap tier —
no paid API, no runtime LLM, no second key"* — restated as a phase non-goal at
`.oplan/word-quiz/plan.md:255-258` and again at `.oplan/word-g1/plan.md:2949`.

**This is field guide 24 for the second time in this run**, exactly as the phase-2 brief lost
RULING B2 and said "sixteen".

**Recommendation: follow D7 — worker agents, ZERO money.** The measured cost is ~9,000 tokens/word;
the quality bar is judgement either way, since §6.3 measures mechanical detection at **zero recall**;
and D7's stated reason (the runtime dependency, not the price) has not changed. **§10 is written for
D7.** If the owner overturns it, only 3.4's tier becomes ORCHESTRATOR and a cost/determinism section
is added; nothing else in this plan moves.

### **B-F3-2 — do the other 83 shipped items get re-swept?** *(does not block any step)*

§6.2 establishes that `light.json[1]` — named in writing as *"the single CERTAIN leak"*, *"the
single failure this entire phase existed to prevent"* — survived a **two-pass blind sweep of all 85
items** and is still shipped, byte-unchanged since `24c67dc`. That is a measured failure of the
method the whole bank was signed off on.

Phase 3 fixes `light[1]` and sweeps its own new items with a poison-controlled pass the earlier
sweep never had. **It does not re-sweep the other 83** — ~83 items x 2 passes is a phase of its own.

**Options:** (a) accept, recording that the bank's non-new items were last reviewed by a method now
known to have missed a named defect; (b) fold a full re-sweep into phase 3; (c) schedule it as
phase 5. **Recommendation: (c)** — phase 3 already carries B-F3-1, and the poison control it builds
is exactly the instrument a re-sweep needs.

### **B-F3-3 — `light.json`'s replacement wording is a content decision.** *(blocks step 3.3's pins)*

§10 / 3.3 pins a **simulated and measured** candidate (`television` -> `iron`, `computer` -> `clock`;
post-edit md5 `f00b091b7f4208ec8783f06a0f6ff320`, digest `e1e890c0e034223dfa4dfd86d6f3e898`, gate
green, new pin `["radio","iron","oven","fan","camera","light"]`, old pin seen failing as `not ok 5`).
That candidate is the planner's, not the owner's, and it changes text a child reads. If the
adversarial pass or the owner changes one word, **every pin in 3.3 must be re-derived on a simulated
tree** — they are not hand-computable. Recommendation: 3.3's wording goes through the owner gate at
3.6, where it is already on the review page.

### **B-F3-4 — what happens if the capture returns `N > 25`?** *(may block after step 3.1)*

Not a decision the plan can pre-make, but flagged so it is not a surprise. Her last known shape is
40 words / 15 known / **6 chapters**, and word-polish measured **36 distinct glossary words**. After
QZ-8, off-manifest words and the 62 already banked, `N > 25` is a **realistic** outcome, not a
remote one. §3.0 makes it a hard STOP with a cost estimate. The orchestrator should decide in
advance whether the likely answer is "generate the top 25 by `pickQuizWords` order and defer the
rest to phase 5" or "raise the batch budget", so step 3.1 does not stall.

---

## §14. RECORD GAPS

| # | where | what it says | what is true, measured |
|---|---|---|---|
| **1** | brief §2 | *"branch `master`, tree clean, HEAD `536e520` (verify all three)"* | branch and HEAD confirmed; **the tree is not clean** — `.oplan/word-finish/brief-phase3.md` is untracked. Harmless, but §VAL-F3 had to be written to tolerate it (V1 filters `.oplan/`). |
| **2** | `design.md:14`, `phase-state.md:81`, `STATUS.md:35` | *"only **1** of her ~40 words has a quiz item"* | **Wrong, and it is the phase's premise.** The measured claim is `.oplan/word-polish/journal.md:25-26`: *"her 36 distinct **GLOSSARY** words intersect it in exactly ONE"*. Her **profile** words were measured fully covered (`covered=12 missing=0`, `.oplan/word-g1/journal.md:640`). Glossary != profile words, and the difference is the whole phase (§2.4). |
| **3** | `design.md:99`, brief §6 | item format *"`distractors[≥5]`"* | **Exactly 8.** `lib/quiz-item.js:24` `DISTRACTOR_COUNT = 8`, hard error at `:246`. `>= 5` is `isUsableItem`'s runtime tolerance, not the authoring contract (§1.5). The reason for 8 derived by execution (§4.3). |
| **4** | `design.md:107`, brief §6 | *"`scripts/build-item-bank.js` is named as the precedent"* | **It is the PLACEMENT bank's generator.** Header `:1-4`; writes `data/placement-items.json`; does not import `lib/quiz-item.js`; has never written into `public/quiz/` (§5.1). |
| **5** | `phase-state.md:62-64` (**F2-2**) | callers are *"`scripts/build-item-bank.js`, `scripts/quiz-topup.mjs`"* | **Both wrong.** The only importers are `scripts/check-quiz-bank.mjs:30` and `tests/quiz-item.test.js:7` (§3.1). |
| **6** | `lib/quiz-item.js:58`, `:276` | *"the exempt count ... 63 of 2254"* | **73 of 2264** under the shipped `allowed` (§3.4). Phase 2 added ten off-band words, **every one rule-8 EXEMPT** — a consequence nothing recorded. Comments only, so phase 3 does not edit the contract file; surfaced here. |
| **7** | `.oplan/word-quiz/plan.md:216-222` (**QZ-2**, mandated verbatim into every packet) | *"MEASURED against the real manifest: `after`, `children`, `men`, `women`, `feet` are all **ABSENT**"* | **`after` and `feet` are now PRESENT** — phase 2 added them, and both are likely targets. A worker handed QZ-2 verbatim is misinformed about words it is writing items for. Handled by a RIDER (§4.5), re-expressed not deleted. |
| **8** | the phase-1 sweep criterion (P1-AMENDMENT #1), carried into **F1-4** | a file passes iff *"md5 == the frozen synthetic OR <= 2 words"* | `C:/Users/dkreinov/finish-art/served-profile.json` has **6 words and a different md5** and is provably not hers (identical word-key set). Phase 4's re-run raises a **false alarm** unless the criterion becomes word-key identity. **§VAL-F3 V15 already uses the corrected form.** |
| **9** | `.oplan/word-finish/design.md:17` | names six of her real sandbox words in prose | D27 deleted every *profile file*; it never covered the `.oplan` **record**. Her vocabulary is still partially in the repo in plain text (§2.2). Reported as existence + path, never re-quoted. **Not phase 3's to fix; the owner should know.** |
| **10** | `.oplan/word-quiz/journal.md:103-105` | *"never offer a near-synonym, hypernym or co-hyponym ... Write it into the phase 2 packets explicitly"* — called *"the load-bearing design decision of the entire feature"* | **It was never written into QZ-1 or QZ-2.** Verified. Every one of §6.1's eight poison leaks is this rule broken. Phase 3 promotes it to a quoted packet contract. |
| **11** | `.oplan/word-quiz/design.md:107`, `journal.md:149-157` | the CERTAIN leak `light.json[1]`/`computer` | **Still shipped, byte-unchanged since `24c67dc`**, and the later two-pass QZ-24 sweep did not flag it (§6.2). A live defect, not merely a record error — but the records read as though it was dealt with, and it was not. |
| **12** | *this plan's own first draft* | the §VAL-F3 extractor, written unanchored "for safety" | **It was the bug.** It matched its own command line, swallowed ~70 lines of prose, threw 19 bash errors and **exited 0**. Recorded because field guide 9 says a frozen validation can itself be the bug, and this is the fourth instance in this run. |

---

## §15. WHAT I COULD NOT MEASURE

1. **Her actual current vocabulary and chapter glossaries.** No copy exists on this machine (§2.1 —
   303,840 files swept, 21 profile-shaped, none hers) and I may not read production. Last known:
   40 words / 15 known / 6 chapters, 2026-08-01; 36 distinct glossary words. **What it would take:
   the capture the orchestrator has now authorised — step 3.1.** It is the orchestrator's, not mine.
2. **N, and therefore the item count, the batch count and the final bank pins.** Follows from (1).
   That is why §3.0 is a size gate rather than a number, and why 3.7's `FILES`/`ITEMS`/`BANK-DIGEST`
   pins say "measured on a simulated post-promotion mirror before dispatch" instead of a value.
   **Every other pin in this plan is measured.**
3. **Whether any generated sentence will be good.** No offline check exists — §6.3 measures the
   mechanical detector at **precision ~0, recall 0**, and the record independently refutes the blind
   solver. This is the phase's irreducible residual risk, which is why §6.4 gates the *instrument*.
4. **Whether `light.json[1]`'s `computer` genuinely marks her wrong.** It is a judgement. The
   project's own content auditor called it CERTAIN with a concrete reason (`net.json[1]` teaches the
   collocation — verified in the shipped bank today). I agree on reading it, and I judge
   `television` a second instance. **I could only quote the record and read the item.**
5. **The number of flat tests `tests/item-batch.test.js` adds (T).** Depends on the harness the
   worker writes. Handled by counting the written file and re-reading the reported total (fg 19).
6. **Whether phase 4 will actually deploy these items.** Phase 3 ships nothing. Recorded as carried
   obligation **F3-1**, because "the work was done and she never saw it" is this project's
   documented failure mode and a phase boundary is exactly where it hides.
7. **The token cost of a verification pass.** The ~9k tokens/word figure is word-quiz's, measured for
   *generation*. The record says verification is the larger half but never puts a number on it. The
   ~11k/word figure in §3.0 is an **extrapolation and is labelled as one**.
8. **Whether the capture will still authenticate.** `.oplan/word-quiz/plan.md`'s **B2** covers it:
   if the local `.env` `APP_CODE` 401s against production, STOP — the owner supplies it out of band.
   Never `vercel env`. I could not test this without making a request, and I made none.

---

# P3-AMENDMENT #1 — ORCHESTRATOR REVIEW AND RULINGS, 2026-08-02

The plan above was reviewed by the orchestrator against the RUNNING CODE, not against its own
prose. Six of its load-bearing claims were re-derived independently before any of its conclusions
were read. **All six reproduced.**

| claim | re-derived independently by the orchestrator |
|---|---|
| the shape gate cannot see a wrong-answer trap | `node scripts/check-quiz-bank.mjs --dir <poison>` -> `QUIZ BANK OK: 3 files, 3 items`, **exit 0**, while `shine`/`burn` are offered as wrong answers for `glow` and `hurt` for `harm`. **Design §3 B's risk, demonstrated on the running gate.** |
| `light.json[1]` still ships the named CERTAIN leak | read from the working tree: distractors still `radio, television, oven, fan, camera, computer, machine, motor`; `git log` shows the sentence and list byte-unchanged since `24c67dc` |
| rule 8 is OFF for every phase-2 word | `buildPosIndex` driven over the shipped manifest: **OBSERVED 2264 words, 73 exempt**, and all ten of `after deer feet glow growl harm moon nervous scary tight` have an EMPTY pos set |
| F2-2 names the wrong callers | the only importers of `lib/quiz-item.js` are `scripts/check-quiz-bank.mjs:30` and `tests/quiz-item.test.js:7` |
| QZ-2 misinforms a generation worker | `.oplan/word-quiz/plan.md:217` still says `after` and `feet` are **ABSENT** from the manifest. Phase 2 added both |
| the `quiz-topup.mjs` trap is real | `lib/profile.js:263` gives a tapped story word `status: 'learning'`; `reader.js:420` admits any status via `hasOwnProperty`; `quiz-topup.mjs:72-74` pools `known`/`candidate` only. **The lister is structurally blind to exactly the words chapter-first asks first.** |

**The §2.5 trap is the most valuable thing in this plan.** Deriving the target set from the obvious,
documented, "reuse rather than re-implement" route would have produced an empty list, a green
close, and nothing she would ever see — `.oplan/word-polish/journal.md` FINDING 2 shipped a second
time. The projection of §2.8 resolves it without re-implementing one filter, using the idiom the
frozen `public/quiz-core.js:81-98` already uses on itself.

## RULINGS

**R-F3-1 — B-F3-1 (paid API vs D7): D7 WINS. ZERO MONEY. Worker agents author the items.**
`design.md:107` names `scripts/build-item-bank.js`, which builds the **placement** bank, writes
`data/placement-items.json`, and has never written a byte into `public/quiz/`. The real precedent
for this bank is the owner-level decision **D7** (`.oplan/word-quiz/design.md:36`): *"Generated by
Claude via oplan workers, cheap tier — **no paid API**, no runtime LLM, no second key"*, restated as
a phase non-goal at `.oplan/word-quiz/plan.md:255-258` and `.oplan/word-g1/plan.md:2949`.
Three further reasons: the owner has a standing preference against the paid route for build-time
assets; a paid model buys no measurable quality here, because §6.3 measures mechanical detection at
**precision ~0 / recall 0** either way and the real instrument is the adversarial pass; and the 62
existing files were all authored this way.

> **AND THIS IS FIELD GUIDE 24 FOR THE SECOND TIME IN THIS RUN, BY MY OWN HAND.** My phase-3
> briefing told the planner *"PAID API (the house style is gpt-4.1-mini via the OpenAI chat API).
> The batch costs money."* That was a remembered fact contradicting a standing owner-level ruling,
> which is precisely the mistake phase 2 caught in the phase-2 brief. The planner caught it.
> **The lesson is not learned until the habit changes: a brief must quote a ruling or ask for it,
> never recall it.**

**R-F3-2 — B-F3-2 (re-sweep the other 83 shipped items): OPTION (c), PHASE 5.** Recorded as carried
obligation **F3-2**. Phase 3 fixes `light[1]` and poison-controls its own batch. The other 83 items
were cleared by a method now measured to have missed a named CERTAIN leak, so this is a real,
knowingly-accepted residual. **It is NOT hidden:** §7.2's honest-limits line puts it on the owner's
review page in plain words, so he may pull it forward at the gate. Zero money either way; the cost
is agent tokens.

**R-F3-3 — B-F3-3 (`light.json` wording): the planner's measured candidate is PROVISIONALLY
ADOPTED** so step 3.3 can proceed on pins that were simulated rather than guessed
(`television` -> `iron`, `computer` -> `clock`). **`light.json` is included in the 3.5 adversarial
passes like any other item**, and the final wording is on the owner's page at 3.6. If he or a pass
changes one word, 3.3's pins are re-derived on a simulated tree and the change lands as an
amendment step — they are not hand-computable and must not be hand-edited.
Stated plainly: 3.3 commits before the owner sees it. That is safe **only because phase 3 deploys
nothing** — no byte of it reaches her until phase 4, which is gated on his approval.

**R-F3-4 — B-F3-4 (N > 25): RULED IN ADVANCE, so step 3.1 cannot stall.**
`WORDS.txt` is **CAPPED AT 25 BY CONSTRUCTION**, so the plan's hard `N <= 25` gate stays hard and is
never a stall. The cap is applied by a frozen, recorded ordering:

1. words in the glossary of her **most recent chapter** first (that is what chapter-first asks
   next), most-recent chapter descending;
2. then by `taps` descending, then `lastSeen` descending;
3. then `LC_ALL=C` ascending, so the ordering is total and deterministic.

**The remainder is not dropped, it is DEFERRED and REPORTED**: written to `WORDS-DEFERRED.txt`,
counted in the journal, and shown on the owner's review page with the count. It becomes part of
carried obligation **F3-2** (the phase-5 top-up). A cap that is not reported is a silent truncation
and would read as "covered everything" — field guide 18's shape.

## THREE DEFECTS IN THE PLAN ITSELF, FOUND BY REVIEW. FIX BEFORE ANY PACKET QUOTES THEM.

**A. THE BLOCKER CROSS-REFERENCES ARE OFF BY ONE.** §13 renumbered the blockers after the capture
ruling, and three earlier cross-references were not renumbered with it:
* §5.2 ends *"This plan does not resolve it: **B-F3-2**"* — it means **B-F3-1** (paid API).
* §6.2 says *"raises the rest as **B-F3-3**"* — it means **B-F3-2** (the 83-item re-sweep).
* step 3.4 says *"Zero money (D7/QZ-4 — pending **B-F3-2**)"* — it means **B-F3-1**, and after
  R-F3-1 it is no longer pending at all.
**Every one is now moot** because all four blockers are ruled above, but a packet that quotes a
stale blocker number sends a worker to the wrong ruling. **Packets cite the R-F3-n rulings, never
the B-F3-n numbers.**

**B. §5.5 cites "§6.5's `light.json`" for the overwrite exception.** `light.json` is §6.2 and step
**3.3**; §6.5 is the instrumentation section. Cosmetic, but it is a pointer into a frozen document.

**C. THE PLAN'S OWN RECORD GAP 12 IS THE ONE TO KEEP IN VIEW.** Its first `§VAL-F3` extractor was
unanchored, swallowed ~70 lines of prose, threw 19 bash errors and **exited 0**. It found this by
RUNNING the extractor, not by reading it. **The 176-line pin and the `# ===== BEGIN VAL-F3 =====`
first-line assertion in every step tail exist because of that**, and they are not decoration:
they are the clause that proves the extraction landed. Field guide 9 — a frozen validation can
itself be the bug — and this is the fourth instance in this run.

## ACCEPTED, WITH ONE ADDITION

The plan is **ACCEPTED** and execution proceeds in its step order. One addition, from the review:

**Step 3.1's receipt must also record the CHAPTER COUNT and the DISTINCT GLOSSARY WORD COUNT**, not
only the word counts. Those two numbers are what make `M1 != M2` interpretable at 3.8 and in any
later run, and without them the journal records a decision whose input cannot be re-checked.
