import React from 'react';
import { View } from 'react-native';

import { Input } from '@/shared/components/ui/input';
import { usePalette } from '@/shared/hooks/use-palette';

import { consultorioComposerStyles } from './ConsultorioComposer.styles';

export type ConsultorioComposerProps = {
  animationKey?: number;
  value: string;
  onChangeText: (value: string) => void;
  /** false = límite diario alcanzado */
  editable?: boolean;
};

export function ConsultorioComposer({
  value,
  onChangeText,
  editable = true,
}: ConsultorioComposerProps) {
  const palette = usePalette();
  return (
    <View style={consultorioComposerStyles.container}>
      <View
        style={[
          consultorioComposerStyles.inputWrapper,
          {
            backgroundColor: palette.inputBackground ?? palette.background,
            borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
          },
        ]}
      >
        <Input
          placeholder="Escribe tu pregunta..."
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          style={[
            consultorioComposerStyles.input,
            {
              backgroundColor: 'transparent',
              borderWidth: 0,
              shadowColor: 'transparent',
              shadowOpacity: 0,
              elevation: 0,
            },
          ]}
        />
      </View>
    </View>
  );
}
