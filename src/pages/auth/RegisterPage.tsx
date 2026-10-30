import i18n from '../../shared/i18n/index'
import { useTranslation } from 'react-i18next'
import { localizeValidationError } from '../../shared/i18n/authValidation'
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
import { isApiError } from '../../shared/api/apiClient'

import {
  registerSchema,
  type RegisterFormData,
} from './registerSchema'

import './RegisterPage.css'


function RegisterPage() {
  const { t } = useTranslation()
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
        setFormError(t('auth.generalError'))
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
          message: t('auth.emailTaken'),
        })
        return
      }

      if (error.code === 'NETWORK_ERROR') {
        setFormError(i18n.t("auto.010"))
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
          {t('reg.title')}
        </h1>

        <p className="register-subtitle">
          {t('reg.subtitle')}
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
            label={t('reg.name')}
            htmlFor="name"
            error={localizeValidationError(errors.name?.message)}
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
            label={t('reg.email')}
            htmlFor="email"
            error={localizeValidationError(errors.email?.message)}
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
            label={t('reg.password')}
            htmlFor="password"
            error={localizeValidationError(errors.password?.message)}
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
            label={t('reg.confirm')}
            htmlFor="confirmPassword"
            error={localizeValidationError(errors.confirmPassword?.message)}
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
            {t('reg.title')}
          </Button>
        </form>

        <p className="register-login">
          {t('reg.have')}{' '}
          <Link to="/login">{t('reg.signin')}</Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage
