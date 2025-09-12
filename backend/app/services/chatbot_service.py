import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from groq import Groq
from ..models.chatbot import (
    ChatMessage, 
    ChatRequest, 
    ChatResponse, 
    ConversationHistory, 
    ChatbotConfig
)
from ..utils.chatbot_utils import ChatbotUtils
from dotenv import load_dotenv


class ChatbotService:
    def __init__(self):
        load_dotenv()
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        self.client = Groq(api_key=self.groq_api_key)
        self.config = ChatbotConfig()
        
        # In-memory storage for conversations (replace with database in production)
        self.conversations: Dict[str, ConversationHistory] = {}
    
    def _get_conversation(self, conversation_id: Optional[str], user_id: Optional[str]) -> ConversationHistory:
        """Get or create a conversation"""
        if conversation_id and conversation_id in self.conversations:
            conversation = self.conversations[conversation_id]
            conversation.updated_at = datetime.now()
            return conversation
        
        # Create new conversation
        new_id = str(uuid.uuid4())
        conversation = ConversationHistory(
            conversation_id=new_id,
            user_id=user_id,
            messages=[]
        )
        self.conversations[new_id] = conversation
        return conversation
    
    def _prepare_messages_for_groq(self, conversation: ConversationHistory, new_message: str) -> List[dict]:
        """Prepare messages in the format expected by Groq API"""
        messages = [{"role": "system", "content": self.config.system_prompt}]
        
        # Add conversation history
        for msg in conversation.messages[-10:]:  # Keep last 10 messages for context
            messages.append({"role": msg.role, "content": msg.content})
        
        # Add new user message
        messages.append({"role": "user", "content": new_message})
        
        return messages
    
    def _enhance_system_prompt_with_context(self, rwh_context: Dict[str, Any]) -> str:
        """Enhance system prompt based on extracted context"""
        enhancements = []
        
        if rwh_context.get("area_value"):
            enhancements.append(f"User has mentioned roof area: {rwh_context['area_value']} sq units")
        
        if rwh_context.get("rainfall_value"):
            enhancements.append(f"User mentioned rainfall: {rwh_context['rainfall_value']} units")
        
        if rwh_context.get("mentions_cost"):
            enhancements.append("User is concerned about cost - provide budget-friendly options")
        
        return "; ".join(enhancements) if enhancements else ""

    async def get_response(self, request: ChatRequest) -> ChatResponse:
        """Generate a response using Groq API"""
        try:
            # Sanitize user input
            sanitized_message = ChatbotUtils.sanitize_message(request.message)
            
            # Extract RWH context for enhanced responses
            rwh_context = ChatbotUtils.extract_rwh_context(sanitized_message)
            
            # Get or create conversation
            conversation = self._get_conversation(request.conversation_id, request.user_id)
            
            # Prepare messages for Groq
            messages = self._prepare_messages_for_groq(conversation, sanitized_message)
            
            # Add context-aware system enhancement
            if any(rwh_context[key] for key in ["mentions_roof", "mentions_area", "mentions_rainfall"]):
                context_enhancement = self._enhance_system_prompt_with_context(rwh_context)
                if context_enhancement:
                    messages[0]["content"] += f"\n\nCurrent context: {context_enhancement}"
            
            # Call Groq API
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.config.model,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                stream=False
            )
            
            # Extract response
            assistant_message = chat_completion.choices[0].message.content
            
            # Save messages to conversation history
            user_msg = ChatMessage(role="user", content=sanitized_message)
            assistant_msg = ChatMessage(role="assistant", content=assistant_message)
            
            conversation.messages.extend([user_msg, assistant_msg])
            conversation.updated_at = datetime.now()
            
            # Add contextual suggestions if relevant
            suggestions = ChatbotUtils.generate_rwh_suggestions(rwh_context)
            if suggestions:
                assistant_message += f"\n\n💡 **Quick Tips:**\n" + "\n".join(f"• {tip}" for tip in suggestions[:3])
            
            # Prepare usage information
            usage_info = None
            if hasattr(chat_completion, 'usage'):
                usage_info = {
                    "prompt_tokens": chat_completion.usage.prompt_tokens,
                    "completion_tokens": chat_completion.usage.completion_tokens,
                    "total_tokens": chat_completion.usage.total_tokens
                }
            
            return ChatResponse(
                message=assistant_message,
                conversation_id=conversation.conversation_id,
                model_used=self.config.model,
                usage=usage_info
            )
            
        except Exception as e:
            print(e)
            # Fallback response in case of API failure
            fallback_response = (
                "I apologize, but I'm experiencing technical difficulties right now. "
                "However, I'd be happy to help you with rainwater harvesting when I'm back online. "
                "In the meantime, consider checking your roof area, local rainfall patterns, "
                "and storage capacity requirements for your rainwater harvesting system."
            )
            
            conversation = self._get_conversation(request.conversation_id, request.user_id)
            return ChatResponse(
                message=fallback_response,
                conversation_id=conversation.conversation_id,
                model_used="fallback",
                usage=None
            )
    
    def get_conversation_history(self, conversation_id: str) -> Optional[ConversationHistory]:
        """Get conversation history by ID"""
        return self.conversations.get(conversation_id)
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation"""
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            return True
        return False
    
    def update_config(self, config: ChatbotConfig):
        """Update chatbot configuration"""
        self.config = config


# Global instance

chatbot_service = ChatbotService()
