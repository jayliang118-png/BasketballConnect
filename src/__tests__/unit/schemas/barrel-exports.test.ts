import { describe, it, expect } from '@jest/globals'

describe('Schema barrel exports', () => {
  it('exports all common schemas', async () => {
    const schemas = await import('@/schemas/index')
    expect(schemas.GuidSchema).toBeDefined()
    expect(schemas.YearSchema).toBeDefined()
    expect(schemas.YearsResponseSchema).toBeDefined()
    expect(schemas.ApiErrorResponseSchema).toBeDefined()
    expect(schemas.PaginationParamsSchema).toBeDefined()
    expect(schemas.StatTypeSchema).toBeDefined()
    expect(schemas.AggregateTypeSchema).toBeDefined()
  })

  it('exports all organisation schemas', async () => {
    const schemas = await import('@/schemas/index')
    expect(schemas.OrganisationSchema).toBeDefined()
    expect(schemas.OrganisationsResponseSchema).toBeDefined()
  })

  it('exports all competition schemas', async () => {
    const schemas = await import('@/schemas/index')
    expect(schemas.CompetitionSchema).toBeDefined()
    expect(schemas.CompetitionsResponseSchema).toBeDefined()
  })

  it('exports all division schemas', async () => {
    const schemas = await import('@/schemas/index')
    expect(schemas.DivisionSchema).toBeDefined()
    expect(schemas.DivisionsResponseSchema).toBeDefined()
  })

  it('exports all team schemas', async () => {
    const schemas = await import('@/schemas/index')
    expect(schemas.TeamSchema).toBeDefined()
    expect(schemas.TeamsResponseSchema).toBeDefined()
    expect(schemas.TeamPlayerSchema).toBeDefined()
    expect(schemas.TeamDetailSchema).toBeDefined()
  })

  it('exports all player schemas', async () => {
    const schemas = await import('@/schemas/index')
    expect(schemas.PlayerTeamSchema).toBeDefined()
    expect(schemas.PlayerSchema).toBeDefined()
    expect(schemas.PlayerResponseSchema).toBeDefined()
  })

  it('exports all fixture schemas', async () => {
    const schemas = await import('@/schemas/index')
    expect(schemas.MatchTeamSchema).toBeDefined()
    expect(schemas.MatchSchema).toBeDefined()
    expect(schemas.RoundSchema).toBeDefined()
    expect(schemas.FixturesResponseSchema).toBeDefined()
  })

  it('exports all game schemas', async () => {
    const schemas = await import('@/schemas/index')
    expect(schemas.GameSummarySchema).toBeDefined()
    expect(schemas.ActionLogEntrySchema).toBeDefined()
    expect(schemas.ActionLogResponseSchema).toBeDefined()
    expect(schemas.GameEventSchema).toBeDefined()
    expect(schemas.GameEventsResponseSchema).toBeDefined()
  })

  it('exports all stats schemas', async () => {
    const schemas = await import('@/schemas/index')
    expect(schemas.ScoringStatEntrySchema).toBeDefined()
    expect(schemas.ScoringStatsResponseSchema).toBeDefined()
    expect(schemas.UserScoringSummarySchema).toBeDefined()
    expect(schemas.UserScoringSummaryResponseSchema).toBeDefined()
  })
})

describe('Types barrel exports', () => {
  it('exports INITIAL_NAVIGATION_STATE', async () => {
    const types = await import('@/types/index')
    expect(types.INITIAL_NAVIGATION_STATE).toBeDefined()
    expect(types.INITIAL_NAVIGATION_STATE.currentView).toBe('organisations')
    expect(types.INITIAL_NAVIGATION_STATE.breadcrumbs).toHaveLength(1)
    expect(types.INITIAL_NAVIGATION_STATE.params).toEqual({})
  })

  it('exports INITIAL_NAVIGATION_STATE from navigation module', async () => {
    const nav = await import('@/types/navigation')
    expect(nav.INITIAL_NAVIGATION_STATE).toBeDefined()
    expect(nav.INITIAL_NAVIGATION_STATE.currentView).toBe('organisations')
  })
})
