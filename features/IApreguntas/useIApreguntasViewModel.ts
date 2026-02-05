import React from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { IA_PREGUNTAS_WELCOME_MESSAGES } from './iaPreguntas.messages';

export type UseIApreguntasViewModelResult = {
  typewriterKey: number;
  questionText: string;
  setQuestionText: (value: string) => void;
  welcomeText: string;
};

export function useIApreguntasViewModel(): UseIApreguntasViewModelResult {
  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [questionText, setQuestionText] = React.useState('');
  const [welcomeText, setWelcomeText] = React.useState<string>(
    IA_PREGUNTAS_WELCOME_MESSAGES[0],
  );

  // Re-dispara la animación cada vez que entras a esta pantalla (desde donde sea)
  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      const index = Math.floor(
        Math.random() * IA_PREGUNTAS_WELCOME_MESSAGES.length,
      );
      setWelcomeText(IA_PREGUNTAS_WELCOME_MESSAGES[index]);
      return undefined;
    }, []),
  );

  return { typewriterKey, questionText, setQuestionText, welcomeText };
}

export default useIApreguntasViewModel;
