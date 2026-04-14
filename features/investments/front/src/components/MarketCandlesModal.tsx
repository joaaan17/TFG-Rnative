import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Minus, Plus } from 'lucide-react-native';
import { CardModal } from '@/shared/components/card-modal';
import { ModalHeader } from '@/shared/components/modal-header';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import { useAwardExperience } from '@/features/profile/front/src/hooks/useAwardExperience';
import { useCurrentQuotePrice } from '../hooks/useCurrentQuotePrice';
import { useMarketOverview } from '../hooks/useMarketOverview';
import { usePortfolio } from '../hooks/usePortfolio';
import { useBuyOrder } from '../hooks/useBuyOrder';
import { useSellOrder } from '../hooks/useSellOrder';
import { QuoteGrid } from './QuoteGrid';
import { FundamentalsList } from './FundamentalsList';
import { InvertirSheet } from './InvertirSheet';
import { VenderSheet } from './VenderSheet';
import { PurchaseSuccessModal } from './PurchaseSuccessModal';
import { SaleSuccessModal } from './SaleSuccessModal';
import { PortfolioChart } from './PortfolioChart';
import { FinancialTooltipModal } from './FinancialTooltipModal';
import { FINANCIAL_TERMS } from '../constants/financialTerms';

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
  /** Al pulsar "Ir a Inversiones" en el modal de compra exitosa: recargar cartera en la pantalla principal y cerrar este modal. */
  onGoToMain?: () => void;
};

type OperarStep = 'chart' | 'actions';

export function MarketCandlesModal({
  visible,
  asset,
  onClose,
  onBack,
  onOperar,
  onOrdenes,
  onGoToMain: onGoToMainFromParent,
}: MarketCandlesModalProps) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const [operarStep, setOperarStep] = useState<OperarStep>('chart');
  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const comprarTranslateY = useRef(new Animated.Value(16)).current;
  const venderTranslateY = useRef(new Animated.Value(16)).current;
  const [venderOpen, setVenderOpen] = useState(false);
  const [comprarOpen, setComprarOpen] = useState(false);
  const [purchaseSuccessOpen, setPurchaseSuccessOpen] = useState(false);
  const [saleSuccessOpen, setSaleSuccessOpen] = useState(false);
  const [purchaseXpAwarded, setPurchaseXpAwarded] = useState<number | null>(null);
  const [saleXpAwarded, setSaleXpAwarded] = useState<number | null>(null);
  const [posTooltip, setPosTooltip] = useState<{ title: string; desc: string } | null>(null);
  const openPosTooltip = useCallback((label: string) => {
    const desc = FINANCIAL_TERMS[label];
    if (desc) setPosTooltip({ title: label, desc });
  }, []);

  useEffect(() => {
    if (!visible) {
      setOperarStep('chart');
      setVenderOpen(false);
      setComprarOpen(false);
      setPurchaseSuccessOpen(false);
      setSaleSuccessOpen(false);
      setPurchaseXpAwarded(null);
      setSaleXpAwarded(null);
      actionsOpacity.setValue(0);
      comprarTranslateY.setValue(16);
      venderTranslateY.setValue(16);
    }
  }, [visible, actionsOpacity, comprarTranslateY, venderTranslateY]);

  useEffect(() => {
    if (operarStep === 'actions') {
      actionsOpacity.setValue(0);
      comprarTranslateY.setValue(16);
      venderTranslateY.setValue(16);
      Animated.parallel([
        Animated.timing(actionsOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.sequence([
          Animated.delay(80),
          Animated.timing(comprarTranslateY, {
            toValue: 0,
            duration: 240,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
        ]),
        Animated.sequence([
          Animated.delay(140),
          Animated.timing(venderTranslateY, {
            toValue: 0,
            duration: 240,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
        ]),
      ]).start();
    } else {
      actionsOpacity.setValue(0);
    }
  }, [operarStep, actionsOpacity, comprarTranslateY, venderTranslateY]);

  const symbol = asset?.symbol ?? '';
  const { session } = useAuthSession();
  const { award } = useAwardExperience();
  const { data: portfolioData, refetch: refetchPortfolio } = usePortfolio(
    session?.token ?? null,
    visible,
  );
  const {
    execute: executeBuy,
    loading: buyLoading,
    error: buyError,
    clearError: clearBuyError,
  } = useBuyOrder(session?.token ?? null);
  const {
    execute: executeSell,
    loading: sellLoading,
    error: sellError,
    clearError: clearSellError,
  } = useSellOrder(session?.token ?? null);
  const {
    data: overviewData,
    loading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useMarketOverview(symbol, visible && !!symbol);
  const { price: currentQuotePrice } = useCurrentQuotePrice(
    symbol,
    visible && !!symbol,
    5 * 60 * 1000,
  );
  const showChart = operarStep === 'chart';
  const showActions = operarStep === 'actions';
  const cashBalance = portfolioData?.cashBalance ?? 0;
  const holdingForSymbol = portfolioData?.holdings?.find(
    (h) => h.symbol === symbol,
  );
  const quote = overviewData?.quote;
  // Precio actual: misma fuente que useHoldingsWithPrices (getQuotes → q.price)
  // para que el beneficio coincida en la card y en el modal.
  const lastClose =
    currentQuotePrice != null
      ? currentQuotePrice
      : quote?.high != null && quote?.low != null
        ? (quote.high + quote.low) / 2
        : (quote?.high ?? quote?.low ?? undefined);
  const positionAmount = (holdingForSymbol?.shares ?? 0) * (lastClose ?? 0);

  return (
    <>
      <CardModal
        open={visible}
        onClose={onClose}
        maxHeightPct={1}
        closeOnBackdropPress
        scrollable={!showActions}
        contentNoPaddingTop
        fillSheetHeight={showActions}
      >
        <View style={{ flex: 1, minHeight: 0 }}>
          <ModalHeader
            title={asset?.name ?? ''}
            subtitle={asset?.symbol ?? ''}
            onBack={
              showActions || onBack != null
                ? showActions
                  ? () => setOperarStep('chart')
                  : onBack!
                : undefined
            }
            onClose={onClose}
            backAccessibilityLabel={
              showActions ? 'Volver al gráfico' : 'Volver al buscador'
            }
          />

          {operarStep === 'chart' && (
            <ScrollView
              style={{ flex: 1, minHeight: 0 }}
              contentContainerStyle={{
                paddingBottom: 24 + Math.max(insets.bottom, 0),
              }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              scrollEventThrottle={16}
            >
              {operarStep === 'chart' && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                  {showChart && symbol ? (
                    <PortfolioChart
                      symbol={symbol}
                      enabled={!!symbol}
                      height={280}
                      containerStyle={{ paddingHorizontal: 0 }}
                      currentPrice={
                        currentQuotePrice ?? undefined
                      }
                    />
                  ) : null}

                  {holdingForSymbol && (
                    <View style={{ marginTop: 20, marginBottom: 16 }}>
                      {lastClose != null && (
                        <Pressable
                          onLongPress={() => openPosTooltip('Precio actual')}
                          delayLongPress={400}
                          style={({ pressed }) => ({
                            marginBottom: 16,
                            opacity: pressed ? 0.92 : 1,
                          })}
                          accessibilityRole="text"
                          accessibilityLabel={`Precio actual ${lastClose.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} dólares`}
                        >
                          <View
                            style={{
                              borderRadius: 14,
                              borderWidth: 0,
                              backgroundColor:
                                palette.surfaceMuted ?? `${palette.primary}0A`,
                              paddingVertical: 14,
                              paddingHorizontal: 16,
                            }}
                          >
                            <Text
                              style={[
                                Hierarchy.caption,
                                {
                                  color: palette.icon ?? palette.text,
                                  marginBottom: 6,
                                  letterSpacing: 1.2,
                                  textTransform: 'uppercase',
                                  opacity: 0.72,
                                },
                              ]}
                            >
                              Precio actual
                            </Text>
                            <Text
                              style={[
                                Hierarchy.titleModalLarge,
                                {
                                  color: palette.primary,
                                  fontWeight: '700',
                                  letterSpacing: -0.5,
                                  opacity: 0.88,
                                },
                              ]}
                            >
                              {lastClose.toLocaleString('es-ES', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              $
                            </Text>
                          </View>
                        </Pressable>
                      )}
                      <Text
                        style={[
                          Hierarchy.titleSection,
                          {
                            color: palette.icon ?? palette.text,
                            marginBottom: 4,
                          },
                        ]}
                      >
                        Tu posición
                      </Text>
                      <Text
                        style={[
                          Hierarchy.caption,
                          {
                            color: palette.icon ?? palette.text,
                            marginBottom: 10,
                            opacity: 0.85,
                          },
                        ]}
                      >
                        Valores en tiempo real (beneficio no realizado)
                      </Text>
                      <View style={{ gap: 8 }}>
                        <Pressable
                          onPress={() => openPosTooltip('Acciones')}
                          accessibilityRole="button"
                          accessibilityHint="Toca para ver la explicación"
                          style={({ pressed }) => ({
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: pressed ? 0.85 : 1,
                          })}
                        >
                          <Text
                            style={[
                              Hierarchy.bodySmall,
                              { color: palette.icon ?? palette.text },
                            ]}
                          >
                            Acciones
                          </Text>
                          <Text
                            style={[
                              Hierarchy.action,
                              { color: palette.text, fontWeight: '600' },
                            ]}
                          >
                            {holdingForSymbol.shares.toLocaleString('es-ES', {
                              maximumFractionDigits: 4,
                            })}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => openPosTooltip('Precio medio compra')}
                          accessibilityRole="button"
                          accessibilityHint="Toca para ver la explicación"
                          style={({ pressed }) => ({
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: pressed ? 0.85 : 1,
                          })}
                        >
                          <Text
                            style={[
                              Hierarchy.bodySmall,
                              { color: palette.icon ?? palette.text },
                            ]}
                          >
                            Precio medio compra
                          </Text>
                          <Text
                            style={[Hierarchy.action, { color: palette.text }]}
                          >
                            {holdingForSymbol.avgBuyPrice.toLocaleString(
                              'es-ES',
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}{' '}
                            $
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => openPosTooltip('Valor actual')}
                          accessibilityRole="button"
                          accessibilityHint="Toca para ver la explicación"
                          style={({ pressed }) => ({
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: pressed ? 0.85 : 1,
                          })}
                        >
                          <Text
                            style={[
                              Hierarchy.bodySmall,
                              { color: palette.icon ?? palette.text },
                            ]}
                          >
                            Valor actual
                          </Text>
                          <Text
                            style={[
                              Hierarchy.action,
                              { color: palette.text, fontWeight: '600' },
                            ]}
                          >
                            {positionAmount.toLocaleString('es-ES', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            $
                          </Text>
                        </Pressable>
                        {lastClose != null && (
                          <Pressable
                            onPress={() => openPosTooltip('Beneficios')}
                            accessibilityRole="button"
                            accessibilityHint="Toca para ver la explicación"
                            style={({ pressed }) => ({
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: 4,
                              paddingTop: 8,
                              borderTopWidth: 1,
                              borderTopColor:
                                palette.surfaceBorder ?? 'rgba(0,0,0,0.08)',
                              opacity: pressed ? 0.85 : 1,
                            })}
                          >
                            <Text
                              style={[
                                Hierarchy.bodySmall,
                                { color: palette.icon ?? palette.text },
                              ]}
                            >
                              Beneficios
                            </Text>
                            <Text
                              style={[
                                Hierarchy.action,
                                {
                                  fontWeight: '600',
                                  color:
                                    positionAmount -
                                      holdingForSymbol.shares *
                                        holdingForSymbol.avgBuyPrice >=
                                    0
                                      ? (palette.positive ?? '#16A34A')
                                      : (palette.destructive ?? '#E5484D'),
                                },
                              ]}
                            >
                              {positionAmount -
                                holdingForSymbol.shares *
                                  holdingForSymbol.avgBuyPrice >=
                              0
                                ? '+'
                                : ''}
                              {(
                                positionAmount -
                                holdingForSymbol.shares *
                                  holdingForSymbol.avgBuyPrice
                              ).toLocaleString('es-ES', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              $
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  )}

                  {
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
                                  backgroundColor:
                                    palette.surfaceMuted ?? '#eee',
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
                                  backgroundColor:
                                    palette.surfaceMuted ?? '#eee',
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
                            style={[
                              Hierarchy.bodySmall,
                              { textAlign: 'center', color: palette.icon },
                            ]}
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
                            <Text
                              style={[
                                Hierarchy.action,
                                { color: palette.primaryText ?? '#FFF' },
                              ]}
                            >
                              Reintentar
                            </Text>
                          </Pressable>
                        </View>
                      )}
                      {overviewData && (
                        <>
                          <QuoteGrid
                            quote={overviewData.quote}
                            palette={palette}
                          />
                          <FundamentalsList
                            fundamentals={overviewData.fundamentals}
                            palette={palette}
                          />
                        </>
                      )}
                    </>
                  }
                </View>
              )}
            </ScrollView>
          )}

          {operarStep === 'chart' && showChart && (
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: Math.max(insets.bottom, 16),
              }}
            >
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={onOrdenes}
                  accessibilityRole="button"
                  accessibilityLabel="Historial"
                  android_ripple={{
                    color: 'rgba(255,255,255,0.2)',
                    borderless: false,
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                >
                  <View
                    style={{
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: palette.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={[
                        Hierarchy.action,
                        {
                          color: palette.primaryText ?? '#FFF',
                          fontWeight: '600',
                        },
                      ]}
                    >
                      Historial
                    </Text>
                  </View>
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={() => setOperarStep('actions')}
                  accessibilityRole="button"
                  accessibilityLabel="Operar"
                  android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                >
                  <View
                    style={{
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: palette.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={[
                        Hierarchy.action,
                        { color: palette.primaryText ?? '#FFF', fontWeight: '600' },
                      ]}
                    >
                      Operar
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )}

          {showActions && (
            <Animated.View
              style={{
                flex: 1,
                justifyContent: 'center',
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 24,
                opacity: actionsOpacity,
              }}
            >
              <Animated.View
                style={{ transform: [{ translateY: comprarTranslateY }] }}
              >
                <Pressable
                  onPress={() => setComprarOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Comprar"
                  android_ripple={{ color: palette.surfaceBorder ?? 'rgba(0,0,0,0.08)', borderless: false }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                >
                  <View
                    style={{
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
                    }}
                  >
                    <Text
                      style={[
                        Hierarchy.action,
                        { color: palette.text, fontWeight: '600' },
                      ]}
                    >
                      Comprar
                    </Text>
                    <Plus size={22} color={palette.text} strokeWidth={2.5} />
                  </View>
                </Pressable>
              </Animated.View>
              <Animated.View
                style={{ marginTop: 12, transform: [{ translateY: venderTranslateY }] }}
              >
                <Pressable
                  onPress={() =>
                    (holdingForSymbol?.shares ?? 0) > 0 && setVenderOpen(true)
                  }
                  disabled={
                    !holdingForSymbol || (holdingForSymbol?.shares ?? 0) <= 0
                  }
                  accessibilityRole="button"
                  accessibilityLabel={
                    (holdingForSymbol?.shares ?? 0) > 0
                      ? 'Vender'
                      : 'No tienes posición para vender'
                  }
                  android_ripple={{ color: palette.surfaceBorder ?? 'rgba(0,0,0,0.08)', borderless: false }}
                  style={({ pressed }) => ({
                    opacity: pressed
                      ? 0.85
                      : (holdingForSymbol?.shares ?? 0) > 0
                        ? 1
                        : 0.5,
                  })}
                >
                  <View
                    style={{
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
                    }}
                  >
                    <Text
                      style={[
                        Hierarchy.action,
                        { color: palette.text, fontWeight: '600' },
                      ]}
                    >
                      Vender
                    </Text>
                    <Minus size={22} color={palette.text} strokeWidth={2.5} />
                  </View>
                </Pressable>
              </Animated.View>
            </Animated.View>
          )}
        </View>
      </CardModal>

      <FinancialTooltipModal
        visible={!!posTooltip}
        title={posTooltip?.title ?? ''}
        description={posTooltip?.desc ?? ''}
        palette={palette}
        onClose={() => setPosTooltip(null)}
      />

      <VenderSheet
        visible={venderOpen}
        onClose={() => setVenderOpen(false)}
        sharesAvailable={holdingForSymbol?.shares ?? 0}
        price={lastClose ?? 0}
        symbol={asset?.symbol}
        onSell={async (sym, shares) => {
          const result = await executeSell(sym, shares, {
            price: lastClose ?? undefined,
          });
          if (result) {
            const xp = await award('SELL_STOCK');
            setSaleXpAwarded(xp);
            setVenderOpen(false);
            // En Android los Modales nativos no pueden apilarse: esperamos a que
            // VenderSheet termine su animación de cierre (180 ms) antes de abrir
            // el modal de éxito, evitando bloqueo de toques y XP invisible.
            setTimeout(() => setSaleSuccessOpen(true), 280);
          }
        }}
        sellLoading={sellLoading}
        sellError={sellError}
        onClearSellError={clearSellError}
      />
      <InvertirSheet
        visible={comprarOpen}
        onClose={() => setComprarOpen(false)}
        availableAmount={cashBalance}
        price={lastClose ?? 0}
        symbol={asset?.symbol}
        onBuy={async (sym, shares) => {
          const result = await executeBuy(sym, shares, {
            price: lastClose ?? undefined,
          });
          if (result) {
            const xp = await award('BUY_STOCK');
            setPurchaseXpAwarded(xp);
            setComprarOpen(false);
            // En Android los Modales nativos no pueden apilarse: esperamos a que
            // InvertirSheet termine su animación de cierre (180 ms) antes de abrir
            // el modal de éxito, evitando bloqueo de toques y XP invisible.
            setTimeout(() => setPurchaseSuccessOpen(true), 280);
          }
        }}
        buyLoading={buyLoading}
        buyError={buyError}
        onClearBuyError={clearBuyError}
      />
      <PurchaseSuccessModal
        visible={purchaseSuccessOpen}
        onClose={() => setPurchaseSuccessOpen(false)}
        xpAwarded={purchaseXpAwarded}
        onGoToMain={() => {
          setPurchaseSuccessOpen(false);
          if (onGoToMainFromParent) {
            onGoToMainFromParent();
          } else {
            refetchPortfolio();
            onClose();
          }
        }}
      />
      <SaleSuccessModal
        visible={saleSuccessOpen}
        onClose={() => setSaleSuccessOpen(false)}
        xpAwarded={saleXpAwarded}
        onGoToMain={() => {
          setSaleSuccessOpen(false);
          if (onGoToMainFromParent) {
            onGoToMainFromParent();
          } else {
            refetchPortfolio();
            onClose();
          }
        }}
      />
    </>
  );
}
