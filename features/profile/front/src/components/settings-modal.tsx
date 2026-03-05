import React from 'react';
import { ScrollView, View } from 'react-native';

import { CardModal } from '@/shared/components/card-modal';
import { ModalHeader } from '@/shared/components/modal-header';
import { Button } from '@/shared/components/ui/button';
import { Text } from '@/shared/components/ui/text';

import type { AuthUser } from '@/features/auth/front/src/types/auth.types';
import type { ProfileUser } from '../types/profile.types';

/**
 * Modal presentacional. Solo muestra datos, emite eventos y gestiona estado visual
 * (confirmación de borrado, loading). No conoce navegación ni qué ocurre tras sign out.
 */
export type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
  user: AuthUser | null;
  profile: ProfileUser | null;
  onRequestSignOut: () => void | Promise<void>;
  onConfirmDelete: () => void | Promise<boolean>;
  onCancelDelete: () => void;
  isDeleting: boolean;
  deleteError: string | null;
};

function formatJoinedYear(joinedAt?: string): string {
  if (!joinedAt) return '—';
  return new Date(joinedAt).getFullYear().toString();
}

export function SettingsModal({
  open,
  onClose,
  user,
  profile,
  onRequestSignOut,
  onConfirmDelete,
  onCancelDelete,
  isDeleting,
  deleteError,
}: SettingsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleSignOut = React.useCallback(async () => {
    await onRequestSignOut();
  }, [onRequestSignOut]);

  const handlePressDeleteAccount = React.useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleCancelDelete = React.useCallback(() => {
    setShowDeleteConfirm(false);
    onCancelDelete();
  }, [onCancelDelete]);

  const handleConfirmDelete = React.useCallback(async () => {
    const ok = await onConfirmDelete();
    if (ok) setShowDeleteConfirm(false);
  }, [onConfirmDelete]);

  const displayName = profile?.name ?? user?.name ?? '—';
  const displayUsername = profile?.username ? `@${profile.username}` : '—';
  const displayEmail = user?.email ?? '—';
  const displayJoined = formatJoinedYear(profile?.joinedAt);

  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.75}
      contentNoPaddingTop
    >
      <ModalHeader
        title="Ajustes"
        onBack={onClose}
        onClose={onClose}
        backAccessibilityLabel="Volver"
      />
      <ScrollView
        style={{ paddingHorizontal: 16, flexGrow: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 12, marginBottom: 24 }}>
          <View>
            <Text variant="muted" style={{ fontSize: 12, marginBottom: 2 }}>
              Nombre
            </Text>
            <Text variant="default">{displayName}</Text>
          </View>
          <View>
            <Text variant="muted" style={{ fontSize: 12, marginBottom: 2 }}>
              Usuario
            </Text>
            <Text variant="default">{displayUsername}</Text>
          </View>
          <View>
            <Text variant="muted" style={{ fontSize: 12, marginBottom: 2 }}>
              Email
            </Text>
            <Text variant="default">{displayEmail}</Text>
          </View>
          <View>
            <Text variant="muted" style={{ fontSize: 12, marginBottom: 2 }}>
              Se unió en
            </Text>
            <Text variant="default">{displayJoined}</Text>
          </View>
        </View>

        {deleteError ? (
          <Text
            variant="default"
            style={{ color: '#dc2626', marginBottom: 12, fontSize: 14 }}
          >
            {deleteError}
          </Text>
        ) : null}

        <View style={{ gap: 12 }}>
          <Button
            variant="outline"
            onPress={handleSignOut}
            disabled={isDeleting}
          >
            <Text>Cerrar sesión</Text>
          </Button>
          <Button
            variant="destructive"
            onPress={handlePressDeleteAccount}
            disabled={isDeleting}
          >
            <Text>{isDeleting ? 'Eliminando...' : 'Eliminar cuenta'}</Text>
          </Button>
        </View>
      </ScrollView>

      <CardModal
        open={showDeleteConfirm}
        onClose={handleCancelDelete}
        maxHeightPct={0.35}
        closeOnBackdropPress={!isDeleting}
      >
        <View style={{ paddingHorizontal: 16, gap: 20 }}>
          <Text
            variant="default"
            style={{ textAlign: 'center', fontSize: 16, lineHeight: 24 }}
          >
            ¿Está seguro que quiere eliminar la cuenta?
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              justifyContent: 'center',
            }}
          >
            <Button
              variant="outline"
              onPress={handleCancelDelete}
              disabled={isDeleting}
              style={{ flex: 1 }}
            >
              <Text>Cancelar</Text>
            </Button>
            <Button
              variant="destructive"
              onPress={handleConfirmDelete}
              disabled={isDeleting}
              style={{ flex: 1 }}
            >
              <Text>{isDeleting ? 'Eliminando...' : 'Eliminar'}</Text>
            </Button>
          </View>
        </View>
      </CardModal>
    </CardModal>
  );
}

export default SettingsModal;
