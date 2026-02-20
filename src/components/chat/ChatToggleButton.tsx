// ---------------------------------------------------------------------------
// ChatToggleButton - Floating action button to open/close the chat panel
// ---------------------------------------------------------------------------

'use client'

interface ChatToggleButtonProps {
  readonly isOpen: boolean
  readonly onClick: () => void
}

export function ChatToggleButton({ isOpen, onClick }: ChatToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      suppressHydrationWarning
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-hoop-orange to-hoop-orange-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
      aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
    >
      {isOpen ? (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      )}
    </button>
  )
}
