import React from 'react';
import { View } from 'react-native';

import { Input } from '@/shared/components/ui/input';

import { consultorioComposerStyles } from './ConsultorioComposer.styles';

export type ConsultorioComposerProps = {
  animationKey?: number;
  value: string;
  onChangeText: (value: string) => void;
};

export function ConsultorioComposer({
  value,
  onChangeText,
}: ConsultorioComposerProps) {
  return (
    <View style={consultorioComposerStyles.container}>
      <View style={consultorioComposerStyles.inputWrapper}>
        <Input
          placeholder="Escribe tu pregunta..."
          value={value}
          onChangeText={onChangeText}
          className="bg-transparent"
          style={consultorioComposerStyles.inputTransparent}
        />
      </View>
    </View>
  );
}
