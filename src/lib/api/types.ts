/** Types of the Nutrika mobile API (docs/api/mobile-v1.openapi.yaml in the website repo). */

export type ApiErrorCode =
  | 'invalid_request'
  | 'unauthorized'
  | 'invalid_credentials'
  | 'invalid_token'
  | 'token_expired'
  | 'email_taken'
  | 'email_unverified'
  | 'email_missing'
  | 'email_mismatch'
  | 'admin_blocked'
  | 'rate_limited'
  | 'not_configured'
  | 'not_found'
  | 'limit_reached'
  | 'feature_disabled'
  | 'unavailable'
  | 'server_error'
  /** Added by the app, never sent by the server. */
  | 'network'
  | 'unknown';

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: 'USER' | 'PREMIUM' | 'ADMIN';
  hasPassword: boolean;
  providers: ('apple' | 'google')[];
  createdAt: string;
}

export interface TokenPair {
  tokenType: 'Bearer';
  accessToken: string;
  /** Seconds. */
  expiresIn: number;
  refreshToken: string;
}

export interface AuthResponse extends TokenPair {
  user: User;
  isNewUser?: boolean;
}

export interface AppConfig {
  apiVersion?: number;
  minAppVersion?: string;
  flags?: Record<string, boolean>;
  auth?: { email?: boolean; google?: boolean; apple?: boolean };
}

export interface Device {
  deviceName?: string;
  platform?: 'ios' | 'android';
}
