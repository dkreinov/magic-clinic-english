CURRENT: phase 1 "she can hear every word she collects", next step 1.1
PLAN: .oplan/word-audio/plan.md — READ ITS "ORCHESTRATOR AMENDMENTS" SECTION AT THE END FIRST.
  The plan reviewer returned fix-first with 6 findings and the amendments A1-A6 OVERRIDE anything
  earlier in the file that contradicts them. Reading the top of the plan alone will mislead you.
BRIEF: .oplan/word-audio/brief.md (Mika's feedback W1-W5; this run does W1, W4, W5a only)
BASELINE: 8b8a6ff-era tree at 184 tests / 0 fail; contrast 52 ALL PASS
LIVE RIGHT NOW: magic-vet-v10, deployment dpl_h19vJfyq68GTanJMxhVUX7g8Z25p at commit 2c2f50a,
  aliased to https://english-app-three-tan.vercel.app. This phase bumps to v11; phase 2 deploys.
PREDECESSORS: .oplan/poc-basics/ (closed, deployed) · .oplan/parent-access/ (closed, deployed).
  Their journals hold the deploy recipe, the rollback procedure and the D4 404-probe correction.

OWNER DECISIONS (do not re-ask):
  · OD-A voice = OpenAI gpt-4o-mini-tts, voice `nova`, build-tts.js's existing instruction string.
    Chatterbox (GCXTiler) rejected: needs a GPU box, would differ from the exam voice.
  · OD-B pre-generate ALL 2254 allowed words, NOT on demand — a child taps a word because she cannot
    read it, and a 1-2s TTS wait every time is the wrong trade for ~$0.37.
  · OD-C cost approved at ~$0.47, MEASURED from a 20-word probe (mean 0.832 s/word x 2254 = 31.2 min
    at $0.015/min). My first figure of $0.37 was 27% low; the owner asked me to verify and that is
    what caught it. Do not re-quote $0.37.
  · Format = AAC (measured: aac 8904 B vs mp3 40320 B for one word -> ~12 MB vs ~52 MB for the set).
    There is NO ffmpeg on this machine, so response_format is the only lever.
  · Order = this run W1+W4+W5a; then W3 (story read-aloud); then W5b (the quiz).

FROZEN CONTRACTS IN FORCE: WA-1..WA-7 in plan.md, AS AMENDED BY A1-A6. The six that bite hardest:
  · A1 mark-known REQUIRES `source`; WORD_SOURCES = ['placement','tap','band']. POST exactly
    { action:"mark-known", lemma, source:"tap" } or api/profile.js:56 returns 400 on every click.
  · A2 this run adds exactly TWO new CSS classes, `.btn-say` and `.btn-know`, BOTH appended to
    public/styles.css BY STEP 1.4 ONLY (so no two steps write that file).
  · A3 a bare <button> does NOT inherit `color` (field-guide lesson 8). Both classes MUST declare
    `color: var(--color-ink); background: var(--color-surface-2);` — an already-measured pair, so the
    contrast gate stays at exactly 52. No raw hex, no color-mix().
  · A4 corrected criterion 7: index.html byte-unchanged; styles.css ADDITIONS ONLY, zero deletions.
  · A5 the sentence-extraction function `sentenceFor(text, word)` is frozen verbatim in the
    amendments — tokenises on [^a-z'] so `let's` cannot break it; first matching sentence wins;
    empty result means the `context` field is OMITTED, not sent as "".
  · A6 truncation is `.slice(0, 200)` (JS code units).
  INHERITED AND BINDING: design.md and docs/visual-design.md are FROZEN — PRECACHE stays
  byte-identical and NO audio is ever added to it · the contrast gate must keep exiting 0 at 52 pairs ·
  any change under public/ ships with the sw CACHE bump in the SAME phase · the learner's profile is
  never contacted (GET /api/profile CREATES one) · never open a browser on production · never run
  `vercel env` · the six existing public/audio/word-*.mp3 exam clips are NOT touched or regenerated ·
  docs/item-bank-review.md is SIGNED OFF — leave it alone.

ACCEPTED: (none yet)
OPEN QUESTIONS: none. All were put to the owner and answered as OD-A..OD-C above.
BLOCKED: no
