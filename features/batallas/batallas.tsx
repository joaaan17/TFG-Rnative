import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View } from 'react-native';

import AppShellComponent from '@/shared/components/layout/AppShell';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';

import { batallasStyles } from './batallasStyles';

export function BatallasScreen() {
  const [typewriterKey, setTypewriterKey] = React.useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      return undefined;
    }, []),
  );

  return (
    <AppShellComponent>
      <View style={batallasStyles.container}>
        <View style={batallasStyles.header}>
          <TypewriterTextComponent
            key={typewriterKey}
            text="BATALLAS"
            speed={40}
            variant="h3"
            useDefaultFontFamily={true}
            className="border-0 pb-0"
          />
        </View>
      </View>
    </AppShellComponent>
  );
}

export default BatallasScreen;
