// features/Inicio/Main.styles.ts
import { StyleSheet } from 'react-native';
import AppColors from '@/design-system/colors';

export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.light.mainBackground,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
  },
});
