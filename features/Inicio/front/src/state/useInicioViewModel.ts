import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import { useAwardExperience } from '@/features/profile/front/src/hooks/useAwardExperience';
import {
  loadHeadlines,
  loadEducationalNews,
  loadQuiz,
  type NewsPreview,
  type EducationalNews,
  type NewsQuiz,
} from '../services/inicioService';

export type UseInicioViewModelResult = {
  typewriterKey: number;
  news: NewsPreview[];
  selectedNews: EducationalNews | null;
  newsXpAwarded: number | null;
  isNewsModalOpen: boolean;
  isQuizModalOpen: boolean;
  quiz: NewsQuiz | null;
  quizAnswers: Record<number, number>;
  onQuizAnswer: (qIndex: number, optionIndex: number) => void;
  loading: boolean;
  loadingNews: boolean;
  loadingQuiz: boolean;
  error: string | null;
  openNews: (item: NewsPreview) => Promise<void>;
  closeNewsModal: (opts?: { preserveQuiz?: boolean }) => void;
  openQuiz: () => Promise<void>;
  closeQuizModal: () => void;
  onQuizComplete: (correctCount: number) => void;
  refreshHeadlines: () => Promise<void>;
};

export function useInicioViewModel(): UseInicioViewModelResult {
  const { session } = useAuthSession();
  const { height: windowHeight } = useWindowDimensions();
  const { award } = useAwardExperience();

  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [news, setNews] = React.useState<NewsPreview[]>([]);
  const [selectedNews, setSelectedNews] =
    React.useState<EducationalNews | null>(null);
  const [newsXpAwarded, setNewsXpAwarded] = React.useState<number | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = React.useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = React.useState(false);
  const [quiz, setQuiz] = React.useState<NewsQuiz | null>(null);
  const [quizAnswers, setQuizAnswers] = React.useState<Record<number, number>>(
    {},
  );
  const quizStoreRef = React.useRef<Map<string, NewsQuiz>>(new Map());
  const answersStoreRef = React.useRef<Map<string, Record<number, number>>>(
    new Map(),
  );
  /** newsId del quiz actual (se mantiene al cerrar el modal de noticia para que las respuestas funcionen) */
  const currentQuizNewsIdRef = React.useRef<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadingNews, setLoadingNews] = React.useState(false);
  const [loadingQuiz, setLoadingQuiz] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const scrollMaxHeight = React.useMemo(
    () => Math.max(200, windowHeight * 0.6),
    [windowHeight],
  );

  const token = session?.token;

  const fetchHeadlines = React.useCallback(async () => {
    console.log(
      '[iaNoticias FRONT] ViewModel: fetchHeadlines, token=',
      !!token,
    );
    if (!token) {
      console.log(
        '[iaNoticias FRONT] ViewModel: fetchHeadlines SKIP - sin token',
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headlines = await loadHeadlines(token);
      console.log(
        '[iaNoticias FRONT] ViewModel: fetchHeadlines OK, count=',
        headlines?.length ?? 0,
      );
      setNews(headlines);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar noticias';
      console.log('[iaNoticias FRONT] ViewModel: fetchHeadlines ERROR', msg);
      setError(msg);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const openNews = React.useCallback(
    async (item: NewsPreview) => {
      console.log(
        '[iaNoticias FRONT] ViewModel: openNews item.id=',
        item?.id?.slice(0, 50),
        'token=',
        !!token,
      );
      if (!token) {
        console.log('[iaNoticias FRONT] ViewModel: openNews SKIP - sin token');
        return;
      }
      setSelectedNews(null);
      setIsNewsModalOpen(true);
      setLoadingNews(true);
      setError(null);
      try {
        const educational = await loadEducationalNews(item.id, token);
        console.log('[iaNoticias FRONT] ViewModel: openNews OK');
        setSelectedNews(educational);
        const xp = await award('VIEW_NEWS', { newsId: item.id });
        setNewsXpAwarded(xp);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : 'Error al procesar la noticia';
        console.log('[iaNoticias FRONT] ViewModel: openNews ERROR', msg);
        setError(msg);
      } finally {
        setLoadingNews(false);
      }
    },
    [token, award],
  );

  const closeNewsModal = React.useCallback(
    (opts?: { preserveQuiz?: boolean }) => {
      setIsNewsModalOpen(false);
      setSelectedNews(null);
      setNewsXpAwarded(null);
      if (!opts?.preserveQuiz) {
        setQuiz(null);
        setQuizAnswers({});
      }
    },
    [],
  );

  const openQuiz = React.useCallback(async () => {
    if (!token || !selectedNews) return;
    const newsId = selectedNews.id;
    currentQuizNewsIdRef.current = newsId;
    setIsQuizModalOpen(true);

    const cached = quizStoreRef.current.get(newsId);
    if (cached) {
      setQuiz(cached);
      setQuizAnswers(answersStoreRef.current.get(newsId) ?? {});
      setLoadingQuiz(false);
      return;
    }

    setQuiz(null);
    setQuizAnswers({});
    setLoadingQuiz(true);
    setError(null);
    try {
      const quizData = await loadQuiz(newsId, token);
      quizStoreRef.current.set(newsId, quizData);
      answersStoreRef.current.set(newsId, {});
      setQuiz(quizData);
      setQuizAnswers({});
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar el quiz';
      setError(msg);
    } finally {
      setLoadingQuiz(false);
    }
  }, [token, selectedNews]);

  const closeQuizModal = React.useCallback(() => {
    setIsQuizModalOpen(false);
    currentQuizNewsIdRef.current = null;
  }, []);

  const onQuizComplete = React.useCallback(
    (correctCount: number) => {
      award('COMPLETE_QUIZ', { correctCount: String(correctCount) });
    },
    [award],
  );

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      fetchHeadlines();
      return undefined;
    }, [fetchHeadlines]),
  );

  const onQuizAnswer = React.useCallback(
    (qIndex: number, optionIndex: number) => {
      const newsId = currentQuizNewsIdRef.current ?? selectedNews?.id;
      if (!newsId) return;
      const next = {
        ...(answersStoreRef.current.get(newsId) ?? {}),
        [qIndex]: optionIndex,
      };
      answersStoreRef.current.set(newsId, next);
      setQuizAnswers(next);
    },
    [selectedNews],
  );

  return {
    typewriterKey,
    news,
    selectedNews,
    newsXpAwarded,
    isNewsModalOpen,
    isQuizModalOpen,
    quiz,
    quizAnswers,
    onQuizAnswer,
    loading,
    loadingNews,
    loadingQuiz,
    error,
    openNews,
    closeNewsModal,
    openQuiz,
    closeQuizModal,
    onQuizComplete,
    refreshHeadlines: fetchHeadlines,
  };
}
