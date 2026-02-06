import React from 'react';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/shared/components/themed-view';
import { loginStyles } from './Login.styles';

import { SignInForm } from '../components/sign-form';
import { ForgotPasswordModal } from '../components/forgot-password-modal';
import { VerificationModal } from '../components/verification-modal';
import { ResetPasswordModal } from '../components/reset-password-modal';
import { useAuthSession } from '../state/AuthContext';
import { useLoginFlowViewModel } from '../state/useLoginFlowViewModel';

export function LoginScreen() {
  const router = useRouter();
  const { session, isRestoring } = useAuthSession();
  const vm = useLoginFlowViewModel();

  React.useEffect(() => {
    if (isRestoring) return;
    if (session) router.replace('/main');
  }, [isRestoring, router, session]);

  return (
    <ThemedView style={loginStyles.container}>
      <SignInForm
        email={vm.email}
        password={vm.password}
        onEmailChange={vm.setEmail}
        onPasswordChange={vm.setPassword}
        isLoading={vm.isLoading}
        error={vm.error}
        onSubmit={vm.handleLogin}
        onGoToRegister={() => router.push('/register')}
        onForgotPassword={() => vm.openForgotPassword(vm.email)}
      />

      <ForgotPasswordModal
        open={vm.showForgotPasswordModal}
        onClose={vm.closeForgotPassword}
        email={vm.forgotPasswordEmail}
        onEmailChange={vm.setForgotPasswordEmail}
        onSendCode={vm.sendResetCode}
        onGoToLogin={vm.closeForgotPassword}
        isLoading={vm.isSendingResetCode}
        error={vm.resetFlowError}
      />

      <VerificationModal
        open={vm.showVerificationModal}
        onClose={vm.closeVerifyModal}
        email={vm.forgotPasswordEmail}
        code={vm.verificationCode}
        onCodeChange={vm.setVerificationCode}
        onVerify={vm.verifyCode}
        onResend={vm.resendCode}
        isLoading={vm.isVerifyingCode}
        isResending={vm.isResendingCode}
        error={vm.resetFlowError}
        timeRemaining={vm.verificationTimeRemaining}
      />

      <ResetPasswordModal
        open={vm.showResetPasswordModal}
        onClose={vm.closeResetModal}
        email={vm.forgotPasswordEmail}
        code={vm.verifiedCode}
        password={vm.resetPasswordVm.password}
        confirmPassword={vm.resetPasswordVm.confirmPassword}
        onPasswordChange={vm.resetPasswordVm.setPassword}
        onConfirmPasswordChange={vm.resetPasswordVm.setConfirmPassword}
        onSubmit={vm.resetPassword}
        isLoading={vm.resetPasswordVm.isLoading}
        error={vm.resetPasswordVm.error}
      />
    </ThemedView>
  );
}

export default LoginScreen;
