import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { CardModal } from '@/shared/components/card-modal';
import { ModalHeader } from '@/shared/components/modal-header';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Text } from '@/shared/components/ui/text';
import { ProfileAvatar } from './profileAvatar';
import type { PendingRequestItem } from '@/features/relationships/front/src/services/relationshipsService';

export type PendingRequestsModalProps = {
  open: boolean;
  onClose: () => void;
  items: PendingRequestItem[];
  loading: boolean;
  error: string | null;
  onAccept: (fromUserId: string) => void;
  onReject: (fromUserId: string) => void;
  processingIds: Set<string>;
};

function PendingRequestCard({
  item,
  onAccept,
  onReject,
  isProcessing,
}: {
  item: PendingRequestItem;
  onAccept: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  return (
    <Card style={{ marginBottom: 8, paddingVertical: 4 }}>
      <CardContent
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 8,
        }}
      >
        <ProfileAvatar size={44} iconOnly />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="default" style={{ fontWeight: '600' }}>
            {item.name}
          </Text>
          {item.username ? <Text variant="muted">@{item.username}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Button
            size="sm"
            variant="outline"
            onPress={onAccept}
            disabled={isProcessing}
            style={{ minHeight: 36 }}
          >
            <Text style={{ fontSize: 13 }}>Aceptar</Text>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onPress={onReject}
            disabled={isProcessing}
            style={{ minHeight: 36 }}
          >
            <Text style={{ fontSize: 13 }}>Rechazar</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}

export function PendingRequestsModal({
  open,
  onClose,
  items,
  loading,
  error,
  onAccept,
  onReject,
  processingIds,
}: PendingRequestsModalProps) {
  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.7}
      contentNoPaddingTop
    >
      <ModalHeader
        title="Solicitudes de amistad"
        onBack={onClose}
        onClose={onClose}
        backAccessibilityLabel="Volver"
      />
      <View style={{ paddingHorizontal: 16, gap: 16, flex: 1 }}>
        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" />
          </View>
        ) : error ? (
          <Text
            variant="muted"
            style={{ textAlign: 'center', paddingVertical: 16 }}
          >
            {error}
          </Text>
        ) : items.length === 0 ? (
          <Text
            variant="muted"
            style={{ textAlign: 'center', paddingVertical: 16 }}
          >
            No tienes solicitudes pendientes
          </Text>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {items.map((item) => (
              <PendingRequestCard
                key={item.userId}
                item={item}
                onAccept={() => onAccept(item.userId)}
                onReject={() => onReject(item.userId)}
                isProcessing={processingIds.has(item.userId)}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </CardModal>
  );
}

export default PendingRequestsModal;
