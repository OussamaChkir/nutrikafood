import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { GoogleButton } from '@/components/google-button';
import { LegalLinks } from '@/components/legal-links';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { Spacing } from '@/constants/theme';
import { useGoogleSignIn } from '@/hooks/use-google-sign-in';
import { useSession } from '@/lib/session/session';

export default function WelcomeScreen() {
  const { t } = useSession();
  const router = useRouter();
  const google = useGoogleSignIn();
  const [dismissed, setDismissed] = useState(false);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text variant="title" color="primary">
          {t('appName')}
        </Text>
        <Text variant="heading">{t('tagline')}</Text>
        <Text color="textSecondary">{t('welcomeBody')}</Text>
      </View>

      <FormError message={dismissed ? null : google.error} />

      <GoogleButton
        label={t('continueWithGoogle')}
        loading={google.loading}
        onPress={() => {
          setDismissed(false);
          void google.signIn();
        }}
      />
      <Button label={t('continueWithEmail')} onPress={() => router.push('/sign-in')} />
      <Button label={t('signUp')} variant="ghost" onPress={() => router.push('/sign-up')} />
      <LegalLinks />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.two, paddingTop: Spacing.six, paddingBottom: Spacing.four },
});
