from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File
from typing import List, Dict, Any
import os
import tempfile
import shutil
from pathlib import Path

from ..models.rag import (
    RAGQuery, RAGResponse, RAGConfig, 
    DocumentProcessingStatus, RAGSearchResult
)
from ..services.rag_service import rag_service

router = APIRouter()


@router.post("/initialize", summary="Initialize RAG service with PDF document")
async def initialize_rag_service(background_tasks: BackgroundTasks):
    """
    Initialize RAG service by processing the RWH PDF document
    """
    try:
        # Path to the RWH PDF document
        pdf_path = "/home/yuvan/Downloads/1686136871443876411file.pdf"
        
        if not os.path.exists(pdf_path):
            raise HTTPException(
                status_code=404, 
                detail=f"PDF file not found at {pdf_path}"
            )
        
        # Process document in background
        background_tasks.add_task(rag_service.process_document, pdf_path)
        
        return {
            "message": "RAG service initialization started",
            "pdf_path": pdf_path,
            "status": "processing"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing RAG service: {str(e)}")


@router.post("/process-document", response_model=DocumentProcessingStatus)
async def process_document(background_tasks: BackgroundTasks, file_path: str):
    """
    Process a document and add it to the RAG system
    """
    try:
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Start processing in background
        background_tasks.add_task(rag_service.process_document, file_path)
        
        return DocumentProcessingStatus(
            file_path=file_path,
            status="processing",
            file_size_mb=os.path.getsize(file_path) / (1024 * 1024)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@router.post("/upload-document")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload and process a new document
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.txt', '.md')):
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file type. Please upload PDF, TXT, or MD files."
            )
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            temp_path = tmp_file.name
        
        # Process document
        background_tasks.add_task(rag_service.process_document, temp_path)
        
        return {
            "message": "File uploaded successfully and processing started",
            "filename": file.filename,
            "status": "processing"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")


@router.post("/search", response_model=RAGResponse)
async def search_documents(query: RAGQuery):
    """
    Search for relevant document chunks
    """
    try:
        if rag_service.vector_store is None or rag_service.vector_store.ntotal == 0:
            raise HTTPException(
                status_code=400, 
                detail="No documents available. Please initialize the RAG service first."
            )
        
        response = await rag_service.search_documents(query)
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching documents: {str(e)}")


@router.get("/search/{query_text}")
async def quick_search(
    query_text: str, 
    top_k: int = 5, 
    similarity_threshold: float = 0.7
):
    """
    Quick search endpoint with URL parameters
    """
    query = RAGQuery(
        query=query_text,
        top_k=top_k,
        similarity_threshold=similarity_threshold
    )
    return await search_documents(query)


@router.get("/config", response_model=RAGConfig)
async def get_rag_config():
    """
    Get current RAG configuration
    """
    return rag_service.config


@router.put("/config")
async def update_rag_config(config: RAGConfig):
    """
    Update RAG configuration
    """
    try:
        rag_service.config = config
        return {"message": "Configuration updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating configuration: {str(e)}")


@router.get("/statistics")
async def get_rag_statistics():
    """
    Get RAG service statistics and performance metrics
    """
    try:
        stats = rag_service.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting statistics: {str(e)}")


@router.post("/reindex")
async def reindex_documents(background_tasks: BackgroundTasks):
    """
    Rebuild the vector store index
    """
    try:
        background_tasks.add_task(rag_service.reindex_documents)
        return {"message": "Reindexing started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting reindex: {str(e)}")


@router.delete("/cache")
async def clear_cache():
    """
    Clear the embedding cache
    """
    try:
        rag_service.clear_cache()
        return {"message": "Cache cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing cache: {str(e)}")


@router.get("/health")
async def rag_health_check():
    """
    Health check for RAG service
    """
    try:
        stats = rag_service.get_statistics()
        
        return {
            "status": "healthy" if rag_service.vector_store is not None else "not_initialized",
            "documents_available": stats["vector_store_size"] > 0,
            "total_chunks": stats["total_chunks_stored"],
            "embedding_model": stats["embedding_model"],
            "cache_hit_rate": f"{stats['cache_hit_rate']:.2%}",
            "average_retrieval_time_ms": f"{stats['average_retrieval_time_ms']:.2f}ms"
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
