import type { ApiClient } from './client';
import type { AppConfig, AuthResponse, Device, User } from './types';

export function authApi(client: ApiClient, device: Device) {
  return {
    config: () => client.request<AppConfig>('/config', { auth: false }),

    async login(email: string, password: string) {
      const result = await client.request<AuthResponse>('/auth/login', {
        method: 'POST',
        auth: false,
        body: { email, password, device },
      });
      await client.saveTokens(result);
      return result.user;
    },

    async register(name: string, email: string, password: string) {
      const result = await client.request<AuthResponse>('/auth/register', {
        method: 'POST',
        auth: false,
        body: { name, email, password, device },
      });
      await client.saveTokens(result);
      return result.user;
    },

    async google(idToken: string) {
      const result = await client.request<AuthResponse>('/auth/google', {
        method: 'POST',
        auth: false,
        body: { idToken, device },
      });
      await client.saveTokens(result);
      return { user: result.user, isNewUser: result.isNewUser === true };
    },

    forgotPassword: (email: string, locale: 'en' | 'fr') =>
      client.request<{ ok: true }>('/auth/forgot-password', {
        method: 'POST',
        auth: false,
        body: { email, locale },
      }),

    me: async () => (await client.request<{ user: User }>('/me')).user,

    deleteAccount: (email: string) => client.request<unknown>('/me', { method: 'DELETE', body: { email } }),
  };
}

export type AuthApi = ReturnType<typeof authApi>;
