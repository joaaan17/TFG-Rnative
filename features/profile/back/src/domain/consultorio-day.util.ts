/** Día civil en Europe/Madrid (YYYY-MM-DD), alineado con el límite diario del consultorio. */
export function getConsultorioDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export const CONSULTORIO_PREGUNTAS_POR_DIA = 2;

export function computeConsultorioRemainingToday(
  consultorioDayKey: string | undefined,
  consultorioConsultCount: number | undefined,
  now = new Date(),
): number {
  const todayKey = getConsultorioDateKey(now);
  if (!consultorioDayKey || consultorioDayKey !== todayKey) {
    return CONSULTORIO_PREGUNTAS_POR_DIA;
  }
  const used = Math.max(0, Math.min(CONSULTORIO_PREGUNTAS_POR_DIA, consultorioConsultCount ?? 0));
  return Math.max(0, CONSULTORIO_PREGUNTAS_POR_DIA - used);
}
