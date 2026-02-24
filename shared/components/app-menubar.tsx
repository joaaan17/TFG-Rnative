import React from 'react';
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
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

const INDICATOR_DURATION_MS = 280;
const INDICATOR_EASING = Easing.out(Easing.cubic);
const ROW_PADDING_H = 8;

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
  const [rowWidth, setRowWidth] = React.useState(0);
  const [indicatorReady, setIndicatorReady] = React.useState(false);
  const isInitialPosition = React.useRef(true);
  const centerXSv = useSharedValue(0);
  const ITEM_COUNT = 5;
  const HALO_SIZE = 20;

  function withAlpha(hex: string, alpha01: number) {
    const a = Math.max(0, Math.min(1, alpha01));
    const h = hex.replace('#', '').trim();
    const full =
      h.length === 3
        ? h
            .split('')
            .map((c) => c + c)
            .join('')
        : h;
    if (full.length !== 6) return `rgba(0,0,0,${a})`;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  const items = React.useMemo(
    () => [
      {
        key: 'news',
        label: 'Noticias',
        path: '/main',
        onPress: onPressNews,
        Icon: Newspaper,
      },
      {
        key: 'help',
        label: 'Ayuda',
        path: '/ia-preguntas',
        onPress: onPressQuestion,
        Icon: HelpCircle,
      },
      {
        key: 'invest',
        label: 'Inversiones',
        path: '/investments',
        onPress: onPressInvestments,
        Icon: ChartNoAxesCombined,
      },
      {
        key: 'friends',
        label: 'Batallas',
        path: '/batallas',
        onPress: onPressFriends,
        Icon: Swords,
      },
      {
        key: 'profile',
        label: 'Perfil',
        path: '/profile',
        onPress: onPressProfile,
        Icon: User,
      },
    ],
    [
      onPressFriends,
      onPressInvestments,
      onPressNews,
      onPressProfile,
      onPressQuestion,
    ],
  );

  const activeIndex = Math.max(
    0,
    items.findIndex((it) => it.path === activePath),
  );

  const indexSv = useSharedValue(activeIndex);

  React.useEffect(() => {
    if (rowWidth <= 0) return;
    const contentWidth = rowWidth - 2 * ROW_PADDING_H;
    const slotWidth = contentWidth / ITEM_COUNT;
    const targetCenterX = ROW_PADDING_H + (activeIndex + 0.5) * slotWidth;
    if (isInitialPosition.current) {
      centerXSv.value = targetCenterX;
      indexSv.value = activeIndex;
      isInitialPosition.current = false;
      setIndicatorReady(true);
    } else {
      centerXSv.value = withTiming(targetCenterX, {
        duration: INDICATOR_DURATION_MS,
        easing: INDICATOR_EASING,
      });
      indexSv.value = withTiming(activeIndex, {
        duration: INDICATOR_DURATION_MS,
        easing: INDICATOR_EASING,
      });
    }
  }, [activeIndex, rowWidth, centerXSv, indexSv]);

  const onRowLayout = React.useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setRowWidth((prev) => (prev === w ? prev : w));
  }, []);

  const dotWrapAnimatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: centerXSv.value - HALO_SIZE / 2,
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: HALO_SIZE / 2,
    top: -10,
  }));

  const barBg =
    Platform.OS === 'web'
      ? withAlpha(palette.background, 0.92)
      : withAlpha(palette.background, 0.88);
  const haloBorderColor = palette.surfaceBorder ?? palette.icon ?? palette.text;

  const iconWrapStyle0 = useAnimatedStyle(() => {
    const current = indexSv.value;
    const t = Math.max(0, 1 - Math.abs(current - 0));
    return {
      transform: [{ scale: interpolate(t, [0, 1], [1, 1.06]) }],
      opacity: interpolate(t, [0, 1], [0.78, 1]),
    };
  }, []);
  const iconWrapStyle1 = useAnimatedStyle(() => {
    const current = indexSv.value;
    const t = Math.max(0, 1 - Math.abs(current - 1));
    return {
      transform: [{ scale: interpolate(t, [0, 1], [1, 1.06]) }],
      opacity: interpolate(t, [0, 1], [0.78, 1]),
    };
  }, []);
  const iconWrapStyle2 = useAnimatedStyle(() => {
    const current = indexSv.value;
    const t = Math.max(0, 1 - Math.abs(current - 2));
    return {
      transform: [{ scale: interpolate(t, [0, 1], [1, 1.06]) }],
      opacity: interpolate(t, [0, 1], [0.78, 1]),
    };
  }, []);
  const iconWrapStyle3 = useAnimatedStyle(() => {
    const current = indexSv.value;
    const t = Math.max(0, 1 - Math.abs(current - 3));
    return {
      transform: [{ scale: interpolate(t, [0, 1], [1, 1.06]) }],
      opacity: interpolate(t, [0, 1], [0.78, 1]),
    };
  }, []);
  const iconWrapStyle4 = useAnimatedStyle(() => {
    const current = indexSv.value;
    const t = Math.max(0, 1 - Math.abs(current - 4));
    return {
      transform: [{ scale: interpolate(t, [0, 1], [1, 1.06]) }],
      opacity: interpolate(t, [0, 1], [0.78, 1]),
    };
  }, []);
  const iconWrapStyles = [
    iconWrapStyle0,
    iconWrapStyle1,
    iconWrapStyle2,
    iconWrapStyle3,
    iconWrapStyle4,
  ];

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
    const isActive = index === activeIndex;
    const iconColor = isActive
      ? (palette.primary ?? '#2563eb')
      : (palette.icon ?? palette.text);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
        onPress={() => onPress?.()}
      >
        <Animated.View style={iconWrapStyles[index]}>
          <Icon size={22} color={iconColor} />
        </Animated.View>
      </Pressable>
    );
  }

  const isBlurAvailable = Platform.OS !== 'web' && BlurViewComponent !== null;

  return (
    <View style={styles.outer} pointerEvents="box-none">
      <View style={styles.root}>
        {isBlurAvailable && BlurViewComponent ? (
          <BlurViewComponent
            intensity={22}
            tint={Platform.select({
              ios: 'default',
              android: 'default',
              default: 'default',
            })}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {/* Scrim integrado (sin “cápsula”): solo material + borde superior */}
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: barBg }]}
        />

        <View style={styles.row} onLayout={onRowLayout}>
          {rowWidth > 0 && indicatorReady ? (
            <Animated.View
              style={[styles.dotWrap, dotWrapAnimatedStyle]}
              pointerEvents="none"
            >
              <View
                style={[
                  styles.dotHalo,
                  {
                    backgroundColor: withAlpha(haloBorderColor, 0.5),
                    borderWidth: 1,
                    borderColor: withAlpha(haloBorderColor, 0.5),
                  },
                ]}
              />
              <View
                style={[
                  styles.dot,
                  { backgroundColor: palette.primary ?? '#2563eb' },
                ]}
              />
            </Animated.View>
          ) : null}
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
    overflow: 'hidden',
    ...Platform.select({
      android: { elevation: 12 },
      default: {
        shadowColor: '#0B1220',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
      },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 9,
    position: 'relative',
  },
  dotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotHalo: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  item: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
});
