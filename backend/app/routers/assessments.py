from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter()

_DB = {}


@router.post("/")
async def create_assessment(payload: dict):
    aid = f"a_{len(_DB)+1}"
    _DB[aid] = payload
    return {"id": aid, **payload}


@router.get("/")
async def list_assessments():
    return [{"id": k, **v} for k, v in _DB.items()]


@router.get("/{assessment_id}")
async def get_assessment(assessment_id: str):
    if assessment_id not in _DB:
        raise HTTPException(status_code=404)
    return {"id": assessment_id, **_DB[assessment_id]}
