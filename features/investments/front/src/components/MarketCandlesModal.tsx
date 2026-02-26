import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { ChevronLeft, Minus, Plus, X } from 'lucide-react-native';
import { CardModal } from '@/shared/components/card-modal';
import { Text } from '@/shared/components/ui/text';
import { LightweightChartView, type Candle } from '@/features/market-chart';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';
import { useMarketCandles } from '../hooks/useMarketCandles';
import { useMarketOverview } from '../hooks/useMarketOverview';
import type { CandleRange } from '../api/marketCandlesClient';
import { QuoteGrid } from './QuoteGrid';
import { FundamentalsList } from './FundamentalsList';
import { InvertirSheet } from './InvertirSheet';
import { VenderSheet } from './VenderSheet';

const RANGE_OPTIONS: { value: CandleRange; label: string }[] = [
  { value: '1wk', label: '1 sem' },
  { value: '1mo', label: '1 mes' },
  { value: '3mo', label: '3 mes' },
  { value: '6mo', label: '6 mes' },
  { value: '1y', label: '1 año' },
];

export type MarketCandlesModalAsset = { symbol: string; name: string };

export type MarketCandlesModalProps = {
  visible: boolean;
  asset: MarketCandlesModalAsset | null;
  onClose: () => void;
  /** Flecha atrás: volver al buscador (cierra este modal y abre el de búsqueda). */
  onBack?: () => void;
  /** Al pulsar "Operar" (ej. ir a pantalla de compra/venta del activo). */
  onOperar?: () => void;
  /** Al pulsar "Órdenes" (ej. ir a listado de órdenes). */
  onOrdenes?: () => void;
};

/** Convierte velas del API (t en ms) al formato del chart (time en segundos). */
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

type OperarStep = 'chart' | 'actions';

export function MarketCandlesModal({
  visible,
  asset,
  onClose,
  onBack,
  onOperar,
  onOrdenes,
}: MarketCandlesModalProps) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<CandleRange>('1mo');
  const [operarStep, setOperarStep] = useState<OperarStep>('chart');
  const [venderOpen, setVenderOpen] = useState(false);
  const [comprarOpen, setComprarOpen] = useState(false);

  useEffect(() => {
    if (!visible) {
      setOperarStep('chart');
      setVenderOpen(false);
      setComprarOpen(false);
    }
  }, [visible]);

  const symbol = asset?.symbol ?? '';
  const { data, loading, error, refetch } = useMarketCandles(
    symbol,
    range,
    '1d',
    visible && !!symbol,
  );
  const {
    data: overviewData,
    loading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useMarketOverview(symbol, visible && !!symbol);

  const chartCandles = useMemo(() => {
    if (!data?.candles?.length) return [];
    return apiCandlesToChartCandles(data.candles);
  }, [data?.candles]);

  const lastClose =
    chartCandles.length > 0
      ? chartCandles[chartCandles.length - 1].close
      : undefined;

  const priceLines = useMemo(() => {
    if (lastClose == null) return [];
    return [
      {
        price: lastClose,
        color: palette.primary,
        lineWidth: 1,
        lineStyle: 2,
        title: lastClose.toFixed(2),
        axisLabelVisible: true,
      },
    ];
  }, [lastClose, palette.primary]);

  const showChart = operarStep === 'chart';
  const showActions = operarStep === 'actions';
  const positionAmount = lastClose != null ? lastClose * 7.5 : 1023.73;
  const availableToInvest = 7.84;

  if (!visible) return null;

  return (
    <>
    <CardModal
      open={visible}
      onClose={onClose}
      maxHeightPct={1}
      closeOnBackdropPress
      scrollable={true}
      contentNoPaddingTop
    >
      <View style={{ flex: 1, minHeight: 0 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 54 + Math.max(insets.top, 0),
            paddingBottom: 12,
          }}
        >
          <View style={{ minWidth: 42, alignItems: 'flex-start' }}>
            {(showActions || onBack != null) ? (
              <Pressable
                onPress={showActions ? () => setOperarStep('chart') : onBack!}
                style={({ pressed }) => ({
                  padding: 8,
                  opacity: pressed ? 0.7 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel={showActions ? 'Volver al gráfico' : 'Volver al buscador'}
              >
                <ChevronLeft size={26} color={palette.text} strokeWidth={2} />
              </Pressable>
            ) : null}
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}>
            <Text
              style={[Hierarchy.titleModal, { color: palette.text, textAlign: 'center' }]}
              numberOfLines={1}
            >
              {asset?.name ?? ''}
            </Text>
            <Text
              variant="muted"
              style={[Hierarchy.bodySmall, { marginTop: 4, color: palette.icon ?? palette.text, textAlign: 'center' }]}
            >
              {asset?.symbol ?? ''}
            </Text>
          </View>
          <View style={{ minWidth: 42, alignItems: 'flex-end' }}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                padding: 8,
                opacity: pressed ? 0.7 : 1,
              })}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <X size={24} color={palette.text} />
            </Pressable>
          </View>
        </View>

        {operarStep === 'chart' && (
        <ScrollView
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{
            paddingBottom: 24 + Math.max(insets.bottom, 0),
          }}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
        {showChart && (
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 6,
          }}
        >
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
                  range === opt.value
                    ? palette.primary
                    : palette.surfaceMuted ?? '#f0f0f0',
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
        )}

        {operarStep === 'chart' && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {loading && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 280,
              }}
            >
              <ActivityIndicator size="large" color={palette.primary} />
              <Text
                variant="muted"
                style={[Hierarchy.bodySmall, { marginTop: 12, color: palette.icon }]}
              >
                Cargando histórico...
              </Text>
            </View>
          )}

          {error && !loading && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 280,
              }}
            >
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
                <Text
                  style={[Hierarchy.action, { color: palette.primaryText ?? '#FFF' }]}
                >
                  Reintentar
                </Text>
              </Pressable>
            </View>
          )}

          {!loading && !error && chartCandles.length === 0 && symbol && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 280,
              }}
            >
              <Text
                variant="muted"
                style={[Hierarchy.bodySmall, { textAlign: 'center', color: palette.icon }]}
              >
                No hay datos para este período
              </Text>
            </View>
          )}

          {!loading && !error && chartCandles.length > 0 && (
            <LightweightChartView
              candles={chartCandles}
              height={280}
              priceLines={priceLines}
              theme={{
                layoutBackgroundColor:
                  palette.mainBackground ?? palette.background,
                textColor: palette.text,
                gridColor: palette.surfaceBorder ?? '#D6DEE8',
                upColor: palette.primary,
                downColor: `${palette.primary}66`,
                fontSize: Hierarchy.captionSmall.fontSize,
              }}
            />
          )}

          {(
            <>
              {overviewLoading && !overviewData && (
                <View style={{ paddingTop: 8, paddingBottom: 8 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <View
                        key={i}
                        style={{
                          width: '30%',
                          height: 52,
                          borderRadius: 10,
                          backgroundColor: palette.surfaceMuted ?? '#eee',
                        }}
                      />
                    ))}
                  </View>
                  <View style={{ gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <View
                        key={i}
                        style={{
                          height: 40,
                          borderRadius: 8,
                          backgroundColor: palette.surfaceMuted ?? '#eee',
                        }}
                      />
                    ))}
                  </View>
                </View>
              )}
              {overviewError && !overviewData && (
                <View
                  style={{
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    variant="muted"
                    style={[Hierarchy.bodySmall, { textAlign: 'center', color: palette.icon }]}
                  >
                    {overviewError}
                  </Text>
                  <Pressable
                    onPress={refetchOverview}
                    style={{
                      marginTop: 12,
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
              {overviewData && (
                <>
                  <QuoteGrid quote={overviewData.quote} palette={palette} />
                  <FundamentalsList fundamentals={overviewData.fundamentals} palette={palette} />
                </>
              )}
            </>
          )}
        </View>
        )}

        {showChart && (
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
          }}
        >
          <Pressable
            onPress={() => setOperarStep('actions')}
            style={({ pressed }) => ({
              flex: 1,
              height: 48,
              borderRadius: 12,
              backgroundColor: palette.primary,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Operar"
          >
            <Text
              style={[Hierarchy.action, { color: palette.primaryText ?? '#FFF', fontWeight: '600' }]}
            >
              Operar
            </Text>
          </Pressable>
          <Pressable
            onPress={onOrdenes}
            style={({ pressed }) => ({
              flex: 1,
              height: 48,
              borderRadius: 12,
              backgroundColor: palette.surfaceMuted ?? '#f0f0f0',
              borderWidth: 1,
              borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Órdenes"
          >
            <Text
              style={[Hierarchy.action, { color: palette.primary }]}
            >
              Órdenes
            </Text>
          </Pressable>
        </View>
        )}
        </ScrollView>
        )}

        {showActions && (
          <Animated.View
            entering={FadeIn.duration(220)}
            style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 20, justifyContent: 'center' }}
          >
            <Animated.View
              entering={FadeInUp.delay(100).duration(260)}
              style={{ marginTop: 24 }}
            >
              <Pressable
                onPress={() => setComprarOpen(true)}
                style={({ pressed }) => ({
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: 56,
                  paddingHorizontal: 20,
                  borderRadius: 14,
                  backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
                  borderWidth: 1,
                  borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
                  opacity: pressed ? 0.85 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel="Comprar"
              >
                <Text style={[Hierarchy.action, { color: palette.text, fontWeight: '600' }]}>
                  Comprar
                </Text>
                <Plus size={22} color={palette.text} strokeWidth={2.5} />
              </Pressable>
            </Animated.View>
            <Animated.View
              entering={FadeInUp.delay(180).duration(260)}
              style={{ marginTop: 12 }}
            >
              <Pressable
                onPress={() => setVenderOpen(true)}
                style={({ pressed }) => ({
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: 56,
                  paddingHorizontal: 20,
                  borderRadius: 14,
                  backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
                  borderWidth: 1,
                  borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
                  opacity: pressed ? 0.85 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel="Vender"
              >
                <Text style={[Hierarchy.action, { color: palette.text, fontWeight: '600' }]}>
                  Vender
                </Text>
                <Minus size={22} color={palette.text} strokeWidth={2.5} />
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </CardModal>

    <VenderSheet
      visible={venderOpen}
      onClose={() => setVenderOpen(false)}
      amountAvailable={positionAmount}
      symbol={asset?.symbol}
      onSelectPercent={(p) => {
        setVenderOpen(false);
        onOperar?.();
      }}
      onCustomAmount={() => {
        setVenderOpen(false);
        onOperar?.();
      }}
    />
    <InvertirSheet
      visible={comprarOpen}
      onClose={() => setComprarOpen(false)}
      availableAmount={availableToInvest}
      price={lastClose ?? 0}
      symbol={asset?.symbol}
      onNext={(amount) => {
        setComprarOpen(false);
        onOperar?.();
      }}
    />
    </>
  );
}
