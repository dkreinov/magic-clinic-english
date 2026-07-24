# English Learning App — Frozen Design Decisions

> **Status: FROZEN** (2026-07-24). This document is the single source of truth for the app's
> scope and architecture, produced by an adversarial requirements review (`/grill-me`).
> Every agent/session working on this project must follow it. Changes require explicit
> owner approval — do not "improve" scope silently.

## 1. Purpose & audience

- An app for **one child**: the owner's daughter, Hebrew speaker, finishing 5th grade / entering 6th grade (~11 years old).
- Goal: real English learning — reading, comprehension, vocabulary, later speaking confidence. **Not fluff.**
- No accounts, no multi-user, no productization.
- Kill criteria (both must hold):
  1. She **wants** to use it (comes back voluntarily).
  2. The learning is **real** (level-calibrated, measurable).

### The founding failure to never repeat
The owner previously asked GPT to "write a text at her level." It failed: too many unknown
words, felt like homework. Root cause: nothing knew **which words she actually knows**.
Research target: **95–98% of words in any text must be known** for reading to be
comprehensible and fun. The entire level system exists to enforce this.

## 2. Platform & stack (locked)

| Concern | Decision |
|---|---|
| Client | Installable **PWA**, Chrome on her Android phone. Hebrew UI/instructions. |
| Hosting | **Vercel** (owner already pays): static frontend + serverless functions + a Vercel storage add-on for her profile/word bank. |
| LLM | **OpenAI API key** (prepaid credits — NOT the ChatGPT Plus subscription; subscriptions can't power a server). Chosen over Anthropic 2026-07-24 because one balance covers text + **TTS** (placement listening items) + **image API** (future chapter illustrations); Hebrew quality verified live. Text: gpt-5-mini / gpt-4.1-mini tier; TTS: gpt-4o-mini-tts; images: gpt-image-1 (later). DeepSeek/Qwen rejected: weak Hebrew. An Anthropic key exists in `.env` as dormant fallback (its org has $0 credits). Key env var: `OPENAI_API_KEY`. |
| Cost ceiling | ~$5–10/month expected. |
| API key location | Server-side only. The key never ships to the phone. |

## 3. Level model (locked)

- **Skill vector**, not one magic number. Dimensions: receptive vocabulary, reading
  comprehension, writing, grammar-in-context, pronunciation/fluency. Only the first two are
  *measured* at launch; the rest start "unknown" and fill in as features land.
- Anchored to the **Israeli MoE English curriculum** (CEFR-aligned, Pre-A1/A1 for her grade):
  - [Lexical Pre-Band I & Band I list](https://meyda.education.gov.il/files/Mazkirut_Pedagogit/English/CurriculumFilesAugust21/LexicalBand1.pdf) — the exact word list her school teaches, with frequency data.
  - [Elementary Curriculum 2020](https://meyda.education.gov.il/files/Mazkirut_Pedagogit/English/curriculum2020Elementary.pdf)
  - [Pre-A1 can-do descriptors](https://meyda.education.gov.il/files/Mazkirut_Pedagogit/English/CurriculumFilesAugust21/candospreA1.pdf)
- **Continuous calibration is the real engine**: every word she taps to translate and every
  missed comprehension question updates her profile forever. The placement test is only the prior.

## 4. Placement test (locked)

- **Short and stoppable**: two tasks, ~10–15 min total, can pause between tasks.
  - Task 1 (3–4 min): word ↔ picture items with TTS audio (hear word → pick picture; see picture → pick word). TTS via OpenAI `gpt-4o-mini-tts` (endpoint verified 2026-07-24).
  - Task 2 (4–5 min): two micro-texts + comprehension questions, **multiple choice with Hebrew answer options** (isolates comprehension from English production).
- Items come from a **pre-built item bank** generated offline from the official Band lists and
  **reviewed by the owner (~30 min) before the child ever sees it**. Test items are NEVER
  generated live. (Story chapters ARE generated live; test items are not.)
- Speaking items: **record-only or dropped** at launch. No automatic speech scoring in v1.
- The LLM never decides her level and never invents assessment criteria.

## 5. Core loop (locked)

- **Serialized story**: a girl apprenticed to a **veterinarian for magical creatures**
  (fantasy + animals — her top interests; she read Harry Potter through mid-book 4 and wants
  to be a vet). Cooking/experiment episodes can be woven in. Brawl Stars informs the *reward
  aesthetic* only, not content.
- Chapters generated server-side, **constrained to ~95–98% known words** from her profile,
  each ending on a **cliffhanger** — "what happens next" is the retention mechanism, not guilt streaks.
- **Micro-checks inside the flow** (not a quiz at the end): 2–3 quick comprehension questions
  per chapter, MCQ with Hebrew options. Wrong answers are also a calibration signal (text too hard).
- **Tap-to-translate**: tap any word → Hebrew translation → word saved to her bank.
- **Word collection**: visible, growing — this is the entire gamification at launch.
- Question integrity rule: every generated comprehension question is **mechanically verified
  as answerable from the chapter text** before display; rejected otherwise.
- Onboarding idea (free engagement win): let *her* name the heroine and her first magical animal.

## 6. Rollout plan (locked: "core first, grow weekly")

**First build** (she uses it within days): polished frontend + placement + story loop
(chapters, tap-to-translate, micro-checks) + word collection.

**Weekly updates after launch** (each is also a re-engagement hook), in rough order:
1. Daily 2-min spaced-repetition review of her tapped words + **push notification** that opens the app (PWA push works on Android Chrome; requires one-time permission grant). NOTE: "background word popups" = notifications that open the app — Android does not allow quiz overlays over other apps from a PWA.
2. Writing exercises (words AND sentences; **autocorrect/auto-complete disabled** in inputs).
3. Record-only speech (she records herself reading; owner listens — parent visibility, zero ASR risk).
4. Trophies/achievements layer.
4b. Simple parent view for the owner: her word bank, streaks/progress, and reading recordings.
5. Later phase: real pronunciation scoring (e.g., Azure Pronunciation Assessment) — feasible, deliberately deferred as highest technical risk.

## 7. Visual design workflow (process locked; direction TBD)

- Concept/visual images will be generated by driving Chrome → ChatGPT image generation
  (owner-approved browser automation workflow; owner will provide details).
- **Reuse ONE dedicated ChatGPT chat for all image generations** (owner request — avoids
  chat clutter): https://chatgpt.com/c/6a632008-2d04-83ed-8557-370a2881a0dc
  ("Image Request Cartoon Style"). Download images via the share dialog's Download button;
  files land in `~/Downloads` as `ChatGPT Image <date>.png` — move them into `assets/`.
  Pipeline verified end-to-end 2026-07-24 (test asset: `assets/design-tests/dragon-clinic-test.png`).
- The chosen visual direction gets codified **in this file (or a linked design doc)** with a
  **fixed asset set and style rules** — AI image generators cannot redraw the same character
  reliably, so consistency comes from reusing a defined asset library, not from a "vibe".
- Once frozen, every agent in every session follows the visual design doc.
- Tone calibration: unknown what she finds cringe/babyish — calibrate from her reaction to
  the first chapters. Content must NOT be pitched younger than 11.

## 8. Assumptions (confirmed by owner)

- Her phone runs Chrome on Android; owner can install the PWA and grant permissions.
- Owner will review the placement item bank (~30 min) before launch.
- Owner has OpenAI API credits (topped up 2026-07-24) and a paid Vercel account.

## 9. Infrastructure verification log (2026-07-24)

All preliminary checks passed while the owner was present — automated sessions can rely on these:

- OpenAI chat API: HTTP 200, correct Hebrew output (`OPENAI_API_KEY` in `.env`).
- OpenAI TTS API (`gpt-4o-mini-tts`): HTTP 200, MP3 generated.
- Vercel CLI v56.5.0 installed and authenticated (device-flow login approved by owner).
  Call it via `"$(npm prefix -g)/vercel"` — npm global bin is not on Git Bash PATH.
- ChatGPT image generation + download via Chrome automation: verified; test asset at
  `assets/design-tests/dragon-clinic-test.png`; reuse the dedicated chat (see §7).
- MoE Band I lexical list PDF: reachable (HTTP 200).
- Machine quirk: `curl` needs `--ssl-no-revoke` on this Windows machine (corporate TLS).
- `.gitignore` excludes `.env` (holds active OpenAI key + dormant Anthropic key).

## 10. Explicitly out of scope

- Multi-user / auth / app stores / native Android.
- Live-generated test items.
- Automatic pronunciation scoring at launch.
- Quiz popups over other apps.
- Long formal exams (anything over ~15 min of testing).
- LLM providers other than OpenAI (runtime); Anthropic key kept only as dormant fallback.
