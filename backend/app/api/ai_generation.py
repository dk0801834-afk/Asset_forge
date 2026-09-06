from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.ai_generation import AIGenerationRequest
from ..schemas.ai_generation import (
    AIGenerationRequestCreate, AIGenerationRequestResponse
)
from ..services.ai_service import ai_service

router = APIRouter()


@router.post("/generate", response_model=AIGenerationRequestResponse)
async def generate_assets(
    gen_data: AIGenerationRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit an AI image generation request. Auth required."""
    result = await ai_service.generate_images(db, current_user, gen_data.model_dump())
    if result.status.value == "failed":
        raise HTTPException(status_code=500, detail=result.error_message or "Generation failed")
    return AIGenerationRequestResponse.model_validate(result)


@router.get("/requests", response_model=List[AIGenerationRequestResponse])
def list_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 50,
):
    """List current user's AI generation requests."""
    requests = (
        db.query(AIGenerationRequest)
        .filter(AIGenerationRequest.user_id == current_user.id)
        .order_by(AIGenerationRequest.created_at.desc())
        .limit(limit)
        .all()
    )
    return [AIGenerationRequestResponse.model_validate(r) for r in requests]


@router.get("/requests/{request_id}", response_model=AIGenerationRequestResponse)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = db.query(AIGenerationRequest).filter(AIGenerationRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return AIGenerationRequestResponse.model_validate(req)
