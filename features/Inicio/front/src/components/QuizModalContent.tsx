import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { Hierarchy } from '@/design-system/typography';
import { Text } from '@/shared/components/ui/text';
import { Button } from '@/shared/components/ui/button';
import { usePalette } from '@/shared/hooks/use-palette';
import type { NewsQuiz, QuizQuestion } from '../types/inicio.types';
import { QUIZ_LOADING_MESSAGES } from '../types/inicio.types';
import { getQuizXpForCorrectCount } from '@/shared/constants/xp-quiz';
import { LoadingNewsOverlay } from './LoadingNewsOverlay';
import { createQuizStyles } from './QuizModalContent.styles';

// Transición tipo CircularGallery: slide horizontal suave con spring (scrollEase ≈ 0.05)
const QUIZ_ENTERING = SlideInRight.springify().damping(24).stiffness(160);
const QUIZ_EXITING = SlideOutLeft.springify().damping(24).stiffness(160);

export type QuizModalContentProps = {
  quiz: NewsQuiz | null;
  answers: Record<number, number>;
  onAnswer: (qIndex: number, optionIndex: number) => void;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  /** Se llama una vez cuando el usuario completa el test (todas las preguntas respondidas). Recibe el nº de aciertos. */
  onQuizComplete?: (correctCount: number) => void;
};

const PASS_THRESHOLD = 0.5; // 50% para aprobar

function QuizCloseBar({
  onClose,
  palette,
}: {
  onClose: () => void;
  palette: ReturnType<typeof usePalette>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: Math.max(insets.top, 8) + 4,
        paddingHorizontal: 12,
        paddingBottom: 8,
      }}
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cerrar test"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      >
        <X size={24} color={palette.text} strokeWidth={2.25} />
      </Pressable>
    </View>
  );
}

export function QuizModalContent({
  quiz,
  answers,
  onAnswer,
  loading,
  error,
  onClose,
  onQuizComplete,
}: QuizModalContentProps) {
  const palette = usePalette();
  const styles = useMemo(() => createQuizStyles(palette), [palette]);
  const insets = useSafeAreaInsets();
  const BUTTON_AREA_HEIGHT = 72 + Math.max(insets.bottom, 8);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewingIndex, setReviewingIndex] = useState<number | null>(null);
  const quizCompleteCalledRef = useRef(false);

  useEffect(() => {
    setCurrentIndex(0);
    setReviewingIndex(null);
    quizCompleteCalledRef.current = false;
  }, [quiz?.newsId]);

  useEffect(() => {
    if (!quiz?.questions?.length) return;
    const total = quiz.questions.length;
    const answeredCount = Object.keys(answers).length;
    if (
      answeredCount === total &&
      onQuizComplete &&
      !quizCompleteCalledRef.current
    ) {
      quizCompleteCalledRef.current = true;
      const correctCount = Object.entries(answers).filter(
        ([qIdx, opt]) =>
          quiz.questions[Number(qIdx)]?.correctAnswerIndex === opt,
      ).length;
      onQuizComplete(correctCount);
    }
  }, [quiz, answers, onQuizComplete]);

  const handleSelectOption = (qIndex: number, optionIndex: number) => {
    if (answers[qIndex] !== undefined) return;
    onAnswer(qIndex, optionIndex);
  };

  const handleNext = () => {
    if (currentIndex < (quiz?.questions?.length ?? 1) - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, minHeight: 0 }}>
        <QuizCloseBar onClose={onClose} palette={palette} />
        <View style={[styles.container, styles.loadingContainer, { flex: 1 }]}>
          <LoadingNewsOverlay visible messages={QUIZ_LOADING_MESSAGES} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, minHeight: 0 }}>
        <QuizCloseBar onClose={onClose} palette={palette} />
        <View style={[styles.container, styles.errorContainer, { flex: 1 }]}>
          <View style={styles.errorCard}>
            <Text
              style={[Hierarchy.body, { color: palette.icon ?? palette.text }]}
            >
              {error}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (!quiz || !quiz.questions?.length) {
    return (
      <View style={{ flex: 1, minHeight: 0 }}>
        <QuizCloseBar onClose={onClose} palette={palette} />
        <View style={[styles.container, styles.errorContainer, { flex: 1 }]}>
          <View style={styles.errorCard}>
            <Text
              style={[Hierarchy.body, { color: palette.icon ?? palette.text }]}
            >
              No se pudo generar el quiz.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const total = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(
    ([qIdx, opt]) => quiz.questions[Number(qIdx)]?.correctAnswerIndex === opt,
  ).length;
  const allAnswered = answeredCount === total;
  const isReviewing = reviewingIndex !== null;
  const displayIndex = isReviewing ? reviewingIndex : currentIndex;
  const currentQuestion = quiz.questions[displayIndex];
  const currentAnswered = answers[displayIndex] !== undefined;

  // Modo repaso: mostrar pregunta seleccionada desde resultados
  if (allAnswered && isReviewing) {
    return (
      <View style={{ flex: 1, minHeight: 0 }}>
        <QuizCloseBar onClose={onClose} palette={palette} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: BUTTON_AREA_HEIGHT + 8 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionWrap}>
            <View style={styles.sectionAccent} />
            <Text
              style={[
                Hierarchy.titleSection,
                styles.sectionTitle,
                { color: palette.icon ?? palette.text },
              ]}
            >
              Repasar pregunta {displayIndex + 1}
            </Text>
          </View>
          <Text
            style={[
              Hierarchy.caption,
              styles.sectionSubtitle,
              { color: palette.icon ?? palette.text },
            ]}
          >
            {displayIndex + 1} de {total}
          </Text>

          <View style={styles.questionTransitionWrap} collapsable={false}>
            <Animated.View
              key={displayIndex}
              entering={QUIZ_ENTERING}
              exiting={QUIZ_EXITING}
              style={styles.questionTransitionInner}
            >
              <QuestionBlock
                question={currentQuestion}
                index={displayIndex}
                selectedIndex={answers[displayIndex] ?? null}
                onSelect={() => {}}
                styles={styles}
                palette={palette}
              />
            </Animated.View>
          </View>
        </ScrollView>

        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: palette.cardBackground ?? palette.background,
          }}
        >
          <Button
            onPress={() => setReviewingIndex(null)}
            variant="default"
            size="lg"
            style={styles.nextButton}
          >
            <Text style={Hierarchy.action}>Volver a resultados</Text>
          </Button>
        </View>
      </View>
    );
  }

  // Pantalla de resumen final
  if (allAnswered) {
    const passed = correctCount / total >= PASS_THRESHOLD;
    const xpEarned = getQuizXpForCorrectCount(correctCount);

    return (
      <View style={{ flex: 1, minHeight: 0 }}>
        <QuizCloseBar onClose={onClose} palette={palette} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.resultsSectionWrap}>
          <View style={styles.sectionAccent} />
          <Text
            style={[
              Hierarchy.titleSection,
              styles.sectionTitle,
              { color: palette.icon ?? palette.text },
            ]}
          >
            Resultados del test
          </Text>
        </View>

        <View style={styles.resultsQuestionsRow}>
          {quiz.questions.map((_, qIdx) => {
            const selected = answers[qIdx];
            const isCorrect =
              selected !== undefined &&
              selected === quiz.questions[qIdx].correctAnswerIndex;
            return (
              <Pressable
                key={qIdx}
                onPress={() => setReviewingIndex(qIdx)}
                style={[
                  styles.resultsQuestionBadge,
                  isCorrect
                    ? styles.resultsQuestionBadgeCorrect
                    : styles.resultsQuestionBadgeIncorrect,
                ]}
              >
                <Text
                  style={[
                    Hierarchy.bodySmallSemibold,
                    styles.resultsQuestionBadgeText,
                    {
                      color: isCorrect
                        ? palette.positive ?? '#16A34A'
                        : palette.destructive ?? '#E5484D',
                    },
                  ]}
                >
                  {qIdx + 1}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.resultsScoreCard}>
          <Text
            style={[
              Hierarchy.value,
              { color: palette.text },
            ]}
          >
            {correctCount}/{total} ({Math.round((correctCount / total) * 100)}%)
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 12,
              alignSelf: 'center',
              backgroundColor: `${palette.positive ?? '#16A34A'}18`,
            }}
          >
            <Text
              style={[
                Hierarchy.bodySmallSemibold,
                { color: palette.positive ?? '#16A34A' },
              ]}
            >
              +{xpEarned} XP
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.resultsVerdict,
            passed ? styles.resultsVerdictPassed : styles.resultsVerdictFailed,
          ]}
        >
          <Text
            style={[
              Hierarchy.titleModal,
              styles.resultsVerdictText,
              {
                color: passed
                  ? palette.positive ?? '#16A34A'
                  : palette.destructive ?? '#E5484D',
              },
            ]}
          >
            {passed ? '¡Has aprobado!' : 'No has aprobado'}
          </Text>
          <Text
            style={[
              Hierarchy.body,
              styles.resultsVerdictSub,
              { color: palette.icon ?? palette.text },
            ]}
          >
            {passed
              ? 'Has demostrado comprender los conceptos clave.'
              : 'Repasa el contenido de la noticia e inténtalo de nuevo.'}
          </Text>
        </View>
      </ScrollView>
      </View>
    );
  }

  // Pregunta actual — estilo NVDA con sección, progreso y cards
  const progressPct = total > 0 ? (currentIndex + 1) / total : 0;

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <QuizCloseBar onClose={onClose} palette={palette} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BUTTON_AREA_HEIGHT + 8 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionWrap}>
          <View style={styles.sectionAccent} />
          <Text
            style={[
              Hierarchy.titleSection,
              styles.sectionTitle,
              { color: palette.icon ?? palette.text },
            ]}
          >
            Test de comprensión
          </Text>
        </View>
        <Text
          style={[
            Hierarchy.caption,
            styles.progressSubtitle,
            { color: palette.icon ?? palette.text },
          ]}
        >
          Pregunta {currentIndex + 1} de {total}
        </Text>

        <View style={styles.progressBarWrap}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPct * 100}%` },
            ]}
          />
        </View>

        <View style={styles.questionTransitionWrap} collapsable={false}>
          <Animated.View
            key={currentIndex}
            entering={QUIZ_ENTERING}
            exiting={QUIZ_EXITING}
            style={styles.questionTransitionInner}
          >
            <QuestionBlock
              question={currentQuestion}
              index={currentIndex}
              selectedIndex={answers[currentIndex] ?? null}
              onSelect={(opt) => handleSelectOption(currentIndex, opt)}
              styles={styles}
              palette={palette}
            />
          </Animated.View>
        </View>
      </ScrollView>

      {/* Botón fijo en la parte inferior — siempre visible */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: palette.cardBackground ?? palette.background,
        }}
      >
        <Button
          onPress={handleNext}
          disabled={!currentAnswered}
          variant={currentAnswered ? 'default' : 'secondary'}
          size="lg"
          style={styles.nextButton}
        >
          <Text style={Hierarchy.action}>
            {currentIndex < total - 1
              ? 'Siguiente pregunta'
              : 'Ver resultados'}
          </Text>
        </Button>
      </View>
    </View>
  );
}

type QuestionBlockProps = {
  question: QuizQuestion;
  index: number;
  selectedIndex: number | null;
  onSelect: (optionIndex: number) => void;
  styles: ReturnType<typeof createQuizStyles>;
  palette: ReturnType<typeof usePalette>;
};

function QuestionBlock({
  question,
  index,
  selectedIndex,
  onSelect,
  styles,
  palette,
}: QuestionBlockProps) {
  const isAnswered = selectedIndex !== null;

  return (
    <View style={styles.questionCard}>
      <Text
        style={[
          Hierarchy.body,
          styles.questionText,
          { color: palette.text },
        ]}
      >
        {index + 1}. {question.question}
      </Text>
      {question.options.map((opt, optIndex) => {
        let isCorrect = false;
        let isIncorrect = false;
        if (isAnswered) {
          if (optIndex === question.correctAnswerIndex) {
            isCorrect = true;
          } else if (optIndex === selectedIndex) {
            isIncorrect = true;
          }
        }

        return (
          <Pressable
            key={optIndex}
            onPress={() => onSelect(optIndex)}
            disabled={isAnswered}
            style={[
              styles.option,
              isCorrect && styles.optionCorrect,
              isIncorrect && styles.optionIncorrect,
            ]}
          >
            <Text
              style={[
                Hierarchy.body,
                (isCorrect || isIncorrect)
                  ? styles.optionTextFeedback
                  : styles.optionTextNeutral,
                !isCorrect && !isIncorrect && { color: palette.text },
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
