import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  ChartNoAxesCombined,
  HelpCircle,
  Newspaper,
  Swords,
  User,
} from 'lucide-react-native';
import { usePalette } from '@/shared/hooks/use-palette';

// Blur opcional para integrar el dock con el fondo (iOS/Android).
let BlurViewComponent: React.ComponentType<any> | null = null;
try {
  if (typeof Platform !== 'undefined' && Platform.OS !== 'web') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const blurModule = require('expo-blur');
    BlurViewComponent = blurModule.BlurView;
  }
} catch {
  BlurViewComponent = null;
}

export type AppMenubarProps = {
  activePath?: string;
  onPressProfile?: () => void;
  onPressFriends?: () => void;
  onPressInvestments?: () => void;
  onPressNews?: () => void;
  onPressQuestion?: () => void;
};

export function AppMenubar({
  activePath,
  onPressProfile,
  onPressFriends,
  onPressInvestments,
  onPressNews,
  onPressQuestion,
}: AppMenubarProps) {
  const palette = usePalette();

  function withAlpha(hex: string, alpha01: number) {
    const a = Math.max(0, Math.min(1, alpha01));
    const h = hex.replace('#', '').trim();
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    if (full.length !== 6) return `rgba(0,0,0,${a})`;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  const items = React.useMemo(
    () => [
      { key: 'news', label: 'Noticias', path: '/main', onPress: onPressNews, Icon: Newspaper },
      { key: 'help', label: 'Ayuda', path: '/ia-preguntas', onPress: onPressQuestion, Icon: HelpCircle },
      { key: 'invest', label: 'Inversiones', path: '/investments', onPress: onPressInvestments, Icon: ChartNoAxesCombined },
      { key: 'friends', label: 'Batallas', path: '/batallas', onPress: onPressFriends, Icon: Swords },
      { key: 'profile', label: 'Perfil', path: '/profile', onPress: onPressProfile, Icon: User },
    ],
    [onPressFriends, onPressInvestments, onPressNews, onPressProfile, onPressQuestion],
  );

  const activeIndex = Math.max(
    0,
    items.findIndex((it) => it.path === activePath),
  );

  const indexSv = useSharedValue(activeIndex);

  React.useEffect(() => {
    indexSv.value = withTiming(activeIndex, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIndex, indexSv]);

  function renderItem({
    Icon,
    onPress,
    label,
    index,
  }: {
    Icon: React.ComponentType<{ size?: number; color?: string }>;
    onPress?: () => void;
    label: string;
    index: number;
  }) {
    const iconWrapStyle = useAnimatedStyle(() => {
      const isActive = indexSv.value;
      const dist = Math.abs(isActive - index);
      const t = Math.max(0, 1 - dist);
      const scale = interpolate(t, [0, 1], [1, 1.08]);
      return { transform: [{ scale }] };
    }, [index]);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}
        onPress={() => {
          onPress?.();
        }}
      >
        <Animated.View style={iconWrapStyle}>
          <Icon
            size={24}
            color={index === activeIndex ? palette.primary : (palette.icon ?? palette.text)}
          />
        </Animated.View>
      </Pressable>
    );
  }

  const isBlurAvailable = Platform.OS !== 'web' && BlurViewComponent !== null;

  return (
    <View style={styles.outer} pointerEvents="box-none">
      <View
        style={[
          styles.root,
          {
            borderTopColor: palette.surfaceBorder ?? palette.text,
          },
        ]}
      >
        {isBlurAvailable && BlurViewComponent ? (
          <BlurViewComponent
            intensity={22}
            tint={Platform.select({ ios: 'default', android: 'default', default: 'default' })}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {/* Scrim integrado (sin “cápsula”): solo material + borde superior */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                Platform.OS === 'web'
                  ? withAlpha(palette.background, 0.86)
                  : withAlpha(palette.background, 0.78),
            },
          ]}
        />

        <View style={styles.row}>
          {items.map((it, i) =>
            renderItem({
              Icon: it.Icon,
              onPress: it.onPress,
              label: it.label,
              index: i,
            }),
          )}
        </View>
      </View>
    </View>
  );
}

export default AppMenubar;

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignItems: 'stretch',
  },
  root: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...Platform.select({
      android: { elevation: 18 },
      default: {
        shadowColor: '#0B1220',
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -6 },
      },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingTop: 10,
    paddingBottom: 12,
  },
  item: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
