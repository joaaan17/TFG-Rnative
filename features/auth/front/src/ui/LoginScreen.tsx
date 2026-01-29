import React from 'react';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/shared/components/themed-view';
import { loginStyles } from './Login.styles';

import { SignInForm } from '../components/sign-form';
import { useAuthSession } from '../state/AuthContext';
import { useAuthViewModel } from '../state/useAuthViewModel';

export function LoginScreen() {
  const router = useRouter();
  const { session, isRestoring } = useAuthSession();
  const {
    email,
    password,
    setEmail,
    setPassword,
    isLoading,
    error,
    handleLogin,
  } = useAuthViewModel();

  React.useEffect(() => {
    if (isRestoring) return;
    if (session) {
      router.replace('/main');
    }
  }, [isRestoring, router, session]);

  return (
    <ThemedView style={loginStyles.container}>
      <SignInForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        isLoading={isLoading}
        error={error}
        onSubmit={handleLogin}
      />
    </ThemedView>
  );
}

export default LoginScreen;
