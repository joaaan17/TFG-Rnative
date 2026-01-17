import { Image, Platform, View } from 'react-native';

import { Button } from '@/shared/components/ui/button';
import { usePalette } from '@/shared/hooks/use-palette';
import { cn } from '@/lib/utils';

const SOCIAL_CONNECTION_STRATEGIES = [
  {
    type: 'oauth_google',
    source: { uri: 'https://img.clerk.com/static/google.png?width=160' },
    useTint: false,
  },
];

export function SocialConnections() {
  const palette = usePalette();

  return (
    <View className="gap-2 sm:flex-row sm:gap-3">
      {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => {
        return (
          <Button
            key={strategy.type}
            variant="outline"
            size="sm"
            className="sm:flex-1"
            onPress={() => {
              // TODO: Authenticate with social provider and navigate to protected screen if successful
            }}
          >
            <Image
              className={cn(
                'size-4',
                strategy.useTint && Platform.select({ web: 'dark:invert' }),
              )}
              tintColor={
                strategy.useTint
                  ? Platform.select({
                      native: palette.text,
                      default: undefined,
                    })
                  : undefined
              }
              source={strategy.source}
            />
          </Button>
        );
      })}
    </View>
  );
}

export default SocialConnections;
