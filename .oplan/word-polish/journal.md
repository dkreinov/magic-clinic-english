# Journal — word-polish (append-only)

## RUN OPENED (2026-08-01)

Three reported defects, one deploy. Design in design.md. Field guide inherited from word-trophies
(133 lines, 15 lessons) -- lesson 15 is why this run plans differently.

## PHASE 1 PLANNING (2026-08-01)

Fresh planner (Opus, read-only) returned a 5-step plan, 1584 lines, zero Hebrew glyphs, into
POLISH-P1-DRAFT.md. It measured everything and produced THREE findings that reshaped the phase and
corrected the ORCHESTRATOR'S OWN diagnosis twice. Recorded because being wrong in public is the
point of a fresh planner.

FINDING 1 -- "canSay is already honest". The orchestrator had told the owner she was pressing dead
speaker buttons. FALSE. `reader.js:335` calls `getAllowedSet()` (public/words-index.js), which
FETCHES /audio/words/index.json -- the audio manifest itself -- and `resolveLemma` returns only
members of that set, so `canSay: lemma !== null` is already equivalent to "a clip exists".
words-index.js's own comment says it outright: "if the manifest cannot be loaded ... the views
simply do not render a play button." VERIFIED by the orchestrator. So for her 10 uncovered words
she gets NO BUTTON AT ALL, not a dead one, and T3(a) has nothing to build -- it becomes the GATE
that phase 2's generation is measured against. The browser already has the list at zero added
cost (19,942 bytes, already on the wire, deliberately not precached).

FINDING 2 -- T2 as designed changes nothing she would see. The quiz item bank holds 62 lemmas; her
36 distinct glossary words intersect it in exactly ONE (`light`), which is not in her profile.words,
so its answer would 400. Driving the SHIPPED selector and the SHIPPED bank over her real capture,
[REDACTED: her vocabulary -- D27/R-F3-5, counts only]
cause of her complaint is that `lemmas` is built once in `boot()` and never rebuilt.
ORCHESTRATOR RULING (B1): ship BOTH halves. Chapter-first is correct in principle and starts
working the moment the bank grows; the rotation fix (already-asked lemmas move to the tail) is what
she will actually notice -- 3 distinct question sets instead of 1. Shipping chapter-first alone
would have honoured the owner's words while changing nothing, and shipping rotation alone would
have quietly dropped his ruling. Growing the 62-item bank is recorded as its own follow-on; this
run does not pretend to fix it.

FINDING 3 -- generating the obvious word list would SPLIT HER VOCABULARY. The naive list was 17
surface forms. Generating `softly.aac` puts "softly" into the manifest, so `resolveLemma` stops
folding it into `soft` -- and she HAS `soft`, `sudden` and `wing` in her profile today (verified by
the orchestrator against her capture). Her next tap would create a second, separate entry and split
her progress. RULING (B2): generate BASE LEMMAS only, and let the existing folding cover the
surface forms. The list is TEN, not seventeen:
  after · deer · feet · glow · growl · harm · moon · nervous · scary · tight
(`glow` alone covers glow/glowing/glows; `tight` covers tightly; `growl` covers growls.)

OWNER RULING (B3, 2026-08-01): APPROVED generating the ten clips with
`scripts/build-word-audio.js` UNCHANGED -- same model, same voice, same instructions as all 2254
existing clips. This is a PAID API call and it cuts against the standing free-web-route preference;
it was put to him explicitly with the reason (voice consistency is to audio what the frozen style
suffix is to the artwork, and a different engine would drop a stranger's voice into the middle of
her story) and the cost (a fraction of a cent for ten short words). He must HEAR a sample before
the batch is accepted -- the GC-D8 habit applied to audio.

Also carried from the plan: SK1-5 -- this phase moves three PRECACHED files and does NOT bump
CACHE; the single v18 -> v19 bump is owed by the ship phase, once, after the audio lands.
