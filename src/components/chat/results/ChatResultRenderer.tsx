// ---------------------------------------------------------------------------
// ChatResultRenderer - Dispatches result type to the correct card component
// ---------------------------------------------------------------------------

'use client'

import type { ChatResultBlock } from '@/types/chat'
import type { ViewType } from '@/types/navigation'
import { TeamResultCard } from './TeamResultCard'
import { PlayerResultCard } from './PlayerResultCard'
import { FixtureResultList } from './FixtureResultList'
import { StatsResultTable } from './StatsResultTable'
import { GenericResultCard } from './GenericResultCard'

export interface ChatNavigateHandler {
  readonly onNavigate: (
    view: ViewType,
    params: Record<string, string | number>,
    label: string,
  ) => void
}

interface ChatResultRendererProps extends ChatNavigateHandler {
  readonly result: ChatResultBlock
}

export function ChatResultRenderer({
  result,
  onNavigate,
}: ChatResultRendererProps) {
  switch (result.type) {
    case 'teams':
    case 'teamDetail':
      return (
        <TeamResultCard
          data={result.data}
          type={result.type}
          onNavigate={onNavigate}
        />
      )

    case 'playerProfile':
      return (
        <PlayerResultCard data={result.data} onNavigate={onNavigate} />
      )

    case 'fixtures':
      return (
        <FixtureResultList data={result.data} onNavigate={onNavigate} />
      )

    case 'stats':
      return <StatsResultTable data={result.data} />

    case 'gameSummary':
      return (
        <GenericResultCard
          data={result.data}
          title="Game Summary"
          entityType="gameSummary"
          onNavigate={onNavigate}
        />
      )

    case 'organisations':
      return (
        <GenericResultCard
          data={result.data}
          title="Organisations"
          entityType="organisations"
          onNavigate={onNavigate}
        />
      )

    case 'competitions':
      return (
        <GenericResultCard
          data={result.data}
          title="Competitions"
          entityType="competitions"
          onNavigate={onNavigate}
        />
      )

    case 'divisions':
      return (
        <GenericResultCard
          data={result.data}
          title="Divisions"
          entityType="divisions"
          onNavigate={onNavigate}
        />
      )

    case 'text':
    default:
      return null
  }
}
