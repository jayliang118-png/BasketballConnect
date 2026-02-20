// ---------------------------------------------------------------------------
// API Client - Typed fetch wrapper for the Squadi Basketball API
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  public readonly status: number
  public readonly body: string

  constructor(message: string, status: number, body: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export interface ApiClient {
  readonly get: <T>(path: string, params?: QueryParams) => Promise<T>
}

type QueryParamValue = string | number | boolean | undefined

interface QueryParams {
  readonly [key: string]: QueryParamValue
}

function buildUrl(baseUrl: string, path: string, params?: QueryParams): string {
  const isAbsolute = /^https?:\/\//i.test(baseUrl)

  const fullPath = isAbsolute
    ? new URL(path, baseUrl).toString()
    : `${baseUrl.replace(/\/+$/, '')}${path}`

  const url = new URL(fullPath, isAbsolute ? undefined : typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

  if (params) {
    const entries = Object.entries(params).filter(
      (entry): entry is [string, string | number | boolean] =>
        entry[1] !== undefined
    )
    for (const [key, value] of entries) {
      url.searchParams.append(key, String(value))
    }
  }

  return isAbsolute ? url.toString() : `${url.pathname}${url.search}`
}

export function createApiClient(baseUrl: string, token?: string): ApiClient {
  async function get<T>(path: string, params?: QueryParams): Promise<T> {
    const url = buildUrl(baseUrl, path, params)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = token
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const body = await response.text()
      throw new ApiError(
        `API request failed: ${response.status} ${response.statusText} for ${path}`,
        response.status,
        body,
      )
    }

    const data = await response.json() as T
    return data
  }

  return { get }
}
