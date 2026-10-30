import './Button.css'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  isLoading?: boolean
  variant?: 'primary' | 'secondary'
}

function Button({
  children,
  isLoading = false,
  variant = 'primary',
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}

export default Button
