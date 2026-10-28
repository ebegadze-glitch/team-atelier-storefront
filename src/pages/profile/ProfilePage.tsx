
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'

import {
  updateMe,
  type UpdateMePayload,
} from '../../features/auth/api/authApi'
import { useAuth } from '../../features/auth/model/useAuth'
import { isApiError } from '../../shared/api/apiClient'

import Alert from '../../shared/ui/Alert'
import Button from '../../shared/ui/Button'
import FormField from '../../shared/ui/FormField'
import Input from '../../shared/ui/Input'
import PasswordInput from '../../shared/ui/PasswordInput'

import {
  profileSchema,
  type ProfileFormData,
} from './profileSchema'

import './ProfilePage.css'

const profileFields = [
  'name',
  'email',
  'currentPassword',
  'newPassword',
  'confirmNewPassword',
] as const


export default function ProfilePage() {
  const { user, setAuthenticatedUser } = useAuth()

  const [formError, setFormError] = useState<string | null>(
    null,
  )
  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const [name, email, newPassword] = useWatch({
    control,
    name: ['name', 'email', 'newPassword'],
  })

  useEffect(() => {
    if (!user) {
      return
    }

    reset({
      name: user.name,
      email: user.email,
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    })
  }, [user, reset])

  const hasChanges = Boolean(
    user &&
      (name?.trim() !== user.name ||
        email?.trim() !== user.email ||
        newPassword),
  )

  async function onSubmit(values: ProfileFormData) {
    if (!user || !hasChanges) {
      return
    }

    setFormError(null)
    setSuccessMessage(null)

    const payload: UpdateMePayload = {
      currentPassword: values.currentPassword,
    }

    if (values.name.trim() !== user.name) {
      payload.name = values.name.trim()
    }

    if (values.email.trim() !== user.email) {
      payload.email = values.email.trim()
    }

    if (values.newPassword) {
      payload.newPassword = values.newPassword
    }

    try {
      const response = await updateMe(payload)

      setAuthenticatedUser(response.user)

      reset({
        name: response.user.name,
        email: response.user.email,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })

      setSuccessMessage('ცვლილებები შენახულია')
    } catch (error: unknown) {
      if (!isApiError(error)) {
        setFormError(
          'დაფიქსირდა შეცდომა. სცადე ხელახლა.',
        )
        return
      }

      if (error.code === 'INVALID_CURRENT_PASSWORD') {
        setError('currentPassword', {
          message: 'პაროლი არასწორია',
        }, { shouldFocus: true })
        return
      }

      if (error.code === 'EMAIL_TAKEN') {
        setError('email', {
          message: 'ეს ელფოსტა უკვე გამოიყენება',
        }, { shouldFocus: true })
        return
      }

      if (error.code === 'VALIDATION_ERROR') {
        const serverErrors = error.errors ?? {}

        Object.entries(serverErrors).forEach(
          ([field, message]) => {
            if (field === '_') {
              setFormError(message)
              return
            }

            const isProfileField = profileFields.some(
              (fieldName) => fieldName === field,
            )

            if (isProfileField) {
              setError(
                field as (typeof profileFields)[number],
                { message },
                { shouldFocus: true },
              )
            }
          },
        )

        if (Object.keys(serverErrors).length === 0) {
          setFormError(error.message)
        }

        return
      }

      if (error.code === 'NETWORK_ERROR') {
        setFormError(
          'ქსელთან დაკავშირება ვერ მოხერხდა.',
        )
        return
      }

      setFormError(error.message)
    }
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <Link to="/home">
          ← მთავარზე დაბრუნება
        </Link>

        <h1>ჩემი პროფილი</h1>

        <p>
          შეცვალე ანგარიშის მონაცემები და პაროლი.
        </p>

        <nav aria-label="პროფილის მენიუ">
          <Link to="/addresses">
            ჩემი მისამართები →
          </Link>
        </nav>

        {formError && (
          <Alert variant="error">
            {formError}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success">
            {successMessage}
          </Alert>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <FormField
            label="სახელი"
            htmlFor="profile-name"
            error={errors.name?.message}
            errorId="profile-name-error"
          >
            <Input
              id="profile-name"
              autoComplete="name"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={
                errors.name
                  ? 'profile-name-error'
                  : undefined
              }
              {...register('name')}
            />
          </FormField>

          <FormField
            label="ელფოსტა"
            htmlFor="profile-email"
            error={errors.email?.message}
            errorId="profile-email-error"
          >
            <Input
              id="profile-email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email
                  ? 'profile-email-error'
                  : undefined
              }
              {...register('email')}
            />
          </FormField>

          <FormField
            label="მიმდინარე პაროლი"
            htmlFor="profile-current-password"
            error={errors.currentPassword?.message}
            errorId="profile-current-password-error"
          >
            <PasswordInput
              id="profile-current-password"
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(
                errors.currentPassword,
              )}
              aria-describedby={
                errors.currentPassword
                  ? 'profile-current-password-error'
                  : undefined
              }
              {...register('currentPassword')}
            />
          </FormField>

          <FormField
            label="ახალი პაროლი (არასავალდებულო)"
            htmlFor="profile-new-password"
            error={errors.newPassword?.message}
            errorId="profile-new-password-error"
          >
            <PasswordInput
              id="profile-new-password"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(
                errors.newPassword,
              )}
              aria-describedby={
                errors.newPassword
                  ? 'profile-new-password-error'
                  : undefined
              }
              {...register('newPassword')}
            />
          </FormField>

          <FormField
            label="გაიმეორე ახალი პაროლი"
            htmlFor="profile-confirm-password"
            error={errors.confirmNewPassword?.message}
            errorId="profile-confirm-password-error"
          >
            <PasswordInput
              id="profile-confirm-password"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(
                errors.confirmNewPassword,
              )}
              aria-describedby={
                errors.confirmNewPassword
                  ? 'profile-confirm-password-error'
                  : undefined
              }
              {...register('confirmNewPassword')}
            />
          </FormField>

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!hasChanges || isSubmitting}
          >
            ცვლილებების შენახვა
          </Button>
        </form>
      </div>
    </main>
  )
}
 