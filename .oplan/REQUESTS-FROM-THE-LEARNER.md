# Requests from the learner (the child who uses the app)

Her own words, relayed by the owner. Captured verbatim in meaning, dated, NOT yet designed and
NOT yet scheduled. Each becomes a design decision in some future run — the point of this file is
that nothing she asked for gets lost between runs.

These are FEATURE REQUESTS, not defects, unless marked otherwise.

---

## R1 — tapping a word in the story should READ IT ALOUD, not only offer "add to my words"
**Raised:** 2026-07-30 (during the word-trophies run, phase 3).
**Her point:** when she taps a word while reading a chapter, the only thing she is offered is
adding it to her word list. She wants to HEAR the word.

**Why it matters:** she is learning to read English, and pronunciation is the part a written
glossary cannot give her. She is asking for the one thing the medium is worst at.

**What already exists (verified 2026-07-30, so nobody re-discovers it):** the app ALREADY has
word audio. `public/views/reader.js:721` and `public/views/words.js:218` both construct
`new Audio("/audio/words/<lemma>.aac")`. So there is a pronunciation mechanism and an audio
asset path already shipping — this is very likely a matter of surfacing it in the reader's
word-tap affordance, plus making sure the audio file exists for the tapped lemma (and deciding
what happens when it does not).

**Open questions for whoever designs it:** does the tap read it immediately, or add a speaker
button next to "add to my words"? What happens for a word with no recorded audio — silent,
hidden button, or a fallback? Does it count as a "tap" for the בלשית מילים trophy (it already
does — `curious` counts `taps`)?

---

## R2 — coming back from the dictionary should not reload the story
**Raised:** 2026-07-30, same conversation.
**Her point:** she adds a word, goes to look at her word list, comes back to the story — and the
story reloads and she has to wait. She says there is no reason to reload it if the story has not
changed.

**She is right, and this is arguably a DEFECT, not a feature request.** A re-render that costs a
visible wait, for content that did not change, is a bug in the experience even if every function
returns correctly.

**Where to look:** the router is a static `ROUTES` map in `public/app.js` and each view's
`render(container, ctx)` rebuilds `container.innerHTML` from scratch; the reader's `boot()`
re-fetches the profile on every entry. So leaving `/reader` and returning re-runs the whole
view including its network round-trip. The fix is likely some form of "if the chapter list and
the profile revision have not changed, restore the previous DOM/scroll position instead of
rebuilding" — but note the app deliberately re-reads the profile to stay honest about state, so
this needs care, not just a cache.

**Open questions:** what is the correct invalidation signal (chapter count? a profile revision?
a timestamp)? Should scroll position be restored too — she did not say so, but "it takes time"
usually also means "and I lost my place". Worth asking her.

---

## How to use this file

- Do NOT fold these into a run that is already in flight. The word-trophies run was mid-phase-3
  when both were raised, and they were recorded rather than absorbed.
- When one is picked up, it gets a design decision with the owner's sign-off like any other, and
  this entry gets a line saying which run took it and where the design lives.
- If she raises something and it is a defect (like R2 probably is), say so plainly rather than
  filing it as a nice-to-have.
