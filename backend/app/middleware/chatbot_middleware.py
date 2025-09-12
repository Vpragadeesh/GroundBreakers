import time
import uuid
from typing import Dict, Any
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class ChatbotMiddleware(BaseHTTPMiddleware):
    """
    Middleware for chatbot-specific functionality like request tracking,
    rate limiting, and logging.
    """
    
    def __init__(self, app, max_requests_per_minute: int = 60):
        super().__init__(app)
        self.max_requests_per_minute = max_requests_per_minute
        self.request_counts: Dict[str, list] = {}
    
    async def dispatch(self, request: Request, call_next):
        # Generate request ID for tracking
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Track request timing
        start_time = time.time()
        
        # Simple rate limiting for chatbot endpoints
        if request.url.path.startswith("/api/chatbot"):
            client_ip = request.client.host if request.client else "unknown"
            
            # Clean old requests (older than 1 minute)
            current_time = time.time()
            if client_ip in self.request_counts:
                self.request_counts[client_ip] = [
                    req_time for req_time in self.request_counts[client_ip]
                    if current_time - req_time < 60
                ]
            else:
                self.request_counts[client_ip] = []
            
            # Check rate limit
            if len(self.request_counts[client_ip]) >= self.max_requests_per_minute:
                return Response(
                    content='{"detail": "Rate limit exceeded. Please try again later."}',
                    status_code=429,
                    media_type="application/json"
                )
            
            # Add current request
            self.request_counts[client_ip].append(current_time)
        
        # Process request
        response = await call_next(request)
        
        # Add timing information to response headers
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = request_id
        
        return response
