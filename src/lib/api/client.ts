import { ApiError } from './errors';
import type { ApiErrorCode, Device, TokenPair } from './types';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds. */
  expiresAt: number;
}

export interface TokenStore {
  get(): Promise<StoredTokens | null>;
  set(tokens: StoredTokens): Promise<void>;
  clear(): Promise<void>;
}

export interface ApiClientOptions {
  baseUrl: string;
  store: TokenStore;
  /** Called when the refresh token is no longer valid and the user has to sign in again. */
  onSignedOut: () => void;
  fetchImpl?: typeof fetch;
  now?: () => number;
  device?: Device;
  /** Sent as Accept-Language. */
  locale?: () => string;
  /** Refresh this many milliseconds before the access token expires. */
  refreshSkewMs?: number;
  timeoutMs?: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Send the access token (default true). */
  auth?: boolean;
  headers?: Record<string, string>;
}

export interface ApiClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
  /** Keep a freshly issued token pair (after sign-in). */
  saveTokens(pair: TokenPair): Promise<void>;
  /** Revoke the refresh token on the server (best effort) and forget the tokens. */
  signOut(): Promise<void>;
  hasTokens(): Promise<boolean>;
}

const KNOWN_CODES = new Set<string>([
  'invalid_request', 'unauthorized', 'invalid_credentials', 'invalid_token', 'token_expired', 'email_taken',
  'email_unverified', 'email_missing', 'email_mismatch', 'admin_blocked', 'rate_limited', 'not_configured',
  'not_found', 'limit_reached', 'feature_disabled', 'unavailable', 'server_error',
]);

export function toStoredTokens(pair: TokenPair, now: number): StoredTokens {
  return {
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
    expiresAt: now + pair.expiresIn * 1000,
  };
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const doFetch = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const skew = options.refreshSkewMs ?? 30_000;
  const timeoutMs = options.timeoutMs ?? 20_000;

  /**
   * Refresh tokens are single use. If two requests refreshed at the same time, the second one would
   * present a token that was already rotated and the server would treat it as theft. So there is
   * only ever one refresh in flight and every waiting request shares its result.
   */
  let refreshing: Promise<StoredTokens> | null = null;

  async function send(path: string, init: RequestOptions, accessToken?: string): Promise<Response> {
    const headers: Record<string, string> = { Accept: 'application/json', ...init.headers };
    if (init.body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    if (options.locale) headers['Accept-Language'] = options.locale();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await doFetch(`${options.baseUrl}${path}`, {
        method: init.method ?? 'GET',
        headers,
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        signal: controller.signal,
      });
    } catch {
      throw new ApiError(0, 'network', 'Could not reach the server.');
    } finally {
      clearTimeout(timer);
    }
  }

  async function parseError(response: Response): Promise<ApiError> {
    let code: ApiErrorCode = 'unknown';
    let message = `Request failed (${response.status}).`;
    let details: Record<string, unknown> | undefined;
    try {
      const data = (await response.json()) as { error?: { code?: string; message?: string; details?: Record<string, unknown> } };
      if (data.error) {
        if (data.error.code && KNOWN_CODES.has(data.error.code)) code = data.error.code as ApiErrorCode;
        if (data.error.message) message = data.error.message;
        details = data.error.details;
      }
    } catch {
      // Not JSON (a proxy error page, for instance).
    }
    const retry = Number(response.headers.get('Retry-After'));
    return new ApiError(response.status, code, message, {
      details,
      retryAfter: Number.isFinite(retry) && retry > 0 ? retry : undefined,
    });
  }

  async function runRefresh(refreshToken: string): Promise<StoredTokens> {
    const response = await send('/auth/refresh', { method: 'POST', body: { refreshToken, device: options.device } });
    if (!response.ok) {
      const error = await parseError(response);
      // Only a definitive "this token is dead" signs the user out. A 5xx or a 429 must not.
      if (error.status === 401) {
        await options.store.clear();
        options.onSignedOut();
      }
      throw error;
    }
    const pair = (await response.json()) as TokenPair;
    const tokens = toStoredTokens(pair, now());
    await options.store.set(tokens);
    return tokens;
  }

  function refresh(refreshToken: string): Promise<StoredTokens> {
    if (!refreshing) {
      refreshing = runRefresh(refreshToken).finally(() => {
        refreshing = null;
      });
    }
    return refreshing;
  }

  async function validTokens(): Promise<StoredTokens | null> {
    const tokens = await options.store.get();
    if (!tokens) return null;
    if (tokens.expiresAt - skew > now()) return tokens;
    return refresh(tokens.refreshToken);
  }

  async function request<T>(path: string, init: RequestOptions = {}): Promise<T> {
    const useAuth = init.auth !== false;
    let tokens = useAuth ? await validTokens() : null;
    if (useAuth && !tokens) {
      throw new ApiError(401, 'unauthorized', 'You are signed out.');
    }

    let response = await send(path, init, tokens?.accessToken);

    if (response.status === 401 && useAuth && tokens) {
      // The access token was rejected (revoked, clock drift). One refresh, one retry.
      const current = await options.store.get();
      // Another request may already have rotated the pair while this one was in flight.
      tokens = current && current.accessToken !== tokens.accessToken ? current : await refresh(tokens.refreshToken);
      response = await send(path, init, tokens.accessToken);
    }

    if (!response.ok) throw await parseError(response);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  return {
    request,
    async saveTokens(pair) {
      await options.store.set(toStoredTokens(pair, now()));
    },
    async signOut() {
      const tokens = await options.store.get();
      await options.store.clear();
      if (tokens) {
        try {
          await send('/auth/logout', { method: 'POST', body: { refreshToken: tokens.refreshToken } });
        } catch {
          // The device is signed out locally either way.
        }
      }
    },
    async hasTokens() {
      return (await options.store.get()) !== null;
    },
  };
}
