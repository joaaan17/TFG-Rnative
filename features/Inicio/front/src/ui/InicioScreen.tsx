import React from 'react';
import { FlatList, ScrollView, View } from 'react-native';

import AppShellComponent from '@/shared/components/layout/AppShell';
import { CardModal } from '@/shared/components/card-modal';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { Text } from '@/shared/components/ui/text';
import { Image } from 'expo-image';

import { mainStyles } from './Inicio.styles';
import { useInicioViewModel } from '../state/useInicioViewModel';
import { NewsCard } from '../components/NewsCard';
import { LoadingNewsOverlay } from '../components/LoadingNewsOverlay';
import { EducationalNewsContent } from '../components/EducationalNewsContent';

/**
 * Pantalla tonta. Solo renderiza y conecta props/handlers del ViewModel.
 */
export function InicioScreen() {
  const {
    typewriterKey,
    news,
    selectedNews,
    isNewsModalOpen,
    loading,
    loadingNews,
    error,
    openNews,
    closeNewsModal,
  } = useInicioViewModel();

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
          <View style={{ flex: 1, minHeight: 0 }}>
            <View
              style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 }}
            >
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
                  style={{
                    width: '100%',
                    height: 180,
                    borderRadius: 12,
                    marginTop: 12,
                  }}
                  contentFit="cover"
                />
              ) : null}
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 24,
              }}
              showsVerticalScrollIndicator
            >
              <EducationalNewsContent
                key={`${selectedNews.id}-content`}
                content={selectedNews.content}
                typewriterSpeed={8}
              />
            </ScrollView>
          </View>
        ) : null}
      </CardModal>
    </AppShellComponent>
  );
}

export default InicioScreen;
