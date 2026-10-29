
import { createContext } from 'react'
import type { Cart } from '../api/cartApi'

export type CartContextValue = {
  cart: Cart | null
  isLoading: boolean
  isMutating: boolean
  error: string | null
  addItem: (productId: string, qty?: number) => Promise<void>
  updateItem: (lineId: string, qty: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  refreshCart: () => Promise<void>
}

export const CartContext = createContext<CartContextValue | null>(
  null,
)
