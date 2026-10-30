import i18n from '../../shared/i18n/index'
import LocalizedText from '../../shared/i18n/LocalizedText'
import { useTranslation as useAtelierTranslation } from 'react-i18next'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

import { useCart } from '../../features/cart/model/useCart'
import { cartErrorText } from '../../features/cart/lib/cartErrors'

import './CartPage.css'

function formatPrice(
  amount: number,
  currency: string,
) {
  const formatted = amount.toLocaleString('ka-GE', {
    maximumFractionDigits: 2,
  })

  return `${formatted} ${currency === 'GEL' ? '₾' : currency}`
}

export default function CartPage() {
  useAtelierTranslation()
  const {
    cart,
    isLoading,
    isMutating,
    error,
    updateItem,
    removeItem,
    refreshCart,
  } = useCart()

  const [operationError, setOperationError] =
    useState<string | null>(null)

  async function handleQuantityChange(
    lineId: string,
    quantity: number,
  ) {
    if (
      isMutating ||
      isLoading ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      return
    }

    setOperationError(null)

    try {
      await updateItem(lineId, quantity)
    } catch (requestError) {
      setOperationError(
        cartErrorText(requestError),
      )
    }
  }

  async function handleRemove(lineId: string) {
    if (isMutating || isLoading) {
      return
    }

    setOperationError(null)

    try {
      await removeItem(lineId)
    } catch (requestError) {
      setOperationError(
        cartErrorText(requestError),
      )
    }
  }

  async function handleRetry() {
    setOperationError(null)

    try {
      await refreshCart()
    } catch (requestError) {
      setOperationError(
        cartErrorText(requestError),
      )
    }
  }

  const hasItems = Boolean(
    cart && cart.items.length > 0,
  )

  const currency = cart?.currency ?? 'GEL'

  return (
    <main className="cart-page">
      <div className="cart-container">
        <nav
          className="cart-navigation"
          aria-label={i18n.t("auto.078")}
        >
          <Link to="/home">
            <LocalizedText k="auto.079" /> </Link>

          <Link to="/catalog">
            <LocalizedText k="auto.080" /> </Link>
        </nav>

        <header className="cart-header">
          <p className="cart-eyebrow">
            <LocalizedText k="cart.breadcrumb" />
          </p>

          <h1><LocalizedText k="auto.081" /></h1>

          <p className="cart-subtitle">
            <LocalizedText k="auto.082" /> </p>
        </header>

        {error && (
          <div className="cart-error" role="alert">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => {
                void handleRetry()
              }}
              disabled={isLoading || isMutating}
            >
              <LocalizedText k="auto.083" /> </button>
          </div>
        )}

        {operationError &&
          operationError !== error && (
            <div
              className="cart-error"
              role="alert"
            >
              {operationError}
            </div>
          )}

        {isLoading ? (
          <div
            className="cart-state"
            role="status"
          >
            <div
              className="cart-spinner"
              aria-hidden="true"
            />

            <h2><LocalizedText k="auto.084" /></h2>

            <p>
              <LocalizedText k="auto.085" /> </p>
          </div>
        ) : !hasItems ? (
          <div className="cart-state">
            <span
              className="cart-empty-icon"
              aria-hidden="true"
            >
              <ShoppingBag size={48} strokeWidth={1.8} />
            </span>

            <h2><LocalizedText k="auto.086" /></h2>

            <p>
              <LocalizedText k="auto.087" /> </p>

            <Link
              className="cart-primary-link"
              to="/catalog"
            >
              <LocalizedText k="auto.088" /> </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section
              className="cart-items-section"
              aria-label={i18n.t("auto.089")}
            >
              <div className="cart-section-heading">
                <h2><LocalizedText k="auto.090" /></h2>

                <span>
                  {i18n.t("fix.cartCount", { count: cart?.totalQty ?? 0 })} </span>
              </div>

              <div className="cart-items">
                {cart?.items.map((item) => {
                  const stock = item.product.stock

                  const canDecrease =
                    item.qty > 1 && !isMutating && !isLoading

                  const canIncrease =
                    item.qty < 99 &&
                    item.product.inStock !== false &&
                    (stock === undefined ||
                      item.qty < stock) &&
                    !isMutating &&
                    !isLoading

                  return (
                    <article
                      className="cart-item"
                      key={item.id}
                    >
                      <Link
                        className="cart-item-image"
                        to={`/product/${item.product.slug}`}
                        aria-label={`${item.product.title} — დეტალები`}
                      >
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            loading="lazy"
                          />
                        ) : (
                          <span
                            className="cart-image-placeholder"
                            aria-hidden="true"
                          >
                            <LocalizedText k="auto.092" /> </span>
                        )}
                      </Link>

                      <div className="cart-item-content">
                        <div className="cart-item-top">
                          <Link
                            className="cart-item-title"
                            to={`/product/${item.product.slug}`}
                          >
                            {item.product.title}
                          </Link>

                          <button
                            type="button"
                            className="cart-remove-button"
                            aria-label={`${item.product.title} — წაშლა კალათიდან`}
                            disabled={isMutating || isLoading}
                            onClick={() => {
                              void handleRemove(item.id)
                            }}
                          >
                            <LocalizedText k="auto.024" /> </button>
                        </div>

                        <p className="cart-unit-price">
                          <LocalizedText k="auto.093" />{' '}
                          {formatPrice(
                            item.product.price,
                            currency,
                          )}
                        </p>

                        <p
                          className={
                            item.product.inStock === false
                              ? 'cart-stock cart-stock--unavailable'
                              : 'cart-stock'
                          }
                        >
                          {item.product.inStock === false
                            ? i18n.t("auto.094")
                            : typeof stock === 'number'
                              ? i18n.t("fix.available", { count: stock })
                              : i18n.t("auto.095")}
                        </p>

                        <div className="cart-item-bottom">
                          <div
                            className="cart-quantity"
                            aria-label={`${item.product.title} — რაოდენობა`}
                          >
                            <button
                              type="button"
                              aria-label={`${item.product.title} — რაოდენობის შემცირება`}
                              disabled={!canDecrease}
                              onClick={() => {
                                void handleQuantityChange(
                                  item.id,
                                  item.qty - 1,
                                )
                              }}
                            >
                              −
                            </button>

                            <output
                              aria-label={i18n.t("auto.096")}
                            >
                              {item.qty}
                            </output>

                            <button
                              type="button"
                              aria-label={`${item.product.title} — რაოდენობის გაზრდა`}
                              disabled={!canIncrease}
                              onClick={() => {
                                void handleQuantityChange(
                                  item.id,
                                  item.qty + 1,
                                )
                              }}
                            >
                              +
                            </button>
                          </div>

                          <strong className="cart-line-total">
                            {formatPrice(
                              item.lineTotal,
                              currency,
                            )}
                          </strong>
                        </div>

                        {typeof stock === 'number' &&
                          item.qty >= stock &&
                          item.product.inStock !== false && (
                            <p className="cart-stock-limit">
                              <LocalizedText k="auto.097" /> </p>
                          )}
                      </div>
                    </article>
                  )
                })}
              </div>

              <Link
                to="/catalog"
                className="cart-continue-link"
              >
                <LocalizedText k="auto.098" /> </Link>
            </section>

            <aside
              className="cart-summary"
              aria-labelledby="cart-summary-title"
            >
              <h2 id="cart-summary-title">
                <LocalizedText k="auto.099" /> </h2>

              <div className="cart-summary-row">
                <span><LocalizedText k="auto.100" /></span>

                <strong>
                  {cart?.totalQty ?? 0}
                </strong>
              </div>

              <div className="cart-summary-row">
                <span><LocalizedText k="auto.101" /></span>

                <strong>
                  {formatPrice(
                    cart?.subtotal ?? 0,
                    currency,
                  )}
                </strong>
              </div>

              <div className="cart-summary-divider" />

              <div
                className="cart-summary-total"
                aria-live="polite"
              >
                <span><LocalizedText k="auto.102" /></span>

                <strong>
                  {formatPrice(
                    cart?.subtotal ?? 0,
                    currency,
                  )}
                </strong>
              </div>

              <p className="cart-summary-note">
                <LocalizedText k="auto.103" /> </p>

              {isMutating && (
                <p
                  className="cart-saving"
                  role="status"
                >
                  <LocalizedText k="auto.104" /> </p>
              )}

              <Link
                className="cart-primary-link cart-summary-continue"
                to="/checkout"
              >
                <LocalizedText k="auto.105" /> </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}

