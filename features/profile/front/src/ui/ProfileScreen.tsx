import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
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
import { usePortfolio } from '@/features/investments/front/src/hooks/usePortfolio';

import { createProfileStyles } from './Profile.styles';
import { AddFriendsModal } from '../components/add-friends-modal';
import { FriendProfileModal } from '../components/friend-profile-modal';
import { FriendsListModal } from '../components/friends-list-modal';
import { PendingRequestsModal } from '../components/pending-requests-modal';
import { ProfileAvatar } from '../components/profileAvatar';
import { SettingsModal } from '../components/settings-modal';
import { useProfileViewModel } from '../state/useProfileViewModel';

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

export function ProfileScreen() {
  const palette = usePalette();
  const styles = React.useMemo(() => createProfileStyles(palette), [palette]);
  const router = useRouter();
  const {
    profile,
    user,
    isLoading,
    error,
    showSettingsModal,
    setShowSettingsModal,
    closeSettingsModal,
    clearDeleteError,
    showAddFriendsModal,
    setShowAddFriendsModal,
    closeAddFriendsModal,
    searchFriendsValue,
    setSearchFriendsValue,
    searchResults,
    searchLoading,
    searchError,
    requestedIds,
    handleRequestFriend,
    showRequestsModal,
    setShowRequestsModal,
    closeRequestsModal,
    showFriendsModal,
    setShowFriendsModal,
    closeFriendsModal,
    friendsList,
    friendsLoading,
    friendsError,
    showFriendProfileModal,
    friendProfile,
    friendProfileLoading,
    friendProfileError,
    handleSelectFriend,
    closeFriendProfileModal,
    pendingRequests,
    pendingLoading,
    pendingError,
    processingIds,
    handleAcceptRequest,
    handleRejectRequest,
    handleSignOut,
    handleDeleteAccount,
    isDeleting,
    deleteError,
    refetchProfile,
  } = useProfileViewModel();
  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const { session } = useAuthSession();
  const { data: portfolioData, refetch: refetchPortfolio } = usePortfolio(
    session?.token ?? null,
    true,
  );

  const displayName = profile?.name ?? user?.name ?? '';
  const joinedText = formatJoinedText(profile?.username, profile?.joinedAt);
  // Efectivo: priorizar cartera (fuente de verdad) y luego el valor guardado en perfil
  const cashDisplay = portfolioData?.cashBalance ?? profile?.cashBalance ?? 0;

  const handleSettingsSignOut = React.useCallback(async () => {
    await handleSignOut();
    closeSettingsModal();
    router.replace('/');
  }, [handleSignOut, closeSettingsModal, router]);

  const handleSettingsConfirmDelete = React.useCallback(async () => {
    const ok = await handleDeleteAccount();
    if (ok) {
      closeSettingsModal();
      router.replace('/');
    }
    return ok;
  }, [handleDeleteAccount, closeSettingsModal, router]);

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      refetchProfile();
      refetchPortfolio();
      return undefined;
    }, [refetchProfile, refetchPortfolio]),
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.topCard}>
          <View style={styles.topCardDecorA} pointerEvents="none" />
          <View style={styles.topCardDecorB} pointerEvents="none" />

          <CardHeader style={styles.topCardHeader}>
            <TypewriterTextComponent
              key={typewriterKey}
              text={displayName || 'Usuario'}
              speed={40}
              variant="h4"
              className="border-0 pb-0"
              style={styles.topCardTitle}
            />
          </CardHeader>

          <View style={styles.topCardCenter} pointerEvents="none">
            <ProfileAvatar
              size={108}
              innerSize={82}
              iconSize={38}
              outerRingWidth={2}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajustes"
            hitSlop={10}
            style={styles.settingsButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <SettingsIcon width={22} height={22} fill={palette.text} />
          </Pressable>
        </Card>

        <View style={styles.cashRow}>
          <View style={styles.cashLabelAccent} />
          <Text variant="muted" style={styles.cashLabel}>
            Efectivo disponible
          </Text>
          <Text
            variant="default"
            style={[styles.cashValue, { color: palette.text }]}
          >
            {cashDisplay.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            $
          </Text>
        </View>

        <View style={styles.joinedTextWrapper}>
          <Text variant="muted">{joinedText}</Text>
          {error ? (
            <Text variant="muted" style={styles.errorText}>
              {error}
            </Text>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="h3" style={styles.statValue}>
              {profile?.bf ?? 0}
            </Text>
            <Text variant="muted" style={styles.statLabel}>
              B/F
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text variant="h3" style={styles.statValue}>
              {profile?.following ?? 0}
            </Text>
            <Text variant="muted" style={styles.statLabel}>
              Siguiendo
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text variant="h3" style={styles.statValue}>
              {profile?.followers ?? 0}
            </Text>
            <Text variant="muted" style={styles.statLabel}>
              Seguidores
            </Text>
          </View>
        </View>

        <View style={styles.addFriendsWrapper}>
          <Button
            size="sm"
            style={styles.addFriendsButton}
            onPress={() => setShowAddFriendsModal(true)}
          >
            <AgregarIcon width={20} height={20} />
            <Text>Agregar Amigos</Text>
          </Button>
          <Button
            size="sm"
            style={styles.addFriendsButton}
            onPress={() => setShowRequestsModal(true)}
          >
            <Text>Ver Solicitudes</Text>
          </Button>
        </View>

        <View style={styles.addFriendsRowSecond}>
          <Button
            size="sm"
            variant="outline"
            style={[
              styles.addFriendsButtonFullWidth,
              {
                backgroundColor: 'rgba(29,78,216,0.12)',
                borderColor: 'rgba(29,78,216,0.28)',
              },
            ]}
            onPress={() => setShowFriendsModal(true)}
          >
            <Text>Ver Amigos</Text>
          </Button>
        </View>

        <View style={styles.summaryWrapper}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleAccent} />
            <Text variant="muted" style={styles.summaryTitle}>
              RESUMEN
            </Text>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryValueRow}>
                    <View style={styles.summaryIconPill}>
                      <RachaIcon width={16} height={16} />
                    </View>
                    <Text variant="h4" style={styles.summaryValue}>
                      {profile?.bf ?? 0} días
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryItem}>
                  <Text variant="h4" style={styles.summaryValue}>
                    {profile?.nivel ?? 1}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryValueRow}>
                    <View style={styles.summaryIconPill}>
                      <LigaIcon width={18} height={18} />
                    </View>
                    <Text variant="h4" style={styles.summaryValue}>
                      {profile?.division ?? 'Bronce'}
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryValueRow}>
                    <View style={styles.summaryIconPill}>
                      <ExpIcon width={16} height={16} />
                    </View>
                    <Text variant="h4" style={styles.summaryValue}>
                      {formatPatrimonio(profile?.patrimonio ?? 0)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.summaryWrapper}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleAccent} />
            <Text variant="muted" style={styles.summaryTitle}>
              LOGROS MENSUALES
            </Text>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.logrosRow}>
              <ProfileAvatar size={74} outerRingWidth={2} showInner={false} />
              <ProfileAvatar size={74} outerRingWidth={2} showInner={false} />
              <ProfileAvatar size={74} outerRingWidth={2} showInner={false} />
              <ProfileAvatar size={74} outerRingWidth={2} showInner={false} />
            </View>
          </View>
        </View>

        <View style={styles.summaryWrapper}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleAccent} />
            <Text variant="muted" style={styles.summaryTitle}>
              LOGROS TOTALES
            </Text>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.logrosRow}>
              <ProfileAvatar size={74} outerRingWidth={2} showInner={false} />
              <ProfileAvatar size={74} outerRingWidth={2} showInner={false} />
              <ProfileAvatar size={74} outerRingWidth={2} showInner={false} />
              <ProfileAvatar size={74} outerRingWidth={2} showInner={false} />
            </View>
          </View>
        </View>
      </ScrollView>

      <FriendsListModal
        open={showFriendsModal}
        onClose={closeFriendsModal}
        items={friendsList}
        loading={friendsLoading}
        error={friendsError}
        onSelectFriend={handleSelectFriend}
      />

      <FriendProfileModal
        open={showFriendProfileModal}
        onClose={closeFriendProfileModal}
        profile={friendProfile}
        loading={friendProfileLoading}
        error={friendProfileError}
      />

      <PendingRequestsModal
        open={showRequestsModal}
        onClose={closeRequestsModal}
        items={pendingRequests}
        loading={pendingLoading}
        error={pendingError}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
        processingIds={processingIds}
      />

      <AddFriendsModal
        open={showAddFriendsModal}
        onClose={closeAddFriendsModal}
        searchValue={searchFriendsValue}
        onSearchChange={setSearchFriendsValue}
        searchResults={searchResults}
        searchLoading={searchLoading}
        searchError={searchError}
        requestedIds={requestedIds}
        onRequestFriend={handleRequestFriend}
      />

      <SettingsModal
        open={showSettingsModal}
        onClose={closeSettingsModal}
        user={user}
        profile={profile}
        onRequestSignOut={handleSettingsSignOut}
        onConfirmDelete={handleSettingsConfirmDelete}
        onCancelDelete={clearDeleteError}
        isDeleting={isDeleting}
        deleteError={deleteError}
      />
    </>
  );
}

export default ProfileScreen;
