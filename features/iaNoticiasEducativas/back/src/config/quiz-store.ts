import type { NewsQuiz } from '../domain/iaNoticiasEducativas.types';

const MAX_QUIZZES = 50;

/** Store de quizzes pre-generados. El scheduler los rellena cada hora. */
const quizStore = new Map<string, NewsQuiz>();

export function getQuiz(newsId: string): NewsQuiz | null {
  return quizStore.get(newsId.trim()) ?? null;
}

export function setQuiz(newsId: string, quiz: NewsQuiz): void {
  const trimmed = newsId.trim();
  if (quizStore.size >= MAX_QUIZZES) {
    const firstKey = quizStore.keys().next().value;
    if (firstKey != null) quizStore.delete(firstKey);
  }
  quizStore.set(trimmed, quiz);
}

export function hasQuiz(newsId: string): boolean {
  return quizStore.has(newsId.trim());
}
