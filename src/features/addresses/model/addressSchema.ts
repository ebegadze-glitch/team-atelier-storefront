
import { z } from 'zod'

export const addressSchema = z.object({
  label: z
    .string()
    .trim()
    .max(30, 'დასახელება არ უნდა აღემატებოდეს 30 სიმბოლოს'),

  fullName: z
    .string()
    .trim()
    .min(2, 'მიმღების სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს'),

  phone: z
    .string()
    .trim()
    .min(9, 'ტელეფონი უნდა შეიცავდეს მინიმუმ 9 სიმბოლოს')
    .max(20, 'ტელეფონი არ უნდა აღემატებოდეს 20 სიმბოლოს'),

  city: z
    .string()
    .trim()
    .min(2, 'ქალაქის დასახელება უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს'),

  address: z
    .string()
    .trim()
    .min(5, 'მისამართი უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს'),

  isDefault: z.boolean(),
})

export type AddressFormData = z.infer<typeof addressSchema>

