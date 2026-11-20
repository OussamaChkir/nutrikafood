import { createApiClient, type StoredTokens, type TokenStore } from './client';
import { ApiError } from './errors';

function memoryStore(initial: StoredTokens | null): TokenStore & { value: StoredTokens | null } {
  const store = {
    value: initial,
    get: async () => store.value,
    set: async (tokens: StoredTokens) => {
      store.value = tokens;
    },
    clear: async () => {
      store.value = null;
    },
  };
  return store;
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

const pair = (n: number) => ({ tokenType: 'Bearer', accessToken: `access-${n}`, expiresIn: 900, refreshToken: `refresh-${n}` });

function setup(initial: StoredTokens | null, responder: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const store = memoryStore(initial);
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = jest.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return responder(String(url), init ?? {});
  }) as unknown as typeof fetch;
  const onSignedOut = jest.fn();
  let clock = 1_000_000;
  const client = createApiClient({ baseUrl: 'https://api.test/v1', store, onSignedOut, fetchImpl, now: () => clock });
  return { client, store, calls, onSignedOut, advance: (ms: number) => (clock += ms) };
}

const fresh = (): StoredTokens => ({ accessToken: 'access-0', refreshToken: 'refresh-0', expiresAt: 1_000_000 + 900_000 });

describe('api client', () => {
  it('sends the bearer token and parses JSON', async () => {
    const { client, calls } = setup(fresh(), () => json(200, { user: { id: 'u1' } }));
    await expect(client.request('/me')).resolves.toEqual({ user: { id: 'u1' } });
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer access-0');
  });

  it('does not call the network when signed out and auth is needed', async () => {
    const { client, calls } = setup(null, () => json(200, {}));
    await expect(client.request('/me')).rejects.toMatchObject({ code: 'unauthorized' });
    expect(calls).toHaveLength(0);
  });

  it('skips the token for public endpoints', async () => {
    const { client, calls } = setup(null, () => json(200, { ok: true }));
    await client.request('/config', { auth: false });
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('refreshes before the access token expires and stores the rotated pair', async () => {
    const { client, store, calls, advance } = setup(fresh(), (url) =>
      url.endsWith('/auth/refresh') ? json(200, pair(1)) : json(200, { ok: true }),
    );
    advance(880_000); // 20 s left, inside the 30 s skew
    await client.request('/me');
    expect(calls.map((c) => c.url)).toEqual(['https://api.test/v1/auth/refresh', 'https://api.test/v1/me']);
    expect(store.value?.refreshToken).toBe('refresh-1');
    expect((calls[1].init.headers as Record<string, string>).Authorization).toBe('Bearer access-1');
  });

  it('retries once with a new pair when the server answers 401', async () => {
    let meCalls = 0;
    const { client, calls } = setup(fresh(), (url) => {
      if (url.endsWith('/auth/refresh')) return json(200, pair(1));
      meCalls += 1;
      return meCalls === 1 ? json(401, { error: { code: 'token_expired', message: 'x' } }) : json(200, { ok: true });
    });
    await expect(client.request('/me')).resolves.toEqual({ ok: true });
    expect(calls).toHaveLength(3);
  });

  it('shares one refresh between concurrent requests (refresh tokens are single use)', async () => {
    const { client, calls, advance } = setup(fresh(), (url) =>
      url.endsWith('/auth/refresh') ? json(200, pair(1)) : json(200, { ok: true }),
    );
    advance(900_000);
    await Promise.all([client.request('/a'), client.request('/b'), client.request('/c')]);
    expect(calls.filter((c) => c.url.endsWith('/auth/refresh'))).toHaveLength(1);
  });

  it('signs the user out when the refresh token is rejected', async () => {
    const { client, store, onSignedOut, advance } = setup(fresh(), () =>
      json(401, { error: { code: 'invalid_token', message: 'x' } }),
    );
    advance(900_000);
    await expect(client.request('/me')).rejects.toMatchObject({ status: 401 });
    expect(store.value).toBeNull();
    expect(onSignedOut).toHaveBeenCalledTimes(1);
  });

  it('keeps the session when refresh fails for another reason (offline, 5xx)', async () => {
    const { client, store, onSignedOut, advance } = setup(fresh(), () => json(503, { error: { code: 'unavailable', message: 'x' } }));
    advance(900_000);
    await expect(client.request('/me')).rejects.toMatchObject({ status: 503 });
    expect(store.value).not.toBeNull();
    expect(onSignedOut).not.toHaveBeenCalled();
  });

  it('turns a fetch failure into a network error', async () => {
    const store = memoryStore(null);
    const client = createApiClient({
      baseUrl: 'https://api.test/v1',
      store,
      onSignedOut: jest.fn(),
      fetchImpl: (async () => {
        throw new TypeError('Network request failed');
      }) as unknown as typeof fetch,
    });
    await expect(client.request('/config', { auth: false })).rejects.toMatchObject({ code: 'network', status: 0 });
  });

  it('parses the uniform error shape and Retry-After', async () => {
    const { client } = setup(null, () => json(429, { error: { code: 'rate_limited', message: 'slow down' } }, { 'Retry-After': '42' }));
    const error = await client.request('/auth/login', { method: 'POST', auth: false, body: {} }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 429, code: 'rate_limited', retryAfter: 42 });
  });

  it('survives a non-JSON error body', async () => {
    const { client } = setup(null, () => new Response('<html>Bad gateway</html>', { status: 502 }));
    await expect(client.request('/config', { auth: false })).rejects.toMatchObject({ status: 502, code: 'unknown' });
  });

  it('signs out: clears tokens and revokes the refresh token on the server', async () => {
    const { client, store, calls } = setup(fresh(), () => new Response(null, { status: 204 }));
    await client.signOut();
    expect(store.value).toBeNull();
    expect(calls[0].url).toBe('https://api.test/v1/auth/logout');
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ refreshToken: 'refresh-0' });
  });

  it('signs out locally even when the server is unreachable', async () => {
    const store = memoryStore(fresh());
    const client = createApiClient({
      baseUrl: 'https://api.test/v1',
      store,
      onSignedOut: jest.fn(),
      fetchImpl: (async () => {
        throw new TypeError('offline');
      }) as unknown as typeof fetch,
    });
    await expect(client.signOut()).resolves.toBeUndefined();
    expect(store.value).toBeNull();
  });
});
