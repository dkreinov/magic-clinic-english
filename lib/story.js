// Pure story-chapter orchestrator: allowed-vocabulary builder, deterministic
// verification gates, and a generation loop with retry feedback.
// No network here — the `chat` function is injected by the caller.

import { tokenize, baseForms, knownLemmaSet, coverageAgainst } from './vocab.js';

export const STORY_MODEL = 'gpt-4.1-mini';

export const CORE_FUNCTION_WORDS = [
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

export const STORY_LEXICON = ["vet","magical","magic","animal","creature","clinic","apprentice","dragon","unicorn","fairy","wizard","witch","spell","potion","wing","tail","scale","feather","paw","horn","pet","heal","cure","sick","forest","cave"];

export function buildAllowedSet(profile, band1) {
  const allowed = new Set();

  for (const k of knownLemmaSet(profile).keys()) {
    allowed.add(String(k).toLowerCase());
  }

  const band = profile.skills && profile.skills.receptiveVocab && profile.skills.receptiveVocab.band;
  const includeAllSections = band === 'A1' || band === 'A2';

  for (const e of band1.entries) {
    if (includeAllSections || e.section === 'preBandI') {
      allowed.add(String(e.lemma).toLowerCase());
    }
  }

  for (const w of CORE_FUNCTION_WORDS) {
    allowed.add(String(w).toLowerCase());
  }

  for (const w of STORY_LEXICON) {
    allowed.add(String(w).toLowerCase());
  }

  const heroineName = profile.learner && profile.learner.heroineName;
  if (typeof heroineName === 'string' && heroineName.trim() !== '') {
    allowed.add(heroineName.toLowerCase());
  }

  const petName = profile.learner && profile.learner.petName;
  if (typeof petName === 'string' && petName.trim() !== '') {
    allowed.add(petName.toLowerCase());
  }

  return allowed;
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== '';
}

const HEBREW_RE = /[֐-׿]/;

function checkStructure(chapter, errors) {
  if (!isNonEmptyString(chapter.title)) {
    errors.push('title: expected a non-empty string');
  }
  if (!isNonEmptyString(chapter.text)) {
    errors.push('text: expected a non-empty string');
  }
  if (!isNonEmptyString(chapter.cliffhanger)) {
    errors.push('cliffhanger: expected a non-empty string');
  }

  if (!Array.isArray(chapter.glossary)) {
    errors.push('glossary: expected an array');
  } else {
    chapter.glossary.forEach((g, i) => {
      if (!g || !isNonEmptyString(g.word) || !isNonEmptyString(g.he)) {
        errors.push(`glossary[${i}]: expected {word, he} non-empty strings`);
      }
    });
  }

  if (!Array.isArray(chapter.questions) || (chapter.questions.length !== 2 && chapter.questions.length !== 3)) {
    errors.push('questions: expected an array of 2 or 3 items');
  } else {
    chapter.questions.forEach((q, i) => {
      const label = `questions[${i}]`;
      if (!q || !isNonEmptyString(q.id)) {
        errors.push(`${label}.id: expected a non-empty string`);
      }
      if (!q || typeof q.prompt !== 'string' || !HEBREW_RE.test(q.prompt)) {
        errors.push(`${label}.prompt: expected a Hebrew string`);
      }
      if (!q || !Array.isArray(q.options) || q.options.length !== 4) {
        errors.push(`${label}.options: expected an array of 4 strings`);
      } else {
        const distinct = new Set(q.options);
        if (distinct.size !== 4) {
          errors.push(`${label}.options: expected 4 distinct strings`);
        }
        q.options.forEach((opt, j) => {
          if (typeof opt !== 'string' || !HEBREW_RE.test(opt)) {
            errors.push(`${label}.options[${j}]: expected a Hebrew string`);
          }
        });
      }
      if (!q || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
        errors.push(`${label}.correctIndex: expected an integer 0..3`);
      }
      if (!q || !isNonEmptyString(q.evidence)) {
        errors.push(`${label}.evidence: expected a non-empty string`);
      }
    });
  }
}

export function verifyChapter(chapter, allowedSet, { minRatio = 0.95 } = {}) {
  const errors = [];

  checkStructure(chapter, errors);

  let unknown = [];
  if (typeof chapter.text === 'string' && chapter.text.trim() !== '') {
    const normalizedText = chapter.text.replace(/[‘’]/g, "'").replace(/'s\b/g, '');
    const c = coverageAgainst(normalizedText, allowedSet);
    unknown = c.unknown;
    const ratio = c.ratio;

    if (c.ratio < minRatio) {
      errors.push(`coverage: ratio ${c.ratio} below ${minRatio}; unknown words: ${c.unknown.join(', ')}`);
    }

    if (Array.isArray(chapter.glossary)) {
      const glossaryWords = new Set(
        chapter.glossary
          .filter((g) => g && typeof g.word === 'string')
          .map((g) => g.word.toLowerCase())
      );
      for (const token of c.unknown) {
        const covered = glossaryWords.has(token) || baseForms(token).some((b) => glossaryWords.has(b));
        if (!covered) {
          errors.push(`glossary: missing entry covering unknown word "${token}"`);
        }
      }
    }

    if (Array.isArray(chapter.questions)) {
      chapter.questions.forEach((q) => {
        if (!q || typeof q.evidence !== 'string') return;
        const inText = chapter.text.includes(q.evidence);
        const longEnough = tokenize(q.evidence).length >= 3;
        if (!inText || !longEnough) {
          errors.push(`questions[${q.id ?? '?'}]: evidence not found verbatim in text or too short`);
        }
      });
    }

    return { ok: errors.length === 0, ratio, unknown, errors };
  }

  return { ok: errors.length === 0, ratio: 0, unknown: [], errors };
}

export function buildPrompt({ profile, allowedList, previousSummary, previousCliffhanger, n, forbidden }) {
  const heroineName = profile.learner.heroineName;
  const petName = profile.learner.petName;

  const system = `You are writing a serialized story for an 11-year-old beginner English reader.
The heroine is named ${heroineName}, an apprentice to a veterinarian for magical creatures.
Her first magical animal is named ${petName}.
Write chapter ${n} of the story.
STRICT rules:
- The chapter text must be 80-140 English words.
- Use simple, short sentences.
- End the chapter on a cliffhanger.
- Use ONLY words from the ALLOWED WORD LIST (inflected forms are allowed).
- NEVER use contractions (no apostrophes).
Output ONLY JSON with EXACTLY these keys:
{"title": string, "text": string, "cliffhanger": string (the final hook sentence, also present at the end of text), "summarySoFar": string (2-3 sentence running recap including this chapter), "glossary": [{"word": english word from the text, "he": Hebrew translation}] (MUST include every word a beginner might not know), "questions": [2-3 items {"prompt": Hebrew question, "options": [4 distinct Hebrew options], "correctIndex": 0-3, "evidence": a VERBATIM sentence copied from text that proves the correct answer}]}`;

  const user = `ALLOWED WORD LIST:\n${allowedList.join(' ')}`
    + (previousSummary ? `\n\nSTORY SO FAR:\n${previousSummary}` : '')
    + (previousCliffhanger ? `\n\nCONTINUE FROM THIS CLIFFHANGER:\n${previousCliffhanger}` : '')
    + (forbidden && forbidden.length ? `\n\nDO NOT USE THESE WORDS (they failed the vocabulary check):\n${forbidden.join(' ')}` : '');

  return { system, user };
}

export async function generateChapter({ profile, band1, chat, now = new Date().toISOString(), maxAttempts = 3 }) {
  const allowedSet = buildAllowedSet(profile, band1);
  const allowedList = [...allowedSet].sort();
  const n = profile.story.chapters.length + 1;
  const previousSummary = profile.story.summarySoFar;
  const previousCliffhanger = profile.story.cliffhanger;
  let forbidden = [];
  let lastErrors = [];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { system, user } = buildPrompt({
      profile,
      allowedList,
      previousSummary,
      previousCliffhanger,
      n,
      forbidden,
    });

    let raw;
    try {
      raw = await chat({ system, user, temperature: 0.7 });
    } catch (err) {
      lastErrors = [`chat failed: ${err && err.message ? err.message : String(err)}`];
      continue;
    }

    const candidate = {
      n,
      title: raw.title,
      text: raw.text,
      cliffhanger: raw.cliffhanger,
      glossary: raw.glossary,
      questions: (raw.questions || []).map((q, i) => ({ id: `ch${n}-q${i + 1}`, ...q })),
      coverageRatio: null,
      generatedAt: now,
    };

    const v = verifyChapter(candidate, allowedSet);
    if (v.ok) {
      candidate.coverageRatio = v.ratio;
      return {
        ok: true,
        chapter: candidate,
        summarySoFar: (typeof raw.summarySoFar === 'string' && raw.summarySoFar) || previousSummary || '',
      };
    }

    forbidden = v.unknown;
    lastErrors = v.errors;
  }

  return { ok: false, error: 'chapter verification failed', lastErrors };
}
