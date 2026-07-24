// Server-only OpenAI chat wrapper with an injectable transport.
// The transport seam lets tests stub network calls entirely.

export const CHAT_MODEL = "gpt-4.1-mini";
export const CHAT_URL = "https://api.openai.com/v1/chat/completions";

async function defaultTransport(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI response missing message content");
  }

  return JSON.parse(content);
}

let _transport = defaultTransport;

export function setTransport(fn) {
  _transport = fn;
}

export function resetTransport() {
  _transport = defaultTransport;
}

export async function chatJSON({ system, user, temperature = 0.7 }) {
  return _transport({
    model: CHAT_MODEL,
    temperature,
    response_format: { type: "json_object" },
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: user },
    ],
  });
}
