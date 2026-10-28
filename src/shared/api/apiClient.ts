
import { tokenStorage } from '../../features/auth/model/tokenStorage'

const API_URL = import.meta.env.VITE_API_URL

export type ApiError = {
  message: string
  code: string
  errors?: Record<string, string>
  available?: number
  retryAfterSeconds?: number
  items?: unknown[]
}

type ApiClientOptions = RequestInit & {
  withAuth?: boolean
}

/** Narrows API errors without mistaking DOMException for an API response. */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  )
}

const INVALID_SESSION_CODES = new Set([
  'TOKEN_EXPIRED',
  'INVALID_TOKEN',
  'UNAUTHORIZED',
])

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    error.name === 'AbortError'
  )
}

function getApiError(data: unknown): ApiError {
  const body =
    typeof data === 'object' && data !== null && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {}

  const apiError: ApiError = {
    message:
      typeof body.message === 'string'
        ? body.message
        : 'მოთხოვნის შესრულება ვერ მოხერხდა.',
    code:
      typeof body.code === 'string'
        ? body.code
        : 'UNKNOWN_ERROR',
  }

  if (
    typeof body.errors === 'object' &&
    body.errors !== null &&
    !Array.isArray(body.errors)
  ) {
    const entries = Object.entries(body.errors).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string',
    )

    if (entries.length > 0) {
      apiError.errors = Object.fromEntries(entries)
    }
  }

  if (
    typeof body.available === 'number' &&
    Number.isFinite(body.available)
  ) {
    apiError.available = body.available
  }

  if (typeof body.retryAfterSeconds === 'number' && Number.isFinite(body.retryAfterSeconds)) {
    apiError.retryAfterSeconds = body.retryAfterSeconds
  }

  if (Array.isArray(body.items)) {
    apiError.items = body.items
  }

  return apiError
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { withAuth = true, headers, ...requestOptions } = options

  const token = withAuth ? tokenStorage.get() : null
  const requestHeaders = new Headers(headers)

  if (
    requestOptions.body != null &&
    !requestHeaders.has('Content-Type')
  ) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (withAuth && token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  let response: Response

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...requestOptions,
      headers: requestHeaders,
    })
  } catch (error: unknown) {
    // Cancelled requests must stay cancelled.
    if (isAbortError(error)) {
      throw error
    }

    throw {
      message: 'ქსელთან დაკავშირება ვერ მოხერხდა.',
      code: 'NETWORK_ERROR',
    } satisfies ApiError
  }

  const data: unknown =
    response.status === 204
      ? null
      : await response.json().catch(() => null)

  if (!response.ok) {
    const apiError = getApiError(data)

    if (
      withAuth &&
      response.status === 401 &&
      INVALID_SESSION_CODES.has(apiError.code) &&
      token &&
      tokenStorage.get() === token
    ) {
      tokenStorage.remove()

      window.dispatchEvent(
        new CustomEvent('auth:token-expired'),
      )
    }

    throw apiError
  }

  return data as T
}
