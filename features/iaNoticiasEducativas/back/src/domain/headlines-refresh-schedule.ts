/**
 * Renovación de titulares alineada con horario civil en Europe/Madrid
 * (misma base que consultorio-day en perfil).
 */
import {
  addDaysToDateKey,
  getConsultorioDateKey,
} from '../../../../profile/back/src/domain/consultorio-day.util';

export const HEADLINES_NEWS_PAGE_SIZE = 3;

const MADRID = 'Europe/Madrid';

function getMadridClockParts(d: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: MADRID,
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
  };
}

/**
 * Instante UTC del primer milisegundo en que el reloj de Madrid es >= dateKey HH:MM.
 */
export function getMadridWallClockUtcMs(
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

/** Identificador de la ventana de titulares (caché servidor/cliente). */
export function getHeadlinesSlotId(now = new Date()): string {
  const todayKey = getConsultorioDateKey(now);
  const p = getMadridClockParts(now);
  const mins = p.h * 60 + p.mi;
  const t0830 = 8 * 60 + 30;
  const t1500 = 15 * 60;

  if (mins < t0830) {
    return `${addDaysToDateKey(todayKey, -1)}-PM`;
  }
  if (mins < t1500) {
    return `${todayKey}-AM`;
  }
  return `${todayKey}-PM`;
}

/** Siguiente instante (UTC ms) de publicación programada: 08:30 o 15:00 en Madrid. */
export function getNextHeadlinesRefreshUtcMs(now = new Date()): number {
  const todayKey = getConsultorioDateKey(now);
  const tomorrowKey = addDaysToDateKey(todayKey, 1);
  const candidates = [
    getMadridWallClockUtcMs(todayKey, 8, 30),
    getMadridWallClockUtcMs(todayKey, 15, 0),
    getMadridWallClockUtcMs(tomorrowKey, 8, 30),
  ];
  const t = now.getTime();
  const future = candidates.filter((c) => c > t);
  if (future.length === 0) {
    return candidates[candidates.length - 1] ?? t + 60_000;
  }
  return Math.min(...future);
}
