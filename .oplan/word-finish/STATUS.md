# STATUS — word-finish (photograph of now, 2026-08-02)

**Phase 1 is finished and proved. Nothing is deployed yet.** Her app on the phone is still
`magic-vet-v20`, exactly as it was last night — all of phase 1 is waiting on this machine.

## What phase 1 actually fixed

| what | state |
|---|---|
| her real vocabulary sitting in two dev sandboxes | **gone** — replaced with invented words; a machine-wide sweep proves all 19 profile-shaped files here are fake |
| a trophy card showing "target reached" while greyed out | **fixed** — one source of truth per card, proved over 3,020 combinations and proved to fail when the bug is put back |
| the story reloading when she returns from her word list | **fixed** — the chapter she left is repainted, and the app still asks the server for her profile every time |
| losing her place on the page | **fixed** — before/after screenshots are pixel-identical |

I looked at both screens in a real browser. Zero cards contradict themselves; the two that used
to (`אוצרת מילים`, `באמת יודעת`) now show earned. Coming back from the word list shows no loading
screen, no spinner, the same scroll position, and the answered question still answered.

## Proof

- **369 tests pass, 0 fail.** Contrast 58 pairs. Quiz bank 62 files / 84 items.
- Exactly **four** files changed all phase; **zero** deleted; the frozen quiz engine is untouched.
- Every behaviour was **seen to fail** before it was fixed.

## What is NOT done

1. **She still cannot hear ~17 story words.** That is phase 2, and it needs your ears.
2. **Only 1 of her ~40 words has a quiz question.** That is phase 3, and it needs your eyes.
3. **Her answers still do not survive a full page reload.** Phase 1 fixed only the tab-switch case.
   Reading them back needs your ruling: *if she answers wrong and then right, is that question
   finished?* My recommendation is **yes**.
4. **A latent defect, found and recorded, not scheduled:** the app marks an answer saved *before*
   the server confirms, and swallows failures silently. Keeping her answers alive during a sitting
   makes that failure **less** visible, not more.

## Next

Phase 2 — audio. The recording script currently rebuilds its master list from the curriculum, which
is why it can never make her story words and why the earlier attempt was stopped. Phase 2 fixes that
first, then records the missing words, then shows you a sample. Her speaker button will change from
*invisible* to a crossed-out speaker with **coming soon**, which you chose and I froze.

## Open question for you

**Wrong-then-right — finished or not?** Nothing is blocked on it today; it blocks the second half
of R4 whenever we pick that up.
