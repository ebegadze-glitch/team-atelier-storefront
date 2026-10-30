import i18n from '../../../shared/i18n/index'

import { z } from 'zod'

export const addressSchema = z.object({
  label: z
    .string()
    .trim()
    .max(30, i18n.t("auto.001")),

  fullName: z
    .string()
    .trim()
    .min(2, i18n.t("auto.002")),

  phone: z
    .string()
    .trim()
    .min(9, i18n.t("auto.003"))
    .max(20, i18n.t("auto.004")),

  city: z
    .string()
    .trim()
    .min(2, i18n.t("auto.005")),

  address: z
    .string()
    .trim()
    .min(5, i18n.t("auto.006")),

  isDefault: z.boolean(),
})

export type AddressFormData = z.infer<typeof addressSchema>

