import React from 'react';
import { FlatList, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import AppShellComponent from '@/shared/components/layout/AppShell';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';

import { mainStyles } from './Main.styles';
import NewsCardComponent from './components/NewsCard';
import type { NewsItem } from './news.types';

export function MainScreen() {
  const [typewriterKey, setTypewriterKey] = React.useState(0);

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
      imageUrl: 'https://picsum.photos/800/400?random=1',
    },
    {
      id: '2',
      title: 'NOTICIA 2',
      excerpt: 'Contenido de ejemplo',
      imageUrl: 'https://picsum.photos/800/400?random=2',
    },
    {
      id: '3',
      title: 'NOTICIA 3',
      excerpt: 'Contenido de ejemplo',
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
        renderItem={({ item }) => (
          <NewsCardComponent
            item={item}
            onPress={() => {
              // TODO: navegar a detalle de noticia
            }}
          />
        )}
      />
    </AppShellComponent>
  );
}

export default MainScreen;
