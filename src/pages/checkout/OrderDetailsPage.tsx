
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import {
  checkoutApi,
  type OrderSummary,
} from '../../features/checkout/api/checkoutApi'
import { checkoutErrorText } from '../../features/checkout/lib/checkoutErrors'
import { isApiError } from '../../shared/api/apiClient'

import './CheckoutPage.css'

function formatMoney(amount: number, currency = 'GEL'): string {
  const formatted = amount.toLocaleString('ka-GE', {
    maximumFractionDigits: 2,
  })

  return `${formatted} ${currency === 'GEL' ? '₾' : currency}`
}

function formatDate(value: string): string {
  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('ka-GE')
}

type OrderItem = NonNullable<OrderSummary['items']>[number]

function getProductTitle(item: OrderItem): string {
  // API may return a flat product title.
  if ('title' in item && typeof item.title === 'string') {
    const title = item.title.trim()

    if (title) {
      return title
    }
  }

  // Support the existing nested CartItem structure.
  if (item.product?.title) {
    return item.product.title
  }

  return 'პროდუქტი'
}

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      return
    }

    let active = true

    checkoutApi
      .getOrder(orderId)
      .then((result) => {
        if (!active) {
          return
        }

        const receivedOrder =
          'order' in result ? result.order : result

        setOrder(receivedOrder)
        setError(null)
        setLoading(false)
      })
      .catch((requestError: unknown) => {
        if (!active) {
          return
        }

        if (
          isApiError(requestError) &&
          requestError.code === 'UNAUTHORIZED'
        ) {
          navigate('/login', { replace: true })
          return
        }

        setOrder(null)
        setError(checkoutErrorText(requestError))
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [navigate, orderId])

  const orderNumber =
    order?.number ?? order?.orderId ?? order?.id ?? orderId

  const isPaid = order?.status === 'paid'

  return (
    <main className="checkout-page">
      <div className="checkout-wrap checkout-confirm-wrap">
        <Link to="/home" className="checkout-back">
          ← მთავარ გვერდზე დაბრუნება
        </Link>

        <section className="checkout-panel checkout-confirm">
          {loading && orderId ? (
            <p role="status">შეკვეთა იტვირთება...</p>
          ) : error || !order || !orderId ? (
            <>
              <h1>შეკვეთა ვერ ჩაიტვირთა</h1>

              <p role="alert">
                {error ?? 'შეკვეთის ნომერი არასწორია.'}
              </p>

              <button
                type="button"
                className="checkout-primary"
                onClick={() => window.location.reload()}
              >
                ხელახლა ცდა
              </button>
            </>
          ) : (
            <>
              <span
                className="checkout-confirm-icon"
                aria-hidden="true"
              >
                ✓
              </span>

              <p className="checkout-overline">
                ATELIER · ORDER
              </p>

              <h1>
                {isPaid
                  ? 'მადლობა! შეკვეთა გადახდილია'
                  : 'შეკვეთის დეტალები'}
              </h1>

              <p>
                შეკვეთა № <strong>{orderNumber}</strong>
              </p>

              {order.status && (
                <p>
                  სტატუსი:{' '}
                  <strong>
                    {isPaid ? 'გადახდილია' : order.status}
                  </strong>
                </p>
              )}

              {order.createdAt && (
                <p>თარიღი: {formatDate(order.createdAt)}</p>
              )}

              {Array.isArray(order.items) &&
                order.items.length > 0 && (
                  <div className="checkout-order-items">
                    <h2>შეკვეთილი პროდუქტები</h2>

                    {order.items.map((item, index) => (
                      <div
                        className="checkout-money-row"
                        key={item.id ?? index}
                      >
                        <span>
                          {getProductTitle(item)} × {item.qty}
                        </span>

                        <strong>
                          {formatMoney(
                            item.lineTotal,
                            order.currency,
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}

              {typeof order.total === 'number' && (
                <div className="checkout-money-row checkout-money-total">
                  <span>სულ</span>

                  <strong>
                    {formatMoney(
                      order.total,
                      order.currency,
                    )}
                  </strong>
                </div>
              )}

              {order.shipping && (
                <div className="checkout-order-items">
                  <h2>მიწოდების მისამართი</h2>

                  <p>{order.shipping.fullName}</p>
                  <p>{order.shipping.phone}</p>
                  <p>
                    {order.shipping.city}, {order.shipping.address}
                  </p>
                </div>
              )}

              {order.payment && (
                <div className="checkout-order-items">
                  <h2>გადახდა</h2>
                  <p>
                    {order.payment.brand ?? 'ბარათი'}
                    {' •••• '}
                    {order.payment.last4 ?? '••••'}
                  </p>
                </div>
              )}

              <Link
                className="checkout-primary checkout-link-primary"
                to="/catalog"
              >
                შოპინგის გაგრძელება →
              </Link>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
