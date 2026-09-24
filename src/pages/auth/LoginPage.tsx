import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import PasswordInput from '../../shared/ui/PasswordInput'
import { loginSchema, type LoginFormData } from './loginSchema'
import './LoginPage.css'

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

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
          onSubmit={handleSubmit(() => {})}
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
            <p className="login-error" id="email-error">
              {errors.email.message}
            </p>
          )}

          <label htmlFor="password">Password</label>

          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'password-error' : undefined
            }
            {...register('password')}
          />

          {errors.password && (
            <p className="login-error" id="password-error">
              {errors.password.message}
            </p>
          )}

          <Button type="submit">Continue</Button>
        </form>

        <a className="login-link" href="/forgot-password">
          Forgot password?
        </a>

        <p className="login-register">
          New to Atelier? <a href="/register">Create account</a>
        </p>
      </section>
    </main>
  )
}

export default LoginPage 