import type { ApiErrorCode } from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: Record<string, unknown>;
  /** Seconds, from the Retry-After header of a 429. */
  readonly retryAfter?: number;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    options: { details?: Record<string, unknown>; retryAfter?: number } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = options.details;
    this.retryAfter = options.retryAfter;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
