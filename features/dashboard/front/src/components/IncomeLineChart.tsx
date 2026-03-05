/**
 * Gráfico de línea simple para la sección Ingresos.
 * Relleno con gradiente (primary) y línea en primary; preparado para datos del ViewModel/API.
 */
import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';
import type { IncomeChartPoint } from '../types/dashboard.types';

const CHART_HEIGHT = 160;
const PADDING = { top: 8, right: 8, bottom: 24, left: 8 };

export type IncomeLineChartProps = {
  data: IncomeChartPoint[];
  width: number;
};

export function IncomeLineChart({ data, width }: IncomeLineChartProps) {
  const palette = usePalette();
  const primary = palette.primary ?? '#1D4ED8';

  const { pathLine, pathArea, xLabels } = useMemo(() => {
    if (data.length === 0) {
      return { pathLine: '', pathArea: '', xLabels: [] };
    }
    const w = width - PADDING.left - PADDING.right;
    const h = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    const min = Math.min(...data.map((d) => d.value));
    const max = Math.max(...data.map((d) => d.value));
    const range = max - min || 1;
    const stepX = data.length > 1 ? w / (data.length - 1) : w;

    const points = data.map((d, i) => {
      const x = PADDING.left + i * stepX;
      const y = PADDING.top + h - ((d.value - min) / range) * h;
      return { x, y, label: d.label };
    });

    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
    const last = points[points.length - 1];
    const first = points[0];
    const areaPath = `${linePath} L ${last.x} ${PADDING.top + h} L ${first.x} ${PADDING.top + h} Z`;

    return {
      pathLine: linePath,
      pathArea: areaPath,
      xLabels: points.map((p) => ({ x: p.x, label: p.label })),
    };
  }, [data, width]);

  if (data.length === 0) {
    return (
      <View
        style={{
          height: CHART_HEIGHT + 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={[Hierarchy.caption, { color: palette.icon }]}>
          Sin datos
        </Text>
      </View>
    );
  }

  return (
    <View style={{ width }}>
      <Svg width={width} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={primary} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={primary} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>
        <Path d={pathArea} fill="url(#incomeGradient)" />
        <Path
          d={pathLine}
          stroke={primary}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <View
        style={{
          flexDirection: 'row',
          marginTop: 8,
          width,
        }}
      >
        {xLabels.map((item, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={[
                Hierarchy.captionSmall,
                { color: palette.icon ?? palette.text },
              ]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
