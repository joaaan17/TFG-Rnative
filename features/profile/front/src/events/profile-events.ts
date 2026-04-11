/**
 * Evento disparado cuando el usuario gana XP.
 * Permite que la pantalla de perfil se actualice sin recargar.
 */
const xpListeners: Array<() => void> = [];

export function onProfileXpAwarded(callback: () => void): () => void {
  xpListeners.push(callback);
  return () => {
    const i = xpListeners.indexOf(callback);
    if (i >= 0) xpListeners.splice(i, 1);
  };
}

export function emitProfileXpAwarded(): void {
  xpListeners.forEach((cb) => cb());
  // CustomEvent no existe en el entorno JS de React Native (Android/iOS);
  // solo intentarlo en web donde window.CustomEvent está disponible.
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent('profile:xpawarded'));
  }
}

/** Evento de subida de nivel: callback recibe (newLevel, newTotalXp) */
const levelUpListeners: Array<(newLevel: number, newTotalXp: number) => void> =
  [];

export function onLevelUp(
  callback: (newLevel: number, newTotalXp: number) => void,
): () => void {
  levelUpListeners.push(callback);
  return () => {
    const i = levelUpListeners.indexOf(callback);
    if (i >= 0) levelUpListeners.splice(i, 1);
  };
}

export function emitLevelUp(newLevel: number, newTotalXp: number): void {
  levelUpListeners.forEach((cb) => cb(newLevel, newTotalXp));
}
