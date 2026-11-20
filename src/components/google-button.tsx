import { StyleSheet, View } from 'react-native';

import { Button } from './button';
import { Text } from './text';

/**
 * TODO before release: replace the "G" with the official multicolour Google logo asset from
 * https://developers.google.com/identity/branding-guidelines (required by Google's branding rules).
 */
function GoogleMark() {
  return (
    <View style={styles.mark}>
      <Text style={styles.g}>G</Text>
    </View>
  );
}

export function GoogleButton({ label, loading, onPress }: { label: string; loading?: boolean; onPress: () => void }) {
  return <Button label={label} variant="secondary" loading={loading} onPress={onPress} icon={<GoogleMark />} />;
}

const styles = StyleSheet.create({
  mark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DADCE0',
  },
  g: { color: '#4285F4', fontWeight: '700', fontSize: 14, lineHeight: 16 },
});
