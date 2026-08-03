// VIEW_STYLE hygiene for public/quiz.js.
//
// A raw hex colour is INVISIBLE to this project's contrast gate, and color-mix()
// FABRICATES a pass (field guide 5). New CSS must use the existing custom
// properties only, so the gate can actually see it.
import { readFileSync } from 'node:fs';

const src = readFileSync('public/quiz.js', 'utf8');
const m = src.match(/const VIEW_STYLE = `([\s\S]*?)`;/);
if (!m) {
  console.error('VIEW_STYLE not found in public/quiz.js');
  process.exit(1);
}
const style = m[1];

const problems = [];
const hex = style.match(/#[0-9a-fA-F]{3,8}\b/g);
if (hex) problems.push(`raw hex colour(s): ${[...new Set(hex)].join(' ')}`);
if (style.includes('color-mix(')) problems.push('color-mix() is present');

const vars = [...new Set((style.match(/var\(--[a-z0-9-]+\)/g) || []))];

if (problems.length) {
  console.error('VIEW_STYLE HYGIENE FAILED:');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`VIEW_STYLE OK: ${style.length} chars, 0 raw hex, 0 color-mix, ${vars.length} custom properties used`);
process.exit(0);
