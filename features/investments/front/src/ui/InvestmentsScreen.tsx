import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ClipboardList, Search } from 'lucide-react-native';

import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import {
  SegmentedTextTabs,
  type SegmentedTextTabsValue,
} from '@/shared/components/ui/segmented-text-tabs';
import { Text } from '@/shared/components/ui/text';
import { AssetCard } from '@/shared/components/asset-card';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

import {
  MarketCandlesModal,
  type MarketCandlesModalAsset,
} from '../components/MarketCandlesModal';
import { PortfolioChart } from '../components/PortfolioChart';
import { StockSearchModal } from '../components/StockSearchModal';
import { usePortfolio } from '../hooks/usePortfolio';
import { useHoldingsWithPrices } from '../hooks/useHoldingsWithPrices';
import { createInvestmentsStyles } from './Investments.styles';

const DEFAULT_CHART_SYMBOL = 'AAPL';

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
  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [tab, setTab] = React.useState<SegmentedTextTabsValue>(0);
  const [stockSearchModalOpen, setStockSearchModalOpen] = React.useState(false);
  const [candlesModalOpen, setCandlesModalOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<MarketCandlesModalAsset | null>(null);
  /** true si el modal de velas se abrió desde el buscador (atrás → volver al buscador). */
  const [candlesOpenedFromSearch, setCandlesOpenedFromSearch] = React.useState(false);

  const cashBalance = portfolioData?.cashBalance ?? 0;
  const totalCarteraValue = cashBalance + holdingsTotalValue;

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      refetchPortfolio();
      return undefined;
    }, [refetchPortfolio]),
  );

  const handleAssetPress = (symbol: string) => {
    router.push({ pathname: '/stock', params: { symbol } });
  };

  const handleSearchPress = () => {
    setStockSearchModalOpen(true);
  };

  const handleSelectAsset = (asset: MarketCandlesModalAsset) => {
    setStockSearchModalOpen(false);
    setCandlesOpenedFromSearch(true);
    setSelectedAsset(asset);
    setCandlesModalOpen(true);
  };

  /** Abrir modal del valor al pulsar una card de posición (mismo modal que desde el buscador). */
  const handleOpenPositionModal = (h: (typeof holdingsWithPrice)[0]) => {
    setCandlesOpenedFromSearch(false);
    setSelectedAsset({ symbol: h.symbol, name: h.symbol });
    setCandlesModalOpen(true);
  };

  const handleOrdersPress = () => {
    // TODO: Navegar a órdenes
  };

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
            <PortfolioChart
              symbol={DEFAULT_CHART_SYMBOL}
              enabled={true}
              height={280}
            />
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
                      onPress={() => handleOpenPositionModal(h)}
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
          onBack={
            candlesOpenedFromSearch
              ? () => {
                  setCandlesModalOpen(false);
                  setSelectedAsset(null);
                  setStockSearchModalOpen(true);
                }
              : () => {
                  setCandlesModalOpen(false);
                  setSelectedAsset(null);
                }
          }
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
