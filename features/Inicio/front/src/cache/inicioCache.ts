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
const HEADLINES_KEY = `${STORAGE_PREFIX}headlines`;
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

/** Obtiene headlines desde cache si son recientes. */
export async function getHeadlinesCached(): Promise<NewsPreview[] | null> {
  const cached = await getCached<NewsPreview[]>(HEADLINES_KEY);
  if (!cached || !isFresh(cached.ts, TTL_HEADLINES_MS)) return null;
  return cached.data;
}

/** Guarda headlines en cache. */
export async function setHeadlinesCached(data: NewsPreview[]): Promise<void> {
  await setCached(HEADLINES_KEY, data);
}

/** Obtiene educational news desde cache si es reciente. */
export async function getEducationalNewsCached(
  newsId: string,
): Promise<EducationalNews | null> {
  const key = `${STORAGE_PREFIX}edu_${newsId}`;
  const cached = await getCached<EducationalNews>(key);
  if (!cached || !isFresh(cached.ts, TTL_EDU_MS)) return null;
  return cached.data;
}

/** Guarda educational news en cache. */
export async function setEducationalNewsCached(
  newsId: string,
  data: EducationalNews,
): Promise<void> {
  const key = `${STORAGE_PREFIX}edu_${newsId}`;
  await setCached(key, data);
}

/** Obtiene quiz desde cache si es reciente. */
export async function getQuizCached(
  newsId: string,
): Promise<NewsQuiz | null> {
  const key = `${STORAGE_PREFIX}quiz_${newsId}`;
  const cached = await getCached<NewsQuiz>(key);
  if (!cached || !isFresh(cached.ts, TTL_QUIZ_MS)) return null;
  return cached.data;
}

/** Guarda quiz en cache. */
export async function setQuizCached(
  newsId: string,
  data: NewsQuiz,
): Promise<void> {
  const key = `${STORAGE_PREFIX}quiz_${newsId}`;
  await setCached(key, data);
}
