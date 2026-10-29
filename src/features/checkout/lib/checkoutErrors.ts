import { isApiError } from '../../../shared/api/apiClient'

const messages: Record<string, string> = {
  NETWORK_ERROR: 'ქსელთან კავშირი ვერ შედგა. სცადე ხელახლა.',
  CARD_DECLINED: 'ბარათი უარყოფილია. სცადე სხვა ბარათი.',
  CART_EMPTY: 'კალათა ცარიელია.',
  INSUFFICIENT_STOCK: 'ზოგი პროდუქტის მოთხოვნილი რაოდენობა მარაგში აღარ არის.',
  VALIDATION_ERROR: 'შეამოწმე ფორმის მონაცემები.',
  INVALID_PAYMENT_CODE: 'კოდი არასწორია ან ვადაგასულია.',
  TOO_MANY_ATTEMPTS: 'ძალიან ბევრი მცდელობა. მოითხოვე ახალი კოდი.',
  RESEND_TOO_SOON: 'ახალი კოდის მოთხოვნამდე საჭიროა მოცდა.',
  RATE_LIMITED: 'მოთხოვნების ლიმიტი მიღწეულია. ცოტა ხანში სცადე.',
  ORDER_ALREADY_PAID: 'ეს შეკვეთა უკვე გადახდილია.',
}

export function checkoutErrorText(error: unknown): string {
  if (isApiError(error)) {
    return messages[error.code] ?? 'ოპერაცია ვერ შესრულდა. სცადე ხელახლა.'
  }
  return 'ოპერაცია ვერ შესრულდა. სცადე ხელახლა.'
}

export function stockDetails(error: unknown): string[] {
  if (!isApiError(error) || !Array.isArray(error.items)) return []
  return error.items.map((item) => {
    if (typeof item === 'string') return item
    if (typeof item !== 'object' || item === null) return 'პროდუქტი'
    const entry = item as Record<string, unknown>
    return String(entry.title ?? entry.productId ?? entry.product?.toString() ?? 'პროდუქტი')
  })
}
