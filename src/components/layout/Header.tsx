'use client'

import { useRouter, usePathname } from 'next/navigation'
import { SearchInput } from '@/components/common/SearchInput'
import { GlobalSearchDropdown } from '@/components/search/GlobalSearchDropdown'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { FavoritesHeaderButton } from '@/components/favorites/FavoritesHeaderButton'
import { useSearch } from '@/hooks/use-search'
import { useCallback, useEffect, useRef, useState } from 'react'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { setSearchTerm } = useSearch()
  const previousPathname = useRef(pathname)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [globalSearchTerm, setGlobalSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (pathname !== previousPathname.current) {
      previousPathname.current = pathname
      setGlobalSearchTerm('')
      setSearchTerm('')
      setShowDropdown(false)
    }
  }, [pathname, setSearchTerm])

  const handleLogoClick = useCallback(() => {
    setGlobalSearchTerm('')
    setSearchTerm('')
    setShowDropdown(false)
    router.push('/orgs')
  }, [router, setSearchTerm])

  const handleSearch = useCallback(
    (term: string) => {
      setGlobalSearchTerm(term)
      setShowDropdown(term.trim().length > 0)
      setSearchTerm('')
    },
    [setSearchTerm],
  )

  const handleCloseDropdown = useCallback(() => {
    setShowDropdown(false)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-court-dark border-b border-court-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
          type="button"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hoop-orange to-hoop-orange-dark flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2 C12 2 12 22 12 22" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 12 C2 12 22 12 22 12" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4.93 4.93 C8 10 16 14 19.07 19.07" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-100 tracking-tight">
              BASKETBALL <span className="text-hoop-orange">HUB</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Queensland Basketball Hub
            </p>
          </div>
        </button>

        {/* Search & Favorites */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div ref={searchContainerRef} className="relative w-full max-w-md">
            <SearchInput
              placeholder="Search all organisations, teams, players..."
              onSearch={handleSearch}
              externalValue={globalSearchTerm}
            />
            {showDropdown && (
              <GlobalSearchDropdown
                searchTerm={globalSearchTerm}
                onClose={handleCloseDropdown}
                containerRef={searchContainerRef}
              />
            )}
          </div>
          <ThemeToggle />
          <FavoritesHeaderButton />
        </div>
      </div>
    </header>
  )
}
