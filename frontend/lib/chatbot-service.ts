import { chatbotConfig } from "@/lib/chatbot-config"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface ChatRequest {
  message: string
  conversation_id?: string
  user_id: string
}

export interface ChatResponse {
  message: string
  conversation_id: string
  model_used: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ConversationHistory {
  conversation_id: string
  user_id: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

export class ChatbotService {
  private baseUrl: string
  private abortController: AbortController | null = null

  constructor() {
    this.baseUrl = chatbotConfig.apiUrl
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // Cancel previous request if exists
    if (this.abortController) {
      this.abortController.abort()
    }

    this.abortController = new AbortController()
    
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      signal: this.abortController.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(chatbotConfig.errors.rateLimitError)
      } else if (response.status >= 500) {
        throw new Error(chatbotConfig.errors.serverError)
      } else if (response.status === 401 || response.status === 403) {
        throw new Error(chatbotConfig.errors.apiKeyError)
      } else {
        throw new Error(chatbotConfig.errors.generalError)
      }
    }

    return response.json()
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      return await this.makeRequest<ChatResponse>(
        chatbotConfig.endpoints.chat,
        {
          method: "POST",
          body: JSON.stringify(request),
        }
      )
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request cancelled")
        }
        if (error.message.includes("fetch")) {
          throw new Error(chatbotConfig.errors.networkError)
        }
        throw error
      }
      throw new Error(chatbotConfig.errors.generalError)
    }
  }

  async getConversationHistory(conversationId: string): Promise<ConversationHistory> {
    return await this.makeRequest<ConversationHistory>(
      `${chatbotConfig.endpoints.conversations}/${conversationId}`
    )
  }

  async deleteConversation(conversationId: string): Promise<{ message: string }> {
    return await this.makeRequest<{ message: string }>(
      `${chatbotConfig.endpoints.conversations}/${conversationId}`,
      { method: "DELETE" }
    )
  }

  async getHealthStatus(): Promise<{ status: string; api_configured: boolean }> {
    return await this.makeRequest<{ status: string; api_configured: boolean }>(
      chatbotConfig.endpoints.health
    )
  }

  cancelCurrentRequest() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}

// Export a singleton instance
export const chatbotService = new ChatbotService()
