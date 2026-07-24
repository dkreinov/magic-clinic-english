// One-time offline generator for placement-quiz word audio.
// Reads data/placement-items.json, and for every task1 item that has an
// `audio` field, calls the OpenAI TTS API to synthesize the spoken word and
// writes the resulting mp3 bytes to public/<item.audio>.
//
// Usage:
//   set -a; . ./.env; set +a; node scripts/build-tts.js
//
// Requires OPENAI_API_KEY in the environment. Zero npm dependencies (uses
// global fetch). Node ESM. Idempotent: re-running overwrites existing files.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const BANK_PATH = path.join(REPO_ROOT, 'data', 'placement-items.json');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');

const MODEL = 'gpt-4o-mini-tts';
const VOICE = 'nova';
const INSTRUCTIONS =
  'Speak slowly and clearly, like a warm, friendly teacher pronouncing one English word for a young learner.';

async function loadBank() {
  const raw = await readFile(BANK_PATH, 'utf8');
  return JSON.parse(raw);
}

async function synthesizeWord(apiKey, lemma) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      voice: VOICE,
      input: lemma,
      response_format: 'mp3',
      instructions: INSTRUCTIONS,
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '<no body>');
    throw new Error(`OpenAI TTS API call failed for "${lemma}": ${res.status} ${res.statusText} — ${bodyText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in the environment');
  }

  const bank = await loadBank();
  const task1 = Array.isArray(bank.task1) ? bank.task1 : [];
  const audioItems = task1.filter((item) => item && typeof item.audio === 'string');

  if (audioItems.length === 0) {
    console.log('No task1 items with an audio field found; nothing to do.');
    return;
  }

  await mkdir(path.join(PUBLIC_DIR, 'audio'), { recursive: true });

  for (const item of audioItems) {
    const bytes = await synthesizeWord(apiKey, item.lemma);
    const outPath = path.join(PUBLIC_DIR, item.audio);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, bytes);
    console.log(`Wrote ${outPath} (${bytes.length} bytes)`);
  }
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] || '').href;
if (isDirectRun) {
  main().catch((err) => {
    console.error(err.stack || err.message || String(err));
    process.exitCode = 1;
  });
}

export { synthesizeWord };
