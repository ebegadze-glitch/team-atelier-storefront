import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../shared/ui/Button'
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
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  return (
    <main className="register-page">
      <section
        className="register-card"
        aria-labelledby="register-title"
      >
        <p className="register-brand">ATELIER</p>

        <h1 className="register-title" id="register-title">
          Create your account
        </h1>

        <p className="register-subtitle">
          Join Atelier and start discovering art.
        </p>

        <form
          className="register-form"
          onSubmit={handleSubmit(() => {})}
          noValidate
        >
          <label htmlFor="name">Name</label>

          <Input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />

          {errors.name && (
            <p className="register-error" id="name-error">
              {errors.name.message}
            </p>
          )}

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
            <p className="register-error" id="email-error">
              {errors.email.message}
            </p>
          )}

          <label htmlFor="password">Password</label>

          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'password-error' : undefined
            }
            {...register('password')}
          />

          {errors.password && (
            <p className="register-error" id="password-error">
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
            aria-describedby={
              errors.confirmPassword
                ? 'confirm-password-error'
                : undefined
            }
            {...register('confirmPassword')}
          />

          {errors.confirmPassword && (
            <p
              className="register-error"
              id="confirm-password-error"
            >
              {errors.confirmPassword.message}
            </p>
          )}

          <Button type="submit">
            Create account
          </Button>
        </form>

        <p className="register-login">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage 