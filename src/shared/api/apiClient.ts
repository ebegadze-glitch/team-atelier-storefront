
import { tokenStorage } from '../../features/auth/model/tokenStorage'

const API_URL = import.meta.env.VITE_API_URL

export type ApiError = {
  message: string
  code: string
  errors?: Record<string, string>
}

type ApiClientOptions = RequestInit & {
  withAuth?: boolean
}


function isInvalidSessionError(
  status: number,
  code: string,
): boolean {
  return (
    status === 401 &&
    ['TOKEN_EXPIRED', 'INVALID_TOKEN', 'UNAUTHORIZED'].includes(code)
  )
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { withAuth = true, headers, ...requestOptions } = options

  const requestHeaders = new Headers(headers)
  const token = withAuth ? tokenStorage.get() : null

  if (requestOptions.body != null &&
      !requestHeaders.has('Content-Type')) {
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
  } catch {
    throw {
      code: 'NETWORK_ERROR',
      message: 'ქსელთან დაკავშირება ვერ მოხერხდა.',
    } satisfies ApiError
  }

  const data: unknown =
    response.status === 204
      ? null
      : await response.json().catch(() => null)

  if (!response.ok) {
    const body =
      typeof data === 'object' && data !== null
        ? data as Record<string, unknown>
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
      !Array.isArray(body.errors) &&
      Object.values(body.errors).every(
        (value) => typeof value === 'string',
      )
    ) {
      apiError.errors = body.errors as Record<string, string>
    }

    if (
      withAuth &&
      isInvalidSessionError(response.status, apiError.code)
    ) {
      if (token && tokenStorage.get() === token) {
        tokenStorage.remove()
        window.dispatchEvent(
          new CustomEvent('auth:token-expired'),
        )
      }
    }

    throw apiError
  }

  return data as T
}
