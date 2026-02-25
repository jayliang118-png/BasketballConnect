'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationDropdown } from './NotificationDropdown'

export function NotificationBell() {
  const { unreadCount, isHydrated } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)
  const prevCountRef = useRef(unreadCount)

  useEffect(() => {
    if (unreadCount > prevCountRef.current && unreadCount > 0) {
      setIsPulsing(true)
      const timer = setTimeout(() => {
        setIsPulsing(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = unreadCount
    return undefined
  }, [unreadCount])

  useEffect(() => {
    prevCountRef.current = unreadCount
  }, [unreadCount])

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const showBadge = isHydrated && unreadCount > 0
  const badgeText = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={handleToggle}
        type="button"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors ${
          isOpen
            ? 'border-hoop-orange/50 bg-court-elevated text-hoop-orange'
            : 'border-court-border bg-court-surface text-gray-400 hover:text-gray-200 hover:border-gray-600'
        }`}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="w-5 h-5"
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
        {showBadge && (
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none px-1${
              isPulsing ? ' animate-pulse' : ''
            }`}
          >
            {badgeText}
          </span>
        )}
      </button>
      <NotificationDropdown isOpen={isOpen} onClose={handleClose} />
    </div>
  )
}
