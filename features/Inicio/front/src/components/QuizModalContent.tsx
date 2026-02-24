import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Hierarchy } from '@/design-system/typography';
import { Text } from '@/shared/components/ui/text';
import { Button } from '@/shared/components/ui/button';
import { usePalette } from '@/shared/hooks/use-palette';
import type { NewsQuiz, QuizQuestion } from '../types/inicio.types';
import { QUIZ_LOADING_MESSAGES } from '../types/inicio.types';
import { LoadingNewsOverlay } from './LoadingNewsOverlay';

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
  const palette = usePalette();
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
        <Text style={[Hierarchy.body, { color: palette.icon ?? palette.text }]}>
          {error}
        </Text>
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
        <Text style={[Hierarchy.body, { color: palette.icon ?? palette.text }]}>
          No se pudo generar el quiz.
        </Text>
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
        <Text
          style={[
            Hierarchy.titleModal,
            styles.title,
            { color: palette.text },
          ]}
        >
          Repasar pregunta {displayIndex + 1}
        </Text>
        <Text
          style={[
            Hierarchy.caption,
            styles.subtitle,
            { color: palette.icon ?? palette.text },
          ]}
        >
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
            <Text style={Hierarchy.action}>Volver a resultados</Text>
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
        <Text
          style={[
            Hierarchy.titleModal,
            styles.resultsTitle,
            { color: palette.text },
          ]}
        >
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
                  style={[
                    Hierarchy.bodySmallSemibold,
                    styles.resultsQuestionBadgeText,
                    { color: bgColor },
                  ]}
                >
                  {qIdx + 1}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.resultsScoreWrapper}>
          <Text
            style={[Hierarchy.value, styles.resultsScore, { color: palette.text }]}
          >
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
            style={[
              Hierarchy.titleModal,
              styles.resultsVerdictText,
              { color: passed ? '#22c55e' : '#ef4444' },
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
      <Text
        style={[Hierarchy.titleModal, styles.title, { color: palette.text }]}
      >
        Test de comprensión
      </Text>
      <Text
        style={[
          Hierarchy.caption,
          styles.subtitle,
          { color: palette.icon ?? palette.text },
        ]}
      >
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
          <Text style={Hierarchy.action}>
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
  const palette = usePalette();
  const isAnswered = selectedIndex !== null;

  return (
    <View style={styles.questionBlock}>
      <Text
        style={[
          Hierarchy.bodySmallSemibold,
          styles.questionText,
          { color: palette.text },
        ]}
      >
        {index + 1}. {question.question}
      </Text>
      {question.options.map((opt, optIndex) => {
        let bgColor: string | undefined;
        if (!isAnswered) {
          bgColor = undefined;
        } else if (optIndex === question.correctAnswerIndex) {
          bgColor = '#22c55e';
        } else if (optIndex === selectedIndex) {
          bgColor = palette.destructive ?? '#ef4444';
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
              style={[
                Hierarchy.body,
                styles.optionText,
                { color: bgColor ?? palette.text },
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
  },
  option: {
    padding: 14,
    borderRadius: 16,
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  resultsQuestionBadge: {
    flex: 1,
    minWidth: 24,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsQuestionBadgeText: {},
  resultsScoreWrapper: {
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  resultsScore: {},
  resultsVerdict: {
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
  },
  resultsVerdictText: {
    marginBottom: 8,
  },
  resultsVerdictSub: {
    textAlign: 'center',
  },
});
