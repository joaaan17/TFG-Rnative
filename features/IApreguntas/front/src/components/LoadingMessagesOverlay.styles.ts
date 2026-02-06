import { StyleSheet } from 'react-native';
import AppColors from '@/design-system/colors';

export const loadingOverlayStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerInline: {
    position: 'relative',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    paddingVertical: 4,
    marginLeft: 0,
  },
  messageBox: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    maxWidth: '90%',
  },
  messageBoxInline: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 4,
    backgroundColor: AppColors.light.cardBackground,
    borderWidth: 1,
    borderColor: AppColors.light.surfaceBorder,
  },
  messageText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'left',
  },
});
