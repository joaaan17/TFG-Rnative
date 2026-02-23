/**
 * Tokens de tipografía
 * Fuentes y estilos de texto para la aplicación
 */

import { Platform } from 'react-native';

/**
 * Familias reales cargadas por `useFonts` en `app/_layout.tsx`.
 * En React Native, `fontFamily` debe apuntar al nombre exacto del recurso cargado.
 */
export const FontFamilies = {
  /** Plus Jakarta Sans — títulos / cabeceras */
  primary: {
    semibold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
  },
  /** DM Sans — cuerpo / UI general */
  body: {
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
  },
  /** Manrope — labels, captions, microtexto */
  secondary: {
    medium: 'Manrope_500Medium',
    semibold: 'Manrope_600SemiBold',
  },
  mono: Platform.select({
    ios: 'ui-monospace',
    default: 'monospace',
    web: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  }),
} as const;

export const Fonts = Platform.select({
  // Compat: antes `Fonts` apuntaba a system fonts.
  // Ahora lo alineamos a las familias reales del proyecto.
  ios: {
    sans: FontFamilies.body.regular,
    serif: FontFamilies.body.regular,
    rounded: FontFamilies.body.regular,
    mono: FontFamilies.mono,
  },
  default: {
    sans: FontFamilies.body.regular,
    serif: FontFamilies.body.regular,
    rounded: FontFamilies.body.regular,
    mono: FontFamilies.mono,
  },
  web: {
    sans: 'var(--font-family-body)',
    serif: 'var(--font-family-body)',
    rounded: 'var(--font-family-body)',
    mono: FontFamilies.mono,
  },
});

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    display: 34,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/**
 * Jerarquía tipográfica (tokens listos para usar en `style={[Hierarchy.xxx, ...]}`).
 */
export const Hierarchy = {
  /** Título principal (pantallas, hero) */
  titleLarge: {
    fontFamily: FontFamilies.primary.bold,
    fontSize: Typography.sizes.display,
    lineHeight: Math.round(Typography.sizes.display * 1.1),
    letterSpacing: -0.4,
  },
  /** Título hero dentro de modal grande */
  titleModalLarge: {
    fontFamily: FontFamilies.primary.bold,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  /** Título de modal estándar */
  titleModal: {
    fontFamily: FontFamilies.primary.semibold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  /** Título de sección (mayúsculas / tracking) */
  titleSection: {
    fontFamily: FontFamilies.secondary.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  /** Valores destacados */
  value: {
    fontFamily: FontFamilies.primary.bold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  valueSecondary: {
    fontFamily: FontFamilies.primary.semibold,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  /** Cuerpo base */
  body: {
    fontFamily: FontFamilies.body.regular,
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  /** Cuerpo pequeño */
  bodySmall: {
    fontFamily: FontFamilies.body.regular,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  /** Cuerpo pequeño en semibold (cards/listas) */
  bodySmallSemibold: {
    fontFamily: FontFamilies.body.medium,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  /** Labels */
  label: {
    fontFamily: FontFamilies.secondary.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  /** Captions */
  caption: {
    fontFamily: FontFamilies.secondary.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  captionSmall: {
    fontFamily: FontFamilies.secondary.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  /** Botones/acciones */
  action: {
    fontFamily: FontFamilies.body.medium,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
} as const;

/**
 * Estilos reutilizables de tipografía (para evitar duplicación en stylesheets).
 * Ejemplo: labels de sección tipo "RESUMEN", "LOGROS MENSUALES", etc.
 */
export const TextStyles = {
  sectionLabel: {
    opacity: 0.7,
    letterSpacing: 1,
  },
  body: Hierarchy.body,
  caption: Hierarchy.caption,
} as const;

export default Typography;
