import React from 'react';
import { View } from 'react-native';

import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { Input } from '@/shared/components/ui/input';

import { consultorioComposerStyles } from './ConsultorioComposer.styles';

export type ConsultorioComposerProps = {
  animationKey?: number;
  value: string;
  onChangeText: (value: string) => void;
};

export function ConsultorioComposer({
  animationKey,
  value,
  onChangeText,
}: ConsultorioComposerProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const showPlaceholder = value.trim().length === 0 && !isFocused;
  const [placeholderKey, setPlaceholderKey] = React.useState(0);

  React.useEffect(() => {
    if (showPlaceholder) {
      setPlaceholderKey((k) => k + 1);
    }
  }, [showPlaceholder, animationKey]);

  return (
    <View style={consultorioComposerStyles.container}>
      <View style={consultorioComposerStyles.inputWrapper}>
        <Input
          placeholder=""
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {showPlaceholder ? (
          <View
            style={[
              consultorioComposerStyles.placeholderOverlay,
              { pointerEvents: 'none' },
            ]}
          >
            <TypewriterTextComponent
              key={`${animationKey ?? 0}-${placeholderKey}`}
              text="Escribe tu pregunta..."
              speed={25}
              variant="muted"
              useDefaultFontFamily={false}
              className="border-0 pb-0"
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default ConsultorioComposer;
