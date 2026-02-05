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

export type VerificationModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  code: string;
  onCodeChange: (code: string) => void;
  onVerify: () => Promise<void | unknown>;
  onResend: () => Promise<void>;
  isLoading?: boolean;
  isResending?: boolean;
  error?: string | null;
  timeRemaining?: number; // segundos restantes
};

export function VerificationModal({
  open,
  onClose,
  email,
  code,
  onCodeChange,
  onVerify,
  onResend,
  isLoading = false,
  isResending = false,
  error = null,
  timeRemaining = 0,
}: VerificationModalProps) {
  const palette = usePalette();
  const codeInputRef = React.useRef<any>(null);

  // Formatear tiempo restante (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (text: string) => {
    // Solo permitir números y máximo 6 dígitos
    const numericCode = text.replace(/[^0-9]/g, '').slice(0, 6);
    onCodeChange(numericCode);
  };

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
              <CardTitle className="text-xl">Verificar código</CardTitle>
              <CardDescription style={{ marginTop: 8 }}>
                Hemos enviado un código a {email}
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
            <Label htmlFor="verification-code">Código de verificación</Label>
            <Input
              ref={codeInputRef}
              id="verification-code"
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={6}
              style={{
                fontSize: 18,
                textAlign: 'center',
                letterSpacing: 8,
                fontWeight: '600',
                borderColor:
                  code.length === 6
                    ? AppColors.light.headerBackground
                    : palette.text,
                borderWidth: code.length === 6 ? 2 : 1,
              }}
              autoFocus
            />
          </View>

          {timeRemaining > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 14, color: palette.text }}>
                Código válido por: {formatTime(timeRemaining)}
              </Text>
            </View>
          )}

          {error && (
            <Text style={{ fontSize: 14, color: AppColors.light.destructive }}>
              {error}
            </Text>
          )}

          <Button
            className="w-full"
            variant={code.length === 6 ? 'default' : 'secondary'}
            onPress={onVerify}
            disabled={isLoading || code.length !== 6}
            style={
              code.length === 6
                ? { backgroundColor: AppColors.light.primary }
                : { backgroundColor: palette.surfaceMuted }
            }
          >
            {isLoading ? (
              <ActivityIndicator
                color={code.length === 6 ? palette.primaryText : palette.text}
              />
            ) : (
              <Text
                style={{
                  color: code.length === 6 ? palette.primaryText : palette.text,
                }}
              >
                Verificar código
              </Text>
            )}
          </Button>

          <Text className="text-center text-sm">
            ¿No recibiste el código?{' '}
            <Pressable
              onPress={onResend}
              disabled={isResending || timeRemaining > 0}
            >
              <Text
                className="text-sm underline underline-offset-4"
                style={{
                  opacity: isResending || timeRemaining > 0 ? 0.5 : 1,
                }}
              >
                {isResending ? 'Reenviando...' : 'Reenviar'}
              </Text>
            </Pressable>
          </Text>
        </CardContent>
      </View>
    </CardModal>
  );
}

export default VerificationModal;
