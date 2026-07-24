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

export async function getJson(path) {
  let response;
  try {
    response = await fetch(path, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("שגיאת רשת");
  }

  return handleResponse(response);
}

export async function postJson(path, body) {
  let response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("שגיאת רשת");
  }

  return handleResponse(response);
}
