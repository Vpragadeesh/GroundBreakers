// Configuration for the chatbot API
export const chatbotConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  endpoints: {
    chat: "/api/chatbot/chat",
    conversations: "/api/chatbot/conversations",
    config: "/api/chatbot/config",
    health: "/api/chatbot/health"
  },
  // Default user settings
  defaultUserId: () => `web_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  // UI Configuration
  ui: {
    maxMessages: 50, // Maximum messages to keep in memory
    typingDelay: 100, // Delay between typing characters for better UX
    autoScroll: true,
    showTimestamps: true,
    quickQuestions: [
      "How much rainwater can I collect from my roof?",
      "What size storage tank do I need?",
      "How do I calculate my roof area?",
      "What are the best filtration methods?",
      "How much does a RWH system cost?",
      "What maintenance is required?",
      "How do I design a recharge pit?",
      "What permits do I need for RWH?",
      "How to treat harvested rainwater?",
      "What are the benefits of artificial recharge?"
    ]
  },

  // Error messages
  errors: {
    networkError: "I'm having trouble connecting. Please check your internet connection and try again.",
    serverError: "The server is experiencing issues. Please try again later.",
    apiKeyError: "The chatbot service is not properly configured. Please contact support.",
    rateLimitError: "You're sending messages too quickly. Please wait a moment and try again.",
    generalError: "Something went wrong. Please try again."
  }
}

export type ChatbotConfig = typeof chatbotConfig
