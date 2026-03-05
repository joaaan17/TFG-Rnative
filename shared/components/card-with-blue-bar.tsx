/**
 * Card con fondo blanco y barra lateral azul (mismo estilo que AssetCard en Cartera).
 * Usa borderLeftWidth: 3 + palette.primary, borderRadius 20 y la misma sombra que la card de cartera.
 */
import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { usePalette } from '@/shared/hooks/use-palette';

const CARD_BG = '#FFFFFF';
const BORDER_RADIUS = 20;

// Misma sombra que la card de cartera (asset-card.tsx)
const inputLikeShadow = Platform.select({
  android: { elevation: 2 },
  default: {
    shadowColor: '#0B0A09',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS,
    minHeight: 96,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    justifyContent: 'center',
    ...(inputLikeShadow as object),
  },
});

export type CardWithBlueBarProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function CardWithBlueBar({ children, style }: CardWithBlueBarProps) {
  const palette = usePalette();
  const cardBorder = palette.surfaceBorder ?? palette.surfaceMuted;
  return (
    <View
      style={[
        styles.card,
        {
          borderWidth: 1,
          borderColor: cardBorder,
          borderLeftWidth: 3,
          borderLeftColor: palette.primary,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default CardWithBlueBar;
