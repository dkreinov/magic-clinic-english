// A small, purely-for-fun matching/memory game: flip cards, pair an English
// word with its Hebrew translation. No score is ever posted to her profile
// (same WS-5 philosophy the word-sentences design settled on for its own
// ungraded activity: a game with no consequence needs no grading).
//
// Pure logic (pickPairs, buildCards, isMatch, renderBoard) is separated from
// the DOM-binding orchestrator (startMatchGame) the same way public/quiz.js
// splits from public/quiz-core.js, so the mechanics are unit-testable without
// a browser.

// Re-injected on every render, same reason public/quiz.js does it: launching
// the game replaces the WHOLE container (including the parent view's own
// <style> tag), so nothing here can rely on VIEW_STYLE from exam-words.js.
const VIEW_STYLE = `<style>
  .match-count {
    font-size: 0.95rem;
    color: var(--color-muted);
    font-weight: 600;
    margin: 0 0 12px;
  }

  .match-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .match-card {
    aspect-ratio: 1;
    border-radius: var(--radius);
    border: 1px solid rgba(150, 104, 47, 0.25);
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 6px;
    cursor: pointer;
  }

  .match-card.up {
    background: color-mix(in srgb, var(--color-primary) 12%, var(--color-card));
  }

  .match-card.matched {
    background: color-mix(in srgb, var(--color-teal) 18%, var(--color-card));
    color: var(--color-teal);
    cursor: default;
  }

  .match-done-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 4px;
  }

  .match-done-score {
    font-size: 0.95rem;
    color: var(--color-muted);
    margin: 0 0 14px;
  }

  .match-done-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
  }
</style>`;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shuffle(arr, rand) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Only pairs with BOTH sides present can ever be matched; a phrase like
// "ice cream" is a perfectly fine card (it is just text here, no audio
// resolution needed the way the say-button on the list requires).
export function pickPairs(examWords, count, rand = Math.random) {
  const usable = (examWords || []).filter(
    (e) => e && typeof e.word === "string" && e.word.trim() !== "" && typeof e.he === "string" && e.he.trim() !== ""
  );
  return shuffle(usable, rand).slice(0, Math.min(count, usable.length));
}

export function buildCards(pairs, rand = Math.random) {
  const cards = [];
  pairs.forEach((pair, i) => {
    cards.push({ id: `en-${i}`, pairId: i, kind: "en", text: pair.word });
    cards.push({ id: `he-${i}`, pairId: i, kind: "he", text: pair.he });
  });
  return shuffle(cards, rand);
}

export function isMatch(a, b) {
  return Boolean(a) && Boolean(b) && a.id !== b.id && a.pairId === b.pairId;
}

export function renderBoard(cards, { flippedIds = [], matchedIds = new Set() } = {}) {
  const flipped = new Set(flippedIds);
  return cards
    .map((card) => {
      const isUp = flipped.has(card.id) || matchedIds.has(card.id);
      const isMatched = matchedIds.has(card.id);
      const cls = "match-card" + (isUp ? " up" : "") + (isMatched ? " matched" : "");
      const dir = card.kind === "he" ? "rtl" : "ltr";
      const face = isUp ? `<span dir="${dir}">${escapeHtml(card.text)}</span>` : "?";
      return `<button type="button" class="${cls}" data-card-id="${escapeHtml(card.id)}" ${
        isUp ? "disabled" : ""
      }>${face}</button>`;
    })
    .join("");
}

const FLIP_BACK_MS = 900;

export async function startMatchGame(container, { examWords, count = 6, rand = Math.random, onExit = () => {} }) {
  const pairs = pickPairs(examWords, count, rand);

  if (pairs.length < 2) {
    container.innerHTML = `
      ${VIEW_STYLE}
      <p class="card-subtitle">אין עדיין מספיק מילים למשחק הזה.</p>
      <button class="btn btn-primary" type="button" data-action="match-exit">חזרה לרשימה</button>
    `;
    container.querySelector('[data-action="match-exit"]').addEventListener("click", onExit);
    return;
  }

  const cards = buildCards(pairs, rand);
  let flippedIds = [];
  const matchedIds = new Set();
  let moves = 0;
  let locked = false;

  function draw() {
    const done = matchedIds.size === cards.length;
    const doneHtml = done
      ? `
        <p class="match-done-title">כל הכבוד! מצאת את כל הזוגות</p>
        <p class="match-done-score">${moves} ניסיונות</p>
        <div class="match-done-actions">
          <button class="btn btn-primary" type="button" data-action="match-again">שחקי שוב</button>
          <button class="btn" type="button" data-action="match-exit">חזרה לרשימה</button>
        </div>
      `
      : `
        <p class="match-count">זוגות: ${matchedIds.size / 2} מתוך ${cards.length / 2}</p>
        <button class="btn" type="button" data-action="match-exit">חזרה לרשימה</button>
      `;

    container.innerHTML = `
      ${VIEW_STYLE}
      ${doneHtml}
      <div class="match-grid">${renderBoard(cards, { flippedIds, matchedIds })}</div>
    `;
    bind();
  }

  function bind() {
    container.querySelectorAll("[data-card-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (locked) return;
        const id = btn.getAttribute("data-card-id");
        if (flippedIds.includes(id) || matchedIds.has(id)) return;
        flippedIds.push(id);

        if (flippedIds.length < 2) {
          draw();
          return;
        }

        moves++;
        const [aId, bId] = flippedIds;
        const a = cards.find((c) => c.id === aId);
        const b = cards.find((c) => c.id === bId);

        if (isMatch(a, b)) {
          matchedIds.add(aId);
          matchedIds.add(bId);
          flippedIds = [];
          draw();
          return;
        }

        locked = true;
        draw();
        setTimeout(() => {
          flippedIds = [];
          locked = false;
          draw();
        }, FLIP_BACK_MS);
      });
    });

    const again = container.querySelector('[data-action="match-again"]');
    if (again) again.addEventListener("click", () => startMatchGame(container, { examWords, count, rand, onExit }));

    const exit = container.querySelector('[data-action="match-exit"]');
    if (exit) exit.addEventListener("click", onExit);
  }

  draw();
}
