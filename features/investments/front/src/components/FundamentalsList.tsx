import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import type { FundamentalsSnapshot } from '../api/marketOverviewClient';
import type { Palette } from '@/shared/hooks/use-palette';
import { FINANCIAL_TERMS } from '../constants/financialTerms';
import { FinancialTooltipModal } from './FinancialTooltipModal';

const EMPTY = '—';

function formatNum(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return EMPTY;
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  return n.toFixed(2);
}

const ROWS: {
  label: string;
  hint: string;
  getValue: (f: FundamentalsSnapshot) => string;
}[] = [
  { label: 'PER (P/E)', hint: 'Valoración', getValue: (f) => formatNum(f.pe) },
  { label: 'EPS', hint: 'Ganancias', getValue: (f) => formatNum(f.eps) },
  {
    label: 'Quick Ratio',
    hint: 'Solidez',
    getValue: (f) => formatNum(f.quickRatio),
  },
  { label: 'Beta', hint: 'Riesgo', getValue: (f) => formatNum(f.beta) },
  {
    label: 'Market Cap',
    hint: 'Dimensión',
    getValue: (f) => formatNum(f.marketCap),
  },
  { label: 'Sector', hint: 'Área', getValue: (f) => f.sector ?? EMPTY },
  {
    label: 'Industria',
    hint: 'Actividad',
    getValue: (f) => f.industry ?? EMPTY,
  },
];

export type FundamentalsListProps = {
  fundamentals: FundamentalsSnapshot;
  palette: Palette;
};

export function FundamentalsList({
  fundamentals,
  palette,
}: FundamentalsListProps) {
  const textColor = palette.text;
  const mutedColor = palette.icon ?? palette.text;
  const borderColor = palette.surfaceBorder ?? palette.surfaceMuted;

  const [tooltip, setTooltip] = useState<{ title: string; desc: string } | null>(null);
  const openTooltip = useCallback((label: string) => {
    const desc = FINANCIAL_TERMS[label];
    if (desc) setTooltip({ title: label, desc });
  }, []);

  return (
    <View style={{ paddingBottom: 16 }}>
      <Text
        style={[
          Hierarchy.titleSection,
          { color: mutedColor, marginBottom: 10 },
        ]}
      >
        Fundamentales
      </Text>
      <View style={{ gap: 8 }}>
        {ROWS.map(({ label, hint, getValue }) => (
          <Pressable
            key={label}
            onLongPress={() => openTooltip(label)}
            delayLongPress={400}
            accessibilityHint="Mantén pulsado para ver la explicación"
            style={({ pressed }) => ({
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: palette.surfaceMuted ?? `${palette.primary}06`,
              borderWidth: 1,
              borderColor: borderColor + '30',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                flex: 1,
                minWidth: 0,
              }}
            >
              <Text
                style={[Hierarchy.caption, { color: textColor }]}
                numberOfLines={1}
              >
                {label}
              </Text>
              <Text style={[Hierarchy.captionSmall, { color: mutedColor }]}>
                {' '}
                –{' '}
              </Text>
              <Text
                style={[Hierarchy.captionSmall, { color: mutedColor }]}
                numberOfLines={1}
              >
                {hint}
              </Text>
            </View>
            <Text
              style={[Hierarchy.bodySmallSemibold, { color: textColor }]}
              numberOfLines={1}
            >
              {getValue(fundamentals)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FinancialTooltipModal
        visible={!!tooltip}
        title={tooltip?.title ?? ''}
        description={tooltip?.desc ?? ''}
        palette={palette}
        onClose={() => setTooltip(null)}
      />
    </View>
  );
}
