import i18n from '../../../shared/i18n/index'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
  type Address,
  type AddressInput,
  type UpdateAddressInput,
} from '../api/addressesApi'

import type { ApiError } from '../../../shared/api/apiClient'

function getAddressErrorMessage(error: unknown): string {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('code' in error) ||
    !('message' in error)
  ) {
    return i18n.t("auto.007")
  }

  const apiError = error as ApiError

  switch (apiError.code) {
    case 'ADDRESS_LIMIT_REACHED':
      return i18n.t("auto.008")

    case 'ADDRESS_NOT_FOUND':
      return i18n.t("auto.009")

    case 'VALIDATION_ERROR':
      return (
        Object.values(apiError.errors ?? {}).join(' ') ||
        apiError.message
      )

    case 'NETWORK_ERROR':
      return i18n.t("auto.010")

    default:
      return apiError.message
  }
}

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const mutationLock = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  const refreshAddresses = useCallback(async () => {
    const response = await getAddresses()

    if (mountedRef.current) {
      setAddresses(response.items)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadInitialAddresses() {
      try {
        const response = await getAddresses()

        if (active) {
          setAddresses(response.items)
          setError(null)
        }
      } catch (caughtError: unknown) {
        if (active) {
          setError(getAddressErrorMessage(caughtError))
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

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  const runMutation = useCallback(
    async (
      operation: () => Promise<unknown>,
      successMessage: string,
    ): Promise<boolean> => {
      if (mutationLock.current) {
        return false
      }

      mutationLock.current = true
      setIsMutating(true)
      clearMessages()

      try {
        // Step 1: Save the requested change.
        await operation()

        // Step 2: Refresh the authoritative server data.
        try {
          await refreshAddresses()
          if (mountedRef.current) {
            setSuccess(successMessage)
          }
        } catch (refreshError: unknown) {
          if (mountedRef.current) {
            setError(
              i18n.t("auto.011") +
                getAddressErrorMessage(refreshError),
            )
          }
        }

        // The mutation itself succeeded.
        return true
      } catch (caughtError: unknown) {
        if (mountedRef.current) {
          setError(getAddressErrorMessage(caughtError))
        }

        return false
      } finally {
        mutationLock.current = false

        if (mountedRef.current) {
          setIsMutating(false)
        }
      }
    },
    [clearMessages, refreshAddresses],
  )

  const addAddress = useCallback(
    (payload: AddressInput): Promise<boolean> =>
      runMutation(
        () => createAddress(payload),
        i18n.t("auto.012"),
      ),
    [runMutation],
  )

  const editAddress = useCallback(
    (
      id: string,
      changes: UpdateAddressInput,
    ): Promise<boolean> => {
      if (Object.keys(changes).length === 0) {
        return Promise.resolve(true)
      }

      return runMutation(
        () => updateAddress(id, changes),
        i18n.t("auto.013"),
      )
    },
    [runMutation],
  )

  const setDefaultAddress = useCallback(
    (id: string): Promise<boolean> =>
      runMutation(
        () => updateAddress(id, { isDefault: true }),
        i18n.t("auto.014"),
      ),
    [runMutation],
  )

  const removeAddress = useCallback(
    (id: string): Promise<boolean> =>
      runMutation(
        () => deleteAddress(id),
        i18n.t("auto.015"),
      ),
    [runMutation],
  )

  return {
    addresses,
    isLoading,
    isMutating,
    error,
    success,
    clearMessages,
    refreshAddresses,
    addAddress,
    editAddress,
    setDefaultAddress,
    removeAddress,
  }
}

