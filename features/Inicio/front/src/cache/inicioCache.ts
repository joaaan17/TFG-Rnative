/**
 * Cache persistente para Inicio: noticias, explicaciones educativas y quizzes.
 * Usa AsyncStorage. TTL: 2 días para headlines y educational news, 7 días para quizzes.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  NewsPreview,
  EducationalNews,
  NewsQuiz,
} from '../types/inicio.types';

const STORAGE_PREFIX = '@inicio_cache_';
/** Headlines por usuario (antes era global: al cambiar de cuenta se veían las mismas noticias). */
function headlinesKey(userId: string) {
  return `${STORAGE_PREFIX}headlines_${userId}`;
}
const TTL_HEADLINES_MS = 2 * 24 * 60 * 60 * 1000; // 2 días
const TTL_EDU_MS = 2 * 24 * 60 * 60 * 1000; // 2 días
const TTL_QUIZ_MS = 7 * 24 * 60 * 60 * 1000; // 7 días (quizzes estables)

type Cached<T> = { data: T; ts: number };

function isFresh(ts: number, ttlMs: number): boolean {
  return Date.now() - ts < ttlMs;
}

async function getCached<T>(key: string): Promise<Cached<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached<T>;
    if (!parsed?.data || typeof parsed.ts !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

async function setCached<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(
      key,
      JSON.stringify({ data, ts: Date.now() } satisfies Cached<T>),
    );
  } catch {
    // Falla silenciosamente
  }
}

/** Obtiene headlines desde cache si son recientes (por usuario). */
export async function getHeadlinesCached(
  userId: string,
): Promise<NewsPreview[] | null> {
  const key = headlinesKey(userId);
  const cached = await getCached<NewsPreview[]>(key);
  if (!cached || !isFresh(cached.ts, TTL_HEADLINES_MS)) return null;
  return cached.data;
}

/** Guarda headlines en cache. */
export async function setHeadlinesCached(
  userId: string,
  data: NewsPreview[],
): Promise<void> {
  await setCached(headlinesKey(userId), data);
}

/** Obtiene educational news desde cache si es reciente. */
export async function getEducationalNewsCached(
  userId: string,
  newsId: string,
): Promise<EducationalNews | null> {
  const key = `${STORAGE_PREFIX}edu_${userId}_${newsId}`;
  const cached = await getCached<EducationalNews>(key);
  if (!cached || !isFresh(cached.ts, TTL_EDU_MS)) return null;
  return cached.data;
}

/** Guarda educational news en cache. */
export async function setEducationalNewsCached(
  userId: string,
  newsId: string,
  data: EducationalNews,
): Promise<void> {
  const key = `${STORAGE_PREFIX}edu_${userId}_${newsId}`;
  await setCached(key, data);
}

/** Obtiene quiz desde cache si es reciente. */
export async function getQuizCached(
  userId: string,
  newsId: string,
): Promise<NewsQuiz | null> {
  const key = `${STORAGE_PREFIX}quiz_${userId}_${newsId}`;
  const cached = await getCached<NewsQuiz>(key);
  if (!cached || !isFresh(cached.ts, TTL_QUIZ_MS)) return null;
  return cached.data;
}

/** Guarda quiz en cache. */
export async function setQuizCached(
  userId: string,
  newsId: string,
  data: NewsQuiz,
): Promise<void> {
  const key = `${STORAGE_PREFIX}quiz_${userId}_${newsId}`;
  await setCached(key, data);
}
