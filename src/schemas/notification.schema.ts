/**
 * Notification Zod schemas for local notification state management.
 * Validates notification data stored in localStorage.
 */

import { z } from 'zod/v4'

export const NotificationTypeSchema = z.enum([
  'GAME_START',
  'GAME_END',
  'UPCOMING_FIXTURE',
])

export const NotificationSchema = z.object({
  id: z.string(),
  type: NotificationTypeSchema,
  timestamp: z.string().datetime(),
  message: z.string(),
  link: z.string(),
  read: z.boolean(),
  matchId: z.number().int().optional(),
  expiresAt: z.string().datetime(),
})

export const NotificationStorageSchema = z.object({
  version: z.number().int(),
  notifications: z.array(NotificationSchema),
})

export type NotificationSchemaType = z.infer<typeof NotificationSchema>
export type NotificationTypeSchemaType = z.infer<typeof NotificationTypeSchema>
export type NotificationStorageSchemaType = z.infer<typeof NotificationStorageSchema>
