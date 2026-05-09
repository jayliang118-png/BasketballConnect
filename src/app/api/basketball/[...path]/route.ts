// ---------------------------------------------------------------------------
// API Proxy - Forwards client requests to Squadi API with server-side token
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server'
import { serverConfig } from '@/lib/server-config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await params
  const apiPath = `/${path.join('/')}`

  try {
    const url = new URL(apiPath, serverConfig.apiBaseUrl)

    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: serverConfig.apiToken,
        'Content-Type': 'application/json',
        'User-Agent': 'BasketballConnect/1.0',
      },
    })

    if (!response.ok) {
      const body = await response.text()
      // Log full error for debugging
      console.error(`[API Proxy] ${response.status} for ${apiPath}:`, body)
      return NextResponse.json(
        {
          error: `Upstream API error: ${response.status}`,
          path: apiPath,
          detail: body.slice(0, 500)
        },
        { status: response.status },
      )
    }

    const data: unknown = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown proxy error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
