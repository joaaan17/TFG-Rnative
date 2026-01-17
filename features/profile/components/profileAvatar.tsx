import React from 'react';
import { View } from 'react-native';

import ProfileIcon from '@/shared/icons/profile.svg';
import { usePalette } from '@/shared/hooks/use-palette';

export type ProfileAvatarProps = {
  /**
   * Tamaño total (círculo exterior).
   */
  size?: number;
  /**
   * Grosor del borde del círculo exterior.
   */
  outerRingWidth?: number;
  /**
   * Tamaño del círculo interior (fondo del icono).
   */
  innerSize?: number;
  /**
   * Tamaño del icono.
   */
  iconSize?: number;
  /**
   * Si es false, se renderiza solo el anillo exterior (sin círculo interior ni icono).
   */
  showInner?: boolean;
};

export function ProfileAvatar({
  size = 96,
  outerRingWidth = 2,
  innerSize = 72,
  iconSize = 36,
  showInner = true,
}: ProfileAvatarProps) {
  const palette = usePalette();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: outerRingWidth,
        borderColor: palette.icon,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {showInner ? (
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: palette.cardBackground,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ProfileIcon width={iconSize} height={iconSize} fill={palette.text} />
        </View>
      ) : null}
    </View>
  );
}

export default ProfileAvatar;
