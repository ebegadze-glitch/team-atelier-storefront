import { apiClient } from "../../../shared/api/apiClient";

export type AuthResponse = {
  accessToken: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export function login(payload: LoginPayload) {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload) {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe(token: string) {
  return apiClient<User>("/auth/me", {
    method: "GET",
    token,
  });
}
