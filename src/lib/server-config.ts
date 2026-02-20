// ---------------------------------------------------------------------------
// Server-only configuration - never bundled into client code
// ---------------------------------------------------------------------------

import 'server-only'
import { z } from 'zod/v4'

const serverEnvSchema = z.object({
  apiToken: z.string().min(1, 'SQUADI_API_TOKEN is required'),
  apiBaseUrl: z.string().min(1).default('https://api-basketball.squadi.com'),
})

export type ServerConfig = z.infer<typeof serverEnvSchema>

function createServerConfig(): ServerConfig {
  const result = serverEnvSchema.safeParse({
    apiToken: process.env.SQUADI_API_TOKEN,
    apiBaseUrl:
      process.env.SQUADI_API_BASE_URL || 'https://api-basketball.squadi.com',
  })

  if (!result.success) {
    throw new Error(
      `Server configuration error: ${JSON.stringify(result.error.issues, null, 2)}`,
    )
  }

  return result.data
}

export const serverConfig = createServerConfig()
