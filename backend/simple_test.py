#!/usr/bin/env python3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

try:
    print("Testing basic chatbot service...")
    
    import os
    os.environ['GROQ_API_KEY'] = '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'
    
    from app.services.chatbot_service import ChatbotService
    print("✅ Chatbot service imported")
    
    chatbot = ChatbotService()
    print("✅ Chatbot service created")
    
    print("RAG service status:", "Available" if chatbot.rag_service else "Not available")
    
    if chatbot.rag_service:
        stats = chatbot.rag_service.get_statistics()
        print("RAG stats:", stats.get('total_chunks_stored', 0), "chunks loaded")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
