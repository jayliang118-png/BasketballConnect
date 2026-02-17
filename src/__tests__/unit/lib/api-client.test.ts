import { createApiClient, ApiError } from '@/lib/api-client'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchSuccess(data: unknown, status = 200): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

function mockFetchFailure(status: number, body: string): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: 'Error',
    json: () => Promise.resolve({ message: body }),
    text: () => Promise.resolve(body),
  })
}

function mockFetchNetworkError(): void {
  global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createApiClient', () => {
  const BASE_URL = 'https://api-basketball.squadi.com'
  const TOKEN = 'test-api-token-123'

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns an object with a get method', () => {
    const client = createApiClient(BASE_URL, TOKEN)

    expect(client).toHaveProperty('get')
    expect(typeof client.get).toBe('function')
  })
})

describe('apiClient.get', () => {
  const BASE_URL = 'https://api-basketball.squadi.com'
  const TOKEN = 'test-api-token-123'

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // -----------------------------------------------------------------------
  // URL construction
  // -----------------------------------------------------------------------

  it('sends GET request to the correct URL', async () => {
    mockFetchSuccess({ result: 'ok' })
    const client = createApiClient(BASE_URL, TOKEN)

    await client.get('/users/api/organisations/all')

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(calledUrl).toBe(`${BASE_URL}/users/api/organisations/all`)
  })

  it('appends query params to the URL', async () => {
    mockFetchSuccess({ result: 'ok' })
    const client = createApiClient(BASE_URL, TOKEN)

    await client.get('/livescores/division', {
      competitionKey: 'abc-123',
      divisionId: 5,
    })

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(calledUrl).toContain('competitionKey=abc-123')
    expect(calledUrl).toContain('divisionId=5')
  })

  it('omits undefined params from the URL', async () => {
    mockFetchSuccess({ result: 'ok' })
    const client = createApiClient(BASE_URL, TOKEN)

    await client.get('/livescores/stats', {
      statType: 'points',
      offset: undefined,
      limit: 10,
    })

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(calledUrl).toContain('statType=points')
    expect(calledUrl).toContain('limit=10')
    expect(calledUrl).not.toContain('offset')
  })

  it('handles path with no params', async () => {
    mockFetchSuccess({ data: [] })
    const client = createApiClient(BASE_URL, TOKEN)

    await client.get('/simple/path')

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(calledUrl).toBe(`${BASE_URL}/simple/path`)
    expect(calledUrl).not.toContain('?')
  })

  it('handles empty params object', async () => {
    mockFetchSuccess({ data: [] })
    const client = createApiClient(BASE_URL, TOKEN)

    await client.get('/simple/path', {})

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(calledUrl).toBe(`${BASE_URL}/simple/path`)
  })

  // -----------------------------------------------------------------------
  // Authorization header
  // -----------------------------------------------------------------------

  it('sets Authorization header to the raw token (no Bearer prefix)', async () => {
    mockFetchSuccess({ result: 'ok' })
    const client = createApiClient(BASE_URL, TOKEN)

    await client.get('/test')

    const callOptions = (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit
    const headers = callOptions.headers as Record<string, string>
    expect(headers['Authorization']).toBe(TOKEN)
    expect(headers['Authorization']).not.toContain('Bearer')
  })

  it('sets Content-Type header to application/json', async () => {
    mockFetchSuccess({ result: 'ok' })
    const client = createApiClient(BASE_URL, TOKEN)

    await client.get('/test')

    const callOptions = (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit
    const headers = callOptions.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('uses GET method', async () => {
    mockFetchSuccess({ result: 'ok' })
    const client = createApiClient(BASE_URL, TOKEN)

    await client.get('/test')

    const callOptions = (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit
    expect(callOptions.method).toBe('GET')
  })

  // -----------------------------------------------------------------------
  // Successful responses
  // -----------------------------------------------------------------------

  it('returns parsed JSON for a successful response', async () => {
    const mockData = { id: 1, name: 'Test Organisation' }
    mockFetchSuccess(mockData)
    const client = createApiClient(BASE_URL, TOKEN)

    const result = await client.get<{ id: number; name: string }>('/test')

    expect(result).toEqual(mockData)
  })

  it('preserves generic typing on returned data', async () => {
    interface Team {
      readonly id: number
      readonly name: string
    }
    mockFetchSuccess({ id: 42, name: 'Lakers' })
    const client = createApiClient(BASE_URL, TOKEN)

    const result = await client.get<Team>('/teams/1')

    expect(result.id).toBe(42)
    expect(result.name).toBe('Lakers')
  })

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------

  it('throws ApiError on non-OK status', async () => {
    mockFetchFailure(404, 'Not found')
    const client = createApiClient(BASE_URL, TOKEN)

    await expect(client.get('/missing')).rejects.toThrow(ApiError)
  })

  it('includes status code in ApiError', async () => {
    mockFetchFailure(401, 'Unauthorized')
    const client = createApiClient(BASE_URL, TOKEN)

    try {
      await client.get('/protected')
      fail('Expected ApiError to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).status).toBe(401)
    }
  })

  it('includes response body in ApiError', async () => {
    mockFetchFailure(500, 'Internal Server Error')
    const client = createApiClient(BASE_URL, TOKEN)

    try {
      await client.get('/broken')
      fail('Expected ApiError to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).body).toBe('Internal Server Error')
    }
  })

  it('includes the request path in ApiError message', async () => {
    mockFetchFailure(403, 'Forbidden')
    const client = createApiClient(BASE_URL, TOKEN)

    try {
      await client.get('/secret')
      fail('Expected ApiError to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).message).toContain('/secret')
    }
  })

  it('throws on network errors (fetch rejection)', async () => {
    mockFetchNetworkError()
    const client = createApiClient(BASE_URL, TOKEN)

    await expect(client.get('/anywhere')).rejects.toThrow('Failed to fetch')
  })

  it('handles 400 Bad Request', async () => {
    mockFetchFailure(400, 'Bad Request')
    const client = createApiClient(BASE_URL, TOKEN)

    await expect(client.get('/bad')).rejects.toThrow(ApiError)
  })

  it('handles 429 Rate Limit', async () => {
    mockFetchFailure(429, 'Too Many Requests')
    const client = createApiClient(BASE_URL, TOKEN)

    try {
      await client.get('/rate-limited')
      fail('Expected ApiError to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).status).toBe(429)
    }
  })

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------

  it('encodes special characters in query params', async () => {
    mockFetchSuccess({ result: 'ok' })
    const client = createApiClient(BASE_URL, TOKEN)

    await client.get('/search', { q: 'hello world & more' })

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(calledUrl).toContain('q=hello+world+%26+more')
  })

  it('handles numeric and boolean param values', async () => {
    mockFetchSuccess({ result: 'ok' })
    const client = createApiClient(BASE_URL, TOKEN)

    await client.get('/test', { count: 0, active: false })

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(calledUrl).toContain('count=0')
    expect(calledUrl).toContain('active=false')
  })
})
