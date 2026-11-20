import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { useSession } from '@/lib/session/session';

/** Placeholder until the scanner (milestone M5). */
export default function ScanScreen() {
  const { t } = useSession();
  return (
    <Screen tabBar>
      <Text variant="title">{t('scanTitle')}</Text>
      <Text color="textSecondary">{t('scanSoon')}</Text>
    </Screen>
  );
}
