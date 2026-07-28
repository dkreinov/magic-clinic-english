// PHASE 2 / B6(iii) -- the candidate-demotion transcript. WRITTEN BY THE ORCHESTRATOR BEFORE
// step 2.4 was dispatched, so the gate does not rest on output produced by the code it gates
// (QZ-21's rule; field guide 2). The expected file is derived BY HAND from QZ-18/QZ-23's frozen
// text-node order plus QZ-25's single amendment.
// Run: node .oplan/word-g1/g1-transcript.mjs
import { readFileSync } from "node:fs";
import { selectOptions } from "../../public/quiz-core.js";
import { renderQuizCard } from "../../public/quiz.js";

const items = JSON.parse(
  readFileSync(new URL("../../public/quiz/light.json", import.meta.url), "utf8")
);
const item = items[1]; // the lamp sense -- the same real bank item QZ-21 uses

// Frozen, exactly as QZ-21: empty knownSet, rand = () => 0, so the Fisher-Yates rotation is
// radio, television, oven, fan, camera, light -- derivable by hand, which is the point.
const options = selectOptions(item, new Set(), () => 0);

// Frozen projection, byte-identical to QZ-21's.
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
  wasCandidate: true,
};

const screens = [
  ["=== SCREEN 1: a CANDIDATE question as she first sees it — nothing marks it out ===", base],
  [
    '=== SCREEN 2: she chose "radio" — wrong; one wrong answer is enough for a candidate ===',
    { ...base, chosen: "radio", correct: false, demoted: true },
  ],
  [
    '=== SCREEN 3: CONTROL — the same wrong answer on a word SHE claimed ===',
    { ...base, chosen: "radio", correct: false, demoted: true, wasCandidate: false },
  ],
];

for (const [title, state] of screens) {
  console.log(title);
  console.log(project(renderQuizCard(state)));
}
