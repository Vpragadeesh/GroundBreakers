from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .middleware.chatbot_middleware import ChatbotMiddleware

from .routers import health, auth, assessments, chatbot, rag

app = FastAPI(
    title="RWH Assessment API", 
    description="API for Rainwater Harvesting Assessment with AI Chatbot",
    version="1.0.0"
)

# Add chatbot middleware for rate limiting and request tracking
app.add_middleware(ChatbotMiddleware, max_requests_per_minute=60)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def hello():
    return {"message": "Hello world"}

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/auth")
app.include_router(assessments.router, prefix="/api/assessments")
app.include_router(chatbot.router, prefix="/api/chatbot")
app.include_router(rag.router, prefix="/api/rag")
