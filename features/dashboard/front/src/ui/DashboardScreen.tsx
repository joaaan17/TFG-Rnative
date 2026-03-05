/**
 * Dashboard — Resumen global de la cartera, diversificación (donut) y estadísticas.
 * Arquitectura MVVM: View + useDashboardViewModel + tipos/dashboard.types.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { Hierarchy } from '@/design-system/typography';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';

import { useDashboardViewModel } from '../state/useDashboardViewModel';
import { ContextCard } from '../components/ContextCard';
import { PortfolioDonutChart } from '../components/PortfolioDonutChart';
import { createDashboardStyles } from './Dashboard.styles';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ENTRY_GREEN = '#16A34A';

/** Animación al cambiar de opción en el selector del gráfico (sector/geográfica/acciones). */
const CHART_TAB_ANIMATION = LayoutAnimation.create(
  220,
  LayoutAnimation.Types.easeInEaseOut,
  LayoutAnimation.Properties.opacity,
);

export function DashboardScreen() {
  const palette = usePalette();
  const { width: screenWidth } = useWindowDimensions();
  const styles = useMemo(
    () => createDashboardStyles(palette, screenWidth),
    [palette, screenWidth],
  );

  const {
    portfolioSummary,
    activeChart,
    setActiveChart,
    donutSegments,
    contextCards,
    refetch,
    loadingSummary,
    summaryError,
  } = useDashboardViewModel();

  /** Pill deslizante: posición y ancho animados para que se vea el movimiento entre pestañas. */
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
      pillLeft.value = withTiming(layout.x, {
        duration: 280,
      });
      pillWidth.value = withTiming(layout.width, {
        duration: 280,
      });
    }
  }, [activeChart, tabLayouts, pillLeft, pillWidth]);

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    left: pillLeft.value,
    width: pillWidth.value,
  }));

  /** Animación del contenido del gráfico al cambiar de pestaña (web y nativo). */
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

  const summary = portfolioSummary;
  const totalProfitPositive = summary.totalProfitability.amount.startsWith('+');
  const dailyProfitPositive = summary.dailyProfitability.amount.startsWith('+');

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {summaryError ? (
          <Pressable
            style={[
              styles.summaryCard,
              {
                backgroundColor: palette.destructive + '18',
                borderLeftColor: palette.destructive,
                marginBottom: 12,
              },
            ]}
            onPress={refetch}
          >
            <Text style={[Hierarchy.caption, { color: palette.destructive }]}>
              {summaryError}
            </Text>
            <Text
              style={[
                Hierarchy.captionSmall,
                { color: palette.primary, marginTop: 4 },
              ]}
            >
              Pulsa para reintentar
            </Text>
          </Pressable>
        ) : null}
        {/* 1. Resumen global de la cartera (lo primero que ve el usuario) */}
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
          {loadingSummary ? (
            <ActivityIndicator
              size="small"
              color={palette.primary}
              style={{ marginLeft: 8 }}
            />
          ) : null}
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

        {/* 2. Diversificación: gráfico circular por sector / geográfica */}
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
        <View style={styles.donutCard}>
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
                        LayoutAnimation.configureNext(CHART_TAB_ANIMATION);
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
          <Animated.View style={[styles.donutWrap, donutAnimatedStyle]}>
            <PortfolioDonutChart
              segments={donutSegments}
              size={220}
              strokeWidth={42}
              centerLabel={summary.totalInvested}
              centerSublabel="Total invertido"
              showLegend
            />
          </Animated.View>
        </View>

        {/* Contexto debajo del gráfico: mejor/peor inversión, activos, operaciones (sin repetir resumen) */}
        <View style={styles.sectionTitleWrap}>
          <View style={styles.sectionTitleAccent} />
          <Text
            style={[
              Hierarchy.titleSection,
              styles.sectionTitle,
              { color: palette.icon ?? palette.text },
            ]}
          >
            Contexto de tu cartera
          </Text>
        </View>

        <View style={styles.contextGrid}>
          {contextCards.map((card) => (
            <ContextCard key={card.id} card={card} styles={styles} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default DashboardScreen;
