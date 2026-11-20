import { errorMessageKey } from './error-message';
import { ApiError } from './errors';

describe('errorMessageKey', () => {
  it('maps API codes to messages and never leaks server text', () => {
    expect(errorMessageKey(new ApiError(401, 'invalid_credentials', 'raw server text')).key).toBe('errInvalidCredentials');
    expect(errorMessageKey(new ApiError(409, 'email_taken', 'x')).key).toBe('errEmailTaken');
    expect(errorMessageKey(new ApiError(0, 'network', 'x')).key).toBe('errNetwork');
    expect(errorMessageKey(new ApiError(503, 'not_configured', 'x')).key).toBe('errUnavailable');
  });

  it('uses Retry-After for rate limits', () => {
    expect(errorMessageKey(new ApiError(429, 'rate_limited', 'x', { retryAfter: 30.2 }))).toEqual({
      key: 'errRateLimitedIn',
      params: { seconds: 31 },
    });
    expect(errorMessageKey(new ApiError(429, 'rate_limited', 'x')).key).toBe('errRateLimited');
  });

  it('falls back to a generic message for unknown errors', () => {
    expect(errorMessageKey(new Error('boom')).key).toBe('errGeneric');
  });
});
