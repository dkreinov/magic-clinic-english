import { test } from "node:test";
import assert from "node:assert";
import { tokenize, baseForms, coverage } from "../lib/vocab.js";

const fixture = {
  words: {
    dog: { status: "known" },
    cat: { status: "known" },
    run: { status: "known" },
    big: { status: "known" },
    swim: { status: "learning" },
  },
};

test("tokenize lowercases and splits words", () => {
  assert.deepStrictEqual(tokenize("The dogs RUN!"), ["the", "dogs", "run"]);
});

test("baseForms produces expected stems", () => {
  assert.ok(baseForms("dogs").includes("dog"));
  assert.ok(baseForms("running").includes("run"));
  assert.ok(baseForms("bigger").includes("big"));
  assert.ok(Array.isArray(baseForms("ss")));
});

test("coverage counts fully known text", () => {
  const result = coverage("dogs run", fixture);
  assert.strictEqual(result.total, 2);
  assert.strictEqual(result.known, 2);
  assert.strictEqual(result.ratio, 1);
});

test("coverage excludes learning words from known count", () => {
  const result = coverage("dogs swim", fixture);
  assert.strictEqual(result.known, 1);
  assert.strictEqual(result.ratio, 0.5);
  assert.deepStrictEqual(result.unknown, ["swim"]);
});

test("coverage handles empty text", () => {
  const result = coverage("", fixture);
  assert.deepStrictEqual(result, { total: 0, known: 0, unknown: [], ratio: 0 });
});
