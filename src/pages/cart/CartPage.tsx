
import { useState } from 'react'
import { Link } from 'react-router-dom'

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
          aria-label="კალათის ნავიგაცია"
        >
          <Link to="/home">
            ← მთავარი გვერდი
          </Link>

          <Link to="/catalog">
            კატალოგი →
          </Link>
        </nav>

        <header className="cart-header">
          <p className="cart-eyebrow">
            ATELIER / SHOPPING CART
          </p>

          <h1>ჩემი კალათა</h1>

          <p className="cart-subtitle">
            შეამოწმე არჩეული პროდუქტები,
            რაოდენობა და ჯამური ღირებულება.
          </p>
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
              ხელახლა ცდა
            </button>
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

            <h2>კალათა იტვირთება...</h2>

            <p>
              გთხოვ, დაელოდე მონაცემების ჩატვირთვას.
            </p>
          </div>
        ) : !hasItems ? (
          <div className="cart-state">
            <span
              className="cart-empty-icon"
              aria-hidden="true"
            >
              🛍️
            </span>

            <h2>კალათა ცარიელია</h2>

            <p>
              კატალოგში აირჩიე სასურველი
              პროდუქტები და დაამატე კალათაში.
            </p>

            <Link
              className="cart-primary-link"
              to="/catalog"
            >
              პროდუქტების ნახვა →
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section
              className="cart-items-section"
              aria-label="არჩეული პროდუქტები"
            >
              <div className="cart-section-heading">
                <h2>პროდუქტები</h2>

                <span>
                  {cart?.totalQty ?? 0} ერთეული
                </span>
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
                            ფოტო არ არის
                          </span>
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
                            წაშლა
                          </button>
                        </div>

                        <p className="cart-unit-price">
                          ერთეულის ფასი:{' '}
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
                            ? 'ამჟამად არ არის მარაგში'
                            : typeof stock === 'number'
                              ? `ხელმისაწვდომია: ${stock} ერთეული`
                              : 'პროდუქტის მარაგი მოწმდება სერვერზე'}
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
                              aria-label="მიმდინარე რაოდენობა"
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
                              მიღწეულია ხელმისაწვდომი
                              მარაგის ზღვარი.
                            </p>
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
                ← შოპინგის გაგრძელება
              </Link>
            </section>

            <aside
              className="cart-summary"
              aria-labelledby="cart-summary-title"
            >
              <h2 id="cart-summary-title">
                შეკვეთის შეჯამება
              </h2>

              <div className="cart-summary-row">
                <span>პროდუქტების რაოდენობა</span>

                <strong>
                  {cart?.totalQty ?? 0}
                </strong>
              </div>

              <div className="cart-summary-row">
                <span>პროდუქტების ღირებულება</span>

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
                <span>სულ</span>

                <strong>
                  {formatPrice(
                    cart?.subtotal ?? 0,
                    currency,
                  )}
                </strong>
              </div>

              <p className="cart-summary-note">
                თანხა და რაოდენობა მიღებულია
                სერვერიდან. გადახდის პროცესი
                დაემატება FE-006 ეტაპზე.
              </p>

              {isMutating && (
                <p
                  className="cart-saving"
                  role="status"
                >
                  ცვლილებები ინახება...
                </p>
              )}

              <Link
                className="cart-primary-link cart-summary-continue"
                to="/catalog"
              >
                კატალოგში დაბრუნება →
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}

