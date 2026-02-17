'use client'

import { useCallback } from 'react'
import { useApiData, type UseApiDataResult } from './use-api-data'

interface Organisation {
  readonly organisationUniqueKey: string
  readonly name: string
}

export function useOrganisations(): UseApiDataResult<readonly Organisation[]> {
  const fetcher = useCallback(async () => {
    const { fetchOrganisations } = await import('@/services/organisation.service')
    return fetchOrganisations() as Promise<readonly Organisation[]>
  }, [])

  return useApiData(fetcher, [])
}
