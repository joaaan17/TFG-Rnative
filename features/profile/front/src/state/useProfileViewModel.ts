import * as React from 'react';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import { onProfileXpAwarded } from '../events/profile-events';
import { authService } from '@/features/auth/front/src/services/authService';
import { relationshipsService } from '@/features/relationships/front/src/services/relationshipsService';
import type { PendingRequestItem } from '@/features/relationships/front/src/services/relationshipsService';
import { profileService } from '../services/profileService';
import type { ProfileUser, ProfileSearchItem } from '../types/profile.types';

const {
  getProfile,
  searchProfiles,
  suggestProfilesForFriends,
  extractErrorMessage,
} = profileService;

function stripAchievementGrantsFromProfile(data: ProfileUser): ProfileUser {
  const { lastAchievementGrants: _, ...rest } = data as ProfileUser & {
    lastAchievementGrants?: ProfileUser['lastAchievementGrants'];
  };
  return rest as ProfileUser;
}

export function useProfileViewModel() {
  const { session, signOut } = useAuthSession();
  const [profile, setProfile] = React.useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [showAddFriendsModal, setShowAddFriendsModal] = React.useState(false);
  const [showRequestsModal, setShowRequestsModal] = React.useState(false);
  const [showFriendsModal, setShowFriendsModal] = React.useState(false);
  const [pendingRequests, setPendingRequests] = React.useState<
    PendingRequestItem[]
  >([]);
  const [pendingLoading, setPendingLoading] = React.useState(false);
  const [pendingError, setPendingError] = React.useState<string | null>(null);
  const [processingIds, setProcessingIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [friendsList, setFriendsList] = React.useState<PendingRequestItem[]>(
    [],
  );
  const [friendsLoading, setFriendsLoading] = React.useState(false);
  const [friendsError, setFriendsError] = React.useState<string | null>(null);
  const [showFriendProfileModal, setShowFriendProfileModal] =
    React.useState(false);
  const [friendUserId, setFriendUserId] = React.useState<string | null>(null);
  const [friendProfile, setFriendProfile] = React.useState<ProfileUser | null>(
    null,
  );
  const [friendProfileLoading, setFriendProfileLoading] = React.useState(false);
  const [friendProfileError, setFriendProfileError] = React.useState<
    string | null
  >(null);
  const [searchFriendsValue, setSearchFriendsValue] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<ProfileSearchItem[]>(
    [],
  );
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [suggestedUsers, setSuggestedUsers] = React.useState<
    ProfileSearchItem[]
  >([]);
  const [suggestedLoading, setSuggestedLoading] = React.useState(false);
  const [suggestedError, setSuggestedError] = React.useState<string | null>(
    null,
  );
  const [requestedIds, setRequestedIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const [achievementRewardModal, setAchievementRewardModal] = React.useState<{
    grants: { level: number; amountUsd: number }[];
    totalGrantedUsd: number;
  } | null>(null);

  const closeAchievementRewardModal = React.useCallback(() => {
    setAchievementRewardModal(null);
  }, []);

  const handleSignOut = React.useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleDeleteAccount = React.useCallback(async (): Promise<boolean> => {
    const userId = session?.user?.id;
    const token = session?.token;
    if (!userId || !token) {
      setDeleteError('Sesión expirada, inicia sesión de nuevo');
      return false;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await authService.deleteAccount(userId, token);
      await signOut();
      return true;
    } catch (err) {
      setDeleteError(
        authService.extractErrorMessage(err, 'Error al eliminar cuenta'),
      );
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [session?.user?.id, session?.token, signOut]);

  React.useEffect(() => {
    let cancelled = false;
    const userId = session?.user?.id;
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setError(null);
    setIsLoading(true);
    getProfile(userId, session?.token)
      .then((data) => {
        if (cancelled) return;
        const extra = data.lastAchievementGrants;
        setProfile(stripAchievementGrantsFromProfile(data));
        if (extra?.grants?.length) {
          setAchievementRewardModal({
            grants: extra.grants,
            totalGrantedUsd: extra.totalGrantedUsd ?? 0,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(extractErrorMessage(err, 'Error al cargar perfil'));
          setProfile(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, session?.token]);

  const closeSettingsModal = React.useCallback(() => {
    setShowSettingsModal(false);
    setDeleteError(null);
  }, []);

  const clearDeleteError = React.useCallback(() => {
    setDeleteError(null);
  }, []);

  const closeAddFriendsModal = React.useCallback(() => {
    setShowAddFriendsModal(false);
    setSearchFriendsValue('');
    setSearchResults([]);
    setSearchError(null);
    setSuggestedUsers([]);
    setSuggestedError(null);
    setRequestedIds(new Set());
  }, []);

  const closeRequestsModal = React.useCallback(() => {
    setShowRequestsModal(false);
    setPendingRequests([]);
    setPendingError(null);
  }, []);

  const closeFriendsModal = React.useCallback(() => {
    setShowFriendsModal(false);
    setFriendsList([]);
    setFriendsError(null);
  }, []);

  const handleSelectFriend = React.useCallback(
    (userId: string) => {
      setFriendUserId(userId);
      setShowFriendProfileModal(true);
      setFriendProfile(null);
      setFriendProfileError(null);
      setFriendProfileLoading(true);
      getProfile(userId, session?.token)
        .then((data) => setFriendProfile(data))
        .catch((err) => {
          setFriendProfileError(
            extractErrorMessage(err, 'Error al cargar perfil'),
          );
          setFriendProfile(null);
        })
        .finally(() => setFriendProfileLoading(false));
    },
    [session?.token],
  );

  const closeFriendProfileModal = React.useCallback(() => {
    setShowFriendProfileModal(false);
    setFriendUserId(null);
    setFriendProfile(null);
    setFriendProfileError(null);
  }, []);

  React.useEffect(() => {
    const token = session?.token;
    if (!token || !showRequestsModal) return;
    setPendingLoading(true);
    setPendingError(null);
    relationshipsService
      .getPendingRequests(token)
      .then((res) => setPendingRequests(res.items))
      .catch((err) => {
        setPendingRequests([]);
        setPendingError(
          err instanceof Error ? err.message : 'Error al cargar solicitudes',
        );
      })
      .finally(() => setPendingLoading(false));
  }, [session?.token, showRequestsModal]);

  React.useEffect(() => {
    const token = session?.token;
    if (!token || !showFriendsModal) return;
    setFriendsLoading(true);
    setFriendsError(null);
    relationshipsService
      .getFriends(token, '', 1, 50)
      .then((res) => setFriendsList(res.items))
      .catch((err) => {
        setFriendsList([]);
        setFriendsError(
          err instanceof Error ? err.message : 'Error al cargar amigos',
        );
      })
      .finally(() => setFriendsLoading(false));
  }, [session?.token, showFriendsModal]);

  const refetchProfile = React.useCallback(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    getProfile(userId, session?.token)
      .then((data) => {
        const extra = data.lastAchievementGrants;
        setProfile(stripAchievementGrantsFromProfile(data));
        if (extra?.grants?.length) {
          setAchievementRewardModal({
            grants: extra.grants,
            totalGrantedUsd: extra.totalGrantedUsd ?? 0,
          });
        }
      })
      .catch(() => {});
  }, [session?.user?.id, session?.token]);

  React.useEffect(() => {
    const unsubscribe = onProfileXpAwarded(refetchProfile);
    return unsubscribe;
  }, [refetchProfile]);

  const handleAcceptRequest = React.useCallback(
    (fromUserId: string) => {
      const token = session?.token;
      if (!token) return;
      setProcessingIds((prev) => new Set(prev).add(fromUserId));
      relationshipsService
        .acceptFriendship(fromUserId, token)
        .then(() => {
          setPendingRequests((prev) =>
            prev.filter((p) => p.userId !== fromUserId),
          );
          refetchProfile();
        })
        .catch(() => {
          setPendingError('Error al aceptar solicitud');
        })
        .finally(() => {
          setProcessingIds((prev) => {
            const next = new Set(prev);
            next.delete(fromUserId);
            return next;
          });
        });
    },
    [session?.token, refetchProfile],
  );

  const handleRejectRequest = React.useCallback(
    (fromUserId: string) => {
      const token = session?.token;
      if (!token) return;
      setProcessingIds((prev) => new Set(prev).add(fromUserId));
      relationshipsService
        .rejectFriendship(fromUserId, token)
        .then(() => {
          setPendingRequests((prev) =>
            prev.filter((p) => p.userId !== fromUserId),
          );
        })
        .catch(() => {
          setPendingError('Error al rechazar solicitud');
        })
        .finally(() => {
          setProcessingIds((prev) => {
            const next = new Set(prev);
            next.delete(fromUserId);
            return next;
          });
        });
    },
    [session?.token],
  );

  const handleRequestFriend = React.useCallback(
    (targetUserId: string) => {
      const token = session?.token;
      if (!token) return;
      if (requestedIds.has(targetUserId)) return;
      relationshipsService
        .requestFriendship(targetUserId, token)
        .then(() => {
          setRequestedIds((prev) => new Set(prev).add(targetUserId));
        })
        .catch((err) => {
          const msg =
            err instanceof Error && err.message.includes('already')
              ? null
              : 'Error al enviar solicitud';
          if (msg) setSearchError(msg);
          else setRequestedIds((prev) => new Set(prev).add(targetUserId));
        });
    },
    [session?.token, requestedIds],
  );

  React.useEffect(() => {
    const token = session?.token;
    if (!token || !showAddFriendsModal) return;
    const q = searchFriendsValue.trim();
    if (!q) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    const t = setTimeout(() => {
      setSearchLoading(true);
      setSearchError(null);
      searchProfiles(q, token, 1, 20)
        .then((res) => setSearchResults(res.items))
        .catch((err) => {
          setSearchResults([]);
          setSearchError(extractErrorMessage(err, 'Error al buscar usuarios'));
        })
        .finally(() => setSearchLoading(false));
    }, 350);
    return () => clearTimeout(t);
  }, [searchFriendsValue, session?.token, showAddFriendsModal]);

  React.useEffect(() => {
    const token = session?.token;
    if (!token || !showAddFriendsModal) return;
    if (searchFriendsValue.trim().length > 0) return;

    let cancelled = false;
    setSuggestedLoading(true);
    setSuggestedError(null);
    suggestProfilesForFriends(token, 50)
      .then((res) => {
        if (!cancelled) setSuggestedUsers(res.items);
      })
      .catch((err) => {
        if (!cancelled) {
          setSuggestedUsers([]);
          setSuggestedError(
            extractErrorMessage(err, 'Error al cargar recomendaciones'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setSuggestedLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.token, showAddFriendsModal, searchFriendsValue]);

  return {
    profile,
    isLoading,
    error,
    user: session?.user ?? null,
    showSettingsModal,
    setShowSettingsModal,
    closeSettingsModal,
    clearDeleteError,
    showAddFriendsModal,
    setShowAddFriendsModal,
    closeAddFriendsModal,
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
    friendUserId,
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
    searchFriendsValue,
    setSearchFriendsValue,
    searchResults,
    searchLoading,
    searchError,
    suggestedUsers,
    suggestedLoading,
    suggestedError,
    requestedIds,
    handleRequestFriend,
    handleSignOut,
    handleDeleteAccount,
    isDeleting,
    deleteError,
    refetchProfile,
    achievementRewardModal,
    closeAchievementRewardModal,
  };
}

export default useProfileViewModel;
