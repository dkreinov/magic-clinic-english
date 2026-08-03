// Re-renders the cloze-pick card in FIVE states and compares byte-for-byte with
// the fixture frozen BEFORE step 2.3 ran.
//
// WHY THIS AND NOT A LINE CHECK. Step 2.3 legitimately restructures
// renderQuizCard to branch on `kind`, so "no pre-existing line changed" is the
// WRONG pin -- it names a spelling, not a property (field guide 22). The property
// design criterion 6 actually asserts is: "Nothing about today's tapped question
// changes -- same text-node order, same scoring." This measures exactly that, at
// the byte, in the child's own terms.
//
// The fixture was captured once and is NEVER edited. A red diff means the CODE
// changed, which is the point (field guide 2: derive the expected output first,
// commit it once, and let a red diff accuse the code).
import { readFileSync } from 'node:fs';
import { renderQuizCard } from '../../public/quiz.js';

const FIXTURE = '.oplan/word-write/cloze-card-frozen.txt';
const items = JSON.parse(readFileSync('public/quiz/light.json', 'utf8'));
const item = items[0];
const OPTIONS = ['light', 'big', 'small', 'wide', 'round', 'old'];

const states = [
  { label: 'unanswered', s: { item, options: OPTIONS, index: 0, total: 4, chosen: null, correct: null, demoted: false, hintShown: false, wasCandidate: false } },
  { label: 'hint shown', s: { item, options: OPTIONS, index: 1, total: 4, chosen: null, correct: null, demoted: false, hintShown: true, wasCandidate: false } },
  { label: 'answered right', s: { item, options: OPTIONS, index: 2, total: 4, chosen: 'light', correct: true, demoted: false, hintShown: false, wasCandidate: false } },
  { label: 'answered wrong', s: { item, options: OPTIONS, index: 3, total: 4, chosen: 'big', correct: false, demoted: true, hintShown: false, wasCandidate: false } },
  { label: 'wrong candidate', s: { item, options: OPTIONS, index: 3, total: 4, chosen: 'big', correct: false, demoted: true, hintShown: false, wasCandidate: true } },
];

let out = '';
for (const { label, s } of states) out += '=== ' + label + ' ===\n' + renderQuizCard(s) + '\n';

const want = readFileSync(FIXTURE, 'utf8');

if (out === want) {
  console.log(`FROZEN CARD OK: ${states.length} states, ${out.length} chars, byte-identical`);
  process.exit(0);
}

console.error('FROZEN CARD CHANGED -- today\'s tapped question is not what it was.');
const a = out.split('\n');
const b = want.split('\n');
for (let i = 0; i < Math.max(a.length, b.length); i++) {
  if (a[i] !== b[i]) {
    console.error(`  first difference at line ${i + 1}`);
    console.error(`    now  : ${JSON.stringify((a[i] ?? '').slice(0, 120))}`);
    console.error(`    was  : ${JSON.stringify((b[i] ?? '').slice(0, 120))}`);
    break;
  }
}
console.error(`  lengths: now ${out.length} chars / was ${want.length} chars`);
process.exit(1);
