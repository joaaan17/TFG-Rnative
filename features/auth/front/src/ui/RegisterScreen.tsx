import React from 'react';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/shared/components/themed-view';
import { loginStyles } from './Login.styles';

import { SignInForm } from '../components/sign-form';
import { VerificationModal } from '../components/verification-modal';
import { useAuthViewModel } from '../state/useAuthViewModel';
import { useVerificationViewModel } from '../state/useVerificationViewModel';
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

  const [showVerificationModal, setShowVerificationModal] =
    React.useState(false);
  const [registeredEmail, setRegisteredEmail] = React.useState('');

  const verification = useVerificationViewModel(registeredEmail, 'register');

  // Modificar handleRegister para mostrar el modal en lugar de auto-login
  const handleRegisterWithVerification = React.useCallback(async () => {
    const cleanName = name.trim();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (
      !cleanName ||
      !cleanUsername ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    // Llamar al handleRegister original
    await handleRegister();
    // Si llegamos aquí sin error, el registro fue exitoso
    // Mostrar modal de verificación
    setRegisteredEmail(cleanEmail);
    setShowVerificationModal(true);
  }, [name, username, email, password, confirmPassword, handleRegister]);

  React.useEffect(() => {
    if (isRestoring) return;
    if (session) {
      router.replace('/main');
    }
  }, [isRestoring, router, session]);

  // Cerrar modal cuando la verificación sea exitosa (session se actualiza)
  React.useEffect(() => {
    if (session && showVerificationModal) {
      setShowVerificationModal(false);
    }
  }, [session, showVerificationModal]);

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
        onSubmit={handleRegisterWithVerification}
        onGoToLogin={() => {
          router.replace('/');
        }}
      />

      <VerificationModal
        open={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={registeredEmail}
        code={verification.code}
        onCodeChange={verification.setCode}
        onVerify={async () => {
          await verification.handleVerify();
        }}
        onResend={verification.handleResend}
        isLoading={verification.isLoading}
        isResending={verification.isResending}
        error={verification.error}
        timeRemaining={verification.timeRemaining}
      />
    </ThemedView>
  );
}

export default RegisterScreen;
