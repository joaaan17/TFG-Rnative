/**
 * Tarjeta de métrica del dashboard: valor, etiqueta y barra de progreso.
 * Estilo coherente con la app (paleta, bordes redondeados).
 */
import React from 'react';
import { View } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';
import type { DashboardStatCard } from '../types/dashboard.types';

export type StatCardProps = {
  card: DashboardStatCard;
  styles: {
    statCard: object;
    statCardHighlighted: object;
    statValue: object;
    statLabel: object;
    progressTrack: object;
    progressFill: object;
  };
};

export function StatCard({ card, styles: s }: StatCardProps) {
  const palette = usePalette();
  const isHighlighted = card.highlighted === true;

  const valueColor = isHighlighted
    ? (palette.primaryText ?? '#FFF')
    : palette.text;
  const labelColor = isHighlighted
    ? (palette.primaryText ?? '#FFF')
    : (palette.icon ?? palette.text);
  const trackBg = isHighlighted
    ? `${palette.primaryText ?? '#FFF'}40`
    : (palette.surfaceBorder ?? palette.surfaceMuted);
  const fillBg = isHighlighted
    ? (palette.primaryText ?? '#FFF')
    : palette.primary;

  return (
    <View style={[s.statCard, isHighlighted && s.statCardHighlighted]}>
      <Text
        style={[Hierarchy.value, s.statValue, { color: valueColor }]}
        numberOfLines={1}
      >
        {card.value}
      </Text>
      <Text
        style={[Hierarchy.bodySmall, s.statLabel, { color: labelColor }]}
        numberOfLines={2}
      >
        {card.label}
      </Text>
      <View style={[s.progressTrack, { backgroundColor: trackBg }]}>
        <View
          style={[
            s.progressFill,
            {
              width: `${Math.min(100, Math.max(0, card.progressPercent))}%`,
              backgroundColor: fillBg,
            },
          ]}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 4,
        }}
      >
        <Text style={[Hierarchy.captionSmall, { color: labelColor }]}>0%</Text>
        <Text style={[Hierarchy.captionSmall, { color: labelColor }]}>
          {card.progressPercent}%
        </Text>
      </View>
    </View>
  );
}
