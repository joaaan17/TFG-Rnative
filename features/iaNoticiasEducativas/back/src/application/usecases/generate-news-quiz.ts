import type { AIProviderPort } from '../../domain/ports';
import type { ExplainNews } from './explain-news';
import type {
  EducationalNews,
  NewsQuiz,
} from '../../domain/iaNoticiasEducativas.types';

export type OnExplainFetched = (
  newsId: string,
  educationalNews: EducationalNews,
) => void;

/**
 * Caso de uso: generar quiz de 10 preguntas con 4 opciones a partir de la noticia educativa.
 * Usa ExplainNews para obtener el contenido educativo y ChatGPT para el quiz.
 * Si se proporciona onExplainFetched, lo invoca para que el scheduler pueda poblar el cache.
 */
export class GenerateNewsQuiz {
  constructor(
    private readonly explainNews: ExplainNews,
    private readonly aiProvider: AIProviderPort,
    private readonly onExplainFetched?: OnExplainFetched,
  ) {}

  async execute(newsId: string): Promise<NewsQuiz> {
    const educationalNews = await this.explainNews.execute(newsId);

    this.onExplainFetched?.(newsId, educationalNews);

    const prompt = `Eres un profesor de inversión y mercados financieros.

A partir del siguiente contenido educativo de una noticia, crea un cuestionario de exactamente 10 preguntas tipo test para evaluar si el lector ha entendido los conceptos clave.

Reglas estrictas:
- Exactamente 10 preguntas.
- Cada pregunta tiene exactamente 4 opciones (A, B, C, D).
- Solo UNA opción correcta por pregunta.
- Las preguntas deben centrarse en conceptos financieros, no en datos anecdóticos.
- Usa lenguaje claro y pedagógico.
- Devuelve ÚNICAMENTE un JSON válido, sin markdown ni texto extra, con esta estructura exacta:

{"questions":[{"question":"texto de la pregunta","options":["opción A","opción B","opción C","opción D"],"correctAnswerIndex":0}]}

Donde correctAnswerIndex es 0, 1, 2 o 3 según la opción correcta.

Contenido educativo:
${educationalNews.content}`;

    const rawQuiz = await this.aiProvider.rewriteEducational(prompt);
    const parsed = this.parseQuizJson(rawQuiz);

    return {
      newsId,
      questions: parsed.questions,
    };
  }

  private parseQuizJson(raw: string): { questions: NewsQuiz['questions'] } {
    const cleaned = raw
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    const parsed = JSON.parse(cleaned) as { questions?: NewsQuiz['questions'] };
    const questions = parsed.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Respuesta de IA inválida: se esperaban preguntas');
    }
    return { questions };
  }
}
