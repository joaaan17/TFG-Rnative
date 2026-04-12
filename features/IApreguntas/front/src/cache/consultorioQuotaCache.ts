import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONSULTORIO_MAX_DAILY } from '../types/iapreguntas.types';

const KEY = '@consultorio_quota';

type QuotaEntry = {
  dayKey: string;
  used: number;
};

function todayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function read(): Promise<QuotaEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuotaEntry;
  } catch {
    return null;
  }
}

async function write(entry: QuotaEntry): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(entry));
  } catch {
    /* silencio */
  }
}

export async function getLocalRemaining(): Promise<number> {
  const entry = await read();
  if (!entry || entry.dayKey !== todayKey()) {
    return CONSULTORIO_MAX_DAILY;
  }
  return Math.max(0, CONSULTORIO_MAX_DAILY - entry.used);
}

export async function recordQuestionUsed(): Promise<number> {
  const today = todayKey();
  const entry = await read();
  const used = entry && entry.dayKey === today ? entry.used + 1 : 1;
  await write({ dayKey: today, used });
  return Math.max(0, CONSULTORIO_MAX_DAILY - used);
}

/** Sincroniza con el valor que devuelve el backend (fuente de verdad). */
export async function syncFromServer(remaining: number): Promise<void> {
  const today = todayKey();
  const used = Math.max(0, CONSULTORIO_MAX_DAILY - remaining);
  await write({ dayKey: today, used });
}
