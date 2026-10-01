import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import Button from '../../shared/ui/Button'
import FormField from '../../shared/ui/FormField'
import Input from '../../shared/ui/Input'
import PasswordInput from '../../shared/ui/PasswordInput'
import Alert from '../../shared/ui/Alert'

import {
  getMe,
  login,
} from '../../features/auth/api/authApi'
import { tokenStorage } from '../../features/auth/model/tokenStorage'
import { useAuth } from '../../features/auth/model/useAuth'
import type { ApiError } from '../../shared/api/apiClient'

import { loginSchema, type LoginFormData } from './loginSchema'

import './LoginPage.css'

type LoginLocationState = {
  from?: {
    pathname?: string
  }
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuthenticatedUser } = useAuth()

  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormData) => {
    setFormError(null)

    try {
      const authData = await login(values)

      tokenStorage.set(authData.accessToken)

      const userData = await getMe()

      setAuthenticatedUser(userData.user)

      const state = location.state as LoginLocationState | null
      const destination = state?.from?.pathname ?? '/home'

      navigate(destination, { replace: true })
    } catch (error: unknown) {
      tokenStorage.remove()

      if (!isApiError(error)) {
        setFormError('Something went wrong. Please try again.')
        return
      }

      if (error.code === 'INVALID_CREDENTIALS') {
        setFormError('Incorrect email or password.')
        return
      }

      if (error.code === 'NETWORK_ERROR') {
        setFormError('ქსელთან დაკავშირება ვერ მოხერხდა.')
        return
      }

      setFormError(error.message)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <p className="login-brand">ATELIER</p>

        <h1 className="login-title" id="login-title">
          Welcome back
        </h1>

        <p className="login-subtitle">
          Sign in to continue to Atelier.
        </p>

        {formError && (
          <Alert variant="error">
            {formError}
          </Alert>
        )}

        <form
          className="login-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email?.message}
            errorId="email-error"
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? 'email-error' : undefined
              }
              {...register('email')}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            errorId="password-error"
          >
            <PasswordInput
              id="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'password-error' : undefined
              }
              {...register('password')}
            />
          </FormField>

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Continue
          </Button>
        </form>

        <Link className="login-link" to="/forgot-password">
          Forgot password?
        </Link>

        <p className="login-register">
          New to Atelier?{' '}
          <Link to="/register">
            Create account
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
