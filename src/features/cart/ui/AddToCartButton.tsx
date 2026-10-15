
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/model/useAuth'
import { useCart } from '../model/useCart'
import './AddToCartButton.css'

type AddToCartButtonProps = {
  productId: string
  inStock?: boolean
  qty?: number
  className?: string
}

type CartError = {
  code?: string
  message?: string
  available?: number
}

function getCartErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return 'პროდუქტის დამატება ვერ მოხერხდა.'
  }

  const apiError = error as CartError

  switch (apiError.code) {
    case 'OUT_OF_STOCK':
      return 'პროდუქტი ამჟამად არ არის მარაგში.'

    case 'INSUFFICIENT_STOCK':
      return typeof apiError.available === 'number'
        ? `მარაგში დარჩენილია მხოლოდ ${apiError.available} ცალი.`
        : 'მოთხოვნილი რაოდენობა მარაგში არ არის.'

    case 'PRODUCT_NOT_FOUND':
      return 'პროდუქტი ვერ მოიძებნა.'

    default:
      return (
        apiError.message ||
        'პროდუქტის დამატება ვერ მოხერხდა.'
      )
  }
}

export function AddToCartButton({
  productId,
  inStock,
  qty = 1,
  className,
}: AddToCartButtonProps) {
  const { status } = useAuth()
  const { addItem, isMutating, isLoading } = useCart()

  const location = useLocation()
  const navigate = useNavigate()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isOutOfStock = inStock === false

  const isDisabled =
    isOutOfStock ||
    isSubmitting ||
    (status === 'authenticated' &&
      (isMutating || isLoading))

  async function handleAddToCart() {
    setMessage(null)
    setError(null)

    if (status !== 'authenticated') {
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        },
      })
      return
    }

    if (isOutOfStock) {
      return
    }

    setIsSubmitting(true)

    try {
      await addItem(productId, qty)
      setMessage('პროდუქტი დაემატა კალათაში.')
    } catch (caughtError: unknown) {
      const apiError = caughtError as CartError

      if (
        apiError?.code === 'TOKEN_EXPIRED' ||
        apiError?.code === 'INVALID_TOKEN' ||
        apiError?.code === 'UNAUTHORIZED'
      ) {
        navigate('/login', {
          state: {
            from: {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
            },
          },
        })
        return
      }

      setError(getCartErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="add-to-cart">
      <button
        type="button"
        className={className ?? 'add-to-cart-button'}
        onClick={() => void handleAddToCart()}
        disabled={isDisabled}
        aria-label="კალათაში დამატება"
      >
        {isOutOfStock
          ? 'არ არის მარაგში'
          : isSubmitting
            ? 'ემატება...'
            : 'კალათაში დამატება'}
      </button>

      {message && (
        <p role="status" className="add-to-cart-success">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="add-to-cart-error">
          {error}
        </p>
      )}
    </div>
  )
}

