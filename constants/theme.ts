/**
 * Mayo Mobile - Premium Design System
 * 
 * A sophisticated medical-grade color palette utilizing:
 * - Primary: Mayo Blue (Deep, Trustworthy)
 * - Secondary: Teal/Cyan (Calm, Clean)
 * - Neutrals: Slate (Modern, Professional)
 */

import { Platform } from 'react-native';

const palette = {
  // Brand Colors
  mayoBlue: {
    light: '#0284C7', // Sky 600
    dark: '#38BDF8',  // Sky 400
    deep: '#0369A1',  // Sky 700
  },

  // Validation
  success: '#10B981', // Emerald 500
  warning: '#F59E0B', // Amber 500
  error: '#EF4444',   // Red 500

  // Neutrals
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  }
};

export const Colors = {
  light: {
    text: palette.slate[900],
    textSecondary: palette.slate[500],
    background: palette.slate[50], // Slightly off-white for less eye strain
    backgroundSecondary: '#FFFFFF', // Pure white for cards
    tint: palette.mayoBlue.light,
    icon: palette.slate[500],
    tabIconDefault: palette.slate[400],
    tabIconSelected: palette.mayoBlue.light,
    border: palette.slate[200],
    card: '#FFFFFF',
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
  },
  dark: {
    text: palette.slate[100],
    textSecondary: palette.slate[400],
    background: palette.slate[950], // Deep elegant dark
    backgroundSecondary: palette.slate[900], // Slightly lighter for cards
    tint: palette.mayoBlue.dark,
    icon: palette.slate[400],
    tabIconDefault: palette.slate[600],
    tabIconSelected: palette.mayoBlue.dark,
    border: palette.slate[800],
    card: palette.slate[900],
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    mono: 'monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    mono: 'monospace',
  },
});
