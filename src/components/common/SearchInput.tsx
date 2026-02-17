'use client'

import { useState, useCallback } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { useEffect } from 'react'

interface SearchInputProps {
  readonly placeholder?: string
  readonly onSearch: (term: string) => void
  readonly delay?: number
  readonly externalValue?: string
}

export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  delay = 300,
  externalValue,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState('')
  const debouncedValue = useDebounce(inputValue, delay)

  useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  useEffect(() => {
    if (externalValue !== undefined && externalValue !== inputValue) {
      setInputValue(externalValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalValue])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
    },
    []
  )

  const handleClear = useCallback(() => {
    setInputValue('')
  }, [])

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-court-surface border border-court-border rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-hoop-orange/50 focus:ring-1 focus:ring-hoop-orange/30 transition-colors"
        aria-label="Search"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
          type="button"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
