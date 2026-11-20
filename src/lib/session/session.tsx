import * as Device from 'expo-device';
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { authApi } from '@/lib/api/auth';
import { createApiClient } from '@/lib/api/client';
import { isApiError } from '@/lib/api/errors';
import type { User } from '@/lib/api/types';
import { API_URL } from '@/lib/config';
import { signOutOfGoogle } from '@/lib/google';
import { detectLocale, translate, type Locale, type MessageKey } from '@/lib/i18n';
import { readCachedUser, secureTokenStore, writeCachedUser } from '@/lib/session/token-store';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface SessionValue {
  status: Status;
  user: User | null;
  locale: Locale;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogleToken: (idToken: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: (email: string) => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);
  const locale = useMemo(() => detectLocale(), []);

  // Stable across renders: the client keeps the single-flight refresh state.
  const api = useMemo(() => {
    const device = {
      deviceName: Device.deviceName?.slice(0, 80) ?? undefined,
      platform: (Platform.OS === 'ios' ? 'ios' : 'android') as 'ios' | 'android',
    };
    const signedOutListeners = new Set<() => void>();
    const client = createApiClient({
      baseUrl: API_URL,
      store: secureTokenStore,
      device,
      locale: () => locale,
      onSignedOut: () => signedOutListeners.forEach((listener) => listener()),
    });
    return { client, auth: authApi(client, device), signedOutListeners };
  }, [locale]);

  // The client signs the user out by itself when the refresh token is rejected.
  useEffect(() => {
    const listener = () => {
      setUser(null);
      setStatus('signedOut');
    };
    api.signedOutListeners.add(listener);
    return () => {
      api.signedOutListeners.delete(listener);
    };
  }, [api]);

  const t = useCallback<SessionValue['t']>((key, params) => translate(locale, key, params), [locale]);

  // Restore the session when the app starts.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(await api.client.hasTokens())) {
        if (!cancelled) setStatus('signedOut');
        return;
      }
      const cached = await readCachedUser();
      try {
        const fresh = await api.auth.me();
        if (cancelled) return;
        setUser(fresh);
        setStatus('signedIn');
        void writeCachedUser(fresh);
      } catch (error) {
        if (cancelled) return;
        if (isApiError(error) && (error.status === 401 || error.code === 'unauthorized')) {
          // The refresh token is dead; the client already cleared the store.
          setStatus('signedOut');
        } else if (cached) {
          // Offline or the server is down: stay signed in with what we know.
          setUser(cached);
          setStatus('signedIn');
        } else {
          setStatus('signedOut');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const accept = useCallback((next: User) => {
    setUser(next);
    setStatus('signedIn');
    void writeCachedUser(next);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      status,
      user,
      locale,
      t,
      signInWithEmail: async (email, password) => accept(await api.auth.login(email.trim(), password)),
      signUpWithEmail: async (name, email, password) => accept(await api.auth.register(name.trim(), email.trim(), password)),
      signInWithGoogleToken: async (idToken) => accept((await api.auth.google(idToken)).user),
      forgotPassword: async (email) => {
        await api.auth.forgotPassword(email.trim(), locale);
      },
      signOut: async () => {
        await api.client.signOut();
        await signOutOfGoogle();
        setUser(null);
        setStatus('signedOut');
      },
      deleteAccount: async (email) => {
        await api.auth.deleteAccount(email.trim());
        await api.client.signOut();
        await signOutOfGoogle();
        setUser(null);
        setStatus('signedOut');
      },
    }),
    [status, user, locale, t, api, accept],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionValue {
  const value = use(SessionContext);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}
