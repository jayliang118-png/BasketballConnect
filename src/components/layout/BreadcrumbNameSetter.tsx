'use client'

import { useEffect } from 'react'
import { useBreadcrumbNames } from '@/context/BreadcrumbNamesContext'

interface BreadcrumbNameSetterProps {
  readonly orgName?: string
  readonly compName?: string
  readonly divName?: string
  readonly teamName?: string
  readonly gameName?: string
  readonly playerName?: string
}

export function BreadcrumbNameSetter({
  orgName,
  compName,
  divName,
  teamName,
  gameName,
  playerName,
}: BreadcrumbNameSetterProps) {
  const { setNames } = useBreadcrumbNames()

  useEffect(() => {
    setNames({ orgName, compName, divName, teamName, gameName, playerName })
  }, [orgName, compName, divName, teamName, gameName, playerName, setNames])

  return null
}
