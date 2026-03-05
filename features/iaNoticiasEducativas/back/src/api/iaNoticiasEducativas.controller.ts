import type { Request, Response } from 'express';
import {
  getHeadlines,
  explainNews,
} from '../config/iaNoticiasEducativas.wiring';
import { getQuiz } from '../config/quiz-store';
import { getExplainCached, setExplainCached } from '../config/explain-cache';

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
    const cached = getExplainCached(trimmedId);
    if (cached) {
      console.log(
        '[iaNoticias] ✅ NOTICIA OBTENIDA DE CACHE (ChatGPT) — newsId:',
        trimmedId.slice(0, 60),
      );
      res.json(cached);
      return;
    }

    const educationalNews = await explainNews.execute(trimmedId);
    setExplainCached(trimmedId, educationalNews);

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
  console.log(
    '[iaNoticias] Controller: quiz recibida, newsId:',
    newsId?.slice(0, 50),
  );

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
    error: 'Quiz no disponible. El quiz se genera automáticamente cada hora.',
  });
}
