import { useCallback, useState } from 'react';

import { errorMessageKey } from '@/lib/api/error-message';
import { signInWithGoogle } from '@/lib/google';
import { useSession } from '@/lib/session/session';

/** Google sign-in flow shared by the Welcome and Sign in screens. */
export function useGoogleSignIn() {
  const { t, signInWithGoogleToken } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.status === 'cancelled') return;
      if (result.status === 'unavailable') return setError(t('errGoogleUnavailable'));
      if (result.status === 'error') return setError(t('errGoogleFailed'));
      try {
        await signInWithGoogleToken(result.idToken);
      } catch (cause) {
        const { key, params } = errorMessageKey(cause);
        setError(t(key === 'errGeneric' ? 'errGoogleFailed' : key, params));
      }
    } finally {
      setLoading(false);
    }
  }, [t, signInWithGoogleToken]);

  return { signIn, loading, error };
}
