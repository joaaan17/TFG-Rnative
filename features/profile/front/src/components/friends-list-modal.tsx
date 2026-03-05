import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { CardModal } from '@/shared/components/card-modal';
import { ModalHeader } from '@/shared/components/modal-header';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Text } from '@/shared/components/ui/text';
import { ProfileAvatar } from './profileAvatar';
import type { PendingRequestItem } from '@/features/relationships/front/src/services/relationshipsService';

export type FriendsListModalProps = {
  open: boolean;
  onClose: () => void;
  items: PendingRequestItem[];
  loading: boolean;
  error: string | null;
  onSelectFriend?: (userId: string) => void;
};

function FriendCard({
  item,
  onPress,
}: {
  item: PendingRequestItem;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card style={{ marginBottom: 8, paddingVertical: 4 }}>
        <CardContent
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 8,
          }}
        >
          <ProfileAvatar size={44} iconOnly imageUri={item.avatarUrl} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="default" style={{ fontWeight: '600' }}>
              {item.name}
            </Text>
            {item.username ? (
              <Text variant="muted">@{item.username}</Text>
            ) : null}
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

export function FriendsListModal({
  open,
  onClose,
  items,
  loading,
  error,
  onSelectFriend,
}: FriendsListModalProps) {
  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.7}
      contentNoPaddingTop
    >
      <ModalHeader
        title="Mis amigos"
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
            No tienes amigos agregados
          </Text>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {items.map((item) => (
              <FriendCard
                key={item.userId}
                item={item}
                onPress={() => onSelectFriend?.(item.userId)}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </CardModal>
  );
}

export default FriendsListModal;
