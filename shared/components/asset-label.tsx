import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import AppColors from '@/design-system/colors';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';

export type AssetLabelTrend = 'up' | 'down';

export type AssetLabelProps = {
  name: string;
  price: string;
  change: string; // p.ej. "58,36 €"
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
  const trendColor = isUp ? '#16A34A' : AppColors.light.destructive;
  const arrow = isUp ? '▲' : '▼';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name} ${price}`}
      onPress={onPress}
      style={[
        styles.root,
        {
          backgroundColor: AppColors.light.cardBackground,
          borderColor: AppColors.light.surfaceBorder,
        },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor:
                iconBackgroundColor ?? AppColors.light.surfaceMuted,
              borderColor: 'rgba(0,0,0,0.08)',
            },
          ]}
        >
          {icon ?? (
            <Text variant="h4" style={{ color: palette.text }}>
              {name.slice(0, 1).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.meta}>
          <Text>{name}</Text>
          <Text variant="muted">{price}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text variant="large" style={{ color: trendColor }}>
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
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  meta: {
    gap: 4,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 12,
  },
});

export default AssetLabel;
