import { getHeadlines, getEducationalNews } from '../api/iaNoticiasClient';
import type { NewsPreview, EducationalNews } from '../types/inicio.types';

export type { NewsPreview, EducationalNews };

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
