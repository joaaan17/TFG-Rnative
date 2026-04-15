/** Día civil en Europe/Madrid (YYYY-MM-DD). */
export function getConsultorioDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

const MADRID_TZ = 'Europe/Madrid';

/** Duración de la ventana de cupo del consultorio (mismas 2 preguntas por ventana). */
export const CONSULTORIO_VENTANA_HORAS = 6;

function getMadridClockParts(d: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: MADRID_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const g = (t: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === t)?.value ?? '0');
  return {
    y: g('year'),
    mo: g('month'),
    day: g('day'),
    h: g('hour'),
    mi: g('minute'),
    s: g('second'),
  };
}

/**
 * Instante UTC del primer milisegundo en que el reloj de Madrid es >= dateKey HH:MM.
 */
function getMadridWallClockUtcMs(
  dateKey: string,
  hour: number,
  minute: number,
): number {
  const targetMin = hour * 60 + minute;
  const [Y, M, D] = dateKey.split('-').map(Number);
  let lo = Date.UTC(Y, M - 1, D - 1, 12, 0, 0);
  let hi = Date.UTC(Y, M - 1, D + 1, 12, 0, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const key = getConsultorioDateKey(new Date(mid));
    const p = getMadridClockParts(new Date(mid));
    const mins = p.h * 60 + p.mi;
    const dateOrder = key.localeCompare(dateKey);
    if (dateOrder < 0 || (dateOrder === 0 && mins < targetMin)) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/**
 * Clave de ventana del consultorio en Europe/Madrid: día civil + inicio de franja
 * (00, 06, 12 o 18). Se persiste en `consultorioDayKey` del perfil.
 */
export function getConsultorioSixHourSlotKey(now = new Date()): string {
  const dateKey = getConsultorioDateKey(now);
  const p = getMadridClockParts(now);
  const startHour =
    Math.floor(p.h / CONSULTORIO_VENTANA_HORAS) * CONSULTORIO_VENTANA_HORAS;
  return `${dateKey}T${String(startHour).padStart(2, '0')}`;
}

/** Suma o resta días a una clave YYYY-MM-DD (calendario gregoriano coherente con Madrid). */
export function addDaysToDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * Instante UTC (ms) en que comienza el día civil `dateKey` en Europe/Madrid (00:00:00 local).
 */
export function getStartOfConsultorioDayUtcMs(dateKey: string): number {
  const [y, mo, da] = dateKey.split('-').map(Number);
  let lo = Date.UTC(y, mo - 1, da - 1);
  let hi = Date.UTC(y, mo - 1, da + 2);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const k = getConsultorioDateKey(new Date(mid));
    if (k < dateKey) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Milisegundos hasta el siguiente cambio de día civil en Madrid. */
export function getMsUntilConsultorioDayReset(now = new Date()): number {
  const todayKey = getConsultorioDateKey(now);
  const tomorrowKey = addDaysToDateKey(todayKey, 1);
  const nextStart = getStartOfConsultorioDayUtcMs(tomorrowKey);
  return Math.max(0, nextStart - now.getTime());
}

/** Milisegundos hasta la siguiente franja de 6 h en Madrid (00, 06, 12, 18 → renovación del cupo). */
export function getMsUntilConsultorioSixHourReset(now = new Date()): number {
  const dateKey = getConsultorioDateKey(now);
  const t = now.getTime();
  for (const h of [6, 12, 18] as const) {
    const c = getMadridWallClockUtcMs(dateKey, h, 0);
    if (c > t) return c - t;
  }
  const tomorrowKey = addDaysToDateKey(dateKey, 1);
  const nextMidnight = getStartOfConsultorioDayUtcMs(tomorrowKey);
  return Math.max(0, nextMidnight - t);
}

/** Formato HH:MM:SS para el contador del consultorio. */
export function formatConsultorioResetCountdown(ms: number): string {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export const CONSULTORIO_PREGUNTAS_POR_DIA = 2;

function isLegacyConsultorioDayOnlyKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key);
}

/**
 * Cupo restante en la ventana actual (6 h, Europe/Madrid).
 * `consultorioDayKey` en BD: `YYYY-MM-DDThh` (hh 00, 06, 12 o 18) o legado solo `YYYY-MM-DD`.
 */
export function computeConsultorioRemainingToday(
  consultorioDayKey: string | undefined,
  consultorioConsultCount: number | undefined,
  now = new Date(),
): number {
  const slotKey = getConsultorioSixHourSlotKey(now);
  const dateKey = getConsultorioDateKey(now);

  if (!consultorioDayKey) {
    return CONSULTORIO_PREGUNTAS_POR_DIA;
  }

  if (isLegacyConsultorioDayOnlyKey(consultorioDayKey)) {
    if (consultorioDayKey !== dateKey) {
      return CONSULTORIO_PREGUNTAS_POR_DIA;
    }
    const used = Math.max(
      0,
      Math.min(CONSULTORIO_PREGUNTAS_POR_DIA, consultorioConsultCount ?? 0),
    );
    return Math.max(0, CONSULTORIO_PREGUNTAS_POR_DIA - used);
  }

  if (consultorioDayKey !== slotKey) {
    return CONSULTORIO_PREGUNTAS_POR_DIA;
  }
  const used = Math.max(0, Math.min(CONSULTORIO_PREGUNTAS_POR_DIA, consultorioConsultCount ?? 0));
  return Math.max(0, CONSULTORIO_PREGUNTAS_POR_DIA - used);
}
