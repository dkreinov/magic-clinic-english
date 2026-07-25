const CODE_KEY = "appCode";

function storedCode() {
  try {
    return localStorage.getItem(CODE_KEY) || "";
  } catch {
    return "";
  }
}

function askForCode() {
  const entered = window.prompt("קוד כניסה");
  const code = entered ? entered.trim() : "";
  if (code) {
    try {
      localStorage.setItem(CODE_KEY, code);
    } catch {
      /* private mode — the code just will not persist */
    }
  }
  return code;
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

async function request(path, init, allowRetry = true) {
  let response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { ...init.headers, "x-app-code": storedCode() },
    });
  } catch {
    throw new Error("שגיאת רשת");
  }

  if (response.status === 401 && allowRetry) {
    askForCode();
    return request(path, init, false);
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
