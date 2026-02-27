import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

const TREND_UP_COLOR = '#16A34A';

export type AssetCardTrend = 'up' | 'down';

export type AssetCardProps = {
  name: string;
  symbol: string;
  shares?: string;
  price: string; // valor en cartera
  change: string;
  changePercent?: string;
  trend: AssetCardTrend;
  profits?: string;
  iconBackgroundColor?: string;
  /** Color del texto/icono en el círculo (cuando el fondo es oscuro) */
  iconTextColor?: string;
  /** Datos para el mini gráfico (serie de valores) */
  sparklineData?: number[];
  /** primary = color sólido, primaryTransparent = azul semitransparente, accent = tinte sutil, neutral = card estándar */
  variant?: 'primary' | 'primaryTransparent' | 'accent' | 'neutral';
  onPress?: () => void;
  icon?: React.ReactNode;
};

function generateDefaultSparkline(seed: number): number[] {
  const out: number[] = [];
  let v = 100;
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    const drift = 15 * t;
    const wave = 6 * Math.sin((i + seed) * 0.4);
    v = 100 + drift + wave;
    out.push(v);
  }
  return out;
}

function MiniSparkline({
  data,
  width,
  height,
  lineColor,
}: {
  data: number[];
  width: number;
  height: number;
  lineColor: string;
}) {
  if (data.length < 2 || width <= 0 || height <= 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = Math.max(1e-6, max - min);
  const padY = 4;

  const points = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width;
    const yNorm = (v - min) / span;
    const y = padY + (1 - yNorm) * (height - padY * 2);
    return { x, y };
  });

  const d =
    `M ${points[0].x} ${points[0].y} ` +
    points
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(' ');

  return (
    <Svg width={width} height={height}>
      <Path
        d={d}
        fill="none"
        stroke={lineColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AssetCard({
  name,
  symbol,
  shares,
  price,
  change,
  changePercent,
  trend,
  profits,
  iconBackgroundColor,
  iconTextColor,
  sparklineData,
  variant = 'neutral',
  onPress,
  icon,
}: AssetCardProps) {
  const palette = usePalette();
  const [chartWidth, setChartWidth] = React.useState(0);

  const isUp = trend === 'up';
  const trendColor = isUp ? TREND_UP_COLOR : palette.destructive;
  const data = sparklineData ?? generateDefaultSparkline(symbol.charCodeAt(0));

  const cardBg =
    variant === 'primary'
      ? palette.primary
      : variant === 'primaryTransparent'
        ? `${palette.primary}33`
        : variant === 'accent'
          ? `${palette.primary}12`
          : palette.cardBackground;
  const cardBorder =
    variant === 'primary'
      ? palette.primary
      : variant === 'primaryTransparent'
        ? `${palette.primary}50`
        : variant === 'accent'
          ? `${palette.primary}25`
          : (palette.surfaceBorder ?? palette.surfaceMuted);
  const separatorColor =
    variant === 'primary'
      ? `${palette.primaryText ?? '#FFFFFF'}40`
      : cardBorder;
  const chartLineColor =
    variant === 'primary'
      ? `${palette.primaryText ?? '#FFFFFF'}50`
      : `${palette.primary}50`;
  const textColor =
    variant === 'primary' ? (palette.primaryText ?? '#FFFFFF') : palette.text;
  const labelColor =
    variant === 'primary'
      ? `${palette.primaryText ?? '#FFFFFF'}CC`
      : (palette.icon ?? palette.text);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name} ${price}`}
      onPress={onPress}
      style={[
        styles.root,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: iconBackgroundColor ?? palette.surfaceMuted,
            },
          ]}
        >
          {icon ?? (
            <Text
              style={[
                Hierarchy.bodySmallSemibold,
                { color: iconTextColor ?? palette.text },
              ]}
            >
              {name.slice(0, 1).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.meta}>
          <Text
            style={[Hierarchy.bodySmallSemibold, { color: textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {symbol}
          </Text>
          {shares ? (
            <Text
              style={[Hierarchy.caption, { color: labelColor, opacity: 0.9 }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {shares}
            </Text>
          ) : null}
        </View>

        <View style={styles.performance}>
          <Text
            style={[Hierarchy.bodySmallSemibold, { color: trendColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {changePercent ?? change}
          </Text>
          <Text
            style={[Hierarchy.caption, { color: labelColor, opacity: 0.9 }]}
            numberOfLines={1}
          >
            Por año
          </Text>
        </View>
      </View>

      <View style={[styles.separator, { backgroundColor: separatorColor }]} />

      <View
        style={styles.chartWrap}
        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
      >
        <MiniSparkline
          data={data}
          width={chartWidth}
          height={44}
          lineColor={chartLineColor}
        />
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.bottomItem}>
          <Text
            style={[Hierarchy.caption, { color: labelColor, opacity: 0.9 }]}
            numberOfLines={1}
          >
            Valor
          </Text>
          <Text
            style={[Hierarchy.bodySmallSemibold, { color: textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {price}
          </Text>
        </View>
        <View style={[styles.bottomItem, styles.bottomItemRight]}>
          <Text
            style={[Hierarchy.caption, { color: labelColor, opacity: 0.9 }]}
            numberOfLines={1}
          >
            Beneficios
          </Text>
          <Text
            style={[
              Hierarchy.bodySmallSemibold,
              { color: profits ? trendColor : textColor },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {profits ?? change}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const CARD_MIN_HEIGHT = 196;

// Misma sombra sutil que el input "Escribe tu pregunta" (shadow-sm shadow-black/5)
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
  root: {
    width: '100%',
    minHeight: CARD_MIN_HEIGHT,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    ...(inputLikeShadow as object),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
    gap: 1,
  },
  performance: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 1,
    minWidth: 56,
  },
  separator: {
    height: 1,
    marginTop: 10,
    marginBottom: 8,
  },
  chartWrap: {
    height: 40,
    width: '100%',
  },
  bottomRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 16,
  },
  bottomItem: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  bottomItemRight: {
    alignItems: 'flex-end',
  },
});

export default AssetCard;
