import { getJson } from "../api.js";

const VIEW_STYLE = `
  .words-count {
    font-size: 0.95rem;
    color: var(--color-muted);
    font-weight: 600;
    margin-bottom: 16px;
  }

  .words-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .word-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: var(--color-card);
    border-radius: var(--radius);
    box-shadow: var(--shadow-soft);
    padding: 14px 16px;
  }

  .word-card-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .word-card-lemma {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .word-card-he {
    color: var(--color-muted);
    font-size: 0.95rem;
  }

  .word-badge {
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

  .word-badge.known {
    background: color-mix(in srgb, var(--color-teal) 15%, white);
    color: var(--color-teal);
  }

  .word-badge.learning {
    background: color-mix(in srgb, var(--color-accent) 20%, white);
    color: color-mix(in srgb, var(--color-accent) 70%, black);
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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderEmpty() {
  return `
    ${styleTag()}
    ${header("האוסף שלי", "המילים שלי")}
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

function statusBadge(status) {
  if (status === "known") {
    return `<span class="word-badge known">יודעת</span>`;
  }
  return `<span class="word-badge learning">לומדת</span>`;
}

function renderList(words) {
  const entries = Object.entries(words).sort((a, b) => {
    const aTime = Date.parse(a[1].lastSeen) || 0;
    const bTime = Date.parse(b[1].lastSeen) || 0;
    return bTime - aTime;
  });

  const cardsHtml = entries
    .map(([lemma, entry]) => {
      const he = entry.he ? escapeHtml(entry.he) : "—";
      return `
        <div class="word-card">
          <div class="word-card-text">
            <span class="word-card-lemma" dir="ltr">${escapeHtml(lemma)}</span>
            <span class="word-card-he">${he}</span>
          </div>
          ${statusBadge(entry.status)}
        </div>
      `;
    })
    .join("");

  return `
    ${styleTag()}
    ${header("האוסף שלי", "המילים שלי")}
    <p class="words-count">${entries.length} מילים באוסף</p>
    <div class="words-grid">${cardsHtml}</div>
  `;
}

export async function render(container, ctx) {
  container.innerHTML = `${styleTag()}${header("האוסף שלי", "המילים שלי")}<p class="card-subtitle">טוען...</p>`;

  let profile;
  try {
    profile = await getJson("/api/profile");
  } catch (err) {
    container.innerHTML = `
      ${styleTag()}
      ${header("האוסף שלי", "המילים שלי")}
      <p class="card-subtitle">משהו השתבש, נסי שוב.</p>
    `;
    return;
  }

  const words = profile.words || {};
  if (Object.keys(words).length === 0) {
    container.innerHTML = renderEmpty();
    return;
  }

  container.innerHTML = renderList(words);
}
