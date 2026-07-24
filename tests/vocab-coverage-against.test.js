import { test } from "node:test";
import assert from "node:assert";
import { coverageAgainst } from "../lib/vocab.js";

test("coverageAgainst counts fully known text", () => {
  const result = coverageAgainst("dogs run", new Set(["dog", "run"]));
  assert.strictEqual(result.total, 2);
  assert.strictEqual(result.known, 2);
  assert.strictEqual(result.ratio, 1);
});

test("coverageAgainst reports unknown tokens sorted", () => {
  const result = coverageAgainst("dogs swim fly", new Set(["dog"]));
  assert.strictEqual(result.known, 1);
  assert.deepStrictEqual(result.unknown, ["fly", "swim"]);
  assert.strictEqual(result.ratio, 1 / 3);
});

test("coverageAgainst handles empty text", () => {
  const result = coverageAgainst("", new Set());
  assert.deepStrictEqual(result, { total: 0, known: 0, unknown: [], ratio: 0 });
});
