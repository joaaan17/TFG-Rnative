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
});

export default batallasStyles;

