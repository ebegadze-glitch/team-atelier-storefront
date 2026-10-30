import i18n from '../../../shared/i18n/index'
import { isApiError } from '../../../shared/api/apiClient'

const messages: Record<string, [string,string]> = {
  NETWORK_ERROR: ['ქსელთან კავშირი ვერ შედგა. სცადე ხელახლა.', "Network connection failed. Try again."],
  CARD_DECLINED: ['ბარათი უარყოფილია. სცადე სხვა ბარათი.', "Card declined. Try another card."],
  CART_EMPTY: ['კალათა ცარიელია.', "Your cart is empty."],
  INSUFFICIENT_STOCK: ['ზოგი პროდუქტის მოთხოვნილი რაოდენობა მარაგში აღარ არის.', "Some requested items are no longer available."],
  VALIDATION_ERROR: ['შეამოწმე ფორმის მონაცემები.', "Please check the form details."],
  INVALID_PAYMENT_CODE: ['კოდი არასწორია ან ვადაგასულია.', "The code is invalid or expired."],
  TOO_MANY_ATTEMPTS: [i18n.t("auto.077"), "Too many attempts. Request a new code."],
  RESEND_TOO_SOON: ['ახალი კოდის მოთხოვნამდე საჭიროა მოცდა.', "Please wait before requesting another code."],
  RATE_LIMITED: ['მოთხოვნების ლიმიტი მიღწეულია. ცოტა ხანში სცადე.', "Request limit reached. Try again later."],
  ORDER_ALREADY_PAID: ['ეს შეკვეთა უკვე გადახდილია.', "This order has already been paid."],
}

export function checkoutErrorText(error: unknown): string {
  if (isApiError(error)) {
    return messages[error.code]?.[i18n.language === "en" ? 1 : 0] ?? i18n.t("auto.049")
  }
  return i18n.t("auto.049")
}

export function stockDetails(error: unknown): string[] {
  if (!isApiError(error) || !Array.isArray(error.items)) return []
  return error.items.map((item) => {
    if (typeof item === 'string') return item
    if (typeof item !== 'object' || item === null) return i18n.t("auto.050")
    const entry = item as Record<string, unknown>
    return String(entry.title ?? entry.productId ?? entry.product?.toString() ?? i18n.t("auto.050"))
  })
}
