
import { apiClient } from '../../../shared/api/apiClient'

export type Address = {
  id: string
  label: string | null
  fullName: string
  phone: string
  city: string
  address: string
  isDefault: boolean
  createdAt: string
}

export type AddressInput = {
  label?: string | null
  fullName: string
  phone: string
  city: string
  address: string
  isDefault?: boolean
}

export type UpdateAddressInput = Partial<AddressInput>

export function getAddresses() {
  return apiClient<{ items: Address[] }>('/addresses', {
    method: 'GET',
  })
}

export function createAddress(payload: AddressInput) {
  return apiClient<{ address: Address }>('/addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAddress(
  id: string,
  payload: UpdateAddressInput,
) {
  return apiClient<{ address: Address }>(
    `/addresses/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
}

export function deleteAddress(id: string) {
  return apiClient<void>(
    `/addresses/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
  )
}

