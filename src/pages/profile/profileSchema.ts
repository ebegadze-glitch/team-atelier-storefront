import { z } from 'zod'

export const profileSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),

    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .pipe(z.email('Enter a valid email address')),

    currentPassword: z.string().refine((value) => value.trim().length > 0, 'შეიყვანე მიმდინარე პაროლი'),

    newPassword: z.string(),

    confirmNewPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword) {
      if (data.newPassword.length < 8) {
        ctx.addIssue({
          code: 'custom',
          path: ['newPassword'],
          message: 'Password must be at least 8 characters',
        })
      }

      if (!/[a-zA-Z]/.test(data.newPassword)) {
        ctx.addIssue({
          code: 'custom',
          path: ['newPassword'],
          message: 'Password must contain at least one letter',
        })
      }

      if (!/\d/.test(data.newPassword)) {
        ctx.addIssue({
          code: 'custom',
          path: ['newPassword'],
          message: 'Password must contain at least one number',
        })
      }

      if (data.newPassword !== data.confirmNewPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirmNewPassword'],
          message: 'Passwords do not match',
        })
      }
    } else if (data.confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'Enter a new password first',
      })
    }
  })

export type ProfileFormData = z.infer<typeof profileSchema>
