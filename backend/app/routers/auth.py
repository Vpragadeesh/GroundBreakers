from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/register")
async def register(payload: dict):
    # stub: real implementation should validate and store user
    if not payload.get("email"):
        raise HTTPException(status_code=400, detail="email required")
    return {"id": "stub-user-id", "email": payload.get("email")}


@router.post("/login")
async def login(payload: dict):
    # stub: validate credentials and return token
    if payload.get("email") == "test@example.com" and payload.get("password") == "TestPassword123!":
        return {"access_token": "stub-token", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="invalid credentials")
