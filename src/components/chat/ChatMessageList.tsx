// ---------------------------------------------------------------------------
// ChatMessageList - Scrollable container with auto-scroll to newest message
// ---------------------------------------------------------------------------

'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import type { ViewType } from '@/types/navigation'
import { ChatMessage } from './ChatMessage'

interface ChatMessageListProps {
  readonly messages: readonly ChatMessageType[]
  readonly onNavigate: (
    view: ViewType,
    params: Record<string, string | number>,
    label: string,
  ) => void
}

export function ChatMessageList({
  messages,
  onNavigate,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-1">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onNavigate={onNavigate}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
