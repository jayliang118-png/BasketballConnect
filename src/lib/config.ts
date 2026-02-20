import { z } from 'zod/v4'

const envSchema = z.object({
  apiBaseUrl: z.string().min(1).default('/api/basketball'),
})

export type AppConfig = z.infer<typeof envSchema>

function createConfig(): AppConfig {
  const result = envSchema.safeParse({
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/basketball',
  })

  if (!result.success) {
    throw new Error(
      `Environment configuration error: ${JSON.stringify(result.error.issues, null, 2)}`,
    )
  }

  return result.data
}

export const config = createConfig()
