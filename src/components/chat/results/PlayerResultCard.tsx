// ---------------------------------------------------------------------------
// PlayerResultCard - Clickable player profile inline in chat messages
// ---------------------------------------------------------------------------

'use client'

import type { ChatNavigateHandler } from './ChatResultRenderer'

interface PlayerResultCardProps extends ChatNavigateHandler {
  readonly data: unknown
}

export function PlayerResultCard({
  data,
  onNavigate,
}: PlayerResultCardProps) {
  if (typeof data !== 'object' || data === null) {
    return null
  }

  const record = data as Record<string, unknown>
  const firstName =
    typeof record.firstName === 'string' ? record.firstName : ''
  const lastName =
    typeof record.lastName === 'string' ? record.lastName : ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Player'
  const photoUrl =
    typeof record.photoUrl === 'string' ? record.photoUrl : null
  const dob =
    typeof record.dateOfBirth === 'string' ? record.dateOfBirth : null
  const playerId =
    typeof record.id === 'number'
      ? record.id
      : typeof record.playerId === 'number'
        ? record.playerId
        : null
  const teams = Array.isArray(record.teams) ? record.teams : []

  const handlePlayerClick = () => {
    if (playerId !== null) {
      onNavigate('playerProfile', { playerId }, fullName)
    }
  }

  return (
    <div className="mt-2 rounded-lg border border-court-border bg-court-elevated p-3">
      <button
        type="button"
        onClick={handlePlayerClick}
        disabled={playerId === null}
        className="flex items-center gap-3 mb-2 w-full text-left hover:opacity-80 transition-opacity disabled:hover:opacity-100 disabled:cursor-default"
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={fullName}
            className="w-10 h-10 rounded-full object-cover border border-court-border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-jersey-blue/20 flex items-center justify-center">
            <span className="text-sm text-jersey-blue font-bold">
              {fullName.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h4 className="text-sm font-semibold text-gray-200">
            {fullName}
            {playerId !== null && (
              <span className="text-gray-600 ml-1 text-xs">&rarr;</span>
            )}
          </h4>
          {dob && (
            <p className="text-xs text-gray-500">DOB: {dob}</p>
          )}
        </div>
      </button>

      {teams.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-400 font-medium">Teams:</p>
          {teams.slice(0, 5).map((team: unknown, index: number) => {
            const t = team as Record<string, unknown>
            const teamName =
              typeof t.teamName === 'string'
                ? t.teamName
                : typeof t.name === 'string'
                  ? t.name
                  : `Team ${index + 1}`

            return (
              <div
                key={index}
                className="text-xs text-gray-300 px-2 py-1 rounded bg-court-dark/50"
              >
                {teamName}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
