// ---------------------------------------------------------------------------
// ChatWelcome - Empty state with suggested queries for new users
// ---------------------------------------------------------------------------

'use client'

const SUGGESTED_QUERIES: readonly string[] = [
  'Show me all organisations',
  'Find team Spartan U18 Boys',
  'What competitions are available?',
  'Show top scorers in a division',
]

interface ChatWelcomeProps {
  readonly onSuggestionClick: (query: string) => void
}

export function ChatWelcome({ onSuggestionClick }: ChatWelcomeProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hoop-orange to-hoop-orange-dark flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 2 C12 2 12 22 12 22"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M2 12 C2 12 22 12 22 12"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <h3 className="text-sm font-semibold text-gray-200 mb-1">
        Basketball Assistant
      </h3>
      <p className="text-xs text-gray-500 mb-5">
        Ask me about teams, players, fixtures, and stats
      </p>

      <div className="flex flex-col gap-2 w-full">
        {SUGGESTED_QUERIES.map((query) => (
          <button
            key={query}
            onClick={() => onSuggestionClick(query)}
            type="button"
            className="text-left text-xs px-3 py-2 rounded-lg border border-court-border bg-court-elevated hover:border-hoop-orange/30 hover:bg-court-surface transition-colors text-gray-400 hover:text-gray-200"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  )
}
