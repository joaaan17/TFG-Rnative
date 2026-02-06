import { StyleSheet } from 'react-native';
import AppColors from '@/design-system/colors';

export const chatMessageBubbleStyles = StyleSheet.create({
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 4,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: AppColors.light.primary,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.light.cardBackground,
    borderWidth: 1,
    borderColor: AppColors.light.surfaceBorder,
  },
  textUser: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  textAssistant: {
    color: AppColors.light.text,
    fontSize: 15,
  },
});
