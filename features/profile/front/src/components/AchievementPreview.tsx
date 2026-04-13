import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { usePalette } from '@/shared/hooks/use-palette';
import { getLevelMilestoneDefinitions, getUnlockedAchievementIds } from '../utils/achievementUtils';

const PREVIEW_SLOT_SIZE = 28;
const PREVIEW_GAP = 5;

export type AchievementPreviewProps = {
  experience?: number;
};

/**
 * Vista previa compacta de logros (8 casillas) para el perfil.
 */
export function AchievementPreview({ experience = 0 }: AchievementPreviewProps) {
  const palette = usePalette();
  const definitions = React.useMemo(() => getLevelMilestoneDefinitions(), []);
  const unlockedIds = React.useMemo(
    () => getUnlockedAchievementIds(experience),
    [experience]
  );

  const slotStyles = React.useMemo(
    () =>
      StyleSheet.create({
        slot: {
          width: PREVIEW_SLOT_SIZE,
          height: PREVIEW_SLOT_SIZE,
          borderRadius: 8,
          borderWidth: 1.5,
          alignItems: 'center',
          justifyContent: 'center',
        },
        slotUnlocked: {
          borderColor: palette.primary,
          backgroundColor: `${palette.primary}18`,
        },
        slotLocked: {
          borderColor: palette.surfaceBorder ?? palette.icon ?? palette.text,
          backgroundColor: 'transparent',
        },
      }),
    [palette]
  );

  return (
    <View style={styles.row}>
      {definitions.map((def) => {
        const isUnlocked = unlockedIds.has(def.id);
        return (
          <View
            key={def.id}
            style={[
              slotStyles.slot,
              isUnlocked ? slotStyles.slotUnlocked : slotStyles.slotLocked,
            ]}
          >
            {isUnlocked ? (
              <Check size={18} color={palette.primary} strokeWidth={2.5} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PREVIEW_GAP,
    justifyContent: 'center',
  },
});
