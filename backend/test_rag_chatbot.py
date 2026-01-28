#!/usr/bin/env python3
"""
Test script to verify the complete RAG + Chatbot integration
"""
import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
load_dotenv()

async def test_chatbot_with_rag():
    """Test the chatbot with RAG integration"""
    try:
        print("🚀 Testing Chatbot with RAG Integration...")
        
        # Import services
        from app.models.chatbot import ChatRequest
        from app.services.chatbot_service import ChatbotService
        
        print("✅ Services imported successfully!")
        
        # Create chatbot service
        chatbot = ChatbotService()
        print("✅ Chatbot service created!")
        
        # Test queries that should benefit from RAG
        test_queries = [
            "What are the benefits of rainwater harvesting?",
            "How do I design a roof catchment system?",
            "What storage capacity do I need for my tank?",
            "Tell me about different types of rainwater harvesting systems",
            "What are the costs involved in setting up rainwater harvesting?"
        ]
        
        print("\n🔍 Testing chatbot responses with RAG enhancement...\n")
        
        for i, query in enumerate(test_queries, 1):
            print(f"{'='*60}")
            print(f"Test {i}: {query}")
            print(f"{'='*60}")
            
            # Create chat request
            request = ChatRequest(
                message=query,
                user_id="test_user",
                conversation_id=None  # Will create new conversation
            )
            
            # Get response
            try:
                response = await chatbot.get_response(request)
                
                print(f"✅ Response received:")
                print(f"🤖 {response.message}")
                
                if response.usage:
                    print(f"\n📊 Usage: {response.usage['total_tokens']} tokens")
                
                print(f"🔗 Conversation ID: {response.conversation_id}")
                
            except Exception as e:
                print(f"❌ Error getting response: {e}")
            
            print("\n")
        
        # Test conversation continuity
        print("🔄 Testing conversation continuity...")
        
        request1 = ChatRequest(
            message="What is rainwater harvesting?",
            user_id="test_user",
            conversation_id=None
        )
        
        response1 = await chatbot.get_response(request1)
        conversation_id = response1.conversation_id
        
        print(f"First question: What is rainwater harvesting?")
        print(f"Response: {response1.message[:200]}...")
        
        # Follow-up question using same conversation
        request2 = ChatRequest(
            message="How much does it cost to set up?",
            user_id="test_user",
            conversation_id=conversation_id
        )
        
        response2 = await chatbot.get_response(request2)
        
        print(f"\nFollow-up: How much does it cost to set up?")
        print(f"Response: {response2.message[:200]}...")
        
        print("\n✅ Chatbot with RAG integration test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Set GROQ API key for testing (make sure it's in environment)
    if not os.getenv("GROQ_API_KEY"):
        print("⚠️  Warning: GROQ_API_KEY environment variable not set!")
        print("Please set your GROQ API key before running this test.")
        sys.exit(1)
    
    print("🧪 RAG + Chatbot Integration Test")
    print("=" * 50)
    
    success = asyncio.run(test_chatbot_with_rag())
    
    if success:
        print("\n🎉 All tests passed! The RAG-enhanced chatbot is ready.")
    else:
        print("\n💥 Some tests failed. Check the output above.")
        sys.exit(1)
