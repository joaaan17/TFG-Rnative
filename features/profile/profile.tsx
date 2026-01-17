import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import AppShellComponent from '@/shared/components/layout/AppShell';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { Card, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import AgregarIcon from '@/shared/icons/agregar.svg';
import ExpIcon from '@/shared/icons/exp.svg';
import LigaIcon from '@/shared/icons/liga.svg';
import RachaIcon from '@/shared/icons/racha.svg';
import SettingsIcon from '@/shared/icons/settings.svg';

import { profileStyles } from './profileStyles';
import { ProfileAvatar } from './components/profileAvatar';

export function ProfileScreen() {
  const palette = usePalette();
  const [typewriterKey, setTypewriterKey] = React.useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      return undefined;
    }, []),
  );

  return (
    <AppShellComponent>
      <ScrollView
        style={profileStyles.container}
        contentContainerStyle={profileStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card className="rounded-none" style={profileStyles.topCard}>
          <CardHeader style={profileStyles.topCardHeader}>
            <TypewriterTextComponent
              key={typewriterKey}
              text="Joan"
              speed={40}
              variant="h4"
              className="border-0 pb-0"
              style={profileStyles.topCardTitle}
            />
          </CardHeader>

          <View
            style={[profileStyles.topCardCenter, { pointerEvents: 'none' }]}
          >
            <ProfileAvatar />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajustes"
            hitSlop={10}
            style={profileStyles.settingsButton}
            onPress={() => {
              // TODO: navegación a ajustes
            }}
          >
            <SettingsIcon width={24} height={24} fill={palette.text} />
          </Pressable>
        </Card>

        <View style={profileStyles.joinedTextWrapper}>
          <Text variant="muted">@JOAAAN_17 SE UNIÓ EN 2025.</Text>
        </View>

        <View style={profileStyles.statsRow}>
          <View style={profileStyles.statItem}>
            <Text variant="h3" style={profileStyles.statValue}>
              0
            </Text>
            <Text variant="muted" style={profileStyles.statLabel}>
              B/F
            </Text>
          </View>

          <View style={profileStyles.statItem}>
            <Text variant="h3" style={profileStyles.statValue}>
              0
            </Text>
            <Text variant="muted" style={profileStyles.statLabel}>
              Siguiendo
            </Text>
          </View>

          <View style={profileStyles.statItem}>
            <Text variant="h3" style={profileStyles.statValue}>
              0
            </Text>
            <Text variant="muted" style={profileStyles.statLabel}>
              Seguidores
            </Text>
          </View>
        </View>

        <View style={profileStyles.addFriendsWrapper}>
          <Button size="sm" style={profileStyles.addFriendsButton}>
            <AgregarIcon width={22} height={22} />
            <Text>Agregar Amigos</Text>
          </Button>
        </View>

        <View style={profileStyles.summaryWrapper}>
          <Text variant="muted" style={profileStyles.summaryTitle}>
            RESUMEN
          </Text>

          <View style={profileStyles.summaryGrid}>
            <View style={profileStyles.summaryRow}>
              <View style={profileStyles.summaryItem}>
                <View style={profileStyles.summaryValueRow}>
                  <RachaIcon
                    style={profileStyles.summaryIcon}
                    width={18}
                    height={18}
                  />
                  <Text variant="h4" style={profileStyles.summaryValue}>
                    365 días
                  </Text>
                </View>
              </View>
              <View style={profileStyles.summaryItem}>
                <Text variant="h4" style={profileStyles.summaryValue}>
                  25
                </Text>
              </View>
            </View>

            <View style={profileStyles.summaryRow}>
              <View style={profileStyles.summaryItem}>
                <View style={profileStyles.summaryValueRow}>
                  <LigaIcon
                    style={profileStyles.summaryIcon}
                    width={20}
                    height={20}
                  />
                  <Text variant="h4" style={profileStyles.summaryValue}>
                    Oro
                  </Text>
                </View>
              </View>
              <View style={profileStyles.summaryItem}>
                <View style={profileStyles.summaryValueRow}>
                  <ExpIcon
                    style={profileStyles.summaryIcon}
                    width={18}
                    height={18}
                  />
                  <Text variant="h4" style={profileStyles.summaryValue}>
                    12321321 EXP
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={profileStyles.summaryWrapper}>
          <Text variant="muted" style={profileStyles.summaryTitle}>
            LOGROS MENSUALES
          </Text>

          <View style={profileStyles.logrosRow}>
            <ProfileAvatar size={72} outerRingWidth={2} showInner={false} />
            <ProfileAvatar size={72} outerRingWidth={2} showInner={false} />
            <ProfileAvatar size={72} outerRingWidth={2} showInner={false} />
            <ProfileAvatar size={72} outerRingWidth={2} showInner={false} />
          </View>
        </View>

        <View style={profileStyles.summaryWrapper}>
          <Text variant="muted" style={profileStyles.summaryTitle}>
            LOGROS TOTALES
          </Text>

          <View style={profileStyles.logrosRow}>
            <ProfileAvatar size={72} outerRingWidth={2} showInner={false} />
            <ProfileAvatar size={72} outerRingWidth={2} showInner={false} />
            <ProfileAvatar size={72} outerRingWidth={2} showInner={false} />
            <ProfileAvatar size={72} outerRingWidth={2} showInner={false} />
          </View>
        </View>
      </ScrollView>
    </AppShellComponent>
  );
}

export default ProfileScreen;
