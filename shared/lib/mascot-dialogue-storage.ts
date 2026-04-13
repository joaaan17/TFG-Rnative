import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mascot_dialogue_daily_v1';

export type MascotDailyFlags = {
  day: string;
  /** Modal “entrada” (0 min) mostrado hoy */
  entry: boolean;
  /** Tras ~5 min en primer plano */
  m5: boolean;
  /** Tras ~15 min en primer plano */
  m15: boolean;
};

function calendarDay(): string {
  return new Date().toISOString().slice(0, 10);
}

function freshState(): MascotDailyFlags {
  return {
    day: calendarDay(),
    entry: false,
    m5: false,
    m15: false,
  };
}

export async function loadMascotDailyState(): Promise<MascotDailyFlags> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const today = calendarDay();
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as MascotDailyFlags;
    if (parsed.day !== today) return freshState();
    return {
      day: parsed.day,
      entry: Boolean(parsed.entry),
      m5: Boolean(parsed.m5),
      m15: Boolean(parsed.m15),
    };
  } catch {
    return freshState();
  }
}

export async function saveMascotDailyState(
  state: MascotDailyFlags,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
