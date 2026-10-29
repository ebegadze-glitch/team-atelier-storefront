
import { apiClient } from '../../../shared/api/apiClient'
import type { CartItem } from '../../cart/api/cartApi'
import type {
  CheckoutFormData,
  ShippingData,
} from '../model/checkoutSchema'

export type SavedShippingAddress = ShippingData & {
  id: string
  label?: string | null
  isDefault?: boolean
}

export type CheckoutPreview = {
  items: CartItem[]
  subtotal: number
  shippingFee: number
  total: number
  currency?: string
  shipping?: Partial<ShippingData> | null
  addresses?: SavedShippingAddress[]
  freeShippingFrom?: number | null
}

export type CreateOrderResponse = {
  orderId: string
  /**
   * Development-only.
   * Never autofill or log this value.
   */
  devCode?: string
}

// The order API returns product information directly
// instead of using the cart's nested product structure.
export type OrderItem = {
  id?: string
  productId?: string
  slug?: string
  title?: string
  image?: string
  price: number
  qty: number
  lineTotal: number
  product?: CartItem['product']
}

export type OrderSummary = {
  id?: string
  orderId?: string
  number?: string
  status?: string
  createdAt?: string
  paidAt?: string

  items?: OrderItem[]

  subtotal?: number
  shippingFee?: number
  total?: number
  currency?: string

  shipping?: Partial<ShippingData>
  payment?: {
    brand?: string
    last4?: string
  }
}

export const checkoutApi = {
  getCheckout(): Promise<CheckoutPreview> {
    return apiClient<CheckoutPreview>('/checkout')
  },

  createOrder(
    values: CheckoutFormData,
  ): Promise<CreateOrderResponse> {
    return apiClient<CreateOrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        shipping: values.shipping,
        card: {
          number: values.card.number.replace(/\D/g, ''),
          holder: values.card.holder.trim(),
          expiry: values.card.expiry,
          cvc: values.card.cvc,
        },
      }),
    })
  },

  confirmOrder(
    orderId: string,
    code: string,
  ): Promise<{ status?: string }> {
    return apiClient(
      `/orders/${encodeURIComponent(orderId)}/confirm`,
      {
        method: 'POST',
        body: JSON.stringify({ code }),
      },
    )
  },

  resendCode(orderId: string): Promise<unknown> {
    return apiClient(
      `/orders/${encodeURIComponent(orderId)}/resend-code`,
      {
        method: 'POST',
      },
    )
  },

  getOrder(
    orderId: string,
  ): Promise<OrderSummary | { order: OrderSummary }> {
    return apiClient(
      `/orders/${encodeURIComponent(orderId)}`,
    )
  },
}
