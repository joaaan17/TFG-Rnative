import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Text } from '@/shared/components/ui/text';
import * as React from 'react';
import { ActivityIndicator, Pressable, type TextInput, View } from 'react-native';

import { SocialConnections } from './social-connections';

export type SignInFormProps = {
  email?: string;
  password?: string;
  onEmailChange?: (value: string) => void;
  onPasswordChange?: (value: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onSubmit?: () => void | Promise<void>;
  /**
   * Legacy: antes el formulario solo disparaba navegación.
   * Mantenido para no romper usos existentes.
   */
  onContinue?: () => void;
};

export function SignInForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  isLoading,
  error,
  onSubmit,
  onContinue,
}: SignInFormProps) {
  const passwordInputRef = React.useRef<TextInput>(null);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function handleSubmit() {
    if (onSubmit) {
      await onSubmit();
      return;
    }
    onContinue?.();
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5 rounded-t-xl !rounded-b-none">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">
            Inicia sesión
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            ¡Bienvenido de nuevo! Por favor, inicia sesión para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="m@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                value={email}
                onChangeText={onEmailChange}
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Contraseña</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                  onPress={() => {
                    // TODO: Navigate to forgot password screen
                  }}
                >
                  <Text className="font-normal leading-4">
                    ¿Olvidaste tu contraseña?
                  </Text>
                </Button>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                returnKeyType="send"
                value={password}
                onChangeText={onPasswordChange}
                onSubmitEditing={handleSubmit}
              />
            </View>
            {error ? (
              <Text className="text-sm text-red-500">{error}</Text>
            ) : null}
            <Button
              className="w-full"
              onPress={handleSubmit}
              disabled={Boolean(isLoading)}
            >
              {isLoading ? <ActivityIndicator /> : <Text>Continue</Text>}
            </Button>
          </View>
          <Text className="text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Pressable
              onPress={() => {
                // TODO: Navigate to sign up screen
              }}
            >
              <Text className="text-sm underline underline-offset-4">
                Registrate
              </Text>
            </Pressable>
          </Text>
          <SocialConnections />
        </CardContent>
      </Card>
    </View>
  );
}

export default SignInForm;
