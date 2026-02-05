import React from 'react';
import {
  FlatList,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import AppShellComponent from '@/shared/components/layout/AppShell';
import { CardModal } from '@/shared/components/card-modal';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { Text } from '@/shared/components/ui/text';

import { mainStyles } from './Main.styles';
import NewsCardComponent from './components/NewsCard';
import type { NewsItem } from './news.types';

export function MainScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [selectedNews, setSelectedNews] = React.useState<NewsItem | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = React.useState(false);
  // Altura máxima del scroll para que el modal se adapte al contenido pero permita scroll si es largo
  const scrollMaxHeight = Math.max(200, windowHeight * 0.6);

  // Re-dispara la animación cada vez que entras a esta pantalla (desde donde sea)
  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      return undefined;
    }, []),
  );

  // Fuente de datos (en el futuro vendrá de API/estado global)
  const news: NewsItem[] = [
    {
      id: '1',
      title: 'NOTICIA 1',
      excerpt: 'Contenido de ejemplo',
      content:
        'Este es un contenido de ejemplo para la Noticia 1.\n\n' +
        'Aquí iría el cuerpo completo de la noticia: explicación, contexto y conclusiones. ' +
        'La idea es que sea lo suficientemente largo como para probar el scroll dentro del modal.\n\n' +
        'Párrafo adicional: Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n' +
        'Párrafo final: Puedes reemplazar este texto por datos reales cuando conectes con tu API.',
      imageUrl: 'https://picsum.photos/800/400?random=1',
    },
    {
      id: '2',
      title: 'NOTICIA 2',
      excerpt: 'Contenido de ejemplo',
      content:
        'Este es un contenido de ejemplo para la Noticia 2.\n\n' +
        'Más detalles, cifras, y un análisis breve.\n\n' +
        'Otro párrafo para forzar el scroll: Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
        'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      imageUrl: 'https://picsum.photos/800/400?random=2',
    },
    {
      id: '3',
      title: 'NOTICIA 3',
      excerpt: 'Contenido de ejemplo',
      content:
        'Este es un contenido de ejemplo para la Noticia 3.\n\n' +
        'Resumen largo para comprobar comportamiento del modal.\n\n' +
        'Notas: el contenido real vendrá de tu backend/servicio.',
      imageUrl: 'https://picsum.photos/800/400?random=3',
    },
  ];

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
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={mainStyles.content}
        data={news}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NewsCardComponent
            item={item}
            onPress={(pressedItem) => {
              setSelectedNews(pressedItem);
              setIsNewsModalOpen(true);
            }}
          />
        )}
      />

      <CardModal
        open={isNewsModalOpen}
        onClose={() => {
          setIsNewsModalOpen(false);
        }}
      >
        <View
          style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 }}
        >
          <TypewriterTextComponent
            key={selectedNews?.id ?? 'news-modal-title'}
            text={selectedNews?.title ?? ''}
            useDefaultFontFamily={false}
            speed={60}
            variant="h3"
            className="border-0 pb-0"
          />
        </View>

        <ScrollView
          style={{ maxHeight: scrollMaxHeight }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {selectedNews?.content ? (
            <Text variant="muted">{selectedNews.content}</Text>
          ) : (
            <Text variant="muted"> </Text>
          )}
        </ScrollView>
      </CardModal>
    </AppShellComponent>
  );
}

export default MainScreen;
