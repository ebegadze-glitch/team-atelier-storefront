import i18n from '../../../shared/i18n/index'
import { isApiError } from '../../../shared/api/apiClient'

/** Use API error codes, not untranslated server messages, in cart UI. */
export function cartErrorText(
  error: unknown,
  fallback = i18n.t("auto.034"),
): string {
  if (!isApiError(error)) {
    return fallback
  }

  switch (error.code) {
    case 'OUT_OF_STOCK':
      return i18n.t("auto.035")

    case 'INSUFFICIENT_STOCK':
      return typeof error.available === 'number'
        ? `მარაგში დარჩენილია მხოლოდ ${error.available} ცალი.`
        : i18n.t("auto.036")

    case 'CART_ITEM_NOT_FOUND':
      return i18n.t("auto.037")

    case 'PRODUCT_NOT_FOUND':
      return i18n.t("auto.038")

    case 'NETWORK_ERROR':
      return i18n.t("auto.010")

    case 'TOKEN_EXPIRED':
    case 'INVALID_TOKEN':
    case 'UNAUTHORIZED':
      return i18n.t("auto.039")

    default:
      return fallback
  }
}
