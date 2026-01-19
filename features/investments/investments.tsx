import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, View } from 'react-native';

import AppShellComponent from '@/shared/components/layout/AppShell';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import {
  SegmentedTextTabs,
  type SegmentedTextTabsValue,
} from '@/shared/components/ui/segmented-text-tabs';
import { PriceChart } from '@/shared/components/price-chart';
import { Text } from '@/shared/components/ui/text';
import { AssetLabel } from '@/shared/components/asset-label';

import { investmentsStyles } from './investmentsStyles';

export function InvestmentsScreen() {
  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [tab, setTab] = React.useState<SegmentedTextTabsValue>(0);

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      return undefined;
    }, []),
  );

  return (
    <AppShellComponent>
      <View style={investmentsStyles.container}>
        {/* Header fijo (no scrollea) */}
        <View style={investmentsStyles.header}>
          <TypewriterTextComponent
            key={typewriterKey}
            text="INVERSIONES"
            speed={40}
            variant="h3"
            useDefaultFontFamily={true}
            className="border-0 pb-0"
          />
        </View>

        {/* Contenido scrolleable */}
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

          <View style={investmentsStyles.chart}>
            <PriceChart />
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
