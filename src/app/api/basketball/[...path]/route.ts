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
      },
    })

    if (!response.ok) {
      const body = await response.text()
      return NextResponse.json(
        { error: `Upstream API error: ${response.status}` },
        { status: response.status, headers: { 'x-upstream-body': body.slice(0, 200) } },
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
