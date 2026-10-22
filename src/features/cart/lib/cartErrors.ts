import { isApiError } from '../../../shared/api/apiClient'

/** Use API error codes, not untranslated server messages, in cart UI. */
export function cartErrorText(
  error: unknown,
  fallback = 'კალათის განახლება ვერ მოხერხდა.',
): string {
  if (!isApiError(error)) {
    return fallback
  }

  switch (error.code) {
    case 'OUT_OF_STOCK':
      return 'პროდუქტი ამჟამად არ არის მარაგში.'

    case 'INSUFFICIENT_STOCK':
      return typeof error.available === 'number'
        ? `მარაგში დარჩენილია მხოლოდ ${error.available} ცალი.`
        : 'მოთხოვნილი რაოდენობა მარაგში არ არის.'

    case 'CART_ITEM_NOT_FOUND':
      return 'ეს პოზიცია კალათაში აღარ არის.'

    case 'PRODUCT_NOT_FOUND':
      return 'პროდუქტი აღარ არსებობს.'

    case 'NETWORK_ERROR':
      return 'ქსელთან დაკავშირება ვერ მოხერხდა.'

    case 'TOKEN_EXPIRED':
    case 'INVALID_TOKEN':
    case 'UNAUTHORIZED':
      return 'სესიის ვადა ამოიწურა. გთხოვ, შეხვიდე ხელახლა.'

    default:
      return fallback
  }
}
