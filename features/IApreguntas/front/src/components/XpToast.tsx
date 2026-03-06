import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';
import ExpIcon from '@/shared/icons/exp.svg';

export type XpToastProps = {
  /** XP otorgado. Si es null o 0, no se renderiza. */
  amount: number | null;
};

/**
 * Toast compacto que muestra "+X XP" con icono.
 * Aparece con animación suave y se mantiene visible hasta que amount pase a null.
 */
export function XpToast({ amount }: XpToastProps) {
  const palette = usePalette();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    if (amount == null || amount <= 0) return;
    opacity.setValue(0);
    translateY.setValue(-8);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
    ]).start();
  }, [amount, opacity, translateY]);

  if (amount == null || amount <= 0) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: `${palette.primary}E8`,
          borderColor: palette.primary,
        },
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      accessibilityLabel={`Has ganado ${amount} puntos de experiencia`}
      accessibilityRole="status"
    >
      <ExpIcon width={16} height={16} fill={palette.primary} />
      <Text
        style={[
          Hierarchy.bodySmallSemibold,
          styles.text,
          { color: palette.primary },
        ]}
      >
        +{amount} XP
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    letterSpacing: 0.2,
  },
});
