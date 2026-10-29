import type { ReactNode } from 'react'
import './Alert.css' 


type AlertProps = {
  children: ReactNode
  variant?: 'error' | 'success'
}

function Alert({ children, variant = 'error' }: AlertProps) {
  return (
    <div className={`alert alert--${variant}`} role="alert">
      {children}
    </div>
  )
}

export default Alert