'use client'

import { useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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

interface DivisionDetailTabsProps {
  readonly activeTab: string
  readonly competitionId: number
  readonly divisionId: number
  readonly orgKey: string
  readonly compKey: string
}

export function DivisionDetailTabs({
  activeTab,
  competitionId,
  divisionId,
  orgKey,
  compKey,
}: DivisionDetailTabsProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleTabChange = useCallback(
    (tab: TabType) => {
      router.replace(`${pathname}?tab=${tab}`, { scroll: false })
    },
    [router, pathname],
  )

  const currentTab = (activeTab as TabType) || 'teams'

  return (
    <div className="space-y-4">
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
        {currentTab === 'teams' && (
          <TeamList
            competitionId={competitionId}
            divisionId={divisionId}
            orgKey={orgKey}
            compKey={compKey}
          />
        )}
        {currentTab === 'fixtures' && (
          <FixtureList
            competitionId={competitionId}
            divisionId={divisionId}
            compKey={compKey}
          />
        )}
        {currentTab === 'ladder' && (
          <LadderTable
            competitionId={competitionId}
            divisionId={divisionId}
            orgKey={orgKey}
            compKey={compKey}
          />
        )}
        {currentTab === 'leaderboard' && (
          <Leaderboard divisionId={divisionId} />
        )}
      </div>
    </div>
  )
}
