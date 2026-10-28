
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { checkoutApi } from '../../features/checkout/api/checkoutApi'
import {
  checkoutErrorText,
  stockDetails,
} from '../../features/checkout/lib/checkoutErrors'
import { useCart } from '../../features/cart/model/useCart'
import { useAuth } from '../../features/auth/model/useAuth'
import { isApiError } from '../../shared/api/apiClient'

import './CheckoutPage.css'

const RESEND_COOLDOWN_SECONDS = 30

function getStoredCooldown(key: string): number {
  try {
    const value = Number(sessionStorage.getItem(key))

    if (!Number.isFinite(value) || value <= 0) {
      return 0
    }

    return value
  } catch {
    return 0
  }
}

function saveCooldown(key: string, until: number): void {
  try {
    sessionStorage.setItem(key, String(until))
  } catch {
    // Countdown works even if storage is unavailable.
  }
}

export default function ConfirmPaymentPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { refreshCart } = useCart()
  const { user } = useAuth()

  const cooldownKey = `atelier-otp-cooldown-${user?.id ?? 'guest'}-${orderId ?? 'unknown'}`

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [stock, setStock] = useState<string[]>([])
  const [notice, setNotice] = useState<string | null>(null)

  const [cooldownUntil, setCooldownUntil] = useState<number>(() => {
    const stored = getStoredCooldown(cooldownKey)

    if (stored > Date.now()) {
      return stored
    }

    const initial =
      Date.now() + RESEND_COOLDOWN_SECONDS * 1000

    saveCooldown(cooldownKey, initial)

    return initial
  })

  const [now, setNow] = useState(() => Date.now())
  const [confirming, setConfirming] = useState(false)
  const [resending, setResending] = useState(false)

  const busy = useRef(false)
  const resendBusy = useRef(false)
  const cooldownUntilRef = useRef(cooldownUntil)

  const cooldown = Math.max(
    0,
    Math.ceil((cooldownUntil - now) / 1000),
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  function updateCooldown(seconds: number): void {
    const until =
      Date.now() + Math.max(0, seconds) * 1000

    cooldownUntilRef.current = until
    setCooldownUntil(until)
    setNow(Date.now())
    saveCooldown(cooldownKey, until)
  }

  async function handleConfirm(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !orderId ||
      busy.current ||
      resendBusy.current ||
      code.trim().length === 0
    ) {
      return
    }

    busy.current = true
    setConfirming(true)
    setError(null)
    setStock([])

    try {
      await checkoutApi.confirmOrder(orderId, code.trim())

      await refreshCart()

      navigate(`/orders/${encodeURIComponent(orderId)}`, {
        replace: true,
      })
    } catch (err: unknown) {
      if (isApiError(err)) {
        if (err.code === 'ORDER_ALREADY_PAID') {
          await refreshCart()

          navigate(
            `/orders/${encodeURIComponent(orderId)}`,
            { replace: true },
          )

          return
        }

        if (err.code === 'INSUFFICIENT_STOCK') {
          setStock(stockDetails(err))
        }

        if (err.code === 'TOO_MANY_ATTEMPTS') {
          updateCooldown(0)
        }
      }

      setError(checkoutErrorText(err))
    } finally {
      setConfirming(false)
      busy.current = false
    }
  }

  async function resend() {
    if (
      !orderId ||
      resendBusy.current ||
      busy.current ||
      Date.now() < cooldownUntilRef.current
    ) {
      return
    }

    resendBusy.current = true
    setResending(true)
    setError(null)
    setNotice(null)

    try {
      await checkoutApi.resendCode(orderId)

      updateCooldown(RESEND_COOLDOWN_SECONDS)
      setNotice('ახალი კოდი გაგზავნილია ელფოსტაზე.')
      setCode('')
    } catch (err: unknown) {
      if (
        isApiError(err) &&
        (
          err.code === 'RESEND_TOO_SOON' ||
          err.code === 'RATE_LIMITED'
        )
      ) {
        updateCooldown(
          Math.max(
            1,
            Math.ceil(
              err.retryAfterSeconds ??
                RESEND_COOLDOWN_SECONDS,
            ),
          ),
        )
      }

      setError(checkoutErrorText(err))
    } finally {
      resendBusy.current = false
      setResending(false)
    }
  }

  if (!orderId) {
    return (
      <main className="checkout-page">
        <div className="checkout-wrap checkout-state">
          <p>შეკვეთის იდენტიფიკატორი ვერ მოიძებნა.</p>
          <Link to="/cart">კალათაში დაბრუნება</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="checkout-page">
      <div className="checkout-wrap checkout-confirm-wrap">
        <Link
          to="/checkout"
          className="checkout-back"
        >
          ← ჩექაუთზე დაბრუნება
        </Link>

        <section className="checkout-panel checkout-confirm">
          <span
            className="checkout-confirm-icon"
            aria-hidden="true"
          >
            ✉
          </span>

          <p className="checkout-overline">
            ATELIER · PAYMENT VERIFICATION
          </p>

          <h1>დაადასტურე გადახდა</h1>

          <p>
            დადასტურების კოდი გამოგზავნილია{' '}
            {user?.email ? (
              <strong>{user.email}</strong>
            ) : (
              'შენს ელფოსტაზე'
            )}
            . კოდი მოქმედებს 10 წუთი.
          </p>

          <p className="checkout-hint">
            შეკვეთა: {orderId}
          </p>

          {notice && (
            <div
              className="checkout-success"
              role="status"
            >
              {notice}
            </div>
          )}

          {error && (
            <div
              className="checkout-error"
              role="alert"
            >
              {error}

              {stock.length > 0 && (
                <ul>
                  {stock.map((item, index) => (
                    <li key={`${item}-${index}`}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {stock.length > 0 && (
                <Link to="/cart">
                  კალათაში დაბრუნება →
                </Link>
              )}
            </div>
          )}

          <form
            noValidate
            onSubmit={(event) => {
              void handleConfirm(event)
            }}
          >
            <div className="checkout-field">
              <label htmlFor="paymentCode">
                ელფოსტით მიღებული კოდი
              </label>

              <input
                id="paymentCode"
                type="text"
                value={code}
                maxLength={12}
                autoComplete="one-time-code"
                inputMode="numeric"
                onChange={(event) => {
                  setCode(event.target.value.trim())
                }}
                aria-invalid={Boolean(error)}
                placeholder="შეიყვანე კოდი"
                required
              />
            </div>

            <button
              type="submit"
              className="checkout-primary"
              disabled={
                confirming ||
                resending ||
                !code.trim()
              }
            >
              {confirming
                ? 'მოწმდება...'
                : 'გადახდის დადასტურება'}
            </button>
          </form>

          <button
            className="checkout-resend"
            type="button"
            disabled={
              resending ||
              confirming ||
              cooldown > 0
            }
            onClick={() => {
              void resend()
            }}
          >
            {resending
              ? 'იგზავნება...'
              : cooldown > 0
                ? `ხელახლა გაგზავნა (${cooldown} წმ)`
                : 'ახალი კოდის მოთხოვნა'}
          </button>

          <p className="checkout-hint">
            სატესტო კოდი ნახე DevTools → Network →
            POST /orders პასუხში (devCode).
            ის ავტომატურად არ შეივსება.
          </p>
        </section>
      </div>
    </main>
  )
}
