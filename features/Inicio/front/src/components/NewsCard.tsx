import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageOff } from 'lucide-react-native';

import { Button } from '@/shared/components/ui/button';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';

import type { NewsPreview } from '../types/inicio.types';
import { createNewsCardStyles } from './NewsCard.styles';

export type NewsCardProps = {
  item: NewsPreview;
  index?: number;
  cardWidth: number;
  cardHeight: number;
  onPress?: (item: NewsPreview) => void;
};

function formatDate(publishedAt: string) {
  const d = new Date(publishedAt);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function NewsCard({
  item,
  index = 0,
  cardWidth,
  cardHeight,
  onPress,
}: NewsCardProps) {
  const palette = usePalette();
  const s = React.useMemo(() => createNewsCardStyles(palette), [palette]);
  const isDark = palette.background === '#070B14' || (palette.background?.length && palette.background.startsWith('#0'));
  const placeholderGradientColors = React.useMemo(
    () =>
      isDark
        ? [
            palette.surfaceMuted ?? '#1A1F2E',
            palette.cardBackground ?? '#151A26',
            palette.surfaceMuted ?? '#1A1F2E',
          ]
        : [
            palette.surfaceMuted ?? '#EEF2F7',
            palette.cardBackground ?? '#F8FAFC',
            palette.surfaceMuted ?? '#EEF2F7',
          ],
    [isDark, palette.surfaceMuted, palette.cardBackground],
  );
  const dateLabel = formatDate(item.publishedAt);
  const sourceLabel = (item.source || '').trim() || 'Noticias';
  const metaLine = dateLabel ? `${sourceLabel.toUpperCase()} · ${dateLabel}` : sourceLabel.toUpperCase();

  return (
    <View style={[s.card, { width: cardWidth, height: cardHeight }]}>
      <View style={s.imageWrap}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={s.image}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={placeholderGradientColors}
            locations={[0, 0.5, 1]}
            style={s.imagePlaceholder}
          >
            <View style={s.imagePlaceholderIconWrap}>
              <ImageOff
                size={48}
                color={palette.icon ?? palette.text}
                strokeWidth={1.4}
                style={{ opacity: 0.55 }}
              />
            </View>
            <Text
              style={[s.imagePlaceholderLabel, { color: palette.icon ?? palette.text }]}
              numberOfLines={1}
            >
              Sin imagen
            </Text>
          </LinearGradient>
        )}
      </View>

      <View style={s.content}>
        <View style={s.contentBody}>
          <View style={s.sectionRow}>
            <View style={s.sectionAccent} />
            <Text style={s.sectionLabel} numberOfLines={1}>
              {metaLine}
            </Text>
          </View>

          <Text style={s.title} numberOfLines={3}>
            {item.title}
          </Text>

          {(item.excerpt || '').trim() ? (
            <Text style={s.excerpt} numberOfLines={5}>
              {item.excerpt}
            </Text>
          ) : null}
        </View>

        <View style={s.ctaWrap}>
          <Button
            variant="default"
            size="sm"
            style={s.ctaButton}
            onPress={() => onPress?.(item)}
          >
            <Text>Leer más</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

export default NewsCard;
