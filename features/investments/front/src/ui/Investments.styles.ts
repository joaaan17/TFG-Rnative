import { StyleSheet } from 'react-native';

export const investmentsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  tabs: {
    marginBottom: 16,
  },
  amount: {
    marginBottom: 16,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'stretch',
  },
  summaryTitle: {
    marginBottom: 12,
  },
  assetsList: {
    gap: 12,
  },
  errorText: {
    paddingVertical: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
