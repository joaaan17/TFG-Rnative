import type { NewsProviderPort } from '../../domain/ports';
import type { RawNews } from '../../domain/iaNoticiasEducativas.types';

/** Respuesta de NewsAPI v2 top-headlines */
interface NewsAPIArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults?: number;
  articles: NewsAPIArticle[];
}

const CACHE_TTL_MS = 2 * 24 * 60 * 60 * 1000; // 2 días
let cache: { raw: RawNews[]; ts: number } | null = null;

function toRawNews(article: NewsAPIArticle, index: number): RawNews {
  const id = article.url || `news-${index}`;
  const content = [
    article.title,
    article.description || '',
    article.content || '',
  ]
    .filter(Boolean)
    .join('\n\n');
  return {
    id,
    title: article.title || 'Sin título',
    content: content.trim() || 'Contenido no disponible.',
    imageUrl: article.urlToImage || undefined,
    source: article.source?.name || 'Desconocido',
    publishedAt: article.publishedAt || new Date().toISOString(),
  };
}

/**
 * Implementación del NewsProviderPort usando NewsAPI.
 * Cachea resultados para reducir llamadas.
 */
export class NewsAPIProvider implements NewsProviderPort {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = 'https://newsapi.org/v2',
  ) {}

  async getHeadlines(): Promise<RawNews[]> {
    if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
      console.log(
        '[iaNoticias] 3. NewsAPIProvider: getHeadlines desde CACHE (',
        cache.raw.length,
        'noticias)',
      );
      return cache.raw;
    }

    // Query más amplia posible: endpoint everything, término inglés, sin idioma ni fechas
    // (language=es y from/to restrictivos devuelven 0 según docs NewsAPI)
    const urlsToTry = [
      `${this.baseUrl}/everything?q=stock+market&pageSize=2&sortBy=publishedAt&apiKey=${this.apiKey}`,
      `${this.baseUrl}/everything?q=economy&pageSize=2&sortBy=publishedAt&apiKey=${this.apiKey}`,
      `${this.baseUrl}/top-headlines?country=us&pageSize=2&apiKey=${this.apiKey}`,
    ];
    let data: NewsAPIResponse | null = null;
    for (const url of urlsToTry) {
      console.log(
        '[iaNoticias] 3. NewsAPIProvider: getHeadlines llamando a NewsAPI...',
      );
      const res = await fetch(url);
      data = (await res.json()) as NewsAPIResponse;
      console.log(
        '[iaNoticias] 4. NewsAPIProvider: NewsAPI status=',
        data?.status,
        'articles=',
        data?.articles?.length ?? 0,
      );
      if (
        data?.status === 'ok' &&
        Array.isArray(data?.articles) &&
        data.articles.length > 0
      ) {
        break;
      }
    }

    if (!data || data.status !== 'ok' || !Array.isArray(data.articles)) {
      console.log(
        '[iaNoticias] NewsAPIProvider: ERROR - status:',
        data?.status,
        'o sin articles',
      );
      throw new Error('Error al obtener noticias de NewsAPI');
    }

    const raw = data.articles
      .filter((a) => a.title)
      .map((a, i) => toRawNews(a, i));

    cache = { raw, ts: Date.now() };
    console.log(
      '[iaNoticias] 5. NewsAPIProvider: getHeadlines OK, mapeadas',
      raw.length,
      'noticias',
    );
    return raw;
  }

  async getNewsById(id: string): Promise<RawNews> {
    console.log(
      '[iaNoticias] 6. NewsAPIProvider: getNewsById id=',
      id?.slice(0, 60),
    );
    const headlines = await this.getHeadlines();
    const found = headlines.find((n) => n.id === id);
    if (found) {
      console.log(
        '[iaNoticias] 7. NewsAPIProvider: getNewsById encontrada:',
        found.title?.slice(0, 40),
      );
      return found;
    }

    // Fallback: la noticia ya no está en la lista actual (el servidor se reinició
    // o el caché expiró). Construimos un objeto mínimo usando la URL como contexto
    // para que la IA pueda generar el contenido educativo igualmente.
    console.log(
      '[iaNoticias] NewsAPIProvider: getNewsById NOT FOUND en caché, usando fallback con URL como contexto',
    );

    // Intentar extraer un título legible de la URL
    let titleFromUrl = id;
    try {
      const pathname = new URL(id).pathname;
      titleFromUrl = pathname
        .split('/')
        .filter(Boolean)
        .pop()
        ?.replace(/[-_]/g, ' ')
        ?.replace(/\.[^.]+$/, '') ?? id;
    } catch {
      // URL mal formada, usar el id tal cual
    }

    return {
      id,
      title: titleFromUrl,
      content: `Noticia financiera relacionada con: ${titleFromUrl}. URL original: ${id}`,
      imageUrl: undefined,
      source: 'Fuente externa',
      publishedAt: new Date().toISOString(),
    };
  }
}
