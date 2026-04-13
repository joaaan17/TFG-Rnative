import type { NewsProviderPort } from '../../domain/ports';
import type { NewsPreview } from '../../domain/iaNoticiasEducativas.types';

/**
 * Caso de uso: obtener lista de titulares para la UI.
 * NewsAPI aporta la materia prima.
 */
export class GetHeadlines {
  constructor(private readonly newsProvider: NewsProviderPort) {}

  async execute(options?: { bypassCache?: boolean }): Promise<NewsPreview[]> {
    const raw = await this.newsProvider.getHeadlines({
      bypassCache: options?.bypassCache,
    });
    return raw.map((r) => ({
      id: r.id,
      title: r.title,
      excerpt: r.content.slice(0, 150) + (r.content.length > 150 ? '...' : ''),
      imageUrl: r.imageUrl,
      source: r.source,
      publishedAt: r.publishedAt,
    }));
  }
}
