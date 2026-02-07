/**
 * Tipos del dominio iaNoticiasEducativas.
 * Contrato de lo que la UI recibe (no lo que NewsAPI devuelve).
 */

/** Noticia cruda desde NewsAPI (antes del procesamiento IA) */
export interface RawNews {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
}

/** Vista previa para la lista (card de previsualización) */
export interface NewsPreview {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
}

/** Noticia educativa devuelta al frontend (contenido reescrito por IA) */
export interface EducationalNews {
  id: string;
  title: string;
  imageUrl?: string;
  content: string;
  source: string;
  publishedAt: string;
}

/** Pregunta de quiz */
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

/** Quiz de noticia educativa */
export interface NewsQuiz {
  newsId: string;
  questions: QuizQuestion[];
}
