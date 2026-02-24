export type NotificationType = 'GAME_START' | 'GAME_END' | 'UPCOMING_FIXTURE'

export interface Notification {
  readonly id: string
  readonly type: NotificationType
  readonly timestamp: string
  readonly message: string
  readonly link: string
  readonly read: boolean
  readonly matchId?: number
  readonly expiresAt: string
}

export interface NotificationsState {
  readonly notifications: readonly Notification[]
  readonly isHydrated: boolean
}

export const NOTIFICATION_CAP = 50
export const NOTIFICATION_TTL_MS = 7 * 24 * 60 * 60 * 1000
