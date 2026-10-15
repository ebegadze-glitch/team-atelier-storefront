
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { useAuth } from '../../auth/model/useAuth'
import { cartApi, type Cart } from '../api/cartApi'
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

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return 'კალათის განახლება ვერ მოხერხდა.'
}

export function CartProvider({
  children,
}: CartProviderProps) {
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
        error: getErrorMessage(error),
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
          'კალათის შესაცვლელად საჭიროა ავტორიზაცია.',
        )
      }

      if (busyRef.current) {
        throw new Error(
          'დაელოდე მიმდინარე მოქმედების დასრულებას.',
        )
      }

      if (state.isLoading) {
        throw new Error(
          'დაელოდე კალათის ჩატვირთვას.',
        )
      }

      busyRef.current = true

      // Ignore older GET responses after a mutation starts.
      const generation = ++generationRef.current

      setState((previous) => ({
        ...previous,
        isMutating: true,
        error: null,
      }))

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
        if (
          mountedRef.current &&
          sessionRef.current === userId
        ) {
          setState((previous) => ({
            ...previous,
            isMutating: false,
            error: getErrorMessage(error),
          }))
        }

        throw error
      } finally {
        busyRef.current = false
      }
    },
    [state.isLoading, userId],
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
        throw new Error('პროდუქტის მონაცემები არასწორია.')
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
          'რაოდენობა უნდა იყოს 1-დან 99-მდე.',
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
        throw new Error('კალათის ჩანაწერის ID არასწორია.')
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

