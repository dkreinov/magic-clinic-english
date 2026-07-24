import { getJson, postJson } from "../api.js";

const VIEW_STYLE = `
  .placement-progress {
    font-size: 0.9rem;
    color: var(--color-muted);
    font-weight: 600;
    margin-bottom: 10px;
  }

  .placement-instruction {
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 18px;
  }

  .placement-play-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 64px;
    margin-bottom: 20px;
    border-radius: var(--radius);
    border: none;
    background: var(--color-teal);
    color: var(--color-primary-ink);
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: var(--shadow-soft);
    transition: transform var(--transition-fast);
  }

  .placement-play-btn:active {
    transform: scale(0.97);
  }

  .placement-emoji-big {
    font-size: 72px;
    text-align: center;
    margin-bottom: 20px;
    line-height: 1;
  }

  .placement-option-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .placement-option-grid.words {
    grid-template-columns: 1fr 1fr;
  }

  .placement-option-btn {
    min-height: 76px;
    border-radius: var(--radius);
    border: 2px solid var(--color-border);
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    color: var(--color-ink);
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform var(--transition-fast), border-color var(--transition-fast);
    padding: 8px;
  }

  .placement-option-btn:active {
    transform: scale(0.96);
  }

  .placement-option-btn.word {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-ink);
  }

  .placement-option-btn.selected {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 14%, var(--color-card));
  }

  .placement-text-card {
    margin-bottom: 18px;
  }

  .placement-text-title {
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .placement-text-body {
    font-size: 1.05rem;
    line-height: 1.7;
    text-align: left;
  }

  .placement-question {
    margin-bottom: 22px;
  }

  .placement-question-prompt {
    font-weight: 700;
    margin-bottom: 10px;
  }

  .placement-question-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .placement-question-option {
    min-height: 48px;
    border-radius: var(--radius);
    border: 2px solid var(--color-border);
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    color: var(--color-ink);
    font-size: 0.98rem;
    font-weight: 600;
    padding: 10px 16px;
    text-align: right;
    cursor: pointer;
    transition: transform var(--transition-fast), border-color var(--transition-fast);
  }

  .placement-question-option:active {
    transform: scale(0.98);
  }

  .placement-question-option.selected {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 14%, var(--color-card));
  }

  .placement-actions {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .placement-secondary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0 24px;
    border-radius: var(--radius);
    border: none;
    background: none;
    color: var(--color-muted);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
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

async function loadState() {
  const [bank, profile] = await Promise.all([getJson("/api/placement"), getJson("/api/profile")]);
  return { bank, profile };
}

function resumeStage(profile) {
  const placement = profile && profile.placement ? profile.placement : null;
  if (!placement) return "intro";
  if (placement.task1 && placement.task2) return "done";
  if (placement.task1 && !placement.task2) return "task2";
  return "intro";
}

export async function render(container, ctx) {
  let bank = null;
  let stage = "intro";
  let task2Index = 0;
  const answers = { task1: [], task2: {} };

  async function boot() {
    container.innerHTML = renderLoading();
    try {
      const { bank: loadedBank, profile } = await loadState();
      bank = loadedBank;
      stage = resumeStage(profile);
      draw();
    } catch (err) {
      showError();
    }
  }

  function showError() {
    stage = "error";
    draw();
  }

  function renderLoading() {
    return `${styleTag()}${header("מבחן היכרות", "רגע...")}<p class="card-subtitle">טוען...</p>`;
  }

  function renderIntro() {
    return `
      ${styleTag()}
      ${header("מבחן היכרות", "בואי נכיר")}
      <img class="spot-image" src="/assets/placement-friend.webp" alt="" />
      <p class="card-subtitle" style="margin-bottom: 16px;">
        יש שתי משימות קצרות, כל אחת לוקחת רק כמה דקות. אפשר לעצור ולנוח בין המשימות.
      </p>
      <ol class="intro-steps">
        <li class="intro-step">
          <span class="intro-step-number">1</span>
          <span class="intro-step-text">
            <strong>היכרות עם מילים</strong>
            <span>כמה דקות קצרות</span>
          </span>
        </li>
        <li class="intro-step">
          <span class="intro-step-number">2</span>
          <span class="intro-step-text">
            <strong>היכרות עם קריאה</strong>
            <span>כמה דקות קצרות</span>
          </span>
        </li>
      </ol>
      <button class="btn btn-primary" type="button" data-action="start">מתחילים</button>
    `;
  }

  function renderTask1Item() {
    const items = bank.task1;
    const index = answers.task1.length;
    const item = items[index];
    const total = items.length;
    const progress = `שאלה ${index + 1} מתוך ${total}`;

    if (item.direction === "audio-to-picture") {
      const options = item.options
        .map(
          (emoji, i) =>
            `<button class="placement-option-btn" type="button" data-action="task1-answer" data-choice="${i}">${emoji}</button>`
        )
        .join("");
      return `
        ${styleTag()}
        ${header("מבחן היכרות", "משימה 1")}
        <p class="placement-progress">${progress}</p>
        <p class="placement-instruction">הקשיבי ובחרי את התמונה הנכונה</p>
        <button class="placement-play-btn" type="button" data-action="play-audio" data-src="${item.audio}">▶ השמעה</button>
        <div class="placement-option-grid">${options}</div>
      `;
    }

    const options = item.options
      .map(
        (word, i) =>
          `<button class="placement-option-btn word" type="button" dir="ltr" data-action="task1-answer" data-choice="${i}">${word}</button>`
      )
      .join("");
    return `
      ${styleTag()}
      ${header("מבחן היכרות", "משימה 1")}
      <p class="placement-progress">${progress}</p>
      <p class="placement-instruction">הביטי בתמונה ובחרי את המילה</p>
      <div class="placement-emoji-big">${item.emoji}</div>
      <div class="placement-option-grid words">${options}</div>
    `;
  }

  function renderTask1Done() {
    return `
      ${styleTag()}
      ${header("מבחן היכרות", "כל הכבוד!")}
      <img class="celebrate-image" src="/assets/celebration.webp" alt="" />
      <p class="card-subtitle" style="margin-bottom: 6px;">כל הכבוד! סיימת את המשימה הראשונה.</p>
      <p class="card-subtitle" style="margin-bottom: 20px;">אפשר לנוח רגע.</p>
      <div class="placement-actions">
        <button class="btn btn-primary" type="button" data-action="go-task2">ממשיכים למשימה 2</button>
        <button class="placement-secondary-btn" type="button" data-action="pause">אמשיך אחר כך</button>
      </div>
    `;
  }

  function currentTask2Text() {
    return bank.task2[task2Index] ?? null;
  }

  function renderTask2() {
    const text = currentTask2Text();
    if (!text) return renderError();
    const questionsHtml = text.questions
      .map((question) => {
        const selected = answers.task2[question.id];
        const optionsHtml = question.options
          .map((opt, i) => {
            const isSelected = selected === i;
            return `<button class="placement-question-option${isSelected ? " selected" : ""}" type="button" data-action="task2-answer" data-question="${question.id}" data-choice="${i}">${opt}</button>`;
          })
          .join("");
        return `
          <div class="placement-question">
            <p class="placement-question-prompt">${question.prompt}</p>
            <div class="placement-question-options">${optionsHtml}</div>
          </div>
        `;
      })
      .join("");

    const allAnswered = text.questions.every((q) => answers.task2[q.id] !== undefined);

    return `
      ${styleTag()}
      ${header("מבחן היכרות", "משימה 2")}
      <div class="card placement-text-card">
        <p class="placement-text-title">${text.title}</p>
        <div class="placement-text-body" dir="ltr">${text.text}</div>
      </div>
      <p class="placement-instruction">קראי את הטקסט ועני על השאלות</p>
      ${questionsHtml}
      <button class="btn btn-primary" type="button" data-action="task2-submit" ${allAnswered ? "" : "disabled"}>ממשיכים</button>
    `;
  }

  function renderDone() {
    return `
      ${styleTag()}
      ${header("מבחן היכרות", "סיימת!")}
      <img class="celebrate-image" src="/assets/celebration.webp" alt="" />
      <p class="card-subtitle" style="margin-bottom: 6px;">סיימת את המבחן!</p>
      <p class="card-subtitle" style="margin-bottom: 20px;">עכשיו הסיפור יתאים בדיוק לך.</p>
      <button class="btn btn-primary" type="button" data-action="go-reader">לסיפור</button>
    `;
  }

  function renderError() {
    return `
      ${styleTag()}
      ${header("מבחן היכרות", "אופס")}
      <p class="card-subtitle" style="margin-bottom: 16px;">משהו השתבש, נסי שוב.</p>
      <button class="btn btn-primary" type="button" data-action="retry">נסי שוב</button>
    `;
  }

  function draw() {
    let html;
    if (stage === "intro") html = renderIntro();
    else if (stage === "task1") html = renderTask1Item();
    else if (stage === "task1done") html = renderTask1Done();
    else if (stage === "task2") html = renderTask2();
    else if (stage === "done") html = renderDone();
    else html = renderError();

    container.innerHTML = html;
    bindEvents();
  }

  function bindEvents() {
    const startBtn = container.querySelector('[data-action="start"]');
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        stage = "task1";
        draw();
      });
    }

    const playBtn = container.querySelector('[data-action="play-audio"]');
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        const src = playBtn.getAttribute("data-src");
        new Audio(src).play();
      });
    }

    container.querySelectorAll('[data-action="task1-answer"]').forEach((btn) => {
      btn.addEventListener("click", async () => {
        const item = bank.task1[answers.task1.length];
        const choice = Number(btn.getAttribute("data-choice"));
        answers.task1.push({ id: item.id, choice });

        if (answers.task1.length >= bank.task1.length) {
          try {
            await postJson("/api/placement", { action: "submit", task1: answers.task1 });
            stage = "task1done";
          } catch (err) {
            showError();
            return;
          }
        }
        draw();
      });
    });

    const goTask2Btn = container.querySelector('[data-action="go-task2"]');
    if (goTask2Btn) {
      goTask2Btn.addEventListener("click", () => {
        stage = "task2";
        draw();
      });
    }

    const pauseBtn = container.querySelector('[data-action="pause"]');
    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        location.hash = "#/home";
      });
    }

    container.querySelectorAll('[data-action="task2-answer"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const questionId = btn.getAttribute("data-question");
        const choice = Number(btn.getAttribute("data-choice"));
        answers.task2[questionId] = choice;
        draw();
      });
    });

    const task2SubmitBtn = container.querySelector('[data-action="task2-submit"]');
    if (task2SubmitBtn) {
      task2SubmitBtn.addEventListener("click", async () => {
        const isLastText = task2Index >= bank.task2.length - 1;

        if (!isLastText) {
          task2Index += 1;
          draw();
          return;
        }

        const allAnswers = bank.task2.flatMap((t) =>
          t.questions.map((q) => ({ id: q.id, choice: answers.task2[q.id] }))
        );
        try {
          await postJson("/api/placement", { action: "submit", task2: allAnswers });
          stage = "done";
          draw();
        } catch (err) {
          showError();
        }
      });
    }

    const goReaderBtn = container.querySelector('[data-action="go-reader"]');
    if (goReaderBtn) {
      goReaderBtn.addEventListener("click", () => {
        location.hash = "#/reader";
      });
    }

    const retryBtn = container.querySelector('[data-action="retry"]');
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        boot();
      });
    }
  }

  await boot();
}
