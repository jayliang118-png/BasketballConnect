'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseApiDataOptions {
  readonly pollingInterval?: number | null
}

export interface UseApiDataResult<T> {
  readonly data: T | null
  readonly isLoading: boolean
  readonly error: string | null
  readonly refetch: () => void
}

export function useApiData<T>(
  fetcher: (() => Promise<T>) | null,
  deps: readonly unknown[] = [],
  options: UseApiDataOptions = {},
): UseApiDataResult<T> {
  const { pollingInterval = null } = options
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchCount, setFetchCount] = useState(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const refetch = useCallback(() => {
    setFetchCount((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (!fetcher) {
      setData(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = 'Something went wrong. Please try again later.'
          setError(message)
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCount, ...deps])

  useEffect(() => {
    if (!pollingInterval || pollingInterval <= 0) return

    const poll = () => {
      const fn = fetcherRef.current
      if (!fn || document.visibilityState === 'hidden') return
      fn()
        .then((result) => setData(result))
        .catch(() => {})
    }

    const id = setInterval(poll, pollingInterval)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') poll()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [pollingInterval])

  return { data, isLoading, error, refetch }
}
