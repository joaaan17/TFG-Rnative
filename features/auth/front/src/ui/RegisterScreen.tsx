import React from 'react';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/shared/components/themed-view';
import { loginStyles } from './Login.styles';

import { SignInForm } from '../components/sign-form';
import { useAuthViewModel } from '../state/useAuthViewModel';
import { useAuthSession } from '../state/AuthContext';

export function RegisterScreen() {
  const router = useRouter();
  const { session, isRestoring } = useAuthSession();
  const {
    name,
    username,
    email,
    password,
    confirmPassword,
    setName,
    setUsername,
    setEmail,
    setPassword,
    setConfirmPassword,
    isLoading,
    error,
    handleRegister,
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
        isRegister
        name={name}
        username={username}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        onNameChange={setName}
        onUsernameChange={setUsername}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onConfirmPasswordChange={setConfirmPassword}
        isLoading={isLoading}
        error={error}
        onSubmit={handleRegister}
        onGoToLogin={() => {
          router.replace('/');
        }}
      />
    </ThemedView>
  );
}

export default RegisterScreen;
