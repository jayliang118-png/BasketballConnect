// ---------------------------------------------------------------------------
// ChatPanel - Main floating chat container with toggle, messages, and input
// ---------------------------------------------------------------------------

'use client'

import { useCallback } from 'react'
import { useChat } from '@/hooks/use-chat'
import { useNavigation } from '@/hooks/use-navigation'
import { ChatMessageList } from './ChatMessageList'
import { ChatInput } from './ChatInput'
import { ChatWelcome } from './ChatWelcome'
import { ChatToggleButton } from './ChatToggleButton'
import type { ViewType } from '@/types/navigation'

export function ChatPanel() {
  const { state, sendMessage, toggleChat, clearHistory } = useChat()
  const { navigateTo } = useNavigation()

  const handleNavigate = useCallback(
    (
      view: ViewType,
      params: Record<string, string | number>,
      label: string,
    ) => {
      navigateTo(view, params, label)
      toggleChat()
    },
    [navigateTo, toggleChat],
  )

  const hasMessages = state.messages.length > 0

  return (
    <>
      <ChatToggleButton isOpen={state.isOpen} onClick={toggleChat} />

      {state.isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] flex flex-col rounded-2xl border border-court-border bg-court-surface shadow-2xl animate-fade-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-court-border bg-court-dark/80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-hoop-orange to-hoop-orange-dark flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 2 C12 2 12 22 12 22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-gray-200">
                Basketball Assistant
              </h2>
            </div>

            <div className="flex items-center gap-1">
              {hasMessages && (
                <button
                  onClick={clearHistory}
                  type="button"
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-court-elevated transition-colors"
                  aria-label="Clear chat history"
                  title="Clear chat"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={toggleChat}
                type="button"
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-court-elevated transition-colors"
                aria-label="Close chat"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Message area */}
          {hasMessages ? (
            <ChatMessageList
              messages={state.messages}
              onNavigate={handleNavigate}
            />
          ) : (
            <ChatWelcome onSuggestionClick={sendMessage} />
          )}

          {/* Input */}
          <ChatInput onSend={sendMessage} isLoading={state.isLoading} />
        </div>
      )}
    </>
  )
}
