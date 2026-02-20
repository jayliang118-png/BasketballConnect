'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBreadcrumbNames, type BreadcrumbNames } from '@/context/BreadcrumbNamesContext'

interface BreadcrumbSegment {
  readonly label: string
  readonly href: string
}

function buildSegments(
  pathname: string,
  names: BreadcrumbNames,
): readonly BreadcrumbSegment[] {
  const parts = pathname.split('/').filter(Boolean)
  const segments: BreadcrumbSegment[] = [{ label: 'Home', href: '/orgs' }]

  let i = 0
  while (i < parts.length) {
    const part = parts[i]
    const href = '/' + parts.slice(0, i + 1).join('/')

    if (part === 'orgs') {
      i++
      if (i < parts.length && parts[i] !== 'competitions' && parts[i] !== undefined) {
        const orgHref = '/' + parts.slice(0, i + 1).join('/') + '/competitions'
        segments.push({ label: names.orgName ?? parts[i], href: orgHref })
        i++
      }
    } else if (part === 'competitions') {
      i++
      if (i < parts.length) {
        const compHref = '/' + parts.slice(0, i + 1).join('/') + '/divisions'
        segments.push({ label: names.compName ?? parts[i], href: compHref })
        i++
      }
    } else if (part === 'divisions') {
      i++
      if (i < parts.length) {
        const divHref = '/' + parts.slice(0, i + 1).join('/')
        segments.push({ label: names.divName ?? `Division ${parts[i]}`, href: divHref })
        i++
      }
    } else if (part === 'teams') {
      i++
      if (i < parts.length) {
        const teamHref = '/' + parts.slice(0, i + 1).join('/')
        segments.push({ label: names.teamName ?? parts[i], href: teamHref })
        i++
      }
    } else if (part === 'games') {
      i++
      if (i < parts.length) {
        const gameHref = '/' + parts.slice(0, i + 1).join('/')
        segments.push({ label: names.gameName ?? `Game ${parts[i]}`, href: gameHref })
        i++
      }
    } else if (part === 'players') {
      i++
      if (i < parts.length) {
        if (parts[i] === 'user') {
          i++
          if (i < parts.length) {
            const playerHref = '/' + parts.slice(0, i + 1).join('/')
            segments.push({ label: names.playerName ?? `Player`, href: playerHref })
            i++
          }
        } else {
          const playerHref = '/' + parts.slice(0, i + 1).join('/')
          segments.push({ label: names.playerName ?? `Player`, href: playerHref })
          i++
        }
      }
    } else {
      segments.push({ label: part, href })
      i++
    }
  }

  return segments
}

export function BreadcrumbsFromUrl() {
  const pathname = usePathname()
  const { names } = useBreadcrumbNames()

  const segments = buildSegments(pathname, names)

  if (segments.length <= 1) {
    return null
  }

  return (
    <nav
      className="container mx-auto px-4 py-2 flex items-center gap-2 text-sm overflow-x-auto scrollbar-hide"
      aria-label="Breadcrumb"
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const isMiddle = index > 0 && !isLast
        return (
          <div
            key={segment.href}
            className={`flex items-center gap-2 flex-shrink-0${isMiddle ? ' hidden sm:flex' : ''}`}
          >
            {index > 0 && (
              <svg
                className="w-3 h-3 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {isLast ? (
              <span className="text-hoop-orange font-medium truncate max-w-[200px]">
                {segment.label}
              </span>
            ) : (
              <Link
                href={segment.href}
                className="text-gray-400 hover:text-gray-200 transition-colors truncate max-w-[200px]"
              >
                {segment.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
