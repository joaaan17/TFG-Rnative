/**
 * Tokens de color para la aplicación
 * Define los colores para modo claro y oscuro
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Colores adicionales para la app
    primary: '#000000', // Negro para botones primarios
    primaryText: '#FFFFFF', // Blanco para texto en botones primarios
    destructive: '#EF4444',
    destructiveText: '#FFFFFF',
    inputBackground: '#F5F5F5', // Gris claro para inputs
    link: '#687076', // Color para links
    cardBackground: '#FFFFFF', // Fondo de cards
    headerBackground: '#1A5D3E', // Verde oscuro para header
    mainBackground: '#000000',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Colores adicionales para modo oscuro
    primary: '#FFFFFF',
    primaryText: '#000000',
    destructive: '#F87171',
    destructiveText: '#000000',
    inputBackground: '#2A2A2A',
    link: '#9BA1A6',
    cardBackground: '#1E1E1E',
    headerBackground: '#1A5D3E',
    mainBackground: '#000000',
  },
};

export default Colors;
