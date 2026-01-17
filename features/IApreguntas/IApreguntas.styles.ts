import { StyleSheet } from 'react-native';
import AppColors from '@/design-system/colors';

export const iaPreguntasStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  helloText: {
    textAlign: 'center',
    color: AppColors.light.primary,
    marginBottom: 8,
  },
  welcomeText: {
    // Negro “más claro” (gris oscuro) reutilizando tokens del design system
    color: AppColors.light.icon,
  },
});
