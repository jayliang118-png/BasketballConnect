// ---------------------------------------------------------------------------
// LLM Client - Provider-agnostic factory using OpenAI-compatible API
//
// Supports any LLM provider with an OpenAI-compatible endpoint:
//   - DeepSeek:  LLM_BASE_URL=https://api.deepseek.com
//   - OpenAI:    LLM_BASE_URL=https://api.openai.com/v1
//   - Anthropic:  via LiteLLM proxy or compatible gateway
//   - Groq:      LLM_BASE_URL=https://api.groq.com/openai/v1
//   - Together:   LLM_BASE_URL=https://api.together.xyz/v1
//   - Local:      LLM_BASE_URL=http://localhost:11434/v1 (Ollama)
// ---------------------------------------------------------------------------

import OpenAI from 'openai'

let clientInstance: OpenAI | null = null

export function getLLMClient(): OpenAI {
  if (clientInstance) {
    return clientInstance
  }

  const baseURL = process.env.LLM_BASE_URL
  const apiKey = process.env.LLM_API_KEY

  if (!baseURL) {
    throw new Error('LLM_BASE_URL environment variable is not configured')
  }

  if (!apiKey) {
    throw new Error('LLM_API_KEY environment variable is not configured')
  }

  clientInstance = new OpenAI({ apiKey, baseURL })
  return clientInstance
}

export function resetLLMClient(): void {
  clientInstance = null
}
