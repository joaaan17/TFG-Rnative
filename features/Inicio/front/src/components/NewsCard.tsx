import React from 'react';
import { Image } from 'expo-image';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/shared/components/ui/card';
import { Text } from '@/shared/components/ui/text';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';

import type { NewsPreview } from '../types/inicio.types';
import { newsCardStyles } from './NewsCard.styles';

export type NewsCardProps = {
  item: NewsPreview;
  onPress?: (item: NewsPreview) => void;
};

export function NewsCard({ item, onPress }: NewsCardProps) {
  return (
    <Card>
      <CardHeader>
        <TypewriterTextComponent
          text={item.title}
          speed={35}
          variant="h4"
          useDefaultFontFamily={false}
          className="border-0 pb-0"
        />

        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={newsCardStyles.image}
            contentFit="cover"
          />
        ) : null}
      </CardHeader>

      <CardContent>
        {item.excerpt ? (
          <Text variant="muted">{item.excerpt}</Text>
        ) : (
          <Text variant="muted"> </Text>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button
          className="w-full"
          onPress={() => {
            onPress?.(item);
          }}
        >
          <Text>Ver noticia</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default NewsCard;
