import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { CardModal } from '@/shared/components/card-modal';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { SearchBar } from '@/shared/components/ui/search-bar';
import { Text } from '@/shared/components/ui/text';
import { ProfileAvatar } from './profileAvatar';
import type { ProfileSearchItem } from '../types/profile.types';

export type AddFriendsModalProps = {
  open: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (text: string) => void;
  searchResults: ProfileSearchItem[];
  searchLoading: boolean;
  searchError: string | null;
  requestedIds: Set<string>;
  onRequestFriend: (targetUserId: string) => void;
};

function ProfileSearchCard({
  item,
  isRequested,
  onRequestPress,
}: {
  item: ProfileSearchItem;
  isRequested: boolean;
  onRequestPress: () => void;
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
          {item.username ? (
            <Text variant="muted">@{item.username}</Text>
          ) : null}
        </View>
        <View style={{ alignSelf: 'stretch', justifyContent: 'center' }}>
          {isRequested ? (
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 6,
                backgroundColor: 'rgba(128,128,128,0.15)',
                alignSelf: 'center',
                justifyContent: 'center',
                minHeight: 36,
              }}
            >
              <Text variant="muted" style={{ fontSize: 13 }}>
                Solicitado
              </Text>
            </View>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onPress={onRequestPress}
              style={{ minHeight: 36, alignSelf: 'flex-end' }}
            >
              <Text style={{ fontSize: 13 }}>Enviar solicitud</Text>
            </Button>
          )}
        </View>
      </CardContent>
    </Card>
  );
}

export function AddFriendsModal({
  open,
  onClose,
  searchValue,
  onSearchChange,
  searchResults,
  searchLoading,
  searchError,
  requestedIds,
  onRequestFriend,
}: AddFriendsModalProps) {
  const showResults =
    searchValue.trim().length > 0 && (searchLoading || searchResults.length > 0 || searchError);
  const showEmpty =
    searchValue.trim().length > 0 && !searchLoading && searchResults.length === 0 && !searchError;

  return (
    <CardModal open={open} onClose={onClose} maxHeightPct={0.7}>
      <View style={{ paddingHorizontal: 16, gap: 16, flex: 1 }}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Text variant="h4">Buscar amigos</Text>
        </View>
        <SearchBar
          value={searchValue}
          onChangeText={onSearchChange}
          placeholder="Buscar por nombre o usuario..."
          autoFocus={open}
        />
        {showResults ? (
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {searchLoading ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <ActivityIndicator size="small" />
              </View>
            ) : searchError ? (
              <Text variant="muted" style={{ textAlign: 'center', paddingVertical: 16 }}>
                {searchError}
              </Text>
            ) : showEmpty ? (
              <Text variant="muted" style={{ textAlign: 'center', paddingVertical: 16 }}>
                No se encontraron usuarios
              </Text>
            ) : (
              searchResults.map((item) => (
                <ProfileSearchCard
                  key={item.id}
                  item={item}
                  isRequested={requestedIds.has(item.id)}
                  onRequestPress={() => onRequestFriend(item.id)}
                />
              ))
            )}
          </ScrollView>
        ) : null}
      </View>
    </CardModal>
  );
}

export default AddFriendsModal;
