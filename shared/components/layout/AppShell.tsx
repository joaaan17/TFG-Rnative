import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';

import { LevelUpModalWrapper } from '@/features/profile/front/src/components/LevelUpModalWrapper';
import { MascotDialogueWrapper } from '@/shared/components/MascotDialogueWrapper';
import { ThemedView } from '@/shared/components/themed-view';
import AppMenubarComponent from '@/shared/components/app-menubar';
import { GusCountdownChip } from '@/shared/components/GusCountdownChip';
import { appShellStyles, getAppShellMenubarStyle } from './AppShell.styles';

export type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [menubarHeight, setMenubarHeight] = React.useState(0);

  return (
    <LevelUpModalWrapper>
      <MascotDialogueWrapper>
        <ThemedView style={appShellStyles.container}>
          <View
            style={[
              appShellStyles.content,
              {
                paddingTop: insets.top,
                paddingBottom: menubarHeight,
              },
            ]}
          >
            {children}
          </View>

          <GusCountdownChip />

          <View
            style={[
              appShellStyles.menubar,
              getAppShellMenubarStyle(insets.bottom),
              { backgroundColor: 'transparent' },
            ]}
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              setMenubarHeight((prev) => (prev === h ? prev : h));
            }}
          >
            <AppMenubarComponent
              activePath={pathname}
              onPressNews={() => {
                if (pathname !== '/main') router.push('/main');
              }}
              onPressInvestments={() => {
                if (pathname !== '/investments') router.push('/investments');
              }}
              onPressDashboard={() => {
                if (pathname !== '/dashboard') router.push('/dashboard');
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
      </MascotDialogueWrapper>
    </LevelUpModalWrapper>
  );
}

export default AppShell;
