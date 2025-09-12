from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from ..models.chatbot import (
    ChatRequest, 
    ChatResponse, 
    ConversationHistory, 
    ChatbotConfig
)
from ..services.chatbot_service import chatbot_service

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest):
    """
    Send a message to the chatbot and get a response
    """
    try:
        response = await chatbot_service.get_response(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")


@router.get("/conversations/{conversation_id}", response_model=ConversationHistory)
async def get_conversation(conversation_id: str):
    """
    Get conversation history by ID
    """
    conversation = chatbot_service.get_conversation_history(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """
    Delete a conversation
    """
    success = chatbot_service.delete_conversation(conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted successfully"}


@router.get("/conversations")
async def list_conversations(user_id: Optional[str] = None):
    """
    List all conversations, optionally filtered by user_id
    """
    conversations = []
    for conv_id, conv in chatbot_service.conversations.items():
        if user_id is None or conv.user_id == user_id:
            conversations.append({
                "conversation_id": conv_id,
                "user_id": conv.user_id,
                "message_count": len(conv.messages),
                "created_at": conv.created_at,
                "updated_at": conv.updated_at
            })
    return {"conversations": conversations}


@router.get("/config", response_model=ChatbotConfig)
async def get_config():
    """
    Get current chatbot configuration
    """
    return chatbot_service.config


@router.put("/config")
async def update_config(config: ChatbotConfig):
    """
    Update chatbot configuration
    """
    try:
        chatbot_service.update_config(config)
        return {"message": "Configuration updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Configuration update error: {str(e)}")


@router.get("/health")
async def chatbot_health():
    """
    Health check for chatbot service
    """
    try:
        # Test if we can access the Groq client
        if chatbot_service.groq_api_key:
            return {
                "status": "healthy",
                "model": chatbot_service.config.model,
                "api_configured": True
            }
        else:
            return {
                "status": "unhealthy", 
                "api_configured": False,
                "error": "GROQ_API_KEY not configured"
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
