import { StyleSheet } from 'react-native';
import type { Palette } from '@/shared/hooks/use-palette';

export function createQuizStyles(palette: Palette) {
  const correctGreen = palette.positive ?? '#16A34A';
  const incorrectRed = palette.destructive ?? '#E5484D';

  return StyleSheet.create({
    container: {
      paddingHorizontal: 20,
    },
    loadingContainer: {
      paddingVertical: 48,
      paddingHorizontal: 20,
      minHeight: 200,
      justifyContent: 'center',
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 24,
    },
    contentWithButtonSpace: {
      paddingBottom: 32,
    },

    // --- Sección estilo NVDA/Investments ---
    sectionWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 4,
    },
    sectionAccent: {
      width: 3,
      height: 14,
      borderRadius: 999,
      backgroundColor: palette.primary,
    },
    sectionTitle: {
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: 'uppercase' as const,
    },
    sectionSubtitle: {
      marginBottom: 16,
      opacity: 0.85,
    },
    progressSubtitle: {
      marginBottom: 20,
      opacity: 0.7,
    },

    // --- Barra de progreso ---
    progressBarWrap: {
      height: 6,
      borderRadius: 999,
      backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
      marginBottom: 24,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: palette.primary,
    },

    // --- Contenedor para transición tipo CircularGallery ---
    questionTransitionWrap: {
      overflow: 'hidden' as const,
      marginBottom: 8,
    },
    questionTransitionInner: {
      width: '100%',
    },

    // --- Card de pregunta (como las cards de DATOS DEL DÍA) ---
    questionCard: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 0,
      backgroundColor: palette.cardBackground ?? palette.background,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? 'rgba(0,0,0,0.08)',
    },
    questionText: {
      marginBottom: 16,
      lineHeight: 24,
    },

    // --- Opciones: estilo de la imagen (verde/rojo feedback) ---
    option: {
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderRadius: 14,
      marginBottom: 10,
      borderWidth: 1.5,
      borderColor: palette.surfaceBorder ?? 'rgba(128,128,128,0.35)',
      backgroundColor: palette.cardBackground ?? palette.background,
    },
    optionCorrect: {
      backgroundColor: correctGreen,
      borderColor: correctGreen,
    },
    optionIncorrect: {
      backgroundColor: incorrectRed,
      borderColor: incorrectRed,
    },
    optionTextNeutral: {},
    optionTextFeedback: {
      color: '#FFFFFF',
    },

    // --- Botón principal ---
    nextContainer: {
      marginTop: 8,
      width: '100%',
    },
    nextButton: {
      width: '100%',
      borderRadius: 14,
      minHeight: 52,
    },

    // --- Error / sin quiz ---
    errorContainer: {
      paddingVertical: 48,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorCard: {
      borderRadius: 16,
      padding: 24,
      backgroundColor: palette.cardBackground ?? palette.background,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? 'rgba(0,0,0,0.08)',
      alignItems: 'center',
    },

    // --- Resultados ---
    resultsContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 32,
    },
    resultsSectionWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    },
    resultsQuestionsRow: {
      flexDirection: 'row',
      marginBottom: 20,
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? 'rgba(0,0,0,0.08)',
    },
    resultsQuestionBadge: {
      flex: 1,
      minWidth: 28,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultsQuestionBadgeCorrect: {
      backgroundColor: `${correctGreen}18`,
    },
    resultsQuestionBadgeIncorrect: {
      backgroundColor: `${incorrectRed}18`,
    },
    resultsQuestionBadgeText: {},
    resultsScoreCard: {
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      backgroundColor: palette.cardBackground ?? palette.background,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? 'rgba(0,0,0,0.08)',
      alignItems: 'center',
    },
    resultsVerdict: {
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
    },
    resultsVerdictPassed: {
      backgroundColor: `${correctGreen}15`,
      borderColor: `${correctGreen}40`,
    },
    resultsVerdictFailed: {
      backgroundColor: `${incorrectRed}12`,
      borderColor: `${incorrectRed}35`,
    },
    resultsVerdictText: {
      marginBottom: 8,
    },
    resultsVerdictSub: {
      textAlign: 'center',
    },
  });
}

export type QuizStyles = ReturnType<typeof createQuizStyles>;
