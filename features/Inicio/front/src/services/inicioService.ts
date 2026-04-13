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

export type InicioLoadOptions = {
  userId: string;
  forceRefresh?: boolean;
};

/** Headlines: cache 2 días por usuario. Pull-to-refresh fuerza API + bypass caché servidor. */
export async function loadHeadlines(
  token: string,
  options: InicioLoadOptions,
): Promise<NewsPreview[]> {
  if (!token?.trim()) throw new Error('Token requerido');
  const uid = options.userId?.trim();
  if (!uid) throw new Error('userId requerido');

  if (!options.forceRefresh) {
    const cached = await getHeadlinesCached(uid);
    if (cached != null && cached.length > 0) {
      return cached;
    }
  }
  const data = await getHeadlines(token.trim(), {
    forceRefresh: options.forceRefresh,
  });
  await setHeadlinesCached(uid, data);
  return data;
}

/** Educational news: cache 2 días por usuario y noticia. */
export async function loadEducationalNews(
  newsId: string,
  token: string,
  userId: string,
): Promise<EducationalNews> {
  if (!newsId?.trim()) throw new Error('newsId requerido');
  if (!token?.trim()) throw new Error('Token requerido');
  const uid = userId?.trim();
  if (!uid) throw new Error('userId requerido');
  const id = newsId.trim();
  const cached = await getEducationalNewsCached(uid, id);
  if (cached != null) {
    return cached;
  }
  const data = await getEducationalNews(id, token.trim());
  await setEducationalNewsCached(uid, id, data);
  return data;
}

/** Quiz: cache 7 días por usuario y noticia. */
export async function loadQuiz(
  newsId: string,
  token: string,
  userId: string,
): Promise<NewsQuiz> {
  if (!newsId?.trim()) throw new Error('newsId requerido');
  if (!token?.trim()) throw new Error('Token requerido');
  const uid = userId?.trim();
  if (!uid) throw new Error('userId requerido');
  const id = newsId.trim();
  const cached = await getQuizCached(uid, id);
  if (cached != null) {
    return cached;
  }
  const data = await getQuiz(id, token.trim());
  await setQuizCached(uid, id, data);
  return data;
}
