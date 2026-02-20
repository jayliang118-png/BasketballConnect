// ---------------------------------------------------------------------------
// Server-side API client factory with Next.js caching support
// ---------------------------------------------------------------------------

import 'server-only'
import { ApiError } from '@/lib/api-client'
import { serverConfig } from '@/lib/server-config'

type QueryParamValue = string | number | boolean | undefined

interface QueryParams {
  readonly [key: string]: QueryParamValue
}

function buildUrl(
  baseUrl: string,
  path: string,
  params?: QueryParams,
): string {
  const url = new URL(path, baseUrl)

  if (params) {
    const entries = Object.entries(params).filter(
      (entry): entry is [string, string | number | boolean] =>
        entry[1] !== undefined,
    )
    for (const [key, value] of entries) {
      url.searchParams.append(key, String(value))
    }
  }

  return url.toString()
}

export async function serverFetch<T>(
  path: string,
  params?: QueryParams,
  revalidate?: number,
): Promise<T> {
  const url = buildUrl(serverConfig.apiBaseUrl, path, params)

  const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
    method: 'GET',
    headers: {
      Authorization: serverConfig.apiToken,
      'Content-Type': 'application/json',
    },
  }

  if (revalidate !== undefined) {
    fetchOptions.next = { revalidate }
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    const body = await response.text()
    throw new ApiError(
      `API request failed: ${response.status} ${response.statusText} for ${path}`,
      response.status,
      body,
    )
  }

  return (await response.json()) as T
}
