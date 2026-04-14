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

/** `termKey` enlaza con FINANCIAL_TERMS; `label` es solo texto en pantalla. */
const ROWS: {
  label: string;
  hint: string;
  termKey: string;
  getValue: (f: FundamentalsSnapshot) => string;
}[] = [
  {
    label: 'PER (cotización/beneficio)',
    hint: 'Valoración',
    termKey: 'PER (P/E)',
    getValue: (f) => formatNum(f.pe),
  },
  {
    label: 'BPA',
    hint: 'Ganancias',
    termKey: 'EPS',
    getValue: (f) => formatNum(f.eps),
  },
  {
    label: 'Liquidez inmediata',
    hint: 'Solidez',
    termKey: 'Quick Ratio',
    getValue: (f) => formatNum(f.quickRatio),
  },
  { label: 'Beta', hint: 'Riesgo', termKey: 'Beta', getValue: (f) => formatNum(f.beta) },
  {
    label: 'Cap. mercado',
    hint: 'Dimensión',
    termKey: 'Market Cap',
    getValue: (f) => formatNum(f.marketCap),
  },
  {
    label: 'Sector',
    hint: 'Área',
    termKey: 'Sector',
    getValue: (f) => f.sector ?? EMPTY,
  },
  {
    label: 'Industria',
    hint: 'Actividad',
    termKey: 'Industria',
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

  const [tooltip, setTooltip] = useState<{ title: string; desc: string } | null>(
    null,
  );
  const openTooltip = useCallback((title: string, termKey: string) => {
    const desc = FINANCIAL_TERMS[termKey];
    if (desc) setTooltip({ title, desc });
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
        {ROWS.map(({ label, hint, termKey, getValue }) => (
          <Pressable
            key={termKey}
            onPress={() => openTooltip(label, termKey)}
            accessibilityRole="button"
            accessibilityHint="Toca para ver la explicación"
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
