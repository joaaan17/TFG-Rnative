import type { Request, Response } from 'express';
import { getHeadlines, explainNews } from '../config/iaNoticiasEducativas.wiring';

export async function getHeadlinesController(_req: Request, res: Response) {
  console.log('[iaNoticias] 1. Controller: getHeadlines recibida');
  try {
    const headlines = await getHeadlines.execute();
    console.log('[iaNoticias] 2. Controller: getHeadlines OK, enviando', headlines?.length ?? 0, 'noticias');
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

  try {
    const educationalNews = await explainNews.execute(newsId.trim());
    console.log('[iaNoticias] 2. Controller: explain OK, título:', educationalNews?.title?.slice(0, 40));
    res.json(educationalNews);
  } catch (err) {
    console.error('[iaNoticias] Controller: explain ERROR:', err);
    res.status(500).json({ error: 'Error al procesar la noticia' });
  }
}
