# Plan — run `word-audio`

Base commit: `2c2f50a` + the brief commit (tree clean; 184 tests / 0 fail; contrast 52 ALL PASS;
LIVE at `magic-vet-v10`, deployment `dpl_h19vJfyq68GTanJMxhVUX7g8Z25p`).

Brief: `.oplan/word-learning-brief.md` (Mika's feedback, W1-W5). **This run delivers W1, W4, W5a
only.** W3 (story read-aloud) and W5b (the quiz) are later runs, by the owner's chosen order.

## The defect this run fixes

The core loop invites her to collect English words **she cannot pronounce**. Tapping a word adds it to
her dictionary and shows the Hebrew; nothing ever says the English. `docs/growth.md` — written last
run and still unsigned — never mentions audio at all. That is the hole.

## Owner decisions already taken (do not re-ask)

- **OD-A — the voice is OpenAI `gpt-4o-mini-tts`, voice `nova`**, with `build-tts.js`'s existing
  instruction, so the dictionary sounds like the same teacher as the placement exam. Chatterbox
  (the GCXTiler voice) was rejected: it needs a GPU box and would differ from the exam.
- **OD-B — pre-generate ALL 2254 allowed words, not on demand.** Both cost pennies; the deciding
  factor is that a child taps a word *because she cannot read it*, and a 1-2 s TTS wait every time is
  the wrong trade for saving ~$0.37. Pre-generating also adds no new runtime failure mode.
- **OD-C — cost approved at ~$0.47**, measured (not estimated) from a 20-word probe: mean 0.832 s of
  audio per word, 2254 words = 31.2 min, at the published $0.015/min. My first estimate of $0.37 was
  27% low because I extrapolated from the six short exam words; the owner asked me to verify and the
  verification is what caught it.

## Measured facts that shape the plan

- **Format: AAC.** Measured on one word: mp3 40320 B, flac 38717 B, opus 13745 B, **aac 8904 B**.
  Scaled to the mean word, the full set is ~52 MB as mp3 and **~12 MB as aac**. There is no ffmpeg on
  this machine (verified — `ffprobe` is absent), so re-encoding is not an option; the lever is
  `response_format`. AAC plays natively in Android Chrome, which is her device.
- **Audio is NOT offline either way.** `PRECACHE` is frozen by `docs/visual-design.md` §8 and contains
  no audio, so the six exam clips already stream over the network. Pre-generating buys instant
  playback, not offline playback. Stated because I earlier implied otherwise.
- **`mark-known` already exists** at `api/profile.js:51` and has NEVER been called from `public/`.
  W5a is wiring, not new backend work.
- **The example sentence is free.** She taps the word inside a chapter, so the sentence she tapped it
  in is the best possible example and costs no LLM call.

---

PHASE 1: she can hear every word she collects, see it in a sentence, and say she knows it
GOAL: tapping a word in the story speaks it aloud in `nova`; her dictionary shows each word with a
play button and the sentence she first met it in; and she can promote a word to "I know it", which
finally calls the `mark-known` endpoint that has sat dead since it was written. `npm test` goes
184 -> 196, `public/sw.js` ships exactly one `CACHE` bump (`magic-vet-v10` -> `v11`), and the contrast
gate still prints `ALL PASS` over exactly 52 pairs.

ACCEPTANCE CRITERIA (frozen before execution)
1. `STEP-1.1-OK` .. `STEP-1.6-OK` all print, each re-run by me.
2. `npm test` prints `# fail 0` and `# pass 196` (184 +4 +0 +3 +2 +3 +0; see WA-7).
3. `node scripts/check-contrast.mjs` exits 0, `ALL PASS`, exactly 52 `^PASS` lines.
4. `grep -qF -- 'const CACHE = "magic-vet-v11";' public/sw.js`; no `magic-vet-v10` under
   `public/ tests/`; `git diff <base> -- public/sw.js | grep -c '^[+-][^+-]'` is exactly `2`;
   `PRECACHE` byte-identical and no audio path added to it.
5. `ls public/audio/words/*.aac | wc -l` is exactly **2254**, every file is valid ADTS AAC (first two
   bytes `FF F1` or `FF F9`), and the total directory size is under **20 MB**.
6. Every generated filename corresponds to a word in the A2 allowed set, and every A2 allowed word has
   a file — proven by a test that re-derives the set from `lib/story.js` + the band JSONs, not from a
   hardcoded list.
7. Nothing under `data/`, `assets/`, `docs/` changed. `public/index.html` and `public/styles.css`
   byte-unchanged (WA-3 reuses existing classes; see the step's non-goals).
8. `.data/profile.json` does not exist and no step runs a server against the real data dir.
9. The learner's stored profile schema stays backward compatible: a profile written BEFORE this run
   still validates. Proven by a test that validates a fixture with no `context` field.

FROZEN CONTRACTS

**WA-1 — the audio files.** `public/audio/words/<lemma>.aac`, one per word in the A2 allowed set,
lower-case lemma, `response_format: "aac"`. The six existing `public/audio/word-*.mp3` exam clips are
NOT touched, NOT moved and NOT regenerated — the exam keeps working exactly as it does today.

**WA-2 — the generator.** `scripts/build-word-audio.js`, ESM, zero npm dependencies (global `fetch`),
styled after `scripts/build-tts.js`. It DERIVES its word list by importing `buildAllowedSet` from
`lib/story.js` with `data/band1.json` + `data/band2.json` at band `A2`, filtering to
`/^[a-z]+(?:'[a-z]+)?$/` — never a hardcoded list, so it cannot drift from the real allowed set.
Model `gpt-4o-mini-tts`, voice `nova`, and `build-tts.js`'s existing instruction string, all three
copied verbatim so the dictionary matches the exam. **RESUMABLE AND IDEMPOTENT: it skips any word
whose `.aac` already exists.** This is load-bearing, not a nicety — the corporate TLS path dropped the
socket after 5 words during the cost probe, and without resume a retry re-pays for everything.
**Retry up to 4 times per word with linear backoff** on any network error or non-2xx. Requires
`OPENAI_API_KEY`; exits 1 with a clear message if absent. Prints progress and a final
`wrote N, skipped M` line. Never logs the key.

**WA-3 — the play affordance.** A `<button class="btn-say" data-say="<lemma>" aria-label="הקשיבי למילה">`
rendered (a) in `public/views/reader.js`'s translate popup and (b) on every row of
`public/views/words.js`. Clicking it plays `/audio/words/<lemma>.aac` via `new Audio(...)`.
**If the file 404s or playback rejects, the button silently does nothing** — a missing clip must never
break the story or the dictionary. Words outside the allowed set (a chapter may carry up to 3, per
`lib/story.js:188`) simply have no file, and that is the accepted behaviour for this run.
`.btn-say` is the ONE new CSS class this run adds; it uses only existing `:root` tokens, no raw hex,
no `color-mix()`, and the contrast gate stays at 52 pairs because it introduces no new
foreground/background pair (it inherits `--color-ink` on `--color-card`, already measured).

**WA-4 — the example sentence.** `POST /api/profile {action:"word-tap"}` accepts an OPTIONAL
`context` string. `applyWordTap` stores it as `words[lemma].context` **only when the word is first
seen and only when `context` is a non-empty string**, truncated to 200 characters. It is never
overwritten on a re-tap. `validateProfile` accepts a word entry with or without `context` — a profile
written before this run must still validate (criterion 9). `reader.js` sends the sentence it extracted
around the tapped word; `words.js` renders it under the word as
`<p class="word-context">…</p>`, escaped, and renders nothing when absent.

**WA-5 — "I know it".** A `<button class="btn btn-ghost" data-action="know" data-lemma="…">יודעת את זה</button>`
on each `status === "learning"` row in `words.js`, which POSTs
`{action:"mark-known", lemma}` to `/api/profile` — the endpoint that already exists at
`api/profile.js:51` and has never had a caller — then re-renders. Known rows show no button.
`api/profile.js`, `lib/profile.js`'s `markWordKnown` and their tests are NOT modified by this step.

**WA-6 — one cache bump.** `magic-vet-v10` -> `magic-vet-v11`, `PRECACHE` byte-identical, no audio
added to it (thousands of clips must never be precached).

**WA-7 — the test ledger.** 184 today. 1.1 +4 -> 188. 1.2 +0 -> 188. 1.3 +3 -> 191. 1.4 +2 -> 193.
1.5 +3 -> 196. 1.6 +0 -> 196.

---

STEP 1.1: the generator script (no audio generated yet)
  files: `scripts/build-word-audio.js` (NEW), `tests/word-audio.test.js` (NEW).
  goal: a committed, reviewable, resumable generator that derives its own word list.
  validation: `node --check`; the script exits 1 with a clear message when `OPENAI_API_KEY` is unset;
    a DRY-RUN mode (`WORD_AUDIO_DRY_RUN=1`) prints the derived word count as exactly `words: 2254`
    without making any network call; 4 new tests pass; `# pass 188`.
  tier: WORKER · depends on: nothing.

STEP 1.2: generate the audio (ORCHESTRATOR-RUN, this is the paid step)
  files: `public/audio/words/*.aac` (2254 NEW files).
  goal: every allowed word has a clip. Run `set -a; . ./.env; set +a; node scripts/build-word-audio.js`.
  validation: exactly 2254 `.aac` files; every one valid ADTS AAC; directory under 20 MB; every
    filename in the derived set and every derived word present; `# pass 188` still.
  ORCHESTRATOR-RUN because it spends the owner's money and must be watched; resumable so a dropped
  socket costs nothing. depends on: 1.1 COMMITTED.

STEP 1.3: the profile stores the sentence a word was met in
  files: `lib/profile.js`, `api/profile.js`, `tests/profile-mutations.test.js`.
  goal: WA-4's schema change, backward compatible.
  validation: a pre-run fixture without `context` still validates; `context` is stored on first tap,
    not overwritten on re-tap, ignored when empty, truncated at 200 chars; `# pass 191`.
  tier: WORKER · depends on: 1.2 (so the suite total is stable).

STEP 1.4: reader.js speaks the word and sends the sentence
  files: `public/views/reader.js`, `public/styles.css`, `tests/reader-ui.test.js`.
  goal: WA-3's button in the translate popup, plus the `context` field on the word-tap POST.
  validation: the button and `new Audio` call present; `/audio/words/` path built from the lemma;
    playback failure swallowed; `context` sent; `.btn-say` added to styles.css with no hex and no new
    token; contrast 52 ALL PASS; `# pass 193`.
  tier: WORKER · depends on: 1.3 COMMITTED.

STEP 1.5: the dictionary speaks, shows the sentence, and lets her promote a word
  files: `public/views/words.js`, `tests/words-ui.test.js`.
  goal: WA-3 (b) + WA-4 rendering + WA-5's button.
  validation: play button per row; `word-context` rendered only when present and escaped;
    `mark-known` POSTed with the lemma; the button absent on known rows; `# pass 196`.
  tier: WORKER · depends on: 1.4 COMMITTED.

STEP 1.6: cache bump v10 -> v11 (ORCHESTRATOR-RUN, two lines, fully gated)
  files: `public/sw.js`, `tests/shell.test.js`. depends on: 1.5 COMMITTED.

PHASE 2 SKELETON — deploy. The recipe is in `.oplan/poc-basics/journal.md` and
`.oplan/parent-access/journal.md`: record the outgoing deployment via `vercel inspect` BEFORE the
call; `"$(npm prefix -g)/vercel" deploy --prod --yes`; verify md5 against the WORKTREE for the changed
`public/` files; live `/sw.js` contains `magic-vet-v11`; spot-check that a handful of
`/audio/words/<lemma>.aac` return 200 with `content-type: audio/aac`; `/api/health` exact payload;
`/api/chapter` ping -> 401. Never request `/api/profile`, never open a browser on production, never
run `vercel env`. **Watch the deploy size** — this run adds ~12 MB of audio.

RISKS
- **AAC might not play on her phone.** Mitigated: valid-ADTS is gated mechanically, AAC is native to
  Android Chrome, and the fallback is one `response_format` flag plus a re-run of an idempotent
  script. But it is the one thing no local gate can prove — it needs her device, and the failure mode
  is silent (a button that does nothing), which is exactly why WA-3 makes silence safe rather than
  fatal.
- **2254 new files in one commit.** Reviewable only in aggregate; that is what criteria 5 and 6 are
  for. They are derived artifacts, regenerable from a committed script.
- **A word with an apostrophe** (`let's`) becomes a filename. Verified it is the only such word in the
  set; `let's.aac` is a legal filename on Windows and on Vercel, and the URL is percent-encoded by
  `encodeURIComponent` in WA-3.
- **The profile schema change touches live data.** WA-4 is additive and optional-only, and criterion 9
  freezes backward compatibility with a fixture.

---

## ORCHESTRATOR AMENDMENTS — plan reviewer returned `fix-first` with 6 findings, ALL VALID

The gate did its job before a line was written. Every finding is answered here; the amendments below
override anything above that contradicts them.

**A1 — `mark-known` REQUIRES a `source`, and my spec omitted it.** Verified: `lib/profile.js:12` is
`const WORD_SOURCES = ['placement', 'tap', 'band']`, `api/profile.js:56` returns
`400 source required` when it is missing, and `markWordKnown` itself throws `invalid source`. As
written, WA-5's button would have failed on EVERY click, in production, silently from her point of
view. **DECISION: send `source: "tap"`.** It is in the enum and it is accurate — the word entered her
vocabulary by being tapped (`lib/profile.js:191` already stamps `source: 'tap'` on a tap). The POST
body is frozen as exactly `{ action: "mark-known", lemma, source: "tap" }`.

**A2 — `.btn-ghost` does not exist in this repo.** Verified: `public/styles.css` defines only `.btn`,
`.btn:active`, `.btn-primary`, `.btn-primary:hover`, `.btn[disabled]`. **DECISION: this run adds
exactly TWO new classes, `.btn-say` and `.btn-know`, and WA-3's claim of "the ONE new CSS class" is
withdrawn.** Both are appended to `public/styles.css` **by step 1.4 only**, so no two steps write that
file; step 1.5 then touches `public/views/words.js` alone and its file list is unchanged.

**A3 — `<button>` does NOT inherit `color`; this is field-guide lesson 8 and I violated it.** A bare
`.btn-say` would render at the UA's `buttontext`, off-token, and `check-contrast.mjs` would never see
it because it only measures its fixed 52-pair list. **DECISION: both new classes MUST declare
`color` and `background` explicitly, and must use a pair the gate already measures.** Frozen:
`color: var(--color-ink); background: var(--color-surface-2);` — "ink on surface-2" is an existing
measured pair, so the gate stays at exactly 52 and no new token is introduced. No raw hex, no
`color-mix()`.

**A4 — criterion 7 contradicted its own contract.** It demanded `public/styles.css` be byte-unchanged
while WA-3 adds a class to it. **CORRECTED criterion 7:** nothing under `data/`, `assets/`, `docs/`
changed; `public/index.html` byte-unchanged; `public/styles.css` changes ONLY by appending the two
classes of A2/A3 at the end of the file, and `git diff <base> -- public/styles.css` must show
**additions only, zero deletions**.

**A5 — the sentence-extraction rule was undecided.** `reader.js` has no sentence splitting anywhere; it
holds only the normalised tapped word and the raw `chapter.text`. **DECISION, frozen — no regex
escaping, so `let's` cannot break it:**
```js
function sentenceFor(text, word) {
  const target = String(word).toLowerCase();
  for (const s of String(text).split(/(?<=[.!?])\s+/)) {
    if (s.toLowerCase().split(/[^a-z']+/).includes(target)) return s.trim().slice(0, 200);
  }
  return "";
}
```
The FIRST matching sentence wins. Word matching is by tokenising the sentence on `[^a-z']+`, so it is
whole-word by construction and needs no `\b` (which behaves badly around apostrophes). An empty result
means the `context` field is OMITTED from the POST entirely, not sent as `""`.

**A6 — truncation unit was imprecise.** Frozen: `.slice(0, 200)` — JavaScript code units, applied in
`sentenceFor` above and re-applied defensively in `applyWordTap`. Story text is ASCII by construction
(`lib/story.js`'s allowed-word rule), so code units and bytes coincide in practice; the plan now says
which one it means rather than implying a precision it did not have.

**WHAT THE REVIEWER CONFIRMED (not findings, recorded because they were load-bearing assumptions):**
the 2254-word count and `let's` as the sole apostrophe word are both empirically correct; `mark-known`
truly exists, truly has no caller in `public/`, and truly promotes learning -> known; `validateProfile`
has NO field allowlist, so an optional `context` really is backward compatible; and the test-count
ledger 184 -> 196 sums correctly.

**Test ledger unchanged at 196**, but step 1.4 now also asserts the two new CSS classes and that the
contrast gate still prints 52 — assertions inside its existing 2 tests, not new tests.

**A10 — criterion 6 demands a test that the frozen ledger forbids, and the test it demands cannot be
written the obvious way.** Criterion 6: *"every A2 allowed word has a file — proven by a test that
re-derives the set from `lib/story.js` + the band JSONs, not from a hardcoded list."* But step 1.1's
four tests only read `build-word-audio.js` as text and run its dry run; **none of them looks at
`public/audio/words/` at all**, and WA-7 gives step 1.2 **+0 tests**. So as frozen, criterion 6 is
unprovable: it names an artifact that does not exist and forbids creating it.

A one-off check by me would prove the sets match *today*. It would not stop them drifting: add a word
to `data/band2.json` in some later run and the dictionary silently gains a word with no clip, whose
play button does nothing — the exact silent failure WA-3 makes safe but never detects. The plan's own
RISKS section says the 2254 files are *"reviewable only in aggregate; that is what criteria 5 and 6
are for"*, so a durable gate is plainly what criterion 6 was for.

**DECISION: step 1.2 adds exactly ONE test, and the ledger moves 196 -> 197.** Criterion 2 is
corrected to `# pass 197`. This is a frozen criterion changing during execution — the "work redefines
done" hazard — so, as with A7, the justification is recorded rather than assumed: the change makes
the gate STRICTER, not looser, and it is the criterion's own stated intent.

**Second finding, and the reason this is not a one-line test:** the obvious test would re-derive the
allowed set itself. Field-guide 6 forbids exactly that — *"NEVER verify a claim about the code against
your own RE-IMPLEMENTATION of it"* — and that lesson was learned on this very regex (`^[a-z]+$` is not
`[a-z]+(?:'[a-z]+)?`, and the proxy put a wrong number in all three bands). The test must call the
generator's OWN `deriveWordList`. But `scripts/build-word-audio.js` ends in a bare `main()` at module
scope, **so importing it starts generating audio** — a test that spends money.

**DECISION: step 1.2 also edits `scripts/build-word-audio.js` to (a) export `deriveWordList` and
(b) guard `main()` behind a direct-execution check**, so the module is safe to import. The generator's
behaviour when run as a script is unchanged, which the existing dry-run test still pins.

**A8 — step 1.3's file list left the `api/profile.js` wiring with NO test.** WA-4 requires the
handler to forward `context` to `applyWordTap`, but 1.3's files were `lib/profile.js`,
`api/profile.js`, `tests/profile-mutations.test.js` — and `profile-mutations.test.js` imports
`lib/profile.js` directly, never the handler. The one line `context: body.context` in `api/profile.js`
would ship with zero coverage; the natural patch is a source-grep, which field-guide 4a says catches a
missing decision and never a wrong one. **DECISION: step 1.3 also edits `tests/api-profile-post.test.js`,
adding `context` to the POST body of the EXISTING test `'word-tap POST creates a learning word with
taps=1'` (line 63) and asserting the stored entry carries it.** That file already drives the real
handler through a mock req/res with `DATA_DIR` pointed at a temp dir, so this is a behavioural test,
not a grep. It is an assertion inside an existing test, so **the ledger is unchanged: 1.3 is still
+3 -> 191.**

**A9 — steps 1.3-1.5 run WHILE step 1.2 is still generating.** On resume, 1.2 was NOT complete: a
generator from the previous session was still running (511/2254 files, ~54/min). The plan makes 1.3
"depend on 1.2", but states the reason as "so the suite total is stable" — and 1.2 adds +0 tests, so
that reason is vacuous. 1.3-1.5 touch `lib/`, `api/`, `public/views/`, `public/styles.css` and
`tests/`; 1.2 writes only `public/audio/words/*.aac`. Disjoint. **DECISION: run them concurrently and
verify 1.2 at the end, before 1.6.** No second generator is started — that would race the running one
and re-spend. 1.2's own gate (criteria 5 and 6) is unchanged and still runs before the cache bump.

**A7 — criterion 5's 20 MB bound was WRONG, and it is my second under-projection this run.**
MEASURED across the first 88 generated files: mean **12,189 B** per clip (min 5,416, max 22,779),
projecting the full set at **26.2 MB**, not the 12 MB I claimed. The 12 MB figure came from
extrapolating ONE word (`apartment`, 8,904 B) — the identical mistake that made me quote $0.37 when
the real cost was $0.47, which the owner caught by asking me to verify. The pattern is now explicit:
**I keep projecting from a single unrepresentative sample, and measurement keeps catching me.**
**CORRECTED criterion 5:** exactly 2254 `.aac` files, every one valid ADTS AAC (`FF F1`/`FF F9`), and
the directory **under 30 MB** — a bound taken from the measured mean plus headroom, not from a guess.
This RELAXES a frozen criterion, which is the "work redefines done" hazard, so the justification is
recorded rather than assumed: the bound was only ever a proxy for "do not bloat the repo", 26 MB is
half of what mp3 would have cost (~52 MB), there is no ffmpeg here to re-encode, and opus measured
LARGER than aac per word. No decision anywhere in this run changes at 26 MB versus 20 MB. If a future
run gets ffmpeg, re-encoding this directory at 64 kbps mono is the obvious win.
