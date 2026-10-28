
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
import ProfilePage from './pages/profile/ProfilePage'
import AddressesPage from './pages/addresses/AddressesPage'
import CartPage from './pages/cart/CartPage'
import CheckoutPage from './pages/checkout/CheckoutPage'
import ConfirmPaymentPage from './pages/checkout/ConfirmPaymentPage'
import OrderDetailsPage from './pages/checkout/OrderDetailsPage'
import SiteFooter from './shared/ui/SiteFooter'

import { ProtectedRoute } from './features/auth/model/ProtectedRoute'
import { useAuth } from './features/auth/model/useAuth'

type PublicOnlyRouteProps = {
  children: ReactNode
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/home" replace />}
        />

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

        {/* The showroom is public; protected features remain behind login. */}
        <Route path="/home" element={<HomePage />} />

        <Route element={<ProtectedRoute />}>

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/addresses"
            element={<AddressesPage />}
          />

          <Route
            path="/cart"
            element={<CartPage />}
          />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/confirm/:orderId" element={<ConfirmPaymentPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
        </Route>

        <Route
          path="/catalog"
          element={<CatalogPage />}
        />

        <Route
          path="/product/:slug"
          element={<ProductDetailsPage />}
        />

        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />
      </Routes>
      <SiteFooter />
    </BrowserRouter>
  )
}

