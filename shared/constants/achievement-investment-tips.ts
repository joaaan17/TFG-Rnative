import { getMilestoneLevelList } from '@/shared/constants/achievements';

/**
 * Un consejo de inversión (voz Guspresario) por cada logro de nivel.
 * Orden alineado con getMilestoneLevelList(): 5, 10, 15 … 80.
 */
const TIPS_BY_ORDER: string[] = [
  'Cada posición que diversificas es un paso menos de depender de una sola apuesta. Explora activos distintos en tu cartera de práctica: el mapa completo enseña más que una sola isla.',
  'Invertir no es un sprint: quien avanza con constancia entiende mejor el riesgo y el tiempo. Sigue sumando XP en la app; lo que entrenas aquí pesa en la vida real.',
  'Antes de ampliar una posición, pregúntate si sabes qué estás comprando. La curiosidad mata menos carteras que la prisa: una duda honesta vale más que un clic impulsivo.',
  'Tener colchón (aunque sea mental en el simulador) te enseña a no vender en pánico. Ese hábito es oro cuando el mercado se pone ruidoso.',
  'Comisiones, spreads y “detalles” también comen rentabilidad. Cuenta el neto, no solo el bruto: el inversor maduro mira el bolsillo final.',
  'Si todo sube a la vez, mira si no llevas demasiado riesgo en el mismo saco. La diversificación de verdad se nota cuando algo tropieza y no te tumba entero.',
  'Lee el titular, luego la fuente. Entrenar el escepticismo ante el ruido es superpoder de inversor; INVESTIA te da tablas para practicarlo.',
  'Las aportaciones pequeñas y regulares vencen al “lo haré cuando…”. El mercado premia a quien se queda en la mesa; tu siguiente operación puede ser la del hábito.',
  'Una caída no borra lo aprendido: úsala para revisar tamaño de posición y plan, no para tirar la toalla. Los que siguen jugando con cabeza salen reforzados.',
  'La liquidez es libertad: no encierres todo en sitios de los que no podrías salir si cambia tu plan. Flexibilidad y criterio van de la mano.',
  'Comparar tu resultado con un índice sencillo te mantiene humilde y enfocado. Competir contra “yo del año pasado” suele ser más sano que contra el hype.',
  'Invertir en lo que conoces no es no salir de tu zona de confort: es estudiar antes de cruzar la puerta. Cada logro tuyo demuestra que ya sabes hacer ese esfuerzo.',
  'El interés compuesto aburre al principio y sorprende al final. Tu XP en la app sigue la misma ley: pequeños pasos, gran trayectoria. Sigue.',
  'Un mini-diario de decisiones (aunque sea mental) evita repetir el mismo error emocional dos veces. La memoria del inversor es entrenable.',
  'Explicar en voz alta lo que harías con un activo revela huecos en tu razonamiento. Usa consultorio y tests: enseñar es aprender al revés.',
  'Has recorrido un camino largo; el mejor inversor sigue siendo estudiante cuando otros ya se creen magos. Siguiente ronda en la app, misma actitud de principiante con ambición.',
];

const FALLBACK_TIP =
  'Sigue practicando en INVESTIA: cada logro es disciplina, XP y mejor criterio. El siguiente hito ya te está haciendo ojitos.';

const milestoneLevels = getMilestoneLevelList();

/** Nivel-hito del logro (5, 10, …) → consejo inspirador de Guspresario. */
export function getAchievementInvestmentTip(milestoneLevel: number): string {
  const i = milestoneLevels.indexOf(milestoneLevel);
  if (i < 0) return FALLBACK_TIP;
  return TIPS_BY_ORDER[i] ?? FALLBACK_TIP;
}
