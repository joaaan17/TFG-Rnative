/**
 * Normaliza un par de IDs para consistencia (evitar duplicados userA/userB).
 */

export function normalizePair(
  userId1: string,
  userId2: string,
): { userAId: string; userBId: string } {
  const a = userId1.trim();
  const b = userId2.trim();
  if (a.localeCompare(b, undefined, { sensitivity: 'base' }) <= 0) {
    return { userAId: a, userBId: b };
  }
  return { userAId: b, userBId: a };
}
