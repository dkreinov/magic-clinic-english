export function render(container) {
  container.innerHTML = `
    <header class="app-header">
      <p class="greeting">מבחן היכרות</p>
      <h1 class="app-title">בואי נכיר</h1>
    </header>

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

    <button class="btn btn-primary" type="button" disabled>בקרוב</button>
    <p class="intro-note">המבחן עדיין לא זמין</p>
  `;
}
