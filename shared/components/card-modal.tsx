import React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  /**
   * Si true, el contenido con ScrollView puede hacer scroll correctamente (evita recorte).
   */
  scrollable?: boolean;
  /**
   * Altura del contenido (desde onContentSizeChange del ScrollView).
   * Cuando scrollable y se proporciona, el modal se ajusta al contenido hasta maxHeight.
   */
  contentHeight?: number;
  /**
   * Si true, el Card no tiene padding superior (para que el contenido pueda llegar hasta arriba, p. ej. imagen bajo la barra de arrastre).
   */
  contentNoPaddingTop?: boolean;
  /**
   * Color de fondo del sheet y de la franja inferior (p. ej. safe area).
   * Si no se pasa, se usa palette.cardBackground.
   */
  contentBackgroundColor?: string;
};

const DRAG_HANDLE_OFFSET = 50; // espacio para el handle y margen superior
const DRAG_CLOSE_THRESHOLD = 80; // px arrastrados hacia abajo para cerrar

export function CardModal({
  open,
  onClose,
  children,
  maxHeightPct = 0.9,
  closeOnBackdropPress = true,
  scrollable = false,
  contentHeight,
  contentNoPaddingTop = false,
  contentBackgroundColor,
}: CardModalProps) {
  const palette = usePalette();
  const sheetBg = contentBackgroundColor ?? palette.cardBackground;
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  // En Android, la pantalla puede tener barra de navegación; usamos screen para cubrir todo
  const screenHeight =
    Platform.OS === 'android' ? Dimensions.get('screen').height : windowHeight;

  const [mounted, setMounted] = React.useState(open);
  const [blurOpacityValue, setBlurOpacityValue] = React.useState(0);
  const translateY = React.useRef(new Animated.Value(windowHeight)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;
  const blurOpacity = React.useRef(new Animated.Value(0)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) {
          dragY.setValue(dy);
        }
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DRAG_CLOSE_THRESHOLD || vy > 0.5) {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: screenHeight,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(dragY, {
              toValue: 0,
              duration: 0,
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
            if (finished) {
              translateY.setValue(screenHeight);
              setMounted(false);
              onClose();
            }
          });
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 8,
          }).start();
        }
      },
    }),
  ).current;

  const maxHeight = Math.max(0, Math.min(1, maxHeightPct)) * screenHeight;
  const paddingBottom = Math.max(insets.bottom, 12);
  const fitContentHeight =
    scrollable && contentHeight != null && contentHeight > 0
      ? Math.min(contentHeight + DRAG_HANDLE_OFFSET + paddingBottom, maxHeight)
      : null;

  // Calcular intensidad máxima del blur según si está bloqueado
  const maxBlurIntensity = closeOnBackdropPress ? 20 : 40;
  const maxBackdropOpacity = closeOnBackdropPress ? 0.3 : 0.5;
  const blurTint =
    palette.background === '#070B14' || palette.background === '#081226'
      ? 'dark'
      : 'light';

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
      dragY.setValue(0);
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
              { opacity: blurOpacity, pointerEvents: 'none' },
            ]}
          >
            <BlurViewComponent
              intensity={maxBlurIntensity}
              tint={blurTint}
              style={StyleSheet.absoluteFill}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor:
                      blurTint === 'dark'
                        ? 'rgba(0,0,0,0)'
                        : 'rgba(255,255,255,0)',
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
              backgroundColor:
                blurTint === 'dark'
                  ? closeOnBackdropPress
                    ? 'rgba(0,0,0,0.60)'
                    : 'rgba(0,0,0,0.78)'
                  : closeOnBackdropPress
                    ? 'rgba(10,14,24,0.26)'
                    : 'rgba(10,14,24,0.36)',
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
                backgroundColor:
                  blurTint === 'dark'
                    ? closeOnBackdropPress
                      ? 'rgba(0,0,0,0.60)'
                      : 'rgba(0,0,0,0.78)'
                    : closeOnBackdropPress
                      ? 'rgba(10,14,24,0.26)'
                      : 'rgba(10,14,24,0.36)',
                opacity: blurOpacity,
                pointerEvents: 'none',
              },
            ]}
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
                { pointerEvents: closeOnBackdropPress ? 'auto' : 'none' },
              ]}
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
              transform: [
                {
                  translateY: Animated.add(translateY, dragY),
                },
              ],
              pointerEvents: 'box-none',
            },
          ]}
        >
          <View
            style={[
              styles.sheet,
              scrollable
                ? {
                    height: fitContentHeight ?? maxHeight,
                    maxHeight,
                  }
                : { maxHeight },
            ]}
          >
            <Card
              className="rounded-t-3xl rounded-b-none"
              style={[
                styles.card,
                {
                  ...(scrollable && { flex: 1 }),
                  maxHeight,
                  backgroundColor: sheetBg,
                  borderColor: palette.surfaceBorder ?? palette.text,
                  ...(contentNoPaddingTop && { paddingTop: 0 }),
                },
              ]}
            >
              {/* Barra de arrastre en flujo, sin overlay: header queda libre para toques */}
              <View
                style={[
                  styles.dragHandleRow,
                  { pointerEvents: closeOnBackdropPress ? 'auto' : 'none' },
                ]}
                {...(closeOnBackdropPress ? panResponder.panHandlers : {})}
              >
                <View style={styles.dragHandle} />
              </View>
              <View
                style={[
                  styles.contentWrap,
                  scrollable
                    ? { flex: 1, minHeight: 0, paddingBottom }
                    : { maxHeight: maxHeight - 120, paddingBottom },
                ]}
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
                backgroundColor: sheetBg,
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  /** Barra de arrastre en flujo (sin overlay): el header queda debajo y recibe toques correctamente. */
  dragHandleRow: {
    paddingTop: 6,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 64,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(128,128,128,0.35)',
    opacity: 0.95,
  },
  contentWrap: {},
});

export default CardModal;
