import { createContext } from 'react'
import type { User } from '../api/authApi'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type AuthContextValue = {
  user: User | null
  status: AuthStatus
  setAuthenticatedUser: (user: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
