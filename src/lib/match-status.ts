// ---------------------------------------------------------------------------
// Match Status Normalizer - Maps inconsistent API status values to canonical
// statuses used by the detection engine
// ---------------------------------------------------------------------------

export type NormalizedMatchStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'UNKNOWN'

const STATUS_MAP: Readonly<Record<string, NormalizedMatchStatus>> = {
  SCHEDULED: 'SCHEDULED',
  LIVE: 'LIVE',
  INPROGRESS: 'LIVE',
  'IN PROGRESS': 'LIVE',
  ENDED: 'ENDED',
  FINAL: 'ENDED',
}

/**
 * Normalizes raw API match status strings to canonical values.
 * Case-insensitive. Unknown values map to 'UNKNOWN'.
 */
export function normalizeMatchStatus(raw: string): NormalizedMatchStatus {
  return STATUS_MAP[raw.toUpperCase()] ?? 'UNKNOWN'
}

/** Returns true when the match is currently in progress. */
export function isLiveStatus(status: NormalizedMatchStatus): boolean {
  return status === 'LIVE'
}

/** Returns true when the match has concluded. */
export function isEndedStatus(status: NormalizedMatchStatus): boolean {
  return status === 'ENDED'
}
