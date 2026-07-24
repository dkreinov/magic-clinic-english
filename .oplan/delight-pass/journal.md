# Journal — run "delight-pass"

## 2026-07-24 — Run opened

- Scope: design.md §7 visual design workflow end to end (assets → codify → integrate → deploy).
- Execution mode: AUTONOMOUS (owner-declared at run start). Owner gates are the only stops;
  the primary gate is asset review after Phase 1 (GC-D8).
- Orientation findings that shaped the plan:
  - shell.test.js freezes PRECACHE (deepStrictEqual) and the six token names; manifest test
    freezes theme `#7c3aed` + bg `#faf7f2`. → GC-D1/GC-D2: build around the palette, never
    touch sw.js, never precache assets.
  - Current UI is clean but placeholder-grade: inline SVG icons, one CSS-gradient circle
    "illustration", no artwork anywhere.
  - Anchor asset `assets/design-tests/dragon-clinic-test.png` (viewed): warm Pixar-like cartoon,
    girl apprentice + teal dragon, wood/potions/vines world, violet-teal-amber on cream. Chat
    name "Image Request Cartoon Style". Judged sufficient to answer all style decisions —
    direction is RECORDED, not invented. No owner questions needed pre-gate.
  - No image tooling on machine (no sharp/magick/ffmpeg) → Phase 3 adds `sharp` devDependency.
  - Deploy recipe from first-build journal: `"$(npm prefix -g)/vercel" deploy --prod --yes`,
    canonical https://english-app-three-tan.vercel.app.
- Plan for Phase 1 written (2 steps, 8 assets, frozen prompts + validations). Sent to plan
  reviewer next.

- Plan reviewer (Sonnet, fresh): VERDICT fix-first — 3 findings: (1) no fallback for ChatGPT
  generation failure/timeout/refusal; (2) orchestrator visual inspection had no frozen rubric;
  (3) download race between click-Download and ls-t/mv. All three fixed in plan.md (failure =
  one resend then STATUS failed; 5-point rubric in acceptance criterion 3; race-safe download
  handoff protocol). No undecided-decision findings on prompts/names/validations.

## 2026-07-24 — INCIDENT: duplicate-download burst (audited before step 1.1 acceptance)

- Owner halted the run mid-step-1.1 execution: "downloading the same image each time".
- Disk evidence: 89 byte-identical `ChatGPT Image Jul 24, 2026, 04_23_1x PM (N).png` files in
  ~/Downloads (all md5 c4985de199bc02b9ca093593df2bb46d, ~2.4MB each, ~208MB total), same hash
  as `assets/delight/hero-clinic.png` (untracked, produced 16:22). No executor report reached
  the orchestrator; the 1.1 work ran outside the accepted dispatch loop, so nothing was
  journaled/audited at the time — machinery gates cannot catch work that bypasses them.
- Root cause: packet procedure said "poll until a newer file appears" but never said "click
  Download exactly once"; repeated activation → Chrome duplicate burst.
- Blind spot found by the audit (worse than the mess): frozen validations checked per-file
  PNG/aspect/size but NOT content distinctness — with a polluted Downloads dir, the
  newest-file heuristic could deliver hero-clinic bytes as chapter-*.png and PASS validation.
- Layer verdicts: executor=re-click loop (proximate) · packet author (orchestrator)=missing
  click-once rule · frozen validation (orchestrator)=no distinctness check · plan reviewer=
  caught mid-write race, missed both of the above · auditor=never ran (bypassed).
- AMENDMENTS (plan.md, logged per §5): (1) both 1.1/1.2 validations now md5-hash every asset +
  the anchor and fail on any duplicate; (2) procedure: click Download exactly ONCE, Bash-only
  polling, ≤1 verified re-click after 30s, re-record newest file before each image, report
  stray duplicates in SURPRISES; (3) field guide lessons 12-13 added.
- hero-clinic.png disposition: content inspected by orchestrator against the frozen rubric —
  PASSES all 5 points (paw sign w/o letters, round door, potion garden, dragons, golden hour,
  anchor-consistent style, landscape 1536x1024?, verified by validation at acceptance). Adopted
  as the 1.1 partial artifact; re-dispatch of 1.1 will cover ONLY the 3 remaining chapter
  scenes. Adoption is provisional until step 1.1 validation passes over all four files.
- ~/Downloads cleanup: NOT performed (owner's folder; packet forbids deletes there). Awaiting
  owner decision — all 89 are exact duplicates of the preserved repo file, safe to delete.
- Owner decisions: delete duplicates = YES (89 files removed from ~/Downloads, each md5-checked
  = c4985de1... before rm; 0 remain); resume 1.1 = YES. Re-dispatching with amended packet.
