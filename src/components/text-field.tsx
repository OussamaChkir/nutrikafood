import { forwardRef, type ComponentRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './text';

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
  hint?: string;
}

export type TextFieldRef = ComponentRef<typeof TextInput>;

export const TextField = forwardRef<TextFieldRef, Props>(function TextField({ label, error, hint, style, ...props }, ref) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <Text variant="small" color="textSecondary" style={styles.label}>
        {label}
      </Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={theme.textSecondary}
        {...props}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.muted, borderColor: error ? theme.danger : theme.border },
          style,
        ]}
      />
      {error ? (
        <Text variant="small" color="dangerText" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="small" color="textSecondary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: Spacing.one },
  label: { fontWeight: '600' },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
