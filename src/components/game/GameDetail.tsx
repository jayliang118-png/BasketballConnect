'use client'

import { useState, useCallback } from 'react'
import { useNavigation } from '@/hooks/use-navigation'
import { GameSummary } from './GameSummary'
import { ActionLog } from './ActionLog'
import { GameEvents } from './GameEvents'

type GameTabType = 'summary' | 'playbyplay' | 'events'

const GAME_TABS: readonly { readonly key: GameTabType; readonly label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'playbyplay', label: 'Play-by-Play' },
  { key: 'events', label: 'Events' },
]

export function GameDetail() {
  const [activeTab, setActiveTab] = useState<GameTabType>('summary')
  const { state } = useNavigation()
  const matchId = state.params.matchId as number | undefined
  const competitionUniqueKey = (state.params.competitionUniqueKey ?? state.params.competitionKey) as string | undefined

  const handleTabChange = useCallback((tab: GameTabType) => {
    setActiveTab(tab)
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-100">Game Detail</h2>

      {/* Tab bar */}
      <div className="flex border-b border-court-border">
        {GAME_TABS.map((tab) => (
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
        {activeTab === 'summary' && (
          <GameSummary matchId={matchId ?? null} competitionUniqueKey={competitionUniqueKey ?? null} />
        )}
        {activeTab === 'playbyplay' && (
          <ActionLog matchId={matchId ?? null} competitionId={competitionUniqueKey ?? null} />
        )}
        {activeTab === 'events' && (
          <GameEvents matchId={matchId ?? null} />
        )}
      </div>
    </div>
  )
}
