import i18n from './index'

const validationKeys: Record<string, string> = {
  "Name must be at least 2 characters": "val.nameMin",
  "Email is required": "val.emailRequired",
  "Enter a valid email address": "val.emailInvalid",
  "Password must be at least 8 characters": "val.passwordMin",
  "Password must contain at least one letter": "val.passwordLetter",
  "Password must contain at least one number": "val.passwordNumber",
  "Please confirm your password": "val.confirmRequired",
  "Passwords do not match": "val.passwordMismatch",
  "Reset code is required": "val.codeRequired",
 }

export function localizeValidationError(message?: string): string | undefined {
  if (!message) return undefined
  const key = validationKeys[message]
  return key ? i18n.t(key) : message
}
