// ---------------------------------------------------------------------------
// ChatMessage - Renders a single message bubble (user or assistant)
// ---------------------------------------------------------------------------

'use client'

import type { ChatMessage as ChatMessageType } from '@/types/chat'
import type { ViewType } from '@/types/navigation'
import { ChatResultRenderer } from './results/ChatResultRenderer'

interface ChatMessageProps {
  readonly message: ChatMessageType
  readonly onNavigate: (
    view: ViewType,
    params: Record<string, string | number>,
    label: string,
  ) => void
}

export function ChatMessage({ message, onNavigate }: ChatMessageProps) {
  if (message.isLoading) {
    return (
      <div className="flex justify-start mb-3">
        <div className="rounded-2xl rounded-bl-sm border border-court-border bg-court-elevated px-3 py-2 max-w-[85%]">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-hoop-orange animate-bounce" />
            <div
              className="w-1.5 h-1.5 rounded-full bg-hoop-orange animate-bounce"
              style={{ animationDelay: '0.15s' }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full bg-hoop-orange animate-bounce"
              style={{ animationDelay: '0.3s' }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-3">
        <div className="rounded-2xl rounded-br-sm bg-hoop-orange text-white px-3 py-2 max-w-[85%]">
          <p className="text-xs leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[90%]">
        <div className="rounded-2xl rounded-bl-sm border border-court-border bg-court-elevated px-3 py-2">
          {message.content && (
            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>

        {message.results && message.results.length > 0 && (
          <div className="space-y-1">
            {message.results.map((result, index) => (
              <ChatResultRenderer
                key={index}
                result={result}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
