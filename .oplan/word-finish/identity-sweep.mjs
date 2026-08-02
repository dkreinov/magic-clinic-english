// Q1 / F1-4 — machine-wide "are you a profile?" sweep. IDENTITY ONLY.
// Prints PATH and WORD-KEY COUNT. NEVER a word. Never contents.
import { readdirSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOTS = process.argv.slice(2);
const SKIP = new Set(['node_modules','.git','.next','dist','build','AppData','Windows','Program Files','Program Files (x86)','$Recycle.Bin','.vercel','ProgramData']);
let filesSeen = 0, jsonSeen = 0, parsed = 0, profiles = 0, errors = 0;
const hits = [];

function walk(dir, depth) {
  if (depth > 8) return;
  let names;
  try { names = readdirSync(dir); } catch { return; }
  for (const n of names) {
    if (SKIP.has(n)) continue;
    const p = path.join(dir, n);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) { walk(p, depth+1); continue; }
    filesSeen++;
    if (!/\.(json|bak|backup|txt)$/i.test(n)) continue;
    if (st.size > 3_000_000) continue;
    jsonSeen++;
    let text;
    try { text = readFileSync(p,'utf8'); } catch { errors++; continue; }
    if (!text.includes('"words"')) continue;
    let obj;
    try { obj = JSON.parse(text); } catch { continue; }
    parsed++;
    const prof = obj && obj.data ? obj.data : obj;
    if (!prof || typeof prof !== 'object') continue;
    const w = prof.words;
    if (!w || typeof w !== 'object' || Array.isArray(w)) continue;
    const keys = Object.keys(w);
    if (keys.length === 0) continue;
    // profile-shaped: at least one value is an object with a status field
    const shaped = keys.some(k => w[k] && typeof w[k]==='object' && 'status' in w[k]);
    if (!shaped) continue;
    profiles++;
    hits.push({ path: p, wordKeys: keys.length, bytes: st.size, hasChapters: Array.isArray(prof.chapters) ? prof.chapters.length : (prof.story && Array.isArray(prof.story.chapters) ? prof.story.chapters.length : 'n/a') });
  }
}
for (const r of ROOTS) walk(r, 0);
console.log(`[identity sweep] ROOTS=${JSON.stringify(ROOTS)}`);
console.log(`[identity sweep] OBSERVED files=${filesSeen} candidate-text=${jsonSeen} parsed-with-"words"=${parsed} PROFILE-SHAPED=${profiles} read-errors=${errors}`);
console.log('');
console.log('PATH | wordKeys | bytes | chapters   (NO WORD IS EVER PRINTED)');
for (const h of hits.sort((a,b)=>b.wordKeys-a.wordKeys)) {
  console.log(`${h.path} | ${h.wordKeys} | ${h.bytes} | ${h.hasChapters}`);
}
