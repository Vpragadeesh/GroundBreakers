import os
import time
import hashlib
import pickle
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import numpy as np
from datetime import datetime

# RAG-specific imports
from sentence_transformers import SentenceTransformer
import faiss
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
import tiktoken

from ..models.rag import (
    DocumentChunk, RAGQuery, RAGResponse, RAGConfig, 
    DocumentProcessingStatus, RAGSearchResult
)


class OptimizedRAGService:
    """
    Optimized RAG service with caching, efficient retrieval, and performance monitoring
    """
    
    def __init__(self, config: RAGConfig = None):
        self.config = config or RAGConfig()
        self.embedding_model = None
        self.vector_store = None
        self.document_chunks: Dict[str, DocumentChunk] = {}
        self.embedding_cache: Dict[str, np.ndarray] = {}
        self.tokenizer = None
        
        # Performance tracking
        self.stats = {
            "total_documents_processed": 0,
            "total_chunks_created": 0,
            "total_queries_processed": 0,
            "average_retrieval_time_ms": 0.0,
            "cache_hits": 0,
            "cache_misses": 0
        }
        
        self._initialize_components()
    
    def _initialize_components(self):
        """Initialize embedding model, vector store, and other components"""
        try:
            # Initialize embedding model
            print(f"Loading embedding model: {self.config.embedding_model}")
            self.embedding_model = SentenceTransformer(self.config.embedding_model)
            
            # Initialize tokenizer for token counting
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
            
            # Create directories
            Path(self.config.vector_store_path).mkdir(parents=True, exist_ok=True)
            
            # Load existing vector store if available
            self._load_existing_vector_store()
            
            print("RAG service initialized successfully")
            
        except Exception as e:
            print(f"Error initializing RAG service: {e}")
            raise
    
    def _load_existing_vector_store(self):
        """Load existing vector store and metadata"""
        vector_store_file = Path(self.config.vector_store_path) / "faiss_index.bin"
        metadata_file = Path(self.config.vector_store_path) / "chunks_metadata.pkl"
        
        if vector_store_file.exists() and metadata_file.exists():
            try:
                # Load FAISS index
                self.vector_store = faiss.read_index(str(vector_store_file))
                
                # Load document chunks metadata
                with open(metadata_file, 'rb') as f:
                    self.document_chunks = pickle.load(f)
                
                print(f"Loaded existing vector store with {len(self.document_chunks)} chunks")
                
            except Exception as e:
                print(f"Error loading existing vector store: {e}")
                self._create_new_vector_store()
        else:
            self._create_new_vector_store()
    
    def _create_new_vector_store(self):
        """Create a new vector store"""
        embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
        self.vector_store = faiss.IndexFlatIP(embedding_dim)  # Inner product for cosine similarity
        self.document_chunks = {}
    
    def _save_vector_store(self):
        """Save vector store and metadata to disk"""
        try:
            vector_store_file = Path(self.config.vector_store_path) / "faiss_index.bin"
            metadata_file = Path(self.config.vector_store_path) / "chunks_metadata.pkl"
            
            # Save FAISS index
            faiss.write_index(self.vector_store, str(vector_store_file))
            
            # Save metadata
            with open(metadata_file, 'wb') as f:
                pickle.dump(self.document_chunks, f)
                
            print("Vector store saved successfully")
            
        except Exception as e:
            print(f"Error saving vector store: {e}")
    
    def _get_embedding_cache_key(self, text: str) -> str:
        """Generate cache key for embeddings"""
        return hashlib.md5(text.encode()).hexdigest()
    
    def _get_embeddings(self, texts: List[str]) -> np.ndarray:
        """Get embeddings with caching"""
        embeddings = []
        uncached_texts = []
        uncached_indices = []
        
        # Check cache first
        for i, text in enumerate(texts):
            if self.config.enable_caching:
                cache_key = self._get_embedding_cache_key(text)
                if cache_key in self.embedding_cache:
                    embeddings.append(self.embedding_cache[cache_key])
                    self.stats["cache_hits"] += 1
                    continue
            
            embeddings.append(None)
            uncached_texts.append(text)
            uncached_indices.append(i)
            self.stats["cache_misses"] += 1
        
        # Generate embeddings for uncached texts
        if uncached_texts:
            new_embeddings = self.embedding_model.encode(
                uncached_texts, 
                batch_size=self.config.batch_size,
                show_progress_bar=len(uncached_texts) > 10
            )
            
            # Normalize embeddings for cosine similarity
            new_embeddings = new_embeddings / np.linalg.norm(new_embeddings, axis=1, keepdims=True)
            
            # Cache and insert new embeddings
            for i, embedding in enumerate(new_embeddings):
                original_idx = uncached_indices[i]
                text = uncached_texts[i]
                
                embeddings[original_idx] = embedding
                
                if self.config.enable_caching:
                    cache_key = self._get_embedding_cache_key(text)
                    self.embedding_cache[cache_key] = embedding
        
        return np.array(embeddings)
    
    def _chunk_document(self, text: str, source_file: str) -> List[DocumentChunk]:
        """Split document into optimized chunks"""
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.config.chunk_size,
            chunk_overlap=self.config.chunk_overlap,
            separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""],
            keep_separator=True
        )
        
        chunks = text_splitter.split_text(text)
        document_chunks = []
        
        for i, chunk_text in enumerate(chunks):
            # Skip very small chunks
            if len(chunk_text.strip()) < 50:
                continue
            
            # Count tokens
            token_count = len(self.tokenizer.encode(chunk_text))
            
            chunk = DocumentChunk(
                id=f"{hashlib.md5(chunk_text.encode()).hexdigest()}",
                content=chunk_text.strip(),
                chunk_index=i,
                source_file=source_file,
                metadata={
                    "token_count": token_count,
                    "char_count": len(chunk_text),
                    "chunk_size": self.config.chunk_size,
                    "overlap": self.config.chunk_overlap
                }
            )
            document_chunks.append(chunk)
        
        return document_chunks
    
    def process_document(self, file_path: str) -> DocumentProcessingStatus:
        """Process a document and add it to the vector store"""
        status = DocumentProcessingStatus(
            file_path=file_path,
            status="processing",
            file_size_mb=os.path.getsize(file_path) / (1024 * 1024)
        )
        
        try:
            # Check file size
            if status.file_size_mb > self.config.max_file_size_mb:
                status.status = "failed"
                status.error_message = f"File size ({status.file_size_mb:.1f}MB) exceeds limit ({self.config.max_file_size_mb}MB)"
                return status
            
            print(f"Processing document: {file_path}")
            
            # Load and extract text
            if file_path.lower().endswith('.pdf'):
                loader = PyPDFLoader(file_path)
                documents = loader.load()
                text = "\n\n".join([doc.page_content for doc in documents])
            else:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            
            # Create chunks
            chunks = self._chunk_document(text, file_path)
            status.total_chunks = len(chunks)
            
            if not chunks:
                status.status = "failed"
                status.error_message = "No valid chunks created from document"
                return status
            
            # Process chunks in batches
            batch_size = self.config.batch_size
            all_embeddings = []
            
            for i in range(0, len(chunks), batch_size):
                batch_chunks = chunks[i:i + batch_size]
                batch_texts = [chunk.content for chunk in batch_chunks]
                
                # Generate embeddings
                embeddings = self._get_embeddings(batch_texts)
                all_embeddings.extend(embeddings)
                
                # Update progress
                status.processed_chunks = min(i + batch_size, len(chunks))
                status.progress = (status.processed_chunks / status.total_chunks) * 100
                
                print(f"Processed {status.processed_chunks}/{status.total_chunks} chunks")
            
            # Add to vector store
            if self.vector_store.ntotal == 0:
                # First documents - build index
                embeddings_array = np.array(all_embeddings).astype('float32')
                self.vector_store.add(embeddings_array)
            else:
                # Add to existing index
                embeddings_array = np.array(all_embeddings).astype('float32')
                self.vector_store.add(embeddings_array)
            
            # Store chunks with embeddings
            for chunk, embedding in zip(chunks, all_embeddings):
                chunk.embedding = embedding.tolist()
                self.document_chunks[chunk.id] = chunk
            
            # Save to disk
            self._save_vector_store()
            
            # Update statistics
            self.stats["total_documents_processed"] += 1
            self.stats["total_chunks_created"] += len(chunks)
            
            status.status = "completed"
            status.progress = 100.0
            status.completed_at = datetime.now()
            
            print(f"Successfully processed {len(chunks)} chunks from {file_path}")
            
        except Exception as e:
            status.status = "failed"
            status.error_message = str(e)
            print(f"Error processing document {file_path}: {e}")
        
        return status
    
    def search_documents(self, query: RAGQuery) -> RAGResponse:
        """Search for relevant document chunks"""
        start_time = time.time()
        
        try:
            # Generate query embedding
            query_embedding = self._get_embeddings([query.query])[0]
            
            # Search vector store
            similarities, indices = self.vector_store.search(
                query_embedding.reshape(1, -1).astype('float32'), 
                query.top_k
            )
            
            # Collect results
            retrieved_chunks = []
            chunk_list = list(self.document_chunks.values())
            
            for i, (similarity, idx) in enumerate(zip(similarities[0], indices[0])):
                if idx < len(chunk_list) and similarity >= query.similarity_threshold:
                    chunk = chunk_list[idx]
                    
                    # Add similarity score to metadata if requested
                    if query.include_metadata:
                        chunk.metadata["similarity_score"] = float(similarity)
                        chunk.metadata["rank"] = i + 1
                    
                    retrieved_chunks.append(chunk)
            
            # Calculate retrieval time
            retrieval_time_ms = (time.time() - start_time) * 1000
            
            # Extract unique sources
            sources = list(set(chunk.source_file for chunk in retrieved_chunks))
            
            # Update statistics
            self.stats["total_queries_processed"] += 1
            self.stats["average_retrieval_time_ms"] = (
                (self.stats["average_retrieval_time_ms"] * (self.stats["total_queries_processed"] - 1) + 
                 retrieval_time_ms) / self.stats["total_queries_processed"]
            )
            
            return RAGResponse(
                retrieved_chunks=retrieved_chunks,
                query=query.query,
                total_chunks_found=len(retrieved_chunks),
                retrieval_time_ms=retrieval_time_ms,
                sources=sources
            )
            
        except Exception as e:
            print(f"Error searching documents: {e}")
            return RAGResponse(
                retrieved_chunks=[],
                query=query.query,
                total_chunks_found=0,
                retrieval_time_ms=(time.time() - start_time) * 1000,
                sources=[]
            )
    
    async def search(self, query: RAGQuery):
        """Alias for search_documents to match chatbot service expectations"""
        rag_response = self.search_documents(query)
        
        # Convert to expected format with results list
        search_results = []
        for chunk in rag_response.retrieved_chunks:
            search_result = RAGSearchResult(
                chunk=chunk,
                score=chunk.metadata.get("similarity_score", 0.0),
                source=chunk.source_file
            )
            search_results.append(search_result)
        
        # Create a response object with results attribute
        class SearchResponse:
            def __init__(self, results):
                self.results = results
                self.query = rag_response.query
                self.total_found = rag_response.total_chunks_found
                self.retrieval_time_ms = rag_response.retrieval_time_ms
                self.sources = rag_response.sources
        
        return SearchResponse(search_results)

    def get_statistics(self) -> Dict[str, Any]:
        """Get service statistics"""
        return {
            **self.stats,
            "vector_store_size": self.vector_store.ntotal if self.vector_store else 0,
            "total_chunks_stored": len(self.document_chunks),
            "cache_hit_rate": (
                self.stats["cache_hits"] / 
                (self.stats["cache_hits"] + self.stats["cache_misses"]) 
                if (self.stats["cache_hits"] + self.stats["cache_misses"]) > 0 else 0
            ),
            "embedding_model": self.config.embedding_model,
            "vector_store_path": self.config.vector_store_path
        }
    
    def clear_cache(self):
        """Clear embedding cache"""
        self.embedding_cache.clear()
        print("Embedding cache cleared")
    
    async def reindex_documents(self):
        """Rebuild vector store index"""
        print("Reindexing vector store...")
        
        if not self.document_chunks:
            print("No documents to reindex")
            return
        
        # Recreate vector store
        self._create_new_vector_store()
        
        # Re-add all chunks
        all_embeddings = []
        for chunk in self.document_chunks.values():
            if chunk.embedding:
                all_embeddings.append(chunk.embedding)
            else:
                # Generate embedding if missing
                embedding = self._get_embeddings([chunk.content])[0]
                chunk.embedding = embedding.tolist()
                all_embeddings.append(embedding)
        
        if all_embeddings:
            embeddings_array = np.array(all_embeddings).astype('float32')
            self.vector_store.add(embeddings_array)
        
        self._save_vector_store()
        print("Reindexing completed")


# Global RAG service instance
rag_service = OptimizedRAGService()
