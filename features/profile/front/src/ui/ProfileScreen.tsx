import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

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

import { profileStyles } from './Profile.styles';
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

  const displayName = profile?.name ?? user?.name ?? '';
  const joinedText = formatJoinedText(profile?.username, profile?.joinedAt);

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
      return undefined;
    }, [refetchProfile]),
  );

  if (isLoading) {
    return (
      <AppShellComponent>
        <View style={[profileStyles.container, profileStyles.loadingContainer]}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </AppShellComponent>
    );
  }

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
              text={displayName || 'Usuario'}
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
            onPress={() => setShowSettingsModal(true)}
          >
            <SettingsIcon width={24} height={24} fill={palette.text} />
          </Pressable>
        </Card>

        <View style={profileStyles.joinedTextWrapper}>
          <Text variant="muted">{joinedText}</Text>
          {error ? (
            <Text variant="muted" style={profileStyles.errorText}>
              {error}
            </Text>
          ) : null}
        </View>

        <View style={profileStyles.statsRow}>
          <View style={profileStyles.statItem}>
            <Text variant="h3" style={profileStyles.statValue}>
              {profile?.bf ?? 0}
            </Text>
            <Text variant="muted" style={profileStyles.statLabel}>
              B/F
            </Text>
          </View>

          <View style={profileStyles.statItem}>
            <Text variant="h3" style={profileStyles.statValue}>
              {profile?.following ?? 0}
            </Text>
            <Text variant="muted" style={profileStyles.statLabel}>
              Siguiendo
            </Text>
          </View>

          <View style={profileStyles.statItem}>
            <Text variant="h3" style={profileStyles.statValue}>
              {profile?.followers ?? 0}
            </Text>
            <Text variant="muted" style={profileStyles.statLabel}>
              Seguidores
            </Text>
          </View>
        </View>

        <View style={profileStyles.addFriendsWrapper}>
          <Button
            size="sm"
            style={profileStyles.addFriendsButton}
            onPress={() => setShowAddFriendsModal(true)}
          >
            <AgregarIcon width={22} height={22} />
            <Text>Agregar Amigos</Text>
          </Button>
          <Button
            size="sm"
            style={profileStyles.addFriendsButton}
            onPress={() => setShowRequestsModal(true)}
          >
            <Text>Ver Solicitudes</Text>
          </Button>
        </View>

        <View style={profileStyles.addFriendsRowSecond}>
          <Button
            size="sm"
            style={profileStyles.addFriendsButtonFullWidth}
            onPress={() => setShowFriendsModal(true)}
          >
            <Text>Ver Amigos</Text>
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
                    {profile?.bf ?? 0} días
                  </Text>
                </View>
              </View>
              <View style={profileStyles.summaryItem}>
                <Text variant="h4" style={profileStyles.summaryValue}>
                  {profile?.nivel ?? 1}
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
                    {profile?.division ?? 'Bronce'}
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
                    {formatPatrimonio(profile?.patrimonio ?? 0)}
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
    </AppShellComponent>
  );
}

export default ProfileScreen;
