import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { CardModal } from '@/shared/components/card-modal';
import { ModalHeader } from '@/shared/components/modal-header';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';
import {
  getLevelMilestoneDefinitions,
  getUnlockedAchievementIds,
} from '../utils/achievementUtils';

export type LogrosModalProps = {
  open: boolean;
  onClose: () => void;
  /** XP total del usuario para calcular logros desbloqueados */
  experience?: number;
};

/** Tamaño de cada casilla para que 8 quepan en 1 fila */
const SLOT_SIZE = 34;
const SLOT_GAP = 6;

/**
 * Modal único con logros tipo "nota de culpa".
 * Cada 5 niveles = 1 logro desbloqueado.
 * Estética: paper-like, grid de casillas con checkmarks.
 */
export function LogrosModal({
  open,
  onClose,
  experience = 0,
}: LogrosModalProps) {
  const palette = usePalette();
  const definitions = React.useMemo(() => getLevelMilestoneDefinitions(), []);
  const unlockedIds = React.useMemo(
    () => getUnlockedAchievementIds(experience),
    [experience]
  );
  const styles = React.useMemo(
    () => createLogrosStyles(palette),
    [palette]
  );

  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.7}
      closeOnBackdropPress
      scrollable
      contentNoPaddingTop
    >
      <ModalHeader
        title="Logros"
        onClose={onClose}
        closeAccessibilityLabel="Cerrar"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Contenedor tipo "nota de culpa" — papel envejecido */}
        <View style={styles.paperCard}>
          <Text
            style={[
              Hierarchy.titleSection,
              styles.sectionTitle,
              { color: palette.icon ?? palette.text },
            ]}
          >
            CADA 5 NIVELES = 1 LOGRO
          </Text>
          <Text
            style={[
              Hierarchy.caption,
              styles.caption,
              { color: palette.icon ?? palette.text },
            ]}
          >
            Alcanza nivel 5, 10, 15… para marcar cada casilla.
          </Text>

          {/* Grid de casillas */}
          <View style={styles.grid}>
            {definitions.map((def) => {
              const isUnlocked = unlockedIds.has(def.id);
              return (
                <View
                  key={def.id}
                  style={[
                    styles.slot,
                    isUnlocked && styles.slotUnlocked,
                    !isUnlocked && styles.slotLocked,
                  ]}
                  accessibilityRole="image"
                  accessibilityLabel={
                    isUnlocked
                      ? `Logro desbloqueado: ${def.label}`
                      : `Logro bloqueado: ${def.label}`
                  }
                >
                  {isUnlocked ? (
                    <Check
                      size={18}
                      color={palette.primary}
                      strokeWidth={2.5}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>

          {/* Leyenda de niveles */}
          <View style={styles.legend}>
            {definitions.map((def) => (
              <Text
                key={def.id}
                style={[
                  Hierarchy.captionSmall,
                  styles.legendItem,
                  {
                    color: unlockedIds.has(def.id)
                      ? palette.primary
                      : palette.icon ?? palette.text,
                  },
                ]}
              >
                {def.requiredLevel}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </CardModal>
  );
}

function createLogrosStyles(palette: ReturnType<typeof usePalette>) {
  const isDark =
    palette.background === '#070B14' || palette.background?.startsWith('#0');
  const paperBg = isDark ? '#161B28' : '#F5F0E6';
  const paperBorder = isDark ? '#252D42' : '#D4CFC4';
  const slotBorder = isDark ? '#2A3548' : '#C9C4B8';

  return StyleSheet.create({
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 32,
    },
    paperCard: {
      marginTop: 8,
      padding: 18,
      borderRadius: 16,
      backgroundColor: paperBg,
      borderWidth: 1,
      borderColor: paperBorder,
      borderLeftWidth: 4,
      borderLeftColor: palette.primary,
    },
    sectionTitle: {
      marginLeft: 8,
      letterSpacing: 1.4,
      marginBottom: 4,
    },
    caption: {
      marginLeft: 8,
      marginBottom: 16,
      opacity: 0.85,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      gap: SLOT_GAP,
      justifyContent: 'flex-start',
    },
    slot: {
      width: SLOT_SIZE,
      height: SLOT_SIZE,
      borderRadius: 8,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    slotUnlocked: {
      borderColor: palette.primary,
      backgroundColor: `${palette.primary}15`,
    },
    slotLocked: {
      borderColor: slotBorder,
      backgroundColor: 'transparent',
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      gap: SLOT_GAP,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: paperBorder,
      justifyContent: 'flex-start',
    },
    legendItem: {
      width: SLOT_SIZE,
      minWidth: SLOT_SIZE,
      textAlign: 'center',
    },
  });
}
