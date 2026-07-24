import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  STORY_MODEL,
  CORE_FUNCTION_WORDS,
  STORY_LEXICON,
  buildAllowedSet,
  verifyChapter,
  buildPrompt,
  generateChapter,
} from '../lib/story.js';
import { defaultProfile } from '../lib/profile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'data', 'band1.json');

function loadBand1() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

const EXPECTED_CORE_FUNCTION_WORDS = [
  "is","are","was","were","am","been","being","has","had","did","done","does","went","gone",
  "said","saw","seen","got","made","came","come","took","taken","ran","ate","gave","given",
  "found","knew","known","put","let","its","an","her","him","his","hers","them","they",
  "their","theirs","us","our","ours","me","my","mine","your","yours",
  "a","the","this","that","these","those","i","you","he","she","it","we","to","of","in",
  "on","at","for","with","from","by","as","and","or","but","not","no","yes","what","who",
  "where","when","why","how","here","there","now","then","so","if","up","down","out","all",
  "one","two","three","very","too","also","because","about","into","over","again","new",
  "some","many","more","most","little","big","good","bad"
];

const EXPECTED_STORY_LEXICON = ["vet","magical","magic","animal","creature","clinic","apprentice","dragon","unicorn","fairy","wizard","witch","spell","potion","wing","tail","scale","feather","paw","horn","pet","heal","cure","sick","forest","cave"];

test('CORE_FUNCTION_WORDS matches the frozen list', () => {
  assert.deepStrictEqual(CORE_FUNCTION_WORDS, EXPECTED_CORE_FUNCTION_WORDS);
});

test('STORY_LEXICON matches the frozen list', () => {
  assert.deepStrictEqual(STORY_LEXICON, EXPECTED_STORY_LEXICON);
});

test('STORY_MODEL is gpt-4.1-mini', () => {
  assert.strictEqual(STORY_MODEL, 'gpt-4.1-mini');
});

function makePlacedProfile() {
  const profile = defaultProfile();
  profile.learner.heroineName = 'Noa';
  profile.learner.petName = 'Sparky';
  const knownWords = ['ocean', 'river', 'mountain', 'castle', 'kitchen', 'garden', 'library', 'bicycle', 'umbrella', 'window'];
  for (const w of knownWords) {
    profile.words[w] = {
      status: 'known',
      source: 'placement',
      he: null,
      taps: 0,
      firstSeen: '2026-01-01T00:00:00.000Z',
      lastSeen: '2026-01-01T00:00:00.000Z',
    };
  }
  return profile;
}

test('buildAllowedSet merges known words, preBandI band1 entries, core words, and lexicon', () => {
  const band1 = loadBand1();
  const profile = makePlacedProfile();
  const allowed = buildAllowedSet(profile, band1);

  assert.ok(allowed.size >= 250, `expected size >= 250, got ${allowed.size}`);
  assert.ok(allowed.has('dog'), 'expected preBandI word "dog"');
  assert.ok(allowed.has('the'), 'expected core function word "the"');
  assert.ok(allowed.has('dragon'), 'expected lexicon word "dragon"');
  for (const w of ['ocean', 'river', 'mountain', 'castle', 'kitchen', 'garden', 'library', 'bicycle', 'umbrella', 'window']) {
    assert.ok(allowed.has(w), `expected known word "${w}"`);
  }
});

test('buildAllowedSet includes learner heroine and pet names when set, and excludes them when null', () => {
  const band1 = loadBand1();

  const profileWithNames = makePlacedProfile();
  profileWithNames.learner.heroineName = 'Luna';
  profileWithNames.learner.petName = 'Sparkle';
  const allowedWithNames = buildAllowedSet(profileWithNames, band1);
  assert.ok(allowedWithNames.has('luna'), 'expected heroine name "luna"');
  assert.ok(allowedWithNames.has('sparkle'), 'expected pet name "sparkle"');

  const profileWithoutNames = makePlacedProfile();
  profileWithoutNames.learner.heroineName = null;
  profileWithoutNames.learner.petName = null;
  const allowedWithoutNames = buildAllowedSet(profileWithoutNames, band1);
  assert.ok(!allowedWithoutNames.has('luna'), 'did not expect "luna" with null heroine name');
  assert.ok(!allowedWithoutNames.has('sparkle'), 'did not expect "sparkle" with null pet name');
});

test('buildAllowedSet includes bandI-only lemmas when receptiveVocab.band is A1/A2, excludes when band is null', () => {
  const band1 = loadBand1();

  const profileA2 = makePlacedProfile();
  profileA2.skills.receptiveVocab.band = 'A2';
  const allowedA2 = buildAllowedSet(profileA2, band1);
  assert.ok(allowedA2.has('afraid'), 'expected bandI-only word "afraid" when band is A2');

  const profileNullBand = makePlacedProfile();
  profileNullBand.skills.receptiveVocab.band = null;
  const allowedNullBand = buildAllowedSet(profileNullBand, band1);
  assert.ok(!allowedNullBand.has('afraid'), 'did not expect "afraid" when band is null');
});

const GOOD_TEXT = 'She is an apprentice at the vet clinic for magical animals. Now a big dragon came into the clinic. The dragon has a hurt wing and its tail is very little. She saw a little unicorn too. The unicorn has one horn and new feathers. She took a potion and gave it to the dragon. The potion is good magic from an old wizard. Then a witch came with a new spell. She said the spell is to heal the wing. She and the vet did the spell again and again. The wing got new again and the dragon was good again.';

function goodChapterFixture() {
  return {
    title: 'The Hurt Wing',
    text: GOOD_TEXT,
    cliffhanger: 'But then the wing did not heal.',
    glossary: [
      { word: 'hurt', he: 'פצוע' },
      { word: 'old', he: 'זקן' },
    ],
    questions: [
      {
        id: 'ch1-q1',
        prompt: 'מה קרה לכנף של הדרקון?',
        options: ['היא נפצעה', 'היא ירוקה', 'היא קטנה', 'היא כחולה'],
        correctIndex: 0,
        evidence: 'The dragon has a hurt wing and its tail is very little.',
      },
      {
        id: 'ch1-q2',
        prompt: 'כמה קרניים יש לחד קרן?',
        options: ['שתיים', 'אחת', 'שלוש', 'אפס'],
        correctIndex: 1,
        evidence: 'The unicorn has one horn and new feathers.',
      },
    ],
  };
}

const ALLOWED_SET = new Set([...CORE_FUNCTION_WORDS, ...STORY_LEXICON]);

test('verifyChapter accepts an in-vocabulary fixture chapter', () => {
  const chapter = goodChapterFixture();
  const v = verifyChapter(chapter, ALLOWED_SET);
  assert.strictEqual(v.ok, true);
  assert.ok(v.ratio >= 0.95, `expected ratio >= 0.95, got ${v.ratio}`);
  assert.deepStrictEqual(v.errors, []);
});

test('verifyChapter rejects a too-hard chapter with a coverage error', () => {
  const chapter = {
    ...goodChapterFixture(),
    text: 'The extraordinary veterinarian meticulously examined the peculiar creature with unprecedented diligence and thorough compassion under fluorescent illumination inside the laboratory.',
    glossary: [],
  };
  const v = verifyChapter(chapter, ALLOWED_SET);
  assert.strictEqual(v.ok, false);
  assert.ok(v.errors.some((e) => e.startsWith('coverage:')), `expected a coverage error, got ${JSON.stringify(v.errors)}`);
});

test('verifyChapter rejects a question whose evidence is not verbatim in the text', () => {
  const chapter = goodChapterFixture();
  chapter.questions[0].evidence = 'not actually in the text at all';
  const v = verifyChapter(chapter, ALLOWED_SET);
  assert.strictEqual(v.ok, false);
  assert.ok(
    v.errors.some((e) => e.includes(chapter.questions[0].id)),
    `expected an error naming question ${chapter.questions[0].id}, got ${JSON.stringify(v.errors)}`
  );
});

test('verifyChapter rejects a chapter whose glossary is missing an unknown token', () => {
  const chapter = goodChapterFixture();
  chapter.glossary = chapter.glossary.filter((g) => g.word !== 'hurt');
  const v = verifyChapter(chapter, ALLOWED_SET);
  assert.strictEqual(v.ok, false);
  assert.ok(
    v.errors.some((e) => e.includes('hurt')),
    `expected an error naming token "hurt", got ${JSON.stringify(v.errors)}`
  );
});

test('verifyChapter normalizes a unicode-apostrophe possessive so it does not produce an unknown token', () => {
  const allowedWithName = new Set([...CORE_FUNCTION_WORDS, ...STORY_LEXICON, 'sparkle']);
  const text = 'Sparkle is a little dragon. Sparkle’s horn is very big and new. She ran to the cave again.';
  const chapter = {
    title: 'Sparkle the Dragon',
    text,
    cliffhanger: 'But then a shadow moved in the cave.',
    glossary: [],
    questions: [
      {
        id: 'ch1-q1',
        prompt: 'מה ספרקל?',
        options: ['דרקון', 'חתול', 'ציפור', 'סוס'],
        correctIndex: 0,
        evidence: 'Sparkle is a little dragon.',
      },
      {
        id: 'ch1-q2',
        prompt: 'איך הקרן של ספרקל?',
        options: ['גדולה וחדשה', 'קטנה', 'שבורה', 'ירוקה'],
        correctIndex: 0,
        evidence: 'Sparkle’s horn is very big and new.',
      },
    ],
  };

  const v = verifyChapter(chapter, allowedWithName);
  assert.strictEqual(v.ok, true, `expected ok, got errors ${JSON.stringify(v.errors)}`);
  assert.deepStrictEqual(v.unknown, []);
});

test('generateChapter retries once after a chat failure and returns ok on the second attempt', async () => {
  let calls = 0;
  const prompts = [];
  const profile = makePlacedProfile();
  const band1 = loadBand1();

  async function chat({ system, user, temperature }) {
    calls++;
    prompts.push({ system, user, temperature });
    if (calls === 1) {
      throw new Error('network blip');
    }
    const raw = goodChapterFixture();
    return {
      title: raw.title,
      text: raw.text,
      cliffhanger: raw.cliffhanger,
      summarySoFar: 'Noa and Sparky met a hurt dragon and a unicorn.',
      glossary: raw.glossary,
      questions: raw.questions.map(({ id, ...rest }) => rest),
    };
  }

  const result = await generateChapter({ profile, band1, chat });

  assert.strictEqual(calls, 2);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.chapter.n, 1);
  assert.strictEqual(result.chapter.title, 'The Hurt Wing');
  assert.strictEqual(result.chapter.questions[0].id, 'ch1-q1');
  assert.strictEqual(result.chapter.questions[1].id, 'ch1-q2');
  assert.ok(result.chapter.coverageRatio >= 0.95);
  assert.strictEqual(result.summarySoFar, 'Noa and Sparky met a hurt dragon and a unicorn.');
});

test('generateChapter gives up after maxAttempts when chat always returns a too-hard chapter, and warns about forbidden words on retry', async () => {
  const prompts = [];
  const profile = makePlacedProfile();
  const band1 = loadBand1();

  async function chat({ system, user, temperature }) {
    prompts.push({ system, user, temperature });
    return {
      title: 'Too Hard',
      text: 'The extraordinary veterinarian meticulously examined the peculiar creature with unprecedented diligence and thorough compassion under fluorescent illumination inside the laboratory.',
      cliffhanger: 'Something happened.',
      summarySoFar: 'irrelevant',
      glossary: [],
      questions: [
        {
          prompt: 'שאלה אחת?',
          options: ['א', 'ב', 'ג', 'ד'],
          correctIndex: 0,
          evidence: 'The extraordinary veterinarian meticulously examined the peculiar creature with unprecedented diligence and thorough compassion under fluorescent illumination inside the laboratory.',
        },
        {
          prompt: 'שאלה שתיים?',
          options: ['ה', 'ו', 'ז', 'ח'],
          correctIndex: 1,
          evidence: 'The extraordinary veterinarian meticulously examined the peculiar creature with unprecedented diligence and thorough compassion under fluorescent illumination inside the laboratory.',
        },
      ],
    };
  }

  const result = await generateChapter({ profile, band1, chat, maxAttempts: 3 });

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.error, 'chapter verification failed');
  assert.ok(Array.isArray(result.lastErrors) && result.lastErrors.length > 0);
  assert.strictEqual(result.chapter, undefined);

  assert.strictEqual(prompts.length, 3);
  assert.ok(!prompts[0].user.includes('DO NOT USE THESE WORDS'));
  assert.ok(prompts[1].user.includes('DO NOT USE THESE WORDS'));
});

const TRANSLATE_SYSTEM = 'Translate ONE English word to a single common Hebrew word. Respond ONLY with JSON {"he": "..."}.';

test('generateChapter repairs a partial glossary in-attempt via one-word translate calls', async () => {
  const profile = makePlacedProfile();
  const band1 = loadBand1();
  const calls = [];
  let generationCalls = 0;
  let translateCalls = 0;

  async function chat({ system, user, temperature }) {
    calls.push({ system, user, temperature });
    if (system === TRANSLATE_SYSTEM) {
      translateCalls++;
      assert.strictEqual(user, 'hurt');
      return { he: 'תרגום' };
    }
    generationCalls++;
    const raw = goodChapterFixture();
    return {
      title: raw.title,
      text: raw.text,
      cliffhanger: raw.cliffhanger,
      summarySoFar: 'summary so far',
      // missing the "hurt" glossary entry on purpose; "old" stays covered
      glossary: raw.glossary.filter((g) => g.word !== 'hurt'),
      questions: raw.questions.map(({ id, ...rest }) => rest),
    };
  }

  const result = await generateChapter({ profile, band1, chat });

  assert.strictEqual(result.ok, true, `expected ok, got ${JSON.stringify(result)}`);
  assert.ok(
    result.chapter.glossary.some((g) => g.word === 'hurt' && g.he === 'תרגום'),
    `expected a repaired glossary entry for "hurt", got ${JSON.stringify(result.chapter.glossary)}`
  );
  assert.ok(result.chapter.coverageRatio >= 0.95);
  assert.strictEqual(generationCalls, 1);
  assert.strictEqual(translateCalls, 1);
  assert.strictEqual(calls.length, 2);
});

test('generateChapter does not attempt glossary repair when the chapter also fails coverage', async () => {
  const profile = makePlacedProfile();
  const band1 = loadBand1();
  const calls = [];

  async function chat({ system, user, temperature }) {
    calls.push({ system, user, temperature });
    return {
      title: 'Too Hard',
      text: 'The extraordinary veterinarian meticulously examined the peculiar creature with unprecedented diligence and thorough compassion under fluorescent illumination inside the laboratory.',
      cliffhanger: 'Something happened.',
      summarySoFar: 'irrelevant',
      glossary: [],
      questions: [
        {
          prompt: 'שאלה אחת?',
          options: ['א', 'ב', 'ג', 'ד'],
          correctIndex: 0,
          evidence: 'The extraordinary veterinarian meticulously examined the peculiar creature with unprecedented diligence and thorough compassion under fluorescent illumination inside the laboratory.',
        },
        {
          prompt: 'שאלה שתיים?',
          options: ['ה', 'ו', 'ז', 'ח'],
          correctIndex: 1,
          evidence: 'The extraordinary veterinarian meticulously examined the peculiar creature with unprecedented diligence and thorough compassion under fluorescent illumination inside the laboratory.',
        },
      ],
    };
  }

  const result = await generateChapter({ profile, band1, chat, maxAttempts: 1 });

  assert.strictEqual(result.ok, false);
  assert.ok(!calls.some((c) => c.system === TRANSLATE_SYSTEM), 'expected no translate calls for a ratio-failing chapter');
});

test('buildPrompt fills in names and assembles allowed list, summary, cliffhanger, and forbidden words', () => {
  const profile = makePlacedProfile();
  const { system, user } = buildPrompt({
    profile,
    allowedList: ['a', 'the', 'dragon'],
    previousSummary: 'Noa started her apprenticeship.',
    previousCliffhanger: 'A shadow moved in the cave.',
    n: 2,
    forbidden: ['extraordinary'],
  });

  assert.ok(system.includes('Noa'));
  assert.ok(system.includes('Sparky'));
  assert.ok(system.includes('chapter 2'));
  assert.ok(user.includes('a the dragon'));
  assert.ok(user.includes('STORY SO FAR:\nNoa started her apprenticeship.'));
  assert.ok(user.includes('CONTINUE FROM THIS CLIFFHANGER:\nA shadow moved in the cave.'));
  assert.ok(user.includes('DO NOT USE THESE WORDS (they failed the vocabulary check):\nextraordinary'));
});

test('buildPrompt system contains the at-most-3-words glossary rule verbatim', () => {
  const profile = makePlacedProfile();
  const { system } = buildPrompt({
    profile,
    allowedList: ['a', 'the', 'dragon'],
    previousSummary: '',
    previousCliffhanger: '',
    n: 1,
    forbidden: [],
  });

  assert.ok(
    system.includes('You may use AT MOST 3 words that are not on the ALLOWED WORD LIST. Every word not on the list MUST have an entry in the glossary.'),
    'expected the glossary-repair rule sentence verbatim in the system prompt'
  );
});
