import { StyleSheet } from 'react-native';
import AppColors from '@/design-system/colors';

export const loadingNewsOverlayStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '90%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: AppColors.light.cardBackground,
    borderWidth: 1,
    borderColor: AppColors.light.surfaceBorder,
  },
  text: {
    color: AppColors.light.text,
    fontSize: 15,
  },
});
