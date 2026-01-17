import type { ComponentProps } from 'react';
import Animated from 'react-native-reanimated';

type AnimatedViewProps = ComponentProps<typeof Animated.View>;

/**
 * Contenedor animado simple para uso interno en menús/overlays.
 * En plataformas web/nativas funciona como un Animated.View.
 */
function NativeOnlyAnimatedView(props: AnimatedViewProps) {
  return <Animated.View {...props} />;
}

export default NativeOnlyAnimatedView;
