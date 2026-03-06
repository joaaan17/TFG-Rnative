import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/utils';
import { usePalette } from '@/shared/hooks/use-palette';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type SegmentedTextTabsValue = 0 | 1;

export type SegmentedTextTabsVariant = 'default' | 'translucent' | 'minimal';

export type SegmentedTextTabsProps = {
  labels: [string, string];
  value: SegmentedTextTabsValue;
  onValueChange: (value: SegmentedTextTabsValue) => void;
  className?: string;
  /** translucent = estilo píldora; minimal = solo texto/píldora sin contenedor, para cabecera */
  variant?: SegmentedTextTabsVariant;
  /** Si true, píldora deslizante animada al cambiar de tab (estilo Sector/Geográfica/Acciones) */
  animatedPill?: boolean;
};

export function SegmentedTextTabs({
  labels,
  value,
  onValueChange,
  className,
  variant = 'default',
  animatedPill = false,
}: SegmentedTextTabsProps) {
  const palette = usePalette();
  const isTranslucent = variant === 'translucent';
  const isMinimal = variant === 'minimal';
  const usePill = animatedPill && (isMinimal || isTranslucent);

  /** Pill deslizante: mismo patrón que Sector/Geográfica/Acciones del Dashboard. */
  const pillLeft = useSharedValue(0);
  const pillWidth = useSharedValue(80);
  const [tabLayouts, setTabLayouts] = useState<
    Record<string, { x: number; width: number }>
  >({});
  const pillAnimatedOnce = useRef(false);

  const measureTab = useCallback(
    (key: string) =>
      (event: { nativeEvent: { layout: { x: number; width: number } } }) => {
        const { x, width } = event.nativeEvent.layout;
        setTabLayouts((prev) => ({ ...prev, [key]: { x, width } }));
      },
    [],
  );

  useEffect(() => {
    if (!usePill) return;
    const layout = tabLayouts[String(value)];
    if (!layout) return;
    if (!pillAnimatedOnce.current) {
      pillLeft.value = layout.x;
      pillWidth.value = layout.width;
      pillAnimatedOnce.current = true;
    } else {
      pillLeft.value = withTiming(layout.x, { duration: 280 });
      pillWidth.value = withTiming(layout.width, { duration: 280 });
    }
  }, [usePill, value, tabLayouts, pillLeft, pillWidth]);

  const pillAnimatedStyle = useAnimatedStyle(
    () => ({
      left: pillLeft.value,
      width: pillWidth.value,
    }),
    [],
  );

  const pillBg = palette.chartAreaBackground ?? palette.background ?? '#FFFFFF';

  const itemBaseClass =
    'flex-row items-center justify-center bg-transparent web:hover:bg-transparent web:active:bg-transparent web:focus:bg-transparent';

  function renderItem(idx: SegmentedTextTabsValue) {
    const isActive = value === idx;
    const label = labels[idx];

    const labelColor = isMinimal
      ? palette.primary
      : isTranslucent
        ? isActive
          ? palette.primary
          : palette.icon
        : isActive
          ? palette.text
          : palette.icon;

    return (
      <Pressable
        key={idx}
        accessibilityRole="button"
        accessibilityLabel={label}
        className={cn(itemBaseClass)}
        style={[
          styles.tab,
          isTranslucent && [
            styles.tabTranslucent,
            !usePill &&
              isActive && {
                backgroundColor: `${palette.primary}25`,
                borderRadius: 10,
              },
          ],
          isMinimal && [
            styles.tabMinimal,
            !usePill &&
              isActive && {
                backgroundColor:
                  palette.chartAreaBackground ?? `${palette.primary}08`,
                borderRadius: 12,
              },
            usePill &&
              isActive && {
                backgroundColor: 'transparent',
              },
          ],
        ]}
        onLayout={usePill ? measureTab(String(idx)) : undefined}
        onPress={() => {
          if (value !== idx) {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            onValueChange(idx);
          }
        }}
      >
        <Text
          variant="h4"
          style={[
            Hierarchy.bodySmallSemibold,
            { color: labelColor },
            isMinimal && {
              fontSize: isActive ? 17 : 15,
              letterSpacing: -0.2,
              fontWeight: isActive ? '600' : '500',
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      className={cn('flex-row items-center', className)}
      style={[
        styles.row,
        isTranslucent && styles.rowTranslucent,
        isMinimal && styles.rowMinimal,
        usePill && styles.rowWithPill,
      ]}
    >
      {usePill && (
        <Animated.View
          style={[styles.pill, { backgroundColor: pillBg }, pillAnimatedStyle]}
          pointerEvents="none"
        />
      )}
      {renderItem(0)}
      {renderItem(1)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowTranslucent: {
    width: '100%',
  },
  rowMinimal: {
    width: '100%',
    gap: 8,
  },
  rowWithPill: {
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 12,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tabTranslucent: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    flex: 1,
  },
  tabMinimal: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    flex: 1,
  },
});

export default SegmentedTextTabs;
