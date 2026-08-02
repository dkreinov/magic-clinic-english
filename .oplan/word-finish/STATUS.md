# STATUS — word-finish (photograph of now, 2026-08-02, after the deploy)

**All four phases are finished and it is live on her phone.** One deploy, this evening.

## What she will notice

| what | state |
|---|---|
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
| ~17 story words had no sound | **done, and it was ten** — four already spoke, and recording them would have split words she has already collected |
| she could not tell "no sound yet" from "this app has no sound" | **fixed** — the speaker is still there, crossed out, with **coming soon** under it |
| coming back from her word list reloaded the story and lost her place | **fixed** |
| a trophy card could say "target reached" while greyed out | **fixed** |

## The thing that was actively wrong, and is now right

One quiz question was **marking her wrong for a right answer**: *"Please turn on the ___ so that I
can see my book"*, with `computer` and `television` offered as wrong options. Turning on a computer
so you can see your book is just what she does.

This was named in writing a week ago as the single certain defect of its kind, a two-person review
then missed it, and it kept shipping unchanged until today. It is also, by measurement, the one
question of the old set her story could actually reach. It is fixed and live.

## How the new questions were checked

19 new questions for the 16 words she actually has. Two reviewers read every one, each blind to the
other. Before trusting either, I hid **three deliberately broken questions** in the batch — ones
where a wrong option is secretly right. **Both reviewers found all three and named the exact traps**,
then agreed with each other completely and flagged nothing in the real questions.

That control is new. It exists because the last review of this bank passed something it shouldn't
have, and a reviewer that cannot catch planted poison has not earned the right to bless real work.

The generator also **refused to write three questions** rather than write them badly — for *her*,
*move* and *figure*, no sentence could rule out the near-synonyms. Fewer questions beats one that
marks her wrong.

## Her data

Two copies of her profile were taken and **both are deleted**, with receipts of hashes and counts
and no words. Their hashes were identical, so nothing of hers changed during the work. A sweep of
the whole machine at the close read 301,233 files and found **no copy of her vocabulary anywhere**.

One thing that had been missed until now: six of her real words had been sitting in a planning
document in the repository since 1 August. The deletion policy covered profile *files* and never
covered the written record. Redacted today.

## What is NOT done

1. **The other 83 questions already on her phone have not been re-checked.** They were cleared by
   the same method that missed the `computer` one. You were told this before approving, and it is
   deferred to a later run with the better instrument built today.
2. **Her answers still do not survive a full page reload.** Your ruling is recorded; it needs a step.
3. **Her heroine's and pet's names still say "coming soon."** They come from her own profile, so no
   automatic top-up reaches them. Two clips fixes it.
4. **A latent defect:** the app marks an answer saved *before* the server confirms, and swallows
   failures silently.
5. **One test reads a folder outside the repository** and quietly skips half of itself if the folder
   is gone. The important half runs anywhere; the skip should still become a hard failure.

## Live

`dpl_6piLnUX5zj8zEVzUucLeHqt5aRqG` · `magic-vet-v21` · Ready · aliased to
`english-app-three-tan.vercel.app`. Rollback target is the previous deployment,
`dpl_6pFjJ8LrcyaFodRELCa46BzATUXy` (`magic-vet-v20`).
