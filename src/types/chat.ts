// ---------------------------------------------------------------------------
// Chat Types - Conversational AI interface types
// ---------------------------------------------------------------------------

export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatResultType =
  | 'organisations'
  | 'competitions'
  | 'divisions'
  | 'teams'
  | 'teamDetail'
  | 'playerProfile'
  | 'fixtures'
  | 'gameSummary'
  | 'stats'
  | 'text'

export interface ChatResultBlock {
  readonly type: ChatResultType
  readonly data: unknown
  readonly summary?: string
}

export interface ChatMessage {
  readonly id: string
  readonly role: ChatRole
  readonly content: string
  readonly results?: readonly ChatResultBlock[]
  readonly timestamp: number
  readonly isLoading?: boolean
}

export interface ChatState {
  readonly messages: readonly ChatMessage[]
  readonly isOpen: boolean
  readonly isLoading: boolean
  readonly error: string | null
}

export interface ChatApiRequest {
  readonly message: string
  readonly history: readonly {
    readonly role: ChatRole
    readonly content: string
  }[]
}

export interface ChatApiResponse {
  readonly content: string
  readonly results: readonly ChatResultBlock[]
}
