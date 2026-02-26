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
import { ClipboardList, Search } from 'lucide-react-native';

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
  type PriceLine,
} from '@/features/market-chart';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

import {
  MarketCandlesModal,
  type MarketCandlesModalAsset,
} from '../components/MarketCandlesModal';
import { StockSearchModal } from '../components/StockSearchModal';
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

  const { data, loading, error, loadChart } = useMarketChartViewModel();
  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [tab, setTab] = React.useState<SegmentedTextTabsValue>(0);
  const [stockSearchModalOpen, setStockSearchModalOpen] = React.useState(false);
  const [candlesModalOpen, setCandlesModalOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<MarketCandlesModalAsset | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      loadChart();
      return undefined;
    }, [loadChart]),
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
              1769 $
            </Text>
            <Text
              variant="muted"
              style={[
                Hierarchy.bodySmall,
                styles.amountLabel,
                { color: palette.icon },
              ]}
            >
              Valor total cartera
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
                <LightweightChartView
                  candles={data.candles}
                  height={280}
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
              Inversiones
            </Text>
          </View>

          <View style={styles.assetsList}>
            <View style={styles.assetCardWrapper}>
              <AssetCard
                name="Bitcoin"
                symbol="BTC"
                shares="0,05 BTC"
                price="1511,51 €"
                change="58,36 €"
                changePercent="+4,56%"
                trend="up"
                profits="58,36 €"
                iconBackgroundColor="#F59E0B"
                variant="primary"
                onPress={() => handleAssetPress('BTC')}
              />
            </View>
            <View style={styles.assetCardWrapper}>
              <AssetCard
                name="Ethereum"
                symbol="ETH"
                shares="2,35 ETH"
                price="842,20 €"
                change="28,15 €"
                changePercent="+3,21%"
                trend="up"
                profits="28,15 €"
                iconBackgroundColor="#627EEA"
                variant="primaryTransparent"
                onPress={() => handleAssetPress('ETH')}
              />
            </View>
            <View style={styles.assetCardWrapper}>
              <AssetCard
                name="XRP"
                symbol="XRP"
                shares="150 XRP"
                price="116,48 €"
                change="38,53 €"
                changePercent="-3,12%"
                trend="down"
                profits="-38,53 €"
                iconBackgroundColor="#111827"
                iconTextColor="#FFFFFF"
                variant="primaryTransparent"
                onPress={() => handleAssetPress('XRP')}
              />
            </View>
            <View style={styles.assetCardWrapper}>
              <AssetCard
                name="Cardano"
                symbol="ADA"
                shares="1200 ADA"
                price="89,40 €"
                change="-12,20 €"
                changePercent="-1,89%"
                trend="down"
                profits="-12,20 €"
                iconBackgroundColor="#0033AD"
                iconTextColor="#FFFFFF"
                variant="neutral"
                onPress={() => handleAssetPress('ADA')}
              />
            </View>
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
          onOperar={() => {
            if (selectedAsset?.symbol) {
              setCandlesModalOpen(false);
              setSelectedAsset(null);
              router.push({ pathname: '/stock', params: { symbol: selectedAsset.symbol } });
            }
          }}
          onOrdenes={handleOrdersPress}
        />
      </View>
  );
}

export default InvestmentsScreen;
