# STATUS — word-polish (photograph of now, 2026-08-01)

**IT IS LIVE.** The three fixes she and you reported are on the server, proved byte-for-byte, and
her profile came through the deploy **byte-identical**. The run is paused at one step: you looking
at it on a real phone.

## What changed for her

| what she reported | what now happens |
|---|---|
| "the shelf picture doesn't look like a shelf" | the trophies banner has its own style with no bottom fade — the shelf edge and lights survive |
| "at the end of each chapter I get the same exact questions" | the quiz draws from **that chapter's own words** first, and never asks the same four twice in a sitting |
| tapping a word should read it aloud | the speaker button now appears **only when a recording actually exists**, so she never presses a dead button |

## Proof, not assurance

- ONE deploy: `dpl_6NgAGpyk18SqYrQv7fbTwpZZiX3J`, `magic-vet-v19`, aliased and Ready.
- All **4** changed files are byte-identical live vs the tested tree. `v19` present once, `v18` gone.
- **15/15** pre-downloaded files answer. **9/9** trophy pictures answer with the right bytes.
- The audio manifest and 3 sample clips answer with the right bytes — **no previous deploy ever
  checked this**, and if that list went missing every speaker button would silently vanish.
- Negative control: a made-up address still returns 404, so the sweep is not a 200-for-everything.
- The profile comparator was made to fail 5 rigged cases before being trusted (8/8).
- Read-back R1: **C2 and R1 are byte-identical**, sha256 `400d67d2…`. Nothing was lost.
- 358 tests pass, 0 fail; contrast 58 pairs; quiz bank 62 files / 84 items.
- The half-applied bump was **watched failing** before the real edit, and both files landed on md5s
  an independent agent pinned before execution.

## What is NOT fixed

1. **She still cannot hear ~17 story words** (`moon`, `deer`, `wings`, `scary`, …). What changed is
   honesty, not coverage: the button is now absent rather than dead. Recording them is its own run —
   the script rewrites the whole master list every time it runs, which is why phase 2 was stopped.
2. **The chapter quiz has almost nothing of hers to ask yet.** Of her ~40 words, only 1 has a quiz
   item. So the chapter-first rule will usually fall through to the global pool until items exist.
   This is the strongest argument for the next run.
3. Grey-card contradiction (returns whenever a new trophy is added). Learner R2 (story reloads).

## Open

- **3.7** — you look at it on your phone. Tapping a word and pressing 🔊 do **not** write her
  profile; save / answering a quiz / generating a chapter **do**.
- **3.8** — after she next uses the app, one more read-back (the third and last authenticated GET).
- **D27** — the profile copies on this machine: keep or delete? Asked fresh, never assumed.

## Newly measured, for the next run

Live `/sw.js` is `Cache-Control: public, max-age=0, must-revalidate` and its Etag equals the file's
md5. So the new worker is revalidated on every visit: she gets v19 on her next session after one
automatic reload. No project phase had ever measured this.
