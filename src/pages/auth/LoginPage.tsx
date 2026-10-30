import { useTranslation } from 'react-i18next'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

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
import { isApiError } from '../../shared/api/apiClient'

import {
  loginSchema,
  type LoginFormData,
} from './loginSchema'

import './LoginPage.css'

type LoginLocationState = {
  from?: {
    pathname?: string
    search?: string
    hash?: string
  }
}


function getReturnDestination(
  state: unknown,
): string {
  if (
    typeof state !== 'object' ||
    state === null ||
    !('from' in state)
  ) {
    return '/home'
  }

  const from = (state as LoginLocationState).from
  const pathname = from?.pathname

  if (
    typeof pathname !== 'string' ||
    !pathname.startsWith('/') ||
    pathname.startsWith('//') ||
    pathname === '/login'
  ) {
    return '/home'
  }

  const search =
    typeof from?.search === 'string' &&
    from.search.startsWith('?')
      ? from.search
      : ''

  const hash =
    typeof from?.hash === 'string' &&
    from.hash.startsWith('#')
      ? from.hash
      : ''

  return `${pathname}${search}${hash}`
}

function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const { setAuthenticatedUser } = useAuth()

  const [formError, setFormError] = useState<string | null>(
    null,
  )

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormData) => {
    setFormError(null)

    try {
      const authData = await login(values)

      tokenStorage.set(authData.accessToken)

      const userData = await getMe()

      const destination = getReturnDestination(
        location.state,
      )

      setAuthenticatedUser(userData.user)

      navigate(destination, {
        replace: true,
      })
    } catch (error: unknown) {
      tokenStorage.remove()

      if (!isApiError(error)) {
        setFormError(
          t('login.unexpected'),
        )
        return
      }

      if (error.code === 'INVALID_CREDENTIALS') {
        setFormError(t('login.badCredentials'))
        return
      }

      if (error.code === 'NETWORK_ERROR') {
        setFormError(
          t('auto.010'),
        )
        return
      }

      setFormError(error.message)
    }
  }

  return (
    <main className="login-page">
      <section
        className="login-card"
        aria-labelledby="login-title"
      >
        <p className="login-brand">
          ATELIER
        </p>

        <h1
          className="login-title"
          id="login-title"
        >
          {t('login.welcome')}
        </h1>

        <p className="login-subtitle">
          {t('login.subtitle')}
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
            label={t('login.email')}
            htmlFor="email"
            error={errors.email ? t(errors.email.type === 'too_small' ? 'login.emailRequired' : 'login.emailInvalid') : undefined}
            errorId="email-error"
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email
                  ? 'email-error'
                  : undefined
              }
              {...register('email')}
            />
          </FormField>

          <FormField
            label={t('login.password')}
            htmlFor="password"
            error={errors.password ? t('login.passwordRequired') : undefined}
            errorId="password-error"
          >
            <PasswordInput
              id="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password
                  ? 'password-error'
                  : undefined
              }
              {...register('password')}
            />
          </FormField>

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {t('login.continue')}
          </Button>
        </form>

        <Link
          className="login-link"
          to="/forgot-password"
        >
          {t('login.forgot')}
        </Link>

        <p className="login-register">
          {t('login.new')}{' '}
          <Link to="/register">
            {t('login.create')}
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage

