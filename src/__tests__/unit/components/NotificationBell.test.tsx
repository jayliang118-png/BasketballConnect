import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import '@testing-library/jest-dom/jest-globals'
import { render, screen, act, fireEvent } from '@testing-library/react'
import React from 'react'
import { NotificationProvider } from '@/context/NotificationContext'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { STORAGE_KEY } from '@/lib/notification-storage'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
}))

function makeStoredNotification(overrides: Record<string, unknown> = {}) {
  return {
    id: `notif-${Math.random().toString(36).slice(2)}`,
    type: 'GAME_START',
    timestamp: '2026-02-25T10:00:00.000Z',
    message: 'Test game started',
    link: '/game/123',
    read: false,
    matchId: 123,
    expiresAt: '2026-03-04T10:00:00.000Z',
    ...overrides,
  }
}

function seedLocalStorage(notifications: readonly Record<string, unknown>[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 1, notifications: [...notifications] }),
  )
}

function TestHarness({ children }: { readonly children: React.ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>
}

describe('NotificationBell', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
    jest.useFakeTimers({
      now: new Date('2026-02-25T12:00:00.000Z'),
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('renders bell icon', async () => {
    await act(async () => {
      render(
        <TestHarness>
          <NotificationBell />
        </TestHarness>,
      )
    })

    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
  })

  it('shows no badge when no unread notifications', async () => {
    await act(async () => {
      render(
        <TestHarness>
          <NotificationBell />
        </TestHarness>,
      )
    })

    const badge = screen.queryByText(/^\d+\+?$/)
    expect(badge).not.toBeInTheDocument()
  })

  it('shows badge with unread count', async () => {
    seedLocalStorage([
      makeStoredNotification({ id: 'n1', message: 'Game 1' }),
      makeStoredNotification({ id: 'n2', message: 'Game 2' }),
    ])

    await act(async () => {
      render(
        <TestHarness>
          <NotificationBell />
        </TestHarness>,
      )
    })

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows 9+ when unread count exceeds 9', async () => {
    const notifications = Array.from({ length: 10 }, (_, i) =>
      makeStoredNotification({ id: `n${i}`, message: `Game ${i}`, matchId: i })
    )
    seedLocalStorage(notifications)

    await act(async () => {
      render(
        <TestHarness>
          <NotificationBell />
        </TestHarness>,
      )
    })

    expect(screen.getByText('9+')).toBeInTheDocument()
  })

  it('toggles dropdown on click', async () => {
    await act(async () => {
      render(
        <TestHarness>
          <NotificationBell />
        </TestHarness>,
      )
    })

    const button = screen.getByLabelText('Notifications')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(button)
    })

    expect(screen.getByRole('menu')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(button)
    })

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('aria-expanded reflects open state', async () => {
    await act(async () => {
      render(
        <TestHarness>
          <NotificationBell />
        </TestHarness>,
      )
    })

    const button = screen.getByLabelText('Notifications')

    expect(button).toHaveAttribute('aria-expanded', 'false')

    await act(async () => {
      fireEvent.click(button)
    })

    expect(button).toHaveAttribute('aria-expanded', 'true')

    await act(async () => {
      fireEvent.click(button)
    })

    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})
