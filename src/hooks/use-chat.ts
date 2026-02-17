// ---------------------------------------------------------------------------
// useChat Hook - Sends messages and manages chat interaction state
// ---------------------------------------------------------------------------

'use client'

import { useCallback, useContext } from 'react'
import { ChatContext, type ChatContextValue } from '@/context/ChatContext'
import type { ChatMessage, ChatApiResponse } from '@/types/chat'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface UseChatReturn extends ChatContextValue {
  readonly sendMessage: (text: string) => Promise<void>
}

export function useChat(): UseChatReturn {
  const context = useContext(ChatContext)

  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }

  const {
    state,
    addMessage,
    updateLastAssistantMessage,
    setLoading,
    setError,
    toggleChat,
    clearHistory,
  } = context

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || state.isLoading) {
        return
      }

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }
      addMessage(userMessage)

      const placeholderId = generateId()
      const placeholderMessage: ChatMessage = {
        id: placeholderId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isLoading: true,
      }
      addMessage(placeholderMessage)
      setLoading(true)
      setError(null)

      try {
        const history = state.messages
          .filter((m) => !m.isLoading)
          .map((m) => ({ role: m.role, content: m.content }))

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, history }),
        })

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: 'Request failed' })) as { error?: string }
          throw new Error(
            errorData.error ?? `Request failed with status ${response.status}`,
          )
        }

        const data = (await response.json()) as ChatApiResponse

        const assistantMessage: ChatMessage = {
          id: placeholderId,
          role: 'assistant',
          content: data.content,
          results: data.results,
          timestamp: Date.now(),
          isLoading: false,
        }
        updateLastAssistantMessage(assistantMessage)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Something went wrong'
        setError(message)

        const errorMessage: ChatMessage = {
          id: placeholderId,
          role: 'assistant',
          content: `Sorry, I encountered an error: ${message}. Please try again.`,
          timestamp: Date.now(),
          isLoading: false,
        }
        updateLastAssistantMessage(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [
      state.messages,
      state.isLoading,
      addMessage,
      updateLastAssistantMessage,
      setLoading,
      setError,
    ],
  )

  return {
    state,
    addMessage,
    updateLastAssistantMessage,
    setLoading,
    setError,
    toggleChat,
    clearHistory,
    sendMessage,
  }
}
