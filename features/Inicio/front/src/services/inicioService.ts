import {
  getHeadlines,
  getEducationalNews,
  getQuiz,
} from '../api/iaNoticiasClient';
import type { NewsPreview, EducationalNews, NewsQuiz } from '../types/inicio.types';

export type { NewsPreview, EducationalNews, NewsQuiz };

export async function loadHeadlines(token: string): Promise<NewsPreview[]> {
  console.log('[iaNoticias FRONT] Service: loadHeadlines, token=', !!token);
  if (!token?.trim()) throw new Error('Token requerido');
  return getHeadlines(token.trim());
}

export async function loadEducationalNews(
  newsId: string,
  token: string,
): Promise<EducationalNews> {
  console.log(
    '[iaNoticias FRONT] Service: loadEducationalNews newsId=',
    newsId?.slice(0, 50),
    'token=',
    !!token,
  );
  if (!newsId?.trim()) throw new Error('newsId requerido');
  if (!token?.trim()) throw new Error('Token requerido');
  return getEducationalNews(newsId.trim(), token.trim());
}

export async function loadQuiz(
  newsId: string,
  token: string,
): Promise<NewsQuiz> {
  if (!newsId?.trim()) throw new Error('newsId requerido');
  if (!token?.trim()) throw new Error('Token requerido');
  return getQuiz(newsId.trim(), token.trim());
}
