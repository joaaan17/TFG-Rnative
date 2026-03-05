/**
 * Tokens de color para la aplicación
 * Define los colores para modo claro y oscuro
 */

const tintColorLight = '#1D4ED8';
const tintColorDark = '#60A5FA';

export const Colors = {
  light: {
    text: '#0B1220',
    background: '#F7F9FC',
    tint: tintColorLight,
    icon: '#5B6B82',
    tabIconDefault: '#5B6B82',
    tabIconSelected: tintColorLight,
    // Colores adicionales para la app
    primary: '#1D4ED8', // Azul principal
    primaryText: '#FFFFFF',
    positive: '#16A34A', // Verde éxito/acierto
    destructive: '#E5484D',
    destructiveText: '#FFFFFF',
    inputBackground: '#FFFFFF',
    surfaceMuted: '#EEF2F7',
    surfaceBorder: '#D6DEE8',
    link: '#1D4ED8',
    cardBackground: '#FFFFFF',
    /** Fondo del área del minigráfico en cards (y pestaña seleccionada Cartera/Efectivo) */
    chartAreaBackground: '#F2F4F7',
    headerBackground: '#0B1220',
    mainBackground: '#F7F9FC',
  },
  dark: {
    text: '#E6EDF6',
    background: '#070B14',
    tint: tintColorDark,
    icon: '#9AA9BF',
    tabIconDefault: '#9AA9BF',
    tabIconSelected: '#E6EDF6',
    // Colores adicionales para modo oscuro
    primary: '#60A5FA',
    primaryText: '#081226',
    positive: '#4ADE80',
    destructive: '#FB7185',
    destructiveText: '#0B1220',
    inputBackground: '#0B1220',
    surfaceMuted: '#0F1930',
    surfaceBorder: '#1B2A45',
    link: '#60A5FA',
    cardBackground: '#0B1220',
    chartAreaBackground: '#1B2A45',
    headerBackground: '#070B14',
    mainBackground: '#070B14',
  },
};

export default Colors;
