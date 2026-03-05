import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react-native';

import { Hierarchy } from '@/design-system/typography';
import { CardModal } from '@/shared/components/card-modal';
import { Button } from '@/shared/components/ui/button';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { Text } from '@/shared/components/ui/text';
import { Image } from 'expo-image';
import { usePalette } from '@/shared/hooks/use-palette';

import { createInicioStyles, createNewsModalStyles } from './Inicio.styles';
import { useInicioViewModel } from '../state/useInicioViewModel';
import { NewsCard } from '../components/NewsCard';
import { LoadingNewsOverlay } from '../components/LoadingNewsOverlay';
import { EducationalNewsContent } from '../components/EducationalNewsContent';
import { QuizModalContent } from '../components/QuizModalContent';
import type { EducationalNews } from '../types/inicio.types';

function formatDate(publishedAt: string): string {
  const d = new Date(publishedAt);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getReadingMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

function getNivel(wordCount: number): string {
  if (wordCount < 300) return 'Corto';
  if (wordCount < 800) return 'Intermedio';
  return 'Largo';
}

function extractLead(content: string): string {
  if (!content || typeof content !== 'string') return '';
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return '';
  const withoutHeaders = normalized.replace(/^#+\s+.+$/gm, '').trim();
  const blocks = withoutHeaders
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  const firstBlock = blocks[0];
  if (firstBlock) return firstBlock;
  const fallback = normalized
    .split('\n')
    .filter((line) => !/^#+\s+/.test(line.trim()))
    .join(' ')
    .trim();
  return fallback.slice(0, 300) || normalized.slice(0, 300);
}

type NewsModalContentProps = {
  selectedNews: EducationalNews;
  palette: ReturnType<typeof usePalette>;
  onBack: () => void;
  onQuiz: () => void;
};

function NewsModalContent({
  selectedNews,
  palette,
  onBack,
  onQuiz,
}: NewsModalContentProps) {
  const modalStyles = useMemo(() => createNewsModalStyles(palette), [palette]);
  const content = selectedNews.content ?? '';
  const wordCount = useMemo(() => getWordCount(content), [content]);
  const readingMin = useMemo(() => getReadingMinutes(wordCount), [wordCount]);
  const nivel = useMemo(() => getNivel(wordCount), [wordCount]);
  const lead = useMemo(() => extractLead(content), [content]);
  const sourceLabel = (selectedNews.source || '').trim() || 'Noticias';
  const dateLabel = formatDate(selectedNews.publishedAt);
  const iconColor = palette.primaryText ?? '#FFF';
  const mutedColor = palette.icon ?? palette.text;

  return (
    <View style={modalStyles.newsModalContent}>
      <ScrollView
        style={modalStyles.newsScroll}
        contentContainerStyle={modalStyles.newsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: solo imagen y scrim (botones fuera del scroll para que reciban toques) */}
        <View style={modalStyles.newsHeroWrap}>
          {selectedNews.imageUrl ? (
            <Image
              source={{ uri: selectedNews.imageUrl }}
              style={modalStyles.newsHeroImage}
              contentFit="cover"
            />
          ) : null}
          <View style={modalStyles.newsHeroScrim} />
        </View>

        {/* Meta: fuente • fecha */}
        <View style={modalStyles.newsMetaRow}>
          <Text
            style={[
              Hierarchy.caption,
              modalStyles.newsMetaText,
              { color: mutedColor },
            ]}
          >
            {sourceLabel} • {dateLabel}
          </Text>
        </View>

        {/* Título del artículo (jerarquía principal del modal) */}
        <View style={modalStyles.newsTitleWrap}>
          <TypewriterTextComponent
            key={selectedNews.id}
            text={selectedNews.title}
            useDefaultFontFamily={false}
            speed={60}
            variant="h3"
            className="border-0 pb-0"
            style={[Hierarchy.titleModalLarge, { color: palette.text }]}
          />
        </View>

        {/* Stats en cards minimalistas azul claro */}
        <View style={modalStyles.newsStatsRow}>
          <View style={modalStyles.newsStatCard}>
            <Text
              style={[
                Hierarchy.captionSmall,
                modalStyles.newsStatCardText,
                { color: palette.primary },
              ]}
            >
              {readingMin} min lectura
            </Text>
          </View>
          <View style={modalStyles.newsStatCard}>
            <Text
              style={[
                Hierarchy.captionSmall,
                modalStyles.newsStatCardText,
                { color: palette.primary },
              ]}
            >
              {wordCount} palabras
            </Text>
          </View>
          <View style={modalStyles.newsStatCard}>
            <Text
              style={[
                Hierarchy.captionSmall,
                modalStyles.newsStatCardText,
                { color: palette.primary },
              ]}
            >
              {nivel}
            </Text>
          </View>
        </View>

        {/* Área de lectura: card redondeada al estilo perfil, con divisores */}
        <View style={modalStyles.newsReadingCard}>
          {/* Sección ABOUT */}
          <View style={modalStyles.newsSection}>
            <View style={modalStyles.newsSectionLabelRow}>
              <View style={modalStyles.newsSectionAccent} />
              <Text
                style={[
                  Hierarchy.titleSection,
                  modalStyles.newsSectionLabel,
                  { color: mutedColor },
                ]}
              >
                ABOUT
              </Text>
            </View>
            <View style={modalStyles.newsSectionDivider} />
            <Text
              style={[
                Hierarchy.body,
                modalStyles.newsLead,
                { color: palette.text },
              ]}
            >
              {lead}
            </Text>
          </View>

          {/* Sección CONTENIDO */}
          <View style={modalStyles.newsSection}>
            <View style={modalStyles.newsSectionLabelRow}>
              <View style={modalStyles.newsSectionAccent} />
              <Text
                style={[
                  Hierarchy.titleSection,
                  modalStyles.newsSectionLabel,
                  { color: mutedColor },
                ]}
              >
                CONTENIDO
              </Text>
            </View>
            <View style={modalStyles.newsSectionDivider} />
            <EducationalNewsContent
              key={`${selectedNews.id}-content`}
              content={content}
            />
          </View>
        </View>

        {/* CTA al final del modal: sin caja blanca ni raya, espaciado elegante */}
        <View style={modalStyles.quizButtonContainer}>
          <Button
            onPress={onQuiz}
            variant="default"
            size="lg"
            style={modalStyles.quizButton}
            accessibilityLabel="Realizar test de comprensión"
          >
            <Text style={Hierarchy.action}>Realizar test</Text>
            <ChevronRight
              size={20}
              color={palette.primaryText}
              strokeWidth={2}
            />
          </Button>
        </View>
      </ScrollView>
      {/* Botones del hero (atrás, test) en overlay para que siempre reciban toques por encima del scroll */}
      <View
        style={[modalStyles.newsHeroActionsOverlay, { pointerEvents: 'box-none' }]}
        collapsable={false}
      >
        <Pressable
          onPress={onBack}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={({ pressed }) => [
            modalStyles.newsHeroButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          accessibilityLabel="Volver"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={iconColor} strokeWidth={2} />
        </Pressable>
        <Pressable
          onPress={onQuiz}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={({ pressed }) => [
            modalStyles.newsHeroButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          accessibilityLabel="Realizar test de comprensión"
          accessibilityRole="button"
        >
          <Sparkles size={22} color={iconColor} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Pantalla tonta. Solo renderiza y conecta props/handlers del ViewModel.
 */
export function InicioScreen() {
  const palette = usePalette();
  const ui = useMemo(() => createInicioStyles(palette), [palette]);
  const {
    news,
    selectedNews,
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
  } = useInicioViewModel();

  const [quizContentHeight, setQuizContentHeight] = useState(0);
  const handleQuizContentSize = useCallback((_w: number, h: number) => {
    setQuizContentHeight(h);
  }, []);

  const handleOpenQuizFromNews = useCallback(() => {
    openQuiz();
    setTimeout(() => closeNewsModal({ preserveQuiz: true }), 100);
  }, [openQuiz, closeNewsModal]);

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const cardGap = 16;
  const cardWidth = screenWidth - 40;
  const cardHeight = Math.min(screenHeight * 0.72, 560);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    [],
  );

  return (
    <>
      {error ? (
        <View style={[ui.container, ui.content, { justifyContent: 'center' }]}>
          <Text variant="muted">{error}</Text>
        </View>
      ) : loading ? (
        <View style={[ui.container, ui.content, { justifyContent: 'center' }]}>
          <Text variant="muted">Cargando noticias...</Text>
        </View>
      ) : (
        <View style={ui.container}>
          <View style={ui.masthead}>
            <Text
              style={[
                Hierarchy.caption,
                ui.mastheadGreeting,
                { color: palette.icon ?? palette.text },
              ]}
            >
              {greeting}
            </Text>
            <Text
              style={[
                Hierarchy.titleModalLarge,
                ui.mastheadTitle,
                { color: palette.text },
              ]}
            >
              Noticias
            </Text>
            <Text
              style={[
                Hierarchy.caption,
                ui.mastheadDate,
                { color: palette.icon ?? palette.text },
              ]}
            >
              {todayLabel}
            </Text>
          </View>
          <FlatList
            data={news}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 24,
              paddingTop: 8,
            }}
            ItemSeparatorComponent={() => <View style={{ height: cardGap }} />}
            renderItem={({ item, index }) => (
              <NewsCard
                item={item}
                index={index}
                onPress={openNews}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
              />
            )}
          />
        </View>
      )}

      <CardModal
        open={isNewsModalOpen}
        onClose={closeNewsModal}
        maxHeightPct={loadingNews ? 0.35 : 1}
        scrollable={!loadingNews}
        contentNoPaddingTop
        contentBackgroundColor={palette.background}
      >
        {loadingNews ? (
          <View
            style={{
              flex: 1,
              minHeight: 100,
              justifyContent: 'flex-end',
              paddingHorizontal: 16,
              paddingBottom: 24,
            }}
          >
            <LoadingNewsOverlay visible />
          </View>
        ) : selectedNews ? (
          <NewsModalContent
            selectedNews={selectedNews}
            palette={palette}
            onBack={closeNewsModal}
            onQuiz={handleOpenQuizFromNews}
          />
        ) : null}
      </CardModal>

      <CardModal
        open={isQuizModalOpen}
        onClose={closeQuizModal}
        maxHeightPct={0.88}
        scrollable
        contentHeight={quizContentHeight}
      >
        <QuizModalContent
          quiz={quiz}
          answers={quizAnswers}
          onAnswer={onQuizAnswer}
          loading={loadingQuiz}
          error={error}
          onClose={closeQuizModal}
          onContentSizeChange={handleQuizContentSize}
        />
      </CardModal>
    </>
  );
}

export default InicioScreen;
