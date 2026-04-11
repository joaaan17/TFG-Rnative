import {
  getHeadlines,
  getEducationalNews,
  getQuiz,
} from '../api/iaNoticiasClient';
import {
  getHeadlinesCached,
  setHeadlinesCached,
  getEducationalNewsCached,
  setEducationalNewsCached,
  getQuizCached,
  setQuizCached,
} from '../cache/inicioCache';
import type {
  NewsPreview,
  EducationalNews,
  NewsQuiz,
} from '../types/inicio.types';

export type { NewsPreview, EducationalNews, NewsQuiz };

/** Headlines: cache 2 días. Solo hace llamada si el cache está vacío o vencido. */
export async function loadHeadlines(
  token: string,
  options?: { forceRefresh?: boolean },
): Promise<NewsPreview[]> {
  if (!token?.trim()) throw new Error('Token requerido');
  if (!options?.forceRefresh) {
    const cached = await getHeadlinesCached();
    if (cached != null && cached.length > 0) {
      return cached;
    }
  }
  const data = await getHeadlines(token.trim());
  await setHeadlinesCached(data);
  return data;
}

/** Educational news: cache 2 días por newsId. Evita llamadas repetidas. */
export async function loadEducationalNews(
  newsId: string,
  token: string,
): Promise<EducationalNews> {
  if (!newsId?.trim()) throw new Error('newsId requerido');
  if (!token?.trim()) throw new Error('Token requerido');
  const id = newsId.trim();
  const cached = await getEducationalNewsCached(id);
  if (cached != null) {
    return cached;
  }
  const data = await getEducationalNews(id, token.trim());
  await setEducationalNewsCached(id, data);
  return data;
}

/** Quiz: cache 7 días por newsId. Reutiliza quiz sin volver a generar. */
export async function loadQuiz(
  newsId: string,
  token: string,
): Promise<NewsQuiz> {
  if (!newsId?.trim()) throw new Error('newsId requerido');
  if (!token?.trim()) throw new Error('Token requerido');
  const id = newsId.trim();
  const cached = await getQuizCached(id);
  if (cached != null) {
    return cached;
  }
  const data = await getQuiz(id, token.trim());
  await setQuizCached(id, data);
  return data;
}
