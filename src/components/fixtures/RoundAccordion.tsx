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
    <div className="border border-court-border rounded-xl overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-court-elevated hover:bg-court-elevated/80 transition-colors"
        type="button"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-semibold text-gray-200">{roundName}</span>
        </div>
        <span className="text-xs text-gray-500 bg-court-dark px-2 py-0.5 rounded-full">
          {matchCount} {matchCount === 1 ? 'match' : 'matches'}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 py-3 space-y-3 bg-court-surface animate-fade-up">
          {children}
        </div>
      )}
    </div>
  )
}
