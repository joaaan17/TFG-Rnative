import React, { useState } from 'react';
import { Platform, TextInput, View } from 'react-native';

import { Hierarchy } from '@/design-system/typography';
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
  const placeholderColor = `${palette.text}80`;
  const primary = palette.primary ?? '#1D4ED8';
  const [focused, setFocused] = useState(false);
  const neutralBorder = palette.surfaceBorder ?? palette.surfaceMuted;

  return (
    <View style={consultorioComposerStyles.container}>
      <View
        style={[
          consultorioComposerStyles.inputWrapper,
          {
            backgroundColor: palette.inputBackground ?? palette.background,
            /** Solo con foco (usuario escribiendo / campo activo): azul corporativo. En reposo: borde neutro. */
            borderColor: focused ? primary : neutralBorder,
          },
        ]}
      >
        <TextInput
          placeholder="Escribe tu pregunta..."
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
          multiline
          scrollEnabled
          textAlignVertical="top"
          style={[
            Hierarchy.body,
            consultorioComposerStyles.input,
            {
              color: palette.text,
              backgroundColor: 'transparent',
              ...(Platform.OS === 'web' && {
                outlineWidth: 0,
                outlineStyle: 'none' as const,
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}
