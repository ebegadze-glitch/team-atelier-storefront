import { Navigate, Outlet } from 'react-router-dom'
import { tokenStorage } from '../shared/lib/tokenStorage'


function ProtectedRoute() {
  const token = tokenStorage.get()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute 