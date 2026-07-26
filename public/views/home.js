const LONG_PRESS_MS = 1500;
const MOVE_TOLERANCE = 10;

function bindOwnerGesture(container) {
  const title = container.querySelector(".app-title");
  if (!title) return;
  title.style.userSelect = "none";
  title.style.webkitUserSelect = "none";

  let timer = null;
  let pressing = false;
  let startX = 0;
  let startY = 0;

  const cancel = () => {
    pressing = false;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  title.addEventListener("pointerdown", (event) => {
    pressing = true;
    startX = event.clientX;
    startY = event.clientY;
    timer = setTimeout(() => {
      timer = null;
      pressing = false;
      location.hash = "#/parent";
    }, LONG_PRESS_MS);
  });

  title.addEventListener("pointermove", (event) => {
    if (!pressing) return;
    if (
      Math.abs(event.clientX - startX) > MOVE_TOLERANCE ||
      Math.abs(event.clientY - startY) > MOVE_TOLERANCE
    ) {
      cancel();
    }
  });

  title.addEventListener("pointerup", cancel);
  title.addEventListener("pointercancel", cancel);
  title.addEventListener("pointerleave", cancel);
  title.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
}

export function render(container) {
  container.innerHTML = `
    <img class="hero-banner" src="/assets/hero-clinic.webp" alt="" />

    <header class="app-header">
      <p class="greeting">שלום!</p>
      <h1 class="app-title">מרפאת הקסמים</h1>
    </header>

    <img class="spot-image" src="/assets/heroine.webp" alt="" />

    <section class="card" data-testid="placement-card">
      <div class="card-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 11.5 11 13.5 15.5 9"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="12" r="8.2" stroke="currentColor" stroke-width="1.8" />
        </svg>
      </div>
      <h2 class="card-title">מבחן היכרות</h2>
      <p class="card-subtitle">כדי שהסיפור יתאים בדיוק לך</p>
      <a class="btn btn-primary" href="#/placement">בואי נתחיל</a>
    </section>

    <section class="card card--locked" data-testid="reader-card">
      <div class="card-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="10" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.8" />
          <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </div>
      <h2 class="card-title">הסיפור</h2>
      <p class="lock-note">קודם נכיר אותך קצת</p>
    </section>
  `;
  bindOwnerGesture(container);
}
