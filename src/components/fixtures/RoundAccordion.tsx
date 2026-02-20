'use client'

import { useState, useCallback } from 'react'

interface RoundAccordionProps {
  readonly roundName: string
  readonly children: React.ReactNode
  readonly matchCount: number
  readonly defaultOpen?: boolean
}

export function RoundAccordion({
  roundName,
  children,
  matchCount,
  defaultOpen = false,
}: RoundAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return (
    <div className="overflow-hidden">
      <button
        onClick={toggle}
        className={`w-full flex items-center justify-between px-5 py-3 bg-gray-700 hover:bg-gray-600 transition-colors ${isOpen ? 'rounded-t-xl' : 'rounded-xl'}`}
        type="button"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-4 h-4 text-white/80 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-semibold text-white">{roundName}</span>
        </div>
        <span className="text-xs text-white/80">
          {matchCount} {matchCount === 1 ? 'match' : 'matches'}
        </span>
      </button>

      {isOpen && (
        <div className="border border-t-0 border-court-border rounded-b-xl bg-court-surface divide-y divide-court-border/50 animate-fade-up">
          {children}
        </div>
      )}
    </div>
  )
}
