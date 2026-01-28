#!/usr/bin/env python3
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    print("Testing imports...")
    
    # Test basic imports
    import sentence_transformers
    print("✅ sentence_transformers imported")
    
    import faiss
    print("✅ faiss imported")
    
    import pypdf
    print("✅ pypdf imported")
    
    # Test our models
    from app.models.rag import RAGConfig, RAGQuery
    print("✅ RAG models imported")
    
    # Test RAG service
    from app.services.rag_service import OptimizedRAGService
    print("✅ RAG service imported")
    
    print("🚀 All imports successful! Creating RAG service...")
    
    # Create service
    service = OptimizedRAGService()
    print("✅ RAG service created successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
