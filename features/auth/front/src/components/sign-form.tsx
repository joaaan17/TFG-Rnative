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
import {
  ActivityIndicator,
  Pressable,
  type TextInput,
  View,
} from 'react-native';

import { SocialConnections } from './social-connections';

export type SignInFormProps = {
  isRegister?: boolean;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  onNameChange?: (value: string) => void;
  onUsernameChange?: (value: string) => void;
  onEmailChange?: (value: string) => void;
  onPasswordChange?: (value: string) => void;
  onConfirmPasswordChange?: (value: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onSubmit?: () => void | Promise<void>;
  onGoToRegister?: () => void;
  onGoToLogin?: () => void;
  onForgotPassword?: () => void;
  /**
   * Legacy: antes el formulario solo disparaba navegación.
   * Mantenido para no romper usos existentes.
   */
  onContinue?: () => void;
};

export function SignInForm({
  isRegister,
  name,
  username,
  email,
  password,
  confirmPassword,
  onNameChange,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  isLoading,
  error,
  onSubmit,
  onGoToRegister,
  onGoToLogin,
  onForgotPassword,
  onContinue,
}: SignInFormProps) {
  const nameInputRef = React.useRef<TextInput>(null);
  const usernameInputRef = React.useRef<TextInput>(null);
  const emailInputRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onNameSubmitEditing() {
    if (isRegister) usernameInputRef.current?.focus();
  }

  function onUsernameSubmitEditing() {
    emailInputRef.current?.focus();
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
            {isRegister ? 'Crear cuenta' : 'Inicia sesión'}
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            {isRegister
              ? 'Regístrate para empezar a usar la app'
              : '¡Bienvenido de nuevo! Por favor, inicia sesión para continuar'}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            {isRegister ? (
              <>
                <View className="gap-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    ref={nameInputRef}
                    id="name"
                    placeholder="Tu nombre"
                    autoCapitalize="words"
                    value={name}
                    onChangeText={onNameChange}
                    onSubmitEditing={onNameSubmitEditing}
                    returnKeyType="next"
                    submitBehavior="submit"
                  />
                </View>
                <View className="gap-1.5">
                  <Label htmlFor="username">Usuario (@)</Label>
                  <Input
                    ref={usernameInputRef}
                    id="username"
                    placeholder="nombre_usuario"
                    autoCapitalize="none"
                    autoComplete="username"
                    value={username}
                    onChangeText={onUsernameChange}
                    onSubmitEditing={onUsernameSubmitEditing}
                    returnKeyType="next"
                    submitBehavior="submit"
                  />
                </View>
              </>
            ) : null}
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                ref={emailInputRef}
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
                {!isRegister ? (
                  <Button
                    variant="link"
                    size="sm"
                    className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                    onPress={() => {
                      onForgotPassword?.();
                    }}
                  >
                    <Text className="font-normal leading-4">
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </Button>
                ) : null}
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                returnKeyType={isRegister ? 'next' : 'send'}
                value={password}
                onChangeText={onPasswordChange}
                onSubmitEditing={
                  isRegister
                    ? () => confirmPasswordInputRef.current?.focus()
                    : handleSubmit
                }
              />
            </View>
            {isRegister ? (
              <View className="gap-1.5">
                <Label htmlFor="confirmPassword">Repetir contraseña</Label>
                <Input
                  ref={confirmPasswordInputRef}
                  id="confirmPassword"
                  secureTextEntry
                  returnKeyType="send"
                  value={confirmPassword}
                  onChangeText={onConfirmPasswordChange}
                  onSubmitEditing={handleSubmit}
                />
              </View>
            ) : null}
            {error ? (
              <Text className="text-sm text-red-500">{error}</Text>
            ) : null}
            <Button
              className="w-full"
              onPress={handleSubmit}
              disabled={Boolean(isLoading)}
            >
              {isLoading ? (
                <ActivityIndicator />
              ) : (
                <Text>{isRegister ? 'Registrarme' : 'Continue'}</Text>
              )}
            </Button>
          </View>
          <Text className="text-center text-sm">
            {isRegister ? (
              <>
                ¿Ya tienes una cuenta?{' '}
                <Pressable onPress={onGoToLogin}>
                  <Text className="text-sm underline underline-offset-4">
                    Inicia sesión
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                ¿No tienes una cuenta?{' '}
                <Pressable onPress={onGoToRegister}>
                  <Text className="text-sm underline underline-offset-4">
                    Registrate
                  </Text>
                </Pressable>
              </>
            )}
          </Text>
          <SocialConnections />
        </CardContent>
      </Card>
    </View>
  );
}

export default SignInForm;
