'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { useRouter } from 'next/navigation'
import { formatNotificationTimestamp } from '@/lib/notification-timestamp'
import type { NotificationType } from '@/types/notification'

interface NotificationDropdownProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case 'GAME_START':
      return (
        <svg className="w-4 h-4 text-green-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )
    case 'GAME_END':
      return (
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h12v12H6z" />
        </svg>
      )
    case 'UPCOMING_FIXTURE':
      return (
        <svg className="w-4 h-4 text-hoop-orange flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    default:
      return null
  }
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { state, markAsRead, clearAll } = useNotifications()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return undefined
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return undefined
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleNotificationClick = useCallback(
    (id: string, link: string) => {
      markAsRead(id)
      router.push(link)
      onClose()
    },
    [markAsRead, router, onClose],
  )

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-court-surface border border-court-border rounded-xl shadow-2xl z-50"
      role="menu"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-court-border">
        <h3 className="text-sm font-semibold text-gray-200">Notifications</h3>
        {state.notifications.length > 0 && (
          <button
            onClick={clearAll}
            type="button"
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {state.notifications.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <svg
            className="w-10 h-10 text-gray-600 mx-auto mb-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p className="text-sm text-gray-400">No notifications</p>
          <p className="text-xs text-gray-500 mt-1">
            {"You'll see updates here when your favorited teams have games"}
          </p>
        </div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          {state.notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id, notification.link)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleNotificationClick(notification.id, notification.link)
                }
              }}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-court-elevated ${
                notification.read ? '' : 'bg-court-elevated/50'
              }`}
              role="menuitem"
              tabIndex={0}
            >
              <div className="mt-0.5">
                {getTypeIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm line-clamp-2 ${
                    notification.read
                      ? 'text-gray-400'
                      : 'text-gray-100 font-medium'
                  }`}
                >
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatNotificationTimestamp(notification.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
