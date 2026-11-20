import { Linking } from 'react-native';

import { WEBSITE_URL } from '@/lib/config';
import { useSession } from '@/lib/session/session';
import { Text } from './text';

/** Terms and privacy policy open the website pages (Apple wants both reachable before sign-up). */
export function LegalLinks() {
  const { t, locale } = useSession();
  const open = (path: string) => Linking.openURL(`${WEBSITE_URL}/${locale}/${path}`);
  return (
    <Text variant="small" color="textSecondary" style={{ textAlign: 'center' }}>
      {t('agreePrefix')}{' '}
      <Text variant="small" color="link" accessibilityRole="link" onPress={() => open('terms')}>
        {t('terms')}
      </Text>{' '}
      {t('and')}{' '}
      <Text variant="small" color="link" accessibilityRole="link" onPress={() => open('privacy')}>
        {t('privacy')}
      </Text>
      .
    </Text>
  );
}
