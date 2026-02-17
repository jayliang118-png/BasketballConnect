// ---------------------------------------------------------------------------
// Chat API Route - Orchestrates LLM conversation with Squadi API tools
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server'
import { getLLMClient } from '@/lib/chat/llm-client'
import { CHAT_TOOLS } from '@/lib/chat/tool-definitions'
import { CHAT_SYSTEM_PROMPT } from '@/lib/chat/system-prompt'
import { executeToolCall } from '@/lib/chat/tool-executor'
import { buildResultBlocks } from '@/lib/chat/response-formatter'
import { chatApiRequestSchema } from '@/schemas/chat'
import type { ChatApiResponse } from '@/types/chat'
import type {
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from 'openai/resources/chat/completions'

const MAX_TOOL_ROUNDS = 5
const LLM_MODEL = process.env.LLM_MODEL

function getModelOrThrow(): string {
  if (!LLM_MODEL) {
    throw new Error('LLM_MODEL environment variable is not configured')
  }
  return LLM_MODEL
}
const REQUEST_TIMEOUT_MS = 60_000

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json()
    const parsed = chatApiRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 },
      )
    }

    const { message, history } = parsed.data
    const client = getLLMClient()

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...history.map(
        (m) =>
          ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }) satisfies ChatCompletionMessageParam,
      ),
      { role: 'user', content: message },
    ]

    const allToolResults: {
      readonly name: string
      readonly result: unknown
      readonly error?: string
    }[] = []

    let round = 0

    while (round < MAX_TOOL_ROUNDS) {
      const completion = await Promise.race([
        client.chat.completions.create({
          model: getModelOrThrow(),
          messages,
          tools: [...CHAT_TOOLS],
          tool_choice: 'auto',
          temperature: 0.3,
        }),
        createTimeout(REQUEST_TIMEOUT_MS),
      ])

      const choice = completion.choices[0]
      if (!choice) {
        throw new Error('No response received from LLM')
      }

      const assistantMessage = choice.message
      messages.push(assistantMessage)

      if (
        !assistantMessage.tool_calls ||
        assistantMessage.tool_calls.length === 0
      ) {
        break
      }

      const functionToolCalls = assistantMessage.tool_calls.filter(
        (tc): tc is Extract<typeof tc, { type: 'function' }> =>
          tc.type === 'function',
      )

      const results = await Promise.all(
        functionToolCalls.map(async (toolCall) => {
          let args: Record<string, unknown>
          try {
            args = JSON.parse(toolCall.function.arguments) as Record<
              string,
              unknown
            >
          } catch {
            return {
              toolCallId: toolCall.id,
              name: toolCall.function.name,
              result: null,
              error: `Failed to parse arguments for ${toolCall.function.name}`,
            }
          }
          return executeToolCall(
            toolCall.id,
            toolCall.function.name,
            args,
          )
        }),
      )

      for (const result of results) {
        allToolResults.push({
          name: result.name,
          result: result.result,
          error: result.error,
        })

        const toolMessage: ChatCompletionToolMessageParam = {
          role: 'tool',
          tool_call_id: result.toolCallId,
          content: JSON.stringify(
            result.error ? { error: result.error } : result.result,
          ),
        }
        messages.push(toolMessage)
      }

      round++
    }

    const lastMessage = messages[messages.length - 1]
    const content =
      lastMessage.role === 'assistant' &&
      typeof lastMessage.content === 'string'
        ? lastMessage.content
        : 'I found some results for you.'

    const results = buildResultBlocks(allToolResults)

    const response: ChatApiResponse = { content, results }
    return NextResponse.json(response)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error('Request timed out. Please try again.')),
      ms,
    )
  })
}
