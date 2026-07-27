// QZ-21 — the criterion-11 transcript. WRITTEN BY THE ORCHESTRATOR BEFORE STEP 4.2 WAS DISPATCHED
// (plan.md, QZ-21), so the owner's gate does not rest on a command the implementer wrote.
// The expected output lives beside this file in quiz-transcript-expected.txt, derived BY HAND from
// QZ-18's frozen text-node order. Run: node .oplan/word-quiz/quiz-transcript.mjs
import { readFileSync } from "node:fs";
import { selectOptions } from "../../public/quiz-core.js";
import { renderQuizCard } from "../../public/quiz.js";

const items = JSON.parse(
  readFileSync(new URL("../../public/quiz/light.json", import.meta.url), "utf8")
);
const item = items[1]; // the lamp sense

// Frozen in QZ-21: empty knownSet, rand = () => 0.
const options = selectOptions(item, new Set(), () => 0);

// Frozen projection (QZ-21): strip tags, trim, drop empties.
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
};

const screens = [
  ["=== SCREEN 1: the question as she first sees it ===", base],
  ['=== SCREEN 2: she chose "radio" — wrong ===', { ...base, chosen: "radio", correct: false }],
  [
    "=== SCREEN 3: the third strike — the word is taken back, and she is told ===",
    { ...base, chosen: "radio", correct: false, demoted: true },
  ],
];

for (const [title, state] of screens) {
  console.log(title);
  console.log(project(renderQuizCard(state)));
}
