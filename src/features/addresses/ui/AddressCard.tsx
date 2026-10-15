
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
  return (
    <article className="address-card">
      <div className="address-card-header">
        <h2>{address.label || 'მისამართი'}</h2>

        {address.isDefault && (
          <span className="address-default-badge">
            ძირითადი მისამართი
          </span>
        )}
      </div>

      <div className="address-card-details">
        <p>
          <strong>მიმღები:</strong> {address.fullName}
        </p>
        <p>
          <strong>ტელეფონი:</strong> {address.phone}
        </p>
        <p>
          <strong>ქალაქი:</strong> {address.city}
        </p>
        <p>
          <strong>მისამართი:</strong> {address.address}
        </p>
      </div>

      <div className="address-card-actions">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => onEdit(address)}
        >
          რედაქტირება
        </Button>

        {!address.isDefault && (
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={() => onSetDefault(address)}
          >
            ძირითადად მონიშვნა
          </Button>
        )}

        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => onDelete(address)}
        >
          წაშლა
        </Button>
      </div>
    </article>
  )
}

