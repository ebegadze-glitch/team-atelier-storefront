import { apiClient } from '../../../shared/api/apiClient'

export type User = {
  id: string
  name: string
  email: string
}

export type AuthResponse = {
  accessToken: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type VerifyResetCodePayload = {
  email: string
  code: string
}

export type VerifyResetCodeResponse = {
  resetToken: string
  devCode?: string
}

export type ResetPasswordPayload = {
  resetToken: string
  password: string
}

export function login(payload: LoginPayload) {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    withAuth: false,
    body: JSON.stringify(payload),
  })
}

export function register(payload: RegisterPayload) {
  return apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    withAuth: false,
    body: JSON.stringify(payload),
  })
}

export function getMe() {
  return apiClient<{ user: User }>('/auth/me', {
    method: 'GET',
  })
}

export function forgotPassword(payload: ForgotPasswordPayload) {
  return apiClient<{ devCode?: string }>('/auth/forgot-password', {
    method: 'POST',
    withAuth: false,
    body: JSON.stringify(payload),
  })
}

export function verifyResetCode(payload: VerifyResetCodePayload) {
  return apiClient<VerifyResetCodeResponse>('/auth/verify-reset-code', {
    method: 'POST',
    withAuth: false,
    body: JSON.stringify(payload),
  })
}

export function resetPassword(payload: ResetPasswordPayload) {
  return apiClient<void>('/auth/reset-password', {
    method: 'POST',
    withAuth: false,
    body: JSON.stringify(payload),
  })
}
