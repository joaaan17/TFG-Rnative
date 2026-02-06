import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import { iapreguntasService } from '../services/iapreguntasService';
import {
  IA_PREGUNTAS_WELCOME_MESSAGES,
  type ChatMessage,
} from '../types/iapreguntas.types';

export type UseIApreguntasViewModelResult = {
  typewriterKey: number;
  questionText: string;
  setQuestionText: (value: string) => void;
  welcomeText: string;
  loading: boolean;
  messages: ChatMessage[];
  error: string | null;
  ask: () => Promise<void>;
};

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useIApreguntasViewModel(): UseIApreguntasViewModelResult {
  const { session } = useAuthSession();
  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [questionText, setQuestionText] = React.useState('');
  const [welcomeText, setWelcomeText] = React.useState<string>(
    IA_PREGUNTAS_WELCOME_MESSAGES[0],
  );
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      const index = Math.floor(
        Math.random() * IA_PREGUNTAS_WELCOME_MESSAGES.length,
      );
      setWelcomeText(IA_PREGUNTAS_WELCOME_MESSAGES[index]);
      return undefined;
    }, []),
  );

  const ask = React.useCallback(async () => {
    const token = session?.token;
    if (!token) {
      setError('Debes iniciar sesión para consultar');
      return;
    }
    const text = questionText.trim();
    if (!text) return;

    setQuestionText('');
    setError(null);

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await iapreguntasService.askMarketAI(text, token);
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: res.answer,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al consultar la IA');
    } finally {
      setLoading(false);
    }
  }, [questionText, session?.token]);

  return {
    typewriterKey,
    questionText,
    setQuestionText,
    welcomeText,
    loading,
    messages,
    error,
    ask,
  };
}
