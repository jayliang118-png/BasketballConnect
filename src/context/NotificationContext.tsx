'use client'

import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { loadNotifications, saveNotifications } from '@/lib/notification-storage'
import type { Notification, NotificationsState } from '@/types/notification'
import { NOTIFICATION_CAP, NOTIFICATION_TTL_MS } from '@/types/notification'

const INITIAL_STATE: NotificationsState = { notifications: [], isHydrated: false }

export interface NotificationContextValue {
  readonly state: NotificationsState
  readonly addNotification: (notification: Omit<Notification, 'id' | 'expiresAt' | 'read'>) => void
  readonly clearAll: () => void
  readonly unreadCount: number
  readonly isHydrated: boolean
}

export const NotificationContext = createContext<NotificationContextValue | null>(null)

interface NotificationProviderProps {
  readonly children: React.ReactNode
}

function generateId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, setState] = useState<NotificationsState>(INITIAL_STATE)

  useEffect(() => {
    try {
      const loaded = loadNotifications()
      setState({ notifications: loaded, isHydrated: true })
    } catch {
      setState({ notifications: [], isHydrated: true })
    }
  }, [])

  useEffect(() => {
    if (!state.isHydrated) return
    saveNotifications(state.notifications)
  }, [state.notifications, state.isHydrated])

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'expiresAt' | 'read'>) => {
      setState((prev) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
          expiresAt: new Date(Date.now() + NOTIFICATION_TTL_MS).toISOString(),
          read: false,
        }

        const currentNotifications = [...prev.notifications]

        if (currentNotifications.length >= NOTIFICATION_CAP) {
          const sorted = [...currentNotifications].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )
          const kept = sorted.slice(-(NOTIFICATION_CAP - 1))
          return { ...prev, notifications: [newNotification, ...kept] }
        }

        return { ...prev, notifications: [newNotification, ...currentNotifications] }
      })
    },
    [],
  )

  const clearAll = useCallback(() => {
    setState((prev) => ({ ...prev, notifications: [] }))
  }, [])

  const unreadCount = state.notifications.filter((n) => !n.read).length

  const isHydrated = state.isHydrated

  const value = useMemo<NotificationContextValue>(
    () => ({
      state,
      addNotification,
      clearAll,
      unreadCount,
      isHydrated,
    }),
    [state, addNotification, clearAll, unreadCount, isHydrated],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
