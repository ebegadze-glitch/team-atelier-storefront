import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'

import Button from '../../shared/ui/Button'
import FormField from '../../shared/ui/FormField'
import Input from '../../shared/ui/Input'
import PasswordInput from '../../shared/ui/PasswordInput'

import {
  registerSchema,
  type RegisterFormData,
} from './registerSchema'

import './RegisterPage.css'

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    console.log(values)
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
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword
                  ? 'confirm-password-error'
                  : undefined
              }
              {...register('confirmPassword')}
            />
          </FormField>

          <Button type="submit" isLoading={isSubmitting}>
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