import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'

import Button from '../../shared/ui/Button'
import FormField from '../../shared/ui/FormField'
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
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (values: ForgotPasswordFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    console.log(values)
    setSubmitted(true)
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

        <p className="forgot-subtitle">
          Enter your email and we’ll send you a reset link.
        </p>

        {submitted ? (
          <div className="forgot-success" role="status">
            If an account exists for this email, we've sent a reset link.
          </div>
        ) : (
          <form
            className="forgot-form"
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
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? 'email-error' : undefined
                }
                {...register('email')}
              />
            </FormField>

            <Button type="submit" isLoading={isSubmitting}>
              Send reset link
            </Button>
          </form>
        )}

        <Link className="forgot-back" to="/login">
          Back to login
        </Link>
      </section>
    </main>
  )
}

export default ForgotPasswordPage
