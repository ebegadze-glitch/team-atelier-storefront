import { tokenStorage } from "../../features/auth/model/tokenStorage";

const API_URL = import.meta.env.VITE_API_URL;

export type ApiError = {
  message: string;
  code: string;
  errors?: Record<string, string>;
};

type ApiClientOptions = RequestInit & {
  withAuth?: boolean;
};

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string"
  );
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { withAuth = true, headers, ...requestOptions } = options;

  const token = tokenStorage.get();

  const requestHeaders = new Headers(headers);

  requestHeaders.set("Content-Type", "application/json");

  if (withAuth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...requestOptions,
      headers: requestHeaders,
    });

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const errorData =
        typeof data === "object" && data !== null
          ? (data as Record<string, unknown>)
          : null;

      const apiError: ApiError = {
        message:
          typeof errorData?.message === "string"
            ? errorData.message
            : "Something went wrong",

        code:
          typeof errorData?.code === "string"
            ? errorData.code
            : "UNKNOWN_ERROR",
      };

      if (response.status === 401 && apiError.code === "TOKEN_EXPIRED") {
        tokenStorage.remove();

        window.dispatchEvent(new CustomEvent("auth:token-expired"));
      }

      if (
        errorData?.errors &&
        typeof errorData.errors === "object" &&
        !Array.isArray(errorData.errors)
      ) {
        const errors = errorData.errors as Record<string, unknown>;

        apiError.errors = Object.fromEntries(
          Object.entries(errors).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        );
      }

      throw apiError;
    }

    return data as T;
  } catch (error: unknown) {
    // Keep cancelled requests as AbortError.
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    // Preserve valid API errors.
    if (isApiError(error)) {
      throw error;
    }

    // Convert unexpected fetch failures to network errors.
    const networkError: ApiError = {
      message: "ქსელთან დაკავშირება ვერ მოხერხდა",
      code: "NETWORK_ERROR",
    };

    throw networkError;
  }
}
