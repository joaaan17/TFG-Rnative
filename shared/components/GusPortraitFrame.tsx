import React from 'react';
import { Image } from 'expo-image';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { usePalette } from '@/shared/hooks/use-palette';
import { GUS_OFFICIAL_IMAGE } from '@/shared/constants/gusAsset';

const VARIANTS = {
  /** Modal pequeño (p. ej. info temporizador) */
  compact: { maxWidth: 208 },
  /** Diálogos estándar del mascota */
  default: { maxWidth: 268 },
  /** Subida de nivel / premios */
  large: { maxWidth: 300 },
} as const;

export type GusPortraitFrameProps = {
  variant?: keyof typeof VARIANTS;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * Marco rectangular con borde y sombra en azul corporativo; retrato oficial centrado.
 */
export function GusPortraitFrame({
  variant = 'default',
  style,
  accessibilityLabel = 'Guspresario, mascota de INVESTIA',
}: GusPortraitFrameProps) {
  const palette = usePalette();
  const primary = palette.primary ?? '#1D4ED8';
  const { maxWidth } = VARIANTS[variant];

  const isDarkBg =
    palette.background === '#070B14' || palette.background?.startsWith('#0');

  const shadow = Platform.select({
    android: { elevation: 5 },
    web: {
      boxShadow:
        '0 10px 28px rgba(29, 78, 216, 0.14), 0 4px 12px rgba(11, 18, 32, 0.07)',
    },
    default: {
      shadowColor: '#1D4ED8',
      shadowOpacity: 0.16,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
    },
  });

  return (
    <View
      style={[
        {
          alignSelf: 'center',
          width: '100%',
          maxWidth,
          borderRadius: 18,
          borderWidth: 2,
          borderColor: `${primary}66`,
          padding: 10,
          backgroundColor: `${primary}12`,
          ...shadow,
        },
        style,
      ]}
    >
      <View
        style={{
          width: '44%',
          height: 3,
          alignSelf: 'center',
          borderRadius: 2,
          backgroundColor: primary,
          opacity: 0.42,
          marginBottom: 10,
        }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <View
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: isDarkBg ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
        }}
      >
        <Image
          source={GUS_OFFICIAL_IMAGE}
          style={{ width: '100%', aspectRatio: 4 / 5 }}
          contentFit="contain"
          accessibilityLabel={accessibilityLabel}
          accessibilityIgnoresInvertColors
        />
      </View>
    </View>
  );
}
