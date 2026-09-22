import { getJson, postJson } from "../api.js";
import { resolveLemma } from "../lemma.js";
import { getAllowedSet } from "../words-index.js";
import { playOverMusic } from "../music.js";
import { saySlot, markKnownBody, renderQuizLauncher } from "./words.js";
import { startQuiz } from "../quiz.js";
import { knownSetFromProfile } from "../quiz-core.js";

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

  .exam-card-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .exam-card-lemma {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .exam-card-he {
    color: var(--color-muted);
    font-size: 0.95rem;
  }

  .exam-card-actions {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .exam-badge {
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

  .exam-badge.known {
    background: color-mix(in srgb, var(--color-teal) 18%, var(--color-card));
    color: var(--color-teal);
  }

  .exam-badge.learning {
    background: color-mix(in srgb, var(--color-accent) 18%, var(--color-card));
    color: var(--color-accent);
  }

  .exam-badge.candidate {
    background: color-mix(in srgb, var(--color-primary) 18%, var(--color-card));
    color: var(--color-primary);
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

function statusBadge(status) {
  if (status === "known") return `<span class="exam-badge known">יודעת</span>`;
  if (status === "candidate") return `<span class="exam-badge candidate">כמעט יודעת</span>`;
  return `<span class="exam-badge learning">לומדת</span>`;
}

async function loadExamWords() {
  const res = await fetch("/exam-words.json");
  if (!res.ok) throw new Error(`exam-words ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// The same normalization api/profile.js applies server-side (word-tap,
// mark-known, collect-band-words all do this): resolve to the lemma the
// audio manifest actually has a clip for, so "cookies" and her profile's
// "cookie" are the SAME key. A phrase like "ice cream" cannot resolve (no
// single clip named that), so it falls back to itself, exactly as the
// server does.
export function profileKeyFor(word, allowedWords) {
  return resolveLemma(word, allowedWords) || word.toLowerCase();
}

// A phrase like "ice cream" is not a lemma file -- it is spoken as its
// whitespace-split tokens in order. Only playable when EVERY token resolves.
export function resolveTokens(word, allowedWords) {
  const tokens = word.toLowerCase().split(/\s+/);
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

function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// profile is null when the profile fetch/collect failed (offline, etc.) --
// the list still renders fully, using the pre-baked "he" from exam-words.json
// itself, just without know-buttons, status badges or a quiz launcher, since
// those all require a real profile entry to act on.
export function renderCards(examWords, allowedWords, profile) {
  return examWords
    .map((entry) => {
      const key = profileKeyFor(entry.word, allowedWords);
      const profileEntry = profile ? profile.words[key] : null;
      const he = profileEntry && profileEntry.he ? profileEntry.he : entry.he;
      const heHtml = he ? escapeHtml(he) : "—";

      const tokens = resolveTokens(entry.word, allowedWords);
      const sayHtml = saySlot(Boolean(tokens), entry.word);

      const knowHtml =
        profileEntry && (profileEntry.status === "learning" || profileEntry.status === "candidate")
          ? `<button class="btn-know" type="button" data-action="know" data-lemma="${escapeHtml(key)}">יודעת את זה</button>`
          : "";
      const badgeHtml = profileEntry ? statusBadge(profileEntry.status) : "";

      return `
        <div class="exam-card">
          <div class="exam-card-text">
            <span class="exam-card-lemma" dir="ltr">${escapeHtml(entry.word)}</span>
            <span class="exam-card-he">${heHtml}</span>
          </div>
          <div class="exam-card-actions">
            ${sayHtml}
            ${knowHtml}
            ${badgeHtml}
          </div>
        </div>
      `;
    })
    .join("");
}

export async function render(container, ctx) {
  container.innerHTML = `${styleTag()}${header()}<p class="card-subtitle">טוען...</p>`;

  let examWords = [];
  let allowedWords = null;
  try {
    [examWords, allowedWords] = await Promise.all([loadExamWords(), getAllowedSet()]);
  } catch (err) {
    container.innerHTML = `
      ${styleTag()}
      ${header()}
      <p class="card-subtitle">משהו השתבש, נסי שוב.</p>
    `;
    return;
  }

  if (examWords.length === 0) {
    container.innerHTML = `
      ${styleTag()}
      ${header()}
      <p class="card-subtitle">אין עדיין מילים למבחן הזה.</p>
    `;
    return;
  }

  // R8-style graceful degrade: a profile she cannot reach must never take the
  // pronunciation list down with it. Only the parts that NEED a profile
  // (know-button, badge, quiz) go missing.
  let profile = null;
  try {
    const collectBody = {
      action: "collect-band-words",
      words: examWords.map((e) => ({ lemma: e.word, he: e.he })),
    };
    profile = await postJson("/api/profile", collectBody);
  } catch (err) {
    profile = null;
  }

  const examLemmas = [...new Set(examWords.map((e) => profileKeyFor(e.word, allowedWords)))];

  function draw() {
    const knownSet = profile ? knownSetFromProfile(profile) : new Set();
    const candidateSet = profile
      ? new Set(Object.keys(profile.words).filter((k) => profile.words[k] && profile.words[k].status === "candidate"))
      : new Set();

    const launcherHtml = profile ? renderQuizLauncher(examLemmas.length) : "";

    container.innerHTML = `
      ${styleTag()}
      ${header()}
      <p class="exam-count">${examWords.length} מילים למבחן — לחצי על הרמקול כדי לשמוע כל מילה</p>${launcherHtml}
      <div class="exam-grid">${renderCards(examWords, allowedWords, profile)}</div>
    `;

    container.querySelectorAll("[data-say]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const word = btn.getAttribute("data-say");
        if (!word) return;
        const tokens = resolveTokens(word, allowedWords);
        if (!tokens) return;
        playSequence(tokens);
      });
    });

    container.querySelectorAll('[data-action="know"]').forEach((btn) => {
      btn.addEventListener("click", async () => {
        const lemma = btn.getAttribute("data-lemma");
        if (!lemma) return;
        try {
          profile = await postJson("/api/profile", markKnownBody(lemma));
        } catch (err) {
          return;
        }
        draw();
      });
    });

    const quizBtn = container.querySelector('[data-action="start-quiz"]');
    if (quizBtn) {
      quizBtn.addEventListener("click", () => {
        startQuiz(container, {
          lemmas: shuffle(examLemmas),
          knownSet,
          candidateSet,
          count: 4,
          words: profile.words,
          audioSet: allowedWords,
          // T5/SK3-11: celebration is hooked at exactly three files
          // (words.js, reader.js, trophies.js) and no more -- a trophy earned
          // here still gets recorded (awardTrophies runs on every POST) and
          // surfaces the next time she visits one of those three screens.
          onDone: async () => {
            try {
              profile = await getJson("/api/profile");
            } catch (err) {
              /* keep the profile we already had */
            }
            draw();
          },
        });
      });
    }
  }

  draw();
}
