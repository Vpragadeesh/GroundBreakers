"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, MessageSquare, X, AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { chatbotService, type ChatMessage } from "@/lib/chatbot-service"
import { chatbotConfig } from "@/lib/chatbot-config"

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm AquaBot, your rainwater harvesting assistant. I can help you with system design, calculations, maintenance tips, and more. How can I assist you today?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [userId] = useState(() => chatbotConfig.defaultUserId())
  const [error, setError] = useState<string | null>(null)
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight
        }, 100)
      }
    }
  }, [])

  // Check backend health when component mounts
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await chatbotService.getHealthStatus()
        setIsHealthy(health.api_configured && health.status === "healthy")
      } catch (error) {
        setIsHealthy(false)
        console.warn("Chatbot backend is not available:", error)
      }
    }
    
    checkHealth()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const clearError = () => setError(null)

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await chatbotService.sendMessage({
        message: content.trim(),
        conversation_id: conversationId || undefined,
        user_id: userId
      })
      
      if (!conversationId) {
        setConversationId(response.conversation_id)
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: error instanceof Error ? error.message : chatbotConfig.errors.generalError,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleQuickQuestion = (question: string) => {
    sendMessage(question)
  }

  const retryConnection = async () => {
    setError(null)
    try {
      const health = await chatbotService.getHealthStatus()
      setIsHealthy(health.api_configured && health.status === "healthy")
      if (health.api_configured) {
        setError(null)
      }
    } catch (error) {
      setIsHealthy(false)
      setError("Unable to connect to chatbot service")
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-12 w-12 sm:h-14 sm:w-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700"
        >
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-[calc(100vw-2rem)] sm:w-96 sm:max-w-none">
      <Card className="w-full h-[80vh] max-h-[600px] min-h-[400px] shadow-2xl border-2 bg-background flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 py-3 border-b shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-blue-500 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">AquaBot</CardTitle>
              <div className="flex items-center space-x-2 min-w-0">
                <p className="text-sm text-muted-foreground truncate">RWH Assistant</p>
                {isHealthy === false && (
                  <div className="flex items-center space-x-1 text-xs text-red-500 shrink-0">
                    <AlertCircle className="h-3 w-3" />
                    <span>Offline</span>
                  </div>
                )}
                {isHealthy === true && (
                  <div className="h-2 w-2 bg-green-500 rounded-full shrink-0"></div>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex flex-col flex-1 p-4 min-h-0">
          {error && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2 min-w-0">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400 truncate">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={retryConnection}
                className="h-6 w-6 p-0 shrink-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-hidden max-w-full">
            <ScrollArea className="h-full w-full chatbot-scroll-area" ref={scrollAreaRef}>
              <div className="space-y-3 p-1 max-w-full overflow-hidden">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2 w-full",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-6 w-6 mt-1 shrink-0">
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm chatbot-message min-w-0 overflow-hidden",
                        message.role === "user"
                          ? "bg-blue-500 text-white max-w-[75%]"
                          : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 max-w-[80%]"
                      )}
                      style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word'
                      }}
                    >
                      <div 
                        className="whitespace-pre-wrap break-words overflow-hidden"
                        style={{
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word',
                          maxWidth: '100%'
                        }}
                      >
                        {message.content}
                      </div>
                      <div className={cn(
                        "text-xs mt-1 opacity-70",
                        message.role === "user" ? "text-right" : "text-left"
                      )}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    
                    {message.role === "user" && (
                      <Avatar className="h-6 w-6 mt-1 shrink-0">
                        <AvatarFallback className="bg-gray-500 text-white text-xs">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <Avatar className="h-6 w-6 mt-1 shrink-0">
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {messages.length === 1 && !error && (
            <div className="mb-3 shrink-0">
              <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
              <div className="grid grid-cols-1 gap-1">
                {chatbotConfig.ui.quickQuestions.slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 px-2 justify-start text-left truncate"
                    onClick={() => handleQuickQuestion(question)}
                    disabled={isLoading}
                    title={question}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="shrink-0 space-y-2">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={clearError}
                placeholder="Ask about rainwater harvesting..."
                disabled={isLoading || isHealthy === false}
                className="flex-1 min-w-0"
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={!input.trim() || isLoading || isHealthy === false}
                className="bg-blue-500 hover:bg-blue-600 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            
            {isHealthy === false && (
              <p className="text-xs text-muted-foreground text-center">
                Chatbot is offline. Please check if the backend server is running.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
