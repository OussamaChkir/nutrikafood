/**
 * Design tokens copied from the Nutrika website (app/[locale]/globals.css) so the app and the site
 * look the same. Primary is the Nutrika orange.
 */
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#171717',
    textSecondary: '#737373',
    background: '#FFFFFF',
    card: '#FFFFFF',
    muted: '#F5F5F5',
    border: '#E5E5E5',
    primary: '#FB923C',
    primaryText: '#FFFFFF',
    /** Orange text on a white background needs a darker shade to stay readable. */
    link: '#C2410C',
    danger: '#EF4444',
    dangerText: '#B91C1C',
  },
  dark: {
    text: '#FAFAFA',
    textSecondary: '#A3A3A3',
    background: '#0A0A0A',
    card: '#121212',
    muted: '#262626',
    border: '#2E2E2E',
    primary: '#FB923C',
    primaryText: '#FFFFFF',
    link: '#FDBA74',
    danger: '#DC2626',
    dangerText: '#F87171',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };
export type ThemeColor = keyof ThemeColors;

export const Spacing = {
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
} as const;

export const Radius = { input: 12, button: 14, card: 20 } as const;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded' },
  default: { sans: 'normal', rounded: 'normal' },
});

export const MaxContentWidth = 480;
