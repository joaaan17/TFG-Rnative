import React from 'react';
import { useFocusEffect } from '@react-navigation/native';

export type UseDashboardViewModelResult = {
  typewriterKey: number;
  activeChart: 'sector' | 'geo';
  setActiveChart: (chart: 'sector' | 'geo') => void;
};

export function useDashboardViewModel(): UseDashboardViewModelResult {
  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [activeChart, setActiveChart] = React.useState<'sector' | 'geo'>('sector');

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      return undefined;
    }, []),
  );

  return {
    typewriterKey,
    activeChart,
    setActiveChart,
  };
}
