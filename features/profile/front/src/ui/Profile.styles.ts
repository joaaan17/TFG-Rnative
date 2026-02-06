import { StyleSheet } from 'react-native';

import AppColors from '@/design-system/colors';
import { TextStyles } from '@/design-system/typography';

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.light.mainBackground,
  },
  scrollContent: {
    paddingBottom: 190,
  },
  topCard: {
    height: '30%',
    width: '100%',
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: AppColors.light.inputBackground,
  },
  topCardHeader: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  topCardTitle: {
    color: AppColors.light.primary,
  },
  topCardCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  settingsButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  joinedTextWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
    marginTop: 0,
  },
  addFriendsWrapper: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  addFriendsButton: {
    width: '100%',
  },
  summaryWrapper: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  summaryTitle: {
    ...TextStyles.sectionLabel,
  },
  summaryGrid: {
    paddingTop: 14,
    rowGap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryValue: {
    textAlign: 'center',
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryLabel: {
    textAlign: 'center',
    marginTop: 2,
  },
  logrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
  },
});

export default profileStyles;
