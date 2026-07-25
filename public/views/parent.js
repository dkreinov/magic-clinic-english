import { getJson } from "../api.js";

const RETAKE_KEY = "retakePlacement";

const VIEW_STYLE = `
  .parent-band {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-teal);
    margin-bottom: 6px;
  }

  .parent-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 0;
  }

  .parent-row + .parent-row {
    border-top: 1px solid var(--color-border);
  }

  .parent-label {
    color: var(--color-muted);
    font-size: 0.95rem;
  }

  .parent-value {
    font-weight: 700;
    font-size: 1.05rem;
  }

  .parent-note {
    color: var(--color-muted);
    font-size: 0.85rem;
    line-height: 1.6;
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

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function bandSubtitle(band) {
  if (band === "preA1") {
    return "preA1 — הסיפורים נבנים מ-296 מילים.";
  }
  if (band === "A1") {
    return "A1 — הסיפורים נבנים מ-1257 מילים.";
  }
  if (band === "A2") {
    return "A2 — הסיפורים נבנים מ-2850 מילים.";
  }
  return "היא עוד לא עשתה את מבחן המיון.";
}

function taskValue(task) {
  if (task && typeof task.correct === "number" && typeof task.total === "number") {
    return `${task.correct} מתוך ${task.total}`;
  }
  return "טרם נעשתה";
}

function placementDate(placement) {
  if (placement && placement.completedAt) {
    return formatDate(placement.completedAt);
  }
  if (placement && placement.task1 && placement.task1.answeredAt) {
    return formatDate(placement.task1.answeredAt);
  }
  return "—";
}

function renderProfile(profile) {
  const band =
    (profile.skills && profile.skills.receptiveVocab && profile.skills.receptiveVocab.band) ||
    null;
  const bandLabel = band || "טרם נקבעה";
  const placement = profile.placement || {};
  const wordCount = Object.keys(profile.words || {}).length;

  return `
    ${styleTag()}
    ${header("תצוגת הורים", "מה האפליקציה יודעת עליה")}

    <section class="card">
      <h2 class="card-title">רמת אוצר המילים</h2>
      <p class="parent-band">${bandLabel}</p>
      <p class="card-subtitle">${bandSubtitle(band)}</p>
    </section>

    <section class="card">
      <h2 class="card-title">מבחן המיון</h2>
      <div class="parent-row">
        <span class="parent-label">משימה 1 — מילים ותמונות</span>
        <span class="parent-value">${taskValue(placement.task1)}</span>
      </div>
      <div class="parent-row">
        <span class="parent-label">משימה 2 — הבנת הנקרא</span>
        <span class="parent-value">${taskValue(placement.task2)}</span>
      </div>
      <div class="parent-row">
        <span class="parent-label">נעשה בתאריך</span>
        <span class="parent-value">${placementDate(placement)}</span>
      </div>
    </section>

    <section class="card">
      <h2 class="card-title">אוצר המילים שלה</h2>
      <div class="parent-row">
        <span class="parent-label">מילים באוסף</span>
        <span class="parent-value">${wordCount}</span>
      </div>
    </section>

    <section class="card">
      <h2 class="card-title">התוצאה לא נראית נכונה?</h2>
      <p class="card-subtitle">הרמה נקבעת לפי 12 שאלות בלבד, ושש מהן שאלות שמיעה — שתי טעויות יכולות להוריד אותה רמה שלמה. אפשר לעשות את המבחן מחדש, והתוצאה החדשה תחליף את הקודמת.</p>
      <button class="btn btn-primary" type="button" data-action="retake">מבחן מיון מחדש</button>
    </section>

    <p class="parent-note">תצוגה זו נועדה להורה בלבד ואינה מופיעה בתפריט של האפליקציה.</p>
  `;
}

function bindRetake(container) {
  const button = container.querySelector('[data-action="retake"]');
  if (!button) {
    return;
  }
  button.addEventListener("click", () => {
    try {
      sessionStorage.setItem(RETAKE_KEY, "1");
    } catch {
      /* private mode — the re-take flag just will not persist */
    }
    location.hash = "#/placement";
  });
}

export async function render(container, ctx) {
  container.innerHTML = `${styleTag()}${header("תצוגת הורים", "מה האפליקציה יודעת עליה")}<p class="card-subtitle">טוען...</p>`;

  let profile;
  try {
    profile = await getJson("/api/profile");
  } catch (err) {
    container.innerHTML = `
      ${styleTag()}
      ${header("תצוגת הורים", "מה האפליקציה יודעת עליה")}
      <p class="card-subtitle">משהו השתבש, נסי שוב.</p>
    `;
    return;
  }

  container.innerHTML = renderProfile(profile);
  bindRetake(container);
}
