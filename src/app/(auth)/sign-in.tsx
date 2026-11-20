import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { GoogleButton } from '@/components/google-button';
import { LegalLinks } from '@/components/legal-links';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { TextField, type TextFieldRef } from '@/components/text-field';
import { Spacing } from '@/constants/theme';
import { useGoogleSignIn } from '@/hooks/use-google-sign-in';
import { errorMessageKey } from '@/lib/api/error-message';
import { useSession } from '@/lib/session/session';
import { isValidEmail } from '@/lib/validation';

export default function SignInScreen() {
  const { t, signInWithEmail } = useSession();
  const router = useRouter();
  const google = useGoogleSignIn();
  const passwordRef = useRef<TextFieldRef>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = t('errEmailInvalid');
    if (!password) next.password = t('errPasswordEmpty');
    setErrors(next);
    setFormError(null);
    if (next.email || next.password) return;

    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (cause) {
      const { key, params } = errorMessageKey(cause);
      setFormError(t(key, params));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text variant="title">{t('signInTitle')}</Text>

      <FormError message={formError ?? google.error} />

      <TextField
        label={t('email')}
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label={t('password')}
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <Link href="/forgot-password" style={styles.forgot}>
        <Text variant="small" color="link">
          {t('forgotPassword')}
        </Text>
      </Link>

      <Button label={t('signIn')} loading={loading} onPress={submit} />

      <Text variant="small" color="textSecondary" style={styles.center}>
        {t('or')}
      </Text>
      <GoogleButton label={t('continueWithGoogle')} loading={google.loading} onPress={() => void google.signIn()} />

      <View style={styles.footer}>
        <Text variant="small" color="textSecondary">
          {t('noAccount')}
        </Text>
        <Button label={t('signUp')} variant="ghost" onPress={() => router.replace('/sign-up')} />
      </View>
      <LegalLinks />
    </Screen>
  );
}

const styles = StyleSheet.create({
  forgot: { alignSelf: 'flex-end', paddingVertical: Spacing.one },
  center: { textAlign: 'center' },
  footer: { alignItems: 'center', gap: Spacing.one },
});
