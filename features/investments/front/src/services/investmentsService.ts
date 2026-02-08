/**
 * Servicio de la feature Investments.
 * Extender cuando se añadan endpoints de cartera/efectivo.
 */

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}
