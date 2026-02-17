'use client'

import { useNavigation } from '@/hooks/use-navigation'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { OrganisationList } from '@/components/organisations/OrganisationList'
import { CompetitionList } from '@/components/competitions/CompetitionList'
import { DivisionList } from '@/components/divisions/DivisionList'
import { DivisionDetail } from '@/components/divisions/DivisionDetail'
import { TeamRoster } from '@/components/teams/TeamRoster'
import { GameDetail } from '@/components/game/GameDetail'
import { PlayerProfile } from '@/components/players/PlayerProfile'

export function Dashboard() {
  const { state } = useNavigation()

  const renderView = () => {
    switch (state.currentView) {
      case 'organisations':
        return <OrganisationList />
      case 'competitions':
        return <CompetitionList />
      case 'divisions':
        return <DivisionList />
      case 'divisionDetail':
        return <DivisionDetail />
      case 'teamDetail':
        return <TeamRoster />
      case 'gameDetail':
        return <GameDetail />
      case 'playerProfile':
        return <PlayerProfile />
      default:
        return <OrganisationList />
    }
  }

  return (
    <ErrorBoundary fallbackMessage="Something went wrong. Please try again.">
      <div className="animate-fade-up">
        {renderView()}
      </div>
    </ErrorBoundary>
  )
}
