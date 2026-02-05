import React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppColors from '@/design-system/colors';
import { Card } from '@/shared/components/ui/card';
import { usePalette } from '@/shared/hooks/use-palette';

// Importar BlurView de forma condicional
// Si no está disponible, usaremos un fallback
let BlurViewComponent: React.ComponentType<any> | null = null;

// Solo intentar cargar en tiempo de ejecución, no en tiempo de importación
try {
  if (typeof Platform !== 'undefined' && Platform.OS !== 'web') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const blurModule = require('expo-blur');
    BlurViewComponent = blurModule.BlurView;
  }
} catch {
  // expo-blur no está disponible, usaremos fallback
  BlurViewComponent = null;
}

export type CardModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Altura máxima del modal (por defecto: 90% de la pantalla).
   */
  maxHeightPct?: number; // 0..1
  /**
   * Si true, cerrar al tocar el fondo (backdrop).
   */
  closeOnBackdropPress?: boolean;
};

export function CardModal({
  open,
  onClose,
  children,
  maxHeightPct = 0.9,
  closeOnBackdropPress = true,
}: CardModalProps) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  // En Android, la pantalla puede tener barra de navegación; usamos screen para cubrir todo
  const screenHeight =
    Platform.OS === 'android' ? Dimensions.get('screen').height : windowHeight;

  const [mounted, setMounted] = React.useState(open);
  const [blurOpacityValue, setBlurOpacityValue] = React.useState(0);
  const translateY = React.useRef(new Animated.Value(windowHeight)).current;
  const blurOpacity = React.useRef(new Animated.Value(0)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;

  const maxHeight = Math.max(0, Math.min(1, maxHeightPct)) * screenHeight;

  // Calcular intensidad máxima del blur según si está bloqueado
  const maxBlurIntensity = closeOnBackdropPress ? 20 : 40;
  const maxBackdropOpacity = closeOnBackdropPress ? 0.3 : 0.5;

  // Listener para actualizar el valor de opacidad del blur (necesario para web)
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    const listenerId = blurOpacity.addListener(({ value }) => {
      setBlurOpacityValue(value);
    });

    return () => {
      blurOpacity.removeListener(listenerId);
    };
  }, [blurOpacity]);

  React.useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  React.useEffect(() => {
    if (!mounted) return;

    if (open) {
      // Iniciar desde valores invisibles
      translateY.setValue(screenHeight);
      blurOpacity.setValue(0);
      backdropOpacity.setValue(0);

      // Animar todo junto
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(blurOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    // Animar el cierre
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(blurOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [open, mounted, translateY, blurOpacity, backdropOpacity, screenHeight]);

  if (!mounted) return null;

  // Verificar si BlurView está disponible
  const isBlurAvailable = Platform.OS !== 'web' && BlurViewComponent !== null;

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={closeOnBackdropPress ? onClose : undefined}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={styles.root}>
        {/* BlurView para efecto de desenfoque real en iOS/Android con animación */}
        {isBlurAvailable && BlurViewComponent ? (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: blurOpacity,
              },
            ]}
            pointerEvents="none"
          >
            <BlurViewComponent
              intensity={maxBlurIntensity}
              tint="dark"
              style={StyleSheet.absoluteFill}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: 'rgba(0,0,0,0)',
                    opacity: backdropOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, maxBackdropOpacity],
                    }),
                  },
                ]}
              />
            </BlurViewComponent>
          </Animated.View>
        ) : Platform.OS === 'web' ? (
          // Para web, usar un div nativo con backdrop-filter para mejor soporte
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: closeOnBackdropPress
                ? 'rgba(0,0,0,0.6)'
                : 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              opacity: blurOpacityValue,
              transition: 'opacity 0.22s ease-out',
            }}
          />
        ) : (
          // Fallback para móvil si BlurView no está disponible
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: closeOnBackdropPress
                  ? 'rgba(0,0,0,0.6)'
                  : 'rgba(0,0,0,0.8)',
                opacity: blurOpacity,
              },
            ]}
            pointerEvents="none"
          />
        )}
        {Platform.OS === 'android' ? (
          <TouchableWithoutFeedback
            onPress={() => {
              if (closeOnBackdropPress) onClose();
            }}
            disabled={!closeOnBackdropPress}
            accessible={false}
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                closeOnBackdropPress && styles.backdropTouchable,
              ]}
              pointerEvents={closeOnBackdropPress ? 'auto' : 'none'}
            />
          </TouchableWithoutFeedback>
        ) : (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (closeOnBackdropPress) onClose();
            }}
            disabled={!closeOnBackdropPress}
          />
        )}

        <Animated.View
          style={[
            styles.sheetWrapper,
            {
              transform: [{ translateY }],
            },
          ]}
          pointerEvents="box-none"
        >
          <View style={[styles.sheet, { maxHeight }]}>
            <Card
              className="rounded-t-xl rounded-b-none"
              style={[
                styles.card,
                {
                  maxHeight,
                  backgroundColor: palette.cardBackground,
                  borderColor: palette.text,
                },
              ]}
            >
              <View pointerEvents="none" style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </View>
              <View
                style={{
                  maxHeight: maxHeight - 120,
                  paddingBottom: Math.max(insets.bottom, 12),
                }}
              >
                {children}
              </View>
            </Card>
          </View>
          {/* Relleno inferior para cubrir la barra de navegación en Android y eliminar la línea negra */}
          {Platform.OS === 'android' && (
            <View
              style={{
                height: Math.max(insets.bottom, 32),
                backgroundColor: palette.cardBackground,
              }}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTouchable: {
    zIndex: 10,
    elevation: 10,
  },
  sheetWrapper: {
    width: '100%',
    alignItems: 'stretch',
  },
  sheet: {
    width: '100%',
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  dragHandleContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 88, // más largo (estilo iOS)
    height: 5,
    borderRadius: 999,
    backgroundColor: AppColors.light.primary, // negro
    opacity: 0.9,
  },
});

export default CardModal;
