import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import type { NewsQuiz, QuizQuestion } from '../types/inicio.types';
import { LoadingNewsOverlay } from './LoadingNewsOverlay';
import AppColors from '@/design-system/colors';

export type QuizModalContentProps = {
  quiz: NewsQuiz | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

type AnsweredState = Record<number, number | null>; // questionIndex -> selectedOptionIndex | null

export function QuizModalContent({
  quiz,
  loading,
  error,
}: QuizModalContentProps) {
  const [answered, setAnswered] = useState<AnsweredState>({});

  const handleSelectOption = (qIndex: number, optionIndex: number) => {
    if (answered[qIndex] !== undefined) return; // ya respondida
    setAnswered((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { flex: 1, minHeight: 100, justifyContent: 'flex-end', padding: 24 },
        ]}
      >
        <LoadingNewsOverlay visible />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text variant="muted">{error}</Text>
      </View>
    );
  }

  if (!quiz || !quiz.questions?.length) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text variant="muted">No se pudo generar el quiz.</Text>
      </View>
    );
  }

  const total = quiz.questions.length;
  const correctCount = Object.entries(answered).filter(
    ([qIdx, opt]) => quiz.questions[Number(qIdx)]?.correctAnswerIndex === opt,
  ).length;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator
    >
      <Text variant="h3" style={styles.title}>
        Test de comprensión
      </Text>
      <Text variant="muted" style={styles.subtitle}>
        {total} preguntas · {Object.keys(answered).length} respondidas
        {Object.keys(answered).length === total
          ? ` · ${correctCount}/${total} correctas`
          : ''}
      </Text>
      {quiz.questions.map((q: QuizQuestion, qIndex: number) => (
        <QuestionBlock
          key={qIndex}
          question={q}
          index={qIndex}
          selectedIndex={answered[qIndex] ?? null}
          onSelect={(opt) => handleSelectOption(qIndex, opt)}
        />
      ))}
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
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
  },
  questionBlock: {
    marginBottom: 20,
  },
  questionText: {
    marginBottom: 8,
    fontWeight: '600',
  },
  option: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.4)',
  },
  optionText: {},
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
});
