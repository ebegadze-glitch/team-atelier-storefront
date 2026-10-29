
import { apiClient } from '../../../shared/api/apiClient'

export type CartProduct = {
  id: string
  slug: string
  title: string
  image?: string | null
  price: number
  oldPrice?: number | null
  stock?: number
  inStock?: boolean
}

export type CartItem = {
  id: string
  productId: string
  qty: number
  lineTotal: number
  product: CartProduct
}

export type Cart = {
  items: CartItem[]
  totalQty: number
  subtotal: number
  currency: string
}

export type AddCartItemInput = {
  productId: string
  qty: number
}

export type UpdateCartItemInput = {
  qty: number
}

export const cartApi = {
  getCart(): Promise<Cart> {
    return apiClient<Cart>('/cart')
  },

  addItem(input: AddCartItemInput): Promise<Cart> {
    return apiClient<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  updateItem(
    lineId: string,
    input: UpdateCartItemInput,
  ): Promise<Cart> {
    return apiClient<Cart>(
      `/cart/items/${encodeURIComponent(lineId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    )
  },

  removeItem(lineId: string): Promise<Cart> {
    return apiClient<Cart>(
      `/cart/items/${encodeURIComponent(lineId)}`,
      {
        method: 'DELETE',
      },
    )
  },
}

