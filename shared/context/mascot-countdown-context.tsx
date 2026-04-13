import { createContext, useContext } from 'react';

export type MascotCountdownPhase =
  | 'loading'
  | 'entry'
  | 'm5'
  | 'm15'
  | 'complete';

export type MascotCountdownValue = {
  /** Tiempo hasta el siguiente mensaje de Gus; null si no aplica */
  remainingMs: number | null;
  phase: MascotCountdownPhase;
  isModalOpen: boolean;
};

const defaultValue: MascotCountdownValue = {
  remainingMs: null,
  phase: 'loading',
  isModalOpen: false,
};

const MascotCountdownContext =
  createContext<MascotCountdownValue>(defaultValue);

export const MascotCountdownProvider = MascotCountdownContext.Provider;

export function useMascotCountdown(): MascotCountdownValue {
  return useContext(MascotCountdownContext);
}
