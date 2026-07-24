import { test } from "node:test";
import assert from "node:assert";
import {
  chatJSON,
  setTransport,
  resetTransport,
  CHAT_MODEL,
} from "../lib/openai.js";

test("chatJSON sends expected payload with system message and custom temperature", async () => {
  let received;
  setTransport(async (payload) => {
    received = payload;
    return { ok: 1 };
  });

  try {
    const result = await chatJSON({ system: "s", user: "u", temperature: 0.2 });
    assert.deepStrictEqual(result, { ok: 1 });
    assert.strictEqual(received.model, CHAT_MODEL);
    assert.strictEqual(received.temperature, 0.2);
    assert.deepStrictEqual(received.response_format, { type: "json_object" });
    assert.deepStrictEqual(received.messages, [
      { role: "system", content: "s" },
      { role: "user", content: "u" },
    ]);
  } finally {
    resetTransport();
  }
});

test("chatJSON omits system message when not provided and defaults temperature", async () => {
  let received;
  setTransport(async (payload) => {
    received = payload;
    return { ok: 2 };
  });

  try {
    const result = await chatJSON({ user: "only user" });
    assert.deepStrictEqual(result, { ok: 2 });
    assert.strictEqual(received.temperature, 0.7);
    assert.deepStrictEqual(received.messages, [
      { role: "user", content: "only user" },
    ]);
  } finally {
    resetTransport();
  }
});

test("chatJSON default transport throws before any network call when API key missing", async () => {
  const hadKey = Object.prototype.hasOwnProperty.call(
    process.env,
    "OPENAI_API_KEY"
  );
  const savedKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    resetTransport();
    await assert.rejects(chatJSON({ user: "x" }), /OPENAI_API_KEY not set/);
  } finally {
    if (hadKey) {
      process.env.OPENAI_API_KEY = savedKey;
    }
    resetTransport();
  }
});
