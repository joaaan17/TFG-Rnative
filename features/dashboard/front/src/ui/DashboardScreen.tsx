/**
 * Dashboard de cartera — rentabilidad, distribución sectorial/geográfica,
 * mejor activo y diversificación. Estilo minimalista y moderno.
 */
import React, { useMemo } from 'react';
import { ScrollView, useWindowDimensions, View, Pressable } from 'react-native';
import { ChevronDown, TrendingUp, BarChart3, Shield } from 'lucide-react-native';

import AppShellComponent from '@/shared/components/layout/AppShell';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';
import { PortfolioDonutChart } from '../components/PortfolioDonutChart';
import type { DonutSegment } from '../types/portfolio-chart.types';

import { useDashboardViewModel } from '../state/useDashboardViewModel';
import { createDashboardStyles } from './Dashboard.styles';

// Paleta para gráficos — lavanda/púrpura/azul (referencia UI financiera)
const CHART_COLORS = {
  lavender: '#E8E0F0',
  lavenderDark: '#D4C8E8',
  purple: '#6B5B95',
  purpleDark: '#4A3D6B',
  blue: '#3D4A6B',
  blueLight: '#7B8AA8',
  accent: '#8B7CB5',
} as const;

const SECTOR_DATA: DonutSegment[] = [
  { label: 'Tecnología', value: 35, color: CHART_COLORS.lavender },
  { label: 'Salud', value: 20, color: CHART_COLORS.purple },
  { label: 'Cripto', value: 20, color: CHART_COLORS.purpleDark },
  { label: 'Consumo defensivo', value: 15, color: CHART_COLORS.blue },
  { label: 'Energía', value: 10, color: CHART_COLORS.lavenderDark },
];

const GEO_DATA: DonutSegment[] = [
  { label: 'EEUU', value: 60, color: CHART_COLORS.lavender },
  { label: 'Europa', value: 20, color: CHART_COLORS.purple },
  { label: 'Asia', value: 10, color: CHART_COLORS.blue },
  { label: 'Emergentes', value: 10, color: CHART_COLORS.lavenderDark },
];

export function DashboardScreen() {
  const { typewriterKey, activeChart, setActiveChart } = useDashboardViewModel();
  const palette = usePalette();
  const { width: screenWidth } = useWindowDimensions();
  const styles = useMemo(
    () => createDashboardStyles(palette, screenWidth),
    [palette, screenWidth],
  );

  const segments = activeChart === 'sector' ? SECTOR_DATA : GEO_DATA;
  const centerLabel =
    activeChart === 'sector' ? '1.769 €' : '1.769 €';
  const centerSublabel =
    activeChart === 'sector'
      ? 'Valor por sector'
      : 'Valor por región';

  return (
    <AppShellComponent>
      <View style={styles.container}>
        <View style={styles.header}>
          <TypewriterTextComponent
            key={typewriterKey}
            text="DASHBOARD"
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
          {/* Rentabilidad total */}
          <View style={styles.profitabilityWrap}>
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
              +324,50 €
            </Text>
            <View style={styles.periodSelector}>
              <Text
                style={[Hierarchy.caption, { color: palette.icon ?? palette.text }]}
              >
                Últimos 30 días
              </Text>
              <ChevronDown size={14} color={palette.icon ?? palette.text} />
            </View>
          </View>

          {/* Gráfico de dona — sector / geográfico */}
          <View style={styles.chartSection}>
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
            </View>

            <View style={styles.metricCard}>
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
            </View>

            <View style={styles.metricCard}>
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
            </View>
          </View>
        </ScrollView>
      </View>
    </AppShellComponent>
  );
}

export default DashboardScreen;
