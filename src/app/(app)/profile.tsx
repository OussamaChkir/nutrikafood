import { useState } from 'react';
import { Alert, Modal, View, StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { errorMessageKey } from '@/lib/api/error-message';
import { useSession } from '@/lib/session/session';

export default function ProfileScreen() {
  const { t, user, signOut, deleteAccount } = useSession();
  const theme = useTheme();
  const [confirming, setConfirming] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function close() {
    setConfirming(false);
    setEmail('');
    setError(null);
  }

  async function confirmDelete() {
    setBusy(true);
    setError(null);
    try {
      await deleteAccount(email);
    } catch (cause) {
      const { key, params } = errorMessageKey(cause);
      setError(t(key, params));
      setBusy(false);
    }
  }

  return (
    <Screen tabBar>
      <Text variant="title">{t('profileTitle')}</Text>
      <View style={[styles.card, { backgroundColor: theme.muted }]}>
        <Text variant="small" color="textSecondary">
          {t('signedInAs')}
        </Text>
        {user?.name ? <Text style={styles.bold}>{user.name}</Text> : null}
        <Text>{user?.email}</Text>
      </View>

      <Button label={t('signOut')} variant="secondary" onPress={() => void signOut()} />
      <Button label={t('deleteAccount')} variant="ghost" onPress={() => setConfirming(true)} />

      <Modal visible={confirming} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
        <Screen>
          <Text variant="heading">{t('deleteTitle')}</Text>
          <Text color="textSecondary">{t('deleteBody')}</Text>
          <FormError message={error} />
          <TextField
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            placeholder={user?.email}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <Button
            label={t('deleteConfirm')}
            variant="danger"
            loading={busy}
            disabled={email.trim().toLowerCase() !== user?.email.toLowerCase()}
            onPress={() =>
              Alert.alert(t('deleteTitle'), t('deleteBody'), [
                { text: t('cancel'), style: 'cancel' },
                { text: t('deleteConfirm'), style: 'destructive', onPress: () => void confirmDelete() },
              ])
            }
          />
          <Button label={t('cancel')} variant="ghost" onPress={close} />
        </Screen>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.card, padding: Spacing.three, gap: Spacing.one },
  bold: { fontWeight: '600' },
});
