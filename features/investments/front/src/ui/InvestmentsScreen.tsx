import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ClipboardList, Plus, Search } from 'lucide-react-native';

import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import {
  SegmentedTextTabs,
  type SegmentedTextTabsValue,
} from '@/shared/components/ui/segmented-text-tabs';
import { Text } from '@/shared/components/ui/text';
import { AssetCard } from '@/shared/components/asset-card';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

import {
  CashCalendar,
  CashHeader,
  DayTransactionsSheet,
  TransactionDetailModal,
} from '../components/cash';
import {
  MarketCandlesModal,
  type MarketCandlesModalAsset,
} from '../components/MarketCandlesModal';
import { PortfolioPerformanceChart } from '../components/PortfolioPerformanceChart';
import { StockSearchModal } from '../components/StockSearchModal';
import { TransactionsHistoryModal } from '../components/TransactionsHistoryModal';
import { useCashOverview } from '../hooks/useCashOverview';
import { useHoldingsSparklines } from '../hooks/useHoldingsSparklines';
import { useHoldingsWithPrices } from '../hooks/useHoldingsWithPrices';
import { usePortfolio } from '../hooks/usePortfolio';
import type { CashTransactionView } from '../types/cash.types';
import { getLogoUrlForSymbol } from '../utils/logoForSymbol';
import { createCashStyles } from './Cash.styles';
import { createInvestmentsStyles } from './Investments.styles';
import { FINANCIAL_TERMS } from '../constants/financialTerms';
import { FinancialTooltipModal } from '../components/FinancialTooltipModal';

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
  const cashStyles = useMemo(
    () => createCashStyles(palette, screenWidth),
    [palette, screenWidth],
  );

  const { session } = useAuthSession();
  const { data: portfolioData, refetch: refetchPortfolio } = usePortfolio(
    session?.token ?? null,
    true,
  );
  const {
    holdingsWithPrice,
    totalValue: holdingsTotalValue,
    refetch: refetchHoldingsQuotes,
  } = useHoldingsWithPrices(portfolioData?.holdings);
  const holdingSymbols = useMemo(
    () => (portfolioData?.holdings ?? []).map((h) => h.symbol),
    [portfolioData?.holdings],
  );
  const sparklines = useHoldingsSparklines(
    holdingSymbols,
    !!session && holdingSymbols.length > 0,
  );
  const [tab, setTab] = React.useState<SegmentedTextTabsValue>(0);
  const [stockSearchModalOpen, setStockSearchModalOpen] = React.useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] =
    React.useState(false);
  const [candlesModalOpen, setCandlesModalOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] =
    React.useState<MarketCandlesModalAsset | null>(null);
  /** true si el modal de velas se abrió desde el buscador (atrás → volver al buscador). */
  const [candlesOpenedFromSearch, setCandlesOpenedFromSearch] =
    React.useState(false);
  const [selectedCashTransaction, setSelectedCashTransaction] =
    React.useState<CashTransactionView | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState(
    () => new Date(),
  );
  const [calendarMonth, setCalendarMonth] = React.useState(() => new Date());
  const [portfolioInfoTooltip, setPortfolioInfoTooltip] = useState<{
    title: string;
    desc: string;
  } | null>(null);
  const openPortfolioInfoTooltip = useCallback((label: string) => {
    const desc = FINANCIAL_TERMS[label];
    if (desc) setPortfolioInfoTooltip({ title: label, desc });
  }, []);

  const {
    balance: cashOverviewBalance,
    currency: cashCurrency,
    monthly: cashMonthly,
    flatTransactions: cashFlatTransactions,
    loading: cashLoading,
  } = useCashOverview(session?.token ?? null, tab === 1);

  const cashDaysWithActivity = useMemo(() => {
    const set = new Set<string>();
    for (const tx of cashFlatTransactions) {
      set.add(tx.createdAt.slice(0, 10));
    }
    return set;
  }, [cashFlatTransactions]);

  const selectedDayTransactions = useMemo(() => {
    const dayKey =
      selectedCalendarDate.getFullYear() +
      '-' +
      String(selectedCalendarDate.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(selectedCalendarDate.getDate()).padStart(2, '0');
    return cashFlatTransactions.filter(
      (tx) => tx.createdAt.slice(0, 10) === dayKey,
    );
  }, [cashFlatTransactions, selectedCalendarDate]);

  /** Último día con transacciones: para seleccionarlo al abrir Efectivo. */
  const lastTransactionDate = useMemo(() => {
    if (!cashFlatTransactions.length) return null;
    let latest = new Date(cashFlatTransactions[0].createdAt);
    for (let i = 1; i < cashFlatTransactions.length; i++) {
      const d = new Date(cashFlatTransactions[i].createdAt);
      if (d > latest) latest = d;
    }
    return new Date(latest.getFullYear(), latest.getMonth(), latest.getDate());
  }, [cashFlatTransactions]);

  const hasAutoSelectedLastDayRef = useRef(false);
  useEffect(() => {
    if (tab !== 1) {
      hasAutoSelectedLastDayRef.current = false;
      return;
    }
    if (lastTransactionDate && !hasAutoSelectedLastDayRef.current) {
      hasAutoSelectedLastDayRef.current = true;
      setSelectedCalendarDate(lastTransactionDate);
      setCalendarMonth(
        new Date(
          lastTransactionDate.getFullYear(),
          lastTransactionDate.getMonth(),
          1,
        ),
      );
    }
  }, [tab, lastTransactionDate]);

  // Valor de efectivo desde la cartera en BD (portfolio/me); actualiza con compras/ventas
  const cashBalance = portfolioData?.cashBalance ?? 0;
  // Valor total cartera = efectivo + valor actual de las posiciones (precios de mercado)
  const totalCarteraValue = cashBalance + holdingsTotalValue;

  useFocusEffect(
    React.useCallback(() => {
      refetchPortfolio();
      return undefined;
    }, [refetchPortfolio]),
  );

  // Actualizar valor global de la cartera y cotizaciones cada 10 min para ver evolución en tiempo casi real
  const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!session?.token) return;
    intervalRef.current = setInterval(() => {
      refetchPortfolio();
      refetchHoldingsQuotes();
    }, REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [
    session?.token,
    refetchPortfolio,
    refetchHoldingsQuotes,
    REFRESH_INTERVAL_MS,
  ]);

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
    setTransactionsModalOpen(true);
  };

  return (
    <View
      style={styles.container}
      accessibilityElementsHidden={false}
      importantForAccessibility="yes"
    >
      <View style={styles.topBar}>
        <SegmentedTextTabs
          labels={['Cartera', 'Efectivo']}
          value={tab}
          onValueChange={setTab}
          variant="minimal"
          animatedPill
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tab === 1 ? (
          <>
            <CashHeader
              balance={cashOverviewBalance}
              currency={cashCurrency}
              monthly={cashMonthly}
              styles={cashStyles}
            />
            {cashLoading ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={palette.primary} />
              </View>
            ) : (
              <>
                <View style={cashStyles.calendarTitleWrap}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <View style={[cashStyles.calendarTitleAccent]} />
                    <Text
                      style={[
                        Hierarchy.titleSection,
                        cashStyles.calendarTitleText,
                        { color: palette.icon ?? palette.text },
                      ]}
                    >
                      Transacciones
                    </Text>
                  </View>
                  <Pressable
                    onPress={handleOrdersPress}
                    style={({ pressed }) => [
                      cashStyles.calendarTitleIcon,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Historial de transacciones"
                  >
                    <ClipboardList
                      size={18}
                      color={palette.primary}
                      strokeWidth={2}
                    />
                  </Pressable>
                </View>
                <CashCalendar
                  monthDate={calendarMonth}
                  selectedDate={selectedCalendarDate}
                  onSelectDay={(d) => {
                    setSelectedCalendarDate(d);
                    setCalendarMonth(
                      new Date(d.getFullYear(), d.getMonth(), 1),
                    );
                  }}
                  onMonthChange={setCalendarMonth}
                  daysWithActivity={cashDaysWithActivity}
                  styles={cashStyles}
                />
                <View
                  style={{
                    height: 30,
                    marginHorizontal: -20,
                    backgroundColor: palette.primary,
                  }}
                />
                <DayTransactionsSheet
                  selectedDate={selectedCalendarDate}
                  transactions={selectedDayTransactions}
                  onSelectTransaction={setSelectedCashTransaction}
                  styles={cashStyles}
                />
              </>
            )}
          </>
        ) : (
          <>
            <View style={styles.chartSection}>
              <Pressable
                onLongPress={() => openPortfolioInfoTooltip('Evolución de la cartera')}
                delayLongPress={400}
              >
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
              </Pressable>
              <Pressable
                onLongPress={() => {
                  if (session) openPortfolioInfoTooltip('Valor total cartera');
                }}
                delayLongPress={400}
                disabled={!session}
              >
                <View style={styles.amountWrap}>
                  <Text
                    style={[
                      Hierarchy.titleModalLarge,
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
                    {session
                      ? tab === 0
                        ? 'Valor total cartera'
                        : 'Cash disponible'
                      : 'Inicia sesión para ver tu cartera'}
                  </Text>
                </View>
              </Pressable>
              <PortfolioPerformanceChart
                token={session?.token ?? null}
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
                  const hasRealPrice = !h.isFallbackPrice && h.currentPrice != null;
                  const priceStr =
                    h.currentPrice != null
                      ? h.currentPrice.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : '—';
                  const changePercentStr =
                    h.changePercent != null
                      ? `${h.changePercent >= 0 ? '+' : ''}${h.changePercent.toFixed(2)}%`
                      : '—';
                  const changeVal = hasRealPrice
                    ? (h.currentPrice! - h.avgBuyPrice) * h.shares
                    : null;
                  const changeStr =
                    changeVal != null
                      ? changeVal.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : '—';
                  const trend: 'up' | 'down' =
                    changeVal != null && changeVal >= 0 ? 'up' : changeVal != null ? 'down' : 'up';
                  return (
                    <View key={h.symbol} style={styles.assetCardWrapper}>
                      <AssetCard
                        name={h.symbol}
                        symbol={h.symbol}
                        shares={`${h.shares} ${h.symbol}`}
                        price={`${priceStr} $`}
                        change={changeVal != null ? `${changeStr} $` : '— $'}
                        changePercent={changePercentStr}
                        trend={trend}
                        profits={changeVal != null ? `${changeStr} $` : '— $'}
                        variant="primaryTransparent"
                        sparklineData={sparklines[h.symbol]}
                        logoUrl={getLogoUrlForSymbol(h.symbol)}
                        onPress={() => handleOpenPositionModal(h)}
                      />
                    </View>
                  );
                })
              ) : (
                <View style={{ paddingVertical: 24, paddingHorizontal: 16 }}>
                  <Text
                    variant="muted"
                    style={[
                      Hierarchy.bodySmall,
                      { textAlign: 'center', color: palette.icon },
                    ]}
                  >
                    {session
                      ? 'No tienes posiciones. Busca un activo para comprar.'
                      : 'Inicia sesión para ver tu cartera y operar.'}
                  </Text>
                  {session && (
                    <Pressable
                      onPress={handleSearchPress}
                      style={{
                        marginTop: 12,
                        alignSelf: 'center',
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        backgroundColor: palette.primary,
                      }}
                    >
                      <Text
                        style={[
                          Hierarchy.action,
                          { color: palette.primaryText ?? '#FFF' },
                        ]}
                      >
                        Buscar activo
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {tab === 0 && session && (
        <View style={styles.buyBar}>
          <Pressable
            onPress={handleSearchPress}
            accessibilityRole="button"
            accessibilityLabel="Comprar Activo"
            style={({ pressed }) => [
              styles.buyButton,
              {
                backgroundColor: palette.primary,
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
          >
            <Plus size={18} color={palette.primaryText ?? '#FFF'} strokeWidth={2.5} />
            <Text
              style={[
                Hierarchy.action,
                { color: palette.primaryText ?? '#FFF', fontWeight: '600' },
              ]}
            >
              Comprar Activo
            </Text>
          </Pressable>
        </View>
      )}

      <View style={styles.bottomActions}>
        {tab === 0 && (
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
        )}
        {tab === 0 && (
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
        )}
      </View>

      <StockSearchModal
        open={stockSearchModalOpen}
        onClose={() => setStockSearchModalOpen(false)}
        onSelectAsset={handleSelectAsset}
      />
      <TransactionsHistoryModal
        open={transactionsModalOpen}
        onClose={() => setTransactionsModalOpen(false)}
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
            router.push({
              pathname: '/stock',
              params: { symbol: selectedAsset.symbol },
            });
          }
        }}
        onOrdenes={handleOrdersPress}
        onGoToMain={() => {
          refetchPortfolio();
          setCandlesModalOpen(false);
          setSelectedAsset(null);
        }}
      />
      <TransactionDetailModal
        open={selectedCashTransaction != null}
        onClose={() => setSelectedCashTransaction(null)}
        transaction={selectedCashTransaction}
      />
      <FinancialTooltipModal
        visible={!!portfolioInfoTooltip}
        title={portfolioInfoTooltip?.title ?? ''}
        description={portfolioInfoTooltip?.desc ?? ''}
        palette={palette}
        onClose={() => setPortfolioInfoTooltip(null)}
      />
    </View>
  );
}

export default InvestmentsScreen;
