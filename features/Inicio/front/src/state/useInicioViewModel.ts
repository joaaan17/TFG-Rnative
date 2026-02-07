import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
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
  isNewsModalOpen: boolean;
  isQuizModalOpen: boolean;
  quiz: NewsQuiz | null;
  loading: boolean;
  loadingNews: boolean;
  loadingQuiz: boolean;
  error: string | null;
  openNews: (item: NewsPreview) => Promise<void>;
  closeNewsModal: () => void;
  openQuiz: () => Promise<void>;
  closeQuizModal: () => void;
  refreshHeadlines: () => Promise<void>;
};

export function useInicioViewModel(): UseInicioViewModelResult {
  const { session } = useAuthSession();
  const { height: windowHeight } = useWindowDimensions();

  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [news, setNews] = React.useState<NewsPreview[]>([]);
  const [selectedNews, setSelectedNews] = React.useState<EducationalNews | null>(
    null,
  );
  const [isNewsModalOpen, setIsNewsModalOpen] = React.useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = React.useState(false);
  const [quiz, setQuiz] = React.useState<NewsQuiz | null>(null);
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
    console.log('[iaNoticias FRONT] ViewModel: fetchHeadlines, token=', !!token);
    if (!token) {
      console.log('[iaNoticias FRONT] ViewModel: fetchHeadlines SKIP - sin token');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headlines = await loadHeadlines(token);
      console.log('[iaNoticias FRONT] ViewModel: fetchHeadlines OK, count=', headlines?.length ?? 0);
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
      console.log('[iaNoticias FRONT] ViewModel: openNews item.id=', item?.id?.slice(0, 50), 'token=', !!token);
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
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al procesar la noticia';
        console.log('[iaNoticias FRONT] ViewModel: openNews ERROR', msg);
        setError(msg);
      } finally {
        setLoadingNews(false);
      }
    },
    [token],
  );

  const closeNewsModal = React.useCallback(() => {
    setIsNewsModalOpen(false);
    setSelectedNews(null);
  }, []);

  const openQuiz = React.useCallback(async () => {
    if (!token || !selectedNews) return;
    setIsQuizModalOpen(true);
    setQuiz(null);
    setLoadingQuiz(true);
    setError(null);
    try {
      const quizData = await loadQuiz(selectedNews.id, token);
      setQuiz(quizData);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al generar el quiz';
      setError(msg);
    } finally {
      setLoadingQuiz(false);
    }
  }, [token, selectedNews]);

  const closeQuizModal = React.useCallback(() => {
    setIsQuizModalOpen(false);
    setQuiz(null);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      fetchHeadlines();
      return undefined;
    }, [fetchHeadlines]),
  );

  return {
    typewriterKey,
    news,
    selectedNews,
    isNewsModalOpen,
    isQuizModalOpen,
    quiz,
    loading,
    loadingNews,
    loadingQuiz,
    error,
    openNews,
    closeNewsModal,
    openQuiz,
    closeQuizModal,
    refreshHeadlines: fetchHeadlines,
  };
}
