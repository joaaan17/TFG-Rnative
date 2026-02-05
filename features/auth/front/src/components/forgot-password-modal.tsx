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

export type ForgotPasswordModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  onEmailChange: (email: string) => void;
  onSendCode: () => Promise<void>;
  onGoToLogin: () => void;
  isLoading?: boolean;
  error?: string | null;
};

export function ForgotPasswordModal({
  open,
  onClose,
  email,
  onEmailChange,
  onSendCode,
  onGoToLogin,
  isLoading = false,
  error = null,
}: ForgotPasswordModalProps) {
  const palette = usePalette();
  const emailInputRef = React.useRef<any>(null);

  const handleSendCode = React.useCallback(async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return;
    }
    await onSendCode();
  }, [email, onSendCode]);

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
              <CardTitle className="text-xl">
                ¿Olvidaste tu contraseña?
              </CardTitle>
              <CardDescription style={{ marginTop: 8 }}>
                No te preocupes, te enviaremos un código para restablecerla
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
            <Label htmlFor="forgot-password-email">Email</Label>
            <Input
              ref={emailInputRef}
              id="forgot-password-email"
              value={email}
              onChangeText={onEmailChange}
              placeholder="nombre@email.com"
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              autoFocus
            />
          </View>

          {error && (
            <Text style={{ fontSize: 14, color: AppColors.light.destructive }}>
              {error}
            </Text>
          )}

          <Button
            className="w-full"
            variant="default"
            onPress={handleSendCode}
            disabled={isLoading || !email.trim()}
            style={{
              backgroundColor:
                isLoading || !email.trim()
                  ? palette.surfaceMuted
                  : AppColors.light.primary,
            }}
          >
            {isLoading ? (
              <ActivityIndicator
                color={
                  isLoading || !email.trim()
                    ? palette.text
                    : palette.primaryText
                }
              />
            ) : (
              <Text
                style={{
                  color:
                    isLoading || !email.trim()
                      ? palette.text
                      : palette.primaryText,
                }}
              >
                Enviar código
              </Text>
            )}
          </Button>

          <Text className="text-center text-sm">
            ¿Recordaste tu contraseña?{' '}
            <Pressable onPress={onGoToLogin}>
              <Text className="text-sm underline underline-offset-4">
                Inicia sesión
              </Text>
            </Pressable>
          </Text>
        </CardContent>
      </View>
    </CardModal>
  );
}

export default ForgotPasswordModal;
