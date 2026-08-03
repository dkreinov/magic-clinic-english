// STEP 2.3: renderQuizCard learns four kinds. Every test is a flat top-level
// test() -- no describe blocks, no nesting.
//
// No raw Hebrew glyph appears in this file. Any assertion that needs to touch
// Hebrew compares against QUIZ_STRINGS, imported from the generated (pure-ASCII)
// source of truth, never typed by hand here.
import { test } from 'node:test';
import assert from 'node:assert';
import { renderQuizCard } from '../public/quiz.js';
import { QUIZ_STRINGS } from '../public/quiz-strings.js';

// A stand-in Hebrew prompt string. It does not need to BE Hebrew for these
// tests -- renderQuizCard only ever escapes and places it, it never inspects
// its script -- and using a plain placeholder keeps this file pure ASCII.
const PROMPT_HE = 'HE_PLACEHOLDER';

const CLOZE_ITEM = {
  sense: 'not heavy and easy to lift',
  sentence: 'The box was so ___ that she could lift it.',
  answer: 'light',
  distractors: ['big', 'small', 'wide', 'round', 'old', 'new'],
};
const CLOZE_OPTIONS = [CLOZE_ITEM.answer, ...CLOZE_ITEM.distractors.slice(0, 5)];
const HE_OPTIONS = ['light', 'big', 'small', 'wide', 'round'];

function clozeState(overrides = {}) {
  return {
    kind: 'cloze-pick',
    item: CLOZE_ITEM,
    options: CLOZE_OPTIONS,
    index: 0,
    total: 4,
    chosen: null,
    correct: null,
    demoted: false,
    hintShown: false,
    wasCandidate: false,
    ...overrides,
  };
}

function hePickState(overrides = {}) {
  return {
    kind: 'he-pick',
    item: null,
    options: HE_OPTIONS,
    index: 0,
    total: 4,
    chosen: null,
    correct: null,
    demoted: false,
    promptHe: PROMPT_HE,
    answer: 'light',
    ...overrides,
  };
}

function heTypeState(overrides = {}) {
  return {
    kind: 'he-type',
    item: null,
    index: 0,
    total: 4,
    chosen: null,
    correct: null,
    demoted: false,
    promptHe: PROMPT_HE,
    answer: 'light',
    retry: false,
    ...overrides,
  };
}

function listenTypeState(overrides = {}) {
  return {
    kind: 'listen-type',
    item: null,
    index: 0,
    total: 4,
    chosen: null,
    correct: null,
    demoted: false,
    sayLemma: 'light',
    answer: 'light',
    retry: false,
    ...overrides,
  };
}

function visibleText(html) {
  return html.replace(/<[^>]+>/g, ' ');
}

function extractInputTag(html) {
  const m = html.match(/<input[^>]*>/);
  assert.ok(m, 'expected an <input> tag');
  return m[0];
}

const ALL_KIND_STATES = [
  ['cloze-pick', clozeState()],
  ['he-pick', hePickState()],
  ['he-type', heTypeState()],
  ['listen-type', listenTypeState()],
];

// 1. Each of the four kinds renders exactly ONE quiz-prompt node, non-empty after trim.
test('each of the four kinds renders exactly one non-empty quiz-prompt node', () => {
  for (const [kind, state] of ALL_KIND_STATES) {
    const html = renderQuizCard(state);
    const matches = [...html.matchAll(/<p class="quiz-prompt">([\s\S]*?)<\/p>/g)];
    assert.strictEqual(matches.length, 1, `${kind} must render exactly one quiz-prompt node`);
    assert.notStrictEqual(matches[0][1].trim(), '', `${kind} quiz-prompt must be non-empty`);
  }
});

// 2. he-pick and he-type render promptHe inside a node carrying dir="rtl".
test('he-pick and he-type render promptHe inside a dir="rtl" node', () => {
  const heHtml = renderQuizCard(hePickState());
  const heMatch = heHtml.match(/<p class="quiz-he" dir="rtl"[^>]*>([\s\S]*?)<\/p>/);
  assert.ok(heMatch, 'he-pick must render a dir="rtl" quiz-he node');
  assert.strictEqual(heMatch[1], PROMPT_HE);

  const typeHtml = renderQuizCard(heTypeState());
  const typeMatch = typeHtml.match(/<p class="quiz-he" dir="rtl"[^>]*>([\s\S]*?)<\/p>/);
  assert.ok(typeMatch, 'he-type must render a dir="rtl" quiz-he node');
  assert.strictEqual(typeMatch[1], PROMPT_HE);
});

// 3. WK-3 attribute-by-attribute on BOTH typed kinds -- eight separate assertions each.
test('WK-3: he-type input carries all eight frozen attributes plus a q- name', () => {
  const input = extractInputTag(renderQuizCard(heTypeState()));
  assert.ok(input.includes('type="text"'), 'type="text" missing');
  assert.ok(input.includes('dir="ltr"'), 'dir="ltr" missing');
  assert.ok(input.includes('lang="en"'), 'lang="en" missing');
  assert.ok(input.includes('inputmode="text"'), 'inputmode="text" missing');
  assert.ok(input.includes('autocomplete="off"'), 'autocomplete="off" missing');
  assert.ok(input.includes('autocorrect="off"'), 'autocorrect="off" missing');
  assert.ok(input.includes('autocapitalize="off"'), 'autocapitalize="off" missing');
  assert.ok(input.includes('spellcheck="false"'), 'spellcheck="false" missing');
  const nameMatch = input.match(/name="(q-[^"]*)"/);
  assert.ok(nameMatch, 'name="q-..." missing or does not match pattern');
});

test('WK-3: listen-type input carries all eight frozen attributes plus a q- name', () => {
  const input = extractInputTag(renderQuizCard(listenTypeState()));
  assert.ok(input.includes('type="text"'), 'type="text" missing');
  assert.ok(input.includes('dir="ltr"'), 'dir="ltr" missing');
  assert.ok(input.includes('lang="en"'), 'lang="en" missing');
  assert.ok(input.includes('inputmode="text"'), 'inputmode="text" missing');
  assert.ok(input.includes('autocomplete="off"'), 'autocomplete="off" missing');
  assert.ok(input.includes('autocorrect="off"'), 'autocorrect="off" missing');
  assert.ok(input.includes('autocapitalize="off"'), 'autocapitalize="off" missing');
  assert.ok(input.includes('spellcheck="false"'), 'spellcheck="false" missing');
  const nameMatch = input.match(/name="(q-[^"]*)"/);
  assert.ok(nameMatch, 'name="q-..." missing or does not match pattern');
});

// 4. Two renders of the same question with no inputName supplied produce DIFFERENT names.
test('two renders with no inputName supplied produce different random names', () => {
  const inputA = extractInputTag(renderQuizCard(heTypeState()));
  const inputB = extractInputTag(renderQuizCard(heTypeState()));
  const nameA = inputA.match(/name="(q-[^"]*)"/)[1];
  const nameB = inputB.match(/name="(q-[^"]*)"/)[1];
  assert.notStrictEqual(nameA, nameB);
});

// 5. listen-type renders a data-say equal to sayLemma, and its body contains no
//    occurrence of the answer word before resolution.
test('listen-type: data-say equals sayLemma, no answer word in visible text before resolution', () => {
  const html = renderQuizCard(listenTypeState());
  const sayMatch = html.match(/data-say="([^"]*)"/);
  assert.ok(sayMatch, 'expected a data-say attribute');
  assert.strictEqual(sayMatch[1], 'light');
  assert.ok(!visibleText(html).includes('light'), 'answer word leaked into visible text before resolution');
});

// 6. retry: true renders the near-miss node, and the card does NOT contain the
//    answer anywhere (checked against the visible text, since the audio button's
//    data-say attribute on listen-type is not something she can read).
test('retry renders the near-miss node and hides the answer from visible text', () => {
  const html = renderQuizCard(heTypeState({ retry: true, typed: 'ligth', chosen: null, correct: null }));
  assert.ok(html.includes('class="quiz-nearmiss"'), 'expected a quiz-nearmiss node on retry');
  assert.ok(!visibleText(html).includes('light'), 'the correct answer must not appear on a retry card');
});

// 7. retry: true keeps her text in value, and a typed " and < are HTML-escaped.
test('retry keeps her typed text in value, escaping quotes and angle brackets', () => {
  const html = renderQuizCard(heTypeState({ retry: true, typed: 'a"b<c', chosen: null, correct: null }));
  const input = extractInputTag(html);
  assert.ok(input.includes('value="a&quot;b&lt;c"'), `typed value not escaped correctly: ${input}`);
});

// 8. retry: true renders NO quiz-next button and NO quiz-feedback node.
test('retry renders no quiz-next button and no quiz-feedback node', () => {
  const html = renderQuizCard(heTypeState({ retry: true, typed: 'ligth', chosen: null, correct: null }));
  assert.ok(!html.includes('data-action="quiz-next"'), 'quiz-next must not render on retry');
  assert.ok(!html.includes('class="quiz-feedback"'), 'quiz-feedback must not render on retry');
});

// 9. A resolved typed-wrong card renders the existing wrong-answer feedback with
//    answer, and the input is disabled.
test('resolved typed-wrong card renders feedback with the answer and a disabled input', () => {
  const html = renderQuizCard(
    heTypeState({ retry: false, typed: 'wrongword', chosen: 'wrongword', correct: false })
  );
  const feedbackMatch = html.match(/<p class="quiz-feedback">([\s\S]*?)<\/p>/);
  assert.ok(feedbackMatch, 'expected a quiz-feedback node on a resolved wrong answer');
  assert.ok(feedbackMatch[0].includes('light'), 'feedback must include the correct answer');
  const input = extractInputTag(html);
  assert.ok(input.includes('disabled'), 'input must be disabled once resolved');
});

// 10. Node ORDER on every kind: quiz-progress < quiz-prompt < body < answer
//     surface < feedback < demoted < next, asserted with indexOf.
test('node order holds on every kind: progress < prompt < body < surface < feedback < demoted < next', () => {
  const cases = [
    {
      kind: 'cloze-pick',
      state: clozeState({ chosen: 'big', correct: false, demoted: true, wasCandidate: false }),
      bodyMarker: 'class="quiz-sentence"',
      surfaceMarker: 'class="quiz-options"',
    },
    {
      kind: 'he-pick',
      state: hePickState({ chosen: 'big', correct: false, demoted: true }),
      bodyMarker: 'class="quiz-he"',
      surfaceMarker: 'class="quiz-options"',
    },
    {
      kind: 'he-type',
      state: heTypeState({ typed: 'wrong', chosen: 'wrong', correct: false, demoted: true }),
      bodyMarker: 'class="quiz-he"',
      surfaceMarker: 'class="quiz-typed"',
    },
    {
      kind: 'listen-type',
      state: listenTypeState({ typed: 'wrong', chosen: 'wrong', correct: false, demoted: true }),
      bodyMarker: 'class="quiz-listen"',
      surfaceMarker: 'class="quiz-typed"',
    },
  ];

  for (const { kind, state, bodyMarker, surfaceMarker } of cases) {
    const html = renderQuizCard(state);
    const progressIdx = html.indexOf('class="quiz-progress"');
    const promptIdx = html.indexOf('class="quiz-prompt"');
    const bodyIdx = html.indexOf(bodyMarker);
    const surfaceIdx = html.indexOf(surfaceMarker);
    const feedbackIdx = html.indexOf('class="quiz-feedback"');
    const demotedIdx = html.indexOf('class="quiz-demoted"');
    const nextIdx = html.indexOf('data-action="quiz-next"');

    assert.ok(progressIdx >= 0, `${kind}: missing quiz-progress`);
    assert.ok(promptIdx >= 0, `${kind}: missing quiz-prompt`);
    assert.ok(bodyIdx >= 0, `${kind}: missing body marker ${bodyMarker}`);
    assert.ok(surfaceIdx >= 0, `${kind}: missing surface marker ${surfaceMarker}`);
    assert.ok(feedbackIdx >= 0, `${kind}: missing quiz-feedback`);
    assert.ok(demotedIdx >= 0, `${kind}: missing quiz-demoted`);
    assert.ok(nextIdx >= 0, `${kind}: missing quiz-next`);

    assert.ok(progressIdx < promptIdx, `${kind}: progress must precede prompt`);
    assert.ok(promptIdx < bodyIdx, `${kind}: prompt must precede body`);
    assert.ok(bodyIdx < surfaceIdx, `${kind}: body must precede answer surface`);
    assert.ok(surfaceIdx < feedbackIdx, `${kind}: answer surface must precede feedback`);
    assert.ok(feedbackIdx < demotedIdx, `${kind}: feedback must precede demoted`);
    assert.ok(demotedIdx < nextIdx, `${kind}: demoted must precede next`);
  }
});

// 11. he-pick renders NO hint button and NO .quiz-sentence; he-type renders NO btn-say.
test('he-pick has no hint button or sentence; he-type has no speaker button', () => {
  const heHtml = renderQuizCard(hePickState());
  assert.ok(!heHtml.includes('quiz-hint-btn'), 'he-pick must not render a hint button');
  assert.ok(!heHtml.includes('data-action="quiz-hint"'), 'he-pick must not render a hint action');
  assert.ok(!heHtml.includes('class="quiz-sentence"'), 'he-pick must not render a sentence node');

  const typeHtml = renderQuizCard(heTypeState());
  assert.ok(!typeHtml.includes('btn-say'), 'he-type must not render a speaker button');
});

// 12. cloze-pick with today's state still renders the hint button and the sentence.
test('cloze-pick still renders the hint button and the sentence', () => {
  const html = renderQuizCard(clozeState());
  assert.ok(html.includes('quiz-hint-btn'), 'cloze-pick must still render the hint button');
  assert.ok(html.includes('class="quiz-sentence"'), 'cloze-pick must still render the sentence');
});

// 13. he-pick card's quiz-prompt node contains exactly the he-pick prompt,
//     not the he-type or listen-type prompts.
test('he-pick quiz-prompt contains he-pick prompt only', () => {
  const html = renderQuizCard(hePickState());
  const promptMatch = html.match(/<p class="quiz-prompt">([\s\S]*?)<\/p>/);
  assert.ok(promptMatch, 'he-pick must have a quiz-prompt node');
  assert.ok(promptMatch[1].includes(QUIZ_STRINGS.he_pick_prompt), 'he-pick quiz-prompt must contain he_pick_prompt');
  assert.ok(!promptMatch[1].includes(QUIZ_STRINGS.he_type_prompt), 'he-pick quiz-prompt must not contain he_type_prompt');
  assert.ok(!promptMatch[1].includes(QUIZ_STRINGS.listen_type_prompt), 'he-pick quiz-prompt must not contain listen_type_prompt');
});

// 14. he-type card's quiz-prompt node contains exactly the he-type prompt,
//     not the he-pick or listen-type prompts.
test('he-type quiz-prompt contains he-type prompt only', () => {
  const html = renderQuizCard(heTypeState());
  const promptMatch = html.match(/<p class="quiz-prompt">([\s\S]*?)<\/p>/);
  assert.ok(promptMatch, 'he-type must have a quiz-prompt node');
  assert.ok(promptMatch[1].includes(QUIZ_STRINGS.he_type_prompt), 'he-type quiz-prompt must contain he_type_prompt');
  assert.ok(!promptMatch[1].includes(QUIZ_STRINGS.he_pick_prompt), 'he-type quiz-prompt must not contain he_pick_prompt');
  assert.ok(!promptMatch[1].includes(QUIZ_STRINGS.listen_type_prompt), 'he-type quiz-prompt must not contain listen_type_prompt');
});

// 15. listen-type card's quiz-prompt node contains exactly the listen-type prompt,
//     not the he-pick or he-type prompts.
test('listen-type quiz-prompt contains listen-type prompt only', () => {
  const html = renderQuizCard(listenTypeState());
  const promptMatch = html.match(/<p class="quiz-prompt">([\s\S]*?)<\/p>/);
  assert.ok(promptMatch, 'listen-type must have a quiz-prompt node');
  assert.ok(promptMatch[1].includes(QUIZ_STRINGS.listen_type_prompt), 'listen-type quiz-prompt must contain listen_type_prompt');
  assert.ok(!promptMatch[1].includes(QUIZ_STRINGS.he_pick_prompt), 'listen-type quiz-prompt must not contain he_pick_prompt');
  assert.ok(!promptMatch[1].includes(QUIZ_STRINGS.he_type_prompt), 'listen-type quiz-prompt must not contain he_type_prompt');
});

// 16. Retry card contains the near-miss string.
test('retry card contains the near-miss string', () => {
  const html = renderQuizCard(heTypeState({ retry: true, typed: 'ligth', chosen: null, correct: null }));
  assert.ok(html.includes(QUIZ_STRINGS.near_miss), 'retry card must contain near_miss string');
});

// 17. he-type card's check button contains the check-button string.
test('he-type check button contains the check-button string', () => {
  const html = renderQuizCard(heTypeState());
  assert.ok(html.includes(QUIZ_STRINGS.check_button), 'he-type card must have check button with check_button string');
});
