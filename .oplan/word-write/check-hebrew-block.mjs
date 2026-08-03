// Prints "<md5> <byteLength>" of design.md's hebrew-strings block body.
// Used by the frozen validations so no agent packet ever has to carry the regex
// through a shell (field guide 19 / 33) or the Hebrew through a transport (8 / 34).
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const src = readFileSync('.oplan/word-write/design.md', 'utf8');
const m = src.match(/```hebrew-strings\r?\n([\s\S]*?)```/);
if (!m) {
  console.log('NOBLOCK');
  process.exit(0);
}
const body = Buffer.from(m[1], 'utf8');
console.log(createHash('md5').update(body).digest('hex') + ' ' + body.length);
