/**
 * Layout que envuelve las pantallas con barra inferior en un único AppShell.
 * Así el menú no se desmonta al cambiar de ruta y la animación del indicador funciona.
 * Stack con headerShown: false evita que se muestre "(app)" como título.
 */
import React from 'react';
import { Stack } from 'expo-router';
import AppShellComponent from '@/shared/components/layout/AppShell';

export default function AppLayout() {
  return (
    <AppShellComponent>
      <Stack
        screenOptions={{
          headerShown: false,
          title: '',
          headerTitle: '',
        }}
      />
    </AppShellComponent>
  );
}
