import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { render, act } from '@testing-library/react'
import React from 'react'
import {
  NotificationProvider,
  NotificationContext,
} from '@/context/NotificationContext'
import type { NotificationContextValue } from '@/context/NotificationContext'
import { useNotifications } from '@/hooks/use-notifications'
import { NOTIFICATION_CAP } from '@/types/notification'
import { STORAGE_KEY } from '@/lib/notification-storage'

function makeNotificationInput(overrides = {}) {
  return {
    type: 'GAME_START' as const,
    timestamp: '2026-02-25T10:00:00.000Z',
    message: 'Test game started',
    link: '/game/123',
    matchId: 123,
    ...overrides,
  }
}

function TestConsumer({
  onRender,
}: {
  readonly onRender: (ctx: NotificationContextValue) => void
}) {
  const ctx = useNotifications()
  onRender(ctx)
  return null
}

describe('NotificationContext', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers({
      now: new Date('2026-02-25T12:00:00.000Z'),
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('NotificationProvider', () => {
    it('renders children', () => {
      const { container } = render(
        <NotificationProvider>
          <div>child</div>
        </NotificationProvider>,
      )
      expect(container.textContent).toBe('child')
    })

    it('initial state has empty notifications and isHydrated becomes true', async () => {
      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      expect(captured).not.toBeNull()
      expect(captured!.state.notifications).toEqual([])
      expect(captured!.isHydrated).toBe(true)
    })

    it('unreadCount is 0 initially', async () => {
      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      expect(captured!.unreadCount).toBe(0)
    })
  })

  describe('addNotification', () => {
    it('adds a notification to state', async () => {
      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      await act(async () => {
        captured!.addNotification(makeNotificationInput())
      })

      expect(captured!.state.notifications).toHaveLength(1)
    })

    it('generates id, expiresAt, and sets read to false', async () => {
      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      await act(async () => {
        captured!.addNotification(makeNotificationInput())
      })

      const notification = captured!.state.notifications[0]
      expect(typeof notification.id).toBe('string')
      expect(notification.id.length).toBeGreaterThan(0)
      expect(typeof notification.expiresAt).toBe('string')
      expect(notification.expiresAt.length).toBeGreaterThan(0)
      expect(notification.read).toBe(false)
    })

    it('increments unreadCount', async () => {
      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      await act(async () => {
        captured!.addNotification(makeNotificationInput())
      })

      expect(captured!.unreadCount).toBe(1)
    })

    it('multiple notifications maintain order (newest first)', async () => {
      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      await act(async () => {
        captured!.addNotification(makeNotificationInput({ message: 'First' }))
      })

      await act(async () => {
        captured!.addNotification(makeNotificationInput({ message: 'Second' }))
      })

      expect(captured!.state.notifications[0].message).toBe('Second')
      expect(captured!.state.notifications[1].message).toBe('First')
    })
  })

  describe('clearAll', () => {
    it('removes all notifications', async () => {
      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      await act(async () => {
        captured!.addNotification(makeNotificationInput({ message: 'One' }))
      })
      await act(async () => {
        captured!.addNotification(makeNotificationInput({ message: 'Two' }))
      })
      await act(async () => {
        captured!.addNotification(makeNotificationInput({ message: 'Three' }))
      })

      expect(captured!.state.notifications).toHaveLength(3)

      await act(async () => {
        captured!.clearAll()
      })

      expect(captured!.state.notifications).toHaveLength(0)
    })

    it('resets unreadCount to 0', async () => {
      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      await act(async () => {
        captured!.addNotification(makeNotificationInput())
      })

      expect(captured!.unreadCount).toBe(1)

      await act(async () => {
        captured!.clearAll()
      })

      expect(captured!.unreadCount).toBe(0)
    })
  })

  describe('cap enforcement', () => {
    it('evicts oldest when cap is reached', async () => {
      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      for (let i = 0; i < NOTIFICATION_CAP + 1; i++) {
        await act(async () => {
          captured!.addNotification(
            makeNotificationInput({
              message: `Notification ${i}`,
              timestamp: new Date(Date.now() + i * 1000).toISOString(),
            }),
          )
        })
      }

      expect(captured!.state.notifications).toHaveLength(NOTIFICATION_CAP)

      const messages = captured!.state.notifications.map((n) => n.message)
      expect(messages).not.toContain('Notification 0')
      expect(messages).toContain(`Notification ${NOTIFICATION_CAP}`)
    })
  })

  describe('hydration', () => {
    it('isHydrated becomes true after mount effect', async () => {
      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      expect(captured!.isHydrated).toBe(true)
    })

    it('loads persisted notifications from localStorage on mount', async () => {
      const storedNotification = {
        id: 'stored-001',
        type: 'GAME_START',
        timestamp: '2026-02-25T10:00:00.000Z',
        message: 'Stored game',
        link: '/game/456',
        read: false,
        matchId: 456,
        expiresAt: '2026-03-04T10:00:00.000Z',
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          notifications: [storedNotification],
        }),
      )

      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      expect(captured!.state.notifications).toHaveLength(1)
      expect(captured!.state.notifications[0].id).toBe('stored-001')
      expect(captured!.state.notifications[0].message).toBe('Stored game')
    })
  })

  describe('persistence', () => {
    it('saves to localStorage after adding notification', async () => {
      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      await act(async () => {
        captured!.addNotification(makeNotificationInput())
      })

      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.version).toBe(1)
      expect(parsed.notifications).toHaveLength(1)
      expect(parsed.notifications[0].message).toBe('Test game started')
    })

    it('saves empty array after clearAll', async () => {
      let captured: NotificationContextValue | null = null

      await act(async () => {
        render(
          <NotificationProvider>
            <TestConsumer onRender={(ctx) => { captured = ctx }} />
          </NotificationProvider>,
        )
      })

      await act(async () => {
        captured!.addNotification(makeNotificationInput())
      })

      await act(async () => {
        captured!.clearAll()
      })

      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.version).toBe(1)
      expect(parsed.notifications).toEqual([])
    })
  })

  describe('useNotifications hook', () => {
    it('throws when used outside provider', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)

      function BadConsumer() {
        useNotifications()
        return null
      }

      expect(() => {
        render(<BadConsumer />)
      }).toThrow('useNotifications must be used within a NotificationProvider')

      consoleSpy.mockRestore()
    })
  })
})
