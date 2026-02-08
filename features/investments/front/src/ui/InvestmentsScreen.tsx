import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import AppShellComponent from '@/shared/components/layout/AppShell';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import {
  SegmentedTextTabs,
  type SegmentedTextTabsValue,
} from '@/shared/components/ui/segmented-text-tabs';
import { Text } from '@/shared/components/ui/text';
import { AssetLabel } from '@/shared/components/asset-label';
import {
  LightweightChartView,
  useMarketChartViewModel,
} from '@/features/market-chart';

import { investmentsStyles } from './Investments.styles';

/**
 * Pantalla de Inversiones con TradingView Lightweight Charts.
 * No hace fetch aquí: el ViewModel carga los datos; la Screen solo renderiza.
 */
export function InvestmentsScreen() {
  const { data, loading, error, loadChart } = useMarketChartViewModel();
  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [tab, setTab] = React.useState<SegmentedTextTabsValue>(0);

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      loadChart();
      return undefined;
    }, [loadChart]),
  );

  return (
    <AppShellComponent>
      <View style={investmentsStyles.container}>
        <View style={investmentsStyles.header}>
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
          style={investmentsStyles.scroll}
          contentContainerStyle={investmentsStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={investmentsStyles.tabs}>
            <SegmentedTextTabs
              labels={['Cartera', 'Efectivo']}
              value={tab}
              onValueChange={setTab}
            />
          </View>

          <View style={investmentsStyles.amount}>
            <Text variant="h3">1769 $</Text>
          </View>

          <View style={investmentsStyles.chartSection}>
            {loading && (
              <View style={investmentsStyles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text variant="muted" style={investmentsStyles.errorText}>
                  Cargando gráfico...
                </Text>
              </View>
            )}
            {error && (
              <Text variant="muted" style={investmentsStyles.errorText}>
                {error}
              </Text>
            )}
            {!loading && !error && data?.candles && data.candles.length > 0 && (
              <View style={investmentsStyles.chartContainer}>
                <LightweightChartView candles={data.candles} height={280} />
              </View>
            )}
          </View>

          <Text variant="muted" style={investmentsStyles.summaryTitle}>
            INVERSIONES
          </Text>

          <View style={investmentsStyles.assetsList}>
            <AssetLabel
              name="Bitcoin"
              price="1511,51 €"
              change="58,36 €"
              trend="up"
              iconBackgroundColor="#F59E0B"
            />
            <AssetLabel
              name="XRP"
              price="116,48 €"
              change="38,53 €"
              trend="down"
              iconBackgroundColor="#111827"
            />
          </View>
        </ScrollView>
      </View>
    </AppShellComponent>
  );
}

export default InvestmentsScreen;
