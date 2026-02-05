import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { CardModal } from '@/shared/components/card-modal';
import { Button } from '@/shared/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Text } from '@/shared/components/ui/text';
import AppColors from '@/design-system/colors';
import { usePalette } from '@/shared/hooks/use-palette';

export type ResetPasswordModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onSubmit: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
};

export function ResetPasswordModal({
  open,
  onClose,
  email,
  code,
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  isLoading = false,
  error = null,
}: ResetPasswordModalProps) {
  const palette = usePalette();
  const passwordInputRef = React.useRef<any>(null);
  const confirmPasswordInputRef = React.useRef<any>(null);

  const isFormValid = password.length > 0 && password === confirmPassword;

  const handleSubmit = React.useCallback(async () => {
    if (!isFormValid) {
      return;
    }
    await onSubmit();
  }, [isFormValid, onSubmit]);

  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.9}
      closeOnBackdropPress={false}
    >
      <View style={{ padding: 20, gap: 20 }}>
        <CardHeader style={{ paddingHorizontal: 0, paddingTop: 0 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ flex: 1 }}>
              <CardTitle className="text-xl">Restablecer contraseña</CardTitle>
              <CardDescription style={{ marginTop: 8 }}>
                Ingresa tu nueva contraseña para {email}
              </CardDescription>
            </View>
            <Pressable
              onPress={onClose}
              style={{
                width: 24,
                height: 24,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18, color: palette.text }}>✕</Text>
            </Pressable>
          </View>
        </CardHeader>

        <CardContent style={{ paddingHorizontal: 0, gap: 16 }}>
          <View style={{ gap: 8 }}>
            <Label htmlFor="reset-password">Nueva contraseña</Label>
            <Input
              ref={passwordInputRef}
              id="reset-password"
              value={password}
              onChangeText={onPasswordChange}
              placeholder="Tu nueva contraseña"
              secureTextEntry
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Label htmlFor="reset-confirm-password">
              Confirmar nueva contraseña
            </Label>
            <Input
              ref={confirmPasswordInputRef}
              id="reset-confirm-password"
              value={confirmPassword}
              onChangeText={onConfirmPasswordChange}
              placeholder="Repite tu nueva contraseña"
              secureTextEntry
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {password.length > 0 &&
            confirmPassword.length > 0 &&
            password !== confirmPassword && (
              <Text
                style={{ fontSize: 14, color: AppColors.light.destructive }}
              >
                Las contraseñas no coinciden
              </Text>
            )}

          {error && (
            <Text style={{ fontSize: 14, color: AppColors.light.destructive }}>
              {error}
            </Text>
          )}

          <Button
            className="w-full"
            variant="default"
            onPress={handleSubmit}
            disabled={isLoading || !isFormValid}
            style={{
              backgroundColor: isFormValid
                ? AppColors.light.primary
                : palette.surfaceMuted,
            }}
          >
            {isLoading ? (
              <ActivityIndicator
                color={isFormValid ? palette.primaryText : palette.text}
              />
            ) : (
              <Text
                style={{
                  color: isFormValid ? palette.primaryText : palette.text,
                }}
              >
                Cambiar contraseña
              </Text>
            )}
          </Button>
        </CardContent>
      </View>
    </CardModal>
  );
}

export default ResetPasswordModal;
