import React from 'react';
import { useFocusEffect } from '@react-navigation/native';

export type UseBatallasViewModelResult = {
  typewriterKey: number;
  isStartBattleOpen: boolean;
  setStartBattleOpen: (open: boolean) => void;
};

export function useBatallasViewModel(): UseBatallasViewModelResult {
  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [isStartBattleOpen, setIsStartBattleOpen] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      return undefined;
    }, []),
  );

  return {
    typewriterKey,
    isStartBattleOpen,
    setStartBattleOpen: setIsStartBattleOpen,
  };
}
