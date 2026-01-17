import { Colors } from '@/design-system/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

// Devuelve la paleta actual del design system segÃºn el modo de color
export function usePalette() {
  const scheme = useColorScheme() ?? 'light';
  return Colors[scheme];
}

export default usePalette;
