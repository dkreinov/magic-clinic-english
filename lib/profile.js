import { resolveLemma } from '../public/lemma.js';

const SKILL_KEYS = [
  'receptiveVocab',
  'readingComprehension',
  'writing',
  'grammarInContext',
  'pronunciation',
];

const SKILL_STATES = ['unknown', 'estimated'];
const SKILL_BANDS = ['preA1', 'A1', 'A2'];
const WORD_STATUSES = ['known', 'learning'];
const WORD_SOURCES = ['placement', 'tap', 'band'];

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isParseableDateString(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

export function defaultProfile(nowIso = new Date().toISOString()) {
  return {
    version: 1,
    learner: { heroineName: null, petName: null },
    skills: {
      receptiveVocab: { state: 'unknown', score: null, band: null },
      readingComprehension: { state: 'unknown', score: null, band: null },
      writing: { state: 'unknown', score: null, band: null },
      grammarInContext: { state: 'unknown', score: null, band: null },
      pronunciation: { state: 'unknown', score: null, band: null },
    },
    words: {},
    placement: { completed: false, task1: null, task2: null, completedAt: null },
    story: { chapters: [], summarySoFar: '', cliffhanger: '', checkLog: [] },
    meta: { createdAt: nowIso, updatedAt: nowIso },
  };
}

export function validateProfile(profile) {
  const errors = [];

  if (!isPlainObject(profile)) {
    return { ok: false, errors: ['root: expected an object'] };
  }

  if (profile.version !== 1) {
    errors.push(`version: expected 1, got ${JSON.stringify(profile.version)}`);
  }

  const topLevelKeys = ['learner', 'skills', 'words', 'placement', 'story', 'meta'];
  for (const key of topLevelKeys) {
    if (!(key in profile)) {
      errors.push(`${key}: missing`);
    }
  }

  // learner
  if ('learner' in profile) {
    if (isPlainObject(profile.learner)) {
      if (profile.learner.heroineName !== null && typeof profile.learner.heroineName !== 'string') {
        errors.push('learner.heroineName: expected a string or null');
      }
      if (profile.learner.petName !== null && typeof profile.learner.petName !== 'string') {
        errors.push('learner.petName: expected a string or null');
      }
    } else {
      errors.push('learner: expected an object');
    }
  }

  // skills
  if ('skills' in profile) {
    if (isPlainObject(profile.skills)) {
      for (const skillKey of SKILL_KEYS) {
        const path = `skills.${skillKey}`;
        const skill = profile.skills[skillKey];
        if (!isPlainObject(skill)) {
          errors.push(`${path}: missing or not an object`);
          continue;
        }
        if (!SKILL_STATES.includes(skill.state)) {
          errors.push(`${path}.state: invalid value ${JSON.stringify(skill.state)}`);
        }
        if (
          skill.score !== null &&
          !(typeof skill.score === 'number' && skill.score >= 0 && skill.score <= 1)
        ) {
          errors.push(`${path}.score: expected null or a number between 0 and 1`);
        }
        if (skill.band !== null && !SKILL_BANDS.includes(skill.band)) {
          errors.push(`${path}.band: invalid value ${JSON.stringify(skill.band)}`);
        }
      }
    } else {
      errors.push('skills: expected an object');
    }
  }

  // words
  if ('words' in profile) {
    if (isPlainObject(profile.words)) {
      for (const [lemma, entry] of Object.entries(profile.words)) {
        const path = `words.${lemma}`;
        if (!isPlainObject(entry)) {
          errors.push(`${path}: expected an object`);
          continue;
        }
        if (!WORD_STATUSES.includes(entry.status)) {
          errors.push(`${path}.status: invalid value ${JSON.stringify(entry.status)}`);
        }
        if (!WORD_SOURCES.includes(entry.source)) {
          errors.push(`${path}.source: invalid value ${JSON.stringify(entry.source)}`);
        }
        if (entry.he !== null && typeof entry.he !== 'string') {
          errors.push(`${path}.he: expected a string or null`);
        }
        if (typeof entry.taps !== 'number') {
          errors.push(`${path}.taps: expected a number`);
        }
        if (!isParseableDateString(entry.firstSeen)) {
          errors.push(`${path}.firstSeen: expected a parseable date string`);
        }
        if (!isParseableDateString(entry.lastSeen)) {
          errors.push(`${path}.lastSeen: expected a parseable date string`);
        }
        if ('strikes' in entry) {
          if (!(Number.isInteger(entry.strikes) && entry.strikes >= 0)) {
            errors.push(`${path}.strikes: expected a non-negative integer`);
          }
        }
        if ('needsReview' in entry) {
          if (typeof entry.needsReview !== 'boolean') {
            errors.push(`${path}.needsReview: expected a boolean`);
          }
        }
        if ('lastQuizAt' in entry) {
          if (!isParseableDateString(entry.lastQuizAt)) {
            errors.push(`${path}.lastQuizAt: expected a parseable date string`);
          }
        }
        if ('lastStrikeSession' in entry) {
          if (typeof entry.lastStrikeSession !== 'string') {
            errors.push(`${path}.lastStrikeSession: expected a string`);
          }
        }
        if ('quizRight' in entry) {
          if (!(Number.isInteger(entry.quizRight) && entry.quizRight >= 0)) {
            errors.push(`${path}.quizRight: expected a non-negative integer`);
          }
        }
        if ('quizWrong' in entry) {
          if (!(Number.isInteger(entry.quizWrong) && entry.quizWrong >= 0)) {
            errors.push(`${path}.quizWrong: expected a non-negative integer`);
          }
        }
      }
    } else {
      errors.push('words: expected an object');
    }
  }

  // placement
  if ('placement' in profile) {
    if (isPlainObject(profile.placement)) {
      if (typeof profile.placement.completed !== 'boolean') {
        errors.push('placement.completed: expected a boolean');
      }
    } else {
      errors.push('placement: expected an object');
    }
  }

  // story
  if ('story' in profile) {
    if (isPlainObject(profile.story)) {
      if (!Array.isArray(profile.story.chapters)) {
        errors.push('story.chapters: expected an array');
      }
      if (typeof profile.story.summarySoFar !== 'string') {
        errors.push('story.summarySoFar: expected a string');
      }
      if (typeof profile.story.cliffhanger !== 'string') {
        errors.push('story.cliffhanger: expected a string');
      }
      if ('checkLog' in profile.story && !Array.isArray(profile.story.checkLog)) {
        errors.push('story.checkLog: expected an array');
      }
    } else {
      errors.push('story: expected an object');
    }
  }

  // meta
  if ('meta' in profile) {
    if (isPlainObject(profile.meta)) {
      if (!isParseableDateString(profile.meta.createdAt)) {
        errors.push('meta.createdAt: expected a parseable date string');
      }
      if (!isParseableDateString(profile.meta.updatedAt)) {
        errors.push('meta.updatedAt: expected a parseable date string');
      }
    } else {
      errors.push('meta: expected an object');
    }
  }

  return { ok: errors.length === 0, errors };
}

export function applyWordTap(profile, { lemma, he = null, context = null, now = new Date().toISOString() }) {
  const k = String(lemma).trim().toLowerCase();
  if (k === '') {
    throw new Error('lemma required');
  }

  const existing = profile.words[k];
  if (!existing) {
    profile.words[k] = {
      status: 'learning',
      source: 'tap',
      he: he ?? null,
      taps: 1,
      firstSeen: now,
      lastSeen: now,
    };
    if (typeof context === 'string' && context.trim() !== '') {
      profile.words[k].context = context.slice(0, 200);
    }
  } else {
    existing.taps += 1;
    existing.lastSeen = now;
    if ((existing.he === null || existing.he === undefined) && he != null) {
      existing.he = he;
    }
    if (existing.status === 'known') {
      existing.needsReview = true;
    }
  }

  return profile;
}

// Rewrite every word key to the lemma we actually have a clip for, merging the
// duplicates that creates ("feel" and "feels" become one entry).
//
// MUST BE IDEMPOTENT: it runs on every profile load, so running it twice has to
// change nothing. A key we cannot resolve is left exactly as it is and never
// dropped -- losing a word she collected would be far worse than a silent button.
export function migrateWordKeys(profile, allowedSet) {
  if (!profile || !isPlainObject(profile.words)) return profile;

  const merged = {};
  for (const key of Object.keys(profile.words).sort()) {
    const entry = profile.words[key];
    if (!isPlainObject(entry)) {
      merged[key] = entry;
      continue;
    }

    const lemma = resolveLemma(key, allowedSet) || key;
    const existing = merged[lemma];

    if (!existing) {
      merged[lemma] = { ...entry };
      continue;
    }

    existing.taps = (existing.taps || 0) + (entry.taps || 0);
    if (entry.status === 'known') existing.status = 'known';
    if (existing.he === null || existing.he === undefined) {
      if (entry.he !== null && entry.he !== undefined) existing.he = entry.he;
    }
    if (typeof existing.context !== 'string' || existing.context === '') {
      if (typeof entry.context === 'string' && entry.context !== '') existing.context = entry.context;
    }
    if (isParseableDateString(entry.firstSeen)) {
      if (!isParseableDateString(existing.firstSeen) || Date.parse(entry.firstSeen) < Date.parse(existing.firstSeen)) {
        existing.firstSeen = entry.firstSeen;
      }
    }
    if (isParseableDateString(entry.lastSeen)) {
      if (!isParseableDateString(existing.lastSeen) || Date.parse(entry.lastSeen) > Date.parse(existing.lastSeen)) {
        existing.lastSeen = entry.lastSeen;
      }
    }

    // Phase 3 / QZ-14. Merge the six quiz keys. Treat an absent key as its
    // documented default for the purpose of the computation, but never add a
    // key that neither side carried.
    if ('strikes' in existing || 'strikes' in entry) {
      existing.strikes = Math.max(existing.strikes ?? 0, entry.strikes ?? 0);
    }
    if ('needsReview' in existing || 'needsReview' in entry) {
      existing.needsReview = Boolean(existing.needsReview) || Boolean(entry.needsReview);
    }
    if ('quizRight' in existing || 'quizRight' in entry) {
      existing.quizRight = (existing.quizRight ?? 0) + (entry.quizRight ?? 0);
    }
    if ('quizWrong' in existing || 'quizWrong' in entry) {
      existing.quizWrong = (existing.quizWrong ?? 0) + (entry.quizWrong ?? 0);
    }
    // lastStrikeSession's decision depends on BOTH sides' lastQuizAt, so it
    // must be computed before existing.lastQuizAt is overwritten below.
    if ('lastQuizAt' in existing || 'lastQuizAt' in entry) {
      const existingQuizAtRaw = existing.lastQuizAt;
      const entryQuizAtRaw = entry.lastQuizAt;
      const existingQuizAtOk = isParseableDateString(existingQuizAtRaw);
      const entryQuizAtOk = isParseableDateString(entryQuizAtRaw);

      if ('lastStrikeSession' in existing || 'lastStrikeSession' in entry) {
        let entryWins;
        if (entryQuizAtOk && existingQuizAtOk) {
          entryWins = Date.parse(entryQuizAtRaw) > Date.parse(existingQuizAtRaw);
        } else if (entryQuizAtOk) {
          entryWins = true;
        } else if (existingQuizAtOk) {
          entryWins = false;
        } else {
          entryWins = false; // neither side has a parseable lastQuizAt: keep existing's own value
        }

        if (entryWins) {
          if ('lastStrikeSession' in entry) {
            existing.lastStrikeSession = entry.lastStrikeSession;
          } else {
            delete existing.lastStrikeSession;
          }
        }
        // else: existing's own lastStrikeSession value stands, untouched.
      }

      if (entryQuizAtOk && (!existingQuizAtOk || Date.parse(entryQuizAtRaw) > Date.parse(existingQuizAtRaw))) {
        existing.lastQuizAt = entryQuizAtRaw;
      }
    }
  }

  profile.words = merged;
  return profile;
}

export function setLearner(profile, { heroineName, petName, now = new Date().toISOString() }) {
  if (heroineName !== undefined) {
    const v = String(heroineName).trim();
    if (v === '') {
      throw new Error('name required');
    }
    if (v.length > 24) {
      throw new Error('name too long');
    }
    profile.learner.heroineName = v;
  }
  if (petName !== undefined) {
    const v = String(petName).trim();
    if (v === '') {
      throw new Error('name required');
    }
    if (v.length > 24) {
      throw new Error('name too long');
    }
    profile.learner.petName = v;
  }

  return profile;
}

export function logCheck(profile, { chapter, questionId, chosenIndex, correctIndex, now = new Date().toISOString() }) {
  if (!Array.isArray(profile.story.checkLog)) {
    profile.story.checkLog = [];
  }
  profile.story.checkLog.push({
    chapter,
    questionId,
    chosenIndex,
    correctIndex,
    correct: chosenIndex === correctIndex,
    at: now,
  });

  return profile;
}

export function markWordKnown(profile, { lemma, source, he = null, now = new Date().toISOString() }) {
  const k = String(lemma).trim().toLowerCase();
  if (k === '') {
    throw new Error('lemma required');
  }
  if (!WORD_SOURCES.includes(source)) {
    throw new Error('invalid source');
  }

  const existing = profile.words[k];
  if (!existing) {
    profile.words[k] = {
      status: 'known',
      source,
      he: he ?? null,
      taps: 0,
      firstSeen: now,
      lastSeen: now,
    };
  } else {
    existing.status = 'known';
    existing.lastSeen = now;
    if ((existing.he === null || existing.he === undefined) && he != null) {
      existing.he = he;
    }
    delete existing.strikes;
    delete existing.needsReview;
    delete existing.lastStrikeSession;
  }

  return profile;
}

// Phase 3 / QZ-12. The strike state machine: a correct answer clears the strike
// streak (and never promotes a word to "known" -- promotion happens elsewhere),
// a wrong answer strikes once per sessionId and demotes at 3, and a repeated
// wrong answer inside the same session is counted but does not strike again.
export function applyQuizAnswer(profile, { lemma, correct, sessionId, now = new Date().toISOString() }) {
  if (typeof lemma !== 'string' || lemma.trim() === '') {
    throw new Error('lemma required');
  }
  if (typeof sessionId !== 'string' || sessionId.trim() === '' || sessionId.length > 64) {
    throw new Error('session required');
  }
  if (correct !== true && correct !== false) {
    throw new Error('answer required');
  }

  const k = String(lemma).trim().toLowerCase();
  const entry = profile.words[k];
  if (!entry) {
    throw new Error('unknown word');
  }

  if (correct) {
    entry.strikes = 0;
    entry.needsReview = false;
    delete entry.lastStrikeSession;
    entry.lastQuizAt = now;
    entry.quizRight = (entry.quizRight ?? 0) + 1;
    return profile;
  }

  entry.needsReview = false;
  entry.lastQuizAt = now;
  entry.quizWrong = (entry.quizWrong ?? 0) + 1;

  const sameSession = entry.lastStrikeSession === sessionId;
  if (sameSession) {
    return profile;
  }

  const resultingCount = (entry.strikes ?? 0) + 1;
  if (resultingCount >= 3) {
    entry.strikes = 0;
    if (entry.status === 'known') entry.status = 'learning';
    entry.lastStrikeSession = sessionId;
  } else {
    entry.strikes = resultingCount;
    entry.lastStrikeSession = sessionId;
  }

  return profile;
}
