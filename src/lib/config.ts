import { z } from 'zod/v4'

const envSchema = z.object({
  apiToken: z.string().min(1, 'API token is required'),
  apiBaseUrl: z.url().default('https://api-basketball.squadi.com'),
})

export type AppConfig = z.infer<typeof envSchema>

function createConfig(): AppConfig {
  const result = envSchema.safeParse({
    apiToken: process.env.NEXT_PUBLIC_SQUADI_API_TOKEN,
    apiBaseUrl: process.env.NEXT_PUBLIC_SQUADI_API_BASE_URL || 'https://api-basketball.squadi.com',
  })

  if (!result.success) {
    throw new Error(
      `Environment configuration error: ${JSON.stringify(result.error.issues, null, 2)}`
    )
  }

  return result.data
}

export const config = createConfig()
