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
  fullName: z.string().trim().min(2, 'შეიყვანე სახელი და გვარი (მინიმუმ 2 სიმბოლო)'),
  phone: z.string().trim().min(9, 'ნომერი უნდა იყოს მინიმუმ 9 სიმბოლო').max(20, 'ნომერი არ უნდა აღემატებოდეს 20 სიმბოლოს'),
  city: z.string().trim().min(1, 'მიუთითე ქალაქი'),
  address: z.string().trim().min(5, 'მისამართი უნდა იყოს მინიმუმ 5 სიმბოლო'),
})

export const checkoutSchema = z.object({
  shipping: shippingSchema,
  card: z.object({
    number: z.string().refine(passesLuhn, 'ბარათის ნომერი არასწორია'),
    holder: z.string().trim().min(2, 'მიუთითე ბარათის მფლობელი'),
    expiry: z.string().refine(isFutureExpiry, 'შეიყვანე მოქმედი ვადა MM/YY'),
    cvc: z.string().regex(/^\d{3,4}$/, 'CVC უნდა შეიცავდეს 3 ან 4 ციფრს'),
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
