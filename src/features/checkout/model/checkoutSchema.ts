import i18n from '../../../shared/i18n/index'
import { z } from 'zod'

/** The browser formats card input; only digits go to the backend. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCardNumber(value: string): string {
  return digitsOnly(value).slice(0, 19).replace(/(.{4})/g, '$1 ').trim()
}

export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export function passesLuhn(value: string): boolean {
  const digits = digitsOnly(value)
  if (!/^\d{13,19}$/.test(digits)) return false
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

export function isFutureExpiry(value: string): boolean {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) return false
  const [month, year] = value.split('/').map(Number)
  const now = new Date()
  return 2000 + year > now.getFullYear() ||
    (2000 + year === now.getFullYear() && month >= now.getMonth() + 1)
}

export const shippingSchema = z.object({
  fullName: z.string().trim().min(2, i18n.t("auto.051")),
  phone: z.string().trim().min(9, i18n.t("auto.052")).max(20, i18n.t("auto.053")),
  city: z.string().trim().min(1, i18n.t("auto.054")),
  address: z.string().trim().min(5, i18n.t("auto.055")),
})

export const checkoutSchema = z.object({
  shipping: shippingSchema,
  card: z.object({
    number: z.string().refine(passesLuhn, i18n.t("auto.056")),
    holder: z.string().trim().min(2, i18n.t("auto.057")),
    expiry: z.string().refine(isFutureExpiry, i18n.t("auto.058")),
    cvc: z.string().regex(/^\d{3,4}$/, i18n.t("auto.059")),
  }),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
export type ShippingData = CheckoutFormData['shipping']

export const emptyCard: CheckoutFormData['card'] = {
  number: '', holder: '', expiry: '', cvc: '',
}
export const emptyShipping: ShippingData = {
  fullName: '', phone: '', city: '', address: '',
}
