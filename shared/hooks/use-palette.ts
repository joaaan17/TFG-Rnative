import * as React from 'react';

import { Colors } from '@/design-system/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

export type Palette = (typeof Colors)['light'];

const PaletteOverrideContext = React.createContext<Partial<Palette> | null>(
  null,
);

export function PaletteProvider({
  value,
  children,
}: {
  value: Partial<Palette> | null;
  children: React.ReactNode;
}) {
  // Nota: este archivo es `.ts` (sin JSX). Usamos createElement.
  return React.createElement(PaletteOverrideContext.Provider, { value }, children);
}

// Devuelve la paleta actual del design system según el modo de color.
// Permite override por subtree (útil para pantallas con estética propia).
export function usePalette(): Palette {
  const scheme = useColorScheme() ?? 'light';
  const override = React.useContext(PaletteOverrideContext);
  const base = Colors[scheme];
  return override ? ({ ...base, ...override } as Palette) : base;
}

export default usePalette;
