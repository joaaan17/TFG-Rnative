import React from 'react';
import { ScrollView, View } from 'react-native';

import AppShellComponent from '@/shared/components/layout/AppShell';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { Button } from '@/shared/components/ui/button';
import { Text } from '@/shared/components/ui/text';
import { CardModal } from '@/shared/components/card-modal';
import { FriendCard } from '@/shared/components/friend-card';

import { batallasStyles } from './Batallas.styles';
import { useBatallasViewModel } from '../state/useBatallasViewModel';

export function BatallasScreen() {
  const { typewriterKey, isStartBattleOpen, setStartBattleOpen } =
    useBatallasViewModel();

  return (
    <AppShellComponent>
      <View style={batallasStyles.container}>
        <View style={batallasStyles.body}>
          <View style={batallasStyles.header}>
            <TypewriterTextComponent
              key={typewriterKey}
              text="BATALLAS"
              speed={40}
              variant="h3"
              useDefaultFontFamily={true}
              className="border-0 pb-0"
            />
          </View>

          <View style={batallasStyles.footer}>
            <Button
              size="xl"
              style={batallasStyles.footerButton}
              textStyle={{ fontFamily: 'ArchivoBlack', fontSize: 18 }}
              onPress={() => setStartBattleOpen(true)}
            >
              <Text>INICIAR BATALLA</Text>
            </Button>
          </View>
        </View>

        <CardModal
          open={isStartBattleOpen}
          onClose={() => setStartBattleOpen(false)}
        >
          <View style={batallasStyles.modalHeader}>
            <Text variant="h3" style={{ fontFamily: 'ArchivoBlack' }}>
              INICIAR BATALLA
            </Text>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={batallasStyles.modalList}
            showsVerticalScrollIndicator={false}
          >
            <FriendCard name="Carlos" />
            <FriendCard name="Marta" />
            <FriendCard name="Lucía" />
            <FriendCard name="Álvaro" />
            <FriendCard name="Sofía" />
          </ScrollView>
        </CardModal>
      </View>
    </AppShellComponent>
  );
}

export default BatallasScreen;
