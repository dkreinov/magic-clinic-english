# Design — word-trophies

STATUS: SIGNED by the owner, 2026-07-29 ("ok go"), incorporating the Hebrew-audit renames
(three trophy names + the tab label). The audit itself is recorded in journal.md.

## 1. What this document is

The WHAT for the trophies run: a dedicated trophies screen, server-side awarding stored in
her profile, ~8 tiered trophies with artwork in the app's own style. The grill (2026-07-28/29,
recorded in journal.md) locked the shape; this document turns it into decisions a planner can
freeze. Every §2 fact was verified against the tree on 2026-07-29 (word-g1 closed at 1027764,
suite 303/0, contrast 52, live magic-vet-v17).

## 2. What the code does today (verified facts the design builds on)

- (i) `validateProfile` is NOT strict: unknown top-level keys pass silently (lib/profile.js:59-64
  checks presence of a known-key list only). But `tests/profile.test.js:7-24` deepStrictEqual-pins
  the ENTIRE `defaultProfile()` object — adding a top-level key moves that test in lockstep.
- (ii) Exactly two server write moments exist: `POST /api/profile` (all five actions incl.
  `quiz-answer`, single `saveProfile` at api/profile.js:140) and `api/chapter.js` (loadProfile :34,
  `promoteToCandidate(p)` :50 — the G1 precedent comment: "already loaded here and about to be
  saved below" — saveProfile :61). Quiz answers have NO separate route.
- (iii) The nav is three inline-SVG tabs hardcoded in index.html:25-77 (הסיפור / בית / המילים שלי);
  routing is a static ROUTES map in app.js:1-21. NO test pins the tab list. `/parent` is
  deliberately invisible (tests/parent-access.test.js:33-40 asserts its absence — do not touch).
- (iv) PRECACHE (sw.js:2-17) is app-shell code ONLY, order pinned by deepStrictEqual
  (shell.test.js:64-79); artwork, audio and quiz JSON are runtime-fetched and never cached.
  CACHE = magic-vet-v17; the next bump is frozen as v18 (word-g1 phase-state).
- (v) Artwork pipeline: committed PNG masters in `assets/delight/`, webp derivatives in
  `public/assets/` via `scripts/optimize-assets.js` (sharp, width 960/640, quality 72), referenced
  as `<img src="/assets/NAME.webp" alt="" />` + a sizing class. Generated via ChatGPT web, one
  dedicated chat, with the FROZEN STYLE SUFFIX quoted verbatim in docs/visual-design.md:190-195;
  per-asset prompts recorded in the doc; GC-D8: owner gates every new asset before integration.
- (vi) Contrast gate: 52 hardcoded pairs in scripts/check-contrast.mjs reading live token values
  from styles.css. New color tokens used as surfaces/borders need their own pairs (the anchor
  moves and every pin of "52" moves with it); classes that only reuse already-checked token pairs
  cost zero.
- (vii) Quiz completion renders `renderQuizDone` — its two text nodes are FROZEN (QZ-18); the
  views' `onDone` callbacks (words.js:244-250, reader.js:734-745) are the un-frozen hook points.
  A no-questions sitting calls `onDone({right:0,total:0})` WITHOUT a done screen — celebrations
  must not fire there.
- (viii) Ledger: 303 = 298 flat test() + 5 subtests. House test patterns: node --check sweep
  auto-covers new public/*.js; needle-in-source for frozen strings; withTempDataDir/withOpenGate
  harness for anything persisting.
- (ix) RECORD DISCREPANCY, found 2026-07-29: docs/visual-design.md §3 (FROZEN 2026-07-24) still
  records the warm-DARK palette (#241305 bg era); styles.css and tests/background.test.js moved
  to Sunrise Parchment. The doc's §2 style direction and §6 style suffix remain valid; §3 is
  stale. This run proposes a dated additive correction (T10) — owner approves via §8.

## 3. Owner decisions already locked (the grill, verbatim intent)

Both reward families, tiered · dedicated nav screen + earn-moment celebration · state stored in
her profile server-side · ~8 trophies, bronze/silver/gold · every Hebrew name and threshold
owner-approved before deploy · trophies never regress, nothing shown negatively · thresholds
chosen without usage data (say so, tune later) · profile-writing run ⇒ full capture + read-back
ritual · artwork in the app's style as real assets, ChatGPT-web pipeline (owner directive
2026-07-29).

## 4. The design decisions (T1-T10)

### T1 — storage schema
`profile.trophies` (new top-level key), the optional-key house pattern (absent-is-legal):
```
trophies: {
  [trophyId]: { bronze?: "<ISO>", silver?: "<ISO>", gold?: "<ISO>" }
}
```
A tier key exists iff earned, value = awardedAt ISO, written ONCE, never modified, never removed
(the never-regress law). `defaultProfile()` gains `trophies: {}` (tests/profile.test.js pin moves
in lockstep). `validateProfile` gains an optional block mirroring the word-entry optional
pattern: if `trophies` present → object; each value an object whose only keys are
bronze/silver/gold with parseable date strings; unknown trophyIds ACCEPTED (forward
compatibility — an old shell must never crash on a new profile).

### T2 — awarding
`awardTrophies(profile, now)` — a pure, idempotent function in lib/profile.js, the exact
promoteToCandidate pattern. Called at BOTH server save moments and nowhere else:
api/profile.js POST (immediately before saveProfile, all actions) and api/chapter.js
(immediately after promoteToCandidate). Never in GET (a read stays a read as far as trophies
are concerned; the GET-creates-profile behavior is untouched). Never client-side. It computes
each trophy's metric from the profile, compares against thresholds, and fills in missing tier
timestamps only — it never deletes or lowers. Award timestamps use the same `now` the calling
action already uses.

### T3 — the catalogue (8 trophies; names + thresholds PROVISIONAL until §8 signature)

| id | Hebrew name | metric (derivation, all existing fields) | bronze/silver/gold |
|---|---|---|---|
| chapters | הרפתקנית | story.chapters.length | 5 / 15 / 40 |
| days | מתמידה | distinct calendar days across chapters[].generatedAt ∪ words[].lastQuizAt ∪ words[].lastSeen | 3 / 10 / 30 |
| streak | רצף קסום | longest run of CONSECUTIVE days within the 'days' set | 2 / 4 / 7 |
| known | אוצרת מילים | count of words with status 'known' | 5 / 15 / 30 |
| quizRight | אלופת התרגול | sum of words[].quizRight | 10 / 40 / 100 |
| quizzer | מתאמנת אמיצה | sum of quizRight + quizWrong (showing up counts, even when wrong) | 20 / 60 / 150 |
| curious | בלשית מילים | sum of words[].taps | 25 / 75 / 200 |
| proven | באמת יודעת | words with nominations ≥ 1 AND status 'known' (the app guessed, she proved it) | 1 / 5 / 15 |

Honesty notes: she has 12 known today → אוצרת מילים bronze lands on the first award pass
(deliberate — the day-one shelf must not be empty); 'proven' stays 0 until G1 nominates
(candidates=0 today) — the shelf shows it locked, which is honest; thresholds carry NO usage
data and §8 marks them expected-to-tune after the first parent report. The streak trophy is
earned-forever (a broken streak changes nothing shown — never-regress).

### T4 — the screen
Route `/trophies` in ROUTES; `public/views/trophies.js` (export render(container, ctx));
4th nav tab in index.html, DOM order AFTER המילים שלי, label `הגביעים שלי`, inline currentColor SVG
trophy icon drawn to match the three existing (24×24, stroke ~1.6, fill-opacity 0.15).
Screen = one card per trophy: artwork image, name, current tier shown as a colored ring/frame,
progress toward the next tier as plain text (e.g. 12 מתוך 15) — no progress-bar component, no
new chart machinery. Locked (unearned) trophies show the SAME artwork dimmed by CSS
(filter grayscale+opacity) — no separate locked asset. PRECACHE += "/views/trophies.js"
(appended AFTER "/views/words.js", order pinned); CACHE v17 → v18 (QZ-22). /placement stays
tab-less; /parent stays invisible.

### T5 — celebration
When a POST /api/profile response (or chapter generation response) returns a profile whose
trophies map contains a tier timestamp the phone has not yet celebrated, the active view shows
ONE overlay (artwork + name + tier, one tap to dismiss) — hooked in the views' quiz onDone
callbacks and the reader's chapter-done stage, NEVER inside renderQuizDone (QZ-18 frozen) and
never on the no-questions path. "Already celebrated" lives in localStorage
(`trophyCelebrated:<id>:<tier>` = ISO) — clearing site data replays celebrations once; accepted
at the grill. No sound in v1 (the grill's own cut order: sound first). Reduced-motion honored
(the existing prefers-reduced-motion pattern).

### T6 — artwork (the owner directive)
9 new images: one per trophy (8) + one shelf-header. Masters committed as
`assets/delight/trophies/<id>.png`, generated via ChatGPT WEB (never the paid API — standing
owner preference) in the existing dedicated art chat style: every prompt ends with the FROZEN
STYLE SUFFIX from docs/visual-design.md:190-195, verbatim. Per-asset prompts are written into
the plan BEFORE generation and recorded in docs/visual-design.md afterward (the §6 precedent).
Derivatives `public/assets/trophies/<id>.webp` via the existing scripts/optimize-assets.js
pipeline (square, width 640). NOT precached (art rule, §2(iv)). Tier differentiation is
CSS-only (ring color + dimming) — ONE image per trophy, 9 assets total, not 24. GC-D8: the
owner approves every asset before integration; md5-distinctness is asserted (the visual-design
§7 duplicate-burst lesson).

### T7 — color and the contrast gate
Three new :root tokens: `--color-bronze`, `--color-silver`, `--color-gold` (exact hexes chosen
at plan time to pass 3:1 as non-text rings against both --color-card and --color-surface-2, in
the parchment palette's warmth). Each adds its gate pairs to scripts/check-contrast.mjs — the
52 anchor MOVES once, to a number pinned at plan time, and every pin of "52" moves in the same
step (the word-g1 precedent: 28 → 52 was exactly such a move). Everything else on the screen
reuses already-checked token pairs (the zero-cost path, §2(vi)). No raw hex anywhere.

### T8 — safety (the profile-writing ritual)
This run writes her profile. Therefore: fresh D25 capture before ANY deploy (none exists
today); read-back extends to trophies: a trophy tier may APPEAR between capture and read-back
only with accompanying activity evidence (the same ACT-fields rule — award moments coincide
with activity writes by construction, T2); a trophy that DISAPPEARS or loses a tier is an
immediate read-back failure → code rollback. `awardTrophies` runs inside the server's existing
authorization (APP_CODE) — no new API surface, no new auth path.

### T9 — what this does NOT do (non-goals)
No sound · no push · no per-trophy share/export · no server-side celebration state · no
progress bars/charts · no new API route · no runtime image generation · no reworking
renderQuizDone or any frozen string · no parent-view features on this screen (it is HER
screen; the parent still uses the on-demand report) · no backfill migration (her existing
history already produces awards on the first pass through awardTrophies — that IS the
backfill, free).

### T10 — the visual-design.md truth-fix (rides along)
A dated, additive correction to docs/visual-design.md §3 recording that the live palette is
Sunrise Parchment (styles.css is the source of truth), growth.md-correction style: additive,
ASCII where possible, byte-preserving edit. Requires owner approval because the doc is frozen
— granted via §8 signature of this design.

## 5. Phasing sketch (the planner details each phase only when reached)
- Phase 1 — the engine: T1 schema + T2 awardTrophies + tests (fixtures only). No UI, no deploy.
- Phase 2 — the assets: T6 prompts → ChatGPT web generation → owner gates each image (GC-D8) →
  masters + webp derivatives committed. No code.
- Phase 3 — the screen: T4 view + nav + T5 celebration + T7 tokens/gate + CACHE v18 + sandbox
  visual gate (self-served) + owner approves strings.
- Phase 4 — ship: D25 capture, deploy, md5 proof, read-back with T8 rules.

## 6. Risks, stated
- A trophy awarded on a buggy metric shows the child a lie — mitigations: pure function +
  fixtures + the read-back evidence rule; and never-regress means a wrong award cannot be
  silently retracted — a wrong award is ruled by the owner (keep, or a one-time correction),
  an OWNER decision, not code.
- ChatGPT-web style drift across 9 images — mitigation: one chat, frozen suffix, owner gate
  per image, regenerate-don't-settle.
- The 52 anchor move touches every pin of the number — mitigation: one dedicated step, all
  pins enumerated at plan time.
- Thresholds mis-set without data — mitigation: stated provisional; the parent report is the
  tuning instrument; tuning DOWN a threshold never revokes an earned trophy (never-regress).

## 7. Open questions folded into the signature
ANSWERED AT SIGNATURE (2026-07-29): (a) names approved WITH the audit renames (הרפתקנית,
אלופת התרגול, באמת יודעת); thresholds approved as provisional. (b) tab label = הגביעים שלי
(pattern-matches המילים שלי). (c) T10 approved. (d) nothing cut. Also ruled: names stay
HEBREW — English names rejected (off-band vocabulary, register clash, bidi risk).

## 8. Sign-off
| item | decision | signed |
|---|---|---|
| T1-T2 schema + server awarding | as written | [x] 2026-07-29 |
| T3 catalogue: 8 names + thresholds (provisional, tune-later) | edited: 3 audit renames | [x] 2026-07-29 |
| T4 screen + 4th tab הגביעים שלי | as written + label edit | [x] 2026-07-29 |
| T5 celebration, no sound v1 | as written | [x] 2026-07-29 |
| T6 artwork: 9 assets, ChatGPT web, GC-D8 per-asset gate | as written | [x] 2026-07-29 |
| T7 three tier tokens + anchor move | as written | [x] 2026-07-29 |
| T8 capture/read-back extension | as written | [x] 2026-07-29 |
| T10 visual-design.md dated correction | as written | [x] 2026-07-29 |
