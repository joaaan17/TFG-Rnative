import React from 'react';
import {
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

export type SearchBarVariant = 'default' | 'translucent';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  /** default = superficie neutra, translucent = azul semitransparente (minimalista) */
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

  const SEARCH_BAR_HEIGHT = 48;

  const containerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: SEARCH_BAR_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: isTranslucent
      ? `${palette.primary}30`
      : palette.surfaceBorder ?? palette.surfaceMuted,
    backgroundColor: isTranslucent
      ? `${palette.primary}15`
      : palette.surfaceMuted ?? palette.inputBackground,
  };

  const iconColor = isTranslucent ? palette.primary : palette.icon;

  return (
    <View style={[containerStyle, style]}>
      <Search size={20} color={iconColor} strokeWidth={1.8} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.icon ?? `${palette.text}99`}
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
