import { ColorSchemeName } from 'react-native';

// Forzamos el modo claro para mantener el fondo blanco en toda la app
export function useColorScheme(): NonNullable<ColorSchemeName> {
  return 'light';
}

export default useColorScheme;
