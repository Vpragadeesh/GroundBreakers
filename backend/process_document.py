#!/usr/bin/env python3
"""
Script to process the rainwater harvesting PDF document and initialize the RAG system
"""
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def process_rwh_document():
    """Process the rainwater harvesting PDF document"""
    try:
        # Import after path is set
        from app.services.rag_service import rag_service
        
        # PDF document path
        pdf_path = "/home/yuvan/Downloads/1686136871443876411file.pdf"
        
        if not os.path.exists(pdf_path):
            print(f"Error: PDF file not found at {pdf_path}")
            return False
        
        print(f"Processing PDF document: {pdf_path}")
        
        # Process the document
        result = rag_service.process_document(pdf_path)
        
        if result.success:
            print(f"✅ Document processed successfully!")
            print(f"📄 Total chunks created: {result.total_chunks}")
            print(f"⏱️  Processing time: {result.processing_time_seconds:.2f} seconds")
            print(f"📚 Document ID: {result.document_id}")
        else:
            print(f"❌ Document processing failed: {result.error_message}")
            return False
        
        # Test the search functionality
        print("\n🔍 Testing search functionality...")
        
        from app.models.rag import RAGQuery
        
        test_queries = [
            "rainwater harvesting benefits",
            "roof catchment system",
            "storage tank design",
            "water quality treatment"
        ]
        
        for query in test_queries:
            print(f"\nTesting query: '{query}'")
            
            rag_query = RAGQuery(
                query=query,
                top_k=2,
                min_score=0.2
            )
            
            search_response = rag_service.search(rag_query)
            
            if search_response.results:
                print(f"  Found {len(search_response.results)} relevant chunks")
                for i, result in enumerate(search_response.results, 1):
                    print(f"  Result {i}: Score {result.score:.3f} - {result.chunk.content[:100]}...")
            else:
                print("  No relevant results found")
        
        # Print statistics
        print("\n📊 RAG Service Statistics:")
        stats = rag_service.get_statistics()
        for key, value in stats.items():
            print(f"  {key}: {value}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error processing document: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Initializing RAG system with rainwater harvesting document...")
    
    # Check if we can run async
    import asyncio
    
    async def main():
        return process_rwh_document()
    
    success = asyncio.run(main())
    
    if success:
        print("\n✅ RAG system initialization completed successfully!")
        print("🎯 The chatbot is now ready with enhanced rainwater harvesting knowledge.")
    else:
        print("\n❌ RAG system initialization failed.")
        sys.exit(1)
