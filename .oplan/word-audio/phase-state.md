CURRENT: RUN COMPLETE — phase 1 ACCEPTED, phase 2 DEPLOYED AND VERIFIED.

LIVE NOW: deployment dpl_94Qv4mCDKrwRcvLEd7AH6CqV1syS at commit 44e10e3, url
  https://english-ep7nxbemg-dkreinovs-projects.vercel.app, aliased to
  https://english-app-three-tan.vercel.app. magic-vet-v11 confirmed live.
ROLLBACK TARGET (the deployment this replaced): dpl_h19vJfyq68GTanJMxhVUX7g8Z25p at commit 2c2f50a,
  https://english-di7kd0n2k-dkreinovs-projects.vercel.app — `vercel rollback <that-url> --yes`.
DEPLOY VERIFIED: md5 live==WORKTREE for all four changed public/ files (sw.js, styles.css,
  views/reader.js, views/words.js) and for the shell fetched as `/` · live /sw.js says magic-vet-v11 ·
  /api/health exact payload · /api/chapter 401 · nine spot-checked clips 200 with md5 matching disk,
  including the three regenerated ones (car, check, chain) · `let%27s.aac` 200 · NEGATIVE CONTROL
  /audio/words/zzzznotaword.aac 404, so those 200s mean something · the six exam mp3s still 200.
  /api/profile was never requested.

ONE DEVIATION FROM THE PHASE 2 RECIPE, UNRESOLVED: the recipe expected
  `content-type: audio/aac`; Vercel actually serves **`audio/x-aac`** for .aac. Everything else
  matched. This is not known to be broken — it is UNVERIFIED, and it lands exactly on the plan's own
  stated risk ("AAC might not play on her phone … the one thing no local gate can prove — it needs
  her device", and the failure mode is silent by WA-3's design). If it turns out not to play, the fix
  is a `headers` entry in vercel.json forcing `audio/aac` plus a re-deploy; no clip needs
  regenerating. VERIFY ON HER PHONE BEFORE ASSUMING W1 IS DELIVERED.

PHASE 1 (kept for the record):
PLAN: .oplan/word-audio/plan.md — READ ITS "ORCHESTRATOR AMENDMENTS" SECTION AT THE END FIRST.
  A1-A10 OVERRIDE anything earlier in the file that contradicts them. Reading the top alone misleads.
JOURNAL: .oplan/word-audio/journal.md — read it before phase 2. It records the truncated-clip defect,
  the cost overrun, and which frozen numbers moved.
BRIEF: .oplan/word-audio/brief.md (Mika's feedback W1-W5; this run does W1, W4, W5a only)

PHASE 1 RESULT: ACCEPTED. `PHASE-1-ALL-CRITERIA-OK` — all nine criteria re-run by me in one gate.
  197 pass / 0 fail · contrast 52 ALL PASS · 2254 clips, 0 invalid ADTS, 26.8 MB · sw.js diff exactly
  2 lines, PRECACHE md5 unchanged · styles.css +34/-0 · no .data/profile.json.
  Commits: 791c19d (1.3) e139052 (1.4) 10d9cab (1.5) 9983137 (1.6) 28140be (1.2). Base f5d8ae7.

LEDGER MOVED: 196 -> 197 by A10 (criterion 6 demanded a test the ledger forbade; resolved in favour
  of the criterion, which makes the gate stricter). Criterion 2 now reads `# pass 197`.

LIVE RIGHT NOW (pre-deploy): magic-vet-v10, deployment dpl_h19vJfyq68GTanJMxhVUX7g8Z25p at commit
  2c2f50a, aliased to https://english-app-three-tan.vercel.app. Phase 2 ships v11.
PREDECESSORS: .oplan/poc-basics/ · .oplan/parent-access/ (both closed, deployed). Their journals hold
  the deploy recipe, the rollback procedure and the D4 404-probe correction.

OWNER DECISIONS (do not re-ask):
  · OD-A voice = OpenAI gpt-4o-mini-tts, voice `nova`, build-tts.js's existing instruction string.
  · OD-B pre-generate ALL 2254 allowed words, NOT on demand.
  · OD-C cost approved at ~$0.47. **ACTUAL, MEASURED FROM THE FINISHED SET: 53.9 min => ~$0.80.**
    Already spent. The owner approved a number that was 70% low; tell them, do not re-quote $0.47.
  · Format = AAC. No ffmpeg on this machine, so response_format is the only lever.
  · Order = this run W1+W4+W5a; then W3 (story read-aloud); then W5b (the quiz).

PHASE 2 RECIPE (from the predecessor journals, all still binding):
  · `vercel inspect <canonical-url>` FIRST and record id+url+commit — the only rollback target.
  · `"$(npm prefix -g)/vercel" deploy --prod --yes` (npm global bin is off PATH).
  · Verify live files by md5 against the WORKTREE, never a git blob (index.html is CRLF on disk,
    LF in git). `cleanUrls` 308s every *.html, so fetch the shell as `/`.
  · live /sw.js must contain magic-vet-v11 · spot-check several /audio/words/<lemma>.aac for 200 +
    content-type audio/aac · /api/health exact payload · /api/chapter -> 401 (proves the function and
    its bundled JSON loaded, free).
  · curl needs --ssl-no-revoke on this machine.
  · WATCH THE DEPLOY SIZE: this run adds 26.8 MB of audio.
  · NEVER request /api/profile (a GET CREATES one), never open a browser on production, never run
    `vercel env`.

FROZEN CONTRACTS STILL IN FORCE: WA-1..WA-7 as amended by A1-A10 · design.md and docs/visual-design.md
  are FROZEN — PRECACHE stays byte-identical and NO audio is ever added to it · contrast gate exits 0
  at exactly 52 pairs · the six existing public/audio/word-*.mp3 exam clips are untouched ·
  docs/item-bank-review.md is SIGNED OFF.

KNOWN AND ACCEPTED (not blockers, do not "fix" without deciding):
  · `let's` is unreachable from the reader (normalizeWord strips the apostrophe -> `lets`, no file).
    Silently inert, which is WA-3's accepted behaviour.
  · A clip can be a valid ADTS file and still contain no speech. 36 were. If clips are ever
    regenerated, re-run the frame-duration check, NOT just the header check — see the journal.

ACCEPTED: phase 1.
OPEN QUESTIONS: none blocking. To TELL the owner (not to ask): the ~$0.80 actual cost, and that 36
  common words shipped truncated and were regenerated.
BLOCKED: no
