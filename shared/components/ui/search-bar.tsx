import React from 'react';
import {
  Platform,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

/** Misma sombra sutil que el Input del Consultorio (shadow-sm) */
const inputLikeShadow = Platform.select<ViewStyle>({
  android: { elevation: 2 },
  default: {
    shadowColor: '#0B0A09',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});

export type SearchBarVariant = 'default' | 'translucent' | 'input';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  /** default = superficie neutra, translucent = azul semitransparente, input = mismo estilo que el Input del Consultorio (blanco, borde gris, sombra sutil) */
  variant?: SearchBarVariant;
  /** Props adicionales para el TextInput */
  inputProps?: React.ComponentProps<typeof TextInput>;
};

/**
 * Buscador minimalista de una sola capa, sin doble fondo.
 * Encaja con la estética de la app: limpio y moderno.
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  autoFocus,
  style,
  variant = 'default',
  inputProps,
}: SearchBarProps) {
  const palette = usePalette();

  const isTranslucent = variant === 'translucent';
  const isInputStyle = variant === 'input';

  const SEARCH_BAR_HEIGHT = 48;
  const INPUT_STYLE_HEIGHT = 40;

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: isInputStyle ? 12 : 16,
    paddingVertical: isInputStyle ? 10 : 12,
    minHeight: isInputStyle ? INPUT_STYLE_HEIGHT : SEARCH_BAR_HEIGHT,
    borderRadius: isInputStyle ? 8 : 14,
    borderWidth: 1,
    borderColor: isTranslucent
      ? `${palette.primary}30`
      : (palette.surfaceBorder ?? palette.text),
    backgroundColor: isInputStyle
      ? palette.inputBackground
      : isTranslucent
        ? `${palette.primary}15`
        : (palette.surfaceMuted ?? palette.inputBackground),
    ...(isInputStyle ? inputLikeShadow : {}),
  };

  const iconColor = isTranslucent ? palette.primary : palette.icon;
  const placeholderColor = isInputStyle
    ? `${palette.text}80`
    : (palette.icon ?? `${palette.text}99`);

  return (
    <View style={[containerStyle, style]}>
      <Search size={20} color={iconColor} strokeWidth={1.8} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={[
          Hierarchy.body,
          {
            flex: 1,
            padding: 0,
            margin: 0,
            borderWidth: 0,
            backgroundColor: 'transparent',
            color: palette.text,
            minHeight: 24,
            outlineStyle: 'none',
            outlineWidth: 0,
          } as ViewStyle,
        ]}
        {...inputProps}
      />
    </View>
  );
}

export default SearchBar;
