/**
 * Tipos compartidos de la feature IAPreguntas.
 */

/** Preguntas al consultorio permitidas por ventana de 6 h (Europe/Madrid). Sync con backend. */
export const CONSULTORIO_MAX_DAILY = 2;

/** XP otorgado por cada pregunta al consultorio. Sync con BONUS_XP.ASK_CONSULTORIO del backend. */
export const CONSULTORIO_XP_PER_QUESTION = 1000;

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export const IA_PREGUNTAS_WELCOME_MESSAGES = [
  'Este no es solo un chat, es un espacio para calmar la duda, ordenar el ruido y volver a confiar en tus decisiones.',
  'Aquí las preguntas no estorban: abren caminos. Pregunta lo que necesites y avancemos paso a paso.',
  'Invertir no va de suerte: va de entender. Empecemos por tu duda y la convertimos en claridad.',
  'Cuando el mercado tiembla, la estrategia sostiene. Cuéntame tu situación y lo analizamos.',
  'Tu tranquilidad también es rentabilidad. Pregunta con calma: aquí estás bajo control.',
  'No necesitas saberlo todo para empezar, solo hacer las pregunta correctas. ¿Cuál es la tuya?',
  'Vamos a transformar incertidumbre en decisiones. Escribe tu pregunta y lo vemos.',
] as const;
