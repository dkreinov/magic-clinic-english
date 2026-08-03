// The quiz component: the screen, the session, the answer. QZ-18.
import { postJson } from './api.js';
import { newSessionId, selectOptions, pickItem, buildQuestion, gradeTyped, normalizeTyped } from './quiz-core.js';
import { QUIZ_STRINGS } from './quiz-strings.js';

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

  .quiz-he {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--color-ink);
    margin: 0 0 16px;
  }

  .quiz-typed {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0 0 16px;
  }

  .quiz-input {
    min-height: 48px;
    padding: 0 16px;
    border-radius: var(--radius);
    border: 2px solid var(--color-border);
    background: var(--color-surface-2);
    color: var(--color-ink);
    font-size: 1.05rem;
    font-weight: 700;
    direction: ltr;
  }

  .quiz-listen {
    margin: 0 0 16px;
  }

  .quiz-nearmiss {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-accent);
    margin: 0 0 8px;
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

// The one speaker button markup in this file. listen-type's body reuses this
// SAME literal (via this one function) rather than re-typing the Hebrew
// aria-label a second time in the source -- the DOM output is copied verbatim
// either way, and quiz.js's non-ASCII byte count does not grow doing it this way.
function sayButtonHtml(word) {
  return `<button type="button" class="btn-say" data-say="${escapeHtml(word)}" aria-label="הקשיבי למילה">🔊</button>`;
}

function renderOptions(options, answer, chosen) {
  return options
    .map((opt) => {
      let cls = 'quiz-option';
      let disabledAttr = '';
      if (chosen !== null) {
        disabledAttr = ' disabled';
        if (opt === answer) cls += ' correct';
        if (chosen !== answer && opt === chosen) cls += ' wrong';
      }
      return `
        <div class="quiz-option-row">
          <button type="button" class="${cls}" data-choice="${escapeHtml(opt)}"${disabledAttr}>${escapeHtml(opt)}</button>
          ${sayButtonHtml(opt)}
        </div>
      `;
    })
    .join('');
}

function randomToken() {
  return Math.random().toString(36).slice(2, 10);
}

// STEP 2.3: the typed-answer surface shared by he-type and listen-type. WK-3: all
// nine attributes, every time -- the random name (when the caller supplies none)
// is LOAD-BEARING, because mobile Safari/Chrome re-offer a previous value for any
// field name they recognise (reader.js:699 is the existing precedent that OMITS
// autocapitalize; this input carries all nine).
function renderTypedSurface({ inputName, typed, chosen, retry }) {
  const resolved = chosen !== null;
  const name = inputName || 'q-' + randomToken();
  const valueAttr = typed !== undefined && typed !== null ? escapeHtml(typed) : '';
  const disabledAttr = resolved ? ' disabled' : '';
  const inputHtml = `<input type="text" dir="ltr" lang="en" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" name="${escapeHtml(name)}" class="quiz-input" value="${valueAttr}"${disabledAttr}>`;
  const checkHtml = resolved
    ? ''
    : `<button type="button" class="btn btn-primary" data-action="quiz-check">${QUIZ_STRINGS.check_button}</button>`;
  const nearMissHtml = retry && !resolved ? `<p class="quiz-nearmiss">${QUIZ_STRINGS.near_miss}</p>` : '';
  return `${nearMissHtml}<div class="quiz-typed">${inputHtml}${checkHtml}</div>`;
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
  const {
    kind = 'cloze-pick',
    item,
    options,
    index,
    total,
    chosen,
    correct,
    demoted,
    hintShown,
    wasCandidate,
    promptHe,
    sayLemma,
    typed,
    retry,
    inputName,
  } = state;

  // STEP 2.3: `answer` replaces `item.answer` below because `item` is null for
  // three of the four kinds. cloze-pick's own callers keep passing item.answer
  // (or, as here, nothing at all -- in which case we fall back to item.answer
  // ourselves), so its output is unchanged to the byte.
  const answer = state.answer !== undefined ? state.answer : item ? item.answer : undefined;

  // Computed ONCE and reused across all four branches below (like feedbackHtml,
  // demotedHtml and nextHtml) so the Hebrew literal is typed exactly once in this
  // file, not once per kind -- see the non-ASCII byte-count gate (R-W-9's sibling
  // rule: no new Hebrew is typed by hand, all of it comes from a single source).
  const progressHtml = `<p class="quiz-progress">שאלה ${index + 1} מתוך ${total}</p>`;

  const feedbackHtml =
    chosen !== null
      ? correct
        ? `<p class="quiz-feedback">כל הכבוד!</p>`
        : `<p class="quiz-feedback">כמעט! המילה הנכונה היא <strong>${escapeHtml(answer)}</strong></p>`
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

  if (kind === 'he-pick') {
    // R-W-10: no hint button, no sentence -- the Hebrew word IS the gloss.
    return `
    ${progressHtml}
    <p class="quiz-prompt">${QUIZ_STRINGS.he_pick_prompt}</p>
    <p class="quiz-he" dir="rtl" lang="he">${escapeHtml(promptHe)}</p>
    <div class="quiz-options">${renderOptions(options, answer, chosen)}</div>
    ${feedbackHtml}
    ${demotedHtml}
    ${nextHtml}
  `;
  }

  if (kind === 'he-type') {
    // R-W-11: no speaker button -- it is a writing test, not a listen-type test.
    const typedSurfaceHtml = renderTypedSurface({ inputName, typed, chosen, retry });
    return `
    ${progressHtml}
    <p class="quiz-prompt">${QUIZ_STRINGS.he_type_prompt}</p>
    <p class="quiz-he" dir="rtl" lang="he">${escapeHtml(promptHe)}</p>
    ${typedSurfaceHtml}
    ${feedbackHtml}
    ${demotedHtml}
    ${nextHtml}
  `;
  }

  if (kind === 'listen-type') {
    // The speaker button markup below is copied verbatim from renderOptions so
    // the existing [data-say] binding plays it with zero new wiring. No English
    // text anywhere in the body before the card resolves.
    const typedSurfaceHtml = renderTypedSurface({ inputName, typed, chosen, retry });
    return `
    ${progressHtml}
    <p class="quiz-prompt">${QUIZ_STRINGS.listen_type_prompt}</p>
    <div class="quiz-listen">${sayButtonHtml(sayLemma)}</div>
    ${typedSurfaceHtml}
    ${feedbackHtml}
    ${demotedHtml}
    ${nextHtml}
  `;
  }

  // cloze-pick -- BYTE-IDENTICAL to before step 2.3. Do not touch this branch.
  const hintHtml =
    hintShown || chosen !== null
      ? `<p class="quiz-sense">${escapeHtml(item.sense)}</p>`
      : `<button class="quiz-hint-btn" type="button" data-action="quiz-hint">רמז</button>`;

  return `
    ${progressHtml}
    <p class="quiz-prompt">איזו מילה מתאימה?</p>
    <p class="quiz-sentence" dir="ltr">${escapeHtml(item.sentence)}</p>
    ${hintHtml}
    <div class="quiz-options">${renderOptions(options, answer, chosen)}</div>
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
    words = {},
    audioSet = null,
  }
) {
  const questions = [];
  for (const lemma of lemmas) {
    if (questions.length === count) break;
    const item = await load(lemma, rand);
    const built = buildQuestion(questions.length, lemma, { item, entry: words[lemma], audioSet, words }, rand);
    if (built === null) continue;
    const options = built.kind === 'cloze-pick' ? selectOptions(item, knownSet, rand) : built.options;
    questions.push({
      lemma,
      item,
      kind: built.kind,
      answer: built.answer,
      promptHe: built.promptHe,
      sayLemma: built.sayLemma,
      options,
      hintShown: false,
      wasCandidate: candidateSet.has(lemma),
      inputName: 'q-' + randomToken(),
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
  let typedText = '';
  let retryUsed = false;

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
    container.querySelectorAll('[data-action="quiz-check"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inputEl = container.querySelector('.quiz-input');
        session.check(inputEl ? inputEl.value : '');
      });
    });
    container.querySelectorAll('.quiz-input').forEach((input) => {
      input.addEventListener('keydown', (e) => {
        if (e && e.key === 'Enter') session.check(input.value);
      });
    });
  }

  function renderCurrent() {
    const q = session.questions[session.index];
    const html = renderQuizCard({
      lemma: q.lemma,
      item: q.item,
      kind: q.kind,
      answer: q.answer,
      promptHe: q.promptHe,
      sayLemma: q.sayLemma,
      inputName: q.inputName,
      options: q.options,
      index: session.index,
      total: session.questions.length,
      chosen,
      correct: correctFlag,
      demoted,
      hintShown: q.hintShown,
      wasCandidate: q.wasCandidate,
      typed: typedText,
      retry: retryUsed,
    });
    container.innerHTML = VIEW_STYLE + html;
    bind();

    const inputEl = container.querySelector('.quiz-input');
    if (inputEl && typeof inputEl.focus === 'function' && !inputEl.disabled) {
      inputEl.focus();
      if (typeof inputEl.setSelectionRange === 'function') {
        const len = typeof inputEl.value === 'string' ? inputEl.value.length : 0;
        inputEl.setSelectionRange(len, len);
      }
    }
  }

  session.answer = async function answer(option) {
    if (chosen !== null) return;
    const q = session.questions[session.index];
    const correct = option === q.answer;
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

  session.check = async function check(value) {
    if (chosen !== null) return;
    if (normalizeTyped(value) === '') return;
    const q = session.questions[session.index];
    typedText = value;
    const verdict = gradeTyped(value, q.answer, { isRetry: retryUsed });
    if (verdict === 'near-miss') {
      retryUsed = true;
      renderCurrent();
      return;
    }
    await session.answer(verdict === 'correct' ? q.answer : value);
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
    typedText = '';
    retryUsed = false;

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
