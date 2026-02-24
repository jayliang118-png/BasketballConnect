/**
 * localStorage read/write helpers for notification persistence.
 * Handles versioned storage, per-item schema validation,
 * expired notification cleanup, and graceful error handling.
 */

import { NotificationSchema } from '@/schemas/notification.schema'
import type { Notification } from '@/types/notification'

export const STORAGE_KEY = 'basketball-hub-notifications'

const CURRENT_VERSION = 1

/**
 * Load notifications from localStorage with validation and expiry cleanup.
 * Never throws -- returns empty array on any error.
 */
export function loadNotifications(): readonly Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []

    const parsed: unknown = JSON.parse(raw)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed)
    ) {
      return []
    }

    const record = parsed as Record<string, unknown>

    if (record.version !== CURRENT_VERSION) return []

    const notifications = record.notifications
    if (!Array.isArray(notifications)) return []

    const now = Date.now()

    return notifications
      .map((item) => NotificationSchema.safeParse(item))
      .filter((result) => result.success)
      .map((result) => result.data as Notification)
      .filter(
        (notification) => new Date(notification.expiresAt).getTime() > now,
      )
  } catch {
    return []
  }
}

/**
 * Save notifications to localStorage with versioned wrapper.
 * Never throws -- silently handles quota exceeded and unavailable storage.
 */
export function saveNotifications(
  notifications: readonly Notification[],
): void {
  try {
    const storage = {
      version: CURRENT_VERSION,
      notifications: [...notifications],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
  } catch {
    // Silently handle quota exceeded or unavailable localStorage
  }
}
