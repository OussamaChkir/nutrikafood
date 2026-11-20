import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Page container: safe areas, keyboard avoidance, scrolling and a readable maximum width on tablets. */
export function Screen({ children, scroll = true, tabBar = false }: { children: ReactNode; scroll?: boolean; tabBar?: boolean }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const content = [
    styles.content,
    { paddingTop: insets.top + Spacing.four, paddingBottom: (tabBar ? Spacing.four : insets.bottom) + Spacing.four },
  ];
  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={content}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic">
          <View style={styles.inner}>{children}</View>
        </ScrollView>
      ) : (
        <View style={content}>
          <View style={styles.inner}>{children}</View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: Spacing.four },
  inner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.three },
});
