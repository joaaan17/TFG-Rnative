import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import type { QuoteSnapshot } from '../api/marketOverviewClient';
import type { Palette } from '@/shared/hooks/use-palette';
import { FINANCIAL_TERMS } from '../constants/financialTerms';
import { FinancialTooltipModal } from './FinancialTooltipModal';

const EMPTY = '—';

function formatPrice(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return EMPTY;
  return n.toFixed(2);
}

function formatCompact(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return EMPTY;
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toFixed(0);
}

/** `termKey` enlaza con FINANCIAL_TERMS; `label` es solo texto en pantalla. */
const ROWS: {
  label: string;
  termKey: string;
  getValue: (q: QuoteSnapshot) => string;
}[] = [
  { label: 'Apertura', termKey: 'Open', getValue: (q) => formatPrice(q.open) },
  { label: 'Máximo', termKey: 'High', getValue: (q) => formatPrice(q.high) },
  { label: 'Mínimo', termKey: 'Low', getValue: (q) => formatPrice(q.low) },
  { label: 'Volumen', termKey: 'Volume', getValue: (q) => formatCompact(q.volume) },
  {
    label: 'Cap. mercado',
    termKey: 'Mkt Cap',
    getValue: (q) => formatCompact(q.marketCap),
  },
  { label: 'Moneda', termKey: 'Moneda', getValue: (q) => q.currency ?? EMPTY },
];

export type QuoteGridProps = {
  quote: QuoteSnapshot;
  palette: Palette;
};

export function QuoteGrid({ quote, palette }: QuoteGridProps) {
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
    <View style={{ marginTop: 16, marginBottom: 16 }}>
      <Text
        style={[
          Hierarchy.titleSection,
          { color: mutedColor, marginBottom: 10 },
        ]}
      >
        Datos del día
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        {ROWS.map(({ label, termKey, getValue }) => (
          <Pressable
            key={termKey}
            onPress={() => openTooltip(label, termKey)}
            accessibilityRole="button"
            accessibilityHint="Toca para ver la explicación"
            style={({ pressed }) => ({
              minWidth: '30%',
              flex: 1,
              maxWidth: '48%',
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 10,
              backgroundColor: palette.surfaceMuted ?? `${palette.primary}08`,
              borderWidth: 1,
              borderColor: borderColor + '40',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text
              style={[Hierarchy.captionSmall, { color: mutedColor }]}
              numberOfLines={1}
            >
              {label}
            </Text>
            <Text
              style={[
                Hierarchy.bodySmallSemibold,
                { color: textColor, marginTop: 2 },
              ]}
              numberOfLines={1}
            >
              {getValue(quote)}
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
