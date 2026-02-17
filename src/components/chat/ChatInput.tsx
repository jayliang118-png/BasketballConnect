// ---------------------------------------------------------------------------
// ChatInput - Text input with send button for the chat panel
// ---------------------------------------------------------------------------

'use client'

import { useState, useCallback, type KeyboardEvent } from 'react'

interface ChatInputProps {
  readonly onSend: (message: string) => void
  readonly isLoading: boolean
  readonly placeholder?: string
}

export function ChatInput({
  onSend,
  isLoading,
  placeholder = 'Ask about teams, players, fixtures...',
}: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) {
      return
    }
    onSend(trimmed)
    setValue('')
  }, [value, isLoading, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  return (
    <div className="flex items-center gap-2 p-3 border-t border-court-border bg-court-dark/50">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 bg-court-elevated border border-court-border rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-hoop-orange/50 transition-colors disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading || !value.trim()}
        type="button"
        className="flex-shrink-0 w-9 h-9 rounded-lg bg-hoop-orange text-white flex items-center justify-center hover:bg-hoop-orange-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19V5m-7 7l7-7 7 7"
          />
        </svg>
      </button>
    </div>
  )
}
