import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { CardModal } from '@/shared/components/card-modal';
import { ModalHeader } from '@/shared/components/modal-header';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import {
  getPortfolioSummaryForUser,
  type DashboardSummaryApiResponse,
} from '@/features/investments/front/src/api/investmentsClient';
import {
  mapSummaryToPortfolioSummary,
  mapContextToContextCards,
} from '@/features/dashboard/front/src/state/mapDashboardSummary';
import type {
  PortfolioSummary,
  ContextCard as ContextCardType,
} from '@/features/dashboard/front/src/types/dashboard.types';
import type { DonutSegment } from '@/features/dashboard/front/src/types/portfolio-chart.types';
import { PortfolioDonutChart } from '@/features/dashboard/front/src/components/PortfolioDonutChart';
import { ContextCard } from '@/features/dashboard/front/src/components/ContextCard';
import { createDashboardStyles } from '@/features/dashboard/front/src/ui/Dashboard.styles';
import { ProfileAvatar } from './profileAvatar';
import { getDivisionFromExperience } from '@/shared/constants/divisions';
import { getNivelFromExperience } from '@/shared/constants/xp-level';
import type { ProfileUser } from '../types/profile.types';
import ExpIcon from '@/shared/icons/exp.svg';
import LigaIcon from '@/shared/icons/liga.svg';
import RachaIcon from '@/shared/icons/racha.svg';
import { createProfileStyles } from '../ui/Profile.styles';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type FriendProfileModalProps = {
  open: boolean;
  onClose: () => void;
  profile: ProfileUser | null;
  loading: boolean;
  error: string | null;
  friendUserId: string | null;
};

const DONUT_PALETTE = [
  '#0f172a',
  '#1e40af',
  '#0891b2',
  '#2563eb',
  '#7c3aed',
  '#06b6d4',
  '#60a5fa',
] as const;

function segmentsWithBlueScale(
  segments: Omit<DonutSegment, 'color'>[],
): DonutSegment[] {
  const sorted = [...segments].sort((a, b) => b.value - a.value);
  const n = DONUT_PALETTE.length;
  return sorted.map((seg, i) => ({
    ...seg,
    color: DONUT_PALETTE[(i * 2) % n] ?? DONUT_PALETTE[i % n],
  }));
}

const EMPTY_DONUT: DonutSegment[] = segmentsWithBlueScale([
  { label: 'Sin datos', value: 100 },
]);

const SECTOR_LABELS: Record<string, string> = {
  Technology: 'Tecnología',
  Healthcare: 'Salud',
  Financial: 'Finanzas',
  'Consumer Cyclical': 'Consumo cíclico',
  'Consumer Defensive': 'Consumo defensivo',
  Energy: 'Energía',
  Industrials: 'Industrial',
  'Communication Services': 'Comunicación',
  'Real Estate': 'Inmobiliario',
  'Basic Materials': 'Materiales básicos',
  Utilities: 'Servicios públicos',
};

const ENTRY_GREEN = '#16A34A';

const CHART_TAB_ANIMATION = LayoutAnimation.create(
  220,
  LayoutAnimation.Types.easeInEaseOut,
  LayoutAnimation.Properties.opacity,
);

function formatJoinedText(username?: string, joinedAt?: string): string {
  const userPart = username ? `@${username} ` : '';
  const year = joinedAt
    ? new Date(joinedAt).getFullYear()
    : new Date().getFullYear();
  return `${userPart}se unió en ${year}`;
}

function formatExperience(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`;
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K`;
  return xp.toLocaleString('es-ES');
}

export function FriendProfileModal({
  open,
  onClose,
  profile,
  loading,
  error,
  friendUserId,
}: FriendProfileModalProps) {
  const palette = usePalette();
  const { width: screenWidth } = useWindowDimensions();
  const { session } = useAuthSession();
  const token = session?.token ?? null;

  const styles = useMemo(
    () => createDashboardStyles(palette, screenWidth),
    [palette, screenWidth],
  );
  const profileStyles = useMemo(
    () => createProfileStyles(palette),
    [palette],
  );

  const [contentHeight, setContentHeight] = useState<number | undefined>();
  const [dashboardData, setDashboardData] =
    useState<DashboardSummaryApiResponse | null>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [dashError, setDashError] = useState<string | null>(null);

  const [activeChart, setActiveChart] = useState<'sector' | 'geo' | 'stocks'>(
    'sector',
  );

  useEffect(() => {
    if (!open || !friendUserId || !token) {
      setDashboardData(null);
      setDashError(null);
      setActiveChart('sector');
      return;
    }
    let cancelled = false;
    setDashLoading(true);
    setDashError(null);
    getPortfolioSummaryForUser(friendUserId, token)
      .then((data) => {
        if (!cancelled) setDashboardData(data);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : 'Error al cargar datos';
          setDashError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setDashLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, friendUserId, token]);

  const portfolioSummary: PortfolioSummary | null = useMemo(() => {
    if (!dashboardData?.summary) return null;
    return mapSummaryToPortfolioSummary(dashboardData.summary);
  }, [dashboardData]);

  const contextCards: ContextCardType[] = useMemo(() => {
    if (!dashboardData?.context) return [];
    return mapContextToContextCards(dashboardData.context);
  }, [dashboardData]);

  function buildDonut<T extends { value: number }>(
    items: T[],
    labelFn: (item: T) => string,
  ): DonutSegment[] {
    if (!items.length) return EMPTY_DONUT;
    const total = items.reduce(
      (s, a) =>
        s + (typeof a.value === 'number' ? a.value : Number(a.value) || 0),
      0,
    );
    if (total <= 0) return EMPTY_DONUT;
    const raw = items.map((a) => {
      const val = typeof a.value === 'number' ? a.value : Number(a.value) || 0;
      return { label: labelFn(a), value: Math.round((val / total) * 1000) / 10 };
    });
    return segmentsWithBlueScale(raw);
  }

  const sectorSegments = useMemo(() => {
    const sectors = dashboardData?.allocationSectors ?? [];
    return buildDonut(sectors, (a) => {
      const sector = String(a.sector ?? '').trim();
      const label = SECTOR_LABELS[sector] ?? sector;
      return label || 'Otros';
    });
  }, [dashboardData]);

  const geoSegments = useMemo(() => {
    const geo = dashboardData?.allocationGeography ?? [];
    if (!geo.length) {
      const stocks = dashboardData?.allocationStocks ?? [];
      if (stocks.length) return segmentsWithBlueScale([{ label: 'Otros', value: 100 }]);
      return EMPTY_DONUT;
    }
    return buildDonut(geo, (a) => {
      const t = String(a.region ?? '').trim();
      return t || 'Otros';
    });
  }, [dashboardData]);

  const stocksSegments = useMemo(() => {
    const stocks = dashboardData?.allocationStocks ?? [];
    return buildDonut(stocks, (a) => {
      const t = String(a.symbol ?? a.name ?? '').trim();
      return t || '?';
    });
  }, [dashboardData]);

  const donutSegments =
    activeChart === 'sector'
      ? sectorSegments
      : activeChart === 'geo'
        ? geoSegments
        : stocksSegments;

  const pillLeft = useSharedValue(0);
  const pillWidth = useSharedValue(80);
  const [tabLayouts, setTabLayouts] = useState<
    Record<string, { x: number; width: number }>
  >({});
  const pillAnimatedOnce = useRef(false);

  const measureTab = useCallback(
    (key: string) =>
      (event: { nativeEvent: { layout: { x: number; width: number } } }) => {
        const { x, width } = event.nativeEvent.layout;
        setTabLayouts((prev) => ({ ...prev, [key]: { x, width } }));
      },
    [],
  );

  useEffect(() => {
    const layout = tabLayouts[activeChart];
    if (!layout) return;
    if (!pillAnimatedOnce.current) {
      pillLeft.value = layout.x;
      pillWidth.value = layout.width;
      pillAnimatedOnce.current = true;
    } else {
      pillLeft.value = withTiming(layout.x, { duration: 280 });
      pillWidth.value = withTiming(layout.width, { duration: 280 });
    }
  }, [activeChart, tabLayouts, pillLeft, pillWidth]);

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    left: pillLeft.value,
    width: pillWidth.value,
  }));

  const chartOpacity = useSharedValue(1);
  const isFirstChartMount = useRef(true);
  useEffect(() => {
    if (isFirstChartMount.current) {
      isFirstChartMount.current = false;
      return;
    }
    chartOpacity.value = 0.82;
    chartOpacity.value = withTiming(1, { duration: 220 });
  }, [activeChart, chartOpacity]);
  const donutAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
  }));

  const displayName = profile?.name ?? 'Usuario';
  const joinedText = formatJoinedText(profile?.username, profile?.joinedAt);

  const summary = portfolioSummary;
  const totalProfitPositive = summary?.totalProfitability.amount.startsWith('+');
  const dailyProfitPositive = summary?.dailyProfitability.amount.startsWith('+');

  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.98}
      scrollable
      contentHeight={contentHeight}
      contentNoPaddingTop
    >
      <ModalHeader
        title={displayName}
        subtitle={joinedText}
        onBack={onClose}
        onClose={onClose}
        backAccessibilityLabel="Volver"
      />
      {loading ? (
        <View style={[profileStyles.loadingContainer, { paddingVertical: 48 }]}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : error ? (
        <View style={{ padding: 24 }}>
          <Text variant="muted" style={{ textAlign: 'center' }}>
            {error}
          </Text>
        </View>
      ) : profile ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={(_w, h) => setContentHeight(h)}
        >
          {/* Avatar */}
          <View style={{ alignItems: 'center', paddingTop: 4, paddingBottom: 8 }}>
            <ProfileAvatar
              size={80}
              iconOnly={false}
              imageUri={profile.avatarUrl}
            />
          </View>

          {/* Mini resumen perfil: racha, nivel, liga, XP (centrado en altura en su bloque) */}
          <View
            style={{
              paddingHorizontal: 20,
              marginBottom: 16,
              minHeight: 96,
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: `${palette.primary}12`,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 10,
                }}
              >
                <RachaIcon width={14} height={14} />
                <Text style={[Hierarchy.captionSmall, { color: palette.text }]}>
                  {profile.bf ?? 0} días
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: `${palette.primary}12`,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 10,
                }}
              >
                <LigaIcon width={14} height={14} />
                <Text style={[Hierarchy.captionSmall, { color: palette.text }]}>
                  {getDivisionFromExperience(profile.experience ?? 0)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: `${palette.primary}12`,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 10,
                }}
              >
                <ExpIcon width={14} height={14} />
                <Text style={[Hierarchy.captionSmall, { color: palette.text }]}>
                  {formatExperience(profile.experience ?? 0)} XP
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: `${palette.primary}12`,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 10,
                }}
              >
                <Text style={[Hierarchy.captionSmall, { color: palette.text }]}>
                  Nv. {getNivelFromExperience(profile.experience ?? 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Dashboard del amigo */}
          {dashLoading ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={palette.primary} />
              <Text
                style={[
                  Hierarchy.captionSmall,
                  { color: palette.icon, marginTop: 8 },
                ]}
              >
                Cargando cartera...
              </Text>
            </View>
          ) : dashError ? (
            <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
              <Text
                variant="muted"
                style={{ textAlign: 'center', fontSize: 13 }}
              >
                {dashError}
              </Text>
            </View>
          ) : summary ? (
            <View style={{ paddingHorizontal: 20 }}>
              {/* Resumen global */}
              <View style={styles.sectionTitleWrap}>
                <View style={styles.sectionTitleAccent} />
                <Text
                  style={[
                    Hierarchy.titleSection,
                    styles.sectionTitle,
                    { color: palette.icon ?? palette.text },
                  ]}
                >
                  Resumen global de la cartera
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      Hierarchy.bodySmall,
                      styles.summaryLabel,
                      { color: palette.icon ?? palette.text },
                    ]}
                  >
                    Valor total de la cartera
                  </Text>
                  <Text
                    style={[
                      Hierarchy.bodySmallSemibold,
                      styles.summaryValue,
                      { color: palette.text },
                    ]}
                  >
                    {summary.totalValue}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      Hierarchy.bodySmall,
                      styles.summaryLabel,
                      { color: palette.icon ?? palette.text },
                    ]}
                  >
                    Rentabilidad total
                  </Text>
                  <Text
                    style={[
                      Hierarchy.bodySmallSemibold,
                      styles.summaryValue,
                      {
                        color: totalProfitPositive
                          ? ENTRY_GREEN
                          : palette.destructive,
                      },
                    ]}
                  >
                    {summary.totalProfitability.amount} (
                    {summary.totalProfitability.percent})
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      Hierarchy.bodySmall,
                      styles.summaryLabel,
                      { color: palette.icon ?? palette.text },
                    ]}
                  >
                    Rentabilidad del día
                  </Text>
                  <Text
                    style={[
                      Hierarchy.bodySmallSemibold,
                      styles.summaryValue,
                      {
                        color: dailyProfitPositive
                          ? ENTRY_GREEN
                          : palette.destructive,
                      },
                    ]}
                  >
                    {summary.dailyProfitability.amount} (
                    {summary.dailyProfitability.percent})
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      Hierarchy.bodySmall,
                      styles.summaryLabel,
                      { color: palette.icon ?? palette.text },
                    ]}
                  >
                    Cash disponible
                  </Text>
                  <Text
                    style={[
                      Hierarchy.bodySmallSemibold,
                      styles.summaryValue,
                      { color: palette.text },
                    ]}
                  >
                    {summary.availableCash}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryRowLast]}>
                  <Text
                    style={[
                      Hierarchy.bodySmall,
                      styles.summaryLabel,
                      { color: palette.icon ?? palette.text },
                    ]}
                  >
                    Total invertido
                  </Text>
                  <Text
                    style={[
                      Hierarchy.bodySmallSemibold,
                      styles.summaryValue,
                      { color: palette.text },
                    ]}
                  >
                    {summary.totalInvested}
                  </Text>
                </View>
              </View>

              {/* Donut: Cartera */}
              <View style={styles.sectionTitleWrap}>
                <View style={styles.sectionTitleAccent} />
                <Text
                  style={[
                    Hierarchy.titleSection,
                    styles.sectionTitle,
                    { color: palette.icon ?? palette.text },
                  ]}
                >
                  Cartera
                </Text>
              </View>
              <View style={[styles.donutCard, { paddingHorizontal: 0 }]}>
                <View style={styles.donutTabsWrap}>
                  <Animated.View
                    style={[
                      styles.donutTabPill,
                      pillAnimatedStyle,
                      { pointerEvents: 'none' },
                    ]}
                  />
                  {(
                    [
                      { key: 'sector' as const, label: 'Sector' },
                      { key: 'geo' as const, label: 'Geográfica' },
                      { key: 'stocks' as const, label: 'Acciones' },
                    ] as const
                  ).map(({ key, label }) => {
                    const isActive = activeChart === key;
                    return (
                      <Pressable
                        key={key}
                        accessibilityRole="button"
                        accessibilityLabel={label}
                        style={styles.donutTab}
                        onLayout={measureTab(key)}
                        onPress={() => {
                          if (activeChart !== key) {
                            if (Platform.OS !== 'web') {
                              LayoutAnimation.configureNext(
                                CHART_TAB_ANIMATION,
                              );
                            }
                            setActiveChart(key);
                          }
                        }}
                      >
                        <Text
                          style={[
                            Hierarchy.bodySmallSemibold,
                            {
                              color: palette.primary,
                              fontSize: isActive ? 17 : 15,
                              letterSpacing: -0.2,
                              fontWeight: isActive ? '700' : '500',
                            },
                          ]}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Animated.View
                  style={[styles.donutWrap, donutAnimatedStyle]}
                >
                  <PortfolioDonutChart
                    key={activeChart}
                    segments={donutSegments}
                    size={200}
                    strokeWidth={38}
                    centerLabel={summary.totalInvested}
                    centerSublabel="Total invertido"
                    showLegend
                  />
                </Animated.View>
              </View>

              {/* Contexto */}
              {contextCards.length > 0 && (
                <>
                  <View style={styles.sectionTitleWrap}>
                    <View style={styles.sectionTitleAccent} />
                    <Text
                      style={[
                        Hierarchy.titleSection,
                        styles.sectionTitle,
                        { color: palette.icon ?? palette.text },
                      ]}
                    >
                      Contexto de su cartera
                    </Text>
                  </View>
                  <View style={styles.contextGrid}>
                    {contextCards.map((card) => (
                      <ContextCard key={card.id} card={card} styles={styles} />
                    ))}
                  </View>
                </>
              )}
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </CardModal>
  );
}

export default FriendProfileModal;
