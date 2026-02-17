/**
 * Common types shared across the Squadi Basketball API.
 */

/** A year value that can be either a string or number from the API. */
export type Year = string | number

/** Standard API error response shape. */
export interface ApiErrorResponse {
  readonly message: string
  readonly errorCode?: number
  readonly [key: string]: unknown
}

/** Pagination parameters for paginated API endpoints. */
export interface PaginationParams {
  readonly offset: number
  readonly limit: number
}

/** Available stat types for scoring statistics endpoints. */
export type StatType =
  | 'TOTALPOINTS'
  | 'TOTALPF'
  | 'AVGPOINTS'
  | 'FREETHROWS'
  | 'TWOPOINTS'
  | 'THREEPOINTS'

/** Aggregate types for user scoring summary. */
export type AggregateType = 'MATCH' | 'CAREER'

/** GUID string type alias for documentation clarity. */
export type Guid = string
