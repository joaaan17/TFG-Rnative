/**
 * Layout que envuelve las pantallas con barra inferior en un único AppShell.
 * Así el menú no se desmonta al cambiar de ruta y la animación del indicador funciona.
 * Stack con headerShown: false evita que se muestre "(app)" como título.
 *
 * Guard de autenticación: si no hay sesión activa, redirige a login.
 */
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AppShellComponent from '@/shared/components/layout/AppShell';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';

export default function AppLayout() {
  const { session, isRestoring } = useAuthSession();
  const router = useRouter();

  React.useEffect(() => {
    if (isRestoring) return;
    if (!session) {
      router.replace('/');
    }
  }, [isRestoring, session, router]);

  if (isRestoring) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) return null;

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
