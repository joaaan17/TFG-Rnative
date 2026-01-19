import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';

import { ThemedView } from '@/shared/components/themed-view';
import AppMenubarComponent from '@/shared/components/app-menubar';
import { usePalette } from '@/shared/hooks/use-palette';

import { appShellStyles, getAppShellMenubarStyle } from './AppShell.styles';

export type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const palette = usePalette();
  const [menubarHeight, setMenubarHeight] = React.useState(0);

  return (
    <ThemedView style={appShellStyles.container}>
      <View style={[appShellStyles.content, { paddingBottom: menubarHeight }]}>
        {children}
      </View>

      <View
        style={[
          appShellStyles.menubar,
          getAppShellMenubarStyle(insets.bottom),
          {
            backgroundColor: palette.mainBackground ?? palette.background,
            borderTopColor: palette.text,
          },
        ]}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          setMenubarHeight((prev) => (prev === h ? prev : h));
        }}
      >
        <AppMenubarComponent
          onPressNews={() => {
            if (pathname !== '/main') router.push('/main');
          }}
          onPressInvestments={() => {
            if (pathname !== '/investments') router.push('/investments');
          }}
          onPressFriends={() => {
            if (pathname !== '/batallas') router.push('/batallas');
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
