import i18n from '../../../shared/i18n/index'
import LocalizedText from '../../../shared/i18n/LocalizedText'
import { useTranslation as useAtelierTranslation } from 'react-i18next'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  addressSchema,
  type AddressFormData,
} from '../model/addressSchema'

import Button from '../../../shared/ui/Button'
import FormField from '../../../shared/ui/FormField'
import Input from '../../../shared/ui/Input'

type AddressFormProps = {
  initialValues?: AddressFormData
  onSave: (values: AddressFormData) => Promise<void>
  onCancel: () => void
}

export default function AddressForm({
  initialValues,
  onSave,
  onCancel,
}: AddressFormProps) {
  useAtelierTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialValues ?? {
      label: '',
      fullName: '',
      phone: '',
      city: '',
      address: '',
      isDefault: false,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate>
      <FormField
        label={i18n.t("auto.025")}
        htmlFor="address-label"
        error={errors.label?.message}
        errorId="address-label-error"
      >
        <Input
          id="address-label"
          placeholder={i18n.t("auto.026")}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.label)}
          aria-describedby={
            errors.label ? 'address-label-error' : undefined
          }
          {...register('label')}
        />
      </FormField>

      <FormField
        label={i18n.t("auto.027")}
        htmlFor="address-full-name"
        error={errors.fullName?.message}
        errorId="address-full-name-error"
      >
        <Input
          id="address-full-name"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={
            errors.fullName
              ? 'address-full-name-error'
              : undefined
          }
          {...register('fullName')}
        />
      </FormField>

      <FormField
        label={i18n.t("auto.028")}
        htmlFor="address-phone"
        error={errors.phone?.message}
        errorId="address-phone-error"
      >
        <Input
          id="address-phone"
          type="tel"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={
            errors.phone ? 'address-phone-error' : undefined
          }
          {...register('phone')}
        />
      </FormField>

      <FormField
        label={i18n.t("auto.029")}
        htmlFor="address-city"
        error={errors.city?.message}
        errorId="address-city-error"
      >
        <Input
          id="address-city"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.city)}
          aria-describedby={
            errors.city ? 'address-city-error' : undefined
          }
          {...register('city')}
        />
      </FormField>

      <FormField
        label={i18n.t("auto.030")}
        htmlFor="address-line"
        error={errors.address?.message}
        errorId="address-line-error"
      >
        <Input
          id="address-line"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.address)}
          aria-describedby={
            errors.address ? 'address-line-error' : undefined
          }
          {...register('address')}
        />
      </FormField>

      <label>
        <input
          type="checkbox"
          disabled={isSubmitting}
          {...register('isDefault')}
        />
        {' '}<LocalizedText k="auto.031" /> </label>

      <div className="address-form-actions">
        <Button type="submit" isLoading={isSubmitting}>
          <LocalizedText k="auto.032" /> </Button>

        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          <LocalizedText k="auto.033" /> </Button>
      </div>
    </form>
  )
}

