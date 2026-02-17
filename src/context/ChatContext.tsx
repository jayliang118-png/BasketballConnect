// ---------------------------------------------------------------------------
// Chat Context - Global state management for the chat interface
// ---------------------------------------------------------------------------

'use client'

import { createContext, useCallback, useMemo, useState } from 'react'
import type { ChatMessage, ChatState } from '@/types/chat'

export interface ChatContextValue {
  readonly state: ChatState
  readonly addMessage: (message: ChatMessage) => void
  readonly updateLastAssistantMessage: (message: ChatMessage) => void
  readonly setLoading: (isLoading: boolean) => void
  readonly setError: (error: string | null) => void
  readonly toggleChat: () => void
  readonly clearHistory: () => void
}

const INITIAL_CHAT_STATE: ChatState = {
  messages: [],
  isOpen: false,
  isLoading: false,
  error: null,
}

export const ChatContext = createContext<ChatContextValue | null>(null)

interface ChatProviderProps {
  readonly children: React.ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, setState] = useState<ChatState>(INITIAL_CHAT_STATE)

  const addMessage = useCallback((message: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
      error: null,
    }))
  }, [])

  const updateLastAssistantMessage = useCallback((message: ChatMessage) => {
    setState((prev) => {
      const lastIdx = prev.messages.length - 1
      if (lastIdx >= 0 && prev.messages[lastIdx].role === 'assistant') {
        return {
          ...prev,
          messages: [
            ...prev.messages.slice(0, lastIdx),
            message,
          ],
        }
      }
      return { ...prev, messages: [...prev.messages, message] }
    })
  }, [])

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }, [])

  const toggleChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }))
  }, [])

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, messages: [], error: null }))
  }, [])

  const value = useMemo<ChatContextValue>(
    () => ({
      state,
      addMessage,
      updateLastAssistantMessage,
      setLoading,
      setError,
      toggleChat,
      clearHistory,
    }),
    [
      state,
      addMessage,
      updateLastAssistantMessage,
      setLoading,
      setError,
      toggleChat,
      clearHistory,
    ],
  )

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  )
}
