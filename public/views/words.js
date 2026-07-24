export function render(container) {
  container.innerHTML = `
    <header class="app-header">
      <p class="greeting">האוסף שלי</p>
      <h1 class="app-title">המילים שלי</h1>
    </header>

    <div class="empty-state">
      <div class="illustration" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="4" width="14" height="16" rx="2" fill="currentColor" fill-opacity="0.55" />
          <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5" stroke="#faf7f2" stroke-width="1.4" stroke-linecap="round" />
        </svg>
      </div>
      <p class="empty-state-title">עוד אין מילים באוסף</p>
      <p class="empty-state-text">מילים שתלחצי עליהן בזמן הקריאה ייאספו לכאן, כדי שתוכלי לחזור אליהן בכל זמן.</p>
    </div>
  `;
}
