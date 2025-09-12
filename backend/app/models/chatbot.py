from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message sender (user/assistant)")
    content: str = Field(..., description="Content of the message")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)


class ChatRequest(BaseModel):
    message: str = Field(..., description="User's message to the chatbot")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")
    user_id: Optional[str] = Field(None, description="User ID for personalization")


class ChatResponse(BaseModel):
    message: str = Field(..., description="Chatbot's response")
    conversation_id: str = Field(..., description="Conversation ID")
    model_used: str = Field(..., description="AI model used for the response")
    usage: Optional[dict] = Field(None, description="Token usage information")


class ConversationHistory(BaseModel):
    conversation_id: str
    user_id: Optional[str] = None
    messages: List[ChatMessage]
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ChatbotConfig(BaseModel):
    max_tokens: int = Field(default=1000, description="Maximum tokens for response")
    temperature: float = Field(default=0.7, description="Temperature for response generation")
    model: str = Field(default="llama-3.1-8b-instant", description="Groq model to use")
    system_prompt: str = Field(
        default="You are AquaBot, an AI assistant specialized in rainwater harvesting and artificial recharge systems. "
        "You help users understand optimal ways to implement rainwater harvesting solutions, track their progress, "
        "and provide expert guidance on sustainable water management practices. Always provide practical, "
        "actionable advice tailored to the user's specific needs and location.",
        description="System prompt for the chatbot"
    )
