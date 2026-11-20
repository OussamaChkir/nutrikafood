import { Text as RNText, type TextProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { ThemeColor } from '@/constants/theme';

type Variant = 'title' | 'heading' | 'body' | 'small';

const sizes: Record<Variant, { fontSize: number; lineHeight: number; fontWeight: '400' | '600' | '700' }> = {
  title: { fontSize: 32, lineHeight: 38, fontWeight: '700' },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
};

export function Text({
  variant = 'body',
  color = 'text',
  style,
  ...props
}: TextProps & { variant?: Variant; color?: ThemeColor }) {
  const theme = useTheme();
  return <RNText {...props} style={[sizes[variant], { color: theme[color] }, style]} />;
}
