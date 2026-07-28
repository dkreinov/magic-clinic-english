// The quiz component: the screen, the session, the answer. QZ-18.
import { postJson } from './api.js';
import { newSessionId, selectOptions, pickItem } from './quiz-core.js';

const VIEW_STYLE = `<style>
  .quiz-progress {
    font-size: 0.9rem;
    color: var(--color-muted);
    font-weight: 600;
    margin: 0 0 4px;
  }

  .quiz-prompt {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 12px;
  }

  .quiz-sense {
    font-size: 1rem;
    color: var(--color-ink);
    margin: 0 0 8px;
  }

  .quiz-sentence {
    font-size: 1.05rem;
    color: var(--color-muted);
    margin: 0 0 16px;
  }

  .quiz-hint-btn {
    min-height: 40px;
    padding: 0 16px;
    margin: 0 0 16px;
    border-radius: var(--radius);
    border: 2px solid var(--color-border);
    background: var(--color-surface-2);
    color: var(--color-ink);
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
  }

  .quiz-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0 0 16px;
  }

  .quiz-option-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .quiz-option {
    flex: 1 1 auto;
    min-height: 48px;
    padding: 0 16px;
    border-radius: var(--radius);
    border: 2px solid var(--color-border);
    background: var(--color-surface-2);
    color: var(--color-ink);
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
  }

  .quiz-option.correct {
    border-color: var(--color-teal);
    color: var(--color-teal);
  }

  .quiz-option.wrong {
    border-color: var(--color-danger);
    color: var(--color-danger);
  }

  .quiz-option[disabled] {
    cursor: not-allowed;
  }

  .quiz-feedback {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-teal);
    margin: 0 0 8px;
  }

  .quiz-demoted {
    font-size: 0.9rem;
    color: var(--color-accent);
    margin: 0 0 8px;
  }

  .quiz-done-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0 0 8px;
  }

  .quiz-done-score {
    font-size: 1rem;
    color: var(--color-muted);
    margin: 0;
  }
</style>`;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderOptions(options, item, chosen) {
  return options
    .map((opt) => {
      let cls = 'quiz-option';
      let disabledAttr = '';
      if (chosen !== null) {
        disabledAttr = ' disabled';
        if (opt === item.answer) cls += ' correct';
        if (chosen !== item.answer && opt === chosen) cls += ' wrong';
      }
      return `
        <div class="quiz-option-row">
          <button type="button" class="${cls}" data-choice="${escapeHtml(opt)}"${disabledAttr}>${escapeHtml(opt)}</button>
          <button type="button" class="btn-say" data-say="${escapeHtml(opt)}" aria-label="הקשיבי למילה">🔊</button>
        </div>
      `;
    })
    .join('');
}

export function answerBody(sessionId, lemma, correct) {
  return { action: 'quiz-answer', lemma, correct, sessionId };
}

export async function loadItem(lemma, rand = Math.random) {
  let res;
  try {
    res = await fetch(`/quiz/${encodeURIComponent(lemma)}.json`);
  } catch {
    return null;
  }
  if (!res || !res.ok) return null;
  let data;
  try {
    data = await res.json();
  } catch {
    return null;
  }
  if (!Array.isArray(data) || data.length === 0) return null;
  return pickItem(data, rand);
}

export function renderQuizCard(state) {
  const { item, options, index, total, chosen, correct, demoted, hintShown, wasCandidate } = state;

  const feedbackHtml =
    chosen !== null
      ? correct
        ? `<p class="quiz-feedback">כל הכבוד!</p>`
        : `<p class="quiz-feedback">כמעט! המילה הנכונה היא <strong>${escapeHtml(item.answer)}</strong></p>`
      : '';

  // B6(iii): a candidate is a word the APP guessed she knew. She never claimed
  // it, so "goes back to learning" would describe a promotion she never saw
  // herself receive. Same node, same class, same position in the frozen
  // QZ-18/QZ-23 order -- only the text changes.
  const demotedHtml = demoted
    ? wasCandidate
      ? `<p class="quiz-demoted">עוד לא — נמשיך ללמוד את המילה הזאת</p>`
      : `<p class="quiz-demoted">המילה הזאת חוזרת ללמידה, נלמד אותה שוב יחד</p>`
    : '';

  const nextHtml =
    chosen !== null
      ? `<button type="button" class="btn btn-primary" data-action="quiz-next">הלאה</button>`
      : '';

  const hintHtml =
    hintShown || chosen !== null
      ? `<p class="quiz-sense">${escapeHtml(item.sense)}</p>`
      : `<button class="quiz-hint-btn" type="button" data-action="quiz-hint">רמז</button>`;

  return `
    <p class="quiz-progress">שאלה ${index + 1} מתוך ${total}</p>
    <p class="quiz-prompt">איזו מילה מתאימה?</p>
    <p class="quiz-sentence" dir="ltr">${escapeHtml(item.sentence)}</p>
    ${hintHtml}
    <div class="quiz-options">${renderOptions(options, item, chosen)}</div>
    ${feedbackHtml}
    ${demotedHtml}
    ${nextHtml}
  `;
}

export function renderQuizDone({ right, total }) {
  return `
    <p class="quiz-done-title">סיימנו את התרגול!</p>
    <p class="quiz-done-score">${right} מתוך ${total}</p>
  `;
}

export function createQuizSession(questions) {
  return {
    sessionId: newSessionId(),
    questions,
    index: 0,
    right: 0,
    wrong: 0,
  };
}

export async function startQuiz(
  container,
  {
    lemmas,
    knownSet,
    candidateSet = new Set(),
    count = 4,
    onDone = () => {},
    load = loadItem,
    post = (body) => postJson('/api/profile', body),
    rand = Math.random,
  }
) {
  const questions = [];
  for (const lemma of lemmas) {
    if (questions.length === count) break;
    const item = await load(lemma, rand);
    if (item === null) continue;
      questions.push({
        lemma,
        item,
        options: selectOptions(item, knownSet, rand),
        hintShown: false,
        wasCandidate: candidateSet.has(lemma),
      });
    if (questions.length === count) break;
  }

  if (questions.length === 0) {
    onDone({ right: 0, total: 0 });
    return createQuizSession(questions);
  }

  const session = createQuizSession(questions);
  let chosen = null;
  let correctFlag = null;
  let demoted = false;

  function bind() {
    container.querySelectorAll('[data-choice]').forEach((btn) => {
      btn.addEventListener('click', () => session.answer(btn.getAttribute('data-choice')));
    });
    container.querySelectorAll('[data-say]').forEach((btn) => {
      btn.addEventListener('click', () => {
        new Audio('/audio/words/' + encodeURIComponent(btn.getAttribute('data-say')) + '.aac')
          .play()
          .catch(() => {});
      });
    });
    container.querySelectorAll('[data-action="quiz-next"]').forEach((btn) => {
      btn.addEventListener('click', () => session.next());
    });
    container.querySelectorAll('[data-action="quiz-hint"]').forEach((btn) => {
      btn.addEventListener('click', () => session.hint());
    });
  }

  function renderCurrent() {
    const q = session.questions[session.index];
    const html = renderQuizCard({
      lemma: q.lemma,
      item: q.item,
      options: q.options,
      index: session.index,
      total: session.questions.length,
      chosen,
      correct: correctFlag,
      demoted,
      hintShown: q.hintShown,
      wasCandidate: q.wasCandidate,
    });
    container.innerHTML = VIEW_STYLE + html;
    bind();
  }

  session.answer = async function answer(option) {
    if (chosen !== null) return;
    const q = session.questions[session.index];
    const correct = option === q.item.answer;
    chosen = option;
    correctFlag = correct;

    let resp = null;
    try {
      resp = await post(answerBody(session.sessionId, q.lemma, correct));
    } catch {
      resp = null;
    }

    if (correct) session.right += 1;
    else session.wrong += 1;

    demoted =
      correct === false &&
      resp &&
      resp.words &&
      resp.words[q.lemma] &&
      resp.words[q.lemma].status === 'learning';

    renderCurrent();
  };

  session.hint = function hint() {
    if (chosen !== null) return;
    const q = session.questions[session.index];
    q.hintShown = true;
    renderCurrent();
  };

  session.next = function next() {
    session.index += 1;
    chosen = null;
    correctFlag = null;
    demoted = false;

    if (session.index >= session.questions.length) {
      const total = session.questions.length;
      container.innerHTML = VIEW_STYLE + renderQuizDone({ right: session.right, total });
      onDone({ right: session.right, total });
      return;
    }

    renderCurrent();
  };

  renderCurrent();
  return session;
}
