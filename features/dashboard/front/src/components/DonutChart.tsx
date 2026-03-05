/**
 * DonutChart — gráfico circular tipo dona con react-native-svg.
 * Sin dependencias externas de charts; evita problemas con gifted-charts-core.
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

export type DonutSegment = {
  label: string;
  value: number; // porcentaje 0-100
  color: string;
};

export type DonutChartProps = {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSublabel?: string;
};

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
  clockwise = true,
): string {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const sweep = clockwise ? 1 : 0;
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArc, sweep, end.x, end.y,
  ].join(' ');
}

export function DonutChart({
  segments,
  size = 220,
  strokeWidth = 44,
  centerLabel,
  centerSublabel,
}: DonutChartProps) {
  const palette = usePalette();
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = Math.max(outerR - strokeWidth, 4);

  const filtered = segments.filter((s) => s.value > 0);
  let currentAngle = 90;

  const paths = filtered.map((seg) => {
    const sweep = (seg.value / 100) * 360;
    const start = currentAngle;
    const end = currentAngle + sweep;
    currentAngle = end;

    const outerPath = describeArc(cx, cy, outerR, start, end, true);
    const innerEnd = polarToCartesian(cx, cy, innerR, end);
    const innerPath = describeArc(cx, cy, innerR, end, start, false);
    const d = `${outerPath} L ${innerEnd.x} ${innerEnd.y} ${innerPath} Z`;

    return { d, color: seg.color, key: seg.label };
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths.map(({ d, color, key }) => (
          <Path key={key} d={d} fill={color} />
        ))}
      </Svg>
      {(centerLabel || centerSublabel) && (
        <View
          style={{
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            width: size,
            height: size,
            pointerEvents: 'none',
          }}
        >
          {centerLabel && (
            <Text
              style={[
                Hierarchy.value,
                { color: palette.text, fontSize: 22, textAlign: 'center' },
              ]}
            >
              {centerLabel}
            </Text>
          )}
          {centerSublabel && (
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
  );
}

export default DonutChart;
