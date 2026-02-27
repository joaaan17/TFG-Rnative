import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { BarChart3, ClipboardList, LineChart, Search } from 'lucide-react-native';

import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import {
  SegmentedTextTabs,
  type SegmentedTextTabsValue,
} from '@/shared/components/ui/segmented-text-tabs';
import { Text } from '@/shared/components/ui/text';
import { AssetCard } from '@/shared/components/asset-card';
import {
  LightweightChartView,
  useMarketChartViewModel,
  type ChartSeriesType,
  type PriceLine,
} from '@/features/market-chart';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

import {
  MarketCandlesModal,
  type MarketCandlesModalAsset,
} from '../components/MarketCandlesModal';
import { StockSearchModal } from '../components/StockSearchModal';
import { usePortfolio } from '../hooks/usePortfolio';
import { useHoldingsWithPrices } from '../hooks/useHoldingsWithPrices';
import { createInvestmentsStyles } from './Investments.styles';

/**
 * Pantalla de Inversiones: evolución global de la cartera, buscador y cards de acciones.
 * Estilo moderno y minimalista alineado con el design system.
 */
export function InvestmentsScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width: screenWidth } = useWindowDimensions();
  const styles = useMemo(
    () => createInvestmentsStyles(palette, screenWidth),
    [palette, screenWidth],
  );

  const { session } = useAuthSession();
  const { data: portfolioData, refetch: refetchPortfolio } = usePortfolio(
    session?.token ?? null,
    true,
  );
  const { holdingsWithPrice, totalValue: holdingsTotalValue } = useHoldingsWithPrices(
    portfolioData?.holdings,
  );
  const { data, loading, error, loadChart } = useMarketChartViewModel();
  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [tab, setTab] = React.useState<SegmentedTextTabsValue>(0);
  const [chartMode, setChartMode] = React.useState<ChartSeriesType>('candlestick');
  const [stockSearchModalOpen, setStockSearchModalOpen] = React.useState(false);
  const [candlesModalOpen, setCandlesModalOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<MarketCandlesModalAsset | null>(null);

  const cashBalance = portfolioData?.cashBalance ?? 0;
  const totalCarteraValue = cashBalance + holdingsTotalValue;

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      loadChart();
      refetchPortfolio();
      return undefined;
    }, [loadChart, refetchPortfolio]),
  );

  const handleAssetPress = (symbol: string) => {
    router.push({ pathname: '/stock', params: { symbol } });
  };

  const handleSearchPress = () => {
    setStockSearchModalOpen(true);
  };

  const handleSelectAsset = (asset: MarketCandlesModalAsset) => {
    setStockSearchModalOpen(false);
    setSelectedAsset(asset);
    setCandlesModalOpen(true);
  };

  const handleOrdersPress = () => {
    // TODO: Navegar a órdenes
  };

  const chartPriceLines = useMemo((): PriceLine[] => {
    const c = data?.candles;
    if (!c?.length) return [];
    const last = c[c.length - 1];
    return [
      {
        price: last.close,
        color: palette.destructive,
        lineStyle: 2,
        title: last.close.toFixed(2),
        axisLabelVisible: true,
      },
    ];
  }, [data?.candles, palette.destructive]);

  return (
    <View
        style={styles.container}
        accessibilityElementsHidden={false}
        importantForAccessibility="yes"
      >
        <View style={styles.header}>
          <TypewriterTextComponent
            key={typewriterKey}
            text="INVERSIONES"
            speed={40}
            variant="h3"
            useDefaultFontFamily
            className="border-0 pb-0"
          />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tabsWrap}>
            <SegmentedTextTabs
              labels={['Cartera', 'Efectivo']}
              value={tab}
              onValueChange={setTab}
              variant="translucent"
            />
          </View>

          <View style={styles.amountWrap}>
            <Text
              style={[
                Hierarchy.value,
                styles.amountValue,
                { color: palette.text },
              ]}
            >
              {session
              ? tab === 0
                ? `${totalCarteraValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`
                : `${cashBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`
              : '—'}
            </Text>
            <Text
              variant="muted"
              style={[
                Hierarchy.bodySmall,
                styles.amountLabel,
                { color: palette.icon },
              ]}
            >
              {session ? (tab === 0 ? 'Valor total cartera' : 'Cash disponible') : 'Inicia sesión para ver tu cartera'}
            </Text>
          </View>

          <View style={styles.chartSection}>
            <View style={styles.chartLabel}>
              <View style={styles.chartLabelAccent} />
              <Text
                style={[
                  Hierarchy.titleSection,
                  styles.chartLabelText,
                  { color: palette.icon ?? palette.text },
                ]}
              >
                Evolución de la cartera
              </Text>
            </View>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={palette.primary} />
                <Text
                  variant="muted"
                  style={[styles.errorText, { color: palette.icon }]}
                >
                  Cargando gráfico...
                </Text>
              </View>
            )}
            {error && (
              <Text
                variant="muted"
                style={[styles.errorText, { color: palette.icon }]}
              >
                {error}
              </Text>
            )}
            {!loading && !error && data?.candles && data.candles.length > 0 && (
              <View style={styles.chartContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    gap: 4,
                    marginBottom: 8,
                    paddingHorizontal: 4,
                  }}
                >
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
                        chartMode === 'line'
                          ? palette.primary
                          : palette.icon ?? palette.text
                      }
                      strokeWidth={2}
                    />
                  </Pressable>
                </View>
                <LightweightChartView
                  candles={data.candles}
                  height={280}
                  seriesType={chartMode}
                  priceLines={chartPriceLines}
                  theme={{
                    layoutBackgroundColor:
                      palette.mainBackground ?? palette.background,
                    textColor: palette.text,
                    gridColor: palette.surfaceBorder ?? '#D6DEE8',
                    upColor: palette.primary,
                    downColor: `${palette.primary}66`,
                    fontSize: 11,
                  }}
                />
              </View>
            )}
          </View>

          <View style={styles.sectionTitleWrap}>
            <View style={styles.sectionTitleAccent} />
            <Text
              style={[
                Hierarchy.titleSection,
                styles.sectionTitle,
                { color: palette.icon ?? palette.text },
              ]}
            >
              {portfolioData ? 'Tus posiciones' : 'Inversiones'}
            </Text>
          </View>

          <View style={styles.assetsList}>
            {holdingsWithPrice.length > 0 ? (
              holdingsWithPrice.map((h) => {
                const priceStr =
                  h.currentPrice != null
                    ? h.currentPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '—';
                const changePercentStr =
                  h.changePercent != null
                    ? `${h.changePercent >= 0 ? '+' : ''}${h.changePercent.toFixed(2)}%`
                    : '—';
                const changeVal =
                  h.currentPrice != null
                    ? (h.currentPrice - h.avgBuyPrice) * h.shares
                    : 0;
                const changeStr = changeVal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                return (
                  <View key={h.symbol} style={styles.assetCardWrapper}>
                    <AssetCard
                      name={h.symbol}
                      symbol={h.symbol}
                      shares={`${h.shares} ${h.symbol}`}
                      price={`${priceStr} $`}
                      change={`${changeStr} $`}
                      changePercent={changePercentStr}
                      trend={changeVal >= 0 ? 'up' : 'down'}
                      profits={`${changeStr} $`}
                      variant="primaryTransparent"
                      onPress={() => handleAssetPress(h.symbol)}
                    />
                  </View>
                );
              })
            ) : (
              <View style={{ paddingVertical: 24, paddingHorizontal: 16 }}>
                <Text
                  variant="muted"
                  style={[Hierarchy.bodySmall, { textAlign: 'center', color: palette.icon }]}
                >
                  {session
                    ? 'No tienes posiciones. Busca un activo para comprar.'
                    : 'Inicia sesión para ver tu cartera y operar.'}
                </Text>
                {session && (
                  <Pressable
                    onPress={handleSearchPress}
                    style={{ marginTop: 12, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: palette.primary }}
                  >
                    <Text style={[Hierarchy.action, { color: palette.primaryText ?? '#FFF' }]}>
                      Buscar activo
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomActions}>
          <Pressable
            style={[styles.iconButton, { backgroundColor: palette.primary }]}
            onPress={handleSearchPress}
            accessibilityRole="button"
            accessibilityLabel="Buscar"
          >
            <Search
              size={20}
              color={palette.primaryText ?? '#FFF'}
              strokeWidth={2}
            />
          </Pressable>
          <Pressable
            style={[
              styles.iconButton,
              {
                backgroundColor: palette.surfaceMuted,
                borderWidth: 1,
                borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
              },
            ]}
            onPress={handleOrdersPress}
            accessibilityRole="button"
            accessibilityLabel="Órdenes"
          >
            <ClipboardList size={20} color={palette.primary} strokeWidth={2} />
          </Pressable>
        </View>

        <StockSearchModal
          open={stockSearchModalOpen}
          onClose={() => setStockSearchModalOpen(false)}
          onSelectAsset={handleSelectAsset}
        />
        <MarketCandlesModal
          visible={candlesModalOpen}
          asset={selectedAsset}
          onClose={() => {
            setCandlesModalOpen(false);
            setSelectedAsset(null);
          }}
          onBack={() => {
            setCandlesModalOpen(false);
            setSelectedAsset(null);
            setStockSearchModalOpen(true);
          }}
          onOperar={() => {
            if (selectedAsset?.symbol) {
              setCandlesModalOpen(false);
              setSelectedAsset(null);
              router.push({ pathname: '/stock', params: { symbol: selectedAsset.symbol } });
            }
          }}
          onOrdenes={handleOrdersPress}
          onGoToMain={() => {
            refetchPortfolio();
            setCandlesModalOpen(false);
            setSelectedAsset(null);
          }}
        />
      </View>
  );
}

export default InvestmentsScreen;
