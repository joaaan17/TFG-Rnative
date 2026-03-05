/**
 * Tema centralizado
 * Combina todos los tokens del design system
 */

import { Colors } from './colors';
import { Spacing } from './spacing';
import { Typography, Fonts, TextStyles } from './typography';

export const theme = {
  colors: Colors,
  spacing: Spacing,
  typography: Typography,
  fonts: Fonts,
  textStyles: TextStyles,
} as const;

// Re-export para compatibilidad
export { Colors, Spacing, Typography, Fonts, TextStyles };
