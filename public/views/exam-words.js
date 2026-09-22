import { resolveLemma } from "../lemma.js";
import { getAllowedSet } from "../words-index.js";
import { playOverMusic } from "../music.js";
import { saySlot } from "./words.js";

const VIEW_STYLE = `
  .exam-count {
    font-size: 0.95rem;
    color: var(--color-muted);
    font-weight: 600;
    margin-bottom: 16px;
  }

  .exam-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .exam-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: var(--color-card);
    border-radius: var(--radius);
    box-shadow: var(--shadow-soft);
    padding: 14px 16px;
  }

  .exam-card-lemma {
    font-size: 1.1rem;
    font-weight: 700;
  }
`;

function header() {
  return `
    <header class="app-header">
      <p class="greeting">מבחן אנגלית — אוקטובר 2025</p>
      <h1 class="app-title">מילות המבחן</h1>
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

let cachedWords = null;

async function loadExamWords() {
  if (cachedWords) return cachedWords;
  try {
    const res = await fetch("/exam-words.json");
    if (!res.ok) throw new Error(`exam-words ${res.status}`);
    const data = await res.json();
    cachedWords = Array.isArray(data) ? data : [];
  } catch (err) {
    cachedWords = [];
  }
  return cachedWords;
}

// A phrase like "ice cream" is not a lemma file -- it is spoken as its
// whitespace-split tokens in order. Only playable when EVERY token resolves,
// same invariant saySlot already relies on for single words.
function resolveTokens(phrase, allowedWords) {
  const tokens = phrase.toLowerCase().split(/\s+/);
  const resolved = tokens.map((tok) => resolveLemma(tok, allowedWords));
  if (resolved.some((r) => !r)) return null;
  return resolved;
}

function playSequence(lemmas) {
  let i = 0;
  const next = () => {
    if (i >= lemmas.length) return;
    const lemma = lemmas[i];
    i++;
    try {
      const audio = new Audio(`/audio/words/${encodeURIComponent(lemma)}.aac`);
      audio.addEventListener("ended", next);
      playOverMusic(audio);
      const p = audio.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch (err) {
      /* a missing clip must never break the exam list */
    }
  };
  next();
}

function renderCards(words, allowedWords) {
  return words
    .map((phrase) => {
      const tokens = resolveTokens(phrase, allowedWords);
      const sayHtml = saySlot(Boolean(tokens), phrase);
      return `
        <div class="exam-card">
          <span class="exam-card-lemma" dir="ltr">${escapeHtml(phrase)}</span>
          ${sayHtml}
        </div>
      `;
    })
    .join("");
}

export async function render(container, ctx) {
  container.innerHTML = `${styleTag()}${header()}<p class="card-subtitle">טוען...</p>`;

  let words = [];
  let allowedWords = null;
  try {
    [words, allowedWords] = await Promise.all([loadExamWords(), getAllowedSet()]);
  } catch (err) {
    container.innerHTML = `
      ${styleTag()}
      ${header()}
      <p class="card-subtitle">משהו השתבש, נסי שוב.</p>
    `;
    return;
  }

  if (words.length === 0) {
    container.innerHTML = `
      ${styleTag()}
      ${header()}
      <p class="card-subtitle">אין עדיין מילים למבחן הזה.</p>
    `;
    return;
  }

  container.innerHTML = `
    ${styleTag()}
    ${header()}
    <p class="exam-count">${words.length} מילים למבחן — לחצי על הרמקול כדי לשמוע כל מילה</p>
    <div class="exam-grid">${renderCards(words, allowedWords)}</div>
  `;

  container.querySelectorAll("[data-say]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const phrase = btn.getAttribute("data-say");
      if (!phrase) return;
      const tokens = resolveTokens(phrase, allowedWords);
      if (!tokens) return;
      playSequence(tokens);
    });
  });
}
