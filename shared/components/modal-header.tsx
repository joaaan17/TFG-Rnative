import React from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, X } from 'lucide-react-native';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';

/** Botón del header con animación de escala al pulsar para feedback táctil ágil. */
function HeaderButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 80,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 100,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ padding: 8 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}

const HEADER_TOP_PADDING = 8;
const ICON_COLUMN_WIDTH = 42;

export type ModalHeaderProps = {
  /** Título centrado (obligatorio). */
  title: string;
  /** Subtítulo opcional bajo el título, en estilo muted. */
  subtitle?: string;
  /** Si se pasa, se muestra flecha atrás y se llama al pulsar. */
  onBack?: () => void;
  /** Si se pasa, se muestra X y se llama al pulsar. */
  onClose?: () => void;
  /** Label de accesibilidad para el botón atrás. */
  backAccessibilityLabel?: string;
  /** Label de accesibilidad para el botón cerrar. */
  closeAccessibilityLabel?: string;
};

/**
 * Cabecera estándar para modales: título centrado, opcional subtítulo,
 * icono atrás (izquierda) y/o cerrar (derecha).
 * Usa safe area y padding consistente.
 */
export function ModalHeader({
  title,
  subtitle,
  onBack,
  onClose,
  backAccessibilityLabel = 'Volver',
  closeAccessibilityLabel = 'Cerrar',
}: ModalHeaderProps) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const paddingTop = HEADER_TOP_PADDING + Math.max(insets.top, 0);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop,
        paddingBottom: 12,
      }}
    >
      <View style={{ minWidth: ICON_COLUMN_WIDTH, alignItems: 'flex-start' }}>
        {onBack != null ? (
          <HeaderButton
            onPress={onBack}
            accessibilityLabel={backAccessibilityLabel}
          >
            <ChevronLeft size={26} color={palette.text} strokeWidth={2} />
          </HeaderButton>
        ) : null}
      </View>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 8,
        }}
      >
        <Text
          style={[
            Hierarchy.titleModal,
            { color: palette.text, textAlign: 'center' },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle != null && subtitle !== '' ? (
          <Text
            variant="muted"
            style={[
              Hierarchy.bodySmall,
              {
                marginTop: 4,
                color: palette.icon ?? palette.text,
                textAlign: 'center',
              },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ minWidth: ICON_COLUMN_WIDTH, alignItems: 'flex-end' }}>
        {onClose != null ? (
          <HeaderButton
            onPress={onClose}
            accessibilityLabel={closeAccessibilityLabel}
          >
            <X size={24} color={palette.text} />
          </HeaderButton>
        ) : null}
      </View>
    </View>
  );
}

export default ModalHeader;
