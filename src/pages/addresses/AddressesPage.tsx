
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  createAddress,
  getAddresses,
  type Address,
  type AddressInput,
} from '../../features/addresses/api/addressesApi'

import AddressForm from '../../features/addresses/ui/AddressForm'
import type { AddressFormData } from '../../features/addresses/model/addressSchema'
import type { ApiError } from '../../shared/api/apiClient'

import Alert from '../../shared/ui/Alert'
import Button from '../../shared/ui/Button'

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadAddresses = useCallback(async () => {
    const response = await getAddresses()
    setAddresses(response.items)
  }, [])

  useEffect(() => {
    let active = true

    async function loadInitialAddresses() {
      try {
        const response = await getAddresses()

        if (active) {
          setAddresses(response.items)
        }
      } catch {
        if (active) {
          setError('მისამართების ჩატვირთვა ვერ მოხერხდა.')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialAddresses()

    return () => {
      active = false
    }
  }, [])

  const handleCreate = async (values: AddressFormData) => {
    setError(null)
    setSuccessMessage(null)

    const payload: AddressInput = {
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      city: values.city.trim(),
      address: values.address.trim(),
      isDefault: values.isDefault,
    }

    if (values.label.trim()) {
      payload.label = values.label.trim()
    }

    try {
      await createAddress(payload)

      setShowForm(false)

      await loadAddresses()

      setSuccessMessage('მისამართი წარმატებით დაემატა')
    } catch (caughtError: unknown) {
      if (isApiError(caughtError)) {
        if (caughtError.code === 'ADDRESS_LIMIT_REACHED') {
          setError('შესაძლებელია მაქსიმუმ 10 მისამართის შენახვა.')
        } else if (caughtError.code === 'VALIDATION_ERROR') {
          setError(caughtError.message)
        } else if (caughtError.code === 'NETWORK_ERROR') {
          setError('ქსელთან დაკავშირება ვერ მოხერხდა.')
        } else {
          setError(caughtError.message)
        }
      } else {
        setError('მისამართის შენახვა ვერ მოხერხდა.')
      }
    }
  }

  return (
    <main className="addresses-page">
      <div className="addresses-container">
        <Link to="/profile">
          ← პროფილზე დაბრუნება
        </Link>

        <h1>ჩემი მისამართები</h1>

        <p>მართე მიწოდების მისამართები.</p>

        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success">
            {successMessage}
          </Alert>
        )}

        {!isLoading && !showForm && (
          <Button
            type="button"
            disabled={addresses.length >= 10}
            onClick={() => {
              setError(null)
              setSuccessMessage(null)
              setShowForm(true)
            }}
          >
            + მისამართის დამატება
          </Button>
        )}

        {showForm && (
          <section aria-label="ახალი მისამართი">
            <h2>ახალი მისამართი</h2>

            <AddressForm
              onSave={handleCreate}
              onCancel={() => {
                setShowForm(false)
                setError(null)
              }}
            />
          </section>
        )}

        {isLoading && (
          <p>მისამართები იტვირთება...</p>
        )}

        {!isLoading && !error && addresses.length === 0 && (
          <p>მისამართები ჯერ არ გაქვს დამატებული.</p>
        )}

        {!isLoading && addresses.length > 0 && (
          <div className="addresses-list">
            {addresses.map((item) => (
              <article
                key={item.id}
                className="address-card"
              >
                <h2>{item.label || 'მისამართი'}</h2>

                {item.isDefault && (
                  <strong>ძირითადი მისამართი</strong>
                )}

                <p>მიმღები: {item.fullName}</p>
                <p>ტელეფონი: {item.phone}</p>
                <p>ქალაქი: {item.city}</p>
                <p>მისამართი: {item.address}</p>
              </article>
            ))}
          </div>
        )}

        {!isLoading && addresses.length >= 10 && (
          <p>
            მიღწეულია მაქსიმალური რაოდენობა — 10 მისამართი.
          </p>
        )}
      </div>
    </main>
  )
}

