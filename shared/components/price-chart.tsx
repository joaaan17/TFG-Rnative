import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';

import AppColors from '@/design-system/colors';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';

export type PriceChartRange = '3D' | '7D' | '1M' | '6M' | '1A' | 'ALL';

export type PriceChartProps = {
  /**
   * Rango inicial seleccionado.
   */
  defaultRange?: PriceChartRange;
  /**
   * Altura del gráfico (sin contar el selector de rango).
   */
  chartHeight?: number;
  /**
   * Series por rango (opcional). Si no se pasa, usa valores por defecto.
   */
  seriesByRange?: Partial<Record<PriceChartRange, number[]>>;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function generateSeries(len: number, seed: number) {
  const out: number[] = [];
  let v = 100;
  for (let i = 0; i < len; i++) {
    // tendencia suave + oscilación + ruido determinista
    const t = i / Math.max(1, len - 1);
    const drift = 30 * t;
    const wave =
      8 * Math.sin((i + seed) * 0.35) + 3 * Math.sin((i + seed) * 0.9);
    const noise = 2 * Math.sin((i + seed) * 2.1);
    v = 100 + drift + wave + noise;
    out.push(v);
  }
  return out;
}

const DEFAULT_SERIES: Record<PriceChartRange, number[]> = {
  '3D': generateSeries(24, 3),
  '7D': generateSeries(40, 7),
  '1M': generateSeries(60, 30),
  '6M': generateSeries(90, 180),
  '1A': generateSeries(120, 365),
  ALL: generateSeries(140, 999),
};

const RANGE_LABELS: { key: PriceChartRange; label: string }[] = [
  { key: '3D', label: '3D' },
  { key: '7D', label: '7D' },
  { key: '1M', label: '1M' },
  { key: '6M', label: '6M' },
  { key: '1A', label: '1A' },
  { key: 'ALL', label: 'All' },
];

export function PriceChart({
  defaultRange = '1M',
  chartHeight = 260,
  seriesByRange,
}: PriceChartProps) {
  const palette = usePalette();
  const [range, setRange] = React.useState<PriceChartRange>(defaultRange);
  const [width, setWidth] = React.useState(0);

  const values = seriesByRange?.[range] ?? DEFAULT_SERIES[range];
  const paddingX = 18;
  const paddingY = 18;
  const w = Math.max(0, width);
  const h = Math.max(0, chartHeight);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1e-6, max - min);

  const plotW = Math.max(1, w - paddingX * 2);
  const plotH = Math.max(1, h - paddingY * 2);

  const points = values.map((v, i) => {
    const x = paddingX + (i / Math.max(1, values.length - 1)) * plotW;
    const yNorm = clamp01((v - min) / span);
    const y = paddingY + (1 - yNorm) * plotH;
    return { x, y };
  });

  const d =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` +
        points
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(' ')
      : '';

  return (
    <View
      style={{
        width: '100%',
        borderRadius: 18,
        backgroundColor: AppColors.light.mainBackground,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 16,
      }}
      onLayout={(e) => {
        setWidth(e.nativeEvent.layout.width - 32); // paddingHorizontal total
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {RANGE_LABELS.map((r) => {
          const isActive = r.key === range;
          return (
            <Pressable
              key={r.key}
              accessibilityRole="button"
              accessibilityLabel={r.label}
              onPress={() => setRange(r.key)}
              style={{ paddingVertical: 6, paddingHorizontal: 6 }}
            >
              <Text
                variant="small"
                style={{
                  color: isActive ? AppColors.light.primary : palette.icon,
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                {r.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 10 }}>
        <Svg width={w} height={h}>
          {/* línea punteada central */}
          <Line
            x1={paddingX}
            y1={h / 2}
            x2={w - paddingX}
            y2={h / 2}
            stroke="rgba(0,0,0,0.18)"
            strokeWidth={2}
            strokeDasharray="2 10"
          />

          {/* línea principal */}
          <Path
            d={d}
            fill="none"
            stroke={AppColors.light.primary}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </View>
  );
}

export default PriceChart;
