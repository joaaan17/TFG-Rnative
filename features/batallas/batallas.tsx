import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, View } from 'react-native';

import AppShellComponent from '@/shared/components/layout/AppShell';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { Button } from '@/shared/components/ui/button';
import { Text } from '@/shared/components/ui/text';
import { CardModal } from '@/shared/components/card-modal';
import { FriendCard } from '@/shared/components/friend-card';
import { Hierarchy } from '@/design-system/typography';

import { batallasStyles } from './batallasStyles';

export function BatallasScreen() {
  const [typewriterKey, setTypewriterKey] = React.useState(0);
  const [isStartBattleOpen, setIsStartBattleOpen] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setTypewriterKey((k) => k + 1);
      return undefined;
    }, []),
  );

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
              textStyle={[Hierarchy.action, { fontSize: 18 }]}
              onPress={() => setIsStartBattleOpen(true)}
            >
              <Text>INICIAR BATALLA</Text>
            </Button>
          </View>
        </View>

        <CardModal
          open={isStartBattleOpen}
          onClose={() => setIsStartBattleOpen(false)}
        >
          <View style={batallasStyles.modalHeader}>
            <Text variant="h3" style={Hierarchy.titleModalLarge}>
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
