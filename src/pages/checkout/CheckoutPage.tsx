import { useEffect, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../features/auth/model/useAuth'
import { checkoutApi, type CheckoutPreview } from '../../features/checkout/api/checkoutApi'
import {
  checkoutSchema,
  emptyCard,
  emptyShipping,
  formatCardNumber,
  formatExpiry,
  shippingSchema,
  type CheckoutFormData,
  type ShippingData,
} from '../../features/checkout/model/checkoutSchema'
import { checkoutErrorText, stockDetails } from '../../features/checkout/lib/checkoutErrors'
import { isApiError } from '../../shared/api/apiClient'

import './CheckoutPage.css'

function money(amount: number, currency = 'GEL'): string {
  return `${amount.toLocaleString('ka-GE', { maximumFractionDigits: 2 })} ${currency === 'GEL' ? '₾' : currency}`
}

function readDraft(key: string): Partial<ShippingData> | null {
  try {
    const value = sessionStorage.getItem(key)
    if (!value) return null
    const result = shippingSchema.partial().safeParse(JSON.parse(value))
    return result.success ? result.data : null
  } catch {
    return null
  }
}

const backendFields = [
  'shipping.fullName', 'shipping.phone', 'shipping.city', 'shipping.address',
  'card.number', 'card.holder', 'card.expiry', 'card.cvc',
] as const

function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const draftKey = `atelier-checkout-shipping-${user?.id ?? 'guest'}`

  const [preview, setPreview] = useState<CheckoutPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [stockItems, setStockItems] = useState<string[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const submitBusy = useRef(false)

  const {
    register, control, handleSubmit, reset, setValue, setError, setFocus,
    resetField, formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { shipping: emptyShipping, card: emptyCard },
    mode: 'onSubmit',
  })

  const shippingDraft = useWatch({ control, name: 'shipping' })

  useEffect(() => {
    let active = true
    void checkoutApi.getCheckout()
      .then((data) => {
        if (!active) return
        if (!Array.isArray(data.items) || data.items.length === 0) {
          navigate('/cart', { replace: true })
          return
        }
        const serverShipping: ShippingData = {
          fullName: data.shipping?.fullName ?? user?.name ?? '',
          phone: data.shipping?.phone ?? '',
          city: data.shipping?.city ?? '',
          address: data.shipping?.address ?? '',
        }
        reset({ shipping: { ...serverShipping, ...readDraft(draftKey) }, card: emptyCard })
        setPreview(data)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (!active) return
        if (isApiError(error) && error.code === 'CART_EMPTY') {
          navigate('/cart', { replace: true })
          return
        }
        setPageError(checkoutErrorText(error))
        setLoading(false)
      })
    return () => { active = false }
  }, [draftKey, navigate, reset, user?.name])

  useEffect(() => {
    if (!loading && preview && shippingDraft) {
      // Address-only draft: never persist or log card values.
      sessionStorage.setItem(draftKey, JSON.stringify(shippingDraft))
    }
  }, [draftKey, loading, preview, shippingDraft])

  function selectAddress(id: string) {
    setSelectedAddressId(id)
    const address = preview?.addresses?.find((item) => item.id === id)
    if (!address) return
    setValue('shipping', {
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      address: address.address,
    }, { shouldValidate: true, shouldDirty: true })
  }

  const submitOrder = async (values: CheckoutFormData) => {
    if (submitBusy.current) return
    submitBusy.current = true
    setPageError(null)
    setPaymentError(null)
    setStockItems([])

    try {
      const result = await checkoutApi.createOrder(values)
      if (!result.orderId) {
        throw new Error('Missing orderId')
      }
      // Remove sensitive values immediately after successful submission.
      resetField('card', { defaultValue: emptyCard })
      navigate(`/checkout/confirm/${encodeURIComponent(result.orderId)}`)
    } catch (error: unknown) {
      if (isApiError(error)) {
        if (error.code === 'CART_EMPTY') {
          navigate('/cart', { replace: true })
          return
        }
        if (error.code === 'CARD_DECLINED') {
          setPaymentError(checkoutErrorText(error))
          return
        }
        if (error.errors) {
          let first: (typeof backendFields)[number] | null = null
          for (const field of backendFields) {
            const message = error.errors[field]
            if (!message) continue
            if (!first) first = field
            setError(field, { type: 'server', message })
          }
          if (first) {
            setFocus(first)
            setPageError('შეამოწმე მონიშნული ველები.')
            return
          }
        }
        if (error.code === 'INSUFFICIENT_STOCK') {
          setStockItems(stockDetails(error))
        }
      }
      setPageError(checkoutErrorText(error))
    } finally {
      submitBusy.current = false
    }
  }

  if (loading) {
    return <main className="checkout-page"><div className="checkout-wrap" role="status">შეკვეთის მონაცემები იტვირთება...</div></main>
  }

  if (!preview) {
    return (
      <main className="checkout-page">
        <div className="checkout-wrap checkout-state">
          <h1>ჩექაუთი ვერ ჩაიტვირთა</h1>
          <p role="alert">{pageError}</p>
          <button type="button" onClick={() => window.location.reload()}>ხელახლა ცდა</button>
          <Link to="/cart">← კალათაში დაბრუნება</Link>
        </div>
      </main>
    )
  }

  const currency = preview.currency ?? 'GEL'
  const remaining = typeof preview.freeShippingFrom === 'number'
    ? Math.max(0, preview.freeShippingFrom - preview.subtotal)
    : 0

  return (
    <main className="checkout-page">
      <div className="checkout-wrap">
        <nav className="checkout-breadcrumb"><Link to="/cart">← კალათაში დაბრუნება</Link><span>ATELIER / CHECKOUT</span></nav>
        <header className="checkout-heading"><p>SECURE CHECKOUT</p><h1>შეკვეთის გაფორმება</h1><span>მიწოდება და სატესტო გადახდა ერთ გვერდზე</span></header>

        <form className="checkout-layout" noValidate onSubmit={(event) => { void handleSubmit(submitOrder)(event) }}>
          <div className="checkout-form-stack">
            {pageError && <div role="alert" className="checkout-error">
              <strong>{pageError}</strong>
              {stockItems.length > 0 && <ul>{stockItems.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>}
              {stockItems.length > 0 && <Link to="/cart">შეამოწმე კალათა →</Link>}
            </div>}

            <section className="checkout-panel" aria-labelledby="checkout-shipping-title">
              <div className="checkout-section-label"><span>01</span><h2 id="checkout-shipping-title">მიწოდების ინფორმაცია</h2></div>
              {(preview.addresses?.length ?? 0) > 0 && (
                <div className="checkout-field">
                  <label htmlFor="savedAddress">შენახული მისამართები</label>
                  <select id="savedAddress" value={selectedAddressId} onChange={(event) => selectAddress(event.target.value)}>
                    <option value="">მიმდინარე მონაცემები / ხელით შეყვანა</option>
                    {preview.addresses?.map((address) => (
                      <option key={address.id} value={address.id}>{address.label ?? address.city}{address.isDefault ? ' (ნაგულისხმევი)' : ''}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="checkout-fields-two">
                <div className="checkout-field">
                  <label htmlFor="shippingName">სახელი და გვარი</label>
                  <input id="shippingName" autoComplete="name" aria-invalid={Boolean(errors.shipping?.fullName)} aria-describedby={errors.shipping?.fullName ? 'shippingNameError' : undefined} {...register('shipping.fullName')} />
                  {errors.shipping?.fullName && <small role="alert" id="shippingNameError">{errors.shipping.fullName.message}</small>}
                </div>
                <div className="checkout-field">
                  <label htmlFor="shippingPhone">ტელეფონი</label>
                  <input id="shippingPhone" type="tel" autoComplete="tel" placeholder="+995 555 12 34 56" aria-invalid={Boolean(errors.shipping?.phone)} {...register('shipping.phone')} />
                  {errors.shipping?.phone && <small role="alert">{errors.shipping.phone.message}</small>}
                </div>
                <div className="checkout-field">
                  <label htmlFor="shippingCity">ქალაქი</label>
                  <input id="shippingCity" autoComplete="address-level2" aria-invalid={Boolean(errors.shipping?.city)} {...register('shipping.city')} />
                  {errors.shipping?.city && <small role="alert">{errors.shipping.city.message}</small>}
                </div>
                <div className="checkout-field">
                  <label htmlFor="shippingAddress">მისამართი</label>
                  <input id="shippingAddress" autoComplete="street-address" aria-invalid={Boolean(errors.shipping?.address)} {...register('shipping.address')} />
                  {errors.shipping?.address && <small role="alert">{errors.shipping.address.message}</small>}
                </div>
              </div>
              <p className="checkout-hint">ამ გვერდზე შესწორებული მისამართი მხოლოდ ამ შეკვეთას შეეხება.</p>
            </section>

            <section className="checkout-panel" aria-labelledby="checkout-payment-title">
              <div className="checkout-section-label"><span>02</span><h2 id="checkout-payment-title">სატესტო ბარათი</h2></div>
              <p className="checkout-hint">ეს სასწავლო გადახდაა — რეალური თანხა არ ჩამოიჭრება.</p>
              {paymentError && <div className="checkout-error" role="alert">{paymentError}</div>}
              <div className="checkout-field">
                <label htmlFor="cardNumber">ბარათის ნომერი</label>
                <Controller name="card.number" control={control} render={({ field }) => (
                  <input {...field} id="cardNumber" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" maxLength={23} aria-invalid={Boolean(errors.card?.number)} onChange={(event) => field.onChange(formatCardNumber(event.target.value))} />
                )} />
                {errors.card?.number && <small role="alert">{errors.card.number.message}</small>}
              </div>
              <div className="checkout-field">
                <label htmlFor="cardHolder">ბარათის მფლობელი</label>
                <input id="cardHolder" autoComplete="cc-name" placeholder="NAME SURNAME" aria-invalid={Boolean(errors.card?.holder)} {...register('card.holder')} />
                {errors.card?.holder && <small role="alert">{errors.card.holder.message}</small>}
              </div>
              <div className="checkout-fields-two">
                <div className="checkout-field">
                  <label htmlFor="cardExpiry">ვადა (MM/YY)</label>
                  <Controller name="card.expiry" control={control} render={({ field }) => (
                    <input {...field} id="cardExpiry" inputMode="numeric" autoComplete="cc-exp" placeholder="12/29" maxLength={5} aria-invalid={Boolean(errors.card?.expiry)} onChange={(event) => field.onChange(formatExpiry(event.target.value))} />
                  )} />
                  {errors.card?.expiry && <small role="alert">{errors.card.expiry.message}</small>}
                </div>
                <div className="checkout-field">
                  <label htmlFor="cardCvc">CVC</label>
                  <Controller name="card.cvc" control={control} render={({ field }) => (
                    <input {...field} id="cardCvc" type="password" inputMode="numeric" autoComplete="cc-csc" maxLength={4} placeholder="•••" aria-invalid={Boolean(errors.card?.cvc)} onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 4))} />
                  )} />
                  {errors.card?.cvc && <small role="alert">{errors.card.cvc.message}</small>}
                </div>
              </div>
            </section>
          </div>

          <aside className="checkout-panel checkout-summary" aria-labelledby="checkout-total-title">
            <h2 id="checkout-total-title">შეკვეთის შეჯამება</h2>
            <div className="checkout-items">
              {preview.items.map((item) => <div className="checkout-item" key={item.id}>
                {item.product.image ? <img src={item.product.image} alt="" /> : <div className="checkout-item-fallback" aria-hidden="true" />}
                <div><strong>{item.product.title}</strong><span>რაოდ.: {item.qty}</span></div>
                <b>{money(item.lineTotal, currency)}</b>
              </div>)}
            </div>
            <div className="checkout-money-row"><span>პროდუქტები</span><strong>{money(preview.subtotal, currency)}</strong></div>
            <div className="checkout-money-row"><span>მიწოდება</span><strong>{preview.shippingFee === 0 ? 'უფასო' : money(preview.shippingFee, currency)}</strong></div>
            {remaining > 0 && <p className="checkout-shipping-tip">კიდევ {money(remaining, currency)} და მიწოდება უფასოა.</p>}
            <div className="checkout-money-row checkout-money-total"><span>სულ</span><strong>{money(preview.total, currency)}</strong></div>
            <button type="submit" className="checkout-primary" disabled={isSubmitting}>
              {isSubmitting ? 'მუშავდება...' : `გადახდა — ${money(preview.total, currency)}`}
            </button>
            <p className="checkout-security">🔒 მონაცემები იგზავნება მხოლოდ სატესტო API-ში; ბარათი არ ინახება ბრაუზერში.</p>
          </aside>
        </form>
      </div>
    </main>
  )
}

export default CheckoutPage
