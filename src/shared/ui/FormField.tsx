import type { ReactNode } from 'react'
import './FormField.css'

type FormFieldProps = {
  label: string
  htmlFor: string
  error?: string
  errorId?: string
  children: ReactNode
}

function FormField({
  label,
  htmlFor,
  error,
  errorId,
  children,
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={htmlFor}>{label}</label>

      {children}

      {error && (
        <p className="form-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
