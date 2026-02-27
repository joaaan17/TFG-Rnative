import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import AppColors from '@/design-system/colors';
import { TextStyles } from '@/design-system/typography';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import ProfileIcon from '@/shared/icons/profile.svg';

export type FriendCardProps = {
  name: string;
  /**
   * Capital del usuario. Si no se pasa, se genera uno "aleatorio" pero estable a partir del nombre.
   */
  capital?: number;
  onPress?: () => void;
};

/**
 * Card simple para listar amigos (estética similar a las cards de inversiones).
 * Izquierda: icono de perfil dentro de círculo.
 * Derecha: nombre del amigo + capital.
 */
export function FriendCard({ name, capital, onPress }: FriendCardProps) {
  const palette = usePalette();

  const resolvedCapital = React.useMemo(() => {
    if (typeof capital === 'number') return capital;

    // pseudo-random estable basado en el nombre
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) | 0;
    }
    const n = Math.abs(hash);
    // rango ejemplo: 150..9999
    return 150 + (n % 9850);
  }, [capital, name]);

  const capitalText = `${resolvedCapital.toLocaleString('es-ES')} $`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={[
        styles.root,
        {
          backgroundColor: AppColors.light.cardBackground,
          borderColor: AppColors.light.surfaceBorder,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: AppColors.light.surfaceMuted,
            borderColor: 'rgba(0,0,0,0.08)',
          },
        ]}
      >
        <ProfileIcon width={22} height={22} fill={palette.text} />
      </View>

      <View style={styles.right}>
        <Text variant="h3">{name}</Text>
        <View style={styles.bottomRow}>
          <Text variant="muted" style={TextStyles.sectionLabel}>
            CAPITAL:
          </Text>
          <Text variant="muted" style={styles.capitalValue}>
            {capitalText}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  right: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  capitalValue: {
    marginLeft: 10,
  },
});

export default FriendCard;
