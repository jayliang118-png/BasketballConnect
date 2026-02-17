// ---------------------------------------------------------------------------
// Chat Schemas - Zod validation for chat API request/response
// ---------------------------------------------------------------------------

import { z } from 'zod/v4'

export const chatApiRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      }),
    )
    .max(20),
})

export const chatResultBlockSchema = z.object({
  type: z.enum([
    'organisations',
    'competitions',
    'divisions',
    'teams',
    'teamDetail',
    'playerProfile',
    'fixtures',
    'gameSummary',
    'stats',
    'text',
  ]),
  data: z.unknown(),
  summary: z.string().optional(),
})

export const chatApiResponseSchema = z.object({
  content: z.string(),
  results: z.array(chatResultBlockSchema),
})
