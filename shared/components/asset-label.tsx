import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

const TREND_UP_COLOR = '#16A34A';

export type AssetLabelTrend = 'up' | 'down';

export type AssetLabelProps = {
  name: string;
  price: string;
  change: string; // p.ej. "58,36 $"
  trend: AssetLabelTrend;
  /**
   * Icono opcional (SVG/ReactNode). Si no se pasa, se muestra una inicial.
   */
  icon?: React.ReactNode;
  /**
   * Color de fondo del contenedor del icono.
   */
  iconBackgroundColor?: string;
  /**
   * Callback opcional.
   */
  onPress?: () => void;
};

export function AssetLabel({
  name,
  price,
  change,
  trend,
  icon,
  iconBackgroundColor,
  onPress,
}: AssetLabelProps) {
  const palette = usePalette();

  const isUp = trend === 'up';
  const trendColor = isUp ? TREND_UP_COLOR : palette.destructive;
  const arrow = isUp ? '▲' : '▼';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name} ${price}`}
      onPress={onPress}
      style={[
        styles.root,
        {
          backgroundColor: palette.cardBackground,
          borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
        },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor:
                iconBackgroundColor ?? palette.surfaceMuted,
              borderColor: palette.surfaceBorder ?? 'rgba(0,0,0,0.08)',
            },
          ]}
        >
          {icon ?? (
            <Text
              variant="h4"
              style={[Hierarchy.valueSecondary, { color: palette.text }]}
            >
              {name.slice(0, 1).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.meta}>
          <Text style={Hierarchy.bodySmallSemibold}>{name}</Text>
          <Text variant="muted" style={Hierarchy.bodySmall}>
            {price}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text
          variant="large"
          style={[Hierarchy.bodySmallSemibold, { color: trendColor }]}
        >
          {arrow} {change}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 80,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  meta: {
    gap: 2,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 12,
  },
});

export default AssetLabel;
