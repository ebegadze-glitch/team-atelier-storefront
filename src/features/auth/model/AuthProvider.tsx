import { useEffect, useState, type ReactNode } from 'react'
import { getMe, type User } from '../api/authApi'
import { AuthContext, type AuthStatus } from './authContext'
import { tokenStorage } from './tokenStorage'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    async function checkAuth() {
      const token = tokenStorage.get()

      if (!token) {
        setUser(null)
        setStatus('unauthenticated')
        return
      }

      try {
        const data = await getMe()

        setUser(data.user)
        setStatus('authenticated')
      } catch {
        tokenStorage.remove()
        setUser(null)
        setStatus('unauthenticated')
      }
    }

    void checkAuth()
  }, [])

  useEffect(() => {
    function handleTokenExpired() {
      setUser(null)
      setStatus('unauthenticated')
    }

    window.addEventListener(
      'auth:token-expired',
      handleTokenExpired,
    )

    return () => {
      window.removeEventListener(
        'auth:token-expired',
        handleTokenExpired,
      )
    }
  }, [])

  function setAuthenticatedUser(authenticatedUser: User) {
    setUser(authenticatedUser)
    setStatus('authenticated')
  }

  function logout() {
    tokenStorage.remove()
    setUser(null)
    setStatus('unauthenticated')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        setAuthenticatedUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
} 