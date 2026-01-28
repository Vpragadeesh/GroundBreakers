#!/usr/bin/env python3
"""
Simple script to process the rainwater harvesting PDF and test the RAG system
"""
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def simple_process():
    """Simple processing function"""
    try:
        print("🔧 Importing RAG service...")
        
        # Test imports first
        from app.services.rag_service import OptimizedRAGService
        from app.models.rag import RAGConfig, RAGQuery
        
        print("✅ Imports successful!")
        
        # Create RAG service
        print("🚀 Initializing RAG service...")
        rag_service = OptimizedRAGService()
        
        print("✅ RAG service initialized!")
        
        # PDF document path
        pdf_path = "/home/yuvan/Downloads/1686136871443876411file.pdf"
        
        print(f"📄 Processing PDF: {pdf_path}")
        
        # Process the document
        result = rag_service.process_document(pdf_path)
        
        if result.status == "completed":
            print(f"✅ Document processed successfully!")
            print(f"📄 Total chunks created: {result.total_chunks}")
            processing_time = (result.completed_at - result.started_at).total_seconds() if result.completed_at else 0
            print(f"⏱️  Processing time: {processing_time:.2f} seconds")
        else:
            print(f"❌ Document processing failed: {result.error_message}")
            return False
        
        # Test search functionality
        print("\n🔍 Testing search functionality...")
        
        test_queries = [
            "rainwater harvesting benefits",
            "roof catchment system",
            "storage tank design"
        ]
        
        for query in test_queries:
            print(f"\n  Testing query: '{query}'")
            
            rag_query = RAGQuery(
                query=query,
                top_k=2,
                similarity_threshold=0.2
            )
            
            try:
                # Use sync search instead of async
                search_response = rag_service.search_documents(rag_query)
                
                if search_response.retrieved_chunks:
                    print(f"    Found {len(search_response.retrieved_chunks)} relevant chunks")
                    for i, chunk in enumerate(search_response.retrieved_chunks, 1):
                        score = chunk.metadata.get("similarity_score", 0.0)
                        print(f"    Result {i}: Score {score:.3f} - {chunk.content[:100]}...")
                else:
                    print("    No relevant results found")
            except Exception as e:
                print(f"    Search error: {e}")
        
        # Print statistics
        print("\n📊 RAG Service Statistics:")
        stats = rag_service.get_statistics()
        for key, value in stats.items():
            print(f"  {key}: {value}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Processing Rainwater Harvesting Document...")
    
    success = simple_process()
    
    if success:
        print("\n✅ Document processing completed successfully!")
        print("🎯 The RAG system is ready for chatbot integration.")
    else:
        print("\n❌ Document processing failed.")
        sys.exit(1)
