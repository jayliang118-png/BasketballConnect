/**
 * Formats a timestamp as a relative time string (e.g., "2 seconds ago", "1 minute ago")
 * @param timestamp ISO 8601 date string or Date object
 * @returns Human-readable relative time
 */
export function formatRelativeTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const now = new Date()
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (secondsAgo < 0) return 'now'
  if (secondsAgo < 1) return 'just now'
  if (secondsAgo < 60) return `${secondsAgo} second${secondsAgo === 1 ? '' : 's'} ago`

  const minutesAgo = Math.floor(secondsAgo / 60)
  if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`

  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo < 24) return `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`

  const daysAgo = Math.floor(hoursAgo / 24)
  return `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`
}
