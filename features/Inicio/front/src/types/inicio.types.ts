/**
 * Tipos compartidos de la feature Inicio.
 * Alineados con iaNoticiasEducativas backend.
 */

export type NewsPreview = {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
};

export type EducationalNews = {
  id: string;
  title: string;
  imageUrl?: string;
  content: string;
  source: string;
  publishedAt: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
};

export type NewsQuiz = {
  newsId: string;
  questions: QuizQuestion[];
};

/** Mensajes aleatorios que aparecen mientras se procesa la noticia con IA */
export const NOTICIAS_LOADING_MESSAGES = [
  'El mercado premia la disciplina.',
  'Analizando tendencias del mercado...',
  'La diversificación reduce el riesgo.',
  'Los ciclos económicos son inevitables.',
  'La información es tu mejor herramienta.',
  'Convirtiendo la noticia en contenido educativo...',
  'Explicando conceptos clave...',
  'La paciencia es clave en inversión.',
  'Añadiendo contexto histórico...',
  'Las emociones suelen ser malas consejeras.',
] as const;
