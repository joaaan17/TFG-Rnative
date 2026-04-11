import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import type { Palette } from '@/shared/hooks/use-palette';

export type PillOption<T extends string> = {
  value: T;
  label: string;
};

export type AnimatedPillSelectorProps<T extends string> = {
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  palette: Palette;
  onLongPress?: (label: string) => void;
};

const TIMING_CONFIG = { duration: 260, easing: Easing.out(Easing.cubic) };

export function AnimatedPillSelector<T extends string>({
  options,
  value,
  onChange,
  palette,
  onLongPress,
}: AnimatedPillSelectorProps<T>) {
  const pillLeft = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const initialSet = useRef(false);

  const measureItem = useCallback(
    (key: string) =>
      (e: { nativeEvent: { layout: { x: number; width: number } } }) => {
        const { x, width } = e.nativeEvent.layout;
        setLayouts((prev) => ({ ...prev, [key]: { x, width } }));
      },
    [],
  );

  useEffect(() => {
    const layout = layouts[value];
    if (!layout) return;
    if (!initialSet.current) {
      pillLeft.value = layout.x;
      pillWidth.value = layout.width;
      initialSet.current = true;
    } else {
      pillLeft.value = withTiming(layout.x, TIMING_CONFIG);
      pillWidth.value = withTiming(layout.width, TIMING_CONFIG);
    }
  }, [value, layouts, pillLeft, pillWidth]);

  const pillStyle = useAnimatedStyle(() => ({
    left: pillLeft.value,
    width: pillWidth.value,
  }));

  const allMeasured = options.every((o) => layouts[o.value]);

  return (
    <View style={styles.row}>
      {allMeasured && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            { backgroundColor: palette.primary },
            pillStyle,
          ]}
        />
      )}
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            onLongPress={onLongPress ? () => onLongPress(opt.label) : undefined}
            delayLongPress={onLongPress ? 400 : undefined}
            onLayout={measureItem(opt.value)}
            style={styles.item}
          >
            <Text
              style={[
                Hierarchy.action,
                {
                  color: active
                    ? (palette.primaryText ?? '#FFF')
                    : palette.text,
                },
              ]}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  item: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedPillSelector;
