/**
 * Card de contexto del dashboard: mismo estilo que las cards de Cartera.
 * Fondo blanco y barra lateral azul (CardWithBlueBar).
 */
import React from 'react';
import { Text } from '@/shared/components/ui/text';
import { CardWithBlueBar } from '@/shared/components/card-with-blue-bar';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';
import type { ContextCard as ContextCardType } from '../types/dashboard.types';

const ENTRY_GREEN = '#16A34A';

export type ContextCardProps = {
  card: ContextCardType;
  styles: {
    contextCard: object;
    contextLabel: object;
    contextValue: object;
    contextPercent: object;
  };
};

function isBestWorst(
  card: ContextCardType,
): card is import('../types/dashboard.types').ContextCardBestWorst {
  return card.id === 'best' || card.id === 'worst';
}

function isLastOperation(
  card: ContextCardType,
): card is import('../types/dashboard.types').ContextCardLastOperation {
  return card.id === 'lastOperation';
}

function isVolatility(
  card: ContextCardType,
): card is import('../types/dashboard.types').ContextCardVolatility {
  return card.id === 'volatility';
}

export function ContextCard({ card, styles: s }: ContextCardProps) {
  const palette = usePalette();

  const labelStyle = [
    Hierarchy.caption,
    s.contextLabel,
    { color: palette.icon ?? palette.text },
  ];
  const valueStyle = [
    Hierarchy.bodySmallSemibold,
    s.contextValue,
    { color: palette.text },
  ];

  if (isBestWorst(card)) {
    const isPositive =
      card.id === 'best' ? card.percent.startsWith('+') : false;
    const percentColor = isPositive ? ENTRY_GREEN : palette.destructive;
    return (
      <CardWithBlueBar style={s.contextCard}>
        <Text style={labelStyle} numberOfLines={1}>
          {card.label}
        </Text>
        <Text style={valueStyle} numberOfLines={1}>
          {card.assetName}
        </Text>
        <Text
          style={[
            Hierarchy.bodySmallSemibold,
            s.contextPercent,
            { color: percentColor },
          ]}
          numberOfLines={1}
        >
          {card.percent}
        </Text>
      </CardWithBlueBar>
    );
  }

  if (isLastOperation(card)) {
    const opLabel = card.operationType === 'compra' ? 'Compra' : 'Venta';
    return (
      <CardWithBlueBar style={s.contextCard}>
        <Text style={labelStyle} numberOfLines={1}>
          {card.label}
        </Text>
        <Text style={valueStyle} numberOfLines={1}>
          {opLabel} {card.assetName}
        </Text>
        <Text
          style={[Hierarchy.caption, { color: palette.icon ?? palette.text }]}
          numberOfLines={1}
        >
          {card.quantity}
        </Text>
        <Text
          style={[
            Hierarchy.caption,
            { color: palette.icon ?? palette.text, opacity: 0.85 },
          ]}
          numberOfLines={1}
        >
          {card.timeAgo}
        </Text>
      </CardWithBlueBar>
    );
  }

  if (isVolatility(card)) {
    return (
      <CardWithBlueBar style={s.contextCard}>
        <Text style={labelStyle} numberOfLines={1}>
          {card.label}
        </Text>
        <Text
          style={[
            Hierarchy.valueSecondary,
            s.contextValue,
            { color: palette.text },
          ]}
          numberOfLines={1}
        >
          {card.value}
        </Text>
      </CardWithBlueBar>
    );
  }

  return (
    <CardWithBlueBar style={s.contextCard}>
      <Text style={labelStyle} numberOfLines={1}>
        {card.label}
      </Text>
      <Text
        style={[
          Hierarchy.valueSecondary,
          s.contextValue,
          { color: palette.text },
        ]}
        numberOfLines={1}
      >
        {card.value}
      </Text>
    </CardWithBlueBar>
  );
}
