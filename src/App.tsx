import type { ReactNode } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/catalog/CatalogPage'
import ProductDetailsPage from './pages/product/ProductDetailsPage'

import { ProtectedRoute } from './features/auth/model/ProtectedRoute'
import { useAuth } from './features/auth/model/useAuth'

type PublicOnlyRouteProps = {
  children: ReactNode
}

function RootRedirect() {
  const { status } = useAuth()

  if (status === 'loading') {
    return <p>Loading...</p>
  }

  if (status === 'authenticated') {
    return <Navigate to="/home" replace />
  }

  return <Navigate to="/login" replace />
}

function PublicOnlyRoute({
  children,
}: PublicOnlyRouteProps) {
  const { status } = useAuth()

  if (status === 'loading') {
    return <p>Loading...</p>
  }

  if (status === 'authenticated') {
    return <Navigate to="/home" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT */}
        <Route
          path="/"
          element={<RootRedirect />}
        />

        {/* PUBLIC AUTH ROUTES */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/home"
            element={<HomePage />}
          />

          <Route
            path="/catalog"
            element={<CatalogPage />}
          />

          <Route
            path="/product/:slug"
            element={<ProductDetailsPage />}
          />
        </Route>

        {/* UNKNOWN ROUTE */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App 