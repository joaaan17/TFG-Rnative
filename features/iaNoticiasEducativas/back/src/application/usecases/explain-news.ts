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

    const prompt = `Eres un profesor experto en inversión y mercados financieros. Tu tarea es transformar la siguiente noticia en un texto educativo SIGUIENDO EXACTAMENTE esta estructura de 4 bloques:

---
## 1. APERTURA (1 párrafo corto máximo)
Objetivo: situar al lector en 20-30 segundos, sin exigir conocimientos previos. Alinear a todo el mundo en el mismo punto de partida.
Debe responder: ¿Qué ha pasado? ¿Por qué es relevante? ¿Por qué debería importarle al lector?
Reglas: Lenguaje claro, directo, sin tecnicismos. Enfoque de "traducción": convertir la noticia financiera en algo entendible.

## 2. CONTEXTO (1 párrafo)
Objetivo: poner la noticia en perspectiva. Evitar que el lector piense "esto es ruido" o "esto es algo aislado".
Debe responder: ¿Ha pasado antes? ¿Es normal que ocurra? ¿Qué suele hacer la gente en estos momentos?
Reglas: Conectar el presente con el pasado. Explicar que no es excepcional sino recurrente. Introducir la idea de ciclos y decisiones humanas.

## 3. CONCEPTOS CLAVE (2 conceptos: 3.1 y 3.2)
Objetivo: que el lector entienda por qué ocurre, no solo qué ocurre.
Cada concepto debe: (a) explicarse como para un niño de 5 años, (b) usar analogías cotidianas, (c) tono entusiasta y cercano, (d) una sola idea por concepto.
Estructura por concepto: Nombre en lenguaje sencillo → Definición ultra simple → Analogía cotidiana → Conexión con la noticia.

## 4. CIERRE OPCIONAL (1-2 frases)
Objetivo: sembrar curiosidad y pensamiento crítico.
Refuerza que: entender conceptos protege frente al ruido; el conocimiento reduce el miedo; el mercado no es caótico, es complejo.
---
NUNCA hagas recomendaciones de inversión.

Noticia original:
${news.content}`;

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
