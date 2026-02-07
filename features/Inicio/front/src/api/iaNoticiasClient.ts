import { Platform } from 'react-native';
import type { NewsPreview, EducationalNews } from '../types/inicio.types';

function getBaseUrl() {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/ia-noticias';
  if (Platform.OS === 'ios' || Platform.OS === 'web')
    return 'http://localhost:3000/api/ia-noticias';
  return 'http://localhost:3000/api/ia-noticias';
}

export async function getHeadlines(token: string): Promise<NewsPreview[]> {
  const url = `${getBaseUrl()}/headlines`;
  console.log('[iaNoticias FRONT] 1. Client: getHeadlines', url);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(
    '[iaNoticias FRONT] 2. Client: getHeadlines response',
    response.status,
  );
  if (!response.ok) {
    throw new Error('Error al obtener noticias');
  }

  const data = (await response.json()) as NewsPreview[];
  console.log(
    '[iaNoticias FRONT] 3. Client: getHeadlines OK, noticias=',
    data?.length ?? 0,
  );
  return data;
}

export async function getEducationalNews(
  newsId: string,
  token: string,
): Promise<EducationalNews> {
  const url = `${getBaseUrl()}/explain`;
  console.log(
    '[iaNoticias FRONT] 1. Client: getEducationalNews',
    url,
    'newsId=',
    newsId?.slice(0, 50),
  );
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newsId }),
  });

  console.log(
    '[iaNoticias FRONT] 2. Client: getEducationalNews response',
    response.status,
  );
  if (!response.ok) {
    const errText = await response.text();
    console.log(
      '[iaNoticias FRONT] Client: getEducationalNews ERROR body=',
      errText?.slice(0, 100),
    );
    throw new Error('Error al procesar la noticia');
  }

  const data = (await response.json()) as EducationalNews;
  console.log('[iaNoticias FRONT] 3. Client: getEducationalNews OK');
  return data;
}
