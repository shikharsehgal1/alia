import { StyleSheet } from 'react-native';
import Colors from './Colors';

// Common spacing values based on 8px grid
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Font sizes
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

// Font weights
export const fontWeights = {
  regular: '400',
  medium: '500',
  bold: '700',
};

// Common styles that can be reused
export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as '700',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium as '500',
    marginBottom: spacing.sm,
  },
  bodyText: {
    fontSize: fontSizes.md,
    lineHeight: 24,
  },
  smallText: {
    fontSize: fontSizes.sm,
    color: Colors.light.secondaryText,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium as '500',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: fontSizes.md,
    backgroundColor: Colors.light.lightGrey,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: spacing.md,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  shadow: {
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
});