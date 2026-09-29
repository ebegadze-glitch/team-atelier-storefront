import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'

import Button from '../../shared/ui/Button'
import FormField from '../../shared/ui/FormField'
import Input from '../../shared/ui/Input'
import PasswordInput from '../../shared/ui/PasswordInput'

import { loginSchema, type LoginFormData } from './loginSchema'

import './LoginPage.css'

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    console.log(values)
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
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'password-error' : undefined
              }
              {...register('password')}
            />
          </FormField>

          <Button type="submit" isLoading={isSubmitting}>
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
