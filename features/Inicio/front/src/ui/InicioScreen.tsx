import React, { useCallback, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import AppShellComponent from '@/shared/components/layout/AppShell';
import { CardModal } from '@/shared/components/card-modal';
import { Button } from '@/shared/components/ui/button';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { Text } from '@/shared/components/ui/text';
import { Image } from 'expo-image';

import { mainStyles } from './Inicio.styles';
import { useInicioViewModel } from '../state/useInicioViewModel';
import { NewsCard } from '../components/NewsCard';
import { LoadingNewsOverlay } from '../components/LoadingNewsOverlay';
import { EducationalNewsContent } from '../components/EducationalNewsContent';
import { QuizModalContent } from '../components/QuizModalContent';

/**
 * Pantalla tonta. Solo renderiza y conecta props/handlers del ViewModel.
 */
export function InicioScreen() {
  const {
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
  } = useInicioViewModel();

  const [quizContentHeight, setQuizContentHeight] = useState(0);
  const handleQuizContentSize = useCallback((_w: number, h: number) => {
    setQuizContentHeight(h);
  }, []);

  return (
    <AppShellComponent>
      <View style={mainStyles.header}>
        <TypewriterTextComponent
          key={typewriterKey}
          text="NOTICIAS"
          speed={40}
          variant="h3"
          className="border-0 pb-0"
        />
      </View>

      {error ? (
        <View style={mainStyles.content}>
          <Text variant="muted">{error}</Text>
        </View>
      ) : loading ? (
        <View style={mainStyles.content}>
          <Text variant="muted">Cargando noticias...</Text>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={mainStyles.content}
          data={news}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <NewsCard item={item} onPress={openNews} />
          )}
        />
      )}

      <CardModal
        open={isNewsModalOpen}
        onClose={closeNewsModal}
        maxHeightPct={loadingNews ? 0.35 : 1}
        scrollable={!loadingNews}
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
          <View style={styles.newsModalContent}>
            <ScrollView
              style={styles.newsScroll}
              contentContainerStyle={styles.newsScrollContent}
              showsVerticalScrollIndicator
            >
              <View style={styles.newsHeader}>
                <TypewriterTextComponent
                  key={selectedNews.id}
                  text={selectedNews.title}
                  useDefaultFontFamily={false}
                  speed={60}
                  variant="h3"
                  className="border-0 pb-0"
                />
                {selectedNews.imageUrl ? (
                  <Image
                    source={{ uri: selectedNews.imageUrl }}
                    style={styles.newsImage}
                    contentFit="cover"
                  />
                ) : null}
              </View>
              <EducationalNewsContent
                key={`${selectedNews.id}-content`}
                content={selectedNews.content}
                typewriterSpeed={8}
              />
            </ScrollView>
            <View style={styles.quizButtonContainer}>
              <Button
                onPress={openQuiz}
                variant="default"
                size="lg"
                style={styles.quizButton}
                accessibilityLabel="Realizar test de comprensión"
              >
                <Text>Realizar test</Text>
              </Button>
            </View>
          </View>
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
          loading={loadingQuiz}
          error={error}
          onClose={closeQuizModal}
          onContentSizeChange={handleQuizContentSize}
        />
      </CardModal>
    </AppShellComponent>
  );
}

const styles = StyleSheet.create({
  newsModalContent: {
    flex: 1,
    minHeight: 0,
  },
  newsScroll: {
    flex: 1,
  },
  newsScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  newsHeader: {
    paddingTop: 10,
    paddingBottom: 8,
  },
  newsImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 12,
  },
  quizButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    width: '100%',
  },
  quizButton: {
    width: '100%',
  },
});

export default InicioScreen;
