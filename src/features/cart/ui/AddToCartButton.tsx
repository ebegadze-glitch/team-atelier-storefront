import i18n from '../../../shared/i18n/index'
import { useTranslation as useAtelierTranslation } from 'react-i18next'

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/model/useAuth'
import { useCart } from '../model/useCart'
import { cartErrorText } from '../lib/cartErrors'
import { isApiError } from '../../../shared/api/apiClient'
import './AddToCartButton.css'

type AddToCartButtonProps = {
  productId: string
  inStock?: boolean
  qty?: number
  className?: string
}

export function AddToCartButton({
  productId,
  inStock,
  qty = 1,
  className,
}: AddToCartButtonProps) {
  useAtelierTranslation()
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
      setMessage(i18n.t("auto.044"))
    } catch (caughtError: unknown) {
      if (
        isApiError(caughtError) &&
        [
          'TOKEN_EXPIRED',
          'INVALID_TOKEN',
          'UNAUTHORIZED',
        ].includes(caughtError.code)
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

      setError(
        cartErrorText(
          caughtError,
          i18n.t("auto.045"),
        ),
      )
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
        aria-label={i18n.t("auto.046")}
      >
        {isOutOfStock
          ? i18n.t("auto.047")
          : isSubmitting
            ? i18n.t("auto.048")
            : i18n.t("auto.046")}
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

