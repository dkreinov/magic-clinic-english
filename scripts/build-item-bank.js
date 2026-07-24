// One-time offline generator for the placement item bank.
// Reads data/band1.json, calls the OpenAI API twice (task1 emoji/translation
// data, task2 micro-texts + comprehension questions), self-validates the
// result against the frozen schema, then writes data/placement-items.json.
//
// Usage:
//   set -a; . ./.env; set +a; node scripts/build-item-bank.js
//
// Requires OPENAI_API_KEY in the environment. Zero npm dependencies (uses
// global fetch). Node ESM.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { baseForms } from '../lib/vocab.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const BAND1_PATH = path.join(REPO_ROOT, 'data', 'band1.json');
const OUTPUT_PATH = path.join(REPO_ROOT, 'data', 'placement-items.json');

const MODEL = 'gpt-4.1-mini';
const RNG_SEED = 20260724;

// Frozen list — duplicated VERBATIM in tests/placement-items.test.js.
const FUNCTION_FORMS = [
  'is', 'are', 'was', 'were', 'am', 'been', 'being', 'has', 'had', 'did', 'done', 'does', 'went', 'gone',
  'said', 'saw', 'seen', 'got', 'made', 'came', 'come', 'took', 'taken', 'ran', 'ate', 'gave', 'given',
  'found', 'knew', 'known', 'put', 'let', 'its', 'an', 'her', 'him', 'his', 'hers', 'them', 'they',
  'their', 'theirs', 'us', 'our', 'ours', 'me', 'my', 'mine', 'your', 'yours',
];

const HEBREW_RE = /[֐-׿]/;
const PICTOGRAPHIC_RE = /\p{Extended_Pictographic}/u;
const LEMMA_RE = /^[a-z]+$/;

// --- seeded RNG: mulberry32 -------------------------------------------------

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// --- OpenAI helper -----------------------------------------------------------

async function callOpenAI(apiKey, systemPrompt, userPrompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '<no body>');
    throw new Error(`OpenAI API call failed: ${res.status} ${res.statusText} — ${bodyText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI API response missing message content');
  }
  return JSON.parse(content);
}

// --- Step 1-4: task1 generation ----------------------------------------------

async function loadBand1() {
  const raw = await readFile(BAND1_PATH, 'utf8');
  return JSON.parse(raw);
}

function candidateNouns(band1) {
  return band1.entries.filter((e) => e.single === true && /\bn\b/.test(e.pos || ''));
}

async function fetchEmojiTranslations(apiKey, candidates, rng) {
  const capped = shuffle(candidates, rng).slice(0, 200);
  const lemmas = capped.map((e) => e.lemma);

  const systemPrompt =
    'You are a lexicographer helping build a picture-vocabulary quiz for young Hebrew-speaking ' +
    'learners of English. For each English noun lemma given, respond with a single expressive emoji ' +
    'that unambiguously depicts it (or null if no emoji fits cleanly), plus its common Hebrew translation. ' +
    'Respond with ONLY a JSON object of the form {"items": [{"lemma": "...", "emoji": "..." | null, "he": "..."}]}, ' +
    'one entry per input lemma, in the same order, with no extra commentary.';
  const userPrompt = `Lemmas:\n${JSON.stringify(lemmas)}`;

  const result = await callOpenAI(apiKey, systemPrompt, userPrompt);
  const items = Array.isArray(result) ? result : result.items;
  if (!Array.isArray(items)) {
    throw new Error('OpenAI task1 response did not contain an items array');
  }

  const bySection = new Map(capped.map((e) => [e.lemma, e.section]));

  const seenEmoji = new Set();
  const filtered = [];
  for (const item of items) {
    if (!item || typeof item.lemma !== 'string') continue;
    if (typeof item.emoji !== 'string' || item.emoji.length === 0) continue;
    if (typeof item.he !== 'string' || item.he.trim().length === 0) continue;
    if (!HEBREW_RE.test(item.he)) continue;
    if (!PICTOGRAPHIC_RE.test(item.emoji)) continue;
    if (seenEmoji.has(item.emoji)) continue;
    if (!LEMMA_RE.test(item.lemma)) continue;
    if (!bySection.has(item.lemma)) continue;
    seenEmoji.add(item.emoji);
    filtered.push({ lemma: item.lemma, emoji: item.emoji, he: item.he, section: bySection.get(item.lemma) });
  }
  return filtered;
}

function selectTargets(pool, rng) {
  const preBandI = shuffle(pool.filter((e) => e.section === 'preBandI'), rng);
  const bandI = shuffle(pool.filter((e) => e.section === 'bandI'), rng);

  const selected = [];
  selected.push(...preBandI.slice(0, 6));
  const needed = 12 - selected.length;
  // Per spec: 6 preBandI + 6 bandI; if fewer preBandI available, fill from bandI.
  selected.push(...bandI.slice(0, needed));

  if (selected.length < 12) {
    throw new Error(
      `Not enough valid emoji/translation candidates to select 12 targets ` +
      `(got ${selected.length}; preBandI=${preBandI.length}, bandI=${bandI.length}).`
    );
  }

  return selected.slice(0, 12);
}

function buildTask1(targets, rng) {
  const items = [];
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const direction = i < 6 ? 'audio-to-picture' : 'picture-to-word';
    const others = targets.filter((_, idx) => idx !== i);
    const distractorPool = shuffle(others, rng).slice(0, 3);

    const correctValue = direction === 'audio-to-picture' ? target.emoji : target.lemma;
    const distractorValues = distractorPool.map((d) =>
      direction === 'audio-to-picture' ? d.emoji : d.lemma
    );

    const options = shuffle([correctValue, ...distractorValues], rng);
    const correctIndex = options.indexOf(correctValue);

    const id = `t1-${String(i + 1).padStart(2, '0')}`;
    const item = {
      id,
      direction,
      lemma: target.lemma,
      he: target.he,
      emoji: target.emoji,
      options,
      correctIndex,
      section: target.section,
    };
    if (direction === 'audio-to-picture') {
      item.audio = `audio/word-${target.lemma}.mp3`;
    }
    items.push(item);
  }
  return items;
}

// --- Step 6: task2 generation --------------------------------------------------

function buildAllowedTokens(band1) {
  const allowed = new Set();
  for (const entry of band1.entries) {
    const matches = String(entry.lemma).toLowerCase().match(/[a-z]+/g) || [];
    for (const m of matches) allowed.add(m);
  }
  for (const f of FUNCTION_FORMS) allowed.add(f);
  return allowed;
}

async function fetchTask2(apiKey, allowedTokens, forbiddenTokens = []) {
  const wordList = Array.from(allowedTokens).sort();

  const systemPrompt =
    'You write micro-texts and comprehension questions for a placement test aimed at young ' +
    'Hebrew-speaking learners of English. You must produce EXACTLY 2 short micro-texts (3 to 5 ' +
    'sentences each), themed around everyday life, animals, or a doctor checking an animal, with no ' +
    'story spoilers. CRITICAL constraint: use ONLY words drawn from the given ALLOWED WORD LIST ' +
    '(inflected forms such as plurals, past tense, -ing forms are allowed as long as they are ' +
    'built from a listed base word) — do not use any word outside this list, including topical words ' +
    'like "vet", "medicine", or "fur" unless they literally appear in the list. If a word you want is ' +
    'not on the list, pick a different, allowed word instead. NEVER use contractions or apostrophes ' +
    'anywhere in the texts. For each text, write EXACTLY 3 reading comprehension questions, each with ' +
    'a Hebrew-language prompt, 4 distinct Hebrew-language answer options, and the zero-based index of ' +
    'the correct option. Respond with ONLY a JSON object of the form {"texts": [{"title": "<Hebrew ' +
    'title>", "text": "<English micro-text>", "questions": [{"prompt": "<Hebrew>", "options": ' +
    '["<Hebrew>", "<Hebrew>", "<Hebrew>", "<Hebrew>"], "correctIndex": 0}]}]} with exactly 2 texts and ' +
    'exactly 3 questions each. No commentary.';

  let userPrompt = `ALLOWED WORD LIST (use only these words, inflections of them allowed):\n${JSON.stringify(wordList)}`;
  if (forbiddenTokens.length > 0) {
    userPrompt +=
      `\n\nYour previous attempt used these words that are NOT in the allowed word list: ` +
      `${JSON.stringify(Array.from(new Set(forbiddenTokens)))}. ` +
      'Rewrite both texts from scratch, avoiding these words entirely and using only words from the allowed list.';
  }

  const result = await callOpenAI(apiKey, systemPrompt, userPrompt);
  const texts = Array.isArray(result) ? result : result.texts;
  if (!Array.isArray(texts)) {
    throw new Error('OpenAI task2 response did not contain a texts array');
  }
  return texts;
}

function tokenizeEnglish(text) {
  return String(text).toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];
}

// Full structural/schema self-check for task2 (ids, Hebrew fields, option
// distinctness/count, correctIndex range, no apostrophes). Returns an array
// of human-readable failure strings; empty array means the schema is valid.
// Never throws — safe to call on not-yet-trusted LLM output during retries.
function validateTask2Schema(task2) {
  const failures = [];

  if (!Array.isArray(task2) || task2.length !== 2) {
    failures.push(`task2 must have exactly 2 items (got ${Array.isArray(task2) ? task2.length : typeof task2})`);
    return failures;
  }

  const validIds = ['t2-t1', 't2-t2'];
  for (let i = 0; i < task2.length; i++) {
    const t = task2[i];
    if (!t || typeof t !== 'object') {
      failures.push(`task2[${i}] must be an object`);
      continue;
    }
    if (t.id !== validIds[i]) failures.push(`bad task2 id: expected ${validIds[i]} got ${t.id}`);
    if (typeof t.title !== 'string' || !HEBREW_RE.test(t.title)) failures.push(`bad title for ${t.id}`);
    if (typeof t.text !== 'string' || t.text.length === 0) failures.push(`bad text for ${t.id}`);
    if (typeof t.text === 'string' && /'/.test(t.text)) failures.push(`apostrophe found in text for ${t.id}`);

    if (!Array.isArray(t.questions) || t.questions.length !== 3) {
      failures.push(`bad questions length for ${t.id} (got ${Array.isArray(t.questions) ? t.questions.length : typeof t.questions})`);
      continue;
    }

    for (let qi = 0; qi < t.questions.length; qi++) {
      const q = t.questions[qi];
      const expectedId = `${t.id}-q${qi + 1}`;
      if (!q || typeof q !== 'object') {
        failures.push(`question ${expectedId} must be an object`);
        continue;
      }
      if (q.id !== expectedId) failures.push(`bad question id: expected ${expectedId} got ${q.id}`);
      if (typeof q.prompt !== 'string' || !HEBREW_RE.test(q.prompt)) failures.push(`bad prompt for ${q.id}`);
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        failures.push(`bad options length for ${q.id}`);
      } else {
        if (new Set(q.options).size !== 4) failures.push(`options not distinct for ${q.id}`);
        for (const opt of q.options) {
          if (typeof opt !== 'string' || !HEBREW_RE.test(opt)) failures.push(`option not Hebrew for ${q.id}: ${opt}`);
        }
      }
      if (!(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3)) {
        failures.push(`bad correctIndex for ${q.id}`);
      }
    }
  }

  return failures;
}

function validateTask2Vocab(texts, allowedTokens) {
  const failures = [];
  for (const t of texts) {
    if (typeof t.text !== 'string') continue;
    if (/'/.test(t.text)) {
      failures.push({ text: t.text, reason: 'contains apostrophe' });
      continue;
    }
    const tokens = tokenizeEnglish(t.text);
    for (const token of tokens) {
      const bases = baseForms(token);
      const ok = bases.some((b) => allowedTokens.has(b));
      if (!ok) {
        failures.push({ text: t.text, token, reason: 'not in allowed word list' });
      }
    }
  }
  return failures;
}

function buildTask2(texts) {
  const items = [];
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    const textId = `t2-t${i + 1}`;
    const questions = t.questions.map((q, qi) => ({
      id: `${textId}-q${qi + 1}`,
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
    }));
    items.push({
      id: textId,
      title: t.title,
      text: t.text,
      questions,
    });
  }
  return items;
}

// --- Step 7: self-validation --------------------------------------------------

function assertOrThrow(cond, message) {
  if (!cond) throw new Error(`Validation failed: ${message}`);
}

function validateBank(bank, band1, allowedTokens) {
  assertOrThrow(bank && typeof bank === 'object', 'bank must be an object');
  const { meta, task1, task2 } = bank;
  assertOrThrow(meta && typeof meta === 'object', 'meta must be an object');
  assertOrThrow(meta.version === 1, 'meta.version must be 1');
  assertOrThrow(typeof meta.generatedAt === 'string', 'meta.generatedAt must be a string');
  assertOrThrow(meta.generator === 'scripts/build-item-bank.js', 'meta.generator mismatch');
  assertOrThrow(meta.model === MODEL, 'meta.model mismatch');
  assertOrThrow(meta.source === 'data/band1.json', 'meta.source mismatch');
  assertOrThrow(Array.isArray(task1), 'task1 must be an array');
  assertOrThrow(meta.task1Count === task1.length, 'meta.task1Count mismatch');
  assertOrThrow(task1.length >= 10 && task1.length <= 16, 'task1.length out of [10,16]');
  assertOrThrow(meta.task2TextCount === 2, 'meta.task2TextCount must be 2');
  assertOrThrow(meta.task2QuestionCount === 6, 'meta.task2QuestionCount must be 6');

  const band1Lemmas = new Map();
  for (const e of band1.entries) {
    band1Lemmas.set(e.lemma, e.section);
  }

  const seenEmoji = new Set();
  const idSet = new Set();
  for (const item of task1) {
    assertOrThrow(/^t1-\d{2}$/.test(item.id), `bad task1 id: ${item.id}`);
    assertOrThrow(!idSet.has(item.id), `duplicate task1 id: ${item.id}`);
    idSet.add(item.id);
    assertOrThrow(
      item.direction === 'audio-to-picture' || item.direction === 'picture-to-word',
      `bad direction for ${item.id}`
    );
    assertOrThrow(LEMMA_RE.test(item.lemma), `bad lemma for ${item.id}: ${item.lemma}`);
    assertOrThrow(typeof item.he === 'string' && item.he.length > 0, `empty he for ${item.id}`);
    assertOrThrow(HEBREW_RE.test(item.he), `he not Hebrew for ${item.id}`);
    assertOrThrow(typeof item.emoji === 'string' && item.emoji.length > 0, `empty emoji for ${item.id}`);
    assertOrThrow(Array.isArray(item.options) && item.options.length === 4, `options not len 4 for ${item.id}`);
    assertOrThrow(new Set(item.options).size === 4, `options not distinct for ${item.id}`);
    assertOrThrow(
      Number.isInteger(item.correctIndex) && item.correctIndex >= 0 && item.correctIndex <= 3,
      `bad correctIndex for ${item.id}`
    );
    const expectedCorrect = item.direction === 'audio-to-picture' ? item.emoji : item.lemma;
    assertOrThrow(item.options[item.correctIndex] === expectedCorrect, `correctIndex mismatch for ${item.id}`);
    assertOrThrow(
      item.section === 'preBandI' || item.section === 'bandI',
      `bad section for ${item.id}`
    );
    assertOrThrow(
      band1Lemmas.has(item.lemma) && band1Lemmas.get(item.lemma) === item.section,
      `lemma/section not found in band1 for ${item.id}`
    );

    assertOrThrow(!seenEmoji.has(item.emoji), `duplicate emoji across items: ${item.emoji}`);
    seenEmoji.add(item.emoji);

    if (item.direction === 'audio-to-picture') {
      assertOrThrow(item.audio === `audio/word-${item.lemma}.mp3`, `bad audio path for ${item.id}`);
      for (const opt of item.options) {
        assertOrThrow(PICTOGRAPHIC_RE.test(opt), `option not pictographic for ${item.id}: ${opt}`);
      }
    } else {
      assertOrThrow(!('audio' in item), `unexpected audio key on picture-to-word item ${item.id}`);
      for (const opt of item.options) {
        assertOrThrow(LEMMA_RE.test(opt), `option not lemma-shaped for ${item.id}: ${opt}`);
      }
    }
  }

  const task2SchemaFailures = validateTask2Schema(task2);
  if (task2SchemaFailures.length > 0) {
    throw new Error(`Validation failed: task2 schema failures:\n${task2SchemaFailures.join('\n')}`);
  }

  const vocabFailures = validateTask2Vocab(task2, allowedTokens);
  if (vocabFailures.length > 0) {
    const detail = vocabFailures
      .slice(0, 10)
      .map((f) => `[${f.reason}] token="${f.token ?? ''}" in text="${f.text}"`)
      .join('\n');
    throw new Error(`Validation failed: task2 vocabulary constraint violated:\n${detail}`);
  }
}

// --- main -----------------------------------------------------------------------

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in the environment');
  }

  const band1 = await loadBand1();
  const allowedTokens = buildAllowedTokens(band1);
  const candidates = candidateNouns(band1);

  const rng = mulberry32(RNG_SEED);
  const pool = await fetchEmojiTranslations(apiKey, candidates, rng);
  const targets = selectTargets(pool, rng);
  const task1 = buildTask1(targets, rng);

  let task2Raw;
  let task2;
  const maxTask2Attempts = 3;
  let lastError;
  let forbiddenTokens = [];
  for (let attempt = 1; attempt <= maxTask2Attempts; attempt++) {
    try {
      task2Raw = await fetchTask2(apiKey, allowedTokens, forbiddenTokens);
      task2 = buildTask2(task2Raw);

      const schemaFailures = validateTask2Schema(task2);
      const vocabFailures = validateTask2Vocab(task2, allowedTokens);

      if (schemaFailures.length > 0 || vocabFailures.length > 0) {
        const detail = [
          ...schemaFailures,
          ...vocabFailures.map((f) => `[${f.reason}] token="${f.token ?? ''}" in text="${f.text}"`),
        ]
          .slice(0, 10)
          .join('\n');
        forbiddenTokens = vocabFailures.filter((f) => f.token).map((f) => f.token);
        throw new Error(`task2 validation failed on attempt ${attempt}:\n${detail}`);
      }
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      console.error(`task2 generation attempt ${attempt} failed: ${err.message}`);
    }
  }
  if (lastError) {
    throw lastError;
  }

  const bank = {
    meta: {
      version: 1,
      generatedAt: new Date().toISOString(),
      generator: 'scripts/build-item-bank.js',
      model: MODEL,
      source: 'data/band1.json',
      task1Count: task1.length,
      task2TextCount: 2,
      task2QuestionCount: 6,
    },
    task1,
    task2,
  };

  validateBank(bank, band1, allowedTokens);

  await writeFile(OUTPUT_PATH, JSON.stringify(bank, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${OUTPUT_PATH} with ${task1.length} task1 items and ${task2.length} task2 texts.`);
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] || '').href;
if (isDirectRun) {
  main().catch((err) => {
    console.error(err.stack || err.message || String(err));
    process.exitCode = 1;
  });
}

export { mulberry32, shuffle, buildAllowedTokens, validateTask2Schema, validateTask2Vocab, validateBank };
