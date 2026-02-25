/**
 * Formats an ISO timestamp string as an absolute time for notification display.
 *
 * - Today: time only (e.g., "2:45 PM")
 * - This year (not today): short date + time (e.g., "Feb 25, 10:30 AM")
 * - Different year: full date + time (e.g., "Feb 25, 2025, 10:30 AM")
 * - Invalid date: empty string
 */
export function formatNotificationTimestamp(isoString: string): string {
  if (!isoString) {
    return ''
  }

  const date = new Date(isoString)

  if (isNaN(date.getTime())) {
    return ''
  }

  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  const isThisYear = date.getFullYear() === now.getFullYear()

  if (isToday) {
    return date.toLocaleString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (isThisYear) {
    return date.toLocaleString('en-AU', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return date.toLocaleString('en-AU', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
