import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BarChart3, LineChart } from 'lucide-react-native';
import {
  LightweightChartView,
  type Candle,
  type ChartSeriesType,
  type PriceLine,
} from '@/features/market-chart';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';
import { useMarketCandles } from '../hooks/useMarketCandles';
import type { CandleRange, CandleTimeframe } from '../api/marketCandlesClient';

const RANGE_OPTIONS: { value: CandleRange; label: string }[] = [
  { value: '1wk', label: '1 s' },
  { value: '1mo', label: '1 m' },
  { value: '3mo', label: '3 m' },
  { value: '6mo', label: '6 m' },
  { value: '1y', label: '1 a' },
];

const TIMEFRAME_OPTIONS: { value: CandleTimeframe; label: string }[] = [
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '1d', label: '1D' },
  { value: '1mo', label: '1M' },
];

const CHART_PADDING_HORIZONTAL = 20;

function apiCandlesToChartCandles(
  candles: Array<{ t: number; o: number; h: number; l: number; c: number; v?: number }>,
): Candle[] {
  return candles.map((c) => ({
    time: Math.floor(c.t / 1000),
    open: c.o,
    high: c.h,
    low: c.l,
    close: c.c,
    volume: c.v,
  }));
}

export type PortfolioChartProps = {
  /** Símbolo del activo (ej. AAPL). */
  symbol: string;
  /** Si false, no se cargan datos. */
  enabled?: boolean;
  /** Altura del gráfico en px. */
  height?: number;
  /** Estilos adicionales del contenedor (padding, márgenes). Incluye padding horizontal por defecto. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Precio actual desde cotizaciones (misma fuente que compra/venta). Si se pasa, la línea de precio usa este valor en lugar del cierre de la última vela, para coherencia con operaciones y cards. */
  currentPrice?: number;
};

/**
 * Gráfico de evolución reutilizable: selector de rango, velas/línea, selector de timeframe y tipo.
 * Mismas características en pantalla principal de inversiones y en el modal de acciones.
 */
export function PortfolioChart({
  symbol,
  enabled = true,
  height = 280,
  containerStyle,
  currentPrice,
}: PortfolioChartProps) {
  const palette = usePalette();
  const [range, setRange] = useState<CandleRange>('1mo');
  const [timeframe, setTimeframe] = useState<CandleTimeframe>('1d');
  const [chartMode, setChartMode] = useState<ChartSeriesType>('candlestick');

  const { data, loading, error, refetch } = useMarketCandles(
    symbol,
    timeframe,
    enabled && !!symbol,
    range,
  );

  const chartCandles = useMemo(() => {
    if (!data?.candles?.length) return [];
    return apiCandlesToChartCandles(data.candles);
  }, [data?.candles]);

  const lastCandleClose =
    chartCandles.length > 0 ? chartCandles[chartCandles.length - 1].close : undefined;
  const priceForLine = currentPrice ?? lastCandleClose;
  const priceLines = useMemo((): PriceLine[] => {
    if (priceForLine == null) return [];
    return [
      {
        price: priceForLine,
        color: palette.primary,
        lineWidth: 1,
        lineStyle: 2,
        title: '', // Sin título: el valor solo se muestra en el eje (axisLabelVisible), así no se duplica
        axisLabelVisible: true,
      },
    ];
  }, [priceForLine, palette.primary]);

  if (!symbol) return null;

  return (
    <View
      style={[
        {
          paddingHorizontal: CHART_PADDING_HORIZONTAL,
        },
        containerStyle,
      ]}
    >
      {/* Selector de rango (parte superior) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          gap: 6,
          marginBottom: 8,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
          {RANGE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setRange(opt.value)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor:
                  range === opt.value ? palette.primary : palette.surfaceMuted ?? '#f0f0f0',
              }}
            >
              <Text
                style={[
                  Hierarchy.action,
                  {
                    color: range === opt.value ? palette.primaryText ?? '#FFF' : palette.text,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View style={{ justifyContent: 'center', alignItems: 'center', minHeight: height }}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text
            variant="muted"
            style={[Hierarchy.bodySmall, { marginTop: 12, color: palette.icon }]}
          >
            Cargando gráfico...
          </Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <View style={{ justifyContent: 'center', alignItems: 'center', minHeight: height }}>
          <Text
            variant="muted"
            style={[Hierarchy.bodySmall, { textAlign: 'center', color: palette.icon }]}
          >
            {error}
          </Text>
          <Pressable
            onPress={refetch}
            style={{
              marginTop: 16,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: palette.primary,
            }}
          >
            <Text style={[Hierarchy.action, { color: palette.primaryText ?? '#FFF' }]}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      )}

      {/* Sin datos */}
      {!loading && !error && chartCandles.length === 0 && (
        <View style={{ justifyContent: 'center', alignItems: 'center', minHeight: height }}>
          <Text
            variant="muted"
            style={[Hierarchy.bodySmall, { textAlign: 'center', color: palette.icon }]}
          >
            No hay datos para este período
          </Text>
        </View>
      )}

      {/* Gráfico */}
      {!loading && !error && chartCandles.length > 0 && (
        <>
          <LightweightChartView
            key={`chart-${symbol}-${timeframe}-${range}`}
            candles={chartCandles}
            height={height}
            seriesType={chartMode}
            priceLines={priceLines}
            theme={{
              layoutBackgroundColor: palette.mainBackground ?? palette.background,
              textColor: palette.text,
              gridColor: palette.surfaceBorder ?? '#D6DEE8',
              upColor: palette.primary,
              downColor: `${palette.primary}66`,
              fontSize: Hierarchy.captionSmall?.fontSize ?? 11,
            }}
          />
          {/* Selector de timeframe + tipo (parte inferior) */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 12,
              paddingBottom: 8,
              gap: 6,
            }}
          >
            <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
              {TIMEFRAME_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setTimeframe(opt.value)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor:
                      timeframe === opt.value
                        ? palette.primary
                        : palette.surfaceMuted ?? '#f0f0f0',
                  }}
                >
                  <Text
                    style={[
                      Hierarchy.action,
                      {
                        color:
                          timeframe === opt.value ? palette.primaryText ?? '#FFF' : palette.text,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 4 }}>
              <Pressable
                onPress={() => setChartMode('candlestick')}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel="Gráfico de velas"
              >
                <BarChart3
                  size={18}
                  color={
                    chartMode === 'candlestick'
                      ? palette.primary
                      : palette.icon ?? palette.text
                  }
                  strokeWidth={2}
                />
              </Pressable>
              <Pressable
                onPress={() => setChartMode('line')}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel="Gráfico de línea"
              >
                <LineChart
                  size={18}
                  color={
                    chartMode === 'line' ? palette.primary : palette.icon ?? palette.text
                  }
                  strokeWidth={2}
                />
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
