import { useAuth } from '../features/auth/model/useAuth'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <main>
      <h1>Welcome, {user?.name ?? 'User'}</h1>

      <p>{user?.email}</p>

      <button type="button" onClick={logout}>
        Log out
      </button>
    </main>
  )
}
