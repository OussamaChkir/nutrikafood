import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './text';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface Props extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ label, variant = 'primary', loading = false, disabled, icon, ...props }: Props) {
  const theme = useTheme();
  const inactive = disabled || loading;
  const palette = {
    primary: { bg: theme.primary, fg: theme.primaryText, border: theme.primary },
    secondary: { bg: theme.card, fg: theme.text, border: theme.border },
    danger: { bg: theme.danger, fg: '#FFFFFF', border: theme.danger },
    ghost: { bg: 'transparent', fg: theme.link, border: 'transparent' },
  }[variant];

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: loading }}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: inactive ? 0.55 : pressed ? 0.85 : 1 },
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={{ color: palette.fg, fontWeight: '600' }}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: Radius.button,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
