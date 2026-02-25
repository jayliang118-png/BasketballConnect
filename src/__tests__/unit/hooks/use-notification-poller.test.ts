import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import type { FavoritesContextValue } from '@/context/FavoritesContext'
import { FavoritesContext } from '@/context/FavoritesContext'
import type { NotificationContextValue } from '@/context/NotificationContext'
import { NotificationContext } from '@/context/NotificationContext'

const mockExecutePoll = jest.fn().mockResolvedValue(undefined)
const mockCreatePollOrchestrator = jest.fn().mockReturnValue({
  executePoll: mockExecutePoll,
  get isFirstPoll() {
    return true
  },
})
const mockCreateCompetitionResolver = jest.fn().mockReturnValue({
  resolve: jest.fn(),
  clearCache: jest.fn(),
})

jest.mock('@/lib/notification-poll-orchestrator', () => ({
  createPollOrchestrator: (...args: unknown[]) =>
    mockCreatePollOrchestrator(...args),
}))

jest.mock('@/lib/competition-resolver', () => ({
  createCompetitionResolver: (...args: unknown[]) =>
    mockCreateCompetitionResolver(...args),
}))

jest.mock('@/lib/favorite-url-parser', () => ({
  groupFavoritesByDivision: jest.fn().mockReturnValue([]),
}))

import { useNotificationPoller } from '@/hooks/use-notification-poller'

function makeFavoritesValue(
  overrides: Partial<FavoritesContextValue> = {},
): FavoritesContextValue {
  return {
    state: { items: [], isHydrated: true },
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    updateFavorite: jest.fn(),
    isFavorite: jest.fn().mockReturnValue(false),
    toggleFavorite: jest.fn(),
    favoritesCount: 0,
    ...overrides,
  }
}

function makeNotificationValue(
  overrides: Partial<NotificationContextValue> = {},
): NotificationContextValue {
  return {
    state: { notifications: [], isHydrated: true },
    addNotification: jest.fn(),
    clearAll: jest.fn(),
    unreadCount: 0,
    isHydrated: true,
    ...overrides,
  }
}

function createWrapper(
  favoritesValue: FavoritesContextValue,
  notificationValue: NotificationContextValue,
) {
  return function Wrapper({ children }: { readonly children: React.ReactNode }) {
    return React.createElement(
      FavoritesContext.Provider,
      { value: favoritesValue },
      React.createElement(
        NotificationContext.Provider,
        { value: notificationValue },
        children,
      ),
    )
  }
}

describe('useNotificationPoller', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockExecutePoll.mockReset().mockResolvedValue(undefined)
    mockCreatePollOrchestrator.mockClear().mockReturnValue({
      executePoll: mockExecutePoll,
      get isFirstPoll() {
        return true
      },
    })
    mockCreateCompetitionResolver.mockClear().mockReturnValue({
      resolve: jest.fn(),
      clearCache: jest.fn(),
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('does not throw when mounted within both providers', () => {
    const favValue = makeFavoritesValue()
    const notifValue = makeNotificationValue()

    expect(() => {
      renderHook(() => useNotificationPoller(), {
        wrapper: createWrapper(favValue, notifValue),
      })
    }).not.toThrow()
  })

  it('no polling started when no team favorites exist', () => {
    const favValue = makeFavoritesValue({
      state: { items: [], isHydrated: true },
    })
    const notifValue = makeNotificationValue()

    renderHook(() => useNotificationPoller(), {
      wrapper: createWrapper(favValue, notifValue),
    })

    expect(mockExecutePoll).not.toHaveBeenCalled()
  })

  it('no polling started when favorites context is not hydrated', () => {
    const favValue = makeFavoritesValue({
      state: {
        items: [{ type: 'team', id: 'team-1', name: 'Eagles', url: '/orgs/bca/competitions/comp/divisions/1/teams/team-1' }],
        isHydrated: false,
      },
    })
    const notifValue = makeNotificationValue()

    renderHook(() => useNotificationPoller(), {
      wrapper: createWrapper(favValue, notifValue),
    })

    expect(mockExecutePoll).not.toHaveBeenCalled()
  })

  it('no polling started when notification context is not hydrated', () => {
    const favValue = makeFavoritesValue({
      state: {
        items: [{ type: 'team', id: 'team-1', name: 'Eagles', url: '/orgs/bca/competitions/comp/divisions/1/teams/team-1' }],
        isHydrated: true,
      },
    })
    const notifValue = makeNotificationValue({ isHydrated: false })

    renderHook(() => useNotificationPoller(), {
      wrapper: createWrapper(favValue, notifValue),
    })

    expect(mockExecutePoll).not.toHaveBeenCalled()
  })

  it('cleanup runs on unmount (no memory leaks)', () => {
    const { groupFavoritesByDivision } = require('@/lib/favorite-url-parser')
    groupFavoritesByDivision.mockReturnValue([
      { orgKey: 'bca', compKey: 'comp', divisionId: 1, teamKeys: ['team-1'] },
    ])

    const favValue = makeFavoritesValue({
      state: {
        items: [{ type: 'team', id: 'team-1', name: 'Eagles', url: '/orgs/bca/competitions/comp/divisions/1/teams/team-1' }],
        isHydrated: true,
      },
      favoritesCount: 1,
    })
    const notifValue = makeNotificationValue()

    const { unmount } = renderHook(() => useNotificationPoller(), {
      wrapper: createWrapper(favValue, notifValue),
    })

    mockExecutePoll.mockClear()

    unmount()

    act(() => {
      jest.advanceTimersByTime(120_000)
    })

    expect(mockExecutePoll).not.toHaveBeenCalled()
  })

  it('polling starts when team favorites exist and both contexts hydrated', () => {
    const { groupFavoritesByDivision } = require('@/lib/favorite-url-parser')
    groupFavoritesByDivision.mockReturnValue([
      { orgKey: 'bca', compKey: 'comp', divisionId: 1, teamKeys: ['team-1'] },
    ])

    const favValue = makeFavoritesValue({
      state: {
        items: [{ type: 'team', id: 'team-1', name: 'Eagles', url: '/orgs/bca/competitions/comp/divisions/1/teams/team-1' }],
        isHydrated: true,
      },
      favoritesCount: 1,
    })
    const notifValue = makeNotificationValue()

    renderHook(() => useNotificationPoller(), {
      wrapper: createWrapper(favValue, notifValue),
    })

    // Initial poll fires immediately
    expect(mockExecutePoll).toHaveBeenCalled()
  })
})
