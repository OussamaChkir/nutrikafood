import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { errorMessageKey } from '@/lib/api/error-message';
import { useSession } from '@/lib/session/session';
import { isValidEmail } from '@/lib/validation';

export default function ForgotPasswordScreen() {
  const { t, forgotPassword } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    if (!isValidEmail(email)) return setFieldError(t('errEmailInvalid'));
    setFieldError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (cause) {
      const { key, params } = errorMessageKey(cause);
      setError(t(key, params));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text variant="title">{t('forgotTitle')}</Text>
      <Text color="textSecondary">{t('forgotBody')}</Text>
      <FormError message={error} />
      {sent ? (
        <Text accessibilityLiveRegion="polite">{t('forgotSent')}</Text>
      ) : (
        <>
          <TextField
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            error={fieldError}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={submit}
          />
          <Button label={t('sendLink')} loading={loading} onPress={submit} />
        </>
      )}
      <Button label={t('back')} variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
