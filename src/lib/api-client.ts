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
  const url = new URL(path, baseUrl)

  if (params) {
    const entries = Object.entries(params).filter(
      (entry): entry is [string, string | number | boolean] =>
        entry[1] !== undefined
    )
    for (const [key, value] of entries) {
      url.searchParams.append(key, String(value))
    }
  }

  return url.toString()
}

export function createApiClient(baseUrl: string, token: string): ApiClient {
  async function get<T>(path: string, params?: QueryParams): Promise<T> {
    const url = buildUrl(baseUrl, path, params)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
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
