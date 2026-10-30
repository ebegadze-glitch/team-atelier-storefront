import LocalizedText from '../../shared/i18n/LocalizedText'

import { useState } from 'react'
import { Link } from 'react-router-dom'

import type {
  Address,
  AddressInput,
  UpdateAddressInput,
} from '../../features/addresses/api/addressesApi'
import type { AddressFormData } from '../../features/addresses/model/addressSchema'
import { useAddresses } from '../../features/addresses/model/useAddresses'
import AddressCard from '../../features/addresses/ui/AddressCard'
import AddressForm from '../../features/addresses/ui/AddressForm'

import Alert from '../../shared/ui/Alert'
import Button from '../../shared/ui/Button'
import './AddressesPage.css'

type FormMode =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'edit'; address: Address }

function toAddressInput(values: AddressFormData): AddressInput {
  return {
    label: values.label.trim() || null,
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    city: values.city.trim(),
    address: values.address.trim(),
    isDefault: values.isDefault,
  }
}

function getAddressChanges(
  original: Address,
  input: AddressInput,
): UpdateAddressInput {
  const changes: UpdateAddressInput = {}

  if (input.label !== original.label) {
    changes.label = input.label
  }

  if (input.fullName !== original.fullName) {
    changes.fullName = input.fullName
  }

  if (input.phone !== original.phone) {
    changes.phone = input.phone
  }

  if (input.city !== original.city) {
    changes.city = input.city
  }

  if (input.address !== original.address) {
    changes.address = input.address
  }

  // API accepts promotion, not explicit removal of default.
  if (input.isDefault && !original.isDefault) {
    changes.isDefault = true
  }

  return changes
}

function toFormValues(address: Address): AddressFormData {
  return {
    label: address.label ?? '',
    fullName: address.fullName,
    phone: address.phone,
    city: address.city,
    address: address.address,
    isDefault: address.isDefault,
  }
}

export default function AddressesPage() {
  const {
    addresses,
    isLoading,
    isMutating,
    error,
    success,
    clearMessages,
    addAddress,
    editAddress,
    setDefaultAddress,
    removeAddress,
  } = useAddresses()

  const [formMode, setFormMode] = useState<FormMode>({
    type: 'closed',
  })

  const formOpen = formMode.type !== 'closed'

  async function handleSave(values: AddressFormData) {
    if (formMode.type === 'closed') return

    const input = toAddressInput(values)

    if (formMode.type === 'create') {
      const saved = await addAddress(input)

      if (saved) {
        setFormMode({ type: 'closed' })
      }

      return
    }

    const changes = getAddressChanges(formMode.address, input)
    const saved = await editAddress(formMode.address.id, changes)

    if (saved) {
      setFormMode({ type: 'closed' })
    }
  }

  function handleEdit(address: Address) {
    clearMessages()
    setFormMode({ type: 'edit', address })
  }

  function handleDelete(address: Address) {
    const confirmed = window.confirm(
      `ნამდვილად გსურს მისამართის "${address.label || address.city}" წაშლა?`,
    )

    if (!confirmed) return

    void removeAddress(address.id)
  }

  return (
    <main className="addresses-page">
      <div className="addresses-container">
        <Link to="/profile" className="addresses-back">
          <LocalizedText k="auto.069" /> </Link>

        <header className="addresses-heading">
          <h1><LocalizedText k="auto.070" /></h1>
          <p><LocalizedText k="auto.071" /></p>
        </header>

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {!isLoading && !formOpen && (
          <Button
            type="button"
            disabled={addresses.length >= 10 || isMutating}
            onClick={() => {
              clearMessages()
              setFormMode({ type: 'create' })
            }}
          >
            <LocalizedText k="auto.072" /> </Button>
        )}

        {formMode.type === 'create' && (
          <section className="addresses-form-card">
            <h2><LocalizedText k="auto.073" /></h2>

            <AddressForm
              key="create"
              onSave={handleSave}
              onCancel={() => {
                clearMessages()
                setFormMode({ type: 'closed' })
              }}
            />
          </section>
        )}

        {formMode.type === 'edit' && (
          <section className="addresses-form-card">
            <h2><LocalizedText k="auto.074" /></h2>

            <AddressForm
              key={formMode.address.id}
              initialValues={toFormValues(formMode.address)}
              onSave={handleSave}
              onCancel={() => {
                clearMessages()
                setFormMode({ type: 'closed' })
              }}
            />
          </section>
        )}

        {isLoading && <p><LocalizedText k="auto.075" /></p>}

        {!isLoading && addresses.length === 0 && (
          <div className="addresses-empty">
            <p><LocalizedText k="auto.076" /></p>
          </div>
        )}

        {!isLoading && addresses.length > 0 && (
          <div className="addresses-list">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                disabled={isMutating || formOpen}
                onEdit={handleEdit}
                onSetDefault={(item) => {
                  void setDefaultAddress(item.id)
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {!isLoading && addresses.length >= 10 && (
          <p className="addresses-limit">
            <LocalizedText k="auto.008" /> </p>
        )}
      </div>
    </main>
  )
}
 