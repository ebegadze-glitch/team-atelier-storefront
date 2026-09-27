import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import PasswordInput from '../../shared/ui/PasswordInput'
import Alert from '../../shared/ui/Alert'

import {
  registerSchema,
  type RegisterFormData,
} from './registerSchema'

import { register as registerUser } from '../../features/auth/api/authApi'
import { tokenStorage } from '../../shared/lib/tokenStorage'
import type { ApiError } from '../../shared/api/apiClient'

import './RegisterPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  return (
    <main className="register-page">
      <section className="register-card">
        <p className="register-brand">ATELIER</p>

        <h1>Create account</h1>

        <p>Create your Atelier account.</p>

        <form
          className="register-form"
          onSubmit={handleSubmit(async (data) => {
            setFormError('')

            try {
              const response = await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
              })

              tokenStorage.set(response.accessToken)
              navigate('/home')
            } catch (error) {
              const apiError = error as ApiError

              setFormError(
                apiError.message ||
                  'Registration failed. Please try again.'
              )
            }
          })}
          noValidate
        >
          {formError && (
            <Alert variant="error">
              {formError}
            </Alert>
          )}

          <label htmlFor="name">Name</label>

          <Input
            id="name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />

          {errors.name && (
            <p className="register-error">
              {errors.name.message}
            </p>
          )}

          <label htmlFor="email">Email</label>

          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />

          {errors.email && (
            <p className="register-error">
              {errors.email.message}
            </p>
          )}

          <label htmlFor="password">Password</label>

          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />

          {errors.password && (
            <p className="register-error">
              {errors.password.message}
            </p>
          )}

          <label htmlFor="confirmPassword">
            Confirm password
          </label>

          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />

          {errors.confirmPassword && (
            <p className="register-error">
              {errors.confirmPassword.message}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Creating account...'
              : 'Create account'}
          </Button>
        </form>

        <p className="register-login">
          Already have an account?{' '}
          <a href="/login">Sign in</a>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage 