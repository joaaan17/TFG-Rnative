import React from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppColors from '@/design-system/colors';
import { Card } from '@/shared/components/ui/card';
import { usePalette } from '@/shared/hooks/use-palette';

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

  const [mounted, setMounted] = React.useState(open);
  const translateY = React.useRef(new Animated.Value(windowHeight)).current;

  const maxHeight = Math.max(0, Math.min(1, maxHeightPct)) * windowHeight;

  React.useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  React.useEffect(() => {
    if (!mounted) return;

    if (open) {
      translateY.setValue(windowHeight);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(translateY, {
      toValue: windowHeight,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [open, mounted, translateY, windowHeight]);

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
          onPress={() => {
            if (closeOnBackdropPress) onClose();
          }}
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <Card
            className="rounded-t-xl rounded-b-none"
            style={[
              styles.card,
              {
                maxHeight,
                height: maxHeight,
                backgroundColor: palette.cardBackground,
                borderColor: palette.text,
              },
            ]}
          >
            <View pointerEvents="none" style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            {children}
          </Card>
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
  sheet: {
    width: '100%',
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
