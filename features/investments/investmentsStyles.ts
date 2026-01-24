import { StyleSheet } from 'react-native';

import AppColors from '@/design-system/colors';
import { TextStyles } from '@/design-system/typography';

export const investmentsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.light.mainBackground,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  tabs: {
    paddingHorizontal: 10,
    paddingTop: 0,
  },
  amount: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  chart: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  summaryTitle: {
    ...TextStyles.sectionLabel,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  assetsList: {
    paddingHorizontal: 10,
    paddingTop: 12,
    rowGap: 12,
  },
});

export default investmentsStyles;
