/**
 * Barrel export for all Squadi Basketball API Zod schemas.
 */

export {
  GuidSchema,
  YearSchema,
  YearsResponseSchema,
  ApiErrorResponseSchema,
  PaginationParamsSchema,
  StatTypeSchema,
  AggregateTypeSchema,
} from './common.schema'

export {
  OrganisationSchema,
  OrganisationsResponseSchema,
} from './organisation.schema'

export {
  CompetitionSchema,
  CompetitionsResponseSchema,
} from './competition.schema'

export {
  DivisionSchema,
  DivisionsResponseSchema,
} from './division.schema'

export {
  TeamSchema,
  TeamsResponseSchema,
  TeamPlayerSchema,
  TeamDetailSchema,
} from './team.schema'

export {
  PlayerTeamSchema,
  PlayerSchema,
  PlayerResponseSchema,
} from './player.schema'

export {
  MatchTeamSchema,
  MatchSchema,
  RoundSchema,
  FixturesResponseSchema,
} from './fixture.schema'

export {
  GameSummarySchema,
  ActionLogResponseSchema,
  GameEventSchema,
  GameEventsResponseSchema,
} from './game.schema'

export {
  ScoringStatEntrySchema,
  ScoringStatsResponseSchema,
  UserScoringSummarySchema,
  UserScoringSummaryResponseSchema,
} from './stats.schema'
