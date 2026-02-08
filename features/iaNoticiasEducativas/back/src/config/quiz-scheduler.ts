import { getHeadlines, generateNewsQuiz } from './iaNoticiasEducativas.wiring';
import { setQuiz } from './quiz-store';

const INTERVAL_MS = 60 * 60 * 1000; // 1 hora
const MAX_NEWS_PER_RUN = 5;

async function runQuizGeneration(): Promise<void> {
  console.log('[iaNoticias] 📋 Scheduler: generando quizzes...');
  try {
    const headlines = await getHeadlines.execute();
    const toProcess = headlines.slice(0, MAX_NEWS_PER_RUN);

    for (const h of toProcess) {
      try {
        const quiz = await generateNewsQuiz.execute(h.id);
        setQuiz(h.id, quiz);
        console.log(
          '[iaNoticias] ✅ Scheduler: quiz generado para',
          h.title?.slice(0, 40),
        );
      } catch (err) {
        console.error(
          '[iaNoticias] ❌ Scheduler: error generando quiz para',
          h.id?.slice(0, 50),
          err,
        );
      }
    }

    console.log(
      '[iaNoticias] 📋 Scheduler: terminado,',
      toProcess.length,
      'quizzes procesados',
    );
  } catch (err) {
    console.error('[iaNoticias] ❌ Scheduler: error', err);
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startQuizScheduler(): void {
  if (intervalId) return;

  runQuizGeneration(); // Primera ejecución al arrancar

  intervalId = setInterval(runQuizGeneration, INTERVAL_MS);
  console.log('[iaNoticias] ⏰ Scheduler: iniciado (cada 1 hora)');
}

export function stopQuizScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
