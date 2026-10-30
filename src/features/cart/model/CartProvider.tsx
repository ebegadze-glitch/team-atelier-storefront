import i18n from '../../../shared/i18n/index'
import { useTranslation as useAtelierTranslation } from 'react-i18next'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { useAuth } from '../../auth/model/useAuth'
import { cartApi, type Cart } from '../api/cartApi'
import { cartErrorText } from '../lib/cartErrors'
import { isApiError } from '../../../shared/api/apiClient'
import {
  CartContext,
  type CartContextValue,
} from './cartContext'

type CartProviderProps = {
  children: ReactNode
}

type CartState = {
  cart: Cart | null
  isLoading: boolean
  isMutating: boolean
  error: string | null
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  isMutating: false,
  error: null,
}

export function CartProvider({
  children,
}: CartProviderProps) {
  useAtelierTranslation()
  const { status, user } = useAuth()

  const isAuthenticated =
    status === 'authenticated' && user !== null

  const userId = isAuthenticated
    ? String(user.id)
    : null

  return (
    <CartSession
      key={userId ?? 'guest'}
      userId={userId}
    >
      {children}
    </CartSession>
  )
}

type CartSessionProps = {
  userId: string | null
  children: ReactNode
}

function CartSession({
  userId,
  children,
}: CartSessionProps) {
  useAtelierTranslation()
  const [state, setState] = useState<CartState>({
    ...initialState,
    isLoading: userId !== null,
  })

  const busyRef = useRef(false)
  const sessionRef = useRef(userId)
  const generationRef = useRef(0)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    sessionRef.current = userId

    return () => {
      mountedRef.current = false
      generationRef.current += 1
    }
  }, [userId])

  const refreshCart = useCallback(async () => {
    if (userId === null || busyRef.current) {
      return
    }

    const generation = ++generationRef.current

    setState((previous) => ({
      ...previous,
      isLoading: true,
      error: null,
    }))

    try {
      const nextCart = await cartApi.getCart()

      if (
        !mountedRef.current ||
        generation !== generationRef.current
      ) {
        return
      }

      setState((previous) => ({
        ...previous,
        cart: nextCart,
        isLoading: false,
        error: null,
      }))
    } catch (error: unknown) {
      if (
        !mountedRef.current ||
        generation !== generationRef.current
      ) {
        return
      }

      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: cartErrorText(error),
      }))
    }
  }, [userId])

  useEffect(() => {
    if (userId !== null) {
      void refreshCart()
    }
  }, [refreshCart, userId])

  const mutateCart = useCallback(
    async (
      operation: () => Promise<Cart>,
    ): Promise<void> => {
      if (userId === null) {
        throw new Error(
          i18n.t("auto.040"),
        )
      }

      // Ignore repeated clicks while the cart is busy.
      // The UI disables controls; this ref is a synchronous safety net.
      if (busyRef.current || state.isLoading) {
        return
      }

      busyRef.current = true

      // Ignore older GET responses after a mutation starts.
      const generation = ++generationRef.current

      setState((previous) => ({
        ...previous,
        isMutating: true,
        error: null,
      }))

      let needsRefresh = false

      try {
        const nextCart = await operation()

        if (
          !mountedRef.current ||
          generation !== generationRef.current ||
          sessionRef.current !== userId
        ) {
          return
        }

        setState({
          cart: nextCart,
          isLoading: false,
          isMutating: false,
          error: null,
        })
      } catch (error: unknown) {
        // Stale line item: reload the server's authoritative cart.
        needsRefresh =
          isApiError(error) && error.code === 'CART_ITEM_NOT_FOUND'

        if (
          mountedRef.current &&
          sessionRef.current === userId
        ) {
          setState((previous) => ({
            ...previous,
            isMutating: false,
            error: cartErrorText(error),
          }))
        }

        throw error
      } finally {
        busyRef.current = false

        if (
          needsRefresh &&
          mountedRef.current &&
          sessionRef.current === userId
        ) {
          void refreshCart()
        }
      }
    },
    [refreshCart, state.isLoading, userId],
  )

  const addItem = useCallback(
    async (
      productId: string,
      qty = 1,
    ): Promise<void> => {
      if (
        !productId.trim() ||
        !Number.isInteger(qty) ||
        qty < 1 ||
        qty > 99
      ) {
        throw new Error(i18n.t("auto.041"))
      }

      await mutateCart(() =>
        cartApi.addItem({ productId, qty }),
      )
    },
    [mutateCart],
  )

  const updateItem = useCallback(
    async (
      lineId: string,
      qty: number,
    ): Promise<void> => {
      if (
        !lineId.trim() ||
        !Number.isInteger(qty) ||
        qty < 1 ||
        qty > 99
      ) {
        throw new Error(
          i18n.t("auto.042"),
        )
      }

      await mutateCart(() =>
        cartApi.updateItem(lineId, { qty }),
      )
    },
    [mutateCart],
  )

  const removeItem = useCallback(
    async (lineId: string): Promise<void> => {
      if (!lineId.trim()) {
        throw new Error(i18n.t("auto.043"))
      }

      await mutateCart(() =>
        cartApi.removeItem(lineId),
      )
    },
    [mutateCart],
  )

  const contextValue: CartContextValue = {
    cart: userId === null ? null : state.cart,
    isLoading: userId !== null && state.isLoading,
    isMutating: state.isMutating,
    error: state.error,
    addItem,
    updateItem,
    removeItem,
    refreshCart,
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

