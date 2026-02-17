'use client'

import { SearchInput } from '@/components/common/SearchInput'
import { useNavigation } from '@/hooks/use-navigation'
import { useSearch } from '@/hooks/use-search'
import { useCallback, useEffect, useRef } from 'react'

export function Header() {
  const { state, reset } = useNavigation()
  const { searchTerm, setSearchTerm } = useSearch()
  const previousView = useRef(state.currentView)

  useEffect(() => {
    if (state.currentView !== previousView.current) {
      previousView.current = state.currentView
      setSearchTerm('')
    }
  }, [state.currentView, setSearchTerm])

  const handleLogoClick = useCallback(() => {
    setSearchTerm('')
    reset()
  }, [reset, setSearchTerm])

  return (
    <header className="sticky top-0 z-40 bg-court-dark/95 backdrop-blur-md border-b border-court-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
          type="button"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hoop-orange to-hoop-orange-dark flex items-center justify-center shadow-lg animate-pulse-glow">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2 C12 2 12 22 12 22" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 12 C2 12 22 12 22 12" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4.93 4.93 C8 10 16 14 19.07 19.07" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-100 tracking-tight">
              BASKETBALL <span className="text-hoop-orange">CONNECT</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Queensland Basketball Hub
            </p>
          </div>
        </button>

        {/* Search */}
        <div className="w-full max-w-md">
          <SearchInput
            placeholder="Search teams, players, competitions..."
            onSearch={setSearchTerm}
            externalValue={searchTerm}
          />
        </div>
      </div>
    </header>
  )
}
