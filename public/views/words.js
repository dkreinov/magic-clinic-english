import { getJson, postJson } from "../api.js";
import { resolveLemma } from "../lemma.js";
import { getAllowedSet } from "../words-index.js";
import { startQuiz } from "../quiz.js";
import { pickQuizWords, knownSetFromProfile, pickCandidateWords, sampleRanked } from "../quiz-core.js";
import { maybeCelebrateTrophy } from "./trophies.js";
import { playOverMusic } from "../music.js";

const VIEW_STYLE = `
  .words-count {
    font-size: 0.95rem;
    color: var(--color-muted);
    font-weight: 600;
    margin-bottom: 16px;
  }

  .words-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .word-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: var(--color-card);
    border-radius: var(--radius);
    box-shadow: var(--shadow-soft);
    padding: 14px 16px;
  }

  .word-card-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .word-card-lemma {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .word-card-he {
    color: var(--color-muted);
    font-size: 0.95rem;
  }

  .word-context {
    font-size: 0.8rem;
    color: var(--color-muted);
    margin: 0;
  }

  .word-card-actions {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .word-badge {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .word-badge.known {
    background: color-mix(in srgb, var(--color-teal) 18%, var(--color-card));
    color: var(--color-teal);
  }

  .word-badge.learning {
    background: color-mix(in srgb, var(--color-accent) 18%, var(--color-card));
    color: var(--color-accent);
  }

  .word-badge.candidate {
    background: color-mix(in srgb, var(--color-primary) 18%, var(--color-card));
    color: var(--color-primary);
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

function renderEmpty() {
  return `
    ${styleTag()}
    ${header("האוסף שלי", "המילים שלי")}
    <div class="empty-state">
      <img class="spot-image" src="/assets/words-treasure.webp" alt="" />
      <p class="empty-state-title">עוד אין מילים באוסף</p>
      <p class="empty-state-text">מילים שתלחצי עליהן בזמן הקריאה ייאספו לכאן, כדי שתוכלי לחזור אליהן בכל זמן.</p>
    </div>
  `;
}

function statusBadge(status) {
  if (status === "known") {
    return `<span class="word-badge known">יודעת</span>`;
  }
  if (status === "candidate") {
    return `<span class="word-badge candidate">כמעט יודעת</span>`;
  }
  return `<span class="word-badge learning">לומדת</span>`;
}

export function markKnownBody(lemma) {
  return { action: "mark-known", lemma, source: "tap" };
}

export function renderQuizLauncher(count) {
  if (count === 0) return "";
  return `<div class="words-quiz-launch"><button class="btn btn-primary" type="button" data-action="start-quiz">בואי נתרגל מילים</button></div>`;
}

// word-finish phase 2 (design section 8, FROZEN). canSay gates the button's STATE, no
// longer its EXISTENCE. A word we cannot speak still shows the speaker, crossed out
// by CSS, with the ASCII caption "coming soon" under it -- so she can tell "no sound
// for THIS word yet" from "this app has no sound". The pressable branch still implies
// a clip exists: it is the only branch that carries data-say, and the [data-say]
// handler is the only thing that can play anything.
export function saySlot(canSay, lemma) {
  if (canSay) {
    return `<button class="btn-say" type="button" data-say="${escapeHtml(lemma)}" aria-label="הקשיבי למילה">🔊</button>`;
  }
  return `<span class="say-soon-wrap"><button class="btn-say na" type="button" disabled aria-hidden="true">🔊</button><span class="btn-say-soon">coming soon</span></span>`;
}

export function renderList(words, allowedWords = null, launcherHtml = "") {
  const entries = Object.entries(words).sort((a, b) => {
    const aTime = Date.parse(a[1].lastSeen) || 0;
    const bTime = Date.parse(b[1].lastSeen) || 0;
    return bTime - aTime;
  });

  const cardsHtml = entries
    .map(([lemma, entry]) => {
      const he = entry.he ? escapeHtml(entry.he) : "—";
      const contextHtml =
        typeof entry.context === "string" && entry.context.length > 0
          ? `<p class="word-context" dir="ltr">${escapeHtml(entry.context)}</p>`
          : "";
      // A row can only speak if we actually have a clip. When the manifest has
      // not loaded we fall back to assuming the key is sayable -- it is a lemma
      // by then, so that is the right guess.
      const sayLemma = allowedWords ? resolveLemma(lemma, allowedWords) : lemma;
      const sayHtml = saySlot(Boolean(sayLemma), sayLemma || lemma);
      const knowHtml =
        entry.status === "learning" || entry.status === "candidate"
          ? `<button class="btn-know" type="button" data-action="know" data-lemma="${escapeHtml(lemma)}">יודעת את זה</button>`
          : "";
      return `
        <div class="word-card">
          <div class="word-card-text">
            <span class="word-card-lemma" dir="ltr">${escapeHtml(lemma)}</span>
            <span class="word-card-he">${he}</span>
            ${contextHtml}
          </div>
          <div class="word-card-actions">
            ${sayHtml}
            ${knowHtml}
            ${statusBadge(entry.status)}
          </div>
        </div>
      `;
    })
    .join("");

  return `
    ${styleTag()}
    ${header("האוסף שלי", "המילים שלי")}
    <img class="spot-image spot-image--sm" src="/assets/words-treasure.webp" alt="" />
    <p class="words-count">${entries.length} מילים באוסף</p>${launcherHtml}
    <div class="words-grid">${cardsHtml}</div>
  `;
}

export async function render(container, ctx) {
  container.innerHTML = `${styleTag()}${header("האוסף שלי", "המילים שלי")}<p class="card-subtitle">טוען...</p>`;

  let words = {};
  let allowedWords = null;
  let profile = null;
  let lemmas = [];
  let candidateSet = new Set();

  function draw() {
    if (Object.keys(words).length === 0) {
      container.innerHTML = renderEmpty();
      return;
    }
    container.innerHTML = renderList(words, allowedWords, renderQuizLauncher(lemmas.length));
    bindEvents();
  }

  function bindEvents() {
    container.querySelectorAll("[data-say]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const lemma = btn.getAttribute("data-say");
        if (!lemma) return;
        try {
          const audio = new Audio(`/audio/words/${encodeURIComponent(lemma)}.aac`);
          // R8. The dictionary ducks too. The music element is module state, so
          // it keeps playing when she leaves the story for her word list -- if
          // only the reader ducked, the bed would sit on top of every word here.
          playOverMusic(audio);
          const p = audio.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } catch (err) {
          /* a missing clip must never break the dictionary */
        }
      });
    });

    container.querySelectorAll('[data-action="know"]').forEach((btn) => {
      btn.addEventListener("click", async () => {
        const lemma = btn.getAttribute("data-lemma");
        if (!lemma) return;
        let profile;
        try {
          profile = await postJson("/api/profile", markKnownBody(lemma));
        } catch (err) {
          return;
        }
        words = profile.words || {};
        draw();
      });
    });

    const quizBtn = container.querySelector('[data-action="start-quiz"]');
    if (quizBtn) {
      quizBtn.addEventListener("click", () => {
        startQuiz(container, {
          lemmas,
          knownSet: knownSetFromProfile(profile),
          candidateSet,
          count: 4,
          words,
          audioSet: allowedWords,
          // T5. boot() already re-reads /api/profile, so the post-award profile is
          // in hand -- no extra request. total > 0 skips the no-questions path
          // (quiz.js:247-250 fires onDone with NO done screen), and the
          // celebration NEVER goes inside renderQuizDone (QZ-18 frozen).
          onDone: async ({ total }) => {
            await boot();
            if (total > 0) maybeCelebrateTrophy(profile);
          },
        });
      });
    }
  }

  async function boot() {
    try {
      allowedWords = await getAllowedSet();
      profile = await getJson("/api/profile");
    } catch (err) {
      container.innerHTML = `
        ${styleTag()}
        ${header("האוסף שלי", "המילים שלי")}
        <p class="card-subtitle">משהו השתבש, נסי שוב.</p>
      `;
      return;
    }

    words = profile.words || {};
    // B3 (docs/growth.md section 8): at most ONE candidate per sitting, merged
    // ahead of the known pool HERE, at the call site, so QZ-17's comparator is
    // untouched. The slot is RESERVED, not leftover: a candidate that is never
    // reached can never become known. A candidate with no bank item is skipped
    // in silence (D23), so an empty slot costs nothing.
    const candidateLemmas = pickCandidateWords(profile, 1);
    candidateSet = new Set(candidateLemmas);
    lemmas = candidateLemmas.concat(sampleRanked(pickQuizWords(profile, 20), 4));
    draw();
  }

  await boot();
}
