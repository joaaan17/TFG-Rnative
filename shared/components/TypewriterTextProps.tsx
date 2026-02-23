import React from 'react';

import { Text } from '@/shared/components/ui/text';
import { FontFamilies } from '@/design-system/typography';

const DEFAULT_TYPEWRITER_FONT_FAMILY = FontFamilies.primary.bold;

export type TypewriterTextProps = {
  text: string;
  speed?: number;
  /**
   * Controla la tipografía del texto animado.
   * - Si `useDefaultFontFamily` es true (default), se usa `fontFamily` si lo pasas,
   *   o la tipografía principal de títulos como fallback.
   * - Si `useDefaultFontFamily` es false, NO se fuerza ninguna fontFamily (usa la tipografía normal de la app).
   */
  fontFamily?: string;
  useDefaultFontFamily?: boolean;
} & Omit<React.ComponentProps<typeof Text>, 'children'>;

export function TypewriterText({
  text,
  speed = 50,
  fontFamily,
  useDefaultFontFamily = true,
  ...textProps
}: TypewriterTextProps) {
  const [visibleText, setVisibleText] = React.useState('');

  React.useEffect(() => {
    setVisibleText('');

    let i = 0;
    const safeSpeed = Math.max(0, speed);

    if (text.length === 0) return;

    const interval = setInterval(() => {
      setVisibleText(text.slice(0, i + 1));
      i++;

      if (i >= text.length) clearInterval(interval);
    }, safeSpeed);

    return () => clearInterval(interval);
  }, [text, speed]);

  const resolvedFontFamily = useDefaultFontFamily
    ? (fontFamily ?? DEFAULT_TYPEWRITER_FONT_FAMILY)
    : undefined;

  return (
    <Text
      {...textProps}
      style={[
        resolvedFontFamily ? { fontFamily: resolvedFontFamily } : null,
        textProps.style,
      ]}
    >
      {visibleText}
    </Text>
  );
}

export default TypewriterText;
