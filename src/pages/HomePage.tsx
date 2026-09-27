import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getMe, type User } from '../features/auth/api/authApi'
import { tokenStorage } from '../shared/lib/tokenStorage'

function HomePage() {
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = tokenStorage.get()

    if (!token) {
      navigate('/login')
      return
    }

    getMe(token)
      .then((userData) => {
        setUser(userData)
      })
      .catch(() => {
        tokenStorage.remove()
        navigate('/login')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [navigate])

  function handleLogout() {
    tokenStorage.remove()
    navigate('/login')
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <main>
      <h1>Welcome, {user?.name ?? 'User'}</h1>

      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </main>
  )
}

export default HomePage 