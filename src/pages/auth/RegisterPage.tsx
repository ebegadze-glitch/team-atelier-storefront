import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'

import Button from '../../shared/ui/Button'
import FormField from '../../shared/ui/FormField'
import Input from '../../shared/ui/Input'
import PasswordInput from '../../shared/ui/PasswordInput'
import Alert from '../../shared/ui/Alert'

import {
  getMe,
  register as registerUser,
} from '../../features/auth/api/authApi'
import { tokenStorage } from '../../features/auth/model/tokenStorage'
import { useAuth } from '../../features/auth/model/useAuth'
import type { ApiError } from '../../shared/api/apiClient'

import {
  registerSchema,
  type RegisterFormData,
} from './registerSchema'

import './RegisterPage.css'

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}

function RegisterPage() {
  const navigate = useNavigate()
  const { setAuthenticatedUser } = useAuth()

  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormData) => {
    setFormError(null)

    try {
      const authData = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      })

      tokenStorage.set(authData.accessToken)

      const userData = await getMe()

      setAuthenticatedUser(userData.user)

      navigate('/home', { replace: true })
    } catch (error: unknown) {
      tokenStorage.remove()

      if (!isApiError(error)) {
        setFormError('Something went wrong. Please try again.')
        return
      }

      if (error.code === 'VALIDATION_ERROR') {
        Object.entries(error.errors ?? {}).forEach(
          ([field, message]) => {
            if (
              field === 'name' ||
              field === 'email' ||
              field === 'password' ||
              field === 'confirmPassword'
            ) {
              setError(field, { message })
            }
          },
        )
        return
      }

      if (error.code === 'EMAIL_TAKEN') {
        setError('email', {
          message: 'ეს ელფოსტა უკვე რეგისტრირებულია',
        })
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
    <main className="register-page">
      <section
        className="register-card"
        aria-labelledby="register-title"
      >
        <p className="register-brand">ATELIER</p>

        <h1 id="register-title" className="register-title">
          Create account
        </h1>

        <p className="register-subtitle">
          Create your Atelier account.
        </p>

        {formError && (
          <Alert variant="error">
            {formError}
          </Alert>
        )}

        <form
          className="register-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <FormField
            label="Name"
            htmlFor="name"
            error={errors.name?.message}
            errorId="name-error"
          >
            <Input
              id="name"
              autoComplete="name"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={
                errors.name ? 'name-error' : undefined
              }
              {...register('name')}
            />
          </FormField>

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
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'password-error' : undefined
              }
              {...register('password')}
            />
          </FormField>

          <FormField
            label="Confirm password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
            errorId="confirm-password-error"
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword
                  ? 'confirm-password-error'
                  : undefined
              }
              {...register('confirmPassword')}
            />
          </FormField>

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Create account
          </Button>
        </form>

        <p className="register-login">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage
