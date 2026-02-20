'use client'

import { useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { TeamRoster } from '@/components/teams/TeamRoster'
import { TeamFixtures } from '@/components/teams/TeamFixtures'

type TabType = 'roster' | 'fixtures'

const TABS: readonly { readonly key: TabType; readonly label: string }[] = [
  { key: 'roster', label: 'Roster' },
  { key: 'fixtures', label: 'Fixtures' },
]

interface TeamDetailTabsProps {
  readonly activeTab: string
  readonly teamKey: string
  readonly teamName: string
  readonly competitionId: number
  readonly divisionId: number
  readonly orgKey: string
  readonly compKey: string
}

export function TeamDetailTabs({
  activeTab,
  teamKey,
  teamName,
  competitionId,
  divisionId,
  orgKey,
  compKey,
}: TeamDetailTabsProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleTabChange = useCallback(
    (tab: TabType) => {
      router.replace(`${pathname}?tab=${tab}`, { scroll: false })
    },
    [router, pathname],
  )

  const hasRealGuid = !teamKey.startsWith('team-')
  const defaultTab: TabType = hasRealGuid ? 'roster' : 'fixtures'
  const currentTab = (activeTab as TabType) || defaultTab

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-100">{teamName}</h2>

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
        {currentTab === 'roster' && (
          <TeamRoster teamKey={teamKey} teamName={teamName} />
        )}
        {currentTab === 'fixtures' && (
          <TeamFixtures
            competitionId={competitionId}
            divisionId={divisionId}
            teamName={teamName}
            teamKey={teamKey}
            orgKey={orgKey}
            compKey={compKey}
          />
        )}
      </div>
    </div>
  )
}
