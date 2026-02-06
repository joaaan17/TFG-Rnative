import { StyleSheet } from 'react-native';
import AppColors from '@/design-system/colors';

export const iaPreguntasStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  helloText: {
    textAlign: 'center',
    color: AppColors.light.primary,
    marginBottom: 8,
  },
  welcomeText: {
    color: AppColors.light.icon,
    textAlign: 'center',
  },
  chatAreaWrapper: {
    flex: 1,
    position: 'relative',
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chatContent: {
    paddingBottom: 16,
  },
  inputArea: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputFlex: {
    flex: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: AppColors.light.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: AppColors.light.primary,
  },
  sendButtonText: {
    color: AppColors.light.primaryText,
    fontSize: 16,
  },
  errorText: {
    color: AppColors.light.primary,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
