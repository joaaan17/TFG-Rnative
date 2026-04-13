import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import { profileService } from '@/features/profile/front/src/services/profileService';
import { applyXpFromServerAward } from '@/features/profile/front/src/utils/applyXpFromServerAward';
import {
  getLocalRemaining,
  recordQuestionUsed,
  syncFromServer,
} from '../cache/consultorioQuotaCache';
import { iapreguntasService } from '../services/iapreguntasService';
import {
  CONSULTORIO_MAX_DAILY,
  CONSULTORIO_XP_PER_QUESTION,
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
  /** XP otorgado en la última consulta; null = sin recompensa pendiente. */
  lastAwardedXp: number | null;
  dismissXpReward: () => void;
  /** Preguntas que puedes hacer hoy (null = cargando). */
  consultorioRemainingToday: number | null;
  /** Nombre del usuario autenticado para el saludo del consultorio. */
  nombreUsuario: string;
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
  const [lastAwardedXp, setLastAwardedXp] = React.useState<number | null>(null);
  const [consultorioRemainingToday, setConsultorioRemainingToday] =
    React.useState<number | null>(null);

  const nombreUsuario = React.useMemo(() => {
    const n = session?.user?.name?.trim();
    return n && n.length > 0 ? n : 'Usuario';
  }, [session?.user?.name]);

  const loadConsultorioQuota = React.useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setConsultorioRemainingToday(null);
      return;
    }

    const localRemaining = await getLocalRemaining();

    try {
      const p = await profileService.getProfile(userId, session?.token);
      const serverRemaining =
        typeof p.consultorioRemainingToday === 'number'
          ? p.consultorioRemainingToday
          : null;

      if (serverRemaining !== null) {
        await syncFromServer(serverRemaining);
        setConsultorioRemainingToday(serverRemaining);
      } else {
        setConsultorioRemainingToday(localRemaining);
      }
    } catch {
      setConsultorioRemainingToday(localRemaining);
    }
  }, [session?.user?.id, session?.token]);

  React.useEffect(() => {
    void loadConsultorioQuota();
  }, [loadConsultorioQuota]);

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      const index = Math.floor(
        Math.random() * IA_PREGUNTAS_WELCOME_MESSAGES.length,
      );
      setWelcomeText(IA_PREGUNTAS_WELCOME_MESSAGES[index]);
      void loadConsultorioQuota();
      return undefined;
    }, [loadConsultorioQuota]),
  );

  const dismissXpReward = React.useCallback(() => {
    setLastAwardedXp(null);
  }, []);

  const ask = React.useCallback(async () => {
    const token = session?.token;
    if (!token) {
      setError('Debes iniciar sesión para consultar');
      return;
    }
    const text = questionText.trim();
    if (!text) return;

    if (consultorioRemainingToday !== null && consultorioRemainingToday <= 0) {
      setError(
        'Has alcanzado el límite de 2 preguntas al día. Vuelve mañana.',
      );
      return;
    }

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

      const localAfterUse = await recordQuestionUsed();

      const remaining =
        typeof res.consultorioRemainingToday === 'number'
          ? res.consultorioRemainingToday
          : localAfterUse;
      const clamped = Math.max(0, remaining);

      if (typeof res.consultorioRemainingToday === 'number') {
        await syncFromServer(clamped);
      }
      setConsultorioRemainingToday(clamped);

      const xp =
        typeof res.experienceAwarded === 'number' && res.experienceAwarded > 0
          ? res.experienceAwarded
          : CONSULTORIO_XP_PER_QUESTION;

      if (typeof res.newTotal === 'number') {
        applyXpFromServerAward(xp, res.newTotal);
      }
      setLastAwardedXp(xp);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al consultar la IA';
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      if (msg.includes('límite')) {
        setConsultorioRemainingToday(0);
        void syncFromServer(0);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [
    questionText,
    session?.token,
    consultorioRemainingToday,
  ]);

  return {
    typewriterKey,
    questionText,
    setQuestionText,
    welcomeText,
    loading,
    messages,
    error,
    ask,
    lastAwardedXp,
    dismissXpReward,
    consultorioRemainingToday,
    nombreUsuario,
  };
}
