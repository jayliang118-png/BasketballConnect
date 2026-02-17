'use client'

import { useState, useCallback } from 'react'
import { useNavigation } from '@/hooks/use-navigation'
import { TeamList } from '@/components/teams/TeamList'
import { FixtureList } from '@/components/fixtures/FixtureList'
import { LadderTable } from '@/components/ladder/LadderTable'
import { Leaderboard } from '@/components/stats/Leaderboard'

type TabType = 'teams' | 'fixtures' | 'ladder' | 'leaderboard'

const TABS: readonly { readonly key: TabType; readonly label: string }[] = [
  { key: 'teams', label: 'Teams' },
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'ladder', label: 'Ladder' },
  { key: 'leaderboard', label: 'Leaderboard' },
]

export function DivisionDetail() {
  const [activeTab, setActiveTab] = useState<TabType>('teams')
  const { state } = useNavigation()
  const divisionName = state.params.divisionName as string | undefined

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
  }, [])

  return (
    <div className="space-y-4">
      {divisionName && (
        <h2 className="text-xl font-bold text-gray-100">{divisionName}</h2>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-court-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-hoop-orange'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            type="button"
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hoop-orange rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-up">
        {activeTab === 'teams' && <TeamList />}
        {activeTab === 'fixtures' && <FixtureList />}
        {activeTab === 'ladder' && <LadderTable />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </div>
    </div>
  )
}
