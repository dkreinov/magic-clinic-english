#!/usr/bin/env node
// GENERATED-BY script (this file itself is hand-written) that writes
// public/quiz-strings.js from the frozen hebrew-strings block in
// .oplan/word-write/design.md.
//
// Nobody types Hebrew (field guide 8 / 34). This script reads the glyphs
// from the design file, escapes every non-ASCII character as \uXXXX built
// programmatically from its code point, and never prints a Hebrew glyph to
// stdout -- only counts and code points, if anything.
//
// Safety catch (WK-6): refuses to write unless the block body's md5 and
// UTF-8 byte length exactly match the pinned values below. That is what
// stops a silent reword of her prompts.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECT_MD5 = 'ad6885fa6c4cc47751051b8f3fb9c9ea';
const EXPECT_LEN = 225;
const EXPECTED_KEYS = [
  'he_pick_prompt',
  'he_type_prompt',
  'listen_type_prompt',
  'near_miss',
  'check_button',
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const designPath = path.join(root, '.oplan', 'word-write', 'design.md');
const outPath = path.join(root, 'public', 'quiz-strings.js');

const src = readFileSync(designPath, 'utf8');
const m = src.match(/```hebrew-strings\r?\n([\s\S]*?)```/);
if (!m) {
  console.error('extract-quiz-strings: could not find a ```hebrew-strings fenced block in ' + designPath);
  process.exit(1);
}

const bodyText = m[1];
const bodyBuf = Buffer.from(bodyText, 'utf8');
const md5 = createHash('md5').update(bodyBuf).digest('hex');
const len = bodyBuf.length;

if (md5 !== EXPECT_MD5 || len !== EXPECT_LEN) {
  console.error('extract-quiz-strings: REFUSING TO WRITE -- hebrew-strings block does not match its pin.');
  console.error(`  computed md5=${md5} expected=${EXPECT_MD5}`);
  console.error(`  computed byteLength=${len} expected=${EXPECT_LEN}`);
  process.exit(1);
}

// Parse: five lines, each key=value, split on the FIRST '=' only.
const lines = bodyText.split(/\r?\n/).filter((l) => l.length > 0);
if (lines.length !== EXPECTED_KEYS.length) {
  console.error(`extract-quiz-strings: expected ${EXPECTED_KEYS.length} lines, found ${lines.length}`);
  process.exit(1);
}

const values = {};
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const eq = line.indexOf('=');
  if (eq < 0) {
    console.error(`extract-quiz-strings: line ${i + 1} has no '=' separator`);
    process.exit(1);
  }
  const key = line.slice(0, eq);
  const value = line.slice(eq + 1);
  const expectedKey = EXPECTED_KEYS[i];
  if (key !== expectedKey) {
    console.error(`extract-quiz-strings: line ${i + 1} key mismatch -- got "${key}", expected "${expectedKey}"`);
    process.exit(1);
  }
  values[key] = value;
}

// Escape every non-ASCII character as \uXXXX, built from its code point.
// Iterate by UTF-16 code unit (not code point) so the escapes are exactly
// what JS source \u sequences expect; every character in the pinned range
// (U+0590-U+05FF plus space/!/?) is within the BMP, so this is exact.
function escapeToAscii(str) {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 128) {
      out += str[i];
    } else {
      out += '\\u' + code.toString(16).padStart(4, '0');
    }
  }
  return out;
}

const lines_out = [];
lines_out.push('// GENERATED FILE -- do not edit by hand.');
lines_out.push('// Produced by scripts/extract-quiz-strings.mjs from the frozen');
lines_out.push('// hebrew-strings block in .oplan/word-write/design.md.');
lines_out.push('// Every non-ASCII character is written as a \\uXXXX escape so this');
lines_out.push('// file is pure ASCII and cannot be damaged by any transport.');
lines_out.push('');
lines_out.push('export const QUIZ_STRINGS = Object.freeze({');
for (const key of EXPECTED_KEYS) {
  lines_out.push(`  ${key}: "${escapeToAscii(values[key])}",`);
}
lines_out.push('});');
lines_out.push('');

const outContent = lines_out.join('\n');

writeFileSync(outPath, outContent, { encoding: 'utf8' });

console.log('extract-quiz-strings: wrote ' + outPath);
console.log('  keys: ' + EXPECTED_KEYS.length);
for (const key of EXPECTED_KEYS) {
  console.log(`  ${key}: length=${values[key].length} codepoints (glyphs not printed)`);
}
