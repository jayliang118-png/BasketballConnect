'use client'

interface MatchTeamInfo {
  readonly teamName?: string
  readonly score?: number
  readonly logoUrl?: string | null
}

interface MatchCardProps {
  readonly team1: MatchTeamInfo
  readonly team2: MatchTeamInfo
  readonly matchId?: number
  readonly startTime?: string
  readonly venueName?: string
  readonly venueCourtName?: string
  readonly divisionName?: string
  readonly matchStatus?: string
  readonly onClick?: () => void
}

function formatDate(timeStr: string): string {
  try {
    const date = new Date(timeStr)
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return timeStr
  }
}

function formatTime(timeStr: string): string {
  try {
    const date = new Date(timeStr)
    return date.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    })
  } catch {
    return ''
  }
}

function TeamLogo({ logoUrl, teamName }: { readonly logoUrl?: string | null; readonly teamName: string }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={teamName}
        className="w-10 h-10 object-contain flex-shrink-0"
      />
    )
  }
  return null
}

export function MatchCard({
  team1,
  team2,
  matchId,
  startTime,
  venueName,
  venueCourtName,
  divisionName,
  matchStatus,
  onClick,
}: MatchCardProps) {
  const hasScores = team1.score !== undefined && team2.score !== undefined
  const isCompleted = matchStatus === 'Ended' || matchStatus === 'Final'
  const isLive = matchStatus === 'Live' || matchStatus === 'InProgress'

  const displayVenue = venueCourtName
    ? `${venueName ? `${venueName} - ` : ''}${venueCourtName}`
    : venueName

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Date / Time / Meta (left column) */}
        {startTime && (
          <div className="lg:w-48 flex-shrink-0 space-y-0.5 text-sm text-gray-400">
            <p className="text-gray-300">{formatDate(startTime)}</p>
            <p className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
              {formatTime(startTime)}
            </p>
            {matchId && (
              <p className="text-xs text-gray-500">Match ID: {matchId}</p>
            )}
            {divisionName && (
              <p className="text-xs text-gray-500">Division: {divisionName}</p>
            )}
          </div>
        )}

        {/* Teams + Score (center) */}
        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-5">
          {/* Team 1 */}
          <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
            <span className="text-sm font-medium text-gray-200 truncate text-right">
              {team1.teamName ?? 'TBD'}
            </span>
            <TeamLogo logoUrl={team1.logoUrl} teamName={team1.teamName ?? 'TBD'} />
          </div>

          {/* Score box */}
          {hasScores ? (
            <button
              type="button"
              onClick={onClick}
              className="flex items-center gap-1 group/score"
            >
              <div className={`flex items-center gap-2 bg-hoop-orange text-white font-mono font-bold text-base px-4 py-1.5 rounded-md min-w-[90px] justify-center ${onClick ? 'group-hover/score:bg-hoop-orange/80 transition-colors cursor-pointer' : ''}`}>
                <span>{team1.score}</span>
                <span className="text-white/70">:</span>
                <span>{team2.score}</span>
              </div>
              {(isCompleted || isLive) && (
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isLive ? 'bg-stat-green animate-pulse' : 'bg-stat-green'}`} />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClick}
              className={`flex items-center bg-court-elevated text-gray-500 font-mono text-sm px-4 py-1.5 rounded-md min-w-[90px] justify-center ${onClick ? 'hover:bg-court-elevated/80 transition-colors cursor-pointer' : ''}`}
            >
              vs
            </button>
          )}

          {/* Team 2 */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TeamLogo logoUrl={team2.logoUrl} teamName={team2.teamName ?? 'TBD'} />
            <span className="text-sm font-medium text-gray-200 truncate">
              {team2.teamName ?? 'TBD'}
            </span>
          </div>
        </div>

        {/* Venue (right column) */}
        {displayVenue && (
          <div className="lg:w-52 flex-shrink-0 text-right">
            <p className="text-sm text-hoop-orange flex items-center gap-1 lg:justify-end">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate max-w-[180px]">{displayVenue}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
