import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { cn } from '@/lib/utils';
import { usePalette } from '@/shared/hooks/use-palette';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';

export type SegmentedTextTabsValue = 0 | 1;

export type SegmentedTextTabsVariant = 'default' | 'translucent';

export type SegmentedTextTabsProps = {
  labels: [string, string];
  value: SegmentedTextTabsValue;
  onValueChange: (value: SegmentedTextTabsValue) => void;
  className?: string;
  /** translucent = estilo píldora coherente con buscador azul semitransparente */
  variant?: SegmentedTextTabsVariant;
};

export function SegmentedTextTabs({
  labels,
  value,
  onValueChange,
  className,
  variant = 'default',
}: SegmentedTextTabsProps) {
  const palette = usePalette();
  const isTranslucent = variant === 'translucent';

  const itemBaseClass =
    'flex-row items-center justify-center bg-transparent web:hover:bg-transparent web:active:bg-transparent web:focus:bg-transparent';

  function renderItem(idx: SegmentedTextTabsValue) {
    const isActive = value === idx;
    const label = labels[idx];

    const labelColor = isTranslucent
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
            isActive && {
              backgroundColor: `${palette.primary}25`,
              borderRadius: 10,
            },
          ],
        ]}
        onPress={() => {
          onValueChange(idx);
        }}
      >
        <Text
          variant="h4"
          style={[Hierarchy.bodySmallSemibold, { color: labelColor }]}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      className={cn('flex-row items-center', className)}
      style={[styles.row, isTranslucent && styles.rowTranslucent]}
    >
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
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tabTranslucent: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    flex: 1,
  },
});

export default SegmentedTextTabs;
