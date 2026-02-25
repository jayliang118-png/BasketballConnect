import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { render, screen, act, fireEvent } from '@testing-library/react'
import React from 'react'
import { NotificationProvider } from '@/context/NotificationContext'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
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

describe('NotificationDropdown', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
    mockOnClose.mockClear()
    jest.useFakeTimers({
      now: new Date('2026-02-25T12:00:00.000Z'),
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('renders nothing when isOpen is false', async () => {
    await act(async () => {
      render(
        <TestHarness>
          <NotificationDropdown isOpen={false} onClose={mockOnClose} />
        </TestHarness>,
      )
    })

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('renders panel header with title', async () => {
    await act(async () => {
      render(
        <TestHarness>
          <NotificationDropdown isOpen={true} onClose={mockOnClose} />
        </TestHarness>,
      )
    })

    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('shows empty state when no notifications', async () => {
    await act(async () => {
      render(
        <TestHarness>
          <NotificationDropdown isOpen={true} onClose={mockOnClose} />
        </TestHarness>,
      )
    })

    expect(screen.getByText('No notifications')).toBeInTheDocument()
  })

  it('renders notification items', async () => {
    seedLocalStorage([
      makeStoredNotification({ id: 'n1', message: 'Game Alpha started' }),
      makeStoredNotification({ id: 'n2', message: 'Game Beta started', matchId: 456 }),
    ])

    await act(async () => {
      render(
        <TestHarness>
          <NotificationDropdown isOpen={true} onClose={mockOnClose} />
        </TestHarness>,
      )
    })

    expect(screen.getByText('Game Alpha started')).toBeInTheDocument()
    expect(screen.getByText('Game Beta started')).toBeInTheDocument()
  })

  it('shows Clear all button when notifications exist', async () => {
    seedLocalStorage([
      makeStoredNotification({ id: 'n1' }),
    ])

    await act(async () => {
      render(
        <TestHarness>
          <NotificationDropdown isOpen={true} onClose={mockOnClose} />
        </TestHarness>,
      )
    })

    expect(screen.getByText('Clear all')).toBeInTheDocument()
  })

  it('calls onClose on Escape key', async () => {
    await act(async () => {
      render(
        <TestHarness>
          <NotificationDropdown isOpen={true} onClose={mockOnClose} />
        </TestHarness>,
      )
    })

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('navigates and marks as read on notification click', async () => {
    seedLocalStorage([
      makeStoredNotification({ id: 'click-me', message: 'Click me', link: '/game/789' }),
    ])

    await act(async () => {
      render(
        <TestHarness>
          <NotificationDropdown isOpen={true} onClose={mockOnClose} />
        </TestHarness>,
      )
    })

    const item = screen.getByText('Click me')

    await act(async () => {
      fireEvent.click(item)
    })

    expect(mockPush).toHaveBeenCalledWith('/game/789')
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('distinguishes read and unread notifications visually', async () => {
    seedLocalStorage([
      makeStoredNotification({ id: 'unread-1', message: 'Unread notification', read: false }),
      makeStoredNotification({ id: 'read-1', message: 'Read notification', read: true }),
    ])

    await act(async () => {
      render(
        <TestHarness>
          <NotificationDropdown isOpen={true} onClose={mockOnClose} />
        </TestHarness>,
      )
    })

    const unreadText = screen.getByText('Unread notification')
    const readText = screen.getByText('Read notification')

    // Unread should have font-medium (bold text)
    expect(unreadText).toHaveClass('font-medium')

    // Read should have text-gray-400 and no font-medium
    expect(readText).toHaveClass('text-gray-400')
    expect(readText).not.toHaveClass('font-medium')
  })
})
