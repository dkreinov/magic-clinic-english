# STATUS — word-trophies (photograph of now, 2026-07-31)

**IT IS LIVE, AND IT WORKS.** Mika's trophies screen shipped, and her first six trophy levels have
been awarded by the real server and verified. The whole run — engine, artwork, screen, celebration,
sound, deploy — is done. Nothing is outstanding except a short list of small improvements you have
already seen and parked.

## What she has now

A fourth tab, `הגביעים שלי`, with a shelf of eight trophies. Six levels are earned and ringed:

| trophy | level |
|---|---|
| מתמידה — showing up | bronze |
| רצף קסום — days in a row | bronze |
| אוצרת מילים — words known | bronze **and silver** |
| בלשית מילים — words investigated | bronze |
| הרפתקנית — chapters read | bronze |

The other three (`אלופת התרגול`, `מתאמנת אמיצה`, `באמת יודעת`) are still to come, shown greyed —
the same picture dimmed, never a sadder one.

When she earns one, the screen dims, a ray fan turns behind the trophy, it pops in with its
bronze ring, her Hebrew name for it rises underneath, and a short rising chime plays. One tap
dismisses it. She gets one at a time, never a pile.

## Proof, not assurance

- Her profile was photographed before the deploy and read back twice after. **Nothing was lost.**
  Immediately after shipping it was **byte-identical** to the photograph.
- Every one of the 16 changed files is **byte-identical** live to what was tested.
- All 15 pre-downloaded files answer; all 9 trophy pictures answer with the correct bytes.
- Every trophy level the server stamped is one the engine agrees she earned — **no invented
  awards**, checked by recomputing from her real data.
- 349 tests pass, the colour-contrast gate passes 58 pairs.

## Known and parked (nothing here blocks anything)

1. **The shelf picture doesn't read as a shelf** — the frame it borrows fades out its bottom,
   erasing the shelf edge and lights. Your call, recorded, fix pending.
2. **Trophy cards can briefly show "target reached" while greyed** — harmless now, self-cleared
   when she used the app, but it returns whenever a NEW trophy is added to the list.
3. **The end-of-chapter quiz repeats** (she reported this). Diagnosed: the questions are picked
   in a fixed order and one word is pinned to the top because she once got it wrong. You have
   decided the fix — it should ask about the words from the chapter she just read.
4. **Read the word aloud when she taps it** — she asked for this; the app already has the audio.
5. **Coming back from the dictionary reloads the story** — she is right, and this is a defect.

Items 1-3 touch the shipped folder and would share one deploy.

## One question outstanding

The backup photograph of her profile is still on this machine. **Keep it or delete it?** You have
deleted it the last three times. Deleting ends the safety net; keeping it leaves her data here.
