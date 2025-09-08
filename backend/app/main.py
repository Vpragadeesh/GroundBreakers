from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health, auth, assessments

app = FastAPI(title="RWH Assessment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def hello():
    return {"message": "Hello world"}

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/v1/auth")
app.include_router(assessments.router, prefix="/api/v1/assessments")
