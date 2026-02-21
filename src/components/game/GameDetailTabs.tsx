'use client'

import { useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { GameSummary } from './GameSummary'
import { ActionLog } from './ActionLog'
import { GameEvents } from './GameEvents'

type TabType = 'summary' | 'actionlog' | 'events'

const TABS: readonly { readonly key: TabType; readonly label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'actionlog', label: 'Action Log' },
  { key: 'events', label: 'Events' },
]

interface GameDetailTabsProps {
  readonly activeTab: string
  readonly matchId: number
  readonly competitionUniqueKey: string
  readonly competitionId: number
}

export function GameDetailTabs({
  activeTab,
  matchId,
  competitionUniqueKey,
  competitionId,
}: GameDetailTabsProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleTabChange = useCallback(
    (tab: TabType) => {
      const params = new URLSearchParams()
      if (competitionUniqueKey) params.set('compKey', competitionUniqueKey)
      if (competitionId) params.set('compId', String(competitionId))
      params.set('tab', tab)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, competitionUniqueKey, competitionId],
  )

  const currentTab = (activeTab as TabType) || 'summary'

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-100">Game Detail</h2>

      <div className="flex gap-1 bg-court-surface rounded-lg p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              currentTab === tab.key
                ? 'bg-hoop-orange text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-court-elevated'
            }`}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {currentTab === 'summary' && (
          <GameSummary matchId={matchId} competitionUniqueKey={competitionUniqueKey} competitionId={competitionId} />
        )}
        {currentTab === 'actionlog' && (
          <ActionLog matchId={matchId} competitionId={competitionUniqueKey} />
        )}
        {currentTab === 'events' && (
          <GameEvents matchId={matchId} />
        )}
      </div>
    </div>
  )
}
