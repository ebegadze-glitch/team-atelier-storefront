import i18n from '../../../shared/i18n/index'
import LocalizedText from '../../../shared/i18n/LocalizedText'
import { useTranslation as useAtelierTranslation } from 'react-i18next'

import type { Address } from '../api/addressesApi'
import Button from '../../../shared/ui/Button'

type AddressCardProps = {
  address: Address
  disabled: boolean
  onEdit: (address: Address) => void
  onSetDefault: (address: Address) => void
  onDelete: (address: Address) => void
}

export default function AddressCard({
  address,
  disabled,
  onEdit,
  onSetDefault,
  onDelete,
}: AddressCardProps) {
  useAtelierTranslation()
  return (
    <article className="address-card">
      <div className="address-card-header">
        <h2>{address.label || i18n.t("auto.016")}</h2>

        {address.isDefault && (
          <span className="address-default-badge">
            <LocalizedText k="auto.017" /> </span>
        )}
      </div>

      <div className="address-card-details">
        <p>
          <strong><LocalizedText k="auto.018" /></strong> {address.fullName}
        </p>
        <p>
          <strong><LocalizedText k="auto.019" /></strong> {address.phone}
        </p>
        <p>
          <strong><LocalizedText k="auto.020" /></strong> {address.city}
        </p>
        <p>
          <strong><LocalizedText k="auto.021" /></strong> {address.address}
        </p>
      </div>

      <div className="address-card-actions">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => onEdit(address)}
        >
          <LocalizedText k="auto.022" /> </Button>

        {!address.isDefault && (
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={() => onSetDefault(address)}
          >
            <LocalizedText k="auto.023" /> </Button>
        )}

        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => onDelete(address)}
        >
          <LocalizedText k="auto.024" /> </Button>
      </div>
    </article>
  )
}

