import type { NewsProviderPort } from '../../domain/ports';
import type { RawNews } from '../../domain/iaNoticiasEducativas.types';
import {
  readHeadlinesFromDisk,
  writeHeadlinesToDisk,
} from './headlines-disk-cache';

/** Tiempo entre refrescos desde NewsAPI (todos los usuarios ven las mismas noticias hasta entonces). */
function getHeadlinesTtlMs(): number {
  const hours = Number(process.env.NEWS_HEADLINES_TTL_HOURS);
  if (Number.isFinite(hours) && hours > 0) return hours * 60 * 60 * 1000;
  return 12 * 60 * 60 * 1000; // por defecto: cada 12 horas
}

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

/** Caché en memoria; el TTL coincide con el de disco (misma ventana para todos los clientes). */
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

  async getHeadlines(options?: { bypassCache?: boolean }): Promise<RawNews[]> {
    const ttlMs = getHeadlinesTtlMs();
    const now = Date.now();

    if (!options?.bypassCache && cache && now - cache.ts < ttlMs) {
      console.log(
        '[iaNoticias] 3. NewsAPIProvider: getHeadlines desde CACHE memoria (',
        cache.raw.length,
        'noticias)',
      );
      return cache.raw;
    }

    if (!options?.bypassCache) {
      const fromDisk = await readHeadlinesFromDisk();
      if (
        fromDisk &&
        fromDisk.raw.length > 0 &&
        now - fromDisk.ts < ttlMs
      ) {
        cache = { raw: fromDisk.raw, ts: fromDisk.ts };
        console.log(
          '[iaNoticias] 3b. NewsAPIProvider: getHeadlines desde CACHE disco (',
          fromDisk.raw.length,
          'noticias)',
        );
        return fromDisk.raw;
      }
    }

    // Una sola consulta determinista (evita que distintos usuarios/hitos en el tiempo
    // reciban el 2.º fallback distinto: economy vs top-headlines US).
    const primaryUrl = `${this.baseUrl}/everything?q=stock+market&pageSize=2&sortBy=publishedAt&apiKey=${this.apiKey}`;
    const fallbackUrl = `${this.baseUrl}/top-headlines?country=us&pageSize=2&apiKey=${this.apiKey}`;

    console.log('[iaNoticias] 3. NewsAPIProvider: getHeadlines llamando a NewsAPI...');
    let res = await fetch(primaryUrl);
    let data = (await res.json()) as NewsAPIResponse;
    console.log(
      '[iaNoticias] 4. NewsAPIProvider: NewsAPI primary status=',
      data?.status,
      'articles=',
      data?.articles?.length ?? 0,
    );

    if (
      data?.status !== 'ok' ||
      !Array.isArray(data?.articles) ||
      data.articles.length === 0
    ) {
      console.log('[iaNoticias] NewsAPIProvider: primary vacío o error, intentando fallback top-headlines...');
      res = await fetch(fallbackUrl);
      data = (await res.json()) as NewsAPIResponse;
      console.log(
        '[iaNoticias] 4b. NewsAPIProvider: fallback status=',
        data?.status,
        'articles=',
        data?.articles?.length ?? 0,
      );
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

    const payload = { raw, ts: Date.now() };
    cache = payload;
    void writeHeadlinesToDisk(payload).catch((err) =>
      console.warn('[iaNoticias] NewsAPIProvider: no se pudo escribir caché disco', err),
    );
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
