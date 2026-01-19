import React from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/utils';
import { usePalette } from '@/shared/hooks/use-palette';
import { Text } from '@/shared/components/ui/text';

export type SegmentedTextTabsValue = 0 | 1;

export type SegmentedTextTabsProps = {
  /**
   * Textos de cada opción (2).
   */
  labels: [string, string];
  /**
   * Opción activa (controlado desde fuera).
   */
  value: SegmentedTextTabsValue;
  onValueChange: (value: SegmentedTextTabsValue) => void;
  className?: string;
};

export function SegmentedTextTabs({
  labels,
  value,
  onValueChange,
  className,
}: SegmentedTextTabsProps) {
  const palette = usePalette();

  const itemBaseClass =
    'flex-row items-center justify-center px-1 py-1 bg-transparent web:hover:bg-transparent web:active:bg-transparent web:focus:bg-transparent';

  function renderItem(idx: SegmentedTextTabsValue) {
    const isActive = value === idx;
    const label = labels[idx];

    return (
      <Pressable
        key={idx}
        accessibilityRole="button"
        accessibilityLabel={label}
        className={cn(itemBaseClass)}
        onPress={() => {
          onValueChange(idx);
        }}
      >
        <Text
          variant="h4"
          style={{ color: isActive ? palette.text : palette.icon }}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      {renderItem(0)}
      {renderItem(1)}
    </View>
  );
}

export default SegmentedTextTabs;
