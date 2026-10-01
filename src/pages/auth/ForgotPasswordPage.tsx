import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import Button from '../../shared/ui/Button'
import FormField from '../../shared/ui/FormField'
import Input from '../../shared/ui/Input'
import PasswordInput from '../../shared/ui/PasswordInput'
import Alert from '../../shared/ui/Alert'

import {
  forgotPassword,
  resetPassword,
  verifyResetCode,
} from '../../features/auth/api/authApi'
import type { ApiError } from '../../shared/api/apiClient'

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from './forgotPasswordSchema'

import './ForgotPasswordPage.css'

const codeSchema = z.object({
  code: z.string().min(1, 'Reset code is required'),
})

type CodeFormData = z.infer<typeof codeSchema>

const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one number'),
})

type NewPasswordFormData = z.infer<typeof newPasswordSchema>

type Step = 'email' | 'code' | 'password' | 'success'

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}

function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
  })

  const passwordForm = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  })

  const handleEmailSubmit = async (
    values: ForgotPasswordFormData,
  ) => {
    setFormError(null)

    try {
      await forgotPassword({
        email: values.email,
      })

      setEmail(values.email)
      setStep('code')
    } catch (error: unknown) {
      if (!isApiError(error)) {
        setFormError('Something went wrong. Please try again.')
        return
      }

      if (error.code === 'NETWORK_ERROR') {
        setFormError('ქსელთან დაკავშირება ვერ მოხერხდა.')
        return
      }

      setFormError(error.message)
    }
  }

  const handleCodeSubmit = async (values: CodeFormData) => {
    setFormError(null)

    try {
      const data = await verifyResetCode({
        email,
        code: values.code,
      })

      setResetToken(data.resetToken)
      setStep('password')
    } catch (error: unknown) {
      if (!isApiError(error)) {
        setFormError('Something went wrong. Please try again.')
        return
      }

      if (error.code === 'INVALID_RESET_CODE') {
        codeForm.setError('code', {
          message: 'კოდი არასწორია ან ვადაგასულია',
        })
        return
      }

      if (error.code === 'TOO_MANY_ATTEMPTS') {
        setFormError(
          'ძალიან ბევრი მცდელობა. მოითხოვე ახალი კოდი.',
        )
        return
      }

      if (error.code === 'NETWORK_ERROR') {
        setFormError('ქსელთან დაკავშირება ვერ მოხერხდა.')
        return
      }

      setFormError(error.message)
    }
  }

  const handlePasswordSubmit = async (
    values: NewPasswordFormData,
  ) => {
    setFormError(null)

    try {
      await resetPassword({
        resetToken,
        password: values.password,
      })

      setResetToken('')
      setStep('success')
    } catch (error: unknown) {
      if (!isApiError(error)) {
        setFormError('Something went wrong. Please try again.')
        return
      }

      if (error.code === 'NETWORK_ERROR') {
        setFormError('ქსელთან დაკავშირება ვერ მოხერხდა.')
        return
      }

      setFormError(error.message)
    }
  }

  const requestNewCode = () => {
    setFormError(null)
    setResetToken('')
    codeForm.reset()
    setStep('email')
  }

  return (
    <main className="forgot-page">
      <section
        className="forgot-card"
        aria-labelledby="forgot-title"
      >
        <p className="forgot-brand">ATELIER</p>

        <h1 className="forgot-title" id="forgot-title">
          Reset your password
        </h1>

        {formError && (
          <Alert variant="error">
            {formError}
          </Alert>
        )}

        {step === 'email' && (
          <>
            <p className="forgot-subtitle">
              Enter your email to request a reset code.
            </p>

            <form
              className="forgot-form"
              onSubmit={emailForm.handleSubmit(
                handleEmailSubmit,
              )}
              noValidate
            >
              <FormField
                label="Email"
                htmlFor="email"
                error={emailForm.formState.errors.email?.message}
                errorId="email-error"
              >
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={emailForm.formState.isSubmitting}
                  aria-invalid={Boolean(
                    emailForm.formState.errors.email,
                  )}
                  aria-describedby={
                    emailForm.formState.errors.email
                      ? 'email-error'
                      : undefined
                  }
                  {...emailForm.register('email')}
                />
              </FormField>

              <Button
                type="submit"
                isLoading={emailForm.formState.isSubmitting}
                disabled={emailForm.formState.isSubmitting}
              >
                Send reset code
              </Button>
            </form>
          </>
        )}

        {step === 'code' && (
          <>
            <p className="forgot-subtitle">
              Enter the reset code sent for {email}.
            </p>

            <form
              className="forgot-form"
              onSubmit={codeForm.handleSubmit(
                handleCodeSubmit,
              )}
              noValidate
            >
              <FormField
                label="Reset code"
                htmlFor="reset-code"
                error={codeForm.formState.errors.code?.message}
                errorId="reset-code-error"
              >
                <Input
                  id="reset-code"
                  type="text"
                  autoComplete="one-time-code"
                  disabled={codeForm.formState.isSubmitting}
                  aria-invalid={Boolean(
                    codeForm.formState.errors.code,
                  )}
                  aria-describedby={
                    codeForm.formState.errors.code
                      ? 'reset-code-error'
                      : undefined
                  }
                  {...codeForm.register('code')}
                />
              </FormField>

              <Button
                type="submit"
                isLoading={codeForm.formState.isSubmitting}
                disabled={codeForm.formState.isSubmitting}
              >
                Verify code
              </Button>

              <Button
                type="button"
                onClick={requestNewCode}
                disabled={codeForm.formState.isSubmitting}
              >
                Request new code
              </Button>
            </form>
          </>
        )}

        {step === 'password' && (
          <>
            <p className="forgot-subtitle">
              Create your new password.
            </p>

            <form
              className="forgot-form"
              onSubmit={passwordForm.handleSubmit(
                handlePasswordSubmit,
              )}
              noValidate
            >
              <FormField
                label="New password"
                htmlFor="new-password"
                error={
                  passwordForm.formState.errors.password?.message
                }
                errorId="new-password-error"
              >
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  disabled={
                    passwordForm.formState.isSubmitting
                  }
                  aria-invalid={Boolean(
                    passwordForm.formState.errors.password,
                  )}
                  aria-describedby={
                    passwordForm.formState.errors.password
                      ? 'new-password-error'
                      : undefined
                  }
                  {...passwordForm.register('password')}
                />
              </FormField>

              <Button
                type="submit"
                isLoading={
                  passwordForm.formState.isSubmitting
                }
                disabled={
                  passwordForm.formState.isSubmitting
                }
              >
                Reset password
              </Button>
            </form>
          </>
        )}

        {step === 'success' && (
          <div className="forgot-success" role="status">
            <p>Your password has been reset successfully.</p>

            <Link className="forgot-back" to="/login">
              Continue to login
            </Link>
          </div>
        )}

        {step !== 'success' && (
          <Link className="forgot-back" to="/login">
            Back to login
          </Link>
        )}
      </section>
    </main>
  )
}

export default ForgotPasswordPage