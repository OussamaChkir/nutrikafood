import { useRouter } from 'expo-router';
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
import { isStrongPassword, isValidEmail, isValidName } from '@/lib/validation';

export default function SignUpScreen() {
  const { t, signUpWithEmail } = useSession();
  const router = useRouter();
  const google = useGoogleSignIn();
  const emailRef = useRef<TextFieldRef>(null);
  const passwordRef = useRef<TextFieldRef>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const next: typeof errors = {};
    if (!isValidName(name)) next.name = t('errNameShort');
    if (!isValidEmail(email)) next.email = t('errEmailInvalid');
    if (!isStrongPassword(password)) next.password = t('errPasswordWeak');
    setErrors(next);
    setFormError(null);
    if (next.name || next.email || next.password) return;

    setLoading(true);
    try {
      await signUpWithEmail(name, email, password);
    } catch (cause) {
      const { key, params } = errorMessageKey(cause);
      setFormError(t(key, params));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text variant="title">{t('signUpTitle')}</Text>

      <FormError message={formError ?? google.error} />

      <TextField
        label={t('name')}
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        ref={emailRef}
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
        hint={t('passwordHint')}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <Button label={t('signUp')} loading={loading} onPress={submit} />

      <Text variant="small" color="textSecondary" style={styles.center}>
        {t('or')}
      </Text>
      <GoogleButton label={t('continueWithGoogle')} loading={google.loading} onPress={() => void google.signIn()} />

      <View style={styles.footer}>
        <Text variant="small" color="textSecondary">
          {t('haveAccount')}
        </Text>
        <Button label={t('signIn')} variant="ghost" onPress={() => router.replace('/sign-in')} />
      </View>
      <LegalLinks />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  footer: { alignItems: 'center', gap: Spacing.one },
});
