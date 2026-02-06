import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { CardModal } from '@/shared/components/card-modal';
import { Card, CardHeader } from '@/shared/components/ui/card';
import { Text } from '@/shared/components/ui/text';
import { ProfileAvatar } from './profileAvatar';
import { profileStyles } from '../ui/Profile.styles';
import ExpIcon from '@/shared/icons/exp.svg';
import LigaIcon from '@/shared/icons/liga.svg';
import RachaIcon from '@/shared/icons/racha.svg';
import type { ProfileUser } from '../types/profile.types';

export type FriendProfileModalProps = {
  open: boolean;
  onClose: () => void;
  profile: ProfileUser | null;
  loading: boolean;
  error: string | null;
};

function formatJoinedText(username?: string, joinedAt?: string): string {
  const userPart = username ? `@${username} ` : '';
  const year = joinedAt
    ? new Date(joinedAt).getFullYear()
    : new Date().getFullYear();
  return `${userPart}SE UNIÓ EN ${year}.`;
}

function formatPatrimonio(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString('es-ES');
}

export function FriendProfileModal({
  open,
  onClose,
  profile,
  loading,
  error,
}: FriendProfileModalProps) {
  const [contentHeight, setContentHeight] = React.useState<number | undefined>();
  const displayName = profile?.name ?? 'Usuario';
  const joinedText = formatJoinedText(profile?.username, profile?.joinedAt);

  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.98}
      scrollable
      contentHeight={contentHeight}
    >
      {loading ? (
        <View style={[profileStyles.loadingContainer, { paddingVertical: 48 }]}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={{ padding: 24 }}>
          <Text variant="muted" style={{ textAlign: 'center' }}>
            {error}
          </Text>
        </View>
      ) : profile ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={(_w, h) => setContentHeight(h)}
        >
          <Card className="rounded-none" style={profileStyles.topCard}>
            <CardHeader style={profileStyles.topCardHeader}>
              <Text variant="h4" style={profileStyles.topCardTitle}>
                {displayName}
              </Text>
            </CardHeader>
            <View
              style={[profileStyles.topCardCenter, { pointerEvents: 'none' }]}
            >
              <ProfileAvatar
                size={96}
                iconOnly={false}
                imageUri={profile.avatarUrl}
              />
            </View>
          </Card>

          <View style={profileStyles.joinedTextWrapper}>
            <Text variant="muted">{joinedText}</Text>
          </View>

          <View style={profileStyles.statsRow}>
            <View style={profileStyles.statItem}>
              <Text variant="h3" style={profileStyles.statValue}>
                {profile.bf ?? 0}
              </Text>
              <Text variant="muted" style={profileStyles.statLabel}>
                B/F
              </Text>
            </View>
            <View style={profileStyles.statItem}>
              <Text variant="h3" style={profileStyles.statValue}>
                {profile.following ?? 0}
              </Text>
              <Text variant="muted" style={profileStyles.statLabel}>
                Siguiendo
              </Text>
            </View>
            <View style={profileStyles.statItem}>
              <Text variant="h3" style={profileStyles.statValue}>
                {profile.followers ?? 0}
              </Text>
              <Text variant="muted" style={profileStyles.statLabel}>
                Seguidores
              </Text>
            </View>
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
                      {profile.bf ?? 0} días
                    </Text>
                  </View>
                </View>
                <View style={profileStyles.summaryItem}>
                  <Text variant="h4" style={profileStyles.summaryValue}>
                    {profile.nivel ?? 1}
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
                      {profile.division ?? 'Bronce'}
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
                      {formatPatrimonio(profile.patrimonio ?? 0)}
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
      ) : null}
    </CardModal>
  );
}

export default FriendProfileModal;
