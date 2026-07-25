const CODE_KEY = "appCode";

function storedCode() {
  try {
    return localStorage.getItem(CODE_KEY) || "";
  } catch {
    return "";
  }
}

const ENTRY_TITLE = "כניסה למרפאת הקסמים";
const ENTRY_TEXT =
  "כדי לפתוח את האפליקציה צריך קוד כניסה קצר. הקוד נמצא אצל ההורים שלך — מקלידים אותו פעם אחת, והאפליקציה זוכרת אותו.";
const ENTRY_PLACEHOLDER = "קוד כניסה";
const ENTRY_SUBMIT = "כניסה";
const ENTRY_ERROR = "הקוד לא נכון. נסי שוב.";

let entryGate = null;

function askForCode(showError) {
  if (entryGate) return entryGate;

  entryGate = new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "entry-gate";
    overlay.innerHTML = `
      <form class="entry-gate-card">
        <h1 class="entry-gate-title">${ENTRY_TITLE}</h1>
        <p class="entry-gate-text">${ENTRY_TEXT}</p>
        <input
          class="entry-gate-input"
          type="text"
          dir="ltr"
          placeholder="${ENTRY_PLACEHOLDER}"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
        />
        <p class="entry-gate-error" role="alert">${showError ? ENTRY_ERROR : ""}</p>
        <button class="btn btn-primary" type="submit">${ENTRY_SUBMIT}</button>
      </form>
    `;
    document.body.appendChild(overlay);

    const form = overlay.querySelector("form");
    const input = overlay.querySelector(".entry-gate-input");
    input.focus();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const code = input.value.trim();
      if (!code) return;
      try {
        localStorage.setItem(CODE_KEY, code);
      } catch {
        /* private mode — the code just will not persist */
      }
      overlay.remove();
      entryGate = null;
      resolve(code);
    });
  });

  return entryGate;
}

async function handleResponse(response) {
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("תגובה לא תקינה מהשרת");
  }

  if (!payload || payload.ok !== true) {
    const message = (payload && payload.error) || "שגיאה בבקשה לשרת";
    throw new Error(message);
  }

  return payload.data;
}

async function request(path, init, retried = false) {
  let response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { ...init.headers, "x-app-code": storedCode() },
    });
  } catch {
    throw new Error("שגיאת רשת");
  }

  if (response.status === 401) {
    await askForCode(retried);
    return request(path, init, true);
  }

  return handleResponse(response);
}

export async function getJson(path) {
  return request(path, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
}

export async function postJson(path, body) {
  return request(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
}
