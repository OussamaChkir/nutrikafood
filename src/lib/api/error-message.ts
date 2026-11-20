import { isApiError } from './errors';
import type { MessageKey } from '@/lib/i18n';

/** Maps an API error to the key of a user-facing message. Never shows server text to the user. */
export function errorMessageKey(error: unknown): { key: MessageKey; params?: Record<string, number> } {
  if (!isApiError(error)) return { key: 'errGeneric' };
  switch (error.code) {
    case 'network':
      return { key: 'errNetwork' };
    case 'invalid_credentials':
      return { key: 'errInvalidCredentials' };
    case 'email_taken':
      return { key: 'errEmailTaken' };
    case 'email_unverified':
      return { key: 'errEmailUnverified' };
    case 'email_mismatch':
      return { key: 'errEmailMismatch' };
    case 'admin_blocked':
      return { key: 'errAdminBlocked' };
    case 'rate_limited':
      return error.retryAfter
        ? { key: 'errRateLimitedIn', params: { seconds: Math.ceil(error.retryAfter) } }
        : { key: 'errRateLimited' };
    case 'not_configured':
    case 'unavailable':
    case 'server_error':
      return { key: 'errUnavailable' };
    default:
      return { key: 'errGeneric' };
  }
}
