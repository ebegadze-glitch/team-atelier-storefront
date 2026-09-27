import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from './forgotPasswordSchema'
import './ForgotPasswordPage.css'

function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = () => {
    setSubmitted(true)
  }

  return (
    <main className="forgot-page">
      <section className="forgot-card" aria-labelledby="forgot-title">
        <p className="forgot-brand">ATELIER</p>

        <h1 className="forgot-title" id="forgot-title">
          Reset your password
        </h1>

        <p className="forgot-subtitle">
          Enter your email and we’ll send you a reset link.
        </p>

        {submitted ? (
          <div className="forgot-success" role="status">
            Check your inbox for password reset instructions.
          </div>
        ) : (
          <form
            className="forgot-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <label htmlFor="email">Email</label>

            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />

            {errors.email && (
              <p className="forgot-error" id="email-error">
                {errors.email.message}
              </p>
            )}

            <Button type="submit">Send reset link</Button>
          </form>
        )}

        <a className="forgot-back" href="/login">
          Back to login
        </a>
      </section>
    </main>
  )
}

export default ForgotPasswordPage
