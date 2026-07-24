export function render(container) {
  container.innerHTML = `
    <header class="app-header">
      <p class="greeting">הסיפור</p>
      <h1 class="app-title">מרפאת הקסמים</h1>
    </header>

    <div class="empty-state">
      <div class="illustration" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 3.5c-.9 0-1.6.7-1.6 1.6 0 .5.2.9.5 1.2-1 .3-1.7 1.2-1.7 2.3 0 .3 0 .5.1.8-1.4.2-2.4 1.4-2.4 2.9 0 1.6 1.3 2.9 2.9 2.9h4.4c1.6 0 2.9-1.3 2.9-2.9 0-1.5-1-2.7-2.4-2.9.1-.3.1-.5.1-.8 0-1.1-.7-2-1.7-2.3.3-.3.5-.7.5-1.2 0-.9-.7-1.6-1.6-1.6Z"
            fill="currentColor"
            fill-opacity="0.55"
          />
          <ellipse cx="9" cy="17.5" rx="1.1" ry="1.5" fill="currentColor" fill-opacity="0.55" />
          <ellipse cx="15" cy="17.5" rx="1.1" ry="1.5" fill="currentColor" fill-opacity="0.55" />
          <ellipse cx="7.3" cy="20.3" rx="1" ry="1.3" fill="currentColor" fill-opacity="0.55" />
          <ellipse cx="16.7" cy="20.3" rx="1" ry="1.3" fill="currentColor" fill-opacity="0.55" />
        </svg>
      </div>
      <p class="empty-state-title">הסיפור עוד לא התחיל…</p>
      <p class="empty-state-text">כשתסיימי את מבחן ההיכרות, הסיפור שלך יחכה כאן.</p>
    </div>
  `;
}
