import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Button } from '@/shared/components/ui/button';
import type { NewsQuiz, QuizQuestion } from '../types/inicio.types';
import { QUIZ_LOADING_MESSAGES } from '../types/inicio.types';
import { LoadingNewsOverlay } from './LoadingNewsOverlay';
import AppColors from '@/design-system/colors';

export type QuizModalContentProps = {
  quiz: NewsQuiz | null;
  answers: Record<number, number>;
  onAnswer: (qIndex: number, optionIndex: number) => void;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  /** Callback para reportar la altura del contenido (para ajustar el modal) */
  onContentSizeChange?: (width: number, height: number) => void;
};

const PASS_THRESHOLD = 0.5; // 50% para aprobar

export function QuizModalContent({
  quiz,
  answers,
  onAnswer,
  loading,
  error,
  onContentSizeChange,
}: QuizModalContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewingIndex, setReviewingIndex] = useState<number | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setReviewingIndex(null);
  }, [quiz?.newsId]);

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
      <View
        style={[styles.container, styles.loadingContainer]}
        onLayout={(e) =>
          onContentSizeChange?.(
            e.nativeEvent.layout.width,
            e.nativeEvent.layout.height,
          )
        }
      >
        <LoadingNewsOverlay visible messages={QUIZ_LOADING_MESSAGES} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, styles.errorContainer]}
        onLayout={(e) =>
          onContentSizeChange?.(
            e.nativeEvent.layout.width,
            e.nativeEvent.layout.height,
          )
        }
      >
        <Text variant="muted">{error}</Text>
      </View>
    );
  }

  if (!quiz || !quiz.questions?.length) {
    return (
      <View
        style={[styles.container, styles.errorContainer]}
        onLayout={(e) =>
          onContentSizeChange?.(
            e.nativeEvent.layout.width,
            e.nativeEvent.layout.height,
          )
        }
      >
        <Text variant="muted">No se pudo generar el quiz.</Text>
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, styles.contentWithButtonSpace]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(w, h) => onContentSizeChange?.(w, h)}
      >
        <Text variant="h3" style={styles.title}>
          Repasar pregunta {displayIndex + 1}
        </Text>
        <Text variant="muted" style={styles.subtitle}>
          {displayIndex + 1} de {total}
        </Text>

        <QuestionBlock
          question={currentQuestion}
          index={displayIndex}
          selectedIndex={answers[displayIndex] ?? null}
          onSelect={() => {}}
        />

        <View style={styles.nextContainer}>
          <Button
            onPress={() => setReviewingIndex(null)}
            variant="default"
            size="lg"
            style={styles.nextButton}
          >
            <Text>Volver a resultados</Text>
          </Button>
        </View>
      </ScrollView>
    );
  }

  // Pantalla de resumen final
  if (allAnswered) {
    const passed = correctCount / total >= PASS_THRESHOLD;

    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(w, h) => onContentSizeChange?.(w, h)}
      >
        <Text variant="h3" style={styles.resultsTitle}>
          Resultados del test
        </Text>
        <View style={styles.resultsQuestionsRow}>
          {quiz.questions.map((_, qIdx) => {
            const selected = answers[qIdx];
            const isCorrect =
              selected !== undefined &&
              selected === quiz.questions[qIdx].correctAnswerIndex;
            const bgColor = isCorrect ? '#22c55e' : '#ef4444';
            const isLast = qIdx === quiz.questions.length - 1;
            return (
              <Pressable
                key={qIdx}
                onPress={() => setReviewingIndex(qIdx)}
                style={[
                  styles.resultsQuestionBadge,
                  {
                    backgroundColor: bgColor + '22',
                    borderRightWidth: isLast ? 0 : 1,
                    borderRightColor: 'rgba(0,0,0,0.15)',
                  },
                ]}
              >
                <Text
                  variant="default"
                  style={[styles.resultsQuestionBadgeText, { color: bgColor }]}
                >
                  {qIdx + 1}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.resultsScoreWrapper}>
          <Text variant="default" style={styles.resultsScore}>
            {correctCount}/{total} ({Math.round((correctCount / total) * 100)}%)
          </Text>
        </View>
        <View
          style={[
            styles.resultsVerdict,
            { backgroundColor: passed ? '#22c55e22' : '#ef444422' },
          ]}
        >
          <Text
            variant="h3"
            style={[
              styles.resultsVerdictText,
              {
                color: passed ? '#22c55e' : '#ef4444',
                fontWeight: '500',
              },
            ]}
          >
            {passed ? '¡Has aprobado!' : 'No has aprobado'}
          </Text>
          <Text variant="muted" style={styles.resultsVerdictSub}>
            {passed
              ? 'Has demostrado comprender los conceptos clave.'
              : 'Repasa el contenido de la noticia e inténtalo de nuevo.'}
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Pregunta actual
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, styles.contentWithButtonSpace]}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={(w, h) => onContentSizeChange?.(w, h)}
    >
      <Text variant="h3" style={styles.title}>
        Test de comprensión
      </Text>
      <Text variant="muted" style={styles.subtitle}>
        Pregunta {currentIndex + 1} de {total}
      </Text>

      <QuestionBlock
        question={currentQuestion}
        index={currentIndex}
        selectedIndex={answers[currentIndex] ?? null}
        onSelect={(opt) => handleSelectOption(currentIndex, opt)}
      />

      <View style={styles.nextContainer}>
        <Button
          onPress={handleNext}
          disabled={!currentAnswered}
          variant={currentAnswered ? 'default' : 'secondary'}
          size="lg"
          style={styles.nextButton}
        >
          <Text>
            {currentIndex < total - 1 ? 'Siguiente pregunta' : 'Ver resultados'}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}

type QuestionBlockProps = {
  question: QuizQuestion;
  index: number;
  selectedIndex: number | null;
  onSelect: (optionIndex: number) => void;
};

function QuestionBlock({
  question,
  index,
  selectedIndex,
  onSelect,
}: QuestionBlockProps) {
  const isAnswered = selectedIndex !== null;

  return (
    <View style={styles.questionBlock}>
      <Text variant="default" style={styles.questionText}>
        {index + 1}. {question.question}
      </Text>
      {question.options.map((opt, optIndex) => {
        let bgColor: string | undefined;
        if (!isAnswered) {
          bgColor = undefined;
        } else if (optIndex === question.correctAnswerIndex) {
          bgColor = '#22c55e';
        } else if (optIndex === selectedIndex) {
          bgColor = AppColors.light.destructive ?? '#ef4444';
        }

        return (
          <Pressable
            key={optIndex}
            onPress={() => onSelect(optIndex)}
            disabled={isAnswered}
            style={[
              styles.option,
              bgColor && {
                backgroundColor: bgColor + '30',
                borderColor: bgColor,
              },
            ]}
          >
            <Text
              variant="default"
              style={[styles.optionText, bgColor && { color: bgColor }]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  contentWithButtonSpace: {
    paddingBottom: 20,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
  },
  questionBlock: {
    marginBottom: 24,
  },
  questionText: {
    marginBottom: 12,
    fontWeight: '600',
    fontSize: 16,
  },
  option: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.4)',
  },
  optionText: {},
  nextContainer: {
    marginTop: 8,
    width: '100%',
  },
  nextButton: {
    width: '100%',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  resultsContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  resultsTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  resultsQuestionsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  resultsQuestionBadge: {
    flex: 1,
    minWidth: 24,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsQuestionBadgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsScoreWrapper: {
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  resultsScore: {
    fontSize: 20,
    fontWeight: '700',
  },
  resultsVerdict: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultsVerdictText: {
    marginBottom: 8,
  },
  resultsVerdictSub: {
    textAlign: 'center',
  },
});
