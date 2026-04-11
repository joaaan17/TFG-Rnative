import React from 'react';
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  ChartNoAxesCombined,
  HelpCircle,
  LayoutDashboard,
  Newspaper,
  User,
} from 'lucide-react-native';
import { usePalette } from '@/shared/hooks/use-palette';

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
const ITEM_COUNT = 5;
/** Línea inferior minimalista (sin halo ni punto). */
const INDICATOR_LINE_WIDTH = 22;
const INDICATOR_LINE_HEIGHT = 2;
const INDICATOR_BOTTOM = 6;

export type AppMenubarProps = {
  activePath?: string;
  onPressProfile?: () => void;
  onPressDashboard?: () => void;
  onPressInvestments?: () => void;
  onPressNews?: () => void;
  onPressQuestion?: () => void;
};

export function AppMenubar({
  activePath,
  onPressProfile,
  onPressDashboard,
  onPressInvestments,
  onPressNews,
  onPressQuestion,
}: AppMenubarProps) {
  const palette = usePalette();

  // Posiciones X medidas directamente de cada ítem (evita cálculos aproximados).
  const measuredCenterX = React.useRef<(number | null)[]>(
    Array(ITEM_COUNT).fill(null),
  );
  const [indicatorReady, setIndicatorReady] = React.useState(false);
  const isInitialPosition = React.useRef(true);

  const centerXSv = useSharedValue(0);
  const indexSv = useSharedValue(0);

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
        key: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        onPress: onPressDashboard,
        Icon: LayoutDashboard,
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
      onPressDashboard,
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

  // Mueve el indicador al ítem activo usando posiciones medidas.
  const moveIndicator = React.useCallback(
    (idx: number, animated: boolean) => {
      const cx = measuredCenterX.current[idx];
      if (cx == null) return;
      if (animated) {
        cancelAnimation(centerXSv);
        cancelAnimation(indexSv);
        centerXSv.value = withTiming(cx, {
          duration: INDICATOR_DURATION_MS,
          easing: INDICATOR_EASING,
        });
        indexSv.value = withTiming(idx, {
          duration: INDICATOR_DURATION_MS,
          easing: INDICATOR_EASING,
        });
      } else {
        centerXSv.value = cx;
        indexSv.value = idx;
      }
    },
    [centerXSv, indexSv],
  );

  // Cuando cambia el índice activo, mueve el indicador.
  React.useEffect(() => {
    moveIndicator(activeIndex, !isInitialPosition.current);
  }, [activeIndex, moveIndicator]);

  // Callback para cada ítem: registra su centro X y lanza el indicador.
  const onItemLayout = React.useCallback(
    (index: number, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      measuredCenterX.current[index] = x + width / 2;

      // Cuando todos los ítems están medidos, mostrar el indicador.
      if (measuredCenterX.current.every((v) => v !== null)) {
        const cx = measuredCenterX.current[activeIndex];
        if (cx != null) {
          centerXSv.value = cx;
          indexSv.value = activeIndex;
          isInitialPosition.current = false;
          setIndicatorReady(true);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeIndex, centerXSv, indexSv],
  );

  const lineIndicatorAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      position: 'absolute' as const,
      left: centerXSv.value - INDICATOR_LINE_WIDTH / 2,
      bottom: INDICATOR_BOTTOM,
      width: INDICATOR_LINE_WIDTH,
      height: INDICATOR_LINE_HEIGHT,
      borderRadius: INDICATOR_LINE_HEIGHT / 2,
    };
  });

  const barBg =
    Platform.OS === 'web'
      ? withAlpha(palette.background, 0.92)
      : withAlpha(palette.background, 0.88);
  const primary = palette.primary ?? '#2563eb';

  /** Transición suave entre pestañas: solo opacidad (más minimalista que escala). */
  const iconWrapStyle0 = useAnimatedStyle(() => {
    const t = Math.max(0, 1 - Math.abs(indexSv.value - 0));
    return { opacity: interpolate(t, [0, 1], [0.55, 1]) };
  }, []);
  const iconWrapStyle1 = useAnimatedStyle(() => {
    const t = Math.max(0, 1 - Math.abs(indexSv.value - 1));
    return { opacity: interpolate(t, [0, 1], [0.55, 1]) };
  }, []);
  const iconWrapStyle2 = useAnimatedStyle(() => {
    const t = Math.max(0, 1 - Math.abs(indexSv.value - 2));
    return { opacity: interpolate(t, [0, 1], [0.55, 1]) };
  }, []);
  const iconWrapStyle3 = useAnimatedStyle(() => {
    const t = Math.max(0, 1 - Math.abs(indexSv.value - 3));
    return { opacity: interpolate(t, [0, 1], [0.55, 1]) };
  }, []);
  const iconWrapStyle4 = useAnimatedStyle(() => {
    const t = Math.max(0, 1 - Math.abs(indexSv.value - 4));
    return { opacity: interpolate(t, [0, 1], [0.55, 1]) };
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
    const iconColor = isActive ? primary : (palette.icon ?? palette.text);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        android_ripple={
          Platform.OS === 'android'
            ? { color: withAlpha(primary, 0.12), borderless: true }
            : undefined
        }
        style={({ pressed }) => [
          styles.item,
          Platform.OS === 'web' && pressed ? { opacity: 0.88 } : null,
          Platform.OS === 'ios' && pressed ? { opacity: 0.92 } : null,
        ]}
        onPress={() => onPress?.()}
        onLayout={(e) => onItemLayout(index, e)}
      >
        <Animated.View style={iconWrapStyles[index]}>
          <Icon size={22} color={iconColor} />
        </Animated.View>
      </Pressable>
    );
  }

  const isBlurAvailable = Platform.OS !== 'web' && BlurViewComponent !== null;

  return (
    <View style={[styles.outer, { pointerEvents: 'box-none' }]}>
      <View style={styles.root}>
        {isBlurAvailable && BlurViewComponent ? (
          <BlurViewComponent
            intensity={22}
            tint="default"
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: barBg, pointerEvents: 'none' }]}
        />

        <View style={styles.row}>
          {indicatorReady ? (
            <Animated.View
              pointerEvents="none"
              style={[
                lineIndicatorAnimatedStyle,
                { backgroundColor: primary },
              ]}
            />
          ) : null}

          {items.map((it, i) => (
            <React.Fragment key={it.key}>
              {renderItem({
                Icon: it.Icon,
                onPress: it.onPress,
                label: it.label,
                index: i,
              })}
            </React.Fragment>
          ))}
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
    overflow: 'visible',
    ...Platform.select({
      android: { elevation: 12 },
      web: { boxShadow: '0 -4px 12px rgba(11, 18, 32, 0.05)' },
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
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingBottom: 12,
    position: 'relative',
  },
  item: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
