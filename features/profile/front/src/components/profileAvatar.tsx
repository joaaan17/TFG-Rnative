import React from 'react';
import { View } from 'react-native';

import ProfileIcon from '@/shared/icons/profile.svg';
import { usePalette } from '@/shared/hooks/use-palette';

export type ProfileAvatarProps = {
  size?: number;
  outerRingWidth?: number;
  innerSize?: number;
  iconSize?: number;
  showInner?: boolean;
  /** Solo muestra el icono, sin esfera ni anillo */
  iconOnly?: boolean;
};

export function ProfileAvatar({
  size = 96,
  outerRingWidth = 2,
  innerSize = 72,
  iconSize = 36,
  showInner = true,
  iconOnly = false,
}: ProfileAvatarProps) {
  const palette = usePalette();

  if (iconOnly) {
    return (
      <View
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProfileIcon
          width={iconSize}
          height={iconSize}
          fill={palette.text}
        />
      </View>
    );
  }

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
