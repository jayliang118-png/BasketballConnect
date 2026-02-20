import { getPlayer } from '@/data/players'
import { PlayerProfileView } from '@/components/players/PlayerProfileView'
import { BreadcrumbNameSetter } from '@/components/layout/BreadcrumbNameSetter'
import type { Metadata } from 'next'

interface Props {
  readonly params: Promise<{ playerId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { playerId } = await params
  try {
    const player = await getPlayer(Number(playerId))
    const fullName = `${player.firstName} ${player.lastName}`.trim()
    return {
      title: fullName,
      description: `Player profile and statistics for ${fullName}`,
    }
  } catch {
    return {
      title: 'Player Profile',
      description: 'Player profile and statistics',
    }
  }
}

export const revalidate = 600

export default async function PlayerPage({ params }: Props) {
  const { playerId } = await params
  const player = await getPlayer(Number(playerId))
  const fullName = `${player.firstName} ${player.lastName}`.trim()

  return (
    <main className="container mx-auto px-4 py-6 flex-1">
      <BreadcrumbNameSetter playerName={fullName} />
      <PlayerProfileView player={player} />
    </main>
  )
}
