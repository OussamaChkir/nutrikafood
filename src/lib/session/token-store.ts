import * as SecureStore from 'expo-secure-store';

import type { StoredTokens, TokenStore } from '@/lib/api/client';
import type { User } from '@/lib/api/types';

const TOKENS_KEY = 'nutrika.tokens';
const USER_KEY = 'nutrika.user';

/** Tokens live in the Keychain (iOS) / Keystore (Android), never in AsyncStorage. */
export const secureTokenStore: TokenStore = {
  async get() {
    try {
      const raw = await SecureStore.getItemAsync(TOKENS_KEY);
      if (!raw) return null;
      const value = JSON.parse(raw) as Partial<StoredTokens>;
      if (typeof value.accessToken !== 'string' || typeof value.refreshToken !== 'string' || typeof value.expiresAt !== 'number') {
        return null;
      }
      return value as StoredTokens;
    } catch {
      return null;
    }
  },
  async set(tokens) {
    await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));
  },
  async clear() {
    await SecureStore.deleteItemAsync(TOKENS_KEY).catch(() => undefined);
    await SecureStore.deleteItemAsync(USER_KEY).catch(() => undefined);
  },
};

/** The last known user, so the app opens signed in even when the phone is offline. */
export async function readCachedUser(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export async function writeCachedUser(user: User): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch {
    // The cache is a convenience only.
  }
}
