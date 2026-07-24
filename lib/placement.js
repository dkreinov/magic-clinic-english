export function scoreTask1(bank, answers) {
  const items = bank.task1;
  const byId = new Map(items.map((item) => [item.id, item]));

  let total = 0;
  let correct = 0;
  const knownLemmas = [];

  for (const answer of answers ?? []) {
    const item = byId.get(answer.id);
    if (!item) continue;
    total += 1;
    if (answer.choice === item.correctIndex) {
      correct += 1;
      knownLemmas.push({ lemma: item.lemma, he: item.he });
    }
  }

  return { correct, total, score: total ? correct / total : 0, knownLemmas };
}

export function scoreTask2(bank, answers) {
  const questions = bank.task2.flatMap((text) => text.questions);
  const byId = new Map(questions.map((question) => [question.id, question]));

  let total = 0;
  let correct = 0;

  for (const answer of answers ?? []) {
    const question = byId.get(answer.id);
    if (!question) continue;
    total += 1;
    if (answer.choice === question.correctIndex) {
      correct += 1;
    }
  }

  return { correct, total, score: total ? correct / total : 0 };
}

export function bandForScore(s) {
  if (s < 0.5) return 'preA1';
  if (s < 0.8) return 'A1';
  return 'A2';
}

export function clientView(bank) {
  const task1 = bank.task1.map((item) => {
    if (item.direction === 'audio-to-picture') {
      return { id: item.id, direction: item.direction, audio: item.audio, options: item.options };
    }
    return { id: item.id, direction: item.direction, emoji: item.emoji, options: item.options };
  });

  const task2 = bank.task2.map((text) => ({
    id: text.id,
    title: text.title,
    text: text.text,
    questions: text.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: question.options,
    })),
  }));

  return { task1, task2 };
}
