/**
 * Dashboard de cartera — rentabilidad, distribución sectorial/geográfica,
 * mejor activo y diversificación. Estilo minimalista y moderno.
 */
import React, { useMemo } from 'react';
import { ScrollView, useWindowDimensions, View, Pressable, Text as RNText } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, BarChart3, Shield, Search, Bell } from 'lucide-react-native';

import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';
import { PortfolioDonutChart } from '../components/PortfolioDonutChart';
import type { DonutSegment } from '../types/portfolio-chart.types';

import { useDashboardViewModel } from '../state/useDashboardViewModel';
import { createDashboardStyles } from './Dashboard.styles';

// Paleta del gráfico — multi-hue para distinguir bien cada activo/sector (fintech, profesional)
const CHART_COLORS = {
  blue: '#1D4ED8',
  teal: '#0D9488',
  amber: '#D97706',
  emerald: '#059669',
  violet: '#7C3AED',
  cyan: '#0891B2',
  orange: '#EA580C',
  indigo: '#4F46E5',
} as const;

const SECTOR_DATA: DonutSegment[] = [
  { label: 'Tecnología', value: 35, color: CHART_COLORS.blue },
  { label: 'Salud', value: 20, color: CHART_COLORS.teal },
  { label: 'Cripto', value: 20, color: CHART_COLORS.amber },
  { label: 'Consumo defensivo', value: 15, color: CHART_COLORS.emerald },
  { label: 'Energía', value: 10, color: CHART_COLORS.violet },
];

const GEO_DATA: DonutSegment[] = [
  { label: 'EEUU', value: 60, color: CHART_COLORS.blue },
  { label: 'Europa', value: 20, color: CHART_COLORS.teal },
  { label: 'Asia', value: 10, color: CHART_COLORS.amber },
  { label: 'Emergentes', value: 10, color: CHART_COLORS.violet },
];

export function DashboardScreen() {
  const { activeChart, setActiveChart } = useDashboardViewModel();
  const palette = usePalette();
  const { width: screenWidth } = useWindowDimensions();
  const styles = useMemo(
    () => createDashboardStyles(palette, screenWidth),
    [palette, screenWidth],
  );

  const segments = activeChart === 'sector' ? SECTOR_DATA : GEO_DATA;
  const centerLabel =
    activeChart === 'sector' ? '1.769 $' : '1.769 $';
  const centerSublabel =
    activeChart === 'sector'
      ? 'Valor por sector'
      : 'Valor por región';

  const chartCardGradient = useMemo(() => {
    const primary = palette.primary ?? '#1D4ED8';
    const isLight = (palette.background ?? palette.mainBackground) === '#F7F9FC';
    if (isLight) {
      return ['#FFFFFF', '#F0F4FF', primary] as const;
    }
    return ['#0F172A', '#1E293B', primary] as const;
  }, [palette.background, palette.mainBackground, palette.primary]);

  return (
    <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.welcomeBlock}>
            <RNText
              style={[
                styles.welcomeLine1,
                { color: palette.icon ?? palette.text },
              ]}
            >
              Bienvenido a tu
            </RNText>
            <RNText
              style={[
                styles.welcomeLine2,
                { color: palette.text },
              ]}
            >
              Dashboard
            </RNText>
          </View>
          <View style={styles.headerIcons}>
            <Pressable
              style={styles.headerIconButton}
              onPress={() => {}}
              accessibilityLabel="Buscar"
            >
              <Search size={20} color={palette.icon ?? palette.text} />
            </Pressable>
            <Pressable
              style={styles.headerIconButton}
              onPress={() => {}}
              accessibilityLabel="Notificaciones"
            >
              <Bell size={20} color={palette.icon ?? palette.text} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Rentabilidad total — card coherente con CARTERA y RESUMEN */}
          <View style={styles.profitabilityWrap}>
            <View style={styles.profitabilityCard}>
              <LinearGradient
                colors={[...chartCardGradient]}
                style={{ flex: 1, borderRadius: 16 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.profitabilityCardInner}>
                  <View style={styles.profitabilityIconWrap}>
                    <TrendingUp size={24} color={palette.primary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.profitabilityTextBlock}>
                    <Text
                      variant="muted"
                      style={[Hierarchy.caption, styles.profitabilityLabel, { color: palette.icon }]}
                    >
                      Rentabilidad total
                    </Text>
                    <Text
                      style={[
                        Hierarchy.value,
                        styles.profitabilityValue,
                        { color: palette.text },
                      ]}
                    >
                      +324,50 $
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Título CARTERA — mismo estilo que RESUMEN */}
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

          {/* Gráfico de dona — card con degradado (estética fintech) */}
          <View style={styles.chartSection}>
            <View style={styles.chartCard}>
              <LinearGradient
                colors={[...chartCardGradient]}
                style={{ flex: 1, borderRadius: 20 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.chartCardInner}>
                  <View style={styles.chartTabs}>
                    <Pressable
                      style={[
                        styles.chartTab,
                        activeChart === 'sector' ? styles.chartTabActive : styles.chartTabInactive,
                      ]}
                      onPress={() => setActiveChart('sector')}
                    >
                      <Text
                        style={[
                          Hierarchy.caption,
                          {
                            color:
                              activeChart === 'sector'
                                ? palette.primaryText ?? '#FFF'
                                : palette.icon ?? palette.text,
                          },
                        ]}
                      >
                        SECTOR
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.chartTab,
                        activeChart === 'geo' ? styles.chartTabActive : styles.chartTabInactive,
                      ]}
                      onPress={() => setActiveChart('geo')}
                    >
                      <Text
                        style={[
                          Hierarchy.caption,
                          {
                            color:
                              activeChart === 'geo'
                                ? palette.primaryText ?? '#FFF'
                                : palette.icon ?? palette.text,
                          },
                        ]}
                      >
                        GEOGRÁFICA
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.donutWrap}>
                    <PortfolioDonutChart
                      segments={segments}
                      size={220}
                      strokeWidth={42}
                      centerLabel={centerLabel}
                      centerSublabel={centerSublabel}
                      showLegend
                    />
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Métricas: Mejor activo, Diversificación */}
          <View style={styles.sectionTitleWrap}>
            <View style={styles.sectionTitleAccent} />
            <Text
              style={[
                Hierarchy.titleSection,
                styles.sectionTitle,
                { color: palette.icon ?? palette.text },
              ]}
            >
              Resumen
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, styles.metricCardHighlight]}>
              <LinearGradient
                colors={[...chartCardGradient]}
                style={styles.metricCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View
                  style={[
                    styles.metricIconWrap,
                    { backgroundColor: `${palette.primary}25` },
                  ]}
                >
                  <TrendingUp size={18} color={palette.primary} />
                </View>
                <Text
                  variant="muted"
                  style={[Hierarchy.caption, styles.metricLabel, { color: palette.icon }]}
                >
                  Mejor activo
                </Text>
                <Text
                  style={[Hierarchy.valueSecondary, styles.metricValue, { color: palette.text }]}
                >
                  Bitcoin
                </Text>
                <Text
                  style={[Hierarchy.captionSmall, { color: palette.primary }]}
                >
                  +4,56%
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.metricCard}>
              <LinearGradient
                colors={[...chartCardGradient]}
                style={styles.metricCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View
                  style={[
                    styles.metricIconWrap,
                    { backgroundColor: palette.surfaceMuted },
                  ]}
                >
                  <BarChart3 size={18} color={palette.primary} />
                </View>
                <Text
                  variant="muted"
                  style={[Hierarchy.caption, styles.metricLabel, { color: palette.icon }]}
                >
                  Diversificación
                </Text>
                <Text
                  style={[Hierarchy.valueSecondary, styles.metricValue, { color: palette.text }]}
                >
                  5 sectores
                </Text>
                <Text
                  style={[Hierarchy.captionSmall, { color: palette.icon }]}
                >
                  Bien distribuido
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.metricCard}>
              <LinearGradient
                colors={[...chartCardGradient]}
                style={styles.metricCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View
                  style={[
                    styles.metricIconWrap,
                    { backgroundColor: palette.surfaceMuted },
                  ]}
                >
                  <Shield size={18} color={palette.primary} />
                </View>
                <Text
                  variant="muted"
                  style={[Hierarchy.caption, styles.metricLabel, { color: palette.icon }]}
                >
                  Riesgo
                </Text>
                <Text
                  style={[Hierarchy.valueSecondary, styles.metricValue, { color: palette.text }]}
                >
                  Moderado
                </Text>
                <Text
                  style={[Hierarchy.captionSmall, { color: palette.icon }]}
                >
                  4 regiones
                </Text>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </View>
  );
}

export default DashboardScreen;
