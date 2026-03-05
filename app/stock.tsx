/**
 * Pantalla de detalle de una acción: ver gráfico y comprar.
 * Ruta: /stock?symbol=BTC (ej. desde Inversiones)
 */
import React from 'react';
import { View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import AppShellComponent from '@/shared/components/layout/AppShell';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';

export default function StockScreen() {
  const { symbol = '' } = useLocalSearchParams<{ symbol?: string }>();
  const router = useRouter();
  const palette = usePalette();
  const name = symbol || 'Activo';

  return (
    <AppShellComponent>
      <View
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}
        accessibilityElementsHidden={false}
        importantForAccessibility="yes"
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <ChevronLeft size={24} color={palette.text} />
          <Text variant="small" style={{ marginLeft: 4, color: palette.text }}>
            Volver
          </Text>
        </Pressable>
        <Text variant="h3" style={{ marginBottom: 8 }}>
          {name}
        </Text>
        <Text variant="muted">
          Próximamente: gráfico y opción de compra para esta acción.
        </Text>
      </View>
    </AppShellComponent>
  );
}
