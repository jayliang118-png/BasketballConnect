// ---------------------------------------------------------------------------
// TeamResultCard - Clickable team data inline in chat messages
// ---------------------------------------------------------------------------

'use client'

import type { ChatNavigateHandler } from './ChatResultRenderer'

interface TeamItem {
  readonly name?: string
  readonly teamName?: string
  readonly teamUniqueKey?: string
  readonly id?: number
  readonly playersCount?: number
}

interface TeamResultCardProps extends ChatNavigateHandler {
  readonly data: unknown
  readonly type: 'teams' | 'teamDetail'
}

function isTeamItem(item: unknown): item is TeamItem {
  return typeof item === 'object' && item !== null
}

function getTeamName(team: TeamItem): string {
  return team.name ?? team.teamName ?? 'Unknown team'
}

export function TeamResultCard({
  data,
  type,
  onNavigate,
}: TeamResultCardProps) {
  if (type === 'teamDetail') {
    return <TeamDetailView data={data} onNavigate={onNavigate} />
  }

  const items = Array.isArray(data) ? data : [data]
  const teams = items.filter(isTeamItem)
  const displayTeams = teams.slice(0, 8)

  return (
    <div className="mt-2 rounded-lg border border-court-border bg-court-elevated p-3">
      <h4 className="text-xs font-semibold text-hoop-orange mb-2">
        Teams ({teams.length})
      </h4>
      <div className="grid grid-cols-1 gap-1.5">
        {displayTeams.map((team, index) => (
          <button
            key={team.teamUniqueKey ?? index}
            type="button"
            onClick={() => {
              if (team.teamUniqueKey) {
                onNavigate(
                  'teamDetail',
                  {
                    teamUniqueKey: team.teamUniqueKey,
                    teamId: team.id ?? 0,
                    teamName: getTeamName(team),
                  },
                  getTeamName(team),
                )
              }
            }}
            className="flex items-center justify-between px-2 py-1.5 rounded bg-court-dark/50 hover:bg-court-dark hover:text-hoop-orange transition-colors cursor-pointer text-left"
          >
            <span className="text-xs text-gray-200 font-medium group-hover:text-hoop-orange">
              {getTeamName(team)}
              <span className="text-gray-600 ml-1">&rarr;</span>
            </span>
            {team.playersCount !== undefined && (
              <span className="text-xs text-gray-500">
                {team.playersCount} players
              </span>
            )}
          </button>
        ))}
      </div>
      {teams.length > 8 && (
        <p className="text-xs text-gray-500 mt-2">
          ...and {teams.length - 8} more teams
        </p>
      )}
    </div>
  )
}

function TeamDetailView({
  data,
  onNavigate,
}: {
  readonly data: unknown
  readonly onNavigate: ChatNavigateHandler['onNavigate']
}) {
  if (typeof data !== 'object' || data === null) {
    return null
  }

  const record = data as Record<string, unknown>
  const teamName =
    typeof record.teamName === 'string'
      ? record.teamName
      : typeof record.name === 'string'
        ? record.name
        : 'Team Detail'

  const players = Array.isArray(record.players)
    ? record.players
    : Array.isArray(record.members)
      ? record.members
      : []

  return (
    <div className="mt-2 rounded-lg border border-court-border bg-court-elevated p-3">
      <h4 className="text-xs font-semibold text-hoop-orange mb-2">
        {teamName}
      </h4>
      {players.length > 0 ? (
        <div className="space-y-1">
          {players.slice(0, 15).map((player: unknown, index: number) => {
            const p = player as Record<string, unknown>
            const firstName =
              typeof p.firstName === 'string' ? p.firstName : ''
            const lastName =
              typeof p.lastName === 'string' ? p.lastName : ''
            const name =
              `${firstName} ${lastName}`.trim() ||
              (typeof p.name === 'string'
                ? p.name
                : `Player ${index + 1}`)
            const playerId =
              typeof p.playerId === 'number'
                ? p.playerId
                : typeof p.id === 'number'
                  ? p.id
                  : null

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (playerId !== null) {
                    onNavigate(
                      'playerProfile',
                      { playerId },
                      name,
                    )
                  }
                }}
                disabled={playerId === null}
                className="flex items-center gap-2 px-2 py-1 rounded bg-court-dark/50 w-full text-left hover:bg-court-dark transition-colors disabled:cursor-default disabled:hover:bg-court-dark/50"
              >
                <div className="w-5 h-5 rounded-full bg-jersey-blue/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] text-jersey-blue font-bold">
                    {name.charAt(0)}
                  </span>
                </div>
                <span className="text-xs text-gray-300">
                  {name}
                  {playerId !== null && (
                    <span className="text-gray-600 ml-1">&rarr;</span>
                  )}
                </span>
              </button>
            )
          })}
          {players.length > 15 && (
            <p className="text-xs text-gray-500 mt-1">
              ...and {players.length - 15} more players
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No roster data available</p>
      )}
    </div>
  )
}
