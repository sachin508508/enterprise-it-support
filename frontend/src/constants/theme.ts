import { Colors } from './colors';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const Typography = {
  largeTitle: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
  },

  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
  },

  heading: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },

  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },

  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },

  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  elevated: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export { Colors };