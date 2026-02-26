/**
 * PortfolioDonutChart — gráfico donut reutilizable para distribución por sector/geografía.
 * Implementación con react-native-svg usando Circle + stroke (strokeDasharray) para arcos
 * circulares suaves; evita el comando Path "A" que en algunas plataformas se renderiza angular.
 */
import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';
import type { DonutSegment, PortfolioDonutChartProps } from '../types/portfolio-chart.types';

const DEFAULT_SIZE = 220;
const DEFAULT_STROKE_WIDTH = 44;
const MAX_LEGEND_ITEMS = 8;

/** Normaliza segmentos: filtra value <= 0 y escala a que sumen exactamente 100. */
function normalizeSegments(segments: DonutSegment[]): DonutSegment[] {
  const filtered = segments.filter((s) => s.value > 0);
  if (filtered.length === 0) return [];
  const sum = filtered.reduce((acc, s) => acc + s.value, 0);
  if (sum <= 0) return filtered;
  const scaled = filtered.map((s, i) => {
    const raw = (s.value / sum) * 100;
    const rounded = i < filtered.length - 1 ? Math.round(raw * 10) / 10 : 0;
    return { ...s, value: rounded };
  });
  const running = scaled.slice(0, -1).reduce((acc, s) => acc + s.value, 0);
  scaled[scaled.length - 1] = {
    ...scaled[scaled.length - 1],
    value: Math.round((100 - running) * 10) / 10,
  };
  return scaled;
}

export function PortfolioDonutChart({
  segments,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  centerLabel,
  centerSublabel,
  showLegend = true,
  maxLegendItems = MAX_LEGEND_ITEMS,
}: PortfolioDonutChartProps) {
  const palette = usePalette();

  const normalized = useMemo(() => normalizeSegments(segments), [segments]);
  const legendItems = useMemo(
    () => normalized.slice(0, maxLegendItems),
    [normalized, maxLegendItems]
  );

  const { cx, cy, r, circumference, ringThickness, ringSegments } = useMemo(() => {
    const c = size / 2;
    const oR = size / 2 - 4;
    const iR = Math.max(oR - strokeWidth, 4);
    const radius = (oR + iR) / 2;
    const circ = 2 * Math.PI * radius;

    let offset = 0;
    const ringSegments: {
      color: string;
      dashLength: number;
      dashOffset: number;
      key: string;
    }[] = [];
    for (const seg of normalized) {
      const dashLength = (seg.value / 100) * circ;
      ringSegments.push({
        color: seg.color,
        dashLength,
        dashOffset: offset,
        key: seg.label,
      });
      offset += dashLength;
    }

    const ringThickness = oR - iR;
    return { cx: c, cy: c, r: radius, circumference: circ, ringThickness, ringSegments };
  }, [normalized, size, strokeWidth]);

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {ringSegments.map(({ color, dashLength, dashOffset, key }) => (
            <Circle
              key={key}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={ringThickness}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
        </Svg>
        {(centerLabel != null || centerSublabel != null) && (
          <View
            style={{
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
              width: size,
              height: size,
            }}
            pointerEvents="none"
          >
            {centerLabel != null && (
              <Text
                style={[
                  Hierarchy.value,
                  { color: palette.text, fontSize: 22, textAlign: 'center' },
                ]}
              >
                {centerLabel}
              </Text>
            )}
            {centerSublabel != null && (
              <Text
                style={[
                  Hierarchy.caption,
                  {
                    color: palette.icon ?? palette.text,
                    marginTop: 4,
                    textAlign: 'center',
                  },
                ]}
              >
                {centerSublabel}
              </Text>
            )}
          </View>
        )}
      </View>

      {showLegend && legendItems.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
            marginTop: 16,
            paddingHorizontal: 8,
          }}
        >
          {legendItems.map((s) => (
            <View
              key={s.label}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: s.color,
                }}
              />
              <Text
                style={[
                  Hierarchy.captionSmall,
                  { color: '#0B1220' },
                ]}
              >
                {s.label} {s.value}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default PortfolioDonutChart;
