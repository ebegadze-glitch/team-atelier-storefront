
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

import { AuthProvider } from './features/auth/model/AuthProvider'
import { CartProvider } from './features/cart/model/CartProvider'

import './shared/styles/tokens.css'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found.')
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
 