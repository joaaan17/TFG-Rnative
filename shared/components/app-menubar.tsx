import React from 'react';
import { Pressable, View } from 'react-native';

import FriendsIcon from '@/shared/icons/friends.svg';
import InversionsIcon from '@/shared/icons/inversions.svg';
import NewsIcon from '@/shared/icons/news.svg';
import ProfileIcon from '@/shared/icons/profile.svg';
import QuestionIcon from '@/shared/icons/question.svg';
import { usePalette } from '@/shared/hooks/use-palette';

export type AppMenubarProps = {
  onPressProfile?: () => void;
  onPressFriends?: () => void;
  onPressInvestments?: () => void;
  onPressNews?: () => void;
  onPressQuestion?: () => void;
  iconSizes?: Partial<{
    news: number;
    question: number;
    friends: number;
    investments: number;
    profile: number;
  }>;
};

export function AppMenubar({
  onPressProfile,
  onPressFriends,
  onPressInvestments,
  onPressNews,
  onPressQuestion,
  iconSizes,
}: AppMenubarProps) {
  const palette = usePalette();
  const sizes = {
    news: iconSizes?.news ?? 40,
    question: iconSizes?.question ?? 24,
    friends: iconSizes?.friends ?? 30,
    investments: iconSizes?.investments ?? 50,
    profile: iconSizes?.profile ?? 30,
  } as const;
  const itemClassName =
    'flex-1 items-center justify-center bg-transparent web:hover:bg-transparent web:active:bg-transparent web:focus:bg-transparent';

  function renderItem({
    Icon,
    size,
    onPress,
    label,
  }: {
    Icon: React.ComponentType<{
      width?: number;
      height?: number;
      fill?: string;
    }>;
    size: number;
    onPress?: () => void;
    label: string;
  }) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        className={itemClassName}
        onPress={() => {
          onPress?.();
        }}
      >
        <Icon width={size} height={size} fill={palette.text} />
      </Pressable>
    );
  }

  return (
    <View className="w-full flex-row items-stretch justify-evenly">
      {renderItem({
        Icon: NewsIcon,
        size: sizes.news,
        onPress: onPressNews,
        label: 'Noticias',
      })}
      {renderItem({
        Icon: QuestionIcon,
        size: sizes.question,
        onPress: onPressQuestion,
        label: 'Ayuda',
      })}
      {renderItem({
        Icon: InversionsIcon,
        size: sizes.investments,
        onPress: onPressInvestments,
        label: 'Inversiones',
      })}
      {renderItem({
        Icon: FriendsIcon,
        size: sizes.friends,
        onPress: onPressFriends,
        label: 'Amigos',
      })}
      {renderItem({
        Icon: ProfileIcon,
        size: sizes.profile,
        onPress: onPressProfile,
        label: 'Perfil',
      })}
    </View>
  );
}

export default AppMenubar;
