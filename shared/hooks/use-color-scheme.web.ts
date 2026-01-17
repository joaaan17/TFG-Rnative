import { ColorSchemeName } from 'react-native';

// VersiÃ³n web alineada: siempre usamos modo claro para fondo blanco
export function useColorScheme(): NonNullable<ColorSchemeName> {
  return 'light';
}

export default useColorScheme;
