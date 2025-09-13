from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class DocumentChunk(BaseModel):
    """Represents a chunk of document content with metadata"""
    id: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    embedding: Optional[List[float]] = None
    chunk_index: int
    source_file: str
    page_number: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.now)


class RAGQuery(BaseModel):
    """Query for RAG system"""
    query: str = Field(..., description="User query for document retrieval")
    top_k: int = Field(default=5, description="Number of relevant chunks to retrieve")
    similarity_threshold: float = Field(default=0.7, description="Minimum similarity score")
    include_metadata: bool = Field(default=True, description="Include chunk metadata in results")


class RAGResponse(BaseModel):
    """Response from RAG system"""
    retrieved_chunks: List[DocumentChunk]
    query: str
    total_chunks_found: int
    retrieval_time_ms: float
    sources: List[str] = Field(default_factory=list)


class RAGConfig(BaseModel):
    """Configuration for RAG system"""
    # Embedding model configuration
    embedding_model: str = Field(default="all-MiniLM-L6-v2", description="Sentence transformer model")
    chunk_size: int = Field(default=1000, description="Size of text chunks in characters")
    chunk_overlap: int = Field(default=200, description="Overlap between chunks")
    
    # Vector store configuration
    vector_store_type: str = Field(default="faiss", description="Type of vector store (faiss/chroma)")
    vector_store_path: str = Field(default="./data/vector_store", description="Path to vector store")
    
    # Retrieval configuration
    default_top_k: int = Field(default=5, description="Default number of chunks to retrieve")
    similarity_threshold: float = Field(default=0.7, description="Minimum similarity threshold")
    
    # Processing configuration
    max_file_size_mb: int = Field(default=50, description="Maximum PDF file size in MB")
    supported_formats: List[str] = Field(default=["pdf", "txt", "md"], description="Supported file formats")
    
    # Performance optimization
    enable_caching: bool = Field(default=True, description="Enable embedding caching")
    batch_size: int = Field(default=32, description="Batch size for processing")
    use_gpu: bool = Field(default=False, description="Use GPU for embeddings if available")


class DocumentProcessingStatus(BaseModel):
    """Status of document processing"""
    file_path: str
    status: str  # "processing", "completed", "failed"
    progress: float = Field(default=0.0, description="Processing progress (0-100)")
    total_chunks: int = Field(default=0)
    processed_chunks: int = Field(default=0)
    error_message: Optional[str] = None
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    file_size_mb: float = Field(default=0.0)


class RAGSearchResult(BaseModel):
    """Enhanced search result with relevance scoring"""
    chunk: DocumentChunk
    similarity_score: float
    relevance_explanation: Optional[str] = None
    context_window: Optional[str] = None  # Surrounding text for better context
