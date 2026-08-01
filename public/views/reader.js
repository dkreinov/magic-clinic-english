import { getJson, postJson } from "../api.js";
import { resolveLemma } from "../lemma.js";
import { getAllowedSet } from "../words-index.js";
import { startQuiz } from "../quiz.js";
import { pickQuizWords, knownSetFromProfile, pickCandidateWords } from "../quiz-core.js";
import { maybeCelebrateTrophy } from "./trophies.js";

const CHAPTER_BANNERS = { 0: "chapter-night", 1: "chapter-clinic", 2: "chapter-forest" };

const VIEW_STYLE = `
  .reader-card-title {
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .reader-chapter-label {
    font-size: 0.9rem;
    color: var(--color-muted);
    font-weight: 600;
    margin-bottom: 10px;
  }

  .reader-text {
    font-size: 1.08rem;
    line-height: 1.9;
    text-align: left;
  }

  .reader-text .w {
    cursor: pointer;
    border-radius: 4px;
    transition: background var(--transition-fast);
  }

  .reader-text .w:active,
  .reader-text .w.tapped {
    background: color-mix(in srgb, var(--color-accent) 28%, var(--color-card));
  }

  .reader-onboard-field {
    margin-bottom: 18px;
  }

  .reader-onboard-label {
    display: block;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .reader-onboard-input {
    width: 100%;
    min-height: 48px;
    border-radius: var(--radius);
    border: 2px solid var(--color-border);
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    padding: 0 16px;
    font-size: 1.05rem;
    font-family: inherit;
    color: var(--color-ink);
  }

  .reader-onboard-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .reader-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 40px 16px;
    text-align: center;
    color: var(--color-muted);
    font-weight: 600;
  }

  .reader-spinner {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      var(--color-primary),
      var(--color-teal),
      var(--color-accent),
      var(--color-primary)
    );
    -webkit-mask-image: radial-gradient(circle, transparent 56%, #000 60%);
    mask-image: radial-gradient(circle, transparent 56%, #000 60%);
    animation: reader-spin 1.4s linear infinite;
  }

  @keyframes reader-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .reader-loading-art {
    animation: reader-float 3.2s ease-in-out infinite;
  }

  @keyframes reader-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .reader-spinner { animation-duration: 3.2s; }
    .reader-loading-art { animation: none; }
  }

  .reader-question-card {
    margin-bottom: 16px;
  }

  .reader-question-prompt {
    font-weight: 700;
    margin-bottom: 12px;
  }

  .reader-question-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .reader-question-option {
    min-height: 48px;
    border-radius: var(--radius);
    border: 2px solid var(--color-border);
    background: var(--color-surface-2);
    box-shadow: var(--shadow-soft);
    color: var(--color-ink);
    font-size: 0.98rem;
    font-weight: 600;
    padding: 10px 16px;
    text-align: right;
    cursor: pointer;
    transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
  }

  .reader-question-option:active {
    transform: scale(0.98);
  }

  .reader-question-option.correct {
    border-color: var(--color-teal);
    background: color-mix(in srgb, var(--color-teal) 16%, var(--color-card));
  }

  .reader-question-option.wrong {
    border-color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger) 16%, var(--color-card));
  }

  .reader-question-option[disabled] {
    cursor: default;
  }

  .reader-question-feedback {
    margin-top: 10px;
    font-weight: 700;
  }

  .reader-question-feedback.ok {
    color: var(--color-teal);
  }

  .reader-question-feedback.bad {
    color: var(--color-danger);
  }

  .reader-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 50;
  }

  .reader-popup {
    width: 100%;
    max-width: 480px;
    background: var(--color-card);
    border-radius: var(--radius) var(--radius) 0 0;
    box-shadow: var(--shadow-soft);
    padding: 22px 20px calc(20px + env(safe-area-inset-bottom, 0px));
    text-align: center;
  }

  .reader-popup-word {
    font-size: 1.4rem;
    font-weight: 700;
    direction: ltr;
    margin-bottom: 6px;
  }

  .reader-popup-he {
    font-size: 1.2rem;
    color: var(--color-muted);
    margin-bottom: 18px;
  }

  .reader-popup-confirm {
    color: var(--color-teal);
    font-weight: 700;
    margin-top: 10px;
  }

  .reader-popup {
    animation: reader-popup-in var(--transition-fast);
  }

  .reader-popup::before {
    content: "";
    display: block;
    width: 40px;
    height: 4px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-muted) 45%, var(--color-card));
    margin: -6px auto 14px;
  }

  @keyframes reader-popup-in {
    from { transform: translateY(12px); opacity: 0.6; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

function header(subtitle, title) {
  return `
    <header class="app-header">
      <p class="greeting">${subtitle}</p>
      <h1 class="app-title">${title}</h1>
    </header>
  `;
}

function styleTag() {
  return `<style>${VIEW_STYLE}</style>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function normalizeWord(raw) {
  return raw.toLowerCase().replace(/[^a-z]/g, "");
}

function renderWords(text) {
  const tokens = text.split(/(\s+)/);
  return tokens
    .map((tok) => {
      if (/^\s+$/.test(tok) || tok === "") return tok;
      const dataWord = normalizeWord(tok);
      if (dataWord === "") return escapeHtml(tok);
      return `<span class="w" data-word="${escapeHtml(dataWord)}">${escapeHtml(tok)}</span>`;
    })
    .join("");
}

// Exported so a test can pin the two decisions that are easy to get backwards:
// we SAVE the lemma ("feel") but SEARCH for the sentence by the surface form
// ("feels"), because the chapter never contains the lemma. Swap them and the
// context is silently empty forever.
export function wordTapBody({ lemma, surface, he, text }) {
  const body = { action: "word-tap", lemma, he: he || null };
  const context = sentenceFor(text, surface);
  if (context) body.context = context;
  return body;
}

export function sentenceFor(text, word) {
  const target = String(word).toLowerCase();
  for (const s of String(text).split(/(?<=[.!?])\s+/)) {
    if (s.toLowerCase().split(/[^a-z']+/).includes(target)) return s.trim().slice(0, 200);
  }
  return "";
}

// Frozen decision table: she is NEVER blocked from continuing the story --
// if there is nothing to ask (lemmaCount=0), 'celebrate' wins even though the
// quiz has not run.
export function afterChapterStage({ doneAll, quizDone, lemmaCount }) {
  if (!doneAll) return "questions";
  if (quizDone) return "celebrate";
  if (lemmaCount === 0) return "celebrate";
  return "quiz";
}

// Keyed by chapter number so a fresh chapter always gets a fresh quiz -- a
// flat boolean here would silently skip the quiz on chapter 2 onward.
export function chapterQuizState(quizState, n) {
  if (!quizState[n]) quizState[n] = { started: false, done: false };
  return quizState[n];
}

function findInGlossary(chapter, dataWord) {
  if (!chapter || !Array.isArray(chapter.glossary)) return null;
  for (const g of chapter.glossary) {
    if (!g || typeof g.word !== "string") continue;
    const gw = g.word.toLowerCase();
    if (gw === dataWord || dataWord.startsWith(gw)) {
      return g.he;
    }
  }
  return null;
}

export async function render(container, ctx) {
  let profile = null;
  let stage = "loading";
  let generating = false;
  let genError = false;
  let activePopup = null; // { lemma, surface, he, saved, canSay }
  let allowedWords = new Set();
  let lemmas = [];
  let knownSet = new Set();
  let candidateSet = new Set();

  async function boot() {
    draw();
    try {
      allowedWords = await getAllowedSet();
      profile = await getJson("/api/profile");
      // B3 (docs/growth.md section 8): at most ONE candidate per sitting, merged
      // ahead of the known pool HERE, at the call site, so QZ-17's comparator is
      // untouched. The slot is RESERVED, not leftover: a candidate that is never
      // reached can never become known. A candidate with no bank item is skipped
      // in silence (D23), so an empty slot costs nothing.
      const candidateLemmas = pickCandidateWords(profile, 1);
      candidateSet = new Set(candidateLemmas);
      lemmas = candidateLemmas.concat(pickQuizWords(profile, 20));
      knownSet = knownSetFromProfile(profile);
      decideStage();
    } catch (err) {
      stage = "error";
    }
    draw();
  }

  function decideStage() {
    if (!profile.placement || !profile.placement.completed) {
      stage = "needs-placement";
      return;
    }
    if (!profile.learner.heroineName || !profile.learner.petName) {
      stage = "onboarding";
      return;
    }
    if (!profile.story.chapters || profile.story.chapters.length === 0) {
      stage = "start-story";
      return;
    }
    stage = "chapter";
  }

  function latestChapter() {
    const chapters = profile.story.chapters;
    return chapters[chapters.length - 1];
  }

  async function runGenerate() {
    generating = true;
    genError = false;
    draw();
    try {
      const { chapter } = await postJson("/api/chapter", { action: "generate" });
      profile.story.chapters.push(chapter);
      generating = false;
      stage = "chapter";
      draw();
      await celebrateFromServer();
    } catch (err) {
      generating = false;
      genError = true;
      draw();
    }
  }

  // T5 + SK3-2. api/chapter.js:66 returns { chapter } and NO profile, so the
  // phone asks once. Read into a LOCAL: reassigning the module-scope `profile`
  // here would silently change what latestChapter(), decideStage() and the
  // already-computed lemmas/knownSet see. A profile provably exists by now
  // (the server just saved one), so this GET creates nothing.
  async function celebrateFromServer() {
    let fresh;
    try {
      fresh = await getJson("/api/profile");
    } catch (err) {
      return;
    }
    maybeCelebrateTrophy(fresh);
  }

  function renderLoading() {
    return `${styleTag()}${header("הסיפור", "רגע...")}<p class="card-subtitle">טוען...</p>`;
  }

  function renderNeedsPlacement() {
    return `
      ${styleTag()}
      ${header("הסיפור", "מרפאת הקסמים")}
      <div class="card">
        <p class="card-subtitle" style="margin-bottom: 16px;">קודם נעשה מבחן היכרות קטן</p>
        <a class="btn btn-primary" href="#/placement" style="text-decoration:none;">למבחן ההיכרות</a>
      </div>
    `;
  }

  function renderOnboarding() {
    return `
      ${styleTag()}
      ${header("הסיפור", "בואי נכיר")}
      <div class="card">
        <div class="reader-onboard-field">
          <label class="reader-onboard-label" for="heroineName">איך נקרא לגיבורה שלנו?</label>
          <input class="reader-onboard-input" id="heroineName" type="text" dir="ltr" autocomplete="off" autocorrect="off" spellcheck="false" />
        </div>
        <div class="reader-onboard-field">
          <label class="reader-onboard-label" for="petName">ואיך נקרא לחיה הקסומה הראשונה?</label>
          <input class="reader-onboard-input" id="petName" type="text" dir="ltr" autocomplete="off" autocorrect="off" spellcheck="false" />
        </div>
        <button class="btn btn-primary" type="button" data-action="onboard-submit">יאללה, מתחילים!</button>
      </div>
    `;
  }

  function renderStartStory() {
    return `
      ${styleTag()}
      ${header("הסיפור", "מרפאת הקסמים")}
      <img class="hero-banner" src="/assets/hero-clinic.webp" alt="" />
      <div class="card">
        <p class="card-subtitle" style="margin-bottom: 16px;">הכל מוכן! הגיע הזמן להתחיל את ההרפתקה.</p>
        <button class="btn btn-primary" type="button" data-action="generate">מתחילים את הסיפור</button>
      </div>
    `;
  }

  function renderGenerating() {
    return `
      ${styleTag()}
      ${header("הסיפור", "מרפאת הקסמים")}
      <div class="reader-loading">
        <img class="spot-image spot-image--sm reader-loading-art" src="/assets/placement-friend.webp" alt="" />
        <div class="reader-spinner" aria-hidden="true"></div>
        <p>הקסם קורה... רגע אחד</p>
      </div>
    `;
  }

  function renderGenError() {
    return `
      ${styleTag()}
      ${header("הסיפור", "מרפאת הקסמים")}
      <div class="card">
        <p class="card-subtitle" style="margin-bottom: 16px;">רגע, הקסם מתעכב… ננסה שוב עוד רגע.</p>
        <button class="btn btn-primary" type="button" data-action="generate">נסי שוב</button>
      </div>
    `;
  }

  const checkState = {};
  const quizState = {};

  function questionState(q) {
    const key = q.id;
    if (!checkState[key]) {
      checkState[key] = { correct: false, chosen: null, logged: false, triedWrong: new Set() };
    }
    return checkState[key];
  }

  function allQuestionsCorrect(chapter) {
    return chapter.questions.every((q) => questionState(q).correct);
  }

  function renderQuestion(chapter, q) {
    const st = questionState(q);
    const optionsHtml = q.options
      .map((opt, i) => {
        let cls = "reader-question-option";
        let disabled = "";
        if (st.correct) {
          disabled = "disabled";
          if (i === q.correctIndex) cls += " correct";
        } else if (st.triedWrong.has(i)) {
          disabled = "disabled";
          cls += " wrong";
        }
        return `<button class="${cls}" type="button" data-action="q-answer" data-q="${q.id}" data-choice="${i}" ${disabled}>${escapeHtml(opt)}</button>`;
      })
      .join("");

    let feedbackHtml = "";
    if (st.correct) {
      feedbackHtml = `<p class="reader-question-feedback ok">כל הכבוד!</p>`;
    } else if (st.chosen !== null) {
      feedbackHtml = `<p class="reader-question-feedback bad">לא נורא, ננסה שוב</p>`;
    }

    return `
      <div class="card reader-question-card">
        <p class="reader-question-prompt">${escapeHtml(q.prompt)}</p>
        <div class="reader-question-options">${optionsHtml}</div>
        ${feedbackHtml}
      </div>
    `;
  }

  function renderPopup() {
    if (!activePopup) return "";
    const savedHtml = activePopup.saved
      ? `<p class="reader-popup-confirm">נשמר!</p>`
      : `<button class="btn btn-primary" type="button" data-action="popup-save">שמרי למילים שלי</button>`;
    return `
      <div class="reader-overlay" data-action="popup-close">
        <div class="reader-popup" data-action="popup-stop">
          <p class="reader-popup-word">${escapeHtml(activePopup.lemma)}</p>
          ${activePopup.canSay ? `<button class="btn-say" type="button" data-say="${escapeHtml(activePopup.lemma)}" aria-label="הקשיבי למילה">🔊</button>` : ""}
          <p class="reader-popup-he">${escapeHtml(activePopup.he || "—")}</p>
          ${savedHtml}
        </div>
      </div>
    `;
  }

  function renderChapter() {
    const chapter = latestChapter();
    const bannerName = CHAPTER_BANNERS[chapter.n % 3];
    const questionsHtml = chapter.questions.map((q) => renderQuestion(chapter, q)).join("");
    const doneAll = allQuestionsCorrect(chapter);
    const qs = chapterQuizState(quizState, chapter.n);
    const chapterStage = afterChapterStage({ doneAll, quizDone: qs.done, lemmaCount: lemmas.length });
    const quizHtml = chapterStage === "quiz" ? `<div class="reader-quiz-slot"></div>` : "";
    const celebrateHtml = chapterStage === "celebrate"
      ? `<img class="celebrate-image" src="/assets/celebration.webp" alt="" />`
      : "";
    const continueHtml = chapterStage === "celebrate"
      ? `<button class="btn btn-primary" type="button" data-action="continue-story">המשך הסיפור</button>`
      : "";

    return `
      ${styleTag()}
      ${header("הסיפור", "מרפאת הקסמים")}
      <p class="reader-chapter-label">פרק ${chapter.n}</p>
      <img class="chapter-banner" src="/assets/${bannerName}.webp" alt="" />
      <div class="card">
        <p class="reader-card-title">${escapeHtml(chapter.title)}</p>
        <div class="reader-text" dir="ltr">${renderWords(chapter.text)}</div>
      </div>
      ${questionsHtml}
      ${quizHtml}
      ${celebrateHtml}
      ${continueHtml}
      ${renderPopup()}
    `;
  }

  function draw() {
    let html;
    if (stage === "loading") html = renderLoading();
    else if (stage === "needs-placement") html = renderNeedsPlacement();
    else if (stage === "onboarding") html = renderOnboarding();
    else if (stage === "start-story") html = renderStartStory();
    else if (stage === "chapter") {
      if (generating) html = renderGenerating();
      else if (genError) html = renderGenError();
      else html = renderChapter();
    } else {
      html = `${styleTag()}${header("הסיפור", "אופס")}<p class="card-subtitle">משהו השתבש.</p>`;
    }

    container.innerHTML = html;
    bindEvents();
  }

  function bindEvents() {
    const onboardBtn = container.querySelector('[data-action="onboard-submit"]');
    if (onboardBtn) {
      onboardBtn.addEventListener("click", async () => {
        const heroineName = container.querySelector("#heroineName").value.trim();
        const petName = container.querySelector("#petName").value.trim();
        if (!heroineName || !petName) return;
        try {
          profile = await postJson("/api/profile", {
            action: "set-learner",
            heroineName,
            petName,
          });
        } catch (err) {
          return;
        }
        stage = "chapter";
        await runGenerate();
      });
    }

    const generateBtn = container.querySelector('[data-action="generate"]');
    if (generateBtn) {
      generateBtn.addEventListener("click", async () => {
        stage = "chapter";
        await runGenerate();
      });
    }

    const continueBtn = container.querySelector('[data-action="continue-story"]');
    if (continueBtn) {
      continueBtn.addEventListener("click", async () => {
        await runGenerate();
      });
    }

    container.querySelectorAll('[data-action="q-answer"]').forEach((btn) => {
      btn.addEventListener("click", async () => {
        const chapter = latestChapter();
        const qId = btn.getAttribute("data-q");
        const q = chapter.questions.find((x) => x.id === qId);
        const choice = Number(btn.getAttribute("data-choice"));
        const st = questionState(q);
        const isFirstAnswer = !st.logged;

        st.chosen = choice;
        st.correct = choice === q.correctIndex;
        if (!st.correct) {
          st.triedWrong.add(choice);
        }

        if (isFirstAnswer) {
          st.logged = true;
          try {
            await postJson("/api/profile", {
              action: "log-check",
              chapter: chapter.n,
              questionId: q.id,
              chosenIndex: choice,
              correctIndex: q.correctIndex,
            });
          } catch (err) {
            // ignore network errors on logging
          }
        }

        draw();
      });
    });

    container.querySelectorAll(".reader-text .w").forEach((span) => {
      span.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const dataWord = span.getAttribute("data-word");
        if (!dataWord) return;
        const chapter = latestChapter();
        let he = findInGlossary(chapter, dataWord);
        // dataWord is what is PRINTED ("feels"); the clip is under the lemma
        // ("feel"). Keep both: the surface form is what the glossary and the
        // sentence search need, the lemma is what we speak and save.
        const lemma = resolveLemma(dataWord, allowedWords);
        activePopup = {
          lemma: lemma || dataWord,
          surface: dataWord,
          canSay: lemma !== null,
          he: he || "",
          saved: false,
        };
        draw();
        if (he === null) {
          try {
            const r = await postJson("/api/translate", { word: dataWord });
            if (activePopup && activePopup.surface === dataWord) {
              activePopup.he = r.he;
              draw();
            }
          } catch (err) {
            // leave popup with dash
          }
        }
      });
    });

    const popupSaveBtn = container.querySelector('[data-action="popup-save"]');
    if (popupSaveBtn) {
      popupSaveBtn.addEventListener("click", async () => {
        if (!activePopup) return;
        try {
          const body = wordTapBody({
            lemma: activePopup.lemma,
            surface: activePopup.surface,
            he: activePopup.he,
            text: latestChapter().text,
          });
          await postJson("/api/profile", body);
        } catch (err) {
          // ignore
        }
        if (activePopup) {
          activePopup.saved = true;
          draw();
        }
      });
    }

    container.querySelectorAll("[data-say]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const lemma = btn.getAttribute("data-say");
        if (!lemma) return;
        try {
          const audio = new Audio(`/audio/words/${encodeURIComponent(lemma)}.aac`);
          const p = audio.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } catch (err) {
          /* a missing clip must never break the story */
        }
      });
    });

    const overlay = container.querySelector(".reader-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => {
        activePopup = null;
        draw();
      });
    }

    const popup = container.querySelector('[data-action="popup-stop"]');
    if (popup) {
      popup.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });
    }

    const slot = container.querySelector(".reader-quiz-slot");
    if (slot) {
      const chapter = latestChapter();
      const qs = chapterQuizState(quizState, chapter.n);
      if (!qs.started) {
        qs.started = true;
        startQuiz(slot, {
          lemmas,
          knownSet,
          candidateSet,
          count: 4,
          onDone: async ({ total }) => {
            qs.done = true;
            draw();
            if (total > 0) await celebrateFromServer();
          },
        });
      }
    }
  }

  await boot();
}
