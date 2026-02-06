import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Search } from 'lucide-react-native';
import { usePalette } from '@/shared/hooks/use-palette';

import { Input } from './input';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Props adicionales para el Input interno */
  inputProps?: React.ComponentProps<typeof Input>;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  autoFocus,
  style,
  inputProps,
}: SearchBarProps) {
  const palette = usePalette();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: palette.text,
          backgroundColor: palette.inputBackground,
        },
        style,
      ]}
    >
      <Search size={20} color={palette.text} strokeWidth={2} />
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        className="focus-visible:ring-0 focus-visible:ring-offset-0"
        style={{
          flex: 1,
          borderWidth: 0,
          paddingHorizontal: 0,
          paddingVertical: 8,
          backgroundColor: 'transparent',
          minHeight: 36,
          outlineStyle: 'none',
          outlineWidth: 0,
        }}
        {...inputProps}
      />
    </View>
  );
}

export default SearchBar;
