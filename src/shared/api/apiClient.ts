const API_URL = import.meta.env.VITE_API_URL;

export type ApiError = {
  message: string;
  code: string;
  errors?: Record<string, string>;
};

type RequestOptions = RequestInit & {
  token?: string | null;
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...restOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const apiError: ApiError = {
      message: data?.message ?? "Something went wrong",
      code: data?.code ?? "UNKNOWN_ERROR",
      errors: data?.errors,
    };

    throw apiError;
  }

  return data as T;
}
