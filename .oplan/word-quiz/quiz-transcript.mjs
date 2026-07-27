// QZ-21 as RE-DERIVED under D28/QZ-23 (6b.1) — WRITTEN BY THE ORCHESTRATOR BEFORE step 6b.2
// was dispatched, so the owner's gate does not rest on a command the implementer wrote.
// The pre-D28 pair lives in git history (committed at 494f78a and earlier).
// Expected output: quiz-transcript-expected.txt, derived BY HAND from QZ-23's frozen text-node
// order. Run: node .oplan/word-quiz/quiz-transcript.mjs
import { readFileSync } from "node:fs";
import { selectOptions } from "../../public/quiz-core.js";
import { renderQuizCard } from "../../public/quiz.js";

const items = JSON.parse(
  readFileSync(new URL("../../public/quiz/light.json", import.meta.url), "utf8")
);
const item = items[1]; // the lamp sense

// Frozen: empty knownSet, rand = () => 0.
const options = selectOptions(item, new Set(), () => 0);

// Frozen projection: strip tags, trim, drop empties.
const project = (html) =>
  html
    .replace(/<[^>]*>/g, "\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");

const base = {
  lemma: "light",
  item,
  options,
  index: 0,
  total: 4,
  chosen: null,
  correct: null,
  demoted: false,
  hintShown: false,
};

const screens = [
  ["=== SCREEN 1: the question as she first sees it — the meaning is hidden ===", base],
  ["=== SCREEN 2: she pressed רמז — the meaning appears ===", { ...base, hintShown: true }],
  [
    '=== SCREEN 3: she chose "radio" — wrong; the meaning is revealed with the answer ===',
    { ...base, chosen: "radio", correct: false },
  ],
  [
    "=== SCREEN 4: the third strike — the word is taken back, and she is told ===",
    { ...base, chosen: "radio", correct: false, demoted: true },
  ],
];

for (const [title, state] of screens) {
  console.log(title);
  console.log(project(renderQuizCard(state)));
}
