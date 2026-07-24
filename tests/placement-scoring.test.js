import { test } from 'node:test';
import assert from 'node:assert';
import { scoreTask1, scoreTask2, bandForScore, clientView } from '../lib/placement.js';

const fixtureBank = {
  task1: [
    {
      id: 't1-a',
      direction: 'audio-to-picture',
      lemma: 'dog',
      he: 'כלב',
      emoji: '🐕',
      options: ['🐕', '🐈'],
      correctIndex: 0,
      section: 'preBandI',
      audio: 'audio/word-dog.mp3',
    },
    {
      id: 't1-b',
      direction: 'picture-to-word',
      lemma: 'cat',
      he: 'חתול',
      emoji: '🐈',
      options: ['dog', 'cat'],
      correctIndex: 1,
      section: 'bandI',
    },
  ],
  task2: [
    {
      id: 't2-x',
      title: 'text one',
      text: 'some text',
      questions: [
        { id: 't2-x-q1', prompt: 'p1', options: ['a', 'b'], correctIndex: 0 },
        { id: 't2-x-q2', prompt: 'p2', options: ['a', 'b'], correctIndex: 1 },
      ],
    },
    {
      id: 't2-y',
      title: 'text two',
      text: 'more text',
      questions: [{ id: 't2-y-q1', prompt: 'p3', options: ['a', 'b'], correctIndex: 0 }],
    },
  ],
};

test('scoreTask1: correct/total/score/knownLemmas', () => {
  const r = scoreTask1(fixtureBank, [
    { id: 't1-a', choice: 0 },
    { id: 't1-b', choice: 0 },
  ]);
  assert.strictEqual(r.total, 2);
  assert.strictEqual(r.correct, 1);
  assert.strictEqual(r.score, 0.5);
  assert.deepStrictEqual(r.knownLemmas, [{ lemma: 'dog', he: 'כלב' }]);
});

test('scoreTask1: unknown ids are ignored', () => {
  const r = scoreTask1(fixtureBank, [
    { id: 't1-a', choice: 0 },
    { id: 'zzz', choice: 0 },
  ]);
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.correct, 1);
});

test('scoreTask1: empty answers -> total 0, score 0', () => {
  const r = scoreTask1(fixtureBank, []);
  assert.strictEqual(r.total, 0);
  assert.strictEqual(r.correct, 0);
  assert.strictEqual(r.score, 0);
  assert.deepStrictEqual(r.knownLemmas, []);
});

test('scoreTask2: matches across flattened questions from two texts', () => {
  const r = scoreTask2(fixtureBank, [
    { id: 't2-x-q1', choice: 0 },
    { id: 't2-x-q2', choice: 0 },
    { id: 't2-y-q1', choice: 0 },
  ]);
  assert.strictEqual(r.total, 3);
  assert.strictEqual(r.correct, 2);
  assert.strictEqual(r.score, 2 / 3);
});

test('bandForScore boundaries', () => {
  assert.strictEqual(bandForScore(0), 'preA1');
  assert.strictEqual(bandForScore(0.4), 'preA1');
  assert.strictEqual(bandForScore(0.5), 'A1');
  assert.strictEqual(bandForScore(0.79), 'A1');
  assert.strictEqual(bandForScore(0.8), 'A2');
  assert.strictEqual(bandForScore(1), 'A2');
});

test('clientView strips answer-revealing fields', () => {
  const view = clientView(fixtureBank);
  const json = JSON.stringify(view);
  assert.ok(!json.includes('"correctIndex"'));
  assert.ok(!json.includes('"lemma"'));

  const a2p = view.task1.find((item) => item.direction === 'audio-to-picture');
  assert.ok(a2p);
  assert.ok(!('emoji' in a2p));
  assert.ok(!('he' in a2p));
  assert.ok(!('section' in a2p));

  const p2w = view.task1.find((item) => item.direction === 'picture-to-word');
  assert.ok(p2w);
  assert.ok(!('audio' in p2w));
  assert.ok(!('he' in p2w));
  assert.ok(!('section' in p2w));
});
