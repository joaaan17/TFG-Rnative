import { StyleSheet } from 'react-native';

import AppColors from '@/design-system/colors';

export const batallasStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.light.mainBackground,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  footerButton: {
    width: '100%',
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  modalList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    rowGap: 12,
  },
});

export default batallasStyles;
