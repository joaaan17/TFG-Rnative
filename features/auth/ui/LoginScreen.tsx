// features/auth/LoginScreen.tsx
import React from 'react';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/shared/components/themed-view';
import { SignInForm } from '@/features/auth/components/sign-form';
import { loginStyles } from './Login.styles';

export function LoginScreen() {
  const router = useRouter();

  return (
    <ThemedView style={loginStyles.container}>
      <SignInForm
        onContinue={() => {
          router.replace('/main');
        }}
      />
    </ThemedView>
  );
}

export default LoginScreen;
