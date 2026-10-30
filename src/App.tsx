import { ThemeProvider } from './shared/theme/ThemeContext'
import ThemeToggle from './shared/theme/ThemeToggle'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './features/auth/model/ProtectedRoute'
import { useAuth } from './features/auth/model/useAuth'
import SiteFooter from './shared/ui/SiteFooter'

// Each route is downloaded only when it is visited.
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const CatalogPage = lazy(() => import('./pages/catalog/CatalogPage'))
const ProductDetailsPage = lazy(() => import('./pages/product/ProductDetailsPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const AddressesPage = lazy(() => import('./pages/addresses/AddressesPage'))
const CartPage = lazy(() => import('./pages/cart/CartPage'))
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'))
const ConfirmPaymentPage = lazy(() => import('./pages/checkout/ConfirmPaymentPage'))
const OrderDetailsPage = lazy(() => import('./pages/checkout/OrderDetailsPage'))

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') return <p role="status">Loading...</p>
  if (status === 'authenticated') return <Navigate to="/home" replace />
  return children
}

function OtherPagesThemeToggle() {
  const location = useLocation()
  const { i18n } = useTranslation()
  if (location.pathname === '/home') return null
  const isEnglish = i18n.language.toLowerCase().startsWith('en')
  const switchLanguage = () => {
    const next = isEnglish ? 'ka' : 'en'
    localStorage.setItem('atelier-language', next)
    void i18n.changeLanguage(next)
  }
  return (
    <div className="atelier-page-controls" aria-label="Display settings">
      <button type="button" className="atelier-language-toggle" onClick={switchLanguage} aria-label={isEnglish ? 'Switch to Georgian' : 'ინგლისურზე გადართვა'}>
        {isEnglish ? 'EN / KA' : 'KA / EN'}
      </button>
      <ThemeToggle />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <OtherPagesThemeToggle />
      <Suspense fallback={<div role="status" aria-busy="true" aria-label="გვერდი იტვირთება" style={{ minHeight: '100svh' }} />}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Accessible before logging in. */}
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductDetailsPage />} />

          {/* Account, cart and checkout require authentication. */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/confirm/:orderId" element={<ConfirmPaymentPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <SiteFooter />
    </BrowserRouter>
    </ThemeProvider>
  )
}
