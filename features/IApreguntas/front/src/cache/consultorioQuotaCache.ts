import AsyncStorage from '@react-native-async-storage/async-storage';
import { getConsultorioSixHourSlotKey } from '@/features/profile/back/src/domain/consultorio-day.util';
import { CONSULTORIO_MAX_DAILY } from '../types/iapreguntas.types';

const KEY = '@consultorio_quota';

type QuotaEntry = {
  /** Ventana 6 h Europe/Madrid (`YYYY-MM-DDThh`) o legado solo-fecha. */
  dayKey: string;
  used: number;
};

function currentSlotKey(): string {
  return getConsultorioSixHourSlotKey(new Date());
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
  if (!entry || entry.dayKey !== currentSlotKey()) {
    return CONSULTORIO_MAX_DAILY;
  }
  return Math.max(0, CONSULTORIO_MAX_DAILY - entry.used);
}

export async function recordQuestionUsed(): Promise<number> {
  const slot = currentSlotKey();
  const entry = await read();
  const used = entry && entry.dayKey === slot ? entry.used + 1 : 1;
  await write({ dayKey: slot, used });
  return Math.max(0, CONSULTORIO_MAX_DAILY - used);
}

/** Sincroniza con el valor que devuelve el backend (fuente de verdad). */
export async function syncFromServer(remaining: number): Promise<void> {
  const slot = currentSlotKey();
  const used = Math.max(0, CONSULTORIO_MAX_DAILY - remaining);
  await write({ dayKey: slot, used });
}
