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

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { withAuth = true, headers, ...requestOptions } = options

  const token = tokenStorage.get()

  const requestHeaders = new Headers(headers)

  requestHeaders.set('Content-Type', 'application/json')

  if (withAuth && token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...requestOptions,
      headers: requestHeaders,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const apiError: ApiError = {
        message: data?.message ?? 'Something went wrong',
        code: data?.code ?? 'UNKNOWN_ERROR',
        errors: data?.errors,
      }

      if (
        response.status === 401 &&
        apiError.code === 'TOKEN_EXPIRED'
      ) {
        tokenStorage.remove()

        window.dispatchEvent(
          new CustomEvent('auth:token-expired'),
        )
      }

      throw apiError
    }

    return data as T
  } catch (error: unknown) {
    if (isApiError(error)) {
      throw error
    }

    const networkError: ApiError = {
      message: 'ქსელთან დაკავშირება ვერ მოხერხდა',
      code: 'NETWORK_ERROR',
    }

    throw networkError
  }
}