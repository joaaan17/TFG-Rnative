import type { Request, Response } from 'express';
import type { EducationalNews } from '../domain/iaNoticiasEducativas.types';
import {
  getHeadlines,
  explainNews,
} from '../config/iaNoticiasEducativas.wiring';
import { getQuiz } from '../config/quiz-store';

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos
const MAX_CACHE_SIZE = 50;

type CacheEntry = { educationalNews: EducationalNews; expiresAt: number };
/** Cache de respuestas ChatGPT por newsId. TTL 15 min, se invalida al reiniciar. */
const explainCache = new Map<string, CacheEntry>();

function getCached(id: string): EducationalNews | null {
  const entry = explainCache.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    explainCache.delete(id);
    return null;
  }
  return entry.educationalNews;
}

function setCached(id: string, educationalNews: EducationalNews): void {
  if (explainCache.size >= MAX_CACHE_SIZE) {
    const firstKey = explainCache.keys().next().value;
    if (firstKey != null) explainCache.delete(firstKey);
  }
  explainCache.set(id, {
    educationalNews,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export async function getHeadlinesController(_req: Request, res: Response) {
  console.log('[iaNoticias] 1. Controller: getHeadlines recibida');
  try {
    const headlines = await getHeadlines.execute();
    console.log(
      '[iaNoticias] 2. Controller: getHeadlines OK, enviando',
      headlines?.length ?? 0,
      'noticias',
    );
    res.json(headlines);
  } catch (err) {
    console.error('[iaNoticias] Controller: getHeadlines ERROR:', err);
    res.status(500).json({ error: 'Error al obtener noticias' });
  }
}

export async function explainNewsController(req: Request, res: Response) {
  const { newsId } = req.body;
  console.log('[iaNoticias] 1. Controller: explain recibida, newsId:', newsId);

  if (!newsId || typeof newsId !== 'string') {
    console.log('[iaNoticias] Controller: explain ERROR - newsId inválido');
    res.status(400).json({ error: 'newsId requerido' });
    return;
  }

  const trimmedId = newsId.trim();

  try {
    const cached = getCached(trimmedId);
    if (cached) {
      console.log(
        '[iaNoticias] ✅ NOTICIA OBTENIDA DE CACHE (ChatGPT) — newsId:',
        trimmedId.slice(0, 60),
      );
      res.json(cached);
      return;
    }

    const educationalNews = await explainNews.execute(trimmedId);
    setCached(trimmedId, educationalNews);

    console.log(
      '[iaNoticias] 2. Controller: explain OK (cached), título:',
      educationalNews?.title?.slice(0, 40),
    );
    res.json(educationalNews);
  } catch (err) {
    console.error('[iaNoticias] Controller: explain ERROR:', err);
    res.status(500).json({ error: 'Error al procesar la noticia' });
  }
}

export async function generateNewsQuizController(
  req: Request,
  res: Response,
): Promise<void> {
  const { newsId } = req.body;
  console.log('[iaNoticias] Controller: quiz recibida, newsId:', newsId?.slice(0, 50));

  if (!newsId || typeof newsId !== 'string') {
    res.status(400).json({ error: 'newsId requerido' });
    return;
  }

  const trimmedId = newsId.trim();

  // Solo devolver quizzes pre-generados (scheduler). No llamar a ChatGPT.
  const quiz = getQuiz(trimmedId);
  if (quiz) {
    console.log(
      '[iaNoticias] Controller: quiz desde store, preguntas=',
      quiz.questions?.length ?? 0,
    );
    res.json(quiz);
    return;
  }

  console.log('[iaNoticias] Controller: quiz no disponible para newsId');
  res.status(404).json({
    error: 'Quiz no disponible. El quiz se genera automáticamente cada 10 minutos.',
  });
}
