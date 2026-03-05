/**
 * Card de contexto del dashboard: mismo estilo que las cards de Cartera.
 * Fondo blanco y barra lateral azul (CardWithBlueBar).
 */
import React from 'react';
import { View } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { CardWithBlueBar } from '@/shared/components/card-with-blue-bar';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';
import type { ContextCard as ContextCardType } from '../types/dashboard.types';

const ENTRY_GREEN = '#16A34A';
const ENTRY_RED = '#E5484D';

export type ContextCardProps = {
  card: ContextCardType;
  styles: {
    contextCard: object;
    contextCardDominant?: object;
    contextCardLastOperation?: object;
    contextLastOpRow?: object;
    contextLastOpLeft?: object;
    contextLastOpRight?: object;
    contextLastOpDetail?: object;
    contextLastOpDetailSpaced?: object;
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

function isDominantAsset(
  card: ContextCardType,
): card is import('../types/dashboard.types').ContextCardDominantAsset {
  return card.id === 'dominant';
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
    const lastOpStyle = s.contextCardLastOperation
      ? [s.contextCard, s.contextCardLastOperation]
      : s.contextCard;
    const hasProfitLoss =
      card.profitLossFormatted != null && card.profitLossFormatted !== '';
    const isProfit =
      hasProfitLoss && card.profitLossFormatted!.startsWith('+');
    const resultColor = isProfit
      ? (palette.positive ?? ENTRY_GREEN)
      : (palette.destructive ?? ENTRY_RED);
    const detailColor = palette.icon ?? palette.text;
    const detailStyle = [
      Hierarchy.caption,
      s.contextLastOpDetail ?? {},
      s.contextLastOpDetailSpaced ?? { marginBottom: 4 },
      { color: detailColor },
    ];
    const detailLastStyle = [
      Hierarchy.caption,
      s.contextLastOpDetail ?? {},
      { color: detailColor, opacity: 0.85 },
    ];
    const rowStyle = s.contextLastOpRow ?? { flexDirection: 'row' as const };
    const leftStyle = s.contextLastOpLeft ?? {};
    const rightStyle = s.contextLastOpRight ?? { alignItems: 'flex-end' as const };

    return (
      <CardWithBlueBar style={lastOpStyle}>
        <View style={rowStyle}>
          <View style={leftStyle}>
            <Text style={labelStyle} numberOfLines={1}>
              {card.label}
            </Text>
            <Text style={valueStyle} numberOfLines={1}>
              {opLabel} {card.assetName}
            </Text>
            <Text style={detailLastStyle} numberOfLines={1}>
              {card.timeAgo}
            </Text>
          </View>
          <View style={rightStyle}>
            <Text style={detailStyle} numberOfLines={1}>
              {card.quantity} ·{' '}
              <Text style={{ fontWeight: '600' }}>{card.priceFormatted}/acc</Text>
            </Text>
            <Text style={detailStyle} numberOfLines={1}>
              Total <Text style={{ fontWeight: '600' }}>{card.totalFormatted}</Text>
            </Text>
            {card.avgBuyPriceFormatted != null && (
              <Text style={[detailStyle, { opacity: 0.9 }]} numberOfLines={1}>
                {card.avgBuyPriceFormatted} → {card.priceFormatted}/acc
              </Text>
            )}
            {hasProfitLoss && (
              <Text
                style={[
                  Hierarchy.caption,
                  s.contextLastOpDetail ?? {},
                  s.contextLastOpDetailSpaced ?? { marginBottom: 4 },
                  { color: resultColor, fontWeight: '500' },
                ]}
                numberOfLines={1}
              >
                {card.profitLossFormatted}
              </Text>
            )}
          </View>
        </View>
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

  if (isDominantAsset(card)) {
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
            { color: palette.primary },
          ]}
          numberOfLines={1}
        >
          {card.weightPercent}
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
