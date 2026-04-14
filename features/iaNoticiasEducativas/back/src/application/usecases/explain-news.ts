import { buildExplainNewsUserPrompt } from '@/shared/constants/ai-financial-voice';
import type { AIProviderPort, NewsProviderPort } from '../../domain/ports';
import type { EducationalNews } from '../../domain/iaNoticiasEducativas.types';

/**
 * Caso de uso: explicar una noticia con enfoque educativo.
 * NewsAPI aporta materia prima, ChatGPT aporta valor, el caso de uso orquesta.
 */
export class ExplainNews {
  constructor(
    private readonly newsProvider: NewsProviderPort,
    private readonly aiProvider: AIProviderPort,
  ) {}

  async execute(newsId: string): Promise<EducationalNews> {
    console.log(
      '[iaNoticias] 8. ExplainNews: ejecutando, newsId=',
      newsId?.slice(0, 60),
    );
    const news = await this.newsProvider.getNewsById(newsId);
    console.log(
      '[iaNoticias] 9. ExplainNews: noticia obtenida, content length=',
      news.content?.length ?? 0,
    );

    const prompt = buildExplainNewsUserPrompt(news.content);

    console.log(
      '[iaNoticias] 10. ExplainNews: enviando a IA, prompt length=',
      prompt.length,
    );
    const educationalContent = await this.aiProvider.rewriteEducational(prompt);
    console.log(
      '[iaNoticias] 11. ExplainNews: IA respondió, content length=',
      educationalContent?.length ?? 0,
    );

    return {
      id: news.id,
      title: news.title,
      imageUrl: news.imageUrl,
      content: educationalContent,
      source: news.source,
      publishedAt: news.publishedAt,
    };
  }
}
