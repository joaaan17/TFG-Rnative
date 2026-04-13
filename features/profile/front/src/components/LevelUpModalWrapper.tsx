import React, { useEffect, useState } from 'react';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import { onLevelUp } from '../events/profile-events';
import { LevelUpModal } from './LevelUpModal';

/**
 * Envuelve la app y muestra el modal de subida de nivel cuando corresponda.
 * Debe montarse una sola vez (p. ej. en AppShell).
 */
export function LevelUpModalWrapper({ children }: { children: React.ReactNode }) {
  const { session } = useAuthSession();
  const [state, setState] = useState<{
    visible: boolean;
    newLevel: number;
    newTotalXp: number;
  }>({ visible: false, newLevel: 1, newTotalXp: 0 });

  useEffect(() => {
    const unsubscribe = onLevelUp((newLevel, newTotalXp) => {
      setState({ visible: true, newLevel, newTotalXp });
    });
    return unsubscribe;
  }, []);

  const handleClose = () => {
    setState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <>
      {children}
      <LevelUpModal
        visible={state.visible}
        onClose={handleClose}
        newLevel={state.newLevel}
        newTotalXp={state.newTotalXp}
        userName={session?.user?.name}
      />
    </>
  );
}
