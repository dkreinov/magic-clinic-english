# Journal — run `word-audio`

## Phase 1 — "she can hear every word she collects" — ACCEPTED

Base `f5d8ae7`. Delivered as commits `791c19d` (1.3), `e139052` (1.4), `10d9cab` (1.5),
`9983137` (1.6), `28140be` (1.2). All nine acceptance criteria re-run by me in one gate:
`PHASE-1-ALL-CRITERIA-OK`. 197 pass / 0 fail, contrast 52 `ALL PASS`, 2254 clips, 26.8 MB.

### What the resume actually found

The handoff said step 1.2 was done and to verify 2254 clips. **It was not done: 454 existed and a
generator from the previous session was still running**, ~54 clips/min. I did not start a second
generator — that would have raced the live one and re-spent the owner's money. It finished on its
own at `wrote 2254, skipped 0`, zero retries.

### The defect the frozen gate would have passed (the important one)

Criterion 5 asks only that each file start `FF F1`/`FF F9`. **A valid ADTS header says nothing about
whether the clip contains speech.** There is no ffmpeg on this machine, but ADTS frames are
self-describing — 1024 samples each, and the sample rate is in the header — so durations are
computable in plain JS. The duration histogram was not a speech distribution:

```
 4fr(0.17s): 1     9fr(0.38s): 33    16fr(0.68s): 5
 5fr(0.21s): 1    10-15fr:      0    17fr(0.73s): 18
 6,7,8fr:    0                       19fr(0.81s): 30
```

A spike of 33 at *exactly* 9 frames with empty neighbours on both sides is a truncation artifact, not
fast speech. Confirmation: single-letter `a` takes 44 frames (1.88 s), so `university` in 9 frames
(0.38 s) is impossible; `check` at 4 frames is 170 ms, too short to contain the word. Four clips
(`car`, `seen`, `keyboard`, `skin`) were also ~97 B/frame against a normal ~325 — near-silence.

**36 clips affected**, including `car`, `check`, `road`, `thank`, `great`, `here`, `were`, `its`,
`plan`, `free` — common words a beginner taps constantly. The failure mode is a button that plays
0.38 s of nothing. WA-3 deliberately makes a missing clip *silent*, so nothing in the app, and no
local gate, would ever have reported it. She would have decided the button was broken.

Fixed by deleting the 36 and re-running the generator (resumable, so ~1 cent). 35 came back correct;
`chain` truncated a second time and needed one more attempt. Shortest clip is now 0.68 s and the
9-frame spike is gone. Originals kept outside the repo, in the session scratchpad.

**Lesson for the field guide: a format gate is not a content gate.** "Valid ADTS" was chosen because
it was mechanically checkable, and it passed 36 broken files.

### Cost: the third under-projection of this run

Measured from the finished set: **53.9 minutes of audio, ~$0.80**, against OD-C's approved ~$0.47
(31.2 min). OD-C's 0.832 s/word came from a 20-word probe; the true mean is 1.44 s/word. The run's
own record now reads: $0.37 -> $0.47 (owner caught it), 12 MB -> 26 MB (A7), 31 min -> 54 min (here).
Every one was an extrapolation from a small or unrepresentative sample, and every one was caught by
measuring the finished artifact. The money is already spent; this is recorded because the owner
approved a number that turned out to be 70% low.

### Amendments I had to make (all recorded in plan.md)

- **A8** — step 1.3's file list left the `api/profile.js` wiring with no test at all; the natural
  patch was a source-grep, which field-guide 4a says catches a missing decision and never a wrong
  one. Added an assertion to an existing handler test instead. Ledger unchanged.
- **A9** — ran 1.3-1.5 concurrently with 1.2's generation. The stated dependency was "so the suite
  total is stable", and 1.2 adds +0 tests, so it was vacuous; the file sets are disjoint.
- **A10** — criterion 6 demanded a test that WA-7's ledger forbade. Resolved in favour of the
  criterion (the gate gets stricter, not looser): **ledger 196 -> 197**. The test calls the
  generator's own `deriveWordList`, because re-deriving the set inside the test is verifying code
  against a re-implementation of itself — field-guide 6, the lesson that put a wrong count in all
  three bands. That required exporting it and guarding `main()` behind a direct-run check: the module
  ended in a bare `main()`, so importing it would have started generating audio.

### Smaller things worth knowing

- Commit `e0b23f1` from the previous session, labelled as an oplan doc correction, had silently swept
  in **115 audio files** that happened to exist mid-generation. Nothing is wrong with the tree (all
  2254 are tracked), but the commit does not say what it contains.
- `reader.js`'s `normalizeWord` strips `[^a-z]`, so a tapped `let's` normalises to `lets` — the one
  apostrophe word in the set is unreachable from the reader, and `lets.aac` does not exist. Its
  button is silently inert, which is WA-3's accepted behaviour. `encodeURIComponent` is still in
  place for the dictionary path, where the real lemma can appear.
- `sentenceFor` now runs inside the save handler's `try` **before** the POST, so a throw there would
  skip the save. It cannot throw in practice (`String()` coerces everything) and the pre-existing
  `catch` was already silent, so behaviour on failure is unchanged.
- The step 1.5 worker caught a genuine contradiction in my own packet: I asked it to assert no
  `color-mix()` anywhere in `words.js`'s `VIEW_STYLE`, but the pre-existing `.word-badge` rules
  already use it, so that check could never have passed. It scoped the check the way my validation
  script actually did and flagged the discrepancy instead of quietly widening or dropping it.

### Verification stance

Every worker claim was re-run by me, not taken on report. Two worker "seen to fail" proofs were
weaker than they looked and I re-did them: step 1.4's stash test failed the whole *file* to load
(193 -> 187, `fail 1`) rather than exercising the assertions, so I reverted `styles.css` alone and
confirmed the test fails as an assertion (192 / `fail 1`). Hebrew was never anchored on terminal
output: the frozen strings live in a scratchpad file, workers copied from the file, and I verified
byte-equality with `grep -F -f` plus a `comm` of every non-ASCII run before and after — nothing
removed or altered, additions exactly the frozen tokens.

## Phase 3 — "the word she taps is the word she hears" — ACCEPTED

Opened by Mika's own testing, which found in minutes what none of my gates found: `feels` and
`suddenly` were silent. Root cause was mine, and so was the gate that hid it.

**I generated one clip per LEMMA and the reader plays the SURFACE FORM.** `lib/story.js`'s prompt
says, in the file I read while planning, `- Use ONLY words from the ALLOWED WORD LIST (inflected
forms are allowed).` Every plural, past tense, `-ing` and `-ly` form in the story had no clip.

**The worse half: criterion 6 froze the mismatch.** It asserted "every filename is an allowed word
and every allowed word has a file" — which was true, and irrelevant, because it never asked the
question that mattered: *does the word on screen have a clip?* A gate that pins the wrong invariant
is worse than no gate at all, because it makes the defect look verified. I wrote that criterion,
amended it twice (A10) to make it stricter, and never noticed it was measuring the wrong thing.

Fixed with a resolver whose safety property is that **exact match is tried first**: only a word that
is NOT in the set is ever de-inflected, and only into a candidate that IS. That is what keeps `bus`,
`this`, `glass`, `across`, `carpet`, `sunday` and `carrot` intact, verified over all 2254 set words.
The naive longest-prefix rule `findInGlossary` already uses for translations was rejected — it fails
`stories` and `making`, and turns `carpet` into `car`. Cost nothing: no new TTS.

Two things I nearly got wrong and a test now pins:
- **Save the lemma, search the sentence by the surface form.** The chapter says "feels"; searching it
  for "feel" finds nothing, so swapping them makes `context` silently empty forever. `wordTapBody` is
  exported so the pair is tested by calling it, and it was seen to fail when swapped.
- **The migration must never drop a key it cannot resolve.** Losing a word she collected would be far
  worse than a silent button.

**A11 — I had to stop and ask.** `public/lemma.js` and `public/words-index.js` are imported by the
precached views, `app.js` imports the views statically, and `sw.js` never calls `cache.put` — so two
un-precached modules would have turned the offline shell from an error card into a blank page. But
`docs/visual-design.md:301` froze `PRECACHE` absolutely and is signed off, so it was not mine to
override. Put to the owner with the alternatives; they chose to add the two modules. The doc was
AMENDED to describe the new exception rather than left contradicting the code.

**The lesson that generalises, and it is the same one twice.** Phase 1: "valid ADTS header" passed 36
clips containing no speech — a FORMAT gate is not a CONTENT gate. Phase 3: "filenames == allowed set"
passed a set that didn't match the words on screen — a CONSISTENCY gate is not a USE gate. Both gates
were chosen because they were easy to check mechanically, and both measured something adjacent to
what mattered. **Ask what the child experiences, then gate that.** An eleven-year-old found both.
