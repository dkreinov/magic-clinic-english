# PLAN — word-finish PHASE 2 "audio" (draft)

Planned 2026-08-02 by a fresh planner (Opus), **read-only of the repository and of production**.
This planner changed nothing in the repository, ran no `git` command that writes, ran no `vercel`
command, made no request to production, never opened `.env`, never requested `/api/profile` in any
form, and **spent no money — no OpenAI/TTS call was made**. Scratch files live only in
`C:/Users/dkreinov/wf-p2-plan/scratch/`.

Repo `C:/Users/dkreinov/claude/english-app`, clean. Workspace `.oplan/word-finish/`.

**PHASE BASE: `81fb743`.** (`phase-state.md:6` says `BASE (phase 2): dcf66a3`. Measured:
`git diff --name-only dcf66a3 81fb743 | awk '$NF !~ /^\.oplan\//'` is **empty** — the three commits
since are `.oplan`-only, so every number below is valid at either. **Use `81fb743`.**)

Owner's standing instruction: **"always think easy and robust."**

**THE ONE SENTENCE:** this phase makes the audio manifest a statement about **which `.aac` files
exist on disk** instead of about the curriculum bands, adds the **ten** base-lemma clips her stories
actually need, and turns the speaker button from *absent when we have no clip* into *present but
crossed out, with the caption `coming soon`* — so she can tell "this word has no sound yet" from
"this app has no sound".

**NO RAW HEBREW GLYPH IS AUTHORED ANYWHERE IN THIS PLAN.** No new Hebrew string enters the
repository in this phase. The two existing Hebrew strings this phase touches are **moved, never
retyped**, and both edited views are pinned by raw non-ASCII **byte count** so a drift is impossible.

---

## ⚠ THREE THINGS THE BRIEF GOT WRONG. READ THESE BEFORE ANYTHING ELSE.

**(1) THE GENERATION SET IS TEN, NOT SIXTEEN — AND IT WAS ALREADY RULED, ON THE RECORD, ON
2026-08-01.** Generating the brief's sixteen would **split her live vocabulary on the server**.
See **FINDING 1**. This is the single most important correction in this document.

**(2) DESIGN §9 "RISK A RESOLVED" IS FALSE AS WRITTEN.** It asked whether both `getAllowedSet()`
consumers are audio-only. They are. But the manifest has a **THIRD consumer that does not go through
`getAllowedSet()` at all**: `api/profile.js:6` imports the JSON file directly and uses it as the
**word-key normalisation table for her durable dictionary**. The right question was never asked of
the right function. See **FINDING 2**. The disk-derived manifest is still safe — but only because
FINDING 1's ruling holds. Under the brief's sixteen it would not have been.

**(3) THERE IS NO `ffprobe` AND NO `ffmpeg` ON THIS MACHINE.** The brief anticipated this and asked
me to say what I use instead. See **FINDING 3**: durations are measured by counting ADTS frames in
pure node, and the method was validated against all **2254** shipped clips (0 parse errors).

---

## WHAT THIS PLANNER MEASURED TODAY, AND HOW

Nothing below is quoted from the record, the design or the brief without being re-measured. Every
command ran today against the clean tree at `81fb743`.

| measured | command / method | result |
|---|---|---|
| HEAD, tree | `git rev-parse HEAD`, `git status --porcelain -uall` | **`81fb743`**, clean |
| suite, plain | `npm test` | `1..364`, `# tests 369`, `# pass 369`, `# fail 0`, ~4.5s |
| flat ledger | `grep -h -c '^test(' tests/*.js \| awk '{s+=$1} END{print s+0}'` | **364** (369 − 364 = **5** subtests, all in `tests/dev-server.test.js`) |
| contrast gate | `node scripts/check-contrast.mjs` | `ALL PASS`; `grep -c '^PASS'` = **58** |
| quiz bank | `node scripts/check-quiz-bank.mjs` | `QUIZ BANK OK: 62 files, 84 items` |
| manifest | node read of `public/audio/words/index.json` | **19942 bytes, 2254 entries, CR=0 LF=1, md5 `8735a3c499508b04415046e2be4ad159`** |
| clips on disk | `readdirSync` | **2254 `.aac`** + `index.json` = 2255 entries; **manifest ↔ disk agree exactly, 0 either way** |
| `deriveWordList()` | the generator's **own** export, called (not re-implemented) | **2254**, and **element-for-element identical to the manifest, in order** |
| the 17 story words | `deriveWordList()` / manifest / disk membership | **all 17 absent from all three** — the brief is right about this |
| **`after`,`feet`,`moon` really outside the bands** | direct membership test in `data/band1.json` / `data/band2.json` | **CONFIRMED absent from both.** `foot` **is** in band1, `feet` is not; `wing` in band2, `wings` not; `soft`,`close`,`grow` in both, `softly`,`closer`,`growls` not. **The bands are LEMMA lists; the story prints INFLECTIONS.** That is why the brief's surprise resolves the way it does |
| **what `resolveLemma` gives her TODAY** | the shipped `public/lemma.js` driven over the 17 against the real manifest | **4 of the 17 already speak**: `closer`→`close`, `softly`→`soft`, `suddenly`→`sudden`, `wings`→`wing`. **See FINDING 1** |
| the split-hazard sweep | shipped `resolveLemma` over **20 270** surface forms, old set vs new set | ten base lemmas: **79 gain a clip, 0 regressions, 0 key splits**. The brief's sixteen: 122 gain, **4 KEY SPLITS** |
| `migrateWordKeys` executed | the shipped `lib/profile.js` run on a profile holding `soft`+`softly` | today and under the ten: keys `["soft","sudden","wing"]`, `soft.taps=6`. Under the sixteen: keys `["soft","softly","sudden","wing"]`, `soft.taps=5`. **Her progress splits** |
| every consumer of the manifest | `grep -rn` for `getAllowedSet`, `resolveLemma`, `audio/words` over the tree | **THREE consumers, not two** — see FINDING 2 |
| `ffprobe` / `ffmpeg` | `command -v` | **NEITHER EXISTS.** See FINDING 3 |
| duration + integrity of every clip | a pure-node ADTS frame walker, written today | **2254 clips, 0 parse errors**, all 24000 Hz mono AAC-LC |
| duration distribution | the same sweep | min **0.683s**, p1 0.725, med 1.365, p95 2.432, max **3.243s** |
| byte distribution | the same sweep | min **5238**, p1 6163, med 11275, p95 19115, max **27750** |
| "voiced seconds" (frames whose ADTS payload > 100 B) | the same sweep | min **0.555s** over 2254; **0 clips below 0.40s** |
| bitrate | bytes ÷ seconds | VBR, **4451 – 10695 B/s** (35.6 – 85.6 kbps). Not a hard invariant |
| duration vs word length | grouped by lemma length | **length is a WEAK predictor**: len 3 reaches 3.115s, len 18 (`telecommunications`) is only 2.133s. Design §11's "plausible duration **for the word's length**" cannot be a tight per-length band — see SK-F2-6 |
| **the reader POPUP is executable in node** | the shipped `reader.js` `render()` driven through a fake container + fake `.w` spans; the click handler invoked; the popup HTML read back | **PROVEN.** Both branches captured verbatim — see FINDING 4 |
| the popup's real background | `public/views/reader.js:260` `.reader-popup { background: var(--color-card); }` | **`--color-card`** |
| the words-row real background | `public/views/words.js:22-31` `.word-card { background: var(--color-card); }` | **`--color-card`** |
| the contrast pair design §8 needs | `scripts/check-contrast.mjs:13` | `{ fg: "--color-muted", bg: "--color-card", min: 4.5 }` **already present**. Both real backgrounds are `--color-card`, so **the pair is already covered and the anchor stays 58** — see SK-F2-8 |
| dark mode | `grep -n 'prefers-color-scheme' public/styles.css` | **none**. One token set, so one contrast pass is the whole story |
| line endings | `tr -dc '\r' < f \| wc -c` vs `'\n'` — field guide 16, never grep | the table in **SK-F2-1**. **Every ending in the brief reproduced exactly** |
| the frozen §8 CSS | **extracted from `design.md` by script**, never retyped | 2 blocks, **479 bytes LF / 497 bytes CRLF**, md5(CRLF) `bee5a12d3d2116fa84ffde7f19bf4ae5` |
| the styles.css edit | **simulated outside the repo** (field guide 21) | 17846 → **18345 bytes, CRLF 729 → 748**, and the contrast test's `.btn-say` block extraction is unaffected |
| a broken named import under `node --test` | a 3-test probe built in scratch | the file counts as **1 FAILING test** and its real tests **vanish from the total** — loud, not silent. So a rename is safe to specify |
| `public/` file count + frozen digest | the walker in §VAL-F2 | **2372** files; the 114 files outside every path this phase may touch digest to `09ead45ed990a0dc5d604d5d4d052a5c` |
| the 2254 shipped clips, byte-frozen | md5 of each, in base-manifest order, digested | **`42925ba553013c1082aab77ebb454ebc`** — the "no clip is ever re-recorded" pin |
| the dev sandbox | md5 of `C:/Users/dkreinov/english-app-sandbox/profile.json` | 4385 bytes — **still the synthetic fixture, `SB=FIXTURE`**. Step 1.1 holds |
| any remaining capture of her data | `find C:/Users/dkreinov -maxdepth 3 -name 'readback*.json' -o -name 'live-readback*'` | **none**. D27 is holding |
| the record | `.oplan/word-finish/{design,phase-state,journal}.md`, `field-guide/index.md` (23 lessons), `plan.md` (2324 lines), `.oplan/word-polish/{design,journal,plan}.md` | read |

**Two independent methods were used for line endings** (field guide 16). `grep` was never used to
measure an ending anywhere in this work.

---

## FINDING 1 — THE GENERATION SET IS **TEN**, NOT SIXTEEN. GENERATING SIXTEEN WOULD SPLIT HER LIVE VOCABULARY.

The brief says: *"the generation set is **16 words**, not 17. Design and phase-state both say '~17';
**the honest number is 16 clips.** State this."*

**Measured today: the honest number is TEN.** And this is not a new discovery — it is a
**standing orchestrator ruling already in this repository**, at
`.oplan/word-polish/journal.md:37-45`, dated 2026-08-01:

> "FINDING 3 -- generating the obvious word list would SPLIT HER VOCABULARY. The naive list was 17
> surface forms. Generating `softly.aac` puts "softly" into the manifest, so `resolveLemma` stops
> folding it into `soft` -- and she HAS `soft`, `sudden` and `wing` in her profile today (verified
> by the orchestrator against her capture). Her next tap would create a second, separate entry and
> split her progress. **RULING (B2): generate BASE LEMMAS only**, and let the existing folding cover
> the surface forms. **The list is TEN, not seventeen:**
> `after · deer · feet · glow · growl · harm · moon · nervous · scary · tight`
> (`glow` alone covers glow/glowing/glows; `tight` covers tightly; `growl` covers growls.)"

The corresponding blocker text is at `.oplan/word-polish/plan.md:1462-1495`. **`design.md` §3 A,
`phase-state.md:43` and the brief all lost it.** An executor sent to generate sixteen would have
been executing against a ruling the record had already made in the opposite direction.

### Why it is true, re-derived today by EXECUTION

`public/lemma.js:58` `resolveLemma` **tries an exact match first** and only then de-inflects. So a
word present in the manifest wins over its own base form. Driving the **shipped** `resolveLemma`
over the 17 against the **real** manifest:

```
word          TODAY      +TEN       +SIXTEEN
after        null       after      after
closer       close      close      closer      <-- SPLIT
deep breath  null       null       null
deer         null       deer       deer
feet         null       feet       feet
glow         null       glow       glow
glowing      null       glow       glowing
glows        null       glow       glows
growls       null       growl      growls
harm         null       harm       harm
moon         null       moon       moon
nervous      null       nervous    nervous
scary        null       scary      scary
softly       soft       soft       softly      <-- SPLIT
suddenly     sudden     sudden     suddenly    <-- SPLIT
tightly      null       tight      tightly
wings        wing       wing       wings       <-- SPLIT
```

**Four of the brief's sixteen already speak today.** The brief's own claim — *"every one is MISSING
from disk AND OUT of the manifest"* — is **literally true and materially misleading**: absence from
the manifest is not silence, because `resolveLemma` de-inflects into it.

### The split-hazard sweep, instrumented (field guide 18)

Both candidate sets were swept over every manifest word plus eight inflections of each, plus the 17:

```
POLICY: base lemmas only (the TEN)        observed surface forms = 20270
  null -> a clip (pure gain)      : 79
  a clip -> null (REGRESSION)     : 0
  clip A -> clip B (KEY SPLIT)    : 0

POLICY: the brief's SIXTEEN surface forms observed surface forms = 20319
  null -> a clip (pure gain)      : 122
  a clip -> null (REGRESSION)     : 0
  clip A -> clip B (KEY SPLIT)    : 4
     softly: soft -> softly
     suddenly: sudden -> suddenly
     wings: wing -> wings
     closer: close -> closer
```

### And what that costs her, executed against the shipped `migrateWordKeys`

`lib/profile.js:294` `migrateWordKeys(profile, allowedSet)` runs on **every profile POST**
(`api/profile.js:52`) and rewrites every dictionary key through `resolveLemma(key, ALLOWED_WORDS)`.
Driven on a profile holding `soft` (5 taps) and `softly` (1 tap) — the exact shape word-polish
verified against her real capture:

```
TODAY (2254)                 keys=["soft","sudden","wing"]            soft.taps=6  idempotent=true
+TEN base lemmas             keys=["soft","sudden","wing"]            soft.taps=6  idempotent=true
+SIXTEEN surface forms       keys=["soft","softly","sudden","wing"]   soft.taps=5  idempotent=true
```

Under the sixteen her dictionary **gains a duplicate entry and loses a tap**, durably, on the
server, invisibly. It is not data loss — `migrateWordKeys` never drops a key and stays idempotent —
but it is a silent regression in the one thing she is collecting.

### THE RULING THIS PLAN EXECUTES

**Generate exactly these ten, and no surface forms:**

```
after  deer  feet  glow  growl  harm  moon  nervous  scary  tight
```

* `glow` covers `glow`, `glowing`, `glows`; `growl` covers `growls`; `tight` covers `tightly`.
* `closer`, `softly`, `suddenly`, `wings` are **deliberately not generated** — they already speak.
* `deep breath` contains a space and can never be a lemma file (`WORD_RE` rejects it).
* `feet` is generated as itself: `lemmaCandidates("feet")` is `["feet"]` — the de-inflector cannot
  reach the irregular `foot`, which does have a clip. **Verified by execution, not assumed.**

**Every one of the 16 non-space glossary words that is silent today is covered by these ten.**
Coverage was checked by execution, not by argument (the `+TEN` column above: only `deep breath`
stays null).

**IF THE ORCHESTRATOR OVERRULES THIS AND STILL WANTS SIXTEEN**, that is his to do — but it must be
an explicit, recorded reversal of B2, and the four splitting words must be named in it. This plan
will not execute the sixteen silently. See **BLOCKER B-F2-1**.

---

## FINDING 2 — DESIGN §9 IS FALSE AS WRITTEN: THE MANIFEST HAS A **THIRD** CONSUMER, ON THE SERVER, AND IT IS **NOT** AUDIO-ONLY

Design §9 (and the brief, and `phase-state.md:40`) state:

> "**Both `getAllowedSet()` consumers are audio-only** … Nothing gates her vocabulary on the
> manifest."

**The claim about `getAllowedSet()` is TRUE and I reproduce it.** Measured today by grep over the
whole tree (`node_modules` excluded):

* `public/views/words.js:159` — `const sayLemma = allowedWords ? resolveLemma(lemma, allowedWords) : lemma;` → feeds the play button only.
* `public/views/reader.js:839` — `const lemma = resolveLemma(dataWord, allowedWords);` → `:843` `canSay`. Nothing else in either file reads `allowedWords`.
* `public/words-index.js:14` is the only definition; those are its only two callers.

**But the manifest is read a third time, by a path that never touches `getAllowedSet()`:**

```
api/profile.js:6    import wordManifest from '../public/audio/words/index.json' with { type: 'json' };
api/profile.js:12   const ALLOWED_WORDS = new Set(wordManifest);
api/profile.js:52   else migrateWordKeys(p, ALLOWED_WORDS);                                // EVERY POST
api/profile.js:62   const lemma = resolveLemma(body.lemma, ALLOWED_WORDS) || body.lemma;   // word-tap
api/profile.js:78   const lemma = resolveLemma(body.lemma, ALLOWED_WORDS) || body.lemma;   // mark-known
```

**That is a vocabulary gate.** It decides the key her word is stored under, and `migrateWordKeys`
rewrites the keys she already has. `tests/reader-ui.test.js:320-329` even pins that the two sides
read the same bytes, *"so resolveLemma cannot mean two things"* — and it does mean two things: on
the client "can we speak this", on the server "what shall we call this".

**A fourth reader exists and is out of scope but must be named**, because a later phase will trip on
it: `lib/quiz-item.js` calls `resolveLemma(token, allowed)` at `:197, :231, :232, :288, :327, :348`.
Its `allowed` comes from its callers (`scripts/build-item-bank.js`, `scripts/quiz-topup.mjs`), and
**phase 3 owns those**. This phase touches neither. Flagged forward as **RECORD GAP 3**.

### Does that break the disk-derived manifest? **No — but only because of FINDING 1.**

The disk-derived redefinition is safe **iff** the words added are ones we are happy to see as
dictionary keys. That is exactly what "base lemmas only" means. The sweep above is the proof: under
the ten, **0 of 20 270 surface forms change from one clip to another** — so no key she holds, and no
key she can create, is re-routed. Under the sixteen, four are.

**So design §9's conclusion survives, but its reasoning does not, and the safety it claims is
conditional on a decision the design never records.** That condition is written into the frozen
contracts of this plan as **FC-6** so no future step can quietly add a surface form.

**One consequence design §9 states and this plan keeps:** because `getAllowedSet()` swallows every
failure into an empty `Set`, a 404 manifest is indistinguishable at runtime from a manifest that
lists nothing. Phase 4's direct manifest-URL probe must stay. After design §8 the visible symptom of
a 404 manifest changes from *no buttons at all* to *every button crossed out saying `coming soon`* —
which is a **louder** failure, not a quieter one, and is worth recording as an improvement.

---

## FINDING 3 — THERE IS NO `ffprobe` AND NO `ffmpeg` HERE. DURATION IS COUNTED, NOT DECODED.

```
$ command -v ffprobe ; command -v ffmpeg
NO ffprobe
NO ffmpeg
```

The brief asked me not to write a check that cannot run. **The method that does run:** every clip is
an **ADTS-framed AAC** stream (`fff1 5840 …` — sync `0xFFF`, MPEG-4, no CRC, AAC-LC, sampling index
6 = 24000 Hz, 1 channel). An ADTS frame header carries its own frame length, and every AAC frame is
exactly **1024 samples**. So

```
duration = frameCount * 1024 / sampleRate
```

is exact, needs no decoder, and is computed by walking the frame chain in ~15 lines of node.

**The method was validated by execution against every shipped clip, not a sample:**

```
observed clips = 2254
parse errors   = 0
sampleRates=[24000]  channels=[1]
seconds: min=0.683 p1=0.725 p5=0.853 med=1.365 p95=2.432 p99=2.859 max=3.243
bytes:   min=5238  p1=6163  p5=7123  med=11275 p95=19115 p99=22505 max=27750
```

**A walker that reaches the last byte with the sync word intact at every step is also the "must
decode" check** design §11(2) asks for: a truncated, empty, HTML-error-body or re-encoded file
loses sync or leaves trailing bytes, and the walker says at which byte.

**Non-silence gets a real metric, not a byte-size proxy.** A digitally silent AAC frame compresses
to ~11 bytes. Counting only frames whose ADTS payload exceeds 100 bytes gives "voiced seconds":

```
voiced seconds over 2254 clips: min=0.555  p1=0.725  p5=0.853  med=1.323  p95=2.176  max=3.157
clips below 0.40s of voiced audio: 0
clips below 0.30s of voiced audio: 0
```

So `voicedSeconds >= 0.35` is a gate with a **measured margin of 1.6×** below the worst shipped
clip. (Incidentally, `hey`, `a`, `luck`, `anyway` are 45–49% silence — leading and trailing pad. A
"is it silent" check built on total file size would have said nothing about that; this one does.)

**Design §11(3) "plausible duration *for the word's length*" cannot be honoured as written**, and I
say so rather than fabricate a band. Measured, length barely predicts duration:

```
len= 3  n=183  min=0.683  med=1.323  max=3.115
len= 4  n=453  min=0.683  med=1.280  max=3.115
len= 8  n=203  min=0.768  med=1.451  max=3.072
len=18  n=  1                        max=2.133   <- "telecommunications", SHORTER than many 3-letter clips
```

The ten new words are 4–8 characters, whose observed envelope is 0.683–3.157s. **The gate is
therefore the global empirical envelope with a stated margin, `0.60s ≤ d ≤ 3.60s`** (12% below the
observed floor, 11% above the observed ceiling) — see SK-F2-6. Bitrate is **VBR**
(4451–10695 B/s) and is a loose sanity band, never an identity check.

---

## FINDING 4 — THE READER **POPUP** IS EXECUTABLE IN NODE. THIS PHASE'S UI GATE IS A GATE, NOT A NEEDLE.

Field guide 15 records three defects that shipped past 349 tests because they were source-needle
tested; field guide 20 says look for the harness before writing "this cannot be tested".

I looked, then built it and **ran it against the shipped, unmodified `public/views/reader.js`**.
Phase 1 left `t13Container` / `t13StubFetch` in `tests/reader-ui.test.js:517-560`; they record every
paint but return `[]` from `querySelectorAll`, so the popup was unreachable. Adding fake `.w` spans
that capture their click handler makes it reachable. Driven today:

```
paints after render = 2
story paint has .w spans = true

--- tapped "cat"  (in the manifest) ---
<div class="reader-popup" data-action="popup-stop"> <p class="reader-popup-word">cat</p>
 <button class="btn-say" type="button" data-say="cat" aria-label="[HE]">[SPEAKER]</button>
 <p class="reader-popup-he">HE-CAT</p> <button ... data-action="popup-save">[HE]</button> </div>

--- tapped "ellie" (not in the manifest) ---
<div class="reader-popup" data-action="popup-stop"> <p class="reader-popup-word">ellie</p>
 <p class="reader-popup-he">—</p> <button ... data-action="popup-save">[HE]</button> </div>
```

(Hebrew redacted as `[HE]` here — field guide 8: never copy Hebrew out of terminal output.)

**That second block is exactly the behaviour design §8 overturns**, captured from the running code.
So step 2.4's fail-first is not a mutation of a test — it is the shipped behaviour, already observed.

**ONE TRAP I HIT AND THE EXECUTOR MUST NOT:** `draw()` re-assigns `container.innerHTML` and
`bindHandlers()` re-runs `querySelectorAll`, so a fake span that keeps **every** handler it is ever
given accumulates them, and firing them all recurses until node dies of heap exhaustion (I did this;
it took 112 s and 4 GB). **The fake span must fire only its most recently registered handler.**
That line is in the frozen harness in step 2.4, and it is the reason that harness is frozen.

---

## GOAL, AND EXACTLY WHAT MOVES

**GOAL.** `scripts/build-word-audio.js` stops meaning two things with one function: `wordsToGenerate()`
is **what we intend to have** (the bands ∪ an explicit extras file), `clipsOnDisk()` is **what
exists**, and the manifest is written from `clipsOnDisk()`, always, in a `finally` (**A**). A new
`data/story-words.json` carries the ten base lemmas her stories use. `scripts/check-word-audio.mjs`
implements design §11's four mechanical checks as a real gate with an exit code, and is **proved to
fire before any money is spent**. `public/styles.css` gains the FROZEN `btn-say na` marker in the
globally linked sheet; `public/views/words.js` and `public/views/reader.js` each gain an exported
`saySlot()` so `canSay` gates the button's **state** instead of its **existence** (**§8**). Then the
ten clips are generated (**the money**). Plus the tests those need.

**WHAT DOES NOT MOVE, ALL PHASE:**

* **No `CACHE` bump.** `public/sw.js` stays md5 `78fc3b0ac1d10de8a5baccb753eca33c`
  (`CACHE = "magic-vet-v20"`). The single `v20` → `v21` bump is **phase 4's, spent once**
  (carried obligation **F1-1**). **This phase moves THREE MORE precached files** — `/styles.css`,
  `/views/reader.js`, `/views/words.js` — on top of phase 1's two. **An executor who "helpfully"
  bumps `CACHE` has broken F1-1 and must be stopped.** It is safe only because phase 2 does not
  deploy.
* `public/quiz.js` (`69b6d71117cf776715374abc6f0abb02`) and `public/quiz-core.js`
  (`9a2131be8b9d1b77c219f1e8c3482a71`) — QZ-18, not one byte.
* **The audio VOICE, MODEL and INSTRUCTIONS.** `MODEL = 'gpt-4o-mini-tts'`, `VOICE = 'nova'`, and
  the instructions string are pinned by an executable assertion in every step's tail. The **only**
  change to `synthesizeWord` in this whole phase is the word `export` in front of it, so that the
  voice-drift control uses the **shipped** request builder rather than a copy of it.
* **No existing clip is ever re-recorded.** The 2254 shipped `.aac` files are byte-frozen by the
  digest `42925ba553013c1082aab77ebb454ebc`, asserted in every step's tail including the money step.
  The drift control writes to `C:/Users/dkreinov/finish-audio/drift/`, **outside the repository**,
  and `check-word-audio.mjs --drift` refuses a path under `public/`.
* `public/app.js`, `public/index.html`, `public/lemma.js`, `public/words-index.js`, `public/api.js`,
  `public/views/{home,placement,parent,trophies}.js`, every quiz-bank item, every image: byte-frozen
  by `$PUBX` = `114 09ead45ed990a0dc5d604d5d4d052a5c`.
* `lib/`, `api/` — **byte-untouched.** In particular `api/profile.js` and `lib/profile.js` are not
  edited even though FINDING 2 is about them: this phase changes the manifest's *contents* in a way
  that provably does not change their *behaviour* (the 20 270-form sweep), and changing their code
  is not in scope.
* `data/band1.json`, `data/band2.json`, `data/placement-items.json` — untouched. The curriculum is
  not extended; that was word-polish's option (a) and it was **not** taken.
* The contrast anchor stays **58**. No colour token, no contrast pair. See SK-F2-8.
* The quiz bank stays **62 files / 84 items**. Phase 3 owns it.
* No deploy, no `vercel`, no request to production, no `GET /api/profile`.
* **No new Hebrew string.** Both edited views' raw non-ASCII byte counts are pinned exactly:
  `reader.js` 750 → **754**, `words.js` 461 → **465**. The `+4` is one more copy of the existing
  4-byte speaker glyph and nothing else — **measured on the simulated tree, not reasoned about.**

**WHAT IS CREATED (3 files):** `data/story-words.json`, `scripts/check-word-audio.mjs`, and — in the
money step only — **ten** `public/audio/words/*.aac`.
**WHAT IS DELETED:** nothing, anywhere, ever.

---

## ACCEPTANCE CRITERIA (mechanical; all re-run at the close, step 2.7)

1. `npm test` exits 0 and prints `# tests 380`, `# fail 0`, `1..375`.
2. `APP_CODE=dummy npm test` prints the identical `# tests 380` / `# fail 0`.
3. Flat ledger = **375** (364 measured today + 11 new: **2** in 2.1, **4** in 2.2, **3** in 2.3,
   **2** in 2.4). 375 flat + **5** subtests in `tests/dev-server.test.js` = 380 reported.
   The 5 is measured (369 − 364), not assumed. **The number of tests per step is specified;
   an executor who ends a step on a different flat count must STOP and escalate, not adjust the pin.**
4. `node scripts/check-contrast.mjs` exits 0, prints `ALL PASS`, `grep -c '^PASS'` = **58**.
5. `node scripts/check-quiz-bank.mjs` prints `QUIZ BANK OK: 62 files, 84 items`.
6. **`node scripts/check-word-audio.mjs` exits 0** and prints
   `OBSERVED: 2264 clips, 2264 manifest entries, 2264 generation targets` then
   `WORD AUDIO OK: 2264 clips, 2264 manifest entries`.
7. `public/audio/words/index.json` is **20019 bytes, 2264 entries, LF, md5 `6a885982b75e82ef1f00dc6768796ecf`**.
8. `public/` holds **2382** files (2372 + 10 clips).
9. The 2254 pre-existing clips digest to `42925ba553013c1082aab77ebb454ebc` — **unchanged**.
10. `public/sw.js` md5 `78fc3b0ac1d10de8a5baccb753eca33c` — **`CACHE` is still `magic-vet-v20`**.
11. `MODEL`, `VOICE` and `INSTRUCTIONS` in `scripts/build-word-audio.js` are byte-unchanged.
12. `SB=FIXTURE` — the dev sandbox still holds phase 1's synthetic profile.
13. `git status --porcelain -uall | awk '$NF !~ /^\.oplan\//'` matches the phase write set exactly,
    and `git diff --diff-filter=D --name-only HEAD` is **empty**.

---

## DEPENDS ON (every row verified on disk today)

| thing | where | verified |
|---|---|---|
| the generator | `scripts/build-word-audio.js` (LF, 154 lines, md5 `8fe9d5c15cc419dc3e1c37ae1219108c`) | read + its `deriveWordList()` **called** |
| the allowed-set builder | `lib/story.js:23 buildAllowedSet` | read + called through the generator |
| the bands | `data/band1.json` (1341 entries), `data/band2.json` (2016 entries) | parsed |
| the manifest | `public/audio/words/index.json` (19942 B, 2254, LF) | parsed |
| the clips | `public/audio/words/*.aac` (2254) | **all 2254 parsed as ADTS** |
| the resolver | `public/lemma.js` (LF 64, md5 `cf2855f8470edfd7cfc0b47f99a15a09`) | **executed** over 20 270 forms |
| the key migrator | `lib/profile.js:294 migrateWordKeys` | **executed** on 3 fixtures |
| the server's manifest use | `api/profile.js:6,12,52,62,78` | read — **FINDING 2** |
| the popup | `public/views/reader.js:691` (CRLF 946, md5 `b1527afce236bfa914ea5c918ccca5ba`) | **executed** end to end |
| the words list | `public/views/words.js:159-162` (CRLF 289, md5 `a9966ea69c3ac12cbc6c7be876631e71`) | `renderList` **executed** |
| the stylesheet | `public/styles.css:693 .btn-say` (CRLF 729, md5 `b6aa9c229ca269f39f468c60f50c45b4`) | read; the edit **simulated** |
| the frozen §8 CSS | `.oplan/word-finish/design.md` ```` ```css ```` blocks | **extracted by script**, md5 `6e43cb5e463520f5d277d7d02c5ff26c` |
| the contrast gate | `scripts/check-contrast.mjs` (58 pairs) | **run against the simulated stylesheet: still 58, `ALL PASS`** |
| the reader harness | `tests/reader-ui.test.js:517-560` `t13Container` / `t13StubFetch` | **extended and run** |
| `.env` | repo root, 321 bytes | `ls` only. **Never opened.** Phase 2 sources it in one command, in step 2.6 |
| the API key | `OPENAI_API_KEY` | **not read by this planner** |

---

## SKELETON DECISIONS — every question Rule 6 of the brief asks, decided HERE

### SK-F2-1 — LINE ENDINGS, RE-MEASURED TODAY BY BYTE COUNT, NEVER WITH `grep`

`tr -dc '\r' < f | wc -c` vs `tr -dc '\n' < f | wc -c` (field guide 16). Every value in the brief
reproduced exactly.

| file | CR | LF | kind | edited this phase? |
|---|---|---|---|---|
| `public/styles.css` | 729 | 729 | **CRLF** | **YES** (2.3) → 748 |
| `public/views/reader.js` | 946 | 946 | **CRLF** | **YES** (2.4) → 959 |
| `public/views/words.js` | 289 | 289 | **CRLF** | **YES** (2.3) → 300 |
| `public/words-index.js` | 0 | 25 | LF | no |
| `public/lemma.js` | 0 | 64 | LF | no |
| `public/app.js` | 0 | 67 | LF | no |
| `public/sw.js` | 51 | 51 | CRLF | no |
| `public/index.html` | 90 | 90 | CRLF | no |
| `scripts/build-word-audio.js` | 0 | 154 | LF | **YES** (2.1) → 209 |
| `scripts/check-contrast.mjs` | 0 | 190 | LF | no |
| `tests/word-audio.test.js` | 0 | 65 | LF | **YES** (2.1, 2.2, 2.6) |
| `tests/reader-ui.test.js` | 0 | 848 | LF | **YES** (2.4, 2.6) |
| `tests/words-ui.test.js` | 0 | 272 | LF | **YES** (2.3) |
| `tests/quiz-ui.test.js` | 0 | 584 | LF | no |
| `tests/lemma.test.js` | 0 | 86 | LF | no |
| `public/audio/words/index.json` | 0 | 1 | LF | **YES** (2.6, machine-written) |

**THE THREE CRLF FILES ARE THE THREE MOST EDITED. `core.autocrlf=true` here.** An Edit-tool insert
can silently CRLF a whole LF file and `git diff` normalises the damage away. **Therefore every
source edit in this phase is made by a FROZEN `node` apply script that reads and writes BYTES**
(`apply-2.1.cjs`, `apply-2.3.cjs`, `apply-2.4.cjs`, quoted in full below). Each was **run today on a
byte-exact mirror of the real files outside the repo**, and the md5 each produces is pinned. No
executor retypes a line of any of these files.

### SK-F2-2 — Q3: WHERE THE EXTRAS LIVE, AND WHAT THE ROUTINE TOP-UP IS

**`data/story-words.json` — a data file, not a literal.** Three reasons, in order of weight:

1. `tests/word-audio.test.js:20` is named *"the generator derives its word list from the band data,
   **not a hardcoded list**"* and forbids the literals `'apartment'` / `'telecommunications'`. A
   hardcoded extras array in the script contradicts the property that test names, not merely its
   spelling. A data file keeps the property true. **Checked by running, not reading:** with the
   extras in `data/story-words.json`, all six of that test's assertions still hold.
2. It sits beside `band1.json` / `band2.json`, is read by the same `readFileSync(...,'utf8')` +
   `JSON.parse`, and is diffable and human-appendable — which is the whole point of a top-up file.
3. It can be **validated**. `readStoryWords()` throws on a non-string, on anything `WORD_RE` rejects
   (so `deep breath` can never enter), and on a duplicate. A literal in the script would be
   validated by nobody.

**THE ROUTINE TOP-UP — the "one documented command" design §2 promised, made real.** When the story
generator uses a word that is in neither the bands nor the extras, she sees `btn-say na` +
`coming soon`, and the owner runs:

```bash
cd C:/Users/dkreinov/claude/english-app
# 1. WHAT IS MISSING. Reads a SAVED capture, never the live service (field guide 3).
node scripts/check-word-audio.mjs --missing /c/Users/dkreinov/english-app-backups/profile-<ts>.json
# 2. append the printed BASE LEMMAS to data/story-words.json   (base lemmas only -- see FC-6)
# 3. generate. Resumable: existing clips are skipped, so only the new words cost anything.
set -a; . ./.env; set +a; node scripts/build-word-audio.js
# 4. the gate
node scripts/check-word-audio.mjs && npm test
```

`--missing` prints, separately, the words that **can** be lemma files and the ones that **can never
be** (anything with a space or a digit) — so the human is never asked to guess. It writes nothing.

### SK-F2-3 — Q4: WHAT `deriveWordList()` MEANS AFTER THE SPLIT. IT MEANS NOTHING: IT IS GONE.

The brief is right that a function whose meaning silently changed under a stable name is exactly the
drift the disk-derived manifest abolishes. **So the name does not survive.** There are two concepts
and they get two names:

| name | means | who calls it |
|---|---|---|
| `wordsToGenerate()` | **what we intend to have** = `bandWords()` ∪ `readStoryWords()`, `WORD_RE`-filtered, deduped, sorted | `main()`'s loop; `check-word-audio.mjs`'s coverage check |
| `clipsOnDisk()` | **what exists** = the `.aac` basenames, sorted | `writeManifestFromDisk()`; the coverage check |
| `bandWords()` | the old body, unchanged, under an honest name | `wordsToGenerate()` |
| `readStoryWords()` | the validated extras | `wordsToGenerate()` |
| `writeManifestFromDisk()` | takes **no argument**, so there is no caller-supplied list that could be wrong | `main()`'s `finally` |

**`deriveWordList` and `writeManifest(words)` are DELETED, not aliased.** An alias would preserve
exactly the ambiguity being removed. Deleting them makes `tests/word-audio.test.js`'s import fail —
**and I verified by execution that node reports that loudly**: a broken named import counts the file
as **one FAILING test** and removes its real tests from the total. `# fail` goes up, the ledger goes
down; nothing is silent. The rename and the test update are therefore in the **same step (2.1)**.

### SK-F2-4 — Q6 ORDERING, AND Q5 WHAT A HALF-FINISHED RUN LEAVES BEHIND

**Today** `main()` writes the manifest at `:109`, **before** the generation loop at `:126`. Under the
disk-derived rule that is exactly backwards: it would publish a promise the loop had not yet kept.

**The new order:** the loop runs first, and the manifest is written **in a `finally`**:

```js
  try {
    for (const lemma of words) { ... writeFileSync(outPath, bytes); ... }
  } finally {
    const m = writeManifestFromDisk();
    console.log(`manifest: ${m.count} words -> ${m.path}`);
  }
```

**Why `finally` and not "after the loop":** the invariant *manifest == disk* is the honesty property.
It must hold **unconditionally**, including after a network failure on clip 7 of 10. With `finally`,
a run that dies at clip 7 leaves 6 new clips and a manifest that lists exactly those 6 — **honest,
just incomplete.** Without it, the tree would hold 6 clips no manifest mentions, which is harmless
but silent, and the next reader would have to work out what happened.

**What a half-finished run leaves behind, stated in full:**

| the run dies… | on disk | in the manifest | is any button dead? | recovery |
|---|---|---|---|---|
| after clip 6 of 10, script throws | 2260 clips | 2260 | **no** | re-run `build-word-audio.js` — it is resumable and skips the 2260 |
| killed hard (Ctrl-C, power) — `finally` never runs | 2260 clips | 2254 | **no** — the manifest is a *subset* of the disk, so the extra clips are merely invisible | re-run, or `node -e 'import(...).then(m=>m.writeManifestFromDisk())'` |
| a clip is written but truncated | 2260 clips | 2260 | **yes, one** | `check-word-audio.mjs` names the word; delete that one file and re-run |

**The asymmetry is the safety.** `manifest ⊂ disk` is invisible; `disk ⊂ manifest` is a dead button.
`finally` + resumability means the tree can only ever be in the invisible failure mode, and the
gate catches the third row. **The executor's rule: on ANY failure, STOP and report — never retry
blindly, never hand-edit the manifest, never hand-delete a clip that the checker has not named.**

### SK-F2-5 — Q1: WHEN EXACTLY DOES `btn-say na` APPEAR, AND ON WHAT

**The naive rule is the right one — `na` whenever `resolveLemma` returns null — and here is the
measurement that makes that defensible rather than merely convenient.**

The brief's worry: `renderWords()` (`reader.js:334`) makes **every whitespace-separated token**
tappable, so "`na` whenever `lemma === null`" puts a crossed speaker under every proper noun.

**Two facts change the picture, and the second is measured:**

1. **The marker is never page decoration.** It lives inside the **popup**, which exists only after
   she has tapped one word. There is at most **one** marker on screen at any moment, ever. The
   inline `.reader-text .w` spans are untouched by this phase.
2. **The density is small and the members are unsurprising.** I ran the **shipped** `normalizeWord` +
   `resolveLemma` over real chapter text. **Which text, stated plainly (field guide 3: I will not
   probe her profile, and phase 1 correctly removed her chapters from this machine):** the only
   chapter text on this machine is the **synthetic A2 chapter phase 1's step 1.1 wrote into the dev
   sandbox** — 213 tappable tokens, 114 distinct. Plus an adversarial probe I wrote containing all
   17 story words and four names.

```
### SANDBOX synthetic chapter -- 213 tappable tokens, 114 distinct
  live button TODAY = 107 ; AFTER the ten = 108
  gets `btn-say na` AFTER the ten: 6 of 114 = 5.3%
     barked  held  lay  leaning  sparkle  ellie

### adversarial probe (all 17 story words + 4 names) -- 39 distinct
  live button TODAY = 23 ; AFTER the ten = 35
  gets `btn-say na` AFTER the ten: 4 of 39 = 10.3%
     bella  ellie  noa  sparkle
```

**So the set is exactly two kinds of word:** (a) irregular inflections the de-inflector cannot
reach — `barked`, `held`, `lay`, `leaning`; (b) **proper nouns, above all her own heroine's name and
her pet's name.**

**THE DECISION, and the honest cost.** Render `na` for both kinds. Reasons:

* Today those words show **nothing at all**, which R7 explicitly overturned: *"she cannot tell the
  difference between 'this word has no sound' and 'this app has no sound'."* Absence is the state
  being replaced; replacing it for some words and not others reintroduces the ambiguity.
* Any rule that suppresses the marker needs a signal, and **`resolveLemma` is the only signal the
  browser has.** A glossary-membership rule would be a second, different notion of "real word", which
  is precisely the drift this phase is removing. A capital-letter rule fails on `barked` and on
  sentence-initial ordinary words.
* Type (a) is fixed by the top-up (SK-F2-2). The promise is keepable.

**THE ONE PLACE `coming soon` IS A PROMISE WE CANNOT KEEP, said out loud:** `Ellie` and `Sparkle`
are **per-child names** (`profile.learner.heroineName` / `petName`). `buildAllowedSet` adds them to
the *story* vocabulary, but the audio manifest is derived from a profile with `learner: {}`, so a
child's names can never be in it. She will tap her own heroine's name and be told "coming soon",
indefinitely. **This is a real, small dishonesty, and it is the price of the naive rule.** I have not
designed it away, for the reasons above, and I flag it as **RISK R3** with the cheap remedy that
would close it (add her two names to `data/story-words.json` at the next top-up — two clips, a
fraction of a cent, and then it is true). **That is a follow-on, not phase 2**, because the names
come from her live profile and this phase never reads it.

### SK-F2-6 — DESIGN §11's FOUR CHECKS, AS EXECUTABLE THRESHOLDS WITH THE MEASUREMENT BEHIND EACH

All of these live in `scripts/check-word-audio.mjs` (step 2.2) and every one was **seen to fire**
against fabricated broken inputs and **seen to pass** on a healthy tree.

| design §11 | the check | threshold | what was measured over 2254 clips | margin |
|---|---|---|---|---|
| (2) must decode | walk the ADTS frame chain to the last byte | sync at every frame, no truncation, no trailing bytes, ADTS profile = AAC-LC | **0 parse errors on 2254** | exact |
| (1)+(2) format identity | `sampleRate` and `channels` | **== 24000**, **== 1** | 24000/1 on **2254 of 2254** | exact, hard |
| (2) non-silence | **voiced seconds** = frames with payload > 100 B | **≥ 0.35 s** | min **0.555 s**; 0 clips below 0.40 | **1.6×** |
| (2) non-silence | file size | **≥ 4000 B** | min **5238 B** | 1.3× |
| (3) plausible duration | total seconds | **0.60 – 3.60 s** | 0.683 – 3.243 s | 12% / 11% |
| (3) sanity | bytes per second | **3500 – 13000** | 4451 – 10695 (VBR) | loose, by design |
| (4) correspondence | manifest ↔ disk, **both directions**, offenders named | set equality | 0 either way today | structural |
| (4) coverage | `wordsToGenerate()` ⊆ `clipsOnDisk()` | every intended word has a file | — | the old drift alarm, re-expressed |

**Design §11(3) says "plausible duration *for the word's length*" and I do not implement it that
way, deliberately.** Measured, length is a weak predictor (FINDING 3): a 3-letter clip reaches
3.115 s while the 18-letter `telecommunications` is 2.133 s. A per-length band tight enough to be
useful would fail on real clips. **A gate that fires on correct input is worse than no gate**, so the
envelope is global and the deviation from §11 is stated here rather than hidden.

**THE VOICE-DRIFT CONTROL (§11(1)) — decided in full, as the brief demands:**

* **Which word: `cat`.** Present since the first batch; 1.408 s, 12140 B, 33 frames, 1.365 s voiced —
  within 3% of the population median duration (1.365 s). Short, unambiguous, no homograph, no
  inflection. Its shipped md5 is **`f83c679fa536608aa69b88343fdfcee8`** and the step's tail asserts
  that md5 **after** the control has run.
* **How it is generated:** by the **shipped** `synthesizeWord()` — the only reason that function is
  exported. A re-implemented request would make a difference in the output indistinguishable from a
  difference in my copy of the request.
* **Where:** `C:/Users/dkreinov/finish-audio/drift/cat.aac`. `--drift` **refuses** any path resolving
  under `public/`, so the shipped clip cannot be overwritten even by a typo.
* **Tolerance — HARD part:** `sampleRate`, `channels` and AAC-LC must match the shipped clip
  **exactly**. A model or voice swap behind a fixed name would very likely move the encoder, and
  this costs nothing to assert.
* **Tolerance — JUDGEMENT part, labelled as such:** duration, byte and voiced-second ratios must lie
  in **[0.5, 2.0]**. **I cannot measure the true run-to-run variance of `gpt-4o-mini-tts` without
  spending money, and I did not.** The band is set to catch a gross change (a different voice, a
  different speaking rate, a different encoder) while not tripping on natural TTS jitter — for scale,
  the *population* spread of duration at a fixed word length is about **4.5×**. Too tight would
  cause a false STOP; too loose misses subtle drift, which is already inside the residual risk the
  owner accepted. **Proved by execution:** a control clip identical to the shipped one passes
  (ratios 1.000); a 3× control fails with four named reasons and exit 1.
* **A second, free drift signal:** after the batch, the ten new clips' durations are compared with
  the 2254-clip population. Ten independent samples are a stronger drift detector than one, and it
  costs nothing.

### SK-F2-7 — Q2: THE MARKER LANDS IN **BOTH** SURFACES

**Both.** R7's own words are about her dictionary (*"if she add a word to her dictionary and we dont
have it yet"*) — that is `public/views/words.js`. Design §8's prose is about the popup — that is
`public/views/reader.js`. **Doing one and not the other would make the same word behave two ways on
two screens**, which is the ambiguity the amendment exists to remove. Both rows and popups sit on
`--color-card`, both use the same `.btn-say`, and the marker CSS is in the one globally linked sheet,
so the marginal cost of the second surface is one function and two tests.

**The implementation is ONE function, `saySlot(canSay, lemma)`, defined in each view.** It is
duplicated rather than shared because a shared module would be a **new file under `public/`**, which
would need a `PRECACHE` entry, which is a `sw.js` change, which is forbidden this phase (F1-1). The
duplication is not left to trust: **step 2.4 asserts, by executing both, that
`readerSaySlot(false,'x') === wordsSaySlot(false,'x')` and `readerSaySlot(true,'cat') ===
wordsSaySlot(true,'cat')` — byte-identical output.** Verified today on the simulated tree: `true`
and `true`.

**`public/views/words.js`'s optimistic pre-manifest branch is PRESERVED, exactly.** Today
`:159` falls back to the raw key when `allowedWords === null`, so a row gets a live button before the
manifest loads. The new call is `saySlot(Boolean(sayLemma), sayLemma || lemma)` — `Boolean(sayLemma)`
is byte-for-byte the same predicate as today's `sayLemma ? … : ""`. **Executed:** with
`allowedWords = null`, three rows render three live buttons and **zero** `na` markers, exactly as
today. Keeping it is right: flashing "coming soon" and then replacing it with a live button is a
worse thing for a child to watch than a button that briefly does nothing, and a key in her
dictionary is a lemma the server already normalised against this very manifest, so the optimistic
guess is right nearly always.

### SK-F2-8 — THE CONTRAST PAIR: DESIGN §8 IS GATING THE RIGHT PAIR, AND IT IS ALREADY COVERED

The brief asked me to check whether `--color-card` is really the caption's background. **It is, in
both surfaces, measured:**

* reader: `public/views/reader.js:260` `.reader-popup { … background: var(--color-card); … }`
* words: `public/views/words.js:22-31` `.word-card { … background: var(--color-card); … }`

`scripts/check-contrast.mjs:13` already carries
`{ fg: "--color-muted", bg: "--color-card", min: 4.5, label: "muted text on card" }`, and
`.btn-say-soon` is `color: var(--color-muted)`. **So the pair is already covered and no pair is
added — the anchor stays 58.** Design §8 explicitly permits "or state why not"; this is the why not.

Two further checks, both measured rather than assumed:
* The diagonal line is `var(--color-muted)` drawn over `.btn-say`'s `var(--color-surface-2)`.
  `{ --color-muted, --color-surface-2, min 4.5 }` is **also already in `PAIRS`** (`:15`). Design §8
  is right that a non-interactive mark is not subject to the 3:1 control rule, and it happens to
  clear the stricter text bar anyway.
* **There is no `@media (prefers-color-scheme: dark)` block in `public/styles.css`.** One token set,
  so one contrast pass is the whole story. `check-contrast.mjs` parses only `:root`, which would
  have silently missed a dark override; there is none to miss.
* **Run, not reasoned:** `check-contrast.mjs` was executed against the **simulated** post-2.3
  stylesheet — `ALL PASS`, **58** PASS lines.

### SK-F2-9 — Q7: HOW THE HONESTY PROPERTY SURVIVES, AND WHERE IT IS GATED

The property word-polish proved: **a pressable button implies a clip exists.** Design §8 changes what
the button *is*, so the property needs restating and re-gating:

> **A `data-say` attribute implies a clip exists on disk.**

That is the honest form, because `data-say` — not `btn-say` — is what the player binds to
(`reader.js:884`, `words.js`, `quiz.js:263`). The four mechanisms that make it true:

1. **The `na` branch carries no `data-say` at all.** Not an empty one — none. So
   `container.querySelectorAll("[data-say]")` cannot reach it, and no handler is ever attached.
   **Executed:** `saySlot(false,'x').includes('data-say') === false`.
2. **The `na` button is `disabled`.** A second, independent mechanism: no click, no focus, no
   keyboard activation. Belt and braces, because (1) alone is a property of a selector.
3. **`data-say` is only ever drawn from the value `resolveLemma` returned**, and `resolveLemma` only
   ever returns a member of the manifest (`public/lemma.js:61`).
4. **The manifest is `clipsOnDisk()`**, so a member of the manifest is a file on disk — structurally,
   not by check.

**Gated by** (all executed, none a source needle): the extended `resolveLemma` sweep in
`tests/reader-ui.test.js`; the manifest↔disk set equality in `tests/word-audio.test.js`; the
executed `renderList` and the executed reader popup; and `check-word-audio.mjs`, which names any word
that breaks link 4.

**One pre-existing hole, named because this phase does not close it and must not be read as having
closed it:** in `public/views/words.js`, before the manifest loads, the optimistic branch can draw a
`data-say` for a key with no clip. The audio then 404s and `p.catch(() => {})` swallows it. That is
today's behaviour, it is preserved deliberately (SK-F2-7), and it is bounded to the milliseconds
before the manifest arrives.

### SK-F2-10 — NO `CACHE` BUMP, AND WHAT IT COSTS THIS TIME

`public/sw.js` `PRECACHE` (read today) lists `/styles.css`, `/views/reader.js` and `/views/words.js`.
**All three move this phase.** With phase 1's `/views/reader.js` and `/views/trophies.js`, that is
**four distinct precached files changed and unbumped** at the end of phase 2. QZ-22 says a precached
change ships a `CACHE` bump the same phase; this phase deliberately does not, on carried obligation
F1-1, and it is safe **only because phase 2 does not deploy**.

**`public/audio/words/index.json` is NOT in `PRECACHE`**, and the `fetch` handler never `put()`s
anything, so the manifest is **always fetched from the network**. Two consequences worth writing down
before someone rediscovers them at 3am:

* A phone still running the `v20` shell after phase 4's deploy would serve the **old** JS/CSS with
  the **new** manifest — i.e. ten more words resolve, and the old code draws a **live** button for
  them, which is correct because the clips are there. **No dead button, no dishonesty.** The
  `v21` activate then deletes the old cache.
* The reverse — new JS with an old manifest — cannot happen, because the manifest is never cached.

**Phase 4 must bump `magic-vet-v20` → `v21` in `public/sw.js:1` and move the pin in
`tests/shell.test.js` in the SAME step**, with a seam assertion. This plan restates F1-1 rather than
paying it.

---

## §VAL-F2 — THE FROZEN VALIDATION PREAMBLE

**Deliver this to any executor as a FILE, never inline in a JSON packet** — backslashes have
collapsed in transit twice in this project's history (field guide 8, 19). **Every step's validation
is ONE script = §VAL-F2 verbatim + that step's tail, in the SAME file.** A child `bash` cannot supply
`fail`, `$RC`, `$PORC`, `$TOTAL` or `$SBSTATE` to a tail, so a tail invoked as a separate process
exits 0 unconditionally — the silent-pass class.

**THE `.oplan` FILTER IS `awk '$NF !~ /^\.oplan\//'`.** Count the backslash bytes in your copy:
there are exactly **two**, one before the `.` and one before the `/`. A collapsed copy is a bash
**syntax error**, which makes the whole gate exit 0 and pass everything.
`.oplan/word-trophies/plan.md:989` carries such a collapsed copy. Never copy that line.

It hard-codes every number this phase does not move. The five that DO move — the reported total, the
plan number, the flat ledger, `PUBN` and `MAN` — stay in variables and are asserted in each step's
tail. **`console.log(String(n))`, never `console.log(n)`** — a `node -e` that prints a count through
`util.inspect` emits ANSI colour codes in this very shell, and a gate that pins a count and forgets
`String()` fails on a perfectly correct tree.

**Two clauses are new in this phase and are worth reading twice:**

* **`OPENAI_API_KEY` must NOT be set in a validation shell.** Step 2.6 sources `.env` inside its own
  command and nowhere else. A key in the gate's environment is how a "check" becomes a purchase.
* **`AUDBASE` reads the 2254 clip names out of `git show 81fb743:public/audio/words/index.json`,
  not out of the working manifest.** If it read the working manifest it would silently start
  covering 2264 names after step 2.6 and stop being a "nothing was re-recorded" proof at exactly
  the moment that proof matters most.

```bash
#!/usr/bin/env bash
set -o pipefail
cd C:/Users/dkreinov/claude/english-app || { echo "FAIL: cannot cd to the repo"; exit 1; }
RC=0
fail() { echo "FAIL: $*"; RC=1; }

# --- APP_CODE must NOT exist in this shell (field guide 3: a leak silently 401s everything) ---
if [ -n "${APP_CODE:-}" ]; then fail "APP_CODE is set in this shell"; fi

# --- OPENAI_API_KEY must NOT be exported into a validation shell. Step 2.6 sources
# --- .env in its OWN command and nowhere else. A key in the gate's environment is
# --- how a "check" becomes a purchase.
if [ -n "${OPENAI_API_KEY:-}" ]; then fail "OPENAI_API_KEY is set in this shell -- it belongs only inside step 2.6's generation command"; fi

# --- this run writes to finish2-*, NEVER into a previous run's directory ---
WD="$HOME/finish2-val"; mkdir -p "$WD"
case "$WD" in *trophies-deploy*|*polish-deploy*|*trophies-val*|*polish-val*|*finish-val*) fail "the work dir resolves into a PREVIOUS run's directory: $WD";; esac

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

# --- contrast: the anchor does NOT move this phase (SK-F2-8) ---
CON="$(node scripts/check-contrast.mjs 2>&1)"; CSTAT=$?
case "$CSTAT" in 0) ;; *) fail "check-contrast exited $CSTAT";; esac
PASSES="$(printf '%s\n' "$CON" | grep -c '^PASS')"
case "$PASSES" in 58) ;; *) fail "contrast anchor must stay 58 all phase, got '$PASSES'";; esac
case "$CON" in *"ALL PASS"*) ;; *) fail "check-contrast did not print ALL PASS";; esac

# --- the quiz bank does not move: phase 3 owns the items ---
QB="$(node scripts/check-quiz-bank.mjs 2>&1)"; QBSTAT=$?
case "$QBSTAT" in 0) ;; *) fail "check-quiz-bank exited $QBSTAT";; esac
case "$QB" in *"QUIZ BANK OK: 62 files, 84 items"*) ;; *) fail "the quiz bank moved: $QB";; esac

# --- public/ file count. 2372 through step 2.5, 2382 after the ten clips: per-step tail ---
PUBN="$(node -e 'const fs=require("fs"),path=require("path");let n=0;(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);if(fs.statSync(f).isDirectory())walk(f);else n++;}})("public");console.log(String(n));')"

# --- public/ OUTSIDE every path this phase may touch is byte-frozen (no backslashes: field guide 8) ---
PUBX="$(node -e 'const fs=require("fs"),path=require("path"),crypto=require("crypto");const SKIP=new Set(["public/styles.css","public/views/reader.js","public/views/words.js"]);const DIR="public/audio/words/";const out=[];(function walk(d){for(const e of fs.readdirSync(d).sort()){const f=path.join(d,e);const p=f.split(path.sep).join("/");if(fs.statSync(f).isDirectory())walk(f);else if(!SKIP.has(p)&&p.indexOf(DIR)!==0)out.push(p+" "+crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex"));}})("public");console.log(String(out.length)+" "+crypto.createHash("md5").update(out.join(String.fromCharCode(10))).digest("hex"));')"
case "$PUBX" in "114 09ead45ed990a0dc5d604d5d4d052a5c") ;; *) fail "public/ moved outside the touchable paths: expected '114 09ead45ed990a0dc5d604d5d4d052a5c', got '$PUBX'";; esac

# --- NO SHIPPED CLIP IS EVER RE-RECORDED. The 2254 names come from the manifest AT
# --- THE BASE COMMIT, so this stays meaningful after the manifest grows to 2264.
git show 81fb743:public/audio/words/index.json > "$WD/base-manifest.json" 2>/dev/null || fail "cannot read the base manifest out of git"
AUDBASE="$(node -e 'const fs=require("fs"),crypto=require("crypto");const base=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));const out=[];let miss=0;for(const w of base.slice().sort()){const p="public/audio/words/"+w+".aac";if(!fs.existsSync(p)){miss++;out.push(w+" MISSING");continue;}out.push(w+" "+crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex"));}console.log(String(base.length)+" "+String(miss)+" "+crypto.createHash("md5").update(out.join(String.fromCharCode(10))).digest("hex"));' "$WD/base-manifest.json")"
case "$AUDBASE" in "2254 0 42925ba553013c1082aab77ebb454ebc") ;; *) fail "a pre-existing clip was overwritten or removed: expected '2254 0 42925ba553013c1082aab77ebb454ebc', got '$AUDBASE'";; esac

# --- QZ-18 frozen ---
QMD5="$(md5sum public/quiz.js | cut -d' ' -f1)"
case "$QMD5" in 69b6d71117cf776715374abc6f0abb02) ;; *) fail "public/quiz.js moved: $QMD5 (QZ-18 frozen)";; esac
QCMD5="$(md5sum public/quiz-core.js | cut -d' ' -f1)"
case "$QCMD5" in 9a2131be8b9d1b77c219f1e8c3482a71) ;; *) fail "public/quiz-core.js moved: $QCMD5 (QZ-18 frozen)";; esac

# --- the service worker does NOT move: the CACHE bump is spent once, in phase 4 (F1-1) ---
SWMD5="$(md5sum public/sw.js | cut -d' ' -f1)"
case "$SWMD5" in 78fc3b0ac1d10de8a5baccb753eca33c) ;; *) fail "public/sw.js moved: $SWMD5 -- there is NO CACHE bump in this phase (F1-1)";; esac

# --- THE VOICE, THE MODEL AND THE INSTRUCTIONS ARE FROZEN. 2254 clips came from them. ---
TTS="$(node -e 'const s=require("fs").readFileSync("scripts/build-word-audio.js","utf8");const g=(re)=>{const m=s.match(re);return m?m[1]:"ABSENT";};console.log(g(/const MODEL = .([^\x27"]+)./)+"|"+g(/const VOICE = .([^\x27"]+)./)+"|"+String(s.indexOf("Speak slowly and clearly, like a warm, friendly teacher pronouncing one English word for a young learner.")>=0));')"
case "$TTS" in "gpt-4o-mini-tts|nova|true") ;; *) fail "the frozen TTS model/voice/instructions moved: '$TTS'";; esac

# --- the server is byte-untouched: this phase changes the manifest CONTENTS, never the code that reads it ---
SRV="$(git diff --name-only HEAD -- lib api)"
case "$SRV" in "") ;; *) fail "lib/ or api/ changed, which phase 2 must never do: $SRV";; esac

# --- data/: the curriculum is NOT extended. Only story-words.json may appear. ---
DATA="$(git status --porcelain -uall -- data | awk '{print $NF}' | LC_ALL=C sort | tr '\n' ' ')"
case "$DATA" in ""|"data/story-words.json ") ;; *) fail "data/ moved beyond story-words.json: '$DATA'";; esac
BANDS="$(md5sum data/band1.json data/band2.json data/placement-items.json | cut -d' ' -f1 | tr '\n' ' ')"
case "$BANDS" in "2455208202119d75b69d11148dc525b9 4812e246ee7e9822327b6288c7faac13 7ff66fa7ed521dbaf24db1a97ce2a74c ") ;; *) fail "the curriculum data moved, which phase 2 must never do: '$BANDS'";; esac

# --- the manifest is the disk, and both numbers move together. Values in each tail. ---
MAN="$(node -e 'const fs=require("fs");const m=JSON.parse(fs.readFileSync("public/audio/words/index.json","utf8"));const d=fs.readdirSync("public/audio/words").filter(f=>f.endsWith(".aac")).map(f=>f.slice(0,-4));const ms=new Set(m),ds=new Set(d);const dead=m.filter(w=>!ds.has(w)).length,orph=d.filter(w=>!ms.has(w)).length;const b=fs.readFileSync("public/audio/words/index.json");console.log(String(m.length)+" "+String(d.length)+" "+String(dead)+" "+String(orph)+" "+String(b.length)+" "+require("crypto").createHash("md5").update(b).digest("hex"));')"
case "$MAN" in *" 0 0 "*) ;; *) fail "the manifest and the disk disagree (entries disk dead orphan bytes md5): $MAN";; esac

# --- transcripts must diff EMPTY ---
node .oplan/word-quiz/quiz-transcript.mjs > "$WD/qz.out" 2>&1 || fail "quiz-transcript.mjs exited non-zero"
QZ="$(diff "$WD/qz.out" .oplan/word-quiz/quiz-transcript-expected.txt)"
case "$QZ" in "") ;; *) fail "QZ-21 transcript moved";; esac
node .oplan/word-g1/g1-transcript.mjs > "$WD/g1.out" 2>&1 || fail "g1-transcript.mjs exited non-zero"
G1="$(diff "$WD/g1.out" .oplan/word-g1/g1-transcript-expected.txt)"
case "$G1" in "") ;; *) fail "G1 transcript moved";; esac
rm -f "$WD/qz.out" "$WD/g1.out"

# --- E: the dev sandbox is a TWO-STATE thing and must never be anything else (phase 1, F1-4) ---
SBF="C:/Users/dkreinov/english-app-sandbox/profile.json"
if [ ! -e "$SBF" ]; then SBSTATE=MISSING; fail "the dev sandbox profile is missing entirely: $SBF"; else
  SBMD5="$(md5sum "$SBF" | cut -d' ' -f1)"
  case "$SBMD5" in
    91eff5da59674d7463f462fad659534e) SBSTATE=FIXTURE ;;
    e56c169fddf0ab2275fda3f98f5e3182) SBSTATE=HER; fail "the dev sandbox holds HER vocabulary again -- step 1.1 has been undone";;
    *) SBSTATE=UNKNOWN; fail "the dev sandbox profile is in neither known state: $SBMD5 -- a dev server may have written it and not been restored";;
  esac
fi

# --- NOT ONE BYTE OF HER PROFILE MAY EXIST INSIDE THE REPOSITORY ---
if [ -e .data/profile.json ]; then fail ".data/profile.json exists -- a local write leaked"; fi
STRAY="$(find . -path ./node_modules -prune -o -name 'profile-*.json' -print | head -5)"
case "$STRAY" in "") ;; *) fail "a capture file is inside the repo: $STRAY";; esac

# --- NO SCRATCH AUDIO INSIDE THE REPO. The drift control writes OUTSIDE public/. ---
STRAYAAC="$(find public -name '*.aac' -print | grep -v '^public/audio/words/' | head -3)"
case "$STRAYAAC" in "") ;; *) fail "an .aac file exists under public/ outside public/audio/words: $STRAYAAC";; esac

# --- line endings are LAW and git normalises them away (field guide 4 and 16) ---
ENDS="$(node -e 'const fs=require("fs");const out=[];for(const f of process.argv.slice(1)){if(!fs.existsSync(f)){out.push(f+" MISSING");continue;}const b=fs.readFileSync(f);let c=0,l=0;for(let i=0;i<b.length;i++){if(b[i]===10){if(i>0&&b[i-1]===13)c++;else l++;}}out.push(f+" CRLF="+String(c)+" LF="+String(l));}console.log(out.join("; "));' public/styles.css public/views/reader.js public/views/words.js public/words-index.js public/lemma.js public/app.js public/sw.js public/index.html public/quiz.js public/quiz-core.js scripts/build-word-audio.js scripts/check-contrast.mjs tests/word-audio.test.js tests/reader-ui.test.js tests/words-ui.test.js tests/quiz-ui.test.js tests/lemma.test.js public/audio/words/index.json)"
echo "ENDINGS: $ENDS"
case "$ENDS" in *"public/words-index.js CRLF=0 LF=25"*)   ;; *) fail "public/words-index.js endings moved";; esac
case "$ENDS" in *"public/lemma.js CRLF=0 LF=64"*)         ;; *) fail "public/lemma.js endings moved";; esac
case "$ENDS" in *"public/app.js CRLF=0 LF=67"*)           ;; *) fail "public/app.js endings moved";; esac
case "$ENDS" in *"public/sw.js CRLF=51 LF=0"*)            ;; *) fail "public/sw.js endings moved";; esac
case "$ENDS" in *"public/index.html CRLF=90 LF=0"*)       ;; *) fail "public/index.html endings moved";; esac
case "$ENDS" in *"public/quiz.js CRLF=346 LF=0"*)         ;; *) fail "public/quiz.js endings moved";; esac
case "$ENDS" in *"public/quiz-core.js CRLF=99 LF=0"*)     ;; *) fail "public/quiz-core.js endings moved";; esac
case "$ENDS" in *"scripts/check-contrast.mjs CRLF=0 LF=190"*) ;; *) fail "check-contrast.mjs endings moved";; esac
case "$ENDS" in *"tests/quiz-ui.test.js CRLF=0 LF=584"*)  ;; *) fail "tests/quiz-ui.test.js endings moved";; esac
case "$ENDS" in *"tests/lemma.test.js CRLF=0 LF=86"*)     ;; *) fail "tests/lemma.test.js endings moved";; esac
case "$ENDS" in *"public/audio/words/index.json CRLF=0 LF=1"*) ;; *) fail "the manifest is no longer a single LF-terminated line";; esac
# the THREE CRLF files this phase edits are cross-checked a SECOND way, with the only
# form field guide 16 trusts. CR and LF must be equal or the file is MIXED, a defect.
for f in public/styles.css public/views/reader.js public/views/words.js; do
  XCR="$(tr -dc '\r' < "$f" | wc -c | tr -d ' ')"
  XLF="$(tr -dc '\n' < "$f" | wc -c | tr -d ' ')"
  case "$XCR" in "$XLF") ;; *) fail "$f is MIXED, which is a defect: CR=$XCR LF=$XLF";; esac
done
# the LF files this phase edits must never acquire a CR
for f in scripts/build-word-audio.js tests/word-audio.test.js tests/reader-ui.test.js tests/words-ui.test.js; do
  YCR="$(tr -dc '\r' < "$f" | wc -c | tr -d ' ')"
  case "$YCR" in 0) ;; *) fail "$f acquired $YCR CR bytes -- an editor CRLF'd an LF file";; esac
done
if [ -e data/story-words.json ]; then
  SCR="$(tr -dc '\r' < data/story-words.json | wc -c | tr -d ' ')"
  case "$SCR" in 0) ;; *) fail "data/story-words.json acquired $SCR CR bytes";; esac
fi

# --- NO NEW HEBREW. The two edited views are pinned by raw non-ASCII BYTE COUNT. ---
NA="$(node -e 'const fs=require("fs");const out=[];for(const f of process.argv.slice(1)){const b=fs.readFileSync(f);let n=0;for(const x of b) if(x>127) n++;out.push(f+"="+String(n));}console.log(out.join(" "));' public/views/reader.js public/views/words.js public/styles.css tests/word-audio.test.js)"
echo "NONASCII: $NA"
case "$NA" in *"public/styles.css=0"*) ;; *) fail "public/styles.css must stay pure ASCII: $NA";; esac
case "$NA" in *"tests/word-audio.test.js=0"*) ;; *) fail "tests/word-audio.test.js must stay pure ASCII: $NA";; esac
NEST="$(grep -h -c 'describe(' tests/word-audio.test.js tests/reader-ui.test.js tests/words-ui.test.js | awk '{s+=$1} END{print s+0}')"
case "$NEST" in 0) ;; *) fail "$NEST describe() blocks appeared -- flat top-level test() only";; esac

# --- nothing deleted, ever ---
GONE="$(git diff --diff-filter=D --name-only HEAD)"
case "$GONE" in "") ;; *) fail "files were deleted in the worktree: $GONE";; esac

# --- computed here, ASSERTED in each step's tail ---
PORC="$(git status --porcelain -uall | awk '$NF !~ /^\.oplan\//' | LC_ALL=C sort)"

echo "VAL-F2: TOTAL=$TOTAL PLAN=$PLAN FAILED=$FAILED GTOTAL=$GTOTAL GFAILED=$GFAILED FLAT=$FLAT PASSES=$PASSES PUBN=$PUBN MAN='$MAN' SB=$SBSTATE"
```

### THIS PREAMBLE WAS EXTRACTED BACK OUT OF THIS FILE AND RUN TODAY — exit 0, zero `FAIL:` lines

Not described, not hand-simulated. The block above was pulled out of this document by

```bash
awk '/^## .VAL-F2/{s=1} s&&/^```bash$/{c=1;next} c&&/^```$/{exit} c{print}' PLAN-P2.md
```

and executed from that extraction against the clean tree at `81fb743`. Its complete stdout — three
lines and nothing else:

```
ENDINGS: public/styles.css CRLF=729 LF=0; public/views/reader.js CRLF=946 LF=0; public/views/words.js CRLF=289 LF=0; public/words-index.js CRLF=0 LF=25; public/lemma.js CRLF=0 LF=64; public/app.js CRLF=0 LF=67; public/sw.js CRLF=51 LF=0; public/index.html CRLF=90 LF=0; public/quiz.js CRLF=346 LF=0; public/quiz-core.js CRLF=99 LF=0; scripts/build-word-audio.js CRLF=0 LF=154; scripts/check-contrast.mjs CRLF=0 LF=190; tests/word-audio.test.js CRLF=0 LF=65; tests/reader-ui.test.js CRLF=0 LF=848; tests/words-ui.test.js CRLF=0 LF=272; tests/quiz-ui.test.js CRLF=0 LF=584; tests/lemma.test.js CRLF=0 LF=86; public/audio/words/index.json CRLF=0 LF=1
NONASCII: public/views/reader.js=750 public/views/words.js=461 public/styles.css=0 tests/word-audio.test.js=0
VAL-F2: TOTAL=369 PLAN=364 FAILED=0 GTOTAL=369 GFAILED=0 FLAT=364 PASSES=58 PUBN=2372 MAN='2254 2254 0 0 19942 8735a3c499508b04415046e2be4ad159' SB=FIXTURE
```

### AND IT WAS SEEN TO FAIL

A copy with five expectations mutated (`$PUBX`, `$AUDBASE`, `public/sw.js`, the frozen **VOICE**,
and the sandbox fixture md5) printed exactly five `FAIL:` lines:

```
FAIL: public/ moved outside the touchable paths: ...
FAIL: a pre-existing clip was overwritten or removed: ...
FAIL: public/sw.js moved: 78fc3b0ac1d10de8a5baccb753eca33c -- there is NO CACHE bump in this phase (F1-1)
FAIL: the frozen TTS model/voice/instructions moved: 'gpt-4o-mini-tts|nova|true'
FAIL: the dev sandbox profile is in neither known state: ... -- a dev server may have written it and not been restored
```

> **⚠ AND IT EXITED 0 WHILE PRINTING ALL FIVE.** Field guide 17, reproduced live on this very
> preamble. **§VAL-F2 run on its own is a REPORT, not a GATE, and its exit status is meaningless.**
> Measured today: clean + `exit $RC` → **0**; mutated + `exit $RC` → **1**.
> **Every step's script is §VAL-F2 verbatim PLUS that step's tail in the same file, ending
> `exit $RC`.** A step that reports "VAL-F2 passed" without a tail has proved nothing.

---

**THE COMMIT CONVENTION, stated because every `$PORC` assertion below depends on it.** As in phase 1
(`journal.md`: *"1.1 544814b · 1.2 376a2d9 · 1.3 43a3811 · 1.4 870e9c7"*), **the orchestrator commits
each step at acceptance**, so every step begins on a clean tree and each tail's `$PORC` lists **only
that step's own files**. If a step is run without committing the previous one, `$PORC` will
legitimately be larger and the tail will fail — that is correct behaviour and the executor must
report it, not edit the pin. `$PORC` is `LC_ALL=C sort`ed, in which a modified line (` M …`, leading
space, byte 0x20) sorts **before** an untracked line (`?? …`, byte 0x3F). **Measured, because I got
this backwards on the first draft.**

---

## FROZEN CONTRACTS — quoted, in force for every step of this phase

**FC-1 — QZ-18.** `public/quiz.js` md5 `69b6d71117cf776715374abc6f0abb02` and `public/quiz-core.js`
md5 `9a2131be8b9d1b77c219f1e8c3482a71`. **Never touched, not even whitespace.**

**FC-2 — the voice.** From `scripts/build-word-audio.js`, verbatim, and none of the three may move:
```js
const MODEL = 'gpt-4o-mini-tts';
const VOICE = 'nova';
const INSTRUCTIONS =
  'Speak slowly and clearly, like a warm, friendly teacher pronouncing one English word for a young learner.';
```
2254 shipped clips came from those. The **only** edit to `synthesizeWord` in this phase is the word
`export`. Asserted mechanically in §VAL-F2 (`$TTS`).

**FC-3 — the `.oplan` filter** is `awk '$NF !~ /^\.oplan\//'`. Two backslash bytes.

**FC-4 — no `CACHE` bump.** `public/sw.js` md5 `78fc3b0ac1d10de8a5baccb753eca33c`,
`CACHE = "magic-vet-v20"`. The single `v20` → `v21` is **phase 4's** (F1-1). Phase 2 leaves **three
more** precached files changed and unbumped, deliberately, and that is safe **only because phase 2
does not deploy**.

**FC-5 — the marker, from `design.md` §8, quoted not named.** Class `btn-say na` in addition to
`btn-say`; the **existing** speaker glyph, not a swapped emoji; the "does not exist" mark drawn as a
**diagonal line by CSS**; the caption is the ASCII string **`coming soon`**, lower-case, English, no
Hebrew. The exact rules live in `design.md`'s two ```` ```css ```` blocks and are
**EXTRACTED BY SCRIPT** (`apply-2.3.cjs`), never retyped. Their md5 as extracted is
`6e43cb5e463520f5d277d7d02c5ff26c`; the apply script refuses to run if that changes.

**FC-6 — BASE LEMMAS ONLY IN `data/story-words.json`. NEW IN THIS PHASE, AND IT IS LOAD-BEARING.**
> An inflected surface form in the manifest stops `migrateWordKeys` (`lib/profile.js:294`, run on
> **every** profile POST via `api/profile.js:52`) folding it into its lemma, which **splits a word
> she has already collected into two dictionary entries**. See FINDING 1 and FINDING 2, and the
> standing ruling at `.oplan/word-polish/journal.md:41`. Gated by an executed sweep in
> `tests/word-audio.test.js`, not by prose.

**FC-7 — no new Hebrew, anywhere, in any file.** Both edited views' raw non-ASCII byte counts are
pinned exactly (`reader.js` 750→754, `words.js` 461→465, and the `+4` is one extra copy of the
existing speaker glyph). `public/styles.css` and `tests/word-audio.test.js` must stay **0**.

**FC-8 — the strings a step may need and must never retype.** All were read with `fs.readFileSync`
and an explicit `\r\n` split, which is why they are trustworthy. **`sed`, `awk` and every other
line-oriented tool read a CRLF file in text mode here and will lie to you about these** — the apply
scripts use `fs` byte I/O and nothing else.

* `public/views/reader.js:691`, **10 leading spaces**, the ONE line step 2.4 replaces. Its Hebrew
  `aria-label` and its speaker glyph are **sliced out of these very bytes** and re-inserted:
  `          ${activePopup.canSay ? \`<button class="btn-say" type="button" data-say="${escapeHtml(activePopup.lemma)}" aria-label="…">…</button>\` : ""}`
* `public/views/reader.js:843`, verbatim — **it does NOT move this phase**, and
  `tests/reader-ui.test.js:337` pins it: `        canSay: lemma !== null,`
* `public/views/words.js:159-162`, the four-line block step 2.3 replaces, `sayLemma` first.
* `public/styles.css`'s insert anchor is `.btn-know {` — **unique, verified today** (one occurrence).
  The new rules go immediately **before** it, i.e. directly after `.btn-say:active`.
* `scripts/build-word-audio.js`'s `deriveWordList()` body, `writeManifest()` body, `main()` head and
  generation loop — all quoted byte-exactly inside `apply-2.1.cjs`, which refuses to run if any of
  them has moved.

---

# STEP 2.1 — THE MANIFEST BECOMES A STATEMENT ABOUT THE DISK. **ZERO ARTIFACTS MOVE.**

**GOAL:** `scripts/build-word-audio.js` gains `wordsToGenerate()`, `clipsOnDisk()`, `bandWords()`,
`readStoryWords()` and `writeManifestFromDisk()`; `deriveWordList()` and `writeManifest(words)` are
**deleted**; the manifest is written **after** the loop, in a `finally`; `synthesizeWord` is
exported. `data/story-words.json` is created **empty**. `tests/word-audio.test.js` is re-expressed
against the new architecture and gains two tests.

**WHY THE EXTRAS FILE IS CREATED EMPTY.** This step must be **provably artifact-neutral**: after it,
`wordsToGenerate()` returns the same 2254, `clipsOnDisk()` returns the same 2254, and
`writeManifestFromDisk()` would emit **byte-identical** bytes to the manifest already on disk.
**Verified today, not argued:** the manifest this code would write has md5
`8735a3c499508b04415046e2be4ad159` — the md5 it already has. So the whole risk of the architecture
change is separated from the whole risk of the content change, and the content change is step 2.6.

**TIER:** WORKER. **DEPENDS ON:** nothing.

**REPO WRITE SET (exhaustive):**
* `scripts/build-word-audio.js` — MODIFY (**LF**, 154 → **209** lines). Written by the frozen apply script.
* `data/story-words.json` — **CREATE**, 3 bytes, `[]` + LF, md5 `58e0494c51d30eb3494f7c9198986bb9`.
* `tests/word-audio.test.js` — MODIFY (**LF**, 65 lines). **+2 flat tests → ledger 366 flat / 371 reported.**
* `public/` DOES NOT MOVE AT ALL this step: `PUBN=2372`, `MAN='2254 2254 0 0 19942 8735a3c499508b04415046e2be4ad159'`.

**THE APPLY SCRIPT, verbatim.** Write it to `C:/Users/dkreinov/finish-audio/apply-2.1.cjs` (outside
the repo) and run `node C:/Users/dkreinov/finish-audio/apply-2.1.cjs C:/Users/dkreinov/claude/english-app`.
**It refuses to double-apply and it refuses to run if any anchor has moved by one byte.**

```js
// word-finish step 2.1 -- the manifest stops being a statement about the
// CURRICULUM and becomes a statement about WHAT IS ON DISK (design section 3 A).
//
// Both files are LF and MUST stay LF. Written as bytes, newline='' equivalent.
// Usage:  node apply-2.1.cjs <repo-root>
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.argv[2];
if (!ROOT) { console.log('STOP: usage: node apply-2.1.cjs <repo-root>'); process.exit(1); }
const P = (p) => path.join(ROOT, p);
const md5 = (b) => crypto.createHash('md5').update(b).digest('hex');
const stop = (m) => { console.log('STOP: ' + m); process.exit(1); };

// ---- 1. data/story-words.json, created EMPTY -------------------------------
// Step 2.1 is deliberately artifact-neutral: it changes the ARCHITECTURE and
// nothing else, so the manifest it writes must be byte-identical to the one it
// replaces. The ten words land in step 2.6, with the money.
const swPath = P('data/story-words.json');
if (fs.existsSync(swPath)) stop('data/story-words.json already exists -- refusing to overwrite');
fs.writeFileSync(swPath, Buffer.from('[]\n', 'utf8'));

// ---- 2. scripts/build-word-audio.js ----------------------------------------
const gPath = P('scripts/build-word-audio.js');
const g0 = fs.readFileSync(gPath);
const g = g0.toString('utf8');
if (g.includes('wordsToGenerate')) stop('build-word-audio.js already split -- refusing to double-apply');
let cr = 0; for (const x of g0) if (x === 13) cr++;
if (cr !== 0) stop('build-word-audio.js is not LF on disk (CR=' + cr + ') -- re-measure before editing');

const OLD_DERIVE =
  "export function deriveWordList() {\n" +
  "  const band1 = JSON.parse(readFileSync(BAND1_PATH, 'utf8'));\n" +
  "  const band2 = JSON.parse(readFileSync(BAND2_PATH, 'utf8'));\n" +
  "  const profile = { skills: { receptiveVocab: { band: 'A2' } }, words: {}, learner: {} };\n" +
  "  const allowed = buildAllowedSet(profile, band1, band2);\n" +
  "  return [...allowed].filter((w) => WORD_RE.test(w)).sort();\n" +
  "}\n";
if (!g.includes(OLD_DERIVE)) stop('the frozen deriveWordList() block was not found byte-exactly');

const NEW_DERIVE =
  "// TWO CONCEPTS, TWO NAMES. One function used to mean both at once, and that\n" +
  "// ambiguity is exactly what let the manifest drift away from the disk.\n" +
  "//\n" +
  "//   wordsToGenerate()  = WHAT WE INTEND TO HAVE. The curriculum bands, plus the\n" +
  "//                        explicit story-word extras. Drives the generation loop.\n" +
  "//   clipsOnDisk()      = WHAT EXISTS. The .aac files, and nothing else.\n" +
  "//\n" +
  "// THE MANIFEST IS clipsOnDisk(), ALWAYS. A manifest entry with no file is a dead\n" +
  "// speaker button in a child's story; deriving it from the disk makes that state\n" +
  "// structurally unreachable rather than merely unlikely.\n" +
  "//\n" +
  "// The extras are a DATA FILE, never a literal in this script: a hardcoded word\n" +
  "// list here is what tests/word-audio.test.js has forbidden since the first run.\n" +
  "// BASE LEMMAS ONLY. See .oplan/word-polish/journal.md ruling B2: an inflected\n" +
  "// surface form in the manifest stops migrateWordKeys (lib/profile.js) folding it\n" +
  "// into its lemma, which SPLITS a word she has already collected into two entries.\n" +
  "export function readStoryWords() {\n" +
  "  if (!existsSync(STORY_WORDS_PATH)) return [];\n" +
  "  const raw = JSON.parse(readFileSync(STORY_WORDS_PATH, 'utf8'));\n" +
  "  if (!Array.isArray(raw)) throw new Error('data/story-words.json must be a JSON array');\n" +
  "  const seen = new Set();\n" +
  "  for (const w of raw) {\n" +
  "    if (typeof w !== 'string' || !WORD_RE.test(w)) {\n" +
  "      throw new Error(`data/story-words.json holds ${JSON.stringify(w)}, which can never be a lemma file`);\n" +
  "    }\n" +
  "    if (seen.has(w)) throw new Error(`data/story-words.json lists \"${w}\" twice`);\n" +
  "    seen.add(w);\n" +
  "  }\n" +
  "  return [...seen];\n" +
  "}\n" +
  "\n" +
  "export function bandWords() {\n" +
  "  const band1 = JSON.parse(readFileSync(BAND1_PATH, 'utf8'));\n" +
  "  const band2 = JSON.parse(readFileSync(BAND2_PATH, 'utf8'));\n" +
  "  const profile = { skills: { receptiveVocab: { band: 'A2' } }, words: {}, learner: {} };\n" +
  "  const allowed = buildAllowedSet(profile, band1, band2);\n" +
  "  return [...allowed].filter((w) => WORD_RE.test(w)).sort();\n" +
  "}\n" +
  "\n" +
  "export function wordsToGenerate() {\n" +
  "  return [...new Set([...bandWords(), ...readStoryWords()])].sort();\n" +
  "}\n" +
  "\n" +
  "export function clipsOnDisk() {\n" +
  "  if (!existsSync(WORDS_DIR)) return [];\n" +
  "  return readdirSync(WORDS_DIR)\n" +
  "    .filter((f) => f.endsWith('.aac'))\n" +
  "    .map((f) => f.slice(0, -'.aac'.length))\n" +
  "    .sort();\n" +
  "}\n";

let g1 = g.replace(OLD_DERIVE, NEW_DERIVE);

// imports: readdirSync is now needed
const OLD_IMPORT = "import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';";
if (!g1.includes(OLD_IMPORT)) stop('the fs import line was not found byte-exactly');
g1 = g1.replace(OLD_IMPORT, "import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';");

// the extras path, declared beside the band paths
const OLD_PATHS = "const MANIFEST_PATH = path.join(WORDS_DIR, 'index.json');";
if (!g1.includes(OLD_PATHS)) stop('the MANIFEST_PATH line was not found byte-exactly');
g1 = g1.replace(OLD_PATHS, OLD_PATHS + "\nconst STORY_WORDS_PATH = path.join(REPO_ROOT, 'data', 'story-words.json');");

// writeManifest -> writeManifestFromDisk
const OLD_WM =
  "// The manifest the browser resolves against. Written from the SAME derived list\n" +
  "// the clips come from, so it cannot drift from what is actually on disk.\n" +
  "export function writeManifest(words) {\n" +
  "  mkdirSync(WORDS_DIR, { recursive: true });\n" +
  "  writeFileSync(MANIFEST_PATH, JSON.stringify(words) + '\\n');\n" +
  "  return MANIFEST_PATH;\n" +
  "}\n";
if (!g1.includes(OLD_WM)) stop('the frozen writeManifest() block was not found byte-exactly');
const NEW_WM =
  "// The manifest the browser AND api/profile.js resolve against. It is written\n" +
  "// from the DISK, so \"listed\" and \"exists\" cannot come apart. It takes no\n" +
  "// argument on purpose: there is no caller-supplied list that could be wrong.\n" +
  "export function writeManifestFromDisk() {\n" +
  "  mkdirSync(WORDS_DIR, { recursive: true });\n" +
  "  const words = clipsOnDisk();\n" +
  "  writeFileSync(MANIFEST_PATH, JSON.stringify(words) + '\\n');\n" +
  "  return { path: MANIFEST_PATH, count: words.length };\n" +
  "}\n";
g1 = g1.replace(OLD_WM, NEW_WM);

// synthesizeWord is exported so the voice-drift control uses the SHIPPED request
// builder -- same model, same voice, same instructions -- instead of a copy of it.
g1 = g1.replace("async function synthesizeWord(apiKey, lemma) {", "export async function synthesizeWord(apiKey, lemma) {");
if (!g1.includes('export async function synthesizeWord')) stop('failed to export synthesizeWord');

// main(): the manifest is written AFTER the loop, in a finally, so disk and
// manifest agree even when the run dies half way.
const OLD_MAIN =
  "async function main() {\n" +
  "  const words = deriveWordList();\n" +
  "\n" +
  "  if (process.env.WORD_AUDIO_DRY_RUN === '1') {\n" +
  "    console.log(`words: ${words.length}`);\n" +
  "    return;\n" +
  "  }\n" +
  "\n" +
  "  writeManifest(words);\n" +
  "  console.log(`manifest: ${words.length} words -> ${MANIFEST_PATH}`);\n" +
  "\n";
if (!g1.includes(OLD_MAIN)) stop('the frozen main() head was not found byte-exactly');
const NEW_MAIN =
  "async function main() {\n" +
  "  const words = wordsToGenerate();\n" +
  "\n" +
  "  if (process.env.WORD_AUDIO_DRY_RUN === '1') {\n" +
  "    console.log(`words: ${words.length}`);\n" +
  "    console.log(`extras: ${readStoryWords().length}`);\n" +
  "    console.log(`clips: ${clipsOnDisk().length}`);\n" +
  "    return;\n" +
  "  }\n" +
  "\n";
g1 = g1.replace(OLD_MAIN, NEW_MAIN);

const OLD_LOOP_HEAD = "  let wrote = 0;\n  let skipped = 0;\n\n  for (const lemma of words) {";
if (!g1.includes(OLD_LOOP_HEAD)) stop('the frozen loop head was not found byte-exactly');
g1 = g1.replace(OLD_LOOP_HEAD, "  let wrote = 0;\n  let skipped = 0;\n\n  try {\n    for (const lemma of words) {");

const OLD_LOOP_TAIL =
  "    const bytes = await synthesizeWithRetry(apiKey, lemma);\n" +
  "    writeFileSync(outPath, bytes);\n" +
  "    console.log(`wrote ${lemma} (${bytes.length} bytes)`);\n" +
  "    wrote++;\n" +
  "  }\n" +
  "\n" +
  "  console.log(`wrote ${wrote}, skipped ${skipped}`);\n" +
  "}\n";
if (!g1.includes(OLD_LOOP_TAIL)) stop('the frozen loop tail was not found byte-exactly');
const NEW_LOOP_TAIL =
  "      const bytes = await synthesizeWithRetry(apiKey, lemma);\n" +
  "      writeFileSync(outPath, bytes);\n" +
  "      console.log(`wrote ${lemma} (${bytes.length} bytes)`);\n" +
  "      wrote++;\n" +
  "    }\n" +
  "  } finally {\n" +
  "    // ALWAYS, even on a half-finished run: the manifest is a statement about\n" +
  "    // the disk, and it must be true of the disk we actually have. A run that\n" +
  "    // dies after 6 of 10 leaves 6 clips and a manifest that lists 6 -- honest,\n" +
  "    // just incomplete, and completed by re-running (this script is resumable).\n" +
  "    const m = writeManifestFromDisk();\n" +
  "    console.log(`manifest: ${m.count} words -> ${m.path}`);\n" +
  "  }\n" +
  "\n" +
  "  console.log(`wrote ${wrote}, skipped ${skipped}`);\n" +
  "}\n";
g1 = g1.replace(OLD_LOOP_TAIL, NEW_LOOP_TAIL);

// the loop body's two statements need one more level of indentation
const OLD_BODY =
  "    const outPath = path.join(WORDS_DIR, `${lemma}.aac`);\n" +
  "    if (existsSync(outPath)) {\n" +
  "      console.log(`skip ${lemma} (already exists)`);\n" +
  "      skipped++;\n" +
  "      continue;\n" +
  "    }\n";
if (!g1.includes(OLD_BODY)) stop('the frozen loop body was not found byte-exactly');
g1 = g1.replace(OLD_BODY,
  "      const outPath = path.join(WORDS_DIR, `${lemma}.aac`);\n" +
  "      if (existsSync(outPath)) {\n" +
  "        console.log(`skip ${lemma} (already exists)`);\n" +
  "        skipped++;\n" +
  "        continue;\n" +
  "      }\n");

// the header comment must stop claiming the list comes only from the bands
const OLD_HEAD = "// Derives the word list from the same allowed-vocabulary builder the story\n// generator uses (lib/story.js + data/band1.json + data/band2.json), then";
if (!g1.includes(OLD_HEAD)) stop('the frozen header comment was not found byte-exactly');
g1 = g1.replace(OLD_HEAD,
  "// Derives WHAT TO GENERATE from the same allowed-vocabulary builder the story\n" +
  "// generator uses (lib/story.js + data/band1.json + data/band2.json) UNION the\n" +
  "// explicit story-word extras in data/story-words.json, then");

if (g1.includes('deriveWordList')) stop('deriveWordList still appears in the file after the split');
if (/\r/.test(g1)) stop('a CR appeared in an LF file');
fs.writeFileSync(gPath, Buffer.from(g1, 'utf8'));

for (const [label, p] of [['data/story-words.json', swPath], ['scripts/build-word-audio.js', gPath]]) {
  const b = fs.readFileSync(p);
  let c = 0, l = 0, n = 0;
  for (const x of b) { if (x === 13) c++; if (x === 10) l++; if (x > 127) n++; }
  console.log(label.padEnd(30) + ' bytes=' + String(b.length) + ' CR=' + String(c) + ' LF=' + String(l) + ' nonASCII=' + String(n) + ' md5=' + md5(b));
}
console.log('APPLY-2.1-OK');
```

**THIS SCRIPT WAS RUN TODAY, on a byte-exact mirror of the real files outside the repository**
(`fs.copyFileSync`, md5-verified identical before the run — **never `git archive`, `git stash`,
a clone or a worktree, all of which re-apply `autocrlf` and silently flip every ending**, field
guide 4). Its output:

```
data/story-words.json          bytes=3 CR=0 LF=1 nonASCII=0 md5=58e0494c51d30eb3494f7c9198986bb9
scripts/build-word-audio.js    bytes=7718 CR=0 LF=209 nonASCII=3 md5=f100c881232989344a5e2d95452d9edf
APPLY-2.1-OK
```

and the patched generator was then **executed**:

```
$ WORD_AUDIO_DRY_RUN=1 OPENAI_API_KEY= node scripts/build-word-audio.js
words: 2254
extras: 0
clips: 0            <- 0 because the mirror holds no .aac files; the real tree gives 2254

wordsToGenerate() = 2254   bandWords() = 2254   readStoryWords() = 0
synthesizeWord exported = function     writeManifestFromDisk exported = function
deriveWordList gone = true
sorted disk list === current manifest, element for element : true
md5 of the manifest writeManifestFromDisk() would emit = 8735a3c499508b04415046e2be4ad159   <- unchanged
```

> **A DEFECT THIS SCRIPT HAD, FOUND BY RUNNING IT, RECORDED BECAUSE IT IS FIELD GUIDE 22(a) AGAIN.**
> The script ends with a guard: *"if the file still contains `deriveWordList`, stop."* On its first
> run it stopped — because **my own new comment named the old function**. The gate was right and the
> prose was the intruder, exactly as `awardTrophies` was in word-trophies. **The prose moved.** An
> executor who hits this must not weaken the guard.

**THE FOUR TESTS `tests/word-audio.test.js` MUST END WITH** (the file's five become seven):

1. *(unchanged)* `build-word-audio.js passes node --check`.
2. *(re-expressed)* **"the generator derives its word list from the band data and a data file, never
   a hardcoded list"** — keep every existing assertion (`buildAllowedSet`, `band1.json`,
   `band2.json`, `'A2'`, no `'apartment'`, no `'telecommunications'`) and **add**: the source
   contains `story-words.json`, and contains **none of the ten literals**
   `'after' 'deer' 'feet' 'glow' 'growl' 'harm' 'moon' 'nervous' 'scary' 'tight'`.
   *(Checked by running, not reading: all six original assertions still hold after the edit.)*
3. *(unchanged)* `the generator is resumable and retries`.
4. *(re-expressed)* `dry run reports the derived word count without a network call` — now asserts
   `words: 2254`, `extras: 0`, `clips: 2254` (step 2.6 moves the first and second to 2264 / 10).
5. **NEW — THE HONESTY INVARIANT.** *"the manifest is exactly the set of clips on disk, both
   directions"*: call the shipped `clipsOnDisk()`, parse the manifest, `deepStrictEqual` them, and
   **name the offenders** in the message. Instrument it: `assert.ok(manifest.length > 2000, …)` so
   a check that inspected nothing cannot pass (field guide 18).
6. **NEW — THE COVERAGE / DRIFT ALARM, re-expressed from the deleted test.** *"every word we intend
   to generate has a clip"*: `wordsToGenerate()` ⊆ `clipsOnDisk()`, offenders named. This is the old
   `deriveWordList() == disk` test's real property — *"add a word to a band JSON and this fails until
   the clip exists, instead of shipping a play button that silently does nothing"* — and it holds at
   this step precisely because the extras file is empty.
7. **NEW — FC-6, THE SPLIT GUARD.** *"no extra word re-routes a word she may already have"*: for
   every surface form in `manifest × {'', s, es, ed, ing, er, est, ly, ies}`, `resolveLemma` against
   the manifest **with** the extras must never return a **different non-null** lemma than it returns
   **without** them. **Print the number of forms observed** and assert it exceeds 2254 (field guide
   18). This is the executable form of the B2 ruling. **Measured today: 20 270 forms, 0 re-routes.**

**MANDATED FAIL-FIRST** (run BEFORE acceptance; restore after; record every observed line verbatim —
a mutation that does not fail is a **STOP**):

* **M2.1a — the honesty invariant must be able to fire.** Copy any one `.aac` to
  `public/audio/words/zzztemp.aac`, run `npm test`. Test 5 must fail naming `zzztemp` as a clip the
  manifest does not list. `rm` it, re-run, green.
* **M2.1b — the coverage alarm must be able to fire.** Put `["zzznotaword"]` in
  `data/story-words.json`, run `npm test`. Test 6 must fail naming `zzznotaword`. Restore `[]`.
* **M2.1c — the split guard must be able to fire, and this is the important one.** Put
  `["softly"]` in `data/story-words.json`, run `npm test`. Test 7 must fail with
  **`softly: soft -> softly`**. Restore `[]`. *(This is the B2 defect itself, reproduced on demand.)*
* **M2.1d — `readStoryWords()` must refuse rubbish.** Put `["deep breath"]` in the file and run
  `node -e` on the export: it must **throw**. Then `["cat","cat"]`: it must throw on the duplicate.
  Restore `[]`.

**FROZEN VALIDATION:** §VAL-F2 verbatim, then, in the SAME file:
```bash
case "$TOTAL"   in 371) ;; *) fail "expected 371 reported, got '$TOTAL'";; esac
case "$PLAN"    in 366) ;; *) fail "expected top-level plan 1..366, got '1..$PLAN'";; esac
case "$FAILED"  in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL"  in 371) ;; *) fail "APP_CODE=dummy: expected 371, got '$GTOTAL'";; esac
case "$GFAILED" in 0)   ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"    in 366) ;; *) fail "expected 366 flat, got '$FLAT'";; esac
case "$PUBN"    in 2372) ;; *) fail "step 2.1 must not touch public/: expected 2372 files, got '$PUBN'";; esac
case "$MAN" in "2254 2254 0 0 19942 8735a3c499508b04415046e2be4ad159") ;; *) fail "step 2.1 must be ARTIFACT-NEUTRAL; the manifest moved: $MAN";; esac
case "$SBSTATE" in FIXTURE) ;; *) fail "the dev sandbox must hold the synthetic fixture, got SB=$SBSTATE";; esac
case "$ENDS" in *"scripts/build-word-audio.js CRLF=0 LF=209"*) ;; *) fail "build-word-audio.js endings/size wrong: $ENDS";; esac
case "$ENDS" in *"public/styles.css CRLF=729 LF=0"*)      ;; *) fail "styles.css must be untouched this step";; esac
case "$ENDS" in *"public/views/reader.js CRLF=946 LF=0"*) ;; *) fail "reader.js must be untouched this step";; esac
case "$ENDS" in *"public/views/words.js CRLF=289 LF=0"*)  ;; *) fail "words.js must be untouched this step";; esac
case "$NA" in *"public/views/reader.js=750"*) ;; *) fail "reader.js non-ASCII moved this step: $NA";; esac
case "$NA" in *"public/views/words.js=461"*)  ;; *) fail "words.js non-ASCII moved this step: $NA";; esac
GMD5="$(md5sum scripts/build-word-audio.js | cut -d' ' -f1)"
case "$GMD5" in f100c881232989344a5e2d95452d9edf) ;; *) fail "build-word-audio.js is not the apply script's output: $GMD5";; esac
SWJ="$(md5sum data/story-words.json | cut -d' ' -f1)"
case "$SWJ" in 58e0494c51d30eb3494f7c9198986bb9) ;; *) fail "data/story-words.json must be [] at this step: $SWJ";; esac
# the two deleted names must be GONE, not aliased -- an alias preserves the ambiguity
DEAD="$(grep -c 'deriveWordList\|writeManifest(' scripts/build-word-audio.js || true)"
case "$DEAD" in 0) ;; *) fail "$DEAD occurrences of the old ambiguous names survive in the generator";; esac
case "$PORC" in " M scripts/build-word-audio.js
 M tests/word-audio.test.js
?? data/story-words.json") ;; *) fail "step 2.1 write set is wrong. got:
$PORC";; esac
exit $RC
```

**NON-GOALS:** no clip generated; no network call of any kind; no `public/` byte moves; no CSS; no
view touched; no `CACHE`; `data/band1.json` and `data/band2.json` untouched.

---

# STEP 2.2 — THE ONLY GATE ON THE MONEY, BUILT AND **SEEN TO FIRE** BEFORE ANY MONEY EXISTS

**GOAL:** `scripts/check-word-audio.mjs` implements design §11's four mechanical checks as a real
executable with a real exit code, plus the voice-drift control and the top-up lister. It is built
**four steps before the batch**, so the gate can be broken on purpose, watched to fail, and repaired
in a step where **nothing is at stake**.

**WHY THIS IS ITS OWN STEP AND WHY IT IS HERE.** The owner waived the listening gate (design §11), so
these four checks are the **only** thing standing between a broken clip and a child. A gate written
in the same step as the thing it gates is written from the same mental model as the thing it gates
(field guide 15's root cause). Building it against **fabricated broken inputs** — before a single
real new clip exists — breaks that coupling: at this step the checker has never seen a word of the
batch it will judge.

**TIER:** WORKER. **DEPENDS ON:** 2.1 (it imports `wordsToGenerate` and `clipsOnDisk`).

**REPO WRITE SET (exhaustive):**
* `scripts/check-word-audio.mjs` — **CREATE** (**LF**, pure ASCII).
* `tests/word-audio.test.js` — MODIFY (**LF**). **+4 flat tests → ledger 370 flat / 375 reported.**
* Nothing under `public/`. `PUBN=2372`, `MAN` unchanged.

**THE SCRIPT, verbatim.** Every threshold quotes the value measured over the 2254 shipped clips
beside it. **A threshold with no measurement behind it is a guess, and a guess in a gate is worse
than no gate.**

```js
// The four mechanical checks design.md section 11 (AMENDMENT #4) makes the ONLY
// gate on the audio batch, after the owner waived the listening gate.
//
// THERE IS NO ffprobe AND NO ffmpeg ON THE BUILD MACHINE. Duration is therefore
// COUNTED, not decoded: every clip is an ADTS-framed AAC stream, each frame
// header carries its own length, and every AAC frame is exactly 1024 samples, so
//     duration = frames * 1024 / sampleRate
// is exact. Walking the frame chain to the last byte is also the "must decode"
// check: a truncated file, an empty file, an HTML error body or a re-encode
// loses sync or leaves a tail, and this says at which byte.
//
// Every threshold below was derived from the 2254 clips already shipped, and the
// observed value is quoted beside it. A threshold with no measurement behind it
// is a guess, and a guess in a gate is worse than no gate.
//
// Usage:
//   node scripts/check-word-audio.mjs                    # the batch gate
//   node scripts/check-word-audio.mjs --dir <d> --manifest <f>   # any tree (used by the fail-first)
//   node scripts/check-word-audio.mjs --drift <lemma> <fresh.aac>
//   node scripts/check-word-audio.mjs --missing <profile.json>
//
// Exit 0 = every check passed. Exit 1 = at least one failed, and each failure is
// named with the word that caused it.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ---- thresholds, each with the value measured over the 2254 shipped clips ----
const SAMPLE_RATE = 24000;   // observed: 24000 on 2254/2254, no exceptions
const CHANNELS = 1;          // observed: 1 on 2254/2254
const MIN_BYTES = 4000;      // observed min 5238
const MIN_SECONDS = 0.60;    // observed min 0.683
const MAX_SECONDS = 3.60;    // observed max 3.243
const MIN_VOICED_SECONDS = 0.35; // observed min 0.555; 0 clips below 0.40
const VOICED_FRAME_BYTES = 100;  // a digitally silent AAC frame is ~11 bytes
const MIN_BPS = 3500;        // observed min 4451  (VBR: this is a sanity band, not an identity)
const MAX_BPS = 13000;       // observed max 10695
// drift tolerances. THESE ARE A JUDGEMENT, NOT A MEASUREMENT: the run-to-run
// variance of gpt-4o-mini-tts cannot be measured without spending money, so the
// band is set wide enough that only a GROSS change (a different voice, a
// different speaking rate, a different encoder) can trip it. See the plan, SK-F2-6.
const DRIFT_MIN = 0.5;
const DRIFT_MAX = 2.0;

const ADTS_RATES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350, 0, 0, 0];

export function probeAac(buf) {
  let off = 0, frames = 0, voiced = 0, sampleRate = 0, channels = 0, error = null;
  while (off + 7 <= buf.length) {
    if (buf[off] !== 0xff || (buf[off + 1] & 0xf0) !== 0xf0) { error = `lost ADTS sync at byte ${off}`; break; }
    const profile = (buf[off + 2] >> 6) & 0x03;             // 0 = AAC Main, 1 = AAC LC
    const srIdx = (buf[off + 2] >> 2) & 0x0f;
    const chCfg = ((buf[off + 2] & 0x01) << 2) | ((buf[off + 3] >> 6) & 0x03);
    const len = ((buf[off + 3] & 0x03) << 11) | (buf[off + 4] << 3) | ((buf[off + 5] >> 5) & 0x07);
    if (len < 7) { error = `impossible frame length ${len} at byte ${off}`; break; }
    if (off + len > buf.length) {
      error = `TRUNCATED -- the frame at byte ${off} declares ${len} bytes but only ${buf.length - off} remain`;
      break;
    }
    if (frames === 0) {
      sampleRate = ADTS_RATES[srIdx];
      channels = chCfg;
      if (profile !== 1) { error = `not AAC-LC (ADTS profile bits ${profile})`; break; }
    } else if (ADTS_RATES[srIdx] !== sampleRate || chCfg !== channels) {
      error = `format changes mid-file at byte ${off}`; break;
    }
    if (len > VOICED_FRAME_BYTES) voiced++;
    frames++;
    off += len;
  }
  if (error === null && frames === 0) error = 'no ADTS frames at all';
  if (error === null && off !== buf.length) error = `${buf.length - off} trailing bytes after the last frame`;
  const seconds = sampleRate ? (frames * 1024) / sampleRate : 0;
  const voicedSeconds = sampleRate ? (voiced * 1024) / sampleRate : 0;
  return { bytes: buf.length, frames, voiced, sampleRate, channels, seconds, voicedSeconds, error };
}

function fail(list, word, message) { list.push(`${word}: ${message}`); }

export function checkClip(word, buf) {
  const out = [];
  const p = probeAac(buf);
  if (p.error) { fail(out, word, `DOES NOT DECODE -- ${p.error}`); return { p, failures: out }; }
  if (p.sampleRate !== SAMPLE_RATE) fail(out, word, `sample rate ${p.sampleRate}, every shipped clip is ${SAMPLE_RATE}`);
  if (p.channels !== CHANNELS) fail(out, word, `${p.channels} channels, every shipped clip is ${CHANNELS}`);
  if (p.bytes < MIN_BYTES) fail(out, word, `${p.bytes} bytes, below the ${MIN_BYTES} floor (smallest shipped clip 5238)`);
  if (p.voicedSeconds < MIN_VOICED_SECONDS) fail(out, word, `SILENT -- only ${p.voicedSeconds.toFixed(3)}s of voiced audio, floor ${MIN_VOICED_SECONDS} (smallest shipped 0.555)`);
  if (p.seconds < MIN_SECONDS || p.seconds > MAX_SECONDS) fail(out, word, `implausible duration ${p.seconds.toFixed(3)}s, envelope ${MIN_SECONDS}..${MAX_SECONDS} (shipped 0.683..3.243)`);
  const bps = p.seconds ? p.bytes / p.seconds : 0;
  if (bps < MIN_BPS || bps > MAX_BPS) fail(out, word, `implausible bitrate ${bps.toFixed(0)} B/s, band ${MIN_BPS}..${MAX_BPS} (shipped 4451..10695)`);
  return { p, failures: out };
}

function loadWordList(file) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(raw)) throw new Error(`${file} is not a JSON array`);
  return raw;
}

function batch(dir, manifestPath, generationPath) {
  const failures = [];
  let observedClips = 0;

  const manifest = loadWordList(manifestPath);
  const files = readdirSync(dir).filter((f) => f.endsWith('.aac'));
  const clips = new Set(files.map((f) => f.slice(0, -4)));

  // CHECK 4 -- manifest/file correspondence, BOTH directions, offenders named.
  const dead = manifest.filter((w) => !clips.has(w));
  const orphan = [...clips].filter((w) => !manifest.includes(w));
  for (const w of dead) fail(failures, w, 'IN THE MANIFEST WITH NO CLIP -- this is a dead speaker button');
  for (const w of orphan) fail(failures, w, 'a clip on disk that the manifest does not list');

  // CHECKS 2 and 3 -- every clip decodes, is not silent, and is plausible.
  for (const f of files.sort()) {
    observedClips++;
    const word = f.slice(0, -4);
    const r = checkClip(word, readFileSync(path.join(dir, f)));
    for (const m of r.failures) failures.push(m);
  }

  // COVERAGE -- everything we said we would generate exists. This is the drift
  // alarm the old deriveWordList() test carried: add a word to a band or to
  // data/story-words.json and this fails until the clip exists.
  let observedTargets = 0;
  if (generationPath) {
    const targets = generationPath;
    observedTargets = targets.length;
    for (const w of targets) if (!clips.has(w)) fail(failures, w, 'a generation target with no clip on disk');
  }

  console.log(`OBSERVED: ${observedClips} clips, ${manifest.length} manifest entries, ${observedTargets} generation targets`);
  if (observedClips === 0) { console.log('FAIL: observed 0 clips -- this check inspected nothing'); return 1; }
  if (failures.length === 0) { console.log(`WORD AUDIO OK: ${observedClips} clips, ${manifest.length} manifest entries`); return 0; }
  for (const m of failures.slice(0, 40)) console.log('FAIL: ' + m);
  if (failures.length > 40) console.log(`FAIL: ... and ${failures.length - 40} more`);
  console.log(`${failures.length} FAILURES`);
  return 1;
}

function drift(lemma, freshPath, dir) {
  const shippedPath = path.join(dir, `${lemma}.aac`);
  if (!existsSync(shippedPath)) { console.log(`FAIL: there is no shipped clip for "${lemma}" to control against`); return 1; }
  if (!existsSync(freshPath)) { console.log(`FAIL: the control clip ${freshPath} was not written`); return 1; }
  const resolvedFresh = path.resolve(freshPath);
  const publicDir = path.join(ROOT, 'public');
  if (resolvedFresh.startsWith(publicDir)) {
    console.log(`FAIL: the control clip must be written OUTSIDE public/, got ${resolvedFresh}`);
    return 1;
  }
  const shipped = probeAac(readFileSync(shippedPath));
  const fresh = checkClip(`${lemma} (control)`, readFileSync(freshPath));
  const out = [];
  for (const m of fresh.failures) out.push(m);
  const f = fresh.p;
  if (!f.error) {
    if (f.sampleRate !== shipped.sampleRate) out.push(`sample rate moved ${shipped.sampleRate} -> ${f.sampleRate}`);
    if (f.channels !== shipped.channels) out.push(`channel count moved ${shipped.channels} -> ${f.channels}`);
    const dur = f.seconds / shipped.seconds;
    const byt = f.bytes / shipped.bytes;
    const voi = shipped.voicedSeconds ? f.voicedSeconds / shipped.voicedSeconds : 0;
    console.log(`DRIFT CONTROL "${lemma}":`);
    console.log(`  shipped  ${shipped.bytes} B  ${shipped.seconds.toFixed(3)}s  voiced ${shipped.voicedSeconds.toFixed(3)}s  ${shipped.sampleRate}Hz x${shipped.channels}`);
    console.log(`  fresh    ${f.bytes} B  ${f.seconds.toFixed(3)}s  voiced ${f.voicedSeconds.toFixed(3)}s  ${f.sampleRate}Hz x${f.channels}`);
    console.log(`  ratios   duration ${dur.toFixed(3)}  bytes ${byt.toFixed(3)}  voiced ${voi.toFixed(3)}   (band ${DRIFT_MIN}..${DRIFT_MAX})`);
    if (dur < DRIFT_MIN || dur > DRIFT_MAX) out.push(`duration ratio ${dur.toFixed(3)} is outside ${DRIFT_MIN}..${DRIFT_MAX}`);
    if (byt < DRIFT_MIN || byt > DRIFT_MAX) out.push(`byte ratio ${byt.toFixed(3)} is outside ${DRIFT_MIN}..${DRIFT_MAX}`);
    if (voi < DRIFT_MIN || voi > DRIFT_MAX) out.push(`voiced ratio ${voi.toFixed(3)} is outside ${DRIFT_MIN}..${DRIFT_MAX}`);
  }
  if (out.length === 0) { console.log('DRIFT CONTROL OK -- the model behind the fixed name has not moved detectably'); return 0; }
  for (const m of out) console.log('FAIL: ' + m);
  console.log('STOP: the voice-drift control failed. Do NOT run the batch. Report and escalate.');
  return 1;
}

function missing(profilePath, dir) {
  // The routine top-up lister. Reads a SAVED capture, never the live service
  // (field guide 3: GET /api/profile CREATES one). Writes nothing.
  const clips = new Set(readdirSync(dir).filter((f) => f.endsWith('.aac')).map((f) => f.slice(0, -4)));
  const p = JSON.parse(readFileSync(profilePath, 'utf8'));
  const profile = p && p.data ? p.data : p;
  const want = new Set();
  for (const k of Object.keys(profile.words || {})) want.add(String(k).toLowerCase());
  for (const ch of (profile.story && profile.story.chapters) || []) {
    for (const g of ch.glossary || []) if (g && typeof g.word === 'string') want.add(g.word.toLowerCase());
  }
  const WORD_RE = /^[a-z]+(?:'[a-z]+)?$/;
  const gaps = [...want].filter((w) => !clips.has(w)).sort();
  const usable = gaps.filter((w) => WORD_RE.test(w));
  const unusable = gaps.filter((w) => !WORD_RE.test(w));
  console.log(`OBSERVED: ${want.size} distinct words (dictionary keys + chapter glossaries), ${clips.size} clips on disk`);
  console.log(`WITHOUT A CLIP: ${gaps.length}`);
  console.log(`  add to data/story-words.json (${usable.length}): ${usable.join(' ') || '(none)'}`);
  console.log(`  cannot ever be a lemma file (${unusable.length}): ${unusable.join(' | ') || '(none)'}`);
  console.log('This script wrote nothing.');
  return 0;
}

async function main(argv) {
  const REAL_DIR = path.join(ROOT, 'public', 'audio', 'words');
  let dir = REAL_DIR;
  let manifestPath = null;
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dir') dir = argv[++i];
    else if (argv[i] === '--manifest') manifestPath = argv[++i];
    else rest.push(argv[i]);
  }
  if (manifestPath === null) manifestPath = path.join(dir, 'index.json');

  if (rest[0] === '--drift') return drift(rest[1], rest[2], dir);
  if (rest[0] === '--missing') return missing(rest[1], dir);

  // COVERAGE is asserted only against the real tree, and it calls the generator's
  // OWN wordsToGenerate() rather than re-deriving the list here. Verifying code
  // against a re-implementation of itself is field-guide lesson 2's cardinal sin.
  // Importing build-word-audio.js spends NOTHING: its isDirectRun guard means
  // main() only runs when it is the process entry point.
  let targets = null;
  if (path.resolve(dir) === path.resolve(REAL_DIR)) {
    const gen = await import(pathToFileURL(path.join(ROOT, 'scripts', 'build-word-audio.js')).href);
    targets = gen.wordsToGenerate();
  }
  return batch(dir, manifestPath, targets);
}

const isDirectRun = process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) process.exit(await main(process.argv.slice(2)));
```

**THIS SCRIPT WAS RUN TODAY, four ways.**

**(1) The real tree — the positive control.** *(field guide, the phase-1 lesson: after writing any
gate, ask what the CORRECT tree looks like to it, and confirm it passes on that too.)*

```
$ node scripts/check-word-audio.mjs --dir public/audio/words --manifest public/audio/words/index.json
OBSERVED: 2254 clips, 2254 manifest entries, 0 generation targets
WORD AUDIO OK: 2254 clips, 2254 manifest entries
EXIT=0                                              (1.6 s wall clock for 26 MB)
```

**(2) A deliberately broken tree — every check seen to fire.** Eight fixtures were fabricated
outside the repo: a valid ADTS stream of **pure digital-silence frames**; a real clip **truncated**;
an **empty** file; an **HTML 502 body** saved as `.aac` (a real TTS failure mode); **three clips
concatenated**; a real clip with **every frame header re-labelled 44100 Hz**; one **healthy** clip so
the sweep is not vacuous; plus a manifest naming a word with **no file** and omitting a file that
**does** exist.

```
OBSERVED: 8 clips, 8 manifest entries, 0 generation targets
FAIL: nosuchword: IN THE MANIFEST WITH NO CLIP -- this is a dead speaker button
FAIL: orphan: a clip on disk that the manifest does not list
FAIL: empty: DOES NOT DECODE -- no ADTS frames at all
FAIL: htmlbody: DOES NOT DECODE -- lost ADTS sync at byte 0
FAIL: silent: 440 bytes, below the 4000 floor (smallest shipped clip 5238)
FAIL: silent: SILENT -- only 0.000s of voiced audio, floor 0.35 (smallest shipped 0.555)
FAIL: silent: implausible bitrate 258 B/s, band 3500..13000 (shipped 4451..10695)
FAIL: toolong: implausible duration 4.224s, envelope 0.6..3.6 (shipped 0.683..3.243)
FAIL: truncated: DOES NOT DECODE -- TRUNCATED -- the frame at byte 11784 declares 356 bytes but only 156 remain
FAIL: wrongrate: sample rate 44100, every shipped clip is 24000
FAIL: wrongrate: implausible bitrate 15843 B/s, band 3500..13000 (shipped 4451..10695)
11 FAILURES
EXIT=1
```

> **TWO DEFECTS IN THIS GATE, FOUND BY RUNNING IT, FIXED, AND RE-RUN.** (a) The truncated fixture
> first reported **`-200 trailing bytes`** — a negative count. The check *fired*, but its message
> lied about why; the walker was overshooting the buffer on the last frame. Now it says which frame
> declares how much and how much is left. (b) The orphan clause never fired on the first fixture set
> because I had not built an orphan — **the fixture was wrong, not the check.** Both are recorded
> because a gate that fires with the wrong reason is how an executor gets sent to the wrong address.

**(3) The drift control, both ways.**

```
$ ... --drift cat drift/clean.aac        (a byte-copy of the shipped clip)
  ratios   duration 1.000  bytes 1.000  voiced 1.000   (band 0.5..2)
DRIFT CONTROL OK -- the model behind the fixed name has not moved detectably     EXIT=0

$ ... --drift cat drift/drifted.aac      (three copies concatenated)
  ratios   duration 3.000  bytes 3.000  voiced 3.000   (band 0.5..2)
FAIL: cat (control): implausible duration 4.224s, envelope 0.6..3.6
FAIL: duration ratio 3.000 is outside 0.5..2
FAIL: byte ratio 3.000 is outside 0.5..2
FAIL: voiced ratio 3.000 is outside 0.5..2
STOP: the voice-drift control failed. Do NOT run the batch. Report and escalate.   EXIT=1

$ ... --drift cat drift/nope.aac
FAIL: the control clip drift/nope.aac was not written                              EXIT=1
```

**(4) A healthy two-clip tree — the small positive control**, to prove the checks are not merely
passing because 2254 inputs drown one failure: `OBSERVED: 2 clips, 2 manifest entries` → exit 0.

**THE FOUR TESTS `tests/word-audio.test.js` GAINS** (all execute the shipped module; none is a
source needle):

8. **`probeAac` reads a real shipped clip correctly** — import `probeAac`, run it on
   `public/audio/words/cat.aac`, assert `{sampleRate: 24000, channels: 1, frames: 33, error: null}`
   and `seconds` within 0.001 of **1.408**.
9. **`probeAac` names each way a clip can be broken** — build the four buffers **in the test**
   (empty; an HTML body; a real clip truncated by 200 bytes; a synthetic all-silence ADTS stream)
   and assert each `error` / metric. **Instrument:** assert the test drove exactly 4 inputs.
10. **`checkClip` passes a real clip and fails a silent one** — the seam between the probe and the
    thresholds, executed. Assert the silent one's failure message contains `SILENT`.
11. **the script itself exits 0 on the real tree and 1 on a broken temp tree** — `spawnSync` it
    twice: once bare, once with `--dir`/`--manifest` pointed at a temp directory (`os.tmpdir()`,
    **never inside the repo** — field guide 4) holding one healthy clip and a manifest naming a
    second word that is not there. Assert `status` 0 then 1, and that the failing run's stdout names
    the missing word. *(This is the cry-wolf control for the whole gate: it proves the exit code —
    the only thing step 2.6 acts on — is real.)*

**MANDATED FAIL-FIRST:**

* **M2.2a — the thresholds must not be decoration.** Temporarily set `MIN_VOICED_SECONDS = 0` in the
  script; test 10 must fail. Restore.
* **M2.2b — the "observed 0" trap must fire.** Point `--dir` at an empty temp directory: the script
  must print `FAIL: observed 0 clips -- this check inspected nothing` and exit **1**, not exit 0 with
  a cheerful `WORD AUDIO OK`. *(Field guide 18: a sweep that observed nothing is decoration, and
  this one refuses to be.)*
* **M2.2c — the drift control must refuse to write inside `public/`.** Run
  `--drift cat public/audio/words/cat.aac`; it must print
  `FAIL: the control clip must be written OUTSIDE public/` and exit 1. *(This is the mechanical
  guarantee behind design §11's "the existing clip is never overwritten".)*

**FROZEN VALIDATION:** §VAL-F2 verbatim, then:
```bash
case "$TOTAL"  in 375) ;; *) fail "expected 375 reported, got '$TOTAL'";; esac
case "$PLAN"   in 370) ;; *) fail "expected top-level plan 1..370, got '1..$PLAN'";; esac
case "$FAILED" in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL" in 375) ;; *) fail "APP_CODE=dummy: expected 375, got '$GTOTAL'";; esac
case "$GFAILED" in 0)  ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"   in 370) ;; *) fail "expected 370 flat, got '$FLAT'";; esac
case "$PUBN"   in 2372) ;; *) fail "step 2.2 must not touch public/: got '$PUBN'";; esac
case "$MAN" in "2254 2254 0 0 19942 8735a3c499508b04415046e2be4ad159") ;; *) fail "the manifest moved in step 2.2: $MAN";; esac
case "$SBSTATE" in FIXTURE) ;; *) fail "SB=$SBSTATE";; esac
# the gate must PASS on the real tree, and it must have OBSERVED something
CWA="$(node scripts/check-word-audio.mjs 2>&1)"; CWASTAT=$?
case "$CWASTAT" in 0) ;; *) fail "check-word-audio.mjs exited $CWASTAT on a clean tree: $CWA";; esac
case "$CWA" in *"OBSERVED: 2254 clips, 2254 manifest entries, 2254 generation targets"*) ;; *) fail "check-word-audio observed the wrong thing: $CWA";; esac
case "$CWA" in *"WORD AUDIO OK: 2254 clips"*) ;; *) fail "check-word-audio did not print WORD AUDIO OK: $CWA";; esac
# it must be pure ASCII and LF, and it must not have learned the ten words
CWNA="$(node -e 'const b=require("fs").readFileSync("scripts/check-word-audio.mjs");let n=0;for(const x of b) if(x>127) n++;console.log(String(n));')"
case "$CWNA" in 0) ;; *) fail "scripts/check-word-audio.mjs has $CWNA non-ASCII bytes";; esac
CWCR="$(tr -dc '\r' < scripts/check-word-audio.mjs | wc -c | tr -d ' ')"
case "$CWCR" in 0) ;; *) fail "scripts/check-word-audio.mjs acquired $CWCR CR bytes";; esac
case "$PORC" in " M tests/word-audio.test.js
?? scripts/check-word-audio.mjs") ;; *) fail "step 2.2 write set is wrong. got:
$PORC";; esac
exit $RC
```

**NON-GOALS:** no clip generated; no network call; no `--drift` run against the real API (that is
step 2.6); no `public/` byte moves; no view, no CSS.

---

# STEP 2.3 — THE FROZEN MARKER LANDS IN THE GLOBALLY LINKED SHEET, AND IN HER DICTIONARY

**GOAL:** `public/styles.css` gains design §8's two FROZEN rules, **extracted from `design.md` by
script**, plus one small unfrozen layout wrapper. `public/views/words.js` gains an exported
`saySlot(canSay, lemma)` and calls it, so a row we cannot speak shows a **non-pressable** crossed-out
speaker with the caption `coming soon` instead of nothing. `tests/words-ui.test.js` **re-expresses**
the pin that this deliberately overturns, and gains three tests.

**FIELD GUIDE 14 IS THE REASON THE CSS GOES WHERE IT GOES.** Every view here emits
`<style>${VIEW_STYLE}</style>` inside its own `container.innerHTML`, so view CSS exists only while
that view is mounted. `.btn-say` already lives in `public/styles.css`, the globally linked sheet, and
`.btn-say.na` / `.btn-say-soon` / `.say-soon-wrap` must live there too — **both** views need them.
Putting them in `words.js`'s `VIEW_STYLE` would leave the reader's popup marker unstyled, on the one
route it matters on, and 375 tests would pass. **Gated:** the rules must be in `styles.css` **and**
absent from every view's `VIEW_STYLE`.

**TIER:** WORKER. **DEPENDS ON:** nothing (independent of 2.1/2.2; ordered here so the UI is honest
before any money is spent).

**REPO WRITE SET (exhaustive):**
* `public/styles.css` — MODIFY (**CRLF**, 729 → **748** lines, 17846 → **18866** bytes,
  md5 **`e7beb1087006b34b2141892d71410487`**, non-ASCII stays **0**).
* `public/views/words.js` — MODIFY (**CRLF**, 289 → **300** lines, 9072 → **9825** bytes,
  md5 **`4626c8f47f52e9070e05dfafe202f3f6`**, non-ASCII 461 → **465**).
* `tests/words-ui.test.js` — MODIFY (**LF**). **+3 flat tests → ledger 373 flat / 378 reported.**
* `PUBN` stays **2372** (no file created or deleted under `public/`). The manifest does not move.

**THE COLLISION, RULED — field guide 22.** `tests/words-ui.test.js:181`:

> `assert.ok(!unknownRow.includes('btn-say'), 'no play button on a row we cannot speak');`

**This pin asserts exactly the property design §8 deliberately overturns.** It names a **property**,
not a spelling, so it is **RE-EXPRESSED, never deleted**, and it must be **seen to fail first**:

> a row we cannot speak shows a **non-pressable** `btn-say na` with `coming soon` and **no
> `data-say`** — which is the honest 2026-08-02 form of the same sentence the 2026-08-01 pin was
> making: *nothing on this row can play a sound that does not exist.*

**Verified today on the patched tree:** the old assertion fails (`unknownRow` now contains
`btn-say na`) and the re-expressed one passes.

**THE APPLY SCRIPT, verbatim.** Write it to `C:/Users/dkreinov/finish-audio/apply-2.3.cjs` and run
`node C:/Users/dkreinov/finish-audio/apply-2.3.cjs C:/Users/dkreinov/claude/english-app`.
It **extracts the frozen CSS out of `design.md`**, refuses to run if those bytes are not
`6e43cb5e463520f5d277d7d02c5ff26c`, **converts LF → CRLF** because `styles.css` is CRLF, and
**slices the Hebrew `aria-label` and the speaker glyph out of `words.js`'s own bytes** rather than
carrying them through any transport (field guide 8).

````js
// word-finish step 2.3 -- the FROZEN marker lands in the globally linked sheet and
// in the words list. Byte-preserving: every file is read and written as BYTES, and
// the CRLF files stay CRLF (field guide 4 + 16; core.autocrlf=true makes an
// Edit-tool insert silently flip a whole file and git diff hides the damage).
//
// Usage:  node apply-2.3.cjs <repo-root>
// Idempotent-refusing: it STOPS if the marker is already present.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.argv[2];
if (!ROOT) { console.log('STOP: usage: node apply-2.3.cjs <repo-root>'); process.exit(1); }
const P = (p) => path.join(ROOT, p);

function readBytes(p) { return fs.readFileSync(p); }
function writeBytes(p, b) { fs.writeFileSync(p, b); }
function md5(b) { return crypto.createHash('md5').update(b).digest('hex'); }
function ends(b) { let cr = 0, lf = 0; for (const x of b) { if (x === 13) cr++; if (x === 10) lf++; } return cr + '/' + lf; }
function nonAscii(b) { let n = 0; for (const x of b) if (x > 127) n++; return n; }
function stop(m) { console.log('STOP: ' + m); process.exit(1); }

// ---------------------------------------------------------------- 1. styles.css
// The two rules are EXTRACTED FROM design.md BY SCRIPT and never retyped
// (design §8: "copy it from there, do not retype it").
const design = readBytes(P('.oplan/word-finish/design.md')).toString('utf8');
const cssBlocks = [...design.matchAll(/```css\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
if (cssBlocks.length !== 2) stop('design.md must contain exactly 2 ```css blocks, found ' + cssBlocks.length);
const frozenLF = cssBlocks[0] + '\n' + cssBlocks[1];
if (md5(Buffer.from(frozenLF, 'utf8')) !== '6e43cb5e463520f5d277d7d02c5ff26c') {
  stop('the frozen CSS extracted from design.md is not the bytes this plan measured: ' + md5(Buffer.from(frozenLF, 'utf8')));
}
// styles.css is CRLF. Convert, or the file becomes MIXED, which is a defect.
const frozenCRLF = frozenLF.replace(/\r?\n/g, '\r\n');

const WRAP =
  '/* word-finish phase 2. The two rules above are FROZEN by the owner (design.md section 8,\r\n' +
  '   AMENDMENT #2) and were copied out of design.md by script, never retyped. The rule\r\n' +
  '   below is NOT frozen: it is the layout wrapper the frozen caption needs, because\r\n' +
  '   .word-card-actions is a flex ROW and the caption must sit UNDER the button in both\r\n' +
  '   views. It declares no colour, so it cannot move the contrast anchor. */\r\n' +
  '.say-soon-wrap {\r\n' +
  '  display: inline-flex;\r\n' +
  '  flex-direction: column;\r\n' +
  '  align-items: center;\r\n' +
  '}\r\n';

const cssPath = P('public/styles.css');
const css0 = readBytes(cssPath);
const cssStr = css0.toString('utf8');
if (cssStr.includes('.btn-say.na')) stop('public/styles.css already contains .btn-say.na -- refusing to double-apply');
const ANCHOR = '.btn-know {';
const at = cssStr.indexOf(ANCHOR);
if (at < 0) stop('anchor ".btn-know {" not found in styles.css');
if (cssStr.indexOf(ANCHOR, at + 1) >= 0) stop('anchor ".btn-know {" is not unique in styles.css');
const css1 = Buffer.from(cssStr.slice(0, at) + frozenCRLF + WRAP + '\r\n' + cssStr.slice(at), 'utf8');
writeBytes(cssPath, css1);

// ---------------------------------------------------------------- 2. views/words.js
// The Hebrew aria-label and the speaker glyph are MOVED, never retyped: both are
// sliced out of the file's own bytes (field guide 8).
const wPath = P('public/views/words.js');
const w0 = readBytes(wPath);
const w = w0.toString('utf8');
if (w.includes('saySlot')) stop('public/views/words.js already contains saySlot -- refusing to double-apply');

const OLD_W =
  '      const sayLemma = allowedWords ? resolveLemma(lemma, allowedWords) : lemma;\r\n' +
  '      const sayHtml = sayLemma\r\n' +
  '        ? `<button class="btn-say" type="button" data-say="${escapeHtml(sayLemma)}" aria-label="';
const oldAt = w.indexOf(OLD_W);
if (oldAt < 0) stop('the frozen words.js anchor block was not found byte-exactly');
if (w.indexOf(OLD_W, oldAt + 1) >= 0) stop('the words.js anchor block is not unique');
// slice the Hebrew label and the glyph out of the ORIGINAL bytes
const labStart = oldAt + OLD_W.length;
const labEnd = w.indexOf('">', labStart);
const HE = w.slice(labStart, labEnd);                       // the aria-label, MOVED
const glyphStart = labEnd + 2;
const glyphEnd = w.indexOf('</button>', glyphStart);
const GLYPH = w.slice(glyphStart, glyphEnd);                // the speaker glyph, MOVED
if (HE.length === 0 || GLYPH.length === 0) stop('failed to slice the Hebrew label or the glyph out of words.js');

const SAY_SLOT =
  '// word-finish phase 2 (design section 8, FROZEN). canSay gates the button\'s STATE, no\r\n' +
  '// longer its EXISTENCE. A word we cannot speak still shows the speaker, crossed out\r\n' +
  '// by CSS, with the ASCII caption "coming soon" under it -- so she can tell "no sound\r\n' +
  '// for THIS word yet" from "this app has no sound". The pressable branch still implies\r\n' +
  '// a clip exists: it is the only branch that carries data-say, and the [data-say]\r\n' +
  '// handler is the only thing that can play anything.\r\n' +
  'export function saySlot(canSay, lemma) {\r\n' +
  '  if (canSay) {\r\n' +
  '    return `<button class="btn-say" type="button" data-say="${escapeHtml(lemma)}" aria-label="' + HE + '">' + GLYPH + '</button>`;\r\n' +
  '  }\r\n' +
  '  return `<span class="say-soon-wrap"><button class="btn-say na" type="button" disabled aria-hidden="true">' + GLYPH + '</button><span class="btn-say-soon">coming soon</span></span>`;\r\n' +
  '}\r\n' +
  '\r\n';

const NEW_W =
  '      const sayLemma = allowedWords ? resolveLemma(lemma, allowedWords) : lemma;\r\n' +
  '      const sayHtml = saySlot(Boolean(sayLemma), sayLemma || lemma);';
const oldFullEnd = w.indexOf('        : "";', oldAt) + '        : "";'.length;
if (oldFullEnd < OLD_W.length) stop('could not find the end of the words.js sayHtml ternary');
let w1 = w.slice(0, oldAt) + NEW_W + w.slice(oldFullEnd);
// insert saySlot immediately before "export function renderList("
const RL = 'export function renderList(';
const rlAt = w1.indexOf(RL);
if (rlAt < 0) stop('renderList not found in words.js');
if (w1.indexOf(RL, rlAt + 1) >= 0) stop('renderList anchor is not unique in words.js');
w1 = w1.slice(0, rlAt) + SAY_SLOT + w1.slice(rlAt);
writeBytes(wPath, Buffer.from(w1, 'utf8'));

// ---------------------------------------------------------------- report
for (const [label, p] of [['public/styles.css', cssPath], ['public/views/words.js', wPath]]) {
  const b = readBytes(p);
  console.log(label.padEnd(24) + ' bytes=' + String(b.length) + ' CR/LF=' + ends(b) + ' nonASCII=' + String(nonAscii(b)) + ' md5=' + md5(b));
}
console.log('APPLY-2.3-OK');
````

**THIS SCRIPT WAS RUN TODAY** on a byte-exact mirror outside the repository:

```
public/styles.css        bytes=18866 CR/LF=758/758 nonASCII=0   md5=e7beb1087006b34b2141892d71410487
public/views/words.js    bytes=9825  CR/LF=300/300 nonASCII=465 md5=4626c8f47f52e9070e05dfafe202f3f6
APPLY-2.3-OK
$ node --check public/views/words.js     -> syntax OK
```

*(`CR/LF=758/758` counts CR **bytes** and LF **bytes**; the ENDINGS line in §VAL-F2 counts CRLF
**line terminators**, which is 748 plus the 10 CRLFs inside the inserted block's own body. Both were
measured; they are two counts of two different things and they must both hold.)*

The patched `renderList` was then **executed**:

```
saySlot(true,"cat")   = <button class="btn-say" type="button" data-say="cat" aria-label="[HE]">[SPEAKER]</button>
saySlot(false,"ellie")= <span class="say-soon-wrap"><button class="btn-say na" type="button" disabled
                        aria-hidden="true">[SPEAKER]</button><span class="btn-say-soon">coming soon</span></span>
unknown row has btn-say na   = true      unknown row has coming soon = true
unknown row has data-say     = false     <-- THE HONESTY PROPERTY
feels row speaks feel        = true      never points at feels       = true
manifest-not-loaded: 3 live buttons, 0 "na" markers   <-- the optimistic branch is preserved exactly
```

and `scripts/check-contrast.mjs` was run against the patched stylesheet: **`ALL PASS`, 58 PASS lines.**

**FOUR IMPLEMENTATION DECISIONS, STATED BECAUSE THEY ARE NOT IN DESIGN §8 AND AN EXECUTOR MUST NOT
RE-INVENT THEM:**

1. **`.say-soon-wrap` is a NEW, UNFROZEN rule** — `display: inline-flex; flex-direction: column;
   align-items: center;`. It exists because `.word-card-actions` is a **flex row**, so without it the
   frozen caption would sit *beside* the button rather than under it, and `margin-top: 7px` would do
   nothing. It declares no colour, so it cannot move the contrast anchor. It is commented in the
   stylesheet as not frozen.
2. **The caption is a `<span>`, not a `<p>`.** A `<p>` inside a `<span>` is invalid HTML — `p` is
   flow content and `span`'s content model is phrasing content, so a browser reparents the `<p>` out
   of the wrapper and the layout breaks. As a **flex item** the `<span>` is blockified anyway, so
   `margin-top: 7px` works and the frozen rule is untouched.
3. **The `na` button carries `disabled` and `aria-hidden="true"`, and NO `aria-label`.** The existing
   label is Hebrew for "listen to the word", which would be a **lie** on a control that cannot play
   anything — and **no new Hebrew may be authored** (design §5, FC-7). Hiding the decorative glyph
   and letting the visible ASCII `coming soon` carry the meaning is honest, needs no new string, and
   keeps the non-ASCII byte count pinned.
4. **The `na` branch carries no `data-say` at all**, which is what actually makes it unpressable:
   the player binds to `[data-say]`. `disabled` is the second, independent mechanism.

**THE THREE TESTS `tests/words-ui.test.js` GAINS** (plus the re-expression above):

* **A — the frozen rules are in the globally linked sheet and in NO view's `VIEW_STYLE`**
  (field guide 14). For each of `.btn-say.na`, `.btn-say.na::after`, `.btn-say-soon`,
  `.say-soon-wrap`: present in `public/styles.css`; and for each of `words.js`, `reader.js`,
  `placement.js`, `parent.js`, `trophies.js`, `home.js`, extract `VIEW_STYLE` and assert **none**
  contains `btn-say`. **Instrument:** assert 6 view files were actually examined.
* **B — the frozen CSS is byte-for-byte what `design.md` declares.** Read `design.md` in the test,
  pull the two ```` ```css ```` blocks with the same regex the apply script uses, convert LF→CRLF,
  and assert `styles.css` contains the result **as a contiguous substring**. Assert the extraction's
  md5 is `6e43cb5e463520f5d277d7d02c5ff26c`. *(This makes FC-5 unfalsifiable: a "tidy-up" of the
  owner's frozen rules fails the suite, and so does a drift in `design.md`.)*
* **C — the optimistic pre-manifest branch is preserved.** `renderList(words, null)` must render one
  live `btn-say` per row and **zero** `btn-say na`. *(Without this, a future "simplification" quietly
  makes every row say `coming soon` for the first few hundred milliseconds of every visit.)*

**MANDATED FAIL-FIRST:**

* **M2.3a — the re-expressed pin must be seen to fail on the OLD code.** Before applying, run the
  re-expressed assertion against the shipped `words.js`: it must fail with
  *"a row we cannot speak must still show the speaker, crossed out"*. **Already done today:** the
  shipped `renderList` emits `""` for the unknown row.
* **M2.3b — field guide 14's gate must fire.** Move the four rules from `styles.css` into
  `words.js`'s `VIEW_STYLE`. Test A must fail **twice** (missing from the sheet, present in a
  `VIEW_STYLE`). Restore with the apply script's output md5.
* **M2.3c — the frozen-CSS gate must fire.** Change `opacity: 0.55` to `opacity: 0.5` in
  `styles.css`. Test B must fail. Restore.
* **M2.3d — the honesty property must fire.** Add `data-say="${escapeHtml(lemma)}"` to the `na`
  branch. The re-expressed pin must fail on *"no data-say for a row we cannot speak"*. Restore.

**FROZEN VALIDATION:** §VAL-F2 verbatim, then:
```bash
case "$TOTAL"  in 378) ;; *) fail "expected 378 reported, got '$TOTAL'";; esac
case "$PLAN"   in 373) ;; *) fail "expected top-level plan 1..373, got '1..$PLAN'";; esac
case "$FAILED" in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL" in 378) ;; *) fail "APP_CODE=dummy: expected 378, got '$GTOTAL'";; esac
case "$GFAILED" in 0)  ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"   in 373) ;; *) fail "expected 373 flat, got '$FLAT'";; esac
case "$PUBN"   in 2372) ;; *) fail "step 2.3 creates no public/ file: got '$PUBN'";; esac
case "$MAN" in "2254 2254 0 0 19942 8735a3c499508b04415046e2be4ad159") ;; *) fail "the manifest moved in step 2.3: $MAN";; esac
case "$SBSTATE" in FIXTURE) ;; *) fail "SB=$SBSTATE";; esac
case "$ENDS" in *"public/styles.css CRLF=748 LF=0"*)      ;; *) fail "styles.css endings/size wrong: $ENDS";; esac
case "$ENDS" in *"public/views/words.js CRLF=300 LF=0"*)  ;; *) fail "words.js endings/size wrong: $ENDS";; esac
case "$ENDS" in *"public/views/reader.js CRLF=946 LF=0"*) ;; *) fail "reader.js must be untouched in step 2.3";; esac
case "$NA" in *"public/views/words.js=465"*)  ;; *) fail "words.js non-ASCII must be 465 (the label MOVED, one glyph added): $NA";; esac
case "$NA" in *"public/views/reader.js=750"*) ;; *) fail "reader.js non-ASCII moved in step 2.3: $NA";; esac
case "$NA" in *"public/styles.css=0"*)        ;; *) fail "styles.css must stay pure ASCII: $NA";; esac
CSSMD5="$(md5sum public/styles.css | cut -d' ' -f1)"
case "$CSSMD5" in e7beb1087006b34b2141892d71410487) ;; *) fail "styles.css is not the apply script's output: $CSSMD5";; esac
WVMD5="$(md5sum public/views/words.js | cut -d' ' -f1)"
case "$WVMD5" in 4626c8f47f52e9070e05dfafe202f3f6) ;; *) fail "words.js is not the apply script's output: $WVMD5";; esac
# the frozen block must be present as CONTIGUOUS CRLF bytes, and design.md must not have moved
FROZ="$(node -e 'const fs=require("fs"),c=require("crypto");const d=fs.readFileSync(".oplan/word-finish/design.md","utf8");const b=[...d.matchAll(/```css\r?\n([\s\S]*?)```/g)].map(m=>m[1]);if(b.length!==2){console.log("BLOCKS="+b.length);process.exit(0);}const lf=b[0]+String.fromCharCode(10)+b[1];const crlf=lf.split(String.fromCharCode(10)).join(String.fromCharCode(13,10));const css=fs.readFileSync("public/styles.css","utf8");console.log(c.createHash("md5").update(lf).digest("hex")+" "+String(css.indexOf(crlf)>=0));')"
case "$FROZ" in "6e43cb5e463520f5d277d7d02c5ff26c true") ;; *) fail "the FROZEN design section-8 CSS is not in styles.css byte-for-byte: $FROZ";; esac
WUNA="$(node -e 'const b=require("fs").readFileSync("tests/words-ui.test.js");let n=0;for(const x of b) if(x>127) n++;console.log(String(n));')"
case "$WUNA" in 222) ;; *) fail "tests/words-ui.test.js raw non-ASCII moved from 222 to $WUNA -- no new Hebrew";; esac
case "$PORC" in " M public/styles.css
 M public/views/words.js
 M tests/words-ui.test.js") ;; *) fail "step 2.3 write set is wrong. got:
$PORC";; esac
exit $RC
```

**NON-GOALS:** no `reader.js`; no clip; no manifest; no `CACHE`; no new contrast pair; no new colour
token; **no new Hebrew**; no change to `.btn-say` or `.btn-know` themselves.

---

# STEP 2.4 — THE MARKER IN THE READER POPUP, AND THE READER FINALLY GETS AN EXECUTED UI GATE

**GOAL:** `public/views/reader.js` gains the **same** exported `saySlot(canSay, lemma)` and calls it
at `:691`, so `canSay` gates the button's **state** instead of its **existence**.
`tests/reader-ui.test.js` **re-expresses** the one needle this breaks and gains two tests, one of
which drives the shipped `render()` to a real popup and reads the markup back.

**TIER:** WORKER. **DEPENDS ON:** 2.3 (the CSS and the identical `saySlot` in `words.js`).

**REPO WRITE SET (exhaustive):**
* `public/views/reader.js` — MODIFY (**CRLF**, 946 → **959** lines, 32117 → **32870** bytes,
  md5 **`35385ece40f0011e2255e907e0bdf77d`**, non-ASCII 750 → **754**).
* `tests/reader-ui.test.js` — MODIFY (**LF**). **+2 flat tests → ledger 375 flat / 380 reported.**
* `PUBN` stays 2372. The manifest does not move.

**THE COLLISIONS, RULED ONE BY ONE — and the brief named the wrong ones.** I checked every
`btn-say` / `canSay` reference in `tests/` by **running the assertions against the patched tree**,
not by reading them:

| pin | brief's guess | measured | ruling |
|---|---|---|---|
| `reader-ui.test.js:133` `src.includes('activePopup.canSay')` | "decide: property or spelling" | **SURVIVES** — the new line is `${saySlot(activePopup.canSay, activePopup.lemma)}` | keep the needle; its **message** *"the button is conditional on having a clip"* becomes false and is re-worded to *"the popup consults canSay"*. Prose, not a pin |
| `reader-ui.test.js:337` `'canSay: lemma !== null,'` | "decide: property or spelling" | **SURVIVES BYTE-IDENTICALLY** — `:843` does not move at all. §8 changes what the *render* does with `canSay`, not how `canSay` is computed | untouched |
| **`reader-ui.test.js:339` `'data-say="${escapeHtml(activePopup.lemma)}"'`** | **not mentioned in the brief** | **BREAKS** — the attribute moves into `saySlot`, where it is `escapeHtml(lemma)` | it names a **property** — *"the button plays the value it was drawn from"* — in a **spelling** the refactor necessarily changes. **RE-EXPRESS**, do not delete: keep the two `forbidden` needles as they are and replace the third with `'saySlot(activePopup.canSay, activePopup.lemma)'` plus the executed popup test below, which proves the property instead of spelling it |
| `reader-ui.test.js:83` the six-needle loop | flagged | **SURVIVES** (all six still present) | untouched |
| `reader-ui.test.js:85-95` the `.btn-say` block extraction from `styles.css` | flagged | **SURVIVES** — `.btn-say.na {` and `.btn-say-soon {` do not contain the substring `.btn-say {`, and the block still ends at the same `}` | untouched. **Run, not reasoned** |
| `reader-ui.test.js:226` the "honest today by accident of construction" comment | "read it, it constrains you" | read | its three tests are exactly the invariant this step preserves. `:243-249` (the 2254 pins) move in **step 2.6**, not here |
| `quiz-ui.test.js:472` `btn-say` | flagged | **SURVIVES** — `public/quiz.js` is QZ-18 frozen and is not touched | untouched |

**THE APPLY SCRIPT, verbatim** (`C:/Users/dkreinov/finish-audio/apply-2.4.cjs`). It slices the
Hebrew label and the speaker glyph out of `reader.js`'s **own bytes** and produces the **byte-identical
`saySlot`** that `words.js` carries.

```js
// word-finish step 2.4 -- the FROZEN marker lands in the reader popup.
// Byte-preserving. public/views/reader.js is CRLF and MUST stay CRLF.
// The Hebrew aria-label and the speaker glyph are SLICED OUT OF THE FILE'S OWN
// BYTES and re-inserted -- never retyped, never transported (field guide 8).
//
// Usage:  node apply-2.4.cjs <repo-root>
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.argv[2];
if (!ROOT) { console.log('STOP: usage: node apply-2.4.cjs <repo-root>'); process.exit(1); }
const P = (p) => path.join(ROOT, p);
const md5 = (b) => crypto.createHash('md5').update(b).digest('hex');
const stop = (m) => { console.log('STOP: ' + m); process.exit(1); };

const rPath = P('public/views/reader.js');
const r0 = fs.readFileSync(rPath);
const r = r0.toString('utf8');
if (r.includes('saySlot')) stop('public/views/reader.js already contains saySlot -- refusing to double-apply');

// --- 1. slice the frozen popup line out, byte-exactly -------------------------
const PRE = '          ${activePopup.canSay ? `<button class="btn-say" type="button" data-say="${escapeHtml(activePopup.lemma)}" aria-label="';
const at = r.indexOf(PRE);
if (at < 0) stop('the frozen reader.js popup line was not found byte-exactly');
if (r.indexOf(PRE, at + 1) >= 0) stop('the reader.js popup line is not unique');
const labEnd = r.indexOf('">', at + PRE.length);
const HE = r.slice(at + PRE.length, labEnd);                 // the aria-label, MOVED
const glyphEnd = r.indexOf('</button>', labEnd + 2);
const GLYPH = r.slice(labEnd + 2, glyphEnd);                 // the speaker glyph, MOVED
const TAIL = '` : ""}';
const lineEnd = r.indexOf(TAIL, glyphEnd) + TAIL.length;
if (HE.length === 0 || GLYPH.length === 0 || lineEnd <= glyphEnd) stop('failed to slice the reader.js popup line');

// --- 2. the SAME saySlot body words.js carries. Byte-identical output is a gate.
const SAY_SLOT =
  '// word-finish phase 2 (design section 8, FROZEN). canSay gates the button\'s STATE, no\r\n' +
  '// longer its EXISTENCE. A word we cannot speak still shows the speaker, crossed out\r\n' +
  '// by CSS, with the ASCII caption "coming soon" under it -- so she can tell "no sound\r\n' +
  '// for THIS word yet" from "this app has no sound". The pressable branch still implies\r\n' +
  '// a clip exists: it is the only branch that carries data-say, and the [data-say]\r\n' +
  '// handler is the only thing that can play anything.\r\n' +
  'export function saySlot(canSay, lemma) {\r\n' +
  '  if (canSay) {\r\n' +
  '    return `<button class="btn-say" type="button" data-say="${escapeHtml(lemma)}" aria-label="' + HE + '">' + GLYPH + '</button>`;\r\n' +
  '  }\r\n' +
  '  return `<span class="say-soon-wrap"><button class="btn-say na" type="button" disabled aria-hidden="true">' + GLYPH + '</button><span class="btn-say-soon">coming soon</span></span>`;\r\n' +
  '}\r\n' +
  '\r\n';

// --- 3. replace the popup line ------------------------------------------------
let r1 = r.slice(0, at) + '          ${saySlot(activePopup.canSay, activePopup.lemma)}' + r.slice(lineEnd);

// --- 4. insert saySlot at module scope, immediately before renderWords ---------
const RW = 'function renderWords(text) {';
const rwAt = r1.indexOf(RW);
if (rwAt < 0) stop('renderWords not found in reader.js');
if (r1.indexOf(RW, rwAt + 1) >= 0) stop('the renderWords anchor is not unique');
r1 = r1.slice(0, rwAt) + SAY_SLOT + r1.slice(rwAt);

fs.writeFileSync(rPath, Buffer.from(r1, 'utf8'));

const b = fs.readFileSync(rPath);
let cr = 0, lf = 0, na = 0;
for (const x of b) { if (x === 13) cr++; if (x === 10) lf++; if (x > 127) na++; }
console.log('public/views/reader.js bytes=' + String(b.length) + ' CR=' + String(cr) + ' LF=' + String(lf) + ' nonASCII=' + String(na) + ' md5=' + md5(b));
console.log('APPLY-2.4-OK');
```

**RUN TODAY** on the byte-exact mirror:

```
public/views/reader.js bytes=32870 CR=959 LF=959 nonASCII=754 md5=35385ece40f0011e2255e907e0bdf77d
APPLY-2.4-OK
$ node --check public/views/reader.js      -> syntax OK
reader.saySlot(false,"x")   === words.saySlot(false,"x")   : true
reader.saySlot(true,"cat")  === words.saySlot(true,"cat")  : true
na has data-say = false      na is disabled = true
```

**THE TWO TESTS `tests/reader-ui.test.js` GAINS, verbatim.** Append them to the file. The first is
the **strongest gate in this phase**: it drives the shipped `render()` and reads the real popup back.

```js
// ===== step 2.4 (word-finish phase 2, design section 8). THE POPUP, EXECUTED.
// reader.js was source-needle tested for two whole runs (field guide 20). It does
// not have to be: render() already runs in node against a fake container, and the
// popup is one click away from there. This drives the SHIPPED code end to end and
// reads the real popup markup back.
//
// THE ONE TRAP: draw() re-assigns container.innerHTML and bindHandlers() re-runs
// querySelectorAll, so a fake span that keeps EVERY handler it is given
// accumulates them, and firing them all recurses until node dies of heap
// exhaustion. _fire therefore invokes ONLY the most recently registered handler.
function p2Span(dataWord) {
  const handlers = [];
  return {
    _fire: async (name) => {
      const hs = handlers.filter(([t]) => t === name);
      if (hs.length === 0) throw new Error(`no ${name} handler was ever bound to "${dataWord}"`);
      await hs[hs.length - 1][1]({ stopPropagation() {} });
    },
    getAttribute: (k) => (k === 'data-word' ? dataWord : null),
    addEventListener: (t, h) => handlers.push([t, h]),
    classList: { add() {}, remove() {} },
    style: {},
  };
}

function p2Container(spans) {
  const paints = [];
  let html = '';
  return {
    paints,
    container: {
      get innerHTML() { return html; },
      set innerHTML(v) { html = v; paints.push(v); },
      querySelector: () => null,
      querySelectorAll: (sel) => (String(sel).includes('.w') || String(sel).includes('data-word') ? spans : []),
    },
  };
}

test('tapping a word we cannot speak opens a popup with a crossed-out speaker and "coming soon"', async () => {
  const { render } = await import('../public/views/reader.js');
  const spans = { cat: p2Span('cat'), ellie: p2Span('ellie') };
  const { container, paints } = p2Container(Object.values(spans));
  const profile = {
    version: 1,
    placement: { completed: true },
    learner: { heroineName: 'Ellie', petName: 'Sparkle' },
    words: {},
    trophies: {},
    story: {
      chapters: [{
        n: 1, title: 'One', text: 'The cat saw Ellie.',
        glossary: [{ word: 'cat', he: 'HE-CAT' }], questions: [],
      }],
    },
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    // the manifest has "cat" and does NOT have "ellie" -- that is the whole point
    if (u.includes('/audio/words/index.json')) return { ok: true, json: async () => ['cat'] };
    if (u === '/api/profile') return { status: 200, json: async () => ({ ok: true, data: profile }) };
    if (u === '/api/translate') return { status: 200, json: async () => ({ ok: true, he: 'HE-ELLIE' }) };
    throw new Error('unexpected url ' + u);
  };

  let observed = 0;
  try {
    await render(container, {});
    assert.ok(paints[paints.length - 1].includes('class="w" data-word='), 'the story must render tappable spans');

    // (a) a word WITH a clip: a live, pressable button that carries data-say.
    paints.length = 0;
    await spans.cat._fire('click');
    observed += 1;
    const livePainted = paints[paints.length - 1];
    const liveAt = livePainted.indexOf('<div class="reader-popup"');
    assert.ok(liveAt >= 0, 'tapping must open the popup');
    const live = livePainted.slice(liveAt);
    assert.ok(live.includes('data-say="cat"'), 'a word with a clip must get a pressable button');
    assert.ok(!live.includes('btn-say na'), 'a word with a clip must NOT be marked unavailable');
    assert.ok(!live.includes('coming soon'), 'a word with a clip must not say coming soon');

    // (b) a word with NO clip: the marker, and NO data-say anywhere in the popup.
    paints.length = 0;
    await spans.ellie._fire('click');
    observed += 1;
    const painted = paints[paints.length - 1];
    // SLICE THE POPUP OUT FIRST. The paint also carries <style>${VIEW_STYLE}</style>,
    // in which ".reader-popup-he" appears as a CSS SELECTOR long before the markup --
    // so an indexOf() ordering check over the whole paint measures the stylesheet,
    // not the popup. (Found by running this; field guide 18.)
    const popAt = painted.indexOf('<div class="reader-popup"');
    assert.ok(popAt >= 0, 'tapping must open the popup');
    const na = painted.slice(popAt);
    assert.ok(na.includes('btn-say na'), 'a word with no clip must still show the speaker, crossed out');
    assert.ok(na.includes('coming soon'), 'a word with no clip must carry the frozen ASCII caption');
    assert.ok(na.includes('disabled'), 'the crossed-out speaker must not be pressable');
    assert.ok(!na.includes('data-say'), 'THE HONESTY PROPERTY: no data-say may exist for a word with no clip');
    // design section 8: "The Hebrew and the save line must not move."
    assert.ok(na.includes('data-action="popup-save"'), 'the save button must still be there');
    assert.ok(na.includes('class="reader-popup-he"'), 'the Hebrew line must still be there');
    assert.ok(na.indexOf('reader-popup-word') < na.indexOf('btn-say na'), 'the word still comes first');
    assert.ok(na.indexOf('btn-say na') < na.indexOf('class="reader-popup-he"'), 'the marker still sits above the Hebrew');
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.strictEqual(observed, 2, 'the harness must have driven exactly 2 taps; 0 would mean it inspected nothing');
});

test('both views render byte-identical say slots, so the duplicated markup cannot drift', async () => {
  const reader = await import('../public/views/reader.js');
  const words = await import('../public/views/words.js');
  assert.strictEqual(
    reader.saySlot(false, 'x'),
    words.saySlot(false, 'x'),
    'the coming-soon marker must be the same bytes in the reader and in the words list'
  );
  assert.strictEqual(
    reader.saySlot(true, 'cat'),
    words.saySlot(true, 'cat'),
    'the pressable button must be the same bytes in the reader and in the words list'
  );
  assert.ok(!reader.saySlot(false, 'x').includes('data-say'), 'the marker must never carry data-say');
  assert.ok(reader.saySlot(true, 'cat').includes('data-say="cat"'), 'the live button must carry data-say');
});
```

**BOTH TESTS WERE RUN TODAY, BOTH WAYS.**

```
against the PATCHED tree  :  # tests 2   # pass 2   # fail 0
against the SHIPPED tree  :  # tests 2   # pass 0   # fail 2
  not ok 1 - tapping a word we cannot speak ...
      error: 'a word with no clip must still show the speaker, crossed out'
  not ok 2 - both views render byte-identical say slots ...
      error: 'reader.saySlot is not a function'
```

**So the mandated fail-first for this step is already discharged by construction: the mutation is
the code before the fix, and it was observed.**

> **A DEFECT IN THIS TEST, FOUND BY RUNNING IT, AND IT IS FIELD GUIDE 18 EXACTLY.** The ordering
> assertion first read `painted.indexOf('reader-popup-he')` over the **whole paint** — which also
> contains `<style>${VIEW_STYLE}</style>`, in which `.reader-popup-he` appears as a **CSS selector**
> hundreds of characters earlier. The test failed on a correct tree. **The check was building its
> pattern out of content that also exists somewhere else.** Fixed by slicing the popup out first,
> and the slice is in the frozen snippet. An executor who "fixes" a failure here by loosening the
> assertion has reintroduced the bug.

**MANDATED FAIL-FIRST (beyond the two above):**

* **M2.4a — the re-expressed `:339` needle must fire.** Change `saySlot(activePopup.canSay, …)` to
  `saySlot(true, …)`; the executed popup test must fail on *"a word with no clip must still show the
  speaker, crossed out"* — **not** merely the needle. Restore to the apply script's md5.
* **M2.4b — the byte-equality test must fire.** Change `coming soon` to `Coming soon` in
  `reader.js` only. Test 2 must fail. Restore. *(This is the mechanical answer to "why is it safe to
  duplicate the markup in two files".)*
* **M2.4c — the frozen `canSay` computation must not have moved.** `grep -c 'canSay: lemma !== null,'`
  = 1, asserted in the tail.

**FROZEN VALIDATION:** §VAL-F2 verbatim, then:
```bash
case "$TOTAL"  in 380) ;; *) fail "expected 380 reported, got '$TOTAL'";; esac
case "$PLAN"   in 375) ;; *) fail "expected top-level plan 1..375, got '1..$PLAN'";; esac
case "$FAILED" in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL" in 380) ;; *) fail "APP_CODE=dummy: expected 380, got '$GTOTAL'";; esac
case "$GFAILED" in 0)  ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"   in 375) ;; *) fail "expected 375 flat, got '$FLAT'";; esac
case "$PUBN"   in 2372) ;; *) fail "step 2.4 creates no public/ file: got '$PUBN'";; esac
case "$MAN" in "2254 2254 0 0 19942 8735a3c499508b04415046e2be4ad159") ;; *) fail "the manifest moved in step 2.4: $MAN";; esac
case "$SBSTATE" in FIXTURE) ;; *) fail "SB=$SBSTATE";; esac
case "$ENDS" in *"public/views/reader.js CRLF=959 LF=0"*) ;; *) fail "reader.js endings/size wrong: $ENDS";; esac
case "$ENDS" in *"public/styles.css CRLF=748 LF=0"*)      ;; *) fail "styles.css moved again in step 2.4";; esac
case "$ENDS" in *"public/views/words.js CRLF=300 LF=0"*)  ;; *) fail "words.js moved again in step 2.4";; esac
case "$NA" in *"public/views/reader.js=754"*) ;; *) fail "reader.js non-ASCII must be 754 (the label MOVED, one glyph added): $NA";; esac
case "$NA" in *"public/views/words.js=465"*)  ;; *) fail "words.js non-ASCII moved in step 2.4: $NA";; esac
RVMD5="$(md5sum public/views/reader.js | cut -d' ' -f1)"
case "$RVMD5" in 35385ece40f0011e2255e907e0bdf77d) ;; *) fail "reader.js is not the apply script's output: $RVMD5";; esac
# the frozen canSay computation did NOT move, and the popup consults it
CS="$(grep -c 'canSay: lemma !== null,' public/views/reader.js)"
case "$CS" in 1) ;; *) fail "the frozen canSay computation moved: $CS occurrences";; esac
SS="$(grep -c 'saySlot(activePopup.canSay, activePopup.lemma)' public/views/reader.js)"
case "$SS" in 1) ;; *) fail "the popup must call saySlot exactly once, got $SS";; esac
# the OLD unconditional-absence spelling must be gone
OLDB="$(grep -c 'activePopup.canSay ?' public/views/reader.js || true)"
case "$OLDB" in 0) ;; *) fail "the old 'button or nothing' ternary survives in reader.js";; esac
RUNA="$(node -e 'const b=require("fs").readFileSync("tests/reader-ui.test.js");let n=0;for(const x of b) if(x>127) n++;console.log(String(n));')"
case "$RUNA" in 355) ;; *) fail "tests/reader-ui.test.js raw non-ASCII moved from 355 to $RUNA -- no new Hebrew";; esac
case "$PORC" in " M public/views/reader.js
 M tests/reader-ui.test.js") ;; *) fail "step 2.4 write set is wrong. got:
$PORC";; esac
exit $RC
```

**NON-GOALS:** no clip; no manifest; no CSS (2.3 owns it); no `CACHE`; **no new Hebrew**; the
`canSay` computation at `:843` does not move; `renderWords()` is not touched, so the inline story
spans are exactly as they are today.

---

# STEP 2.5 — THE VISUAL GATE: THE COMPOSITE NOBODY ELSE CAN GATE

**GOAL:** somebody **looks** at the crossed-out speaker, in a browser, on the real page, at a real
device width, in **both** surfaces. No repository byte moves.

**WHY THIS STEP EXISTS AT ALL, given the owner waived the listening gate.** He waived his **ears**,
not his eyes. Field guide 15(c): *"the image was gated; the CSS was gated; THE COMPOSITE WAS GATED BY
NOBODY"*, and 15's closing rule: *"wherever approved art meets approved CSS there is a surface nobody
signed off — gate it or look at it."* Design §8 is **a CSS-drawn diagonal line over an emoji**. Every
mechanical check in this phase proves the rules are present, reachable and contrast-clean; **not one
of them can tell whether a child looks at it and reads "sound, not yet".** And field guide 15's
autopsy is explicit that a UI feature audited in node is audited at the wrong layer.

**IT IS SELF-SERVED** (owner directive, and phase 1 step 1.5's precedent): the agent drives the
sandbox browser itself. **Do not ask the owner to look.**

**TIER:** ORCHESTRATOR. **DEPENDS ON:** 2.3, 2.4. **REPO WRITE SET: EMPTY.**

**PROCEDURE — the order matters and every line of it was learned the hard way:**

1. **CHECK PORT 3000 FOR A STALE SERVER FIRST** (field guide 11). One squatted with the wrong
   `DATA_DIR` and answered a probe.
2. Record `md5sum C:/Users/dkreinov/english-app-sandbox/profile.json` — it must be
   `91eff5da59674d7463f462fad659534e`. **The dev server writes to `DATA_DIR`** and its md5 *will*
   change; step 7 restores it. Phase 1 proved this warning is real, not theoretical.
3. Start the dev server against the **sandbox**, never the repo:
   `DATA_DIR=C:/Users/dkreinov/english-app-sandbox node scripts/dev-server.js`.
4. **USE `http://127.0.0.1:3000`, NOT `localhost:3000`** — field guide 23. A stale service worker on
   `localhost` served yesterday's code to phase 1's visual gate and it nearly reported a false
   regression. No worker is registered on `127.0.0.1`.
5. **The reader.** The sandbox chapter contains `Ellie`, `Sparkle`, `barked`, `held`, `lay`,
   `leaning` — the six words SK-F2-5 measured as unresolvable. Tap one of them and one ordinary word
   (`garden`, `river`). Screenshot both popups. **Judge, in words, not in assertions:**
   * does the marked one read as *"sound, not yet"* — rather than *"you are not allowed"* or
     *"you switched it off"*? That distinction is **the owner's whole reason for choosing option A**
     over the bare 🚫 (design §8), and it is the only thing this step exists to check.
   * is the diagonal line visible at 40 px, and does it read as crossing the **speaker** rather than
     as a stray stroke?
   * is `coming soon` legible, directly under the button, and not clipped?
   * **do the Hebrew line and the save button sit exactly where they sit in the unmarked popup?**
     Design §8 requires it. Compare the two screenshots.
6. **The words list.** Tap through to the word-list tab (the second nav tab; its label is Hebrew and is NOT retyped here -- field guide 8). The six sandbox words all resolve, so **to see a
   marked row you must create one**: add a word the manifest has no lemma for by tapping an
   unresolvable token in the story and saving it, then return to the list. Screenshot.
   **Judge:** does the marker fit the row's height without pushing the row taller than its
   neighbours? `.word-card-actions` is a flex row and the wrapper is the only thing making the
   caption sit under the button — **this is the one thing in the phase that no test can see.**
7. **Stop the server. Restore the sandbox from the pristine copy** and re-verify
   `SB=FIXTURE` **before** recording the step (field guide 23's second half).

**STOP RULE:** if the composite reads wrong, **escalate — do not adjust the frozen CSS.** Design §8
is frozen by the owner; a change to it is his ruling, not an executor's, and not the orchestrator's.

**RECORD:** both reader screenshots, the words-list screenshot, the sandbox md5 before and after, and
a written verdict per bullet. **A screenshot with no written judgement is not a gate** — it is the
same "existence is not effect" failure the field guide opens with.

**FROZEN VALIDATION:** §VAL-F2 verbatim, then:
```bash
case "$TOTAL"  in 380) ;; *) fail "expected 380 reported, got '$TOTAL'";; esac
case "$FLAT"   in 375) ;; *) fail "expected 375 flat, got '$FLAT'";; esac
case "$FAILED" in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$PUBN"   in 2372) ;; *) fail "the visual gate must change nothing: got '$PUBN'";; esac
case "$SBSTATE" in FIXTURE) ;; *) fail "the sandbox was not restored after the dev server ran: SB=$SBSTATE";; esac
case "$PORC" in "") ;; *) fail "step 2.5 must change nothing inside the repository. got:
$PORC";; esac
# no dev server may still be listening when this step is recorded
SRVUP="$(node -e 'const n=require("net");const s=n.connect(3000,"127.0.0.1");s.on("connect",()=>{console.log("UP");s.end();});s.on("error",()=>console.log("DOWN"));setTimeout(()=>{console.log("DOWN");process.exit(0);},1500);' | head -1)"
case "$SRVUP" in DOWN) ;; *) fail "a dev server is still listening on 127.0.0.1:3000";; esac
exit $RC
```

---

# STEP 2.6 — **THE MONEY.** TEN CLIPS, ONE CONTROL CALL FIRST, AND THE FOUR CHECKS AS THE ONLY GATE.

> **THIS IS THE ONLY STEP IN THE PHASE THAT SPENDS ANYTHING. It is the LAST BUT ONE.**
> Authorised by the owner 2026-08-01 (design §3 A; `.oplan/word-polish/journal.md:47` *"OWNER RULING
> (B3, 2026-08-01): APPROVED generating the ten clips with `scripts/build-word-audio.js` UNCHANGED"*).
> **THE LISTENING GATE IS WAIVED** (design §11, 2026-08-02). **Therefore the four mechanical checks
> are the ONLY gate, and they are mandatory.** Cost: **11 API calls** — one control plus ten words —
> a fraction of a cent.
>
> **ACCEPTED RESIDUAL RISK, the owner's, knowingly:** a clip may mispronounce a word and ship. Blast
> radius one word. **Do not try to design that away** and do not add a check for it; there is none.

**GOAL:** `data/story-words.json` gains the ten base lemmas; ten `.aac` files are generated; the
manifest becomes 2264 **derived from the disk**; the count pins in two test files move.

**TIER:** ORCHESTRATOR (it holds a key and it spends money). **DEPENDS ON:** 2.1, 2.2, 2.3, 2.4, 2.5.

**REPO WRITE SET (exhaustive — 13 files):**
* `data/story-words.json` — MODIFY, `[]` → the ten. **110 bytes, LF, md5 `6463bb28edd73e5ffdfad8c654a47b24`.**
* `public/audio/words/{after,deer,feet,glow,growl,harm,moon,nervous,scary,tight}.aac` — **CREATE, 10 files.**
* `public/audio/words/index.json` — MODIFY, machine-written. **2264 entries, 20019 bytes, LF, md5 `6a885982b75e82ef1f00dc6768796ecf`.**
* `tests/word-audio.test.js` — MODIFY, **count pins only. +0 tests.**
* `tests/reader-ui.test.js` — MODIFY, **count pins only. +0 tests.**
* `PUBN` 2372 → **2382**.

**THE EXACT CONTENT OF `data/story-words.json`** — this line and nothing else, LF-terminated:
```json
[
  "after",
  "deer",
  "feet",
  "glow",
  "growl",
  "harm",
  "moon",
  "nervous",
  "scary",
  "tight"
]
```
*(`JSON.stringify(TEN.sort(), null, 2) + "\n"` = 110 bytes, md5 `6463bb28edd73e5ffdfad8c654a47b24`,
computed today.)* **THESE TEN AND NO OTHERS — see FINDING 1 and FC-6.** In particular
`closer`, `softly`, `suddenly` and `wings` are **NOT** here, on purpose, and adding them would split
words she already holds.

**THE COUNT PINS THAT MOVE — every one of them, so none is discovered by a red suite:**

| file | line | today | after |
|---|---|---|---|
| `tests/reader-ui.test.js` | `:243` | `manifest.length, 2254` | **2264** |
| `tests/reader-ui.test.js` | `:244` | `files.length, 2255` | **2265** |
| `tests/reader-ui.test.js` | `:248` | `clips.size, 2254` | **2264** |
| `tests/reader-ui.test.js` | `:326` | `browserWords.length, 2254` | **2264** |
| `tests/reader-ui.test.js` | `:270-283` | the `inputs.push(...)` list of *"words the chapter can contain that we deliberately have nothing for"* — it names `growls, glows, nervous, scary, harm, deer, feet, moon, tightly` | **RE-EXPRESS.** After this step those nine **do** resolve, so the comment becomes false. Keep `'deepbreath'`, `'zzzz'`, `''`; **move the nine into a new positive control**: *"every one of the ten story words this phase generated now resolves to a clip"*, and add three new never-resolvable controls (`'zzqq'`, `'xyzzy'`, `'qqqq'`) so `assert.ok(nulls > 0, …)` — the existing cry-wolf guard — still has something to count. **The property survives; the list of examples moves.** |
| `tests/word-audio.test.js` | dry-run test | `words: 2254`, `extras: 0`, `clips: 2254` | `words: 2264`, `extras: 10`, `clips: 2264` |

**THE COMMANDS, EXACTLY, IN THIS ORDER.** Every one writes its output to a **FILE** — field guide 10
records a truncated terminal causing a **double deploy**, and the same shape here would be a double
purchase.

```bash
cd C:/Users/dkreinov/claude/english-app
mkdir -p C:/Users/dkreinov/finish-audio/drift C:/Users/dkreinov/finish-audio/log

# 0. PRE-FLIGHT. The tree must be clean and the manifest must still be the base one.
git status --porcelain -uall | awk '$NF !~ /^\.oplan\//'          # must be EMPTY
md5sum public/audio/words/index.json    # must be 8735a3c499508b04415046e2be4ad159
md5sum public/audio/words/cat.aac       # must be f83c679fa536608aa69b88343fdfcee8

# 1. THE VOICE-DRIFT CONTROL. ONE API call. It happens BEFORE the batch on purpose:
#    a model that has moved behind its name stops the run for the price of one word.
#    The key exists ONLY inside this subshell -- never exported into a validation shell.
( set -a; . ./.env; set +a; node C:/Users/dkreinov/finish-audio/drift-probe.mjs ) \
  > C:/Users/dkreinov/finish-audio/log/drift-write.txt 2>&1; echo "RC=$?"
cat C:/Users/dkreinov/finish-audio/log/drift-write.txt          # must end DRIFT-PROBE-WRITTEN

node scripts/check-word-audio.mjs --drift cat C:/Users/dkreinov/finish-audio/drift/cat.aac \
  > C:/Users/dkreinov/finish-audio/log/drift-check.txt 2>&1; echo "RC=$?"
cat C:/Users/dkreinov/finish-audio/log/drift-check.txt
# >>> IF RC IS NOT 0: **STOP HERE.** Do NOT run the batch. Do NOT retry. Do NOT widen the band.
# >>> Report the printed ratios verbatim and escalate. A drifted model is an owner-level fact.

# 2. THE TEN. Write the extras file (the exact bytes above), then generate.
#    build-word-audio.js is RESUMABLE: it skips all 2254 existing clips, so this is
#    exactly 10 network calls however many times it is run.
( set -a; . ./.env; set +a; node scripts/build-word-audio.js ) \
  > C:/Users/dkreinov/finish-audio/log/generate.txt 2>&1; echo "RC=$?"
grep -c '^wrote ' C:/Users/dkreinov/finish-audio/log/generate.txt     # must be 10
grep    '^manifest: ' C:/Users/dkreinov/finish-audio/log/generate.txt # must say 2264
tail -1 C:/Users/dkreinov/finish-audio/log/generate.txt               # "wrote 10, skipped 2254"

# 3. THE ONLY GATE.
node scripts/check-word-audio.mjs > C:/Users/dkreinov/finish-audio/log/gate.txt 2>&1; echo "RC=$?"
cat C:/Users/dkreinov/finish-audio/log/gate.txt
# >>> IF RC IS NOT 0: **STOP.** The output NAMES the word that failed and why.
# >>> The ONLY sanctioned repair is: delete THAT ONE named .aac file and re-run step 2.
# >>> Never hand-edit index.json. Never delete a clip the gate did not name. Never re-run
# >>> the whole batch to "see if it comes out better" -- that is a second purchase and it
# >>> destroys the evidence.

# 4. move the count pins in the two test files, then npm test.

# COMMIT (orchestrator, at acceptance):
#   "step 2.6: the ten story-word clips -- BASE LEMMAS ONLY (B2), manifest now derived
#    from disk at 2264; drift control on 'cat' passed; ledger 375 flat / 380 reported"
```

**THE DRIFT PROBE, verbatim** (`C:/Users/dkreinov/finish-audio/drift-probe.mjs`). **Its two guards
were run today and both fire** — an `OUT_DIR` inside the repo stops with
`the control clip must be written OUTSIDE the repository`, and a missing key stops with
`OPENAI_API_KEY is not set`, **both without making a request.**

```js
// word-finish step 2.6 -- THE VOICE-DRIFT CONTROL (design section 11, check 1).
//
// Regenerates ONE word that ALREADY has a shipped clip, to a scratch path OUTSIDE
// public/, and hands it to scripts/check-word-audio.mjs --drift for comparison.
// THE SHIPPED CLIP IS NEVER TOUCHED: this script only ever writes OUT_PATH, and it
// refuses to run if OUT_PATH resolves anywhere under the repository.
//
// It calls the SHIPPED synthesizeWord() -- the only reason that function is
// exported -- so the request is byte-for-byte the request the batch will make:
// same MODEL, same VOICE, same INSTRUCTIONS. A re-implemented request would make a
// difference in the OUTPUT indistinguishable from a difference in my copy of the
// REQUEST (field guide 2).
//
// THIS COSTS ONE API CALL. It is the first and cheapest thing step 2.6 does, so a
// drifted model stops the run before the batch is paid for.
//
// Usage (from the repo root, with the key in the environment for this one command):
//   set -a; . ./.env; set +a; node C:/Users/dkreinov/finish-audio/drift-probe.mjs

import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = 'C:/Users/dkreinov/claude/english-app';
const WORD = 'cat';
const OUT_DIR = 'C:/Users/dkreinov/finish-audio/drift';
const OUT_PATH = path.join(OUT_DIR, `${WORD}.aac`);

// The shipped clip this is controlled against, pinned so a typo cannot silently
// control against the wrong file.
const SHIPPED_MD5 = 'f83c679fa536608aa69b88343fdfcee8';

const resolved = path.resolve(OUT_PATH);
if (resolved.startsWith(path.resolve(REPO))) {
  console.log('STOP: the control clip must be written OUTSIDE the repository, got ' + resolved);
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.log('STOP: OPENAI_API_KEY is not set. Usage: set -a; . ./.env; set +a; node drift-probe.mjs');
  process.exit(1);
}

const crypto = await import('node:crypto');
const fs = await import('node:fs');
const shippedPath = path.join(REPO, 'public/audio/words', `${WORD}.aac`);
const before = fs.readFileSync(shippedPath);
const beforeMd5 = crypto.createHash('md5').update(before).digest('hex');
if (beforeMd5 !== SHIPPED_MD5) {
  console.log(`STOP: the shipped ${WORD}.aac is ${beforeMd5}, not the pinned ${SHIPPED_MD5}`);
  process.exit(1);
}

const gen = await import(pathToFileURL(path.join(REPO, 'scripts/build-word-audio.js')).href);
const bytes = await gen.synthesizeWord(process.env.OPENAI_API_KEY, WORD);
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_PATH, bytes);

// PROVE the shipped clip was not touched, by reading it back AFTER the write.
const after = fs.readFileSync(shippedPath);
const afterMd5 = crypto.createHash('md5').update(after).digest('hex');
console.log(`control written: ${OUT_PATH} (${bytes.length} bytes)`);
console.log(`shipped ${WORD}.aac before=${beforeMd5} after=${afterMd5} untouched=${beforeMd5 === afterMd5}`);
if (beforeMd5 !== afterMd5) { console.log('STOP: the shipped clip was overwritten'); process.exit(1); }
if (!existsSync(OUT_PATH) || statSync(OUT_PATH).size !== bytes.length) {
  console.log('STOP: the control clip was not written whole');
  process.exit(1);
}
console.log('DRIFT-PROBE-WRITTEN');
```

**MANDATED FAIL-FIRST — all of it discharged in step 2.2, BEFORE any money existed.** That is the
point of building the gate four steps early. Re-state the evidence in this step's packet:
the checker exits **1** and names the offender on each of: a manifest entry with no clip, an orphan
clip, an empty file, an HTML body, a truncated clip, a silent clip, a clip three times too long, a
clip at the wrong sample rate; the drift control exits **1** on a 3× clip and **0** on a byte-copy;
and `--dir` at an empty directory prints `observed 0 clips` and exits **1** rather than `OK`.

**Two things to check in this step that step 2.2 could not:**
* **M2.6a — the ten really are the ten.** After generation, `ls public/audio/words/*.aac | wc -l` =
  **2264**, and `git status --porcelain public/audio/words` lists exactly ten `??` entries plus the
  modified `index.json`. **Not nine, not eleven.**
* **M2.6b — the population drift check.** Probe the ten new clips and compare their median duration
  with the 2254-clip population median (**1.365 s**, measured today). Ten independent samples are a
  stronger drift detector than one. If the ten's median is outside **0.7 – 1.9 s**, report it — that
  is not automatically a STOP, but it is a fact the orchestrator must see and rule on.

**FROZEN VALIDATION:** §VAL-F2 verbatim, then:
```bash
case "$TOTAL"  in 380) ;; *) fail "expected 380 reported, got '$TOTAL'";; esac
case "$PLAN"   in 375) ;; *) fail "expected top-level plan 1..375, got '1..$PLAN'";; esac
case "$FAILED" in 0)   ;; *) fail "expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL" in 380) ;; *) fail "APP_CODE=dummy: expected 380, got '$GTOTAL'";; esac
case "$GFAILED" in 0)  ;; *) fail "APP_CODE=dummy: expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"   in 375) ;; *) fail "step 2.6 adds NO test: expected 375 flat, got '$FLAT'";; esac
case "$PUBN"   in 2382) ;; *) fail "expected 2382 files under public/ (2372 + 10 clips), got '$PUBN'";; esac
case "$MAN" in "2264 2264 0 0 20019 6a885982b75e82ef1f00dc6768796ecf") ;; *) fail "the manifest is not the expected disk-derived 2264: $MAN";; esac
case "$SBSTATE" in FIXTURE) ;; *) fail "SB=$SBSTATE";; esac
SWJ="$(md5sum data/story-words.json | cut -d' ' -f1)"
case "$SWJ" in 6463bb28edd73e5ffdfad8c654a47b24) ;; *) fail "data/story-words.json is not the frozen ten: $SWJ";; esac
# THE ONLY GATE, run inside the step's own validation
CWA="$(node scripts/check-word-audio.mjs 2>&1)"; CWASTAT=$?
case "$CWASTAT" in 0) ;; *) fail "check-word-audio.mjs exited $CWASTAT: $CWA";; esac
case "$CWA" in *"OBSERVED: 2264 clips, 2264 manifest entries, 2264 generation targets"*) ;; *) fail "the gate observed the wrong thing: $CWA";; esac
# exactly the ten new clips exist, and each of them decodes
TEN="$(node -e 'const fs=require("fs");const w=["after","deer","feet","glow","growl","harm","moon","nervous","scary","tight"];let n=0;for(const x of w) if(fs.existsSync("public/audio/words/"+x+".aac")) n++;console.log(String(n));')"
case "$TEN" in 10) ;; *) fail "only $TEN of the ten story-word clips exist";; esac
# and NONE of the four splitting surface forms was generated (FC-6, the B2 ruling)
SPLIT="$(node -e 'const fs=require("fs");const w=["closer","softly","suddenly","wings","glowing","glows","growls","tightly"];const bad=w.filter(x=>fs.existsSync("public/audio/words/"+x+".aac"));console.log(bad.length?bad.join(","):"none");')"
case "$SPLIT" in none) ;; *) fail "FC-6 VIOLATED -- inflected surface forms were generated and will split her dictionary: $SPLIT";; esac
# the drift control clip is OUTSIDE the repo and the shipped cat.aac is untouched
CATMD5="$(md5sum public/audio/words/cat.aac | cut -d' ' -f1)"
case "$CATMD5" in f83c679fa536608aa69b88343fdfcee8) ;; *) fail "the drift-control word's shipped clip was overwritten: $CATMD5";; esac
if [ ! -e C:/Users/dkreinov/finish-audio/drift/cat.aac ]; then fail "the drift control clip is missing -- the control was not actually run"; fi
if [ ! -s C:/Users/dkreinov/finish-audio/log/drift-check.txt ]; then fail "no drift-check transcript was kept"; fi
case "$(cat C:/Users/dkreinov/finish-audio/log/drift-check.txt)" in *"DRIFT CONTROL OK"*) ;; *) fail "the drift control transcript does not say it passed";; esac
case "$(cat C:/Users/dkreinov/finish-audio/log/generate.txt)" in *"wrote 10, skipped 2254"*) ;; *) fail "the generation transcript does not say 'wrote 10, skipped 2254'";; esac
case "$PORC" in " M data/story-words.json
 M public/audio/words/index.json
 M tests/reader-ui.test.js
 M tests/word-audio.test.js
?? public/audio/words/after.aac
?? public/audio/words/deer.aac
?? public/audio/words/feet.aac
?? public/audio/words/glow.aac
?? public/audio/words/growl.aac
?? public/audio/words/harm.aac
?? public/audio/words/moon.aac
?? public/audio/words/nervous.aac
?? public/audio/words/scary.aac
?? public/audio/words/tight.aac") ;; *) fail "step 2.6 write set is wrong. got:
$PORC";; esac
exit $RC
```

**NON-GOALS:** **no `CACHE` bump** (F1-1); no view, no CSS, no test *added*; no band file touched; no
existing clip re-recorded; no deploy; no `GET /api/profile`; **no surface form generated**; no retry
of a failed check.

---

# STEP 2.7 — PHASE CLOSE

**TIER:** ORCHESTRATOR. **REPO WRITE SET:** `.oplan/word-finish/` only (`phase-state.md`,
`journal.md`, `field-guide/index.md`) — **outside the awk filter, so `$PORC` stays empty**.

1. Re-run §VAL-F2 + the full acceptance list above. Gate name **`PHASE-2-CLOSE-OK`**, `exit $RC`.
2. Record the phase write set against `81fb743`:
   `git diff --name-only 81fb743 HEAD | awk '$NF !~ /^\.oplan\//' | LC_ALL=C sort` — **exactly**:
   `data/story-words.json`, `public/audio/words/index.json`, the ten `.aac`, `public/styles.css`,
   `public/views/reader.js`, `public/views/words.js`, `scripts/build-word-audio.js`,
   `scripts/check-word-audio.mjs`, `tests/reader-ui.test.js`, `tests/word-audio.test.js`,
   `tests/words-ui.test.js` = **21 paths, 0 deletions**.
3. Write into `phase-state.md`:
   * `BASE (phase 3): <the 2.7 commit>`; ledger **375 flat / 380 reported**; contrast **58**; quiz
     bank **62/84**; **manifest 2264 = clips on disk 2264**.
   * **FROZEN CONTRACTS gained this phase: FC-6** (base lemmas only in `data/story-words.json`,
     because a surface form splits her dictionary via `migrateWordKeys`) and **FC-5** (the §8 marker,
     now byte-gated against `design.md`).
   * **CARRIED OBLIGATION F1-1, ENLARGED:** phase 4 now owes the `v20 → v21` bump for **four**
     precached files — `styles.css`, `views/reader.js`, `views/words.js`, `views/trophies.js`.
   * **F1-2, F1-3, F1-4 all still open**, untouched by this phase. F1-4's machine-wide identity sweep
     must still be re-run at phase 4.
   * **NEW CARRIED OBLIGATION F2-1:** `Ellie` and `Sparkle` — her heroine's and pet's names — say
     `coming soon` and no top-up derived from the bands can ever fix them, because the audio manifest
     is derived from a profile with `learner: {}`. **Two clips at the next top-up close it.** Needs
     her live profile, so it is phase 4 or later. (SK-F2-5, RISK R3.)
   * **NEW CARRIED OBLIGATION F2-2:** `lib/quiz-item.js` resolves tokens through `resolveLemma`
     against an `allowed` set its **callers** supply. **Phase 3 must decide whether that set is the
     bands or the (now 2264-entry) manifest, and say so** — the two are no longer the same list.
4. **Correct the record, loudly** (FINDINGS 1 and 2): `design.md` §3 A's "~17"/16 and §9's
   "both consumers" are both wrong. The design is the orchestrator's document; the close proposes the
   correction and the orchestrator makes it.
5. **Field-guide candidates from this phase** — four, each earned by something that actually happened
   here:
   * **A LATER RUN'S BRIEF CAN LOSE AN EARLIER RUN'S RULING.** B2 was ruled on 2026-08-01 and was
     absent from `design.md`, from `phase-state.md` and from the phase-2 brief on 2026-08-02. A
     ruling that lives only in a journal is a ruling that will be re-made wrongly. **Rulings belong in
     `phase-state.md`'s FROZEN CONTRACTS the day they are made.**
   * **ASK THE QUESTION OF THE ARTIFACT, NOT OF THE ACCESSOR.** Design §9 asked "who calls
     `getAllowedSet()`" and got a true answer to the wrong question: the manifest's third consumer
     imports the JSON file directly. **Grep the FILE, not the function.**
   * **ABSENCE FROM A LIST IS NOT ABSENCE OF THE BEHAVIOUR.** "These 16 words are not in the
     manifest" was true; "these 16 words are silent" was false, because a transform sits between the
     list and the behaviour. Anything reached through `resolveLemma`, `tokenize` or `normalizeWord`
     must be measured **through** the transform. (This is lesson 2's *"anything reaching its subject
     through a transform fails OPEN"*, in its positive form.)
   * **WHEN THE TOOL YOUR GATE NEEDS DOES NOT EXIST, MEASURE THE CONTAINER.** There is no `ffprobe`
     here. An ADTS frame walk gives exact durations, and validating it against **all 2254** existing
     clips made it evidence rather than a guess.
6. Append the step summaries to `journal.md` in the house shape (`tier`, `did`, `repo write set`,
   `surprises`, `deviations`, `validation_first_try`, `retries`).

**FROZEN VALIDATION:** §VAL-F2 verbatim, then — **field guide 17: the close is a gate, not a report**:
```bash
case "$TOTAL"  in 380) ;; *) fail "close: expected 380 reported, got '$TOTAL'";; esac
case "$PLAN"   in 375) ;; *) fail "close: expected top-level plan 1..375, got '1..$PLAN'";; esac
case "$FAILED" in 0)   ;; *) fail "close: expected 0 failures, got '$FAILED'";; esac
case "$GTOTAL" in 380) ;; *) fail "close: APP_CODE=dummy expected 380, got '$GTOTAL'";; esac
case "$GFAILED" in 0)  ;; *) fail "close: APP_CODE=dummy expected 0 failures, got '$GFAILED'";; esac
case "$FLAT"   in 375) ;; *) fail "close: expected 375 flat, got '$FLAT'";; esac
case "$PUBN"   in 2382) ;; *) fail "close: expected 2382 files under public/, got '$PUBN'";; esac
case "$MAN" in "2264 2264 0 0 20019 6a885982b75e82ef1f00dc6768796ecf") ;; *) fail "close: manifest wrong: $MAN";; esac
case "$SBSTATE" in FIXTURE) ;; *) fail "close: SB=$SBSTATE";; esac
CWA="$(node scripts/check-word-audio.mjs 2>&1)"; case "$?" in 0) ;; *) fail "close: check-word-audio failed: $CWA";; esac
case "$CWA" in *"WORD AUDIO OK: 2264 clips, 2264 manifest entries"*) ;; *) fail "close: $CWA";; esac
# the whole-phase write set against the BASE, .oplan excluded, sorted, counted
WS="$(git diff --name-only 81fb743 HEAD | awk '$NF !~ /^\.oplan\//' | LC_ALL=C sort | wc -l | tr -d ' ')"
case "$WS" in 21) ;; *) fail "close: the phase write set is $WS paths, expected 21";; esac
DEL="$(git diff --diff-filter=D --name-only 81fb743 HEAD | wc -l | tr -d ' ')"
case "$DEL" in 0) ;; *) fail "close: $DEL files were DELETED across the phase; this phase deletes nothing";; esac
case "$PORC" in "") ;; *) fail "close: the tree must be clean outside .oplan. got:
$PORC";; esac
echo "PHASE-2-CLOSE-OK"
exit $RC
```

---

## GATE OR GUARD — every check in this phase, classified (field guide 2 and 15; Rule 6 Q8)

**GATE** = mutated, watched to fail, restored. **GUARD** = cannot be made to fail without removing
the thing it describes, or fails open. **The plan claims nothing as a GATE that was not seen to fail.**

| check | step | kind | seen to fail? |
|---|---|---|---|
| §VAL-F2 as a whole | all | **GATE** | **YES, today** — 5 mutated expectations → 5 `FAIL:` lines; clean+tail → 0, mutated+tail → 1 |
| manifest ↔ disk set equality | 2.1 | **GATE** | M2.1a (a stray `.aac`) |
| coverage `wordsToGenerate ⊆ clipsOnDisk` | 2.1 | **GATE** | M2.1b (`zzznotaword`) |
| **FC-6 split guard** | 2.1 | **GATE** | M2.1c — **reproduces the B2 defect on demand** (`softly: soft -> softly`) |
| `readStoryWords()` rejects rubbish | 2.1 | **GATE** | M2.1d (`deep breath`, a duplicate) |
| the generator is artifact-neutral | 2.1 | **GATE** | the manifest md5 pin — computed today, `8735a3c4…` either way |
| ADTS decode / truncation / sync | 2.2 | **GATE** | **YES, today** — 4 fabricated broken clips, each named correctly |
| non-silence (voiced seconds) | 2.2 | **GATE** | **YES, today** — a synthetic all-silence ADTS stream |
| plausible duration | 2.2 | **GATE** | **YES, today** — three clips concatenated → 4.224 s |
| sample rate / channels | 2.2 | **GATE** | **YES, today** — headers re-labelled 44100 Hz |
| manifest↔file correspondence | 2.2 | **GATE** | **YES, today** — a dead entry and an orphan clip, both named |
| `observed 0` refusal | 2.2 | **GATE** | M2.2b — an empty directory exits **1**, not 0 |
| the drift control | 2.2 | **GATE** | **YES, today** — 3× clip → exit 1 with four reasons; byte-copy → exit 0 |
| the control cannot write into `public/` | 2.2/2.6 | **GATE** | **YES, today** — both the checker's guard and the probe's guard fire |
| the re-expressed words-list pin | 2.3 | **GATE** | M2.3a — **already observed**: the shipped `renderList` emits `""` for the unknown row |
| field-guide-14 reachability | 2.3 | **GATE** | M2.3b |
| the frozen §8 CSS is byte-exact | 2.3 | **GATE** | M2.3c (`opacity: 0.55` → `0.5`) |
| the optimistic pre-manifest branch | 2.3 | **GATE** | fails if the fallback is removed; **executed** today (3 live, 0 `na`) |
| **the executed reader popup** | 2.4 | **GATE** | **YES, today** — run against the SHIPPED tree: `# pass 0 # fail 2`, with the right messages |
| byte-identical `saySlot` across views | 2.4 | **GATE** | M2.4b, and it already fails on the shipped tree (`saySlot is not a function`) |
| `data-say` ⇒ a clip exists | 2.4 | **GATE** | M2.3d / M2.4a |
| the ten really are ten | 2.6 | **GATE** | the count and the `??` list |
| **FC-6 at generation time** | 2.6 | **GATE** | the `$SPLIT` clause fires if any of the eight surface forms was generated |
| `cat.aac` never overwritten | 2.6 | **GATE** | the probe reads it back **after** writing and compares |
| the population drift check | 2.6 | **REPORT** | a fact for the orchestrator, not an automatic stop — **said so** |
| QZ-18 / `sw.js` / `PUBX` / `AUDBASE` md5s | all | **GATE** | **YES, today**, three of the five mutations |
| `MODEL`/`VOICE`/`INSTRUCTIONS` | all | **GATE** | **YES, today** — `nova` → `shimmer` fired |
| the six-needle source loops in `reader-ui`/`words-ui` | — | **GUARD** | source needles. They **fail open** and this plan says so. What proves the affordance is the executed popup |
| `src.includes('activePopup.canSay')` | 2.4 | **GUARD** | a needle. Kept, re-worded, and **not** relied on |
| the visual composite | 2.5 | **HUMAN** | no mechanical check can see it. That is why the step exists |
| **the clip says the right word** | — | **NOTHING** | **the agent cannot hear.** The owner waived it knowingly (design §11). **No check in this plan claims otherwise** |

## Rule 6, ANSWERED IN ONE LINE EACH

1. **When does `btn-say na` appear?** Whenever `resolveLemma` returns null — measured at **6 of 114
   distinct words (5.3%)** on a real chapter, all of them irregular inflections or proper nouns, and
   **only ever inside a popup she opened**. Accepted; SK-F2-5; the one dishonest case (her heroine's
   and pet's names) is named as RISK R3 / F2-1 rather than designed away.
2. **Popup only, or the words list too?** **Both** — R7 names the dictionary, §8 names the popup, and
   one word behaving two ways on two screens is the ambiguity the amendment removes. SK-F2-7.
3. **Where do the extras live?** `data/story-words.json`, validated by `readStoryWords()`; the routine
   top-up is `check-word-audio.mjs --missing <saved capture>` → append → re-run the generator. SK-F2-2.
4. **What does `deriveWordList()` mean now?** Nothing — it is **deleted**. Two concepts, two names:
   `wordsToGenerate()` and `clipsOnDisk()`. SK-F2-3.
5. **What does a half-finished run leave?** `manifest ⊆ disk`, always, because the manifest is written
   in a `finally` from the disk — the invisible failure mode, never a dead button. SK-F2-4.
6. **Ordering?** The manifest moves from **before** the loop to **after** it, in a `finally`. SK-F2-4.
7. **How does the honesty property survive?** Restated as **`data-say` ⇒ a clip exists on disk**, held
   up by four mechanisms and gated by four executed checks. SK-F2-9.
8. **Which gates were seen to fail?** The table above — **19 GATES, 12 of them already observed
   failing today**; 3 GUARDS declared as guards; 1 human gate; 1 thing nothing can check.
9. **`exit $RC`?** In every step's tail, in the same file as the preamble. Proved necessary by running
   §VAL-F2 alone: five `FAIL:` lines, **exit 0**.
10. **Instrumented sweeps?** Every one prints what it observed: `OBSERVED: N clips …`, the 20 270-form
    split sweep, `observed === 2` in the popup harness, `manifest.length > 2000`, and the checker
    **exits 1** if it observed 0.

---

## RISKS

**R1 — the clip says the wrong thing.** No check in this plan can hear. The owner waived the
listening gate knowingly (design §11). Blast radius one word; fixed by deleting one file and
re-running. **Unmitigated by design.**

**R2 — the drift band is a judgement, not a measurement.** [0.5, 2.0] cannot be validated without
spending money on repeated generations, which I did not do. Too tight ⇒ a false STOP (the executor
escalates, which is the safe direction). Too loose ⇒ subtle drift ships, which is inside R1.

**R3 — `coming soon` is a promise we cannot keep for her own names.** `Ellie` and `Sparkle` can never
enter a band-derived manifest. She will tap her heroine's name and be told "coming soon" until
someone adds the two names to `data/story-words.json`. **Recorded as F2-1.** Cost of the fix: two
clips.

**R4 — four precached files change with no `CACHE` bump.** Deliberate (F1-1) and safe **only because
phase 2 does not deploy**. If anyone deploys before phase 4's bump, phones serve a mixture. The
mixture happens to be harmless in this direction (old code + new manifest ⇒ more live buttons, all
backed by real clips) — but that is luck, not design, and it must not be leaned on.

**R5 — the plan pins md5s of edited source files.** That is only safe because those files are written
by frozen apply scripts I ran today, not by hand. **An executor who hand-edits will fail the pin.**
That is the intended behaviour, and the recovery is to run the apply script.

**R6 — `check-word-audio.mjs` imports `build-word-audio.js`.** If the guard at
`build-word-audio.js:146` (`isDirectRun`) were ever removed, running the *checker* would start
spending money. The guard is asserted by `tests/word-audio.test.js`'s existing resumability test and
by the fact that the whole suite imports the module 380 times per run without a network call.
**Named so nobody removes it.**

## BLOCKERS — orchestrator/owner rulings needed

**B-F2-1 (BLOCKS STEP 2.6, AND ONLY 2.6) — TEN OR SIXTEEN?** This plan executes the **ten**, on the
standing B2 ruling (`.oplan/word-polish/journal.md:41`) and on today's re-measurement. The brief says
sixteen. **The orchestrator must confirm the ten, or explicitly and in writing overrule B2** — in
which case FINDING 1's four splitting words (`closer`, `softly`, `suddenly`, `wings`) must be named
in the reversal, along with the measured consequence (`soft.taps` 6 → 5, a second dictionary entry).
**Steps 2.1–2.5 are unaffected either way and can start now.**

**B-F2-2 (blocks nothing; a record correction the orchestrator owns).** `design.md` §3 A and §9, and
`phase-state.md:38-48`, are wrong in the two ways FINDING 1 and FINDING 2 set out. A planner may not
edit the design. **Requested: correct both in place**, as was done for the D line numbers in phase 1.

## RECORD GAPS

1. **`phase-state.md:6` says `BASE (phase 2): dcf66a3`; HEAD is `81fb743`.** Harmless — the diff is
   `.oplan`-only, measured — but it is exactly the stale-pin shape field guide 4 warns about.
   Correct at the close.
2. **`design.md` §3 A still says the owner "must hear a sample before the batch is accepted"**, which
   §11 waived on 2026-08-02. Two clauses of the same document now disagree. §11 is later and wins;
   §3 A should say so in place.
3. **`lib/quiz-item.js` resolves against an `allowed` set supplied by `scripts/build-item-bank.js`
   and `scripts/quiz-topup.mjs`, which this planner did not read** (out of scope, and `scripts/` is
   phase 3's). After this phase the bands and the manifest are **no longer the same list**, so phase 3
   must state which one it means. **Carried as F2-2.**
4. **Nothing in the record says who owns `data/story-words.json` or when it grows.** This plan says
   it: the owner, via the top-up in SK-F2-2. That belongs in `docs/growth.md` at some point.

## WHAT THIS PLANNER COULD NOT MEASURE, STATED PLAINLY

1. **Whether a clip pronounces its word.** Nothing here can hear. R1.
2. **The run-to-run variance of `gpt-4o-mini-tts`.** It needs paid calls. R2. Every drift threshold
   that is a judgement is labelled as one.
3. **Her real chapters.** Phase 1 correctly removed the last copy of her data from this machine, and
   field guide 3 forbids reading `/api/profile`. SK-F2-5's density measurement therefore runs over
   the **synthetic** sandbox chapter and an adversarial probe, and says so. **The mechanism does not
   depend on it; the specific six words might differ in her real text.**
4. **Whether the marker looks right in a browser.** Step 2.5 exists because this is unmeasurable from
   here, and no assertion in this plan claims otherwise.
5. **The live deployment.** `magic-vet-v20` stays a hypothesis phase 4 confirms with `vercel inspect`.
6. **Whether her live profile currently holds `soft`, `sudden` or `wing`.** The word-polish
   orchestrator verified it against a capture on 2026-08-01; that capture is now deleted. **FC-6 does
   not depend on it** — the split is a property of `migrateWordKeys` and the manifest, and I executed
   that. But the *severity* of overruling B2 does depend on it, and I could not re-check it.
