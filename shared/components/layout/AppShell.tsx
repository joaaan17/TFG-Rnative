import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';

import { ThemedView } from '@/shared/components/themed-view';
import AppMenubarComponent from '@/shared/components/app-menubar';

import { appShellStyles, getAppShellMenubarStyle } from './AppShell.styles';

export type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <ThemedView style={appShellStyles.container}>
      <View style={appShellStyles.content}>{children}</View>

      <View
        style={[appShellStyles.menubar, getAppShellMenubarStyle(insets.bottom)]}
      >
        <AppMenubarComponent
          onPressNews={() => {
            if (pathname !== '/main') router.push('/main');
          }}
          onPressQuestion={() => {
            if (pathname !== '/ia-preguntas') router.push('/ia-preguntas');
          }}
          onPressProfile={() => {
            if (pathname !== '/profile') router.push('/profile');
          }}
        />
      </View>
    </ThemedView>
  );
}

export default AppShell;
