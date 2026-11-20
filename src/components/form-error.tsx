import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './text';

export function FormError({ message }: { message: string | null }) {
  const theme = useTheme();
  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[styles.box, { borderColor: theme.danger, backgroundColor: theme.muted }]}>
      <Text variant="small" color="dangerText">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: Radius.input, padding: Spacing.three },
});
