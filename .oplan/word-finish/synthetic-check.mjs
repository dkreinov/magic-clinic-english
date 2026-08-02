// F1-4, CORRECTED CRITERION. Phase 1 used "md5 == the frozen synthetic OR <= 2 words", which
// raises a FALSE ALARM on finish-art/served-profile.json: a dev server rewrote it, so the bytes
// differ while the WORD-KEY SET is identical. Identity is the property; md5 is a proxy for it.
// Prints verdicts only. NO WORD IS EVER PRINTED.
import fs from 'node:fs';
const FROZEN_MD5 = '91eff5da59674d7463f462fad659534e';
const paths = process.argv.slice(2);
const keysOf = (p) => {
  const env = JSON.parse(fs.readFileSync(p, 'utf8'));
  const prof = env && env.data ? env.data : env;
  return Object.keys((prof && prof.words) || {}).sort();
};
let reference = null;
for (const p of paths) {
  try {
    const b = fs.readFileSync(p);
    const md5 = (await import('node:crypto')).createHash('md5').update(b).digest('hex');
    if (md5 === FROZEN_MD5) { reference = keysOf(p); break; }
  } catch { /* keep looking */ }
}
if (!reference) { console.log('FAIL: no file matching the frozen synthetic md5 was found to use as the reference'); process.exit(1); }
let bad = 0, observed = 0;
for (const p of paths) {
  observed++;
  let keys;
  try { keys = keysOf(p); } catch (e) { console.log(`FAIL ${p}: unreadable`); bad++; continue; }
  const same = keys.length === reference.length && keys.every((k, i) => k === reference[i]);
  const verdict = same ? 'SYNTHETIC (word-key identity)' : keys.length <= 2 ? 'comparator fixture (<=2 keys)' : 'NOT ACCOUNTED FOR';
  if (verdict === 'NOT ACCOUNTED FOR') bad++;
  console.log(`${verdict.padEnd(30)} keys=${String(keys.length).padStart(2)}  ${p}`);
}
console.log(`OBSERVED ${observed} files | NOT ACCOUNTED FOR: ${bad}`);
process.exit(bad === 0 ? 0 : 1);
