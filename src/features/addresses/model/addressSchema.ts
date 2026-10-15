
import { z } from 'zod'

export const addressSchema = z.object({
  label: z
    .string()
    .trim()
    .max(30, 'Label must be 30 characters or less'),

  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters'),

  phone: z
    .string()
    .trim()
    .min(9, 'Phone must contain at least 9 characters')
    .max(20, 'Phone must contain at most 20 characters'),

  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters'),

  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters'),

  isDefault: z.boolean(),
})

export type AddressFormData = z.infer<typeof addressSchema>

