import React from 'react';
import { View } from 'react-native';

import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import AppShellComponent from '@/shared/components/layout/AppShell';
import { Text } from '@/shared/components/ui/text';

import { iaPreguntasStyles } from './IApreguntas.styles';
import { useIApreguntasViewModel } from './useIApreguntasViewModel';
import ConsultorioComposerComponent from './components/ConsultorioComposer';

export function IApreguntasScreen() {
  const { typewriterKey, questionText, setQuestionText, welcomeText } =
    useIApreguntasViewModel();

  return (
    <AppShellComponent>
      <View style={iaPreguntasStyles.container}>
        <View style={iaPreguntasStyles.header}>
          <TypewriterTextComponent
            key={typewriterKey}
            text="CONSULTORIO"
            speed={40}
            variant="h3"
            className="border-0 pb-0"
          />
        </View>

        <View style={iaPreguntasStyles.middle}>
          <Text variant="h4" style={iaPreguntasStyles.helloText}>
            Hola Joan
          </Text>
          <TypewriterTextComponent
            key={`welcome-${typewriterKey}`}
            text={welcomeText}
            speed={30}
            useDefaultFontFamily={false}
            className="border-0 pb-0 text-center"
            style={iaPreguntasStyles.welcomeText}
          />
        </View>

        <ConsultorioComposerComponent
          animationKey={typewriterKey}
          value={questionText}
          onChangeText={setQuestionText}
        />
      </View>
    </AppShellComponent>
  );
}

export default IApreguntasScreen;
