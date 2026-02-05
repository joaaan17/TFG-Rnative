import React from 'react';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/shared/components/themed-view';
import { loginStyles } from './Login.styles';

import { SignInForm } from '../components/sign-form';
import { ForgotPasswordModal } from '../components/forgot-password-modal';
import { VerificationModal } from '../components/verification-modal';
import { ResetPasswordModal } from '../components/reset-password-modal';
import { useAuthSession } from '../state/AuthContext';
import { useAuthViewModel } from '../state/useAuthViewModel';
import { useVerificationViewModel } from '../state/useVerificationViewModel';
import { useResetPasswordViewModel } from '../state/useResetPasswordViewModel';
import { authClient } from '../api/authClient';

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
    forgotPasswordEmail,
    setForgotPasswordEmail,
    isSendingResetCode,
    forgotPasswordError,
    handleSendResetCode,
  } = useAuthViewModel();

  const [showForgotPasswordModal, setShowForgotPasswordModal] =
    React.useState(false);
  const [showVerificationModal, setShowVerificationModal] =
    React.useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] =
    React.useState(false);
  const [verifiedCode, setVerifiedCode] = React.useState('');

  // ViewModel para el modal de verificación (reutilizado)
  // Usar modo 'reset-password' para que NO haga login automáticamente
  const verification = useVerificationViewModel(
    forgotPasswordEmail,
    'reset-password',
  );

  // ViewModel para el modal de reset password
  const resetPassword = useResetPasswordViewModel(
    forgotPasswordEmail,
    verifiedCode,
  );

  React.useEffect(() => {
    if (isRestoring) return;
    if (session) {
      router.replace('/main');
    }
  }, [isRestoring, router, session]);

  // Cerrar modales cuando la sesión se establece (solo para registro, no para reset)
  React.useEffect(() => {
    if (session && showVerificationModal && !showResetPasswordModal) {
      setShowVerificationModal(false);
      setShowForgotPasswordModal(false);
    }
  }, [session, showVerificationModal, showResetPasswordModal]);

  const handleForgotPassword = React.useCallback(() => {
    // Pre-llenar el email si ya está escrito
    if (email) {
      setForgotPasswordEmail(email);
    }
    setShowForgotPasswordModal(true);
  }, [email, setForgotPasswordEmail]);

  const handleCloseForgotPassword = React.useCallback(() => {
    setShowForgotPasswordModal(false);
    // Limpiar el email cuando se cierra el modal
    setForgotPasswordEmail('');
  }, [setForgotPasswordEmail]);

  const handleSendCode = React.useCallback(async () => {
    try {
      await handleSendResetCode();
      // Si el código se envía exitosamente, cerrar el modal de "Olvidaste tu contraseña"
      // y abrir el modal de verificación
      setShowForgotPasswordModal(false);
      setShowVerificationModal(true);
    } catch {
      // El error ya se maneja en useAuthViewModel
    }
  }, [handleSendResetCode]);

  const handleVerifyCode = React.useCallback(async () => {
    try {
      // Para recuperación de contraseña, usar el endpoint específico
      // que NO marca al usuario como verificado
      const cleanCode = verification.code.trim();
      if (cleanCode.length !== 6) {
        return;
      }

      await authClient.verifyPasswordResetCode(forgotPasswordEmail, cleanCode);

      // Si la verificación es exitosa, guardar el código y abrir el modal de reset
      setVerifiedCode(cleanCode);
      setShowVerificationModal(false);
      setShowResetPasswordModal(true);
    } catch {
      // El error ya se maneja en verification.error
    }
  }, [verification, forgotPasswordEmail]);

  const handleResendCode = React.useCallback(async () => {
    await verification.handleResend();
  }, [verification]);

  const handleResetPassword = React.useCallback(async () => {
    try {
      await resetPassword.handleResetPassword();
      // Si el reset es exitoso, cerrar todos los modales y redirigir al login
      setShowResetPasswordModal(false);
      setShowVerificationModal(false);
      setShowForgotPasswordModal(false);
      setForgotPasswordEmail('');
      setVerifiedCode('');
      // Mostrar mensaje de éxito o redirigir directamente
      // El usuario ahora puede iniciar sesión con su nueva contraseña
    } catch {
      // El error ya se maneja en resetPassword.error
    }
  }, [resetPassword, setForgotPasswordEmail]);

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
        onGoToRegister={() => {
          router.push('/register');
        }}
        onForgotPassword={handleForgotPassword}
      />

      <ForgotPasswordModal
        open={showForgotPasswordModal}
        onClose={handleCloseForgotPassword}
        email={forgotPasswordEmail}
        onEmailChange={setForgotPasswordEmail}
        onSendCode={handleSendCode}
        onGoToLogin={() => {
          setShowForgotPasswordModal(false);
        }}
        isLoading={isSendingResetCode}
        error={forgotPasswordError}
      />

      <VerificationModal
        open={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setShowForgotPasswordModal(false);
        }}
        email={forgotPasswordEmail}
        code={verification.code}
        onCodeChange={verification.setCode}
        onVerify={handleVerifyCode}
        onResend={handleResendCode}
        isLoading={verification.isLoading}
        isResending={verification.isResending}
        error={verification.error}
        timeRemaining={verification.timeRemaining}
      />

      <ResetPasswordModal
        open={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setShowVerificationModal(false);
          setShowForgotPasswordModal(false);
          setForgotPasswordEmail('');
          setVerifiedCode('');
        }}
        email={forgotPasswordEmail}
        code={verifiedCode}
        password={resetPassword.password}
        confirmPassword={resetPassword.confirmPassword}
        onPasswordChange={resetPassword.setPassword}
        onConfirmPasswordChange={resetPassword.setConfirmPassword}
        onSubmit={handleResetPassword}
        isLoading={resetPassword.isLoading}
        error={resetPassword.error}
      />
    </ThemedView>
  );
}

export default LoginScreen;
